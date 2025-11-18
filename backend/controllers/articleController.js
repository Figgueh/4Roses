/* eslint-disable no-unused-vars */
/* eslint-disable no-constant-condition */
import supabase from "../config/supabaseClient.js";
import { deletePhoto, uploadPhoto } from "../utils/helpers.js";
import { supportedLanguages, translateArticle, translateText } from "../middlewares/translate.js";
import { buildPrompt } from "../middlewares/promptBuilder.js";
import { generateArticle } from "../middlewares/articleGenerator.js";
import { scrapeMultiple } from "../middlewares/scraper.js";

import { SSEConnection } from "../utils/sse.js";

const activeConnections = new Map();
export const connectSSE = (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).send("Missing id");

  const sse = new SSEConnection(res);
  activeConnections.set(id, sse);

  req.on("close", () => {
    activeConnections.delete(id);
  });
};

// GET all articles
// /
export const getArticles = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("articles").select("*");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// GET the article with the specified title
// /:title
export const getArticleByTitle = async (req, res, next) => {
  try {
    const { lang = "en" } = req.query;
    const { title } = req.params;
    const { data: articleRequest, error } = await supabase
      .from("articles")
      .select("*")
      .eq("title", title)
      .single();
    if (error) throw error;

    // Add the supabase image url if its in our database
    var article = {
      ...articleRequest,
      image: articleRequest.image
        ? articleRequest.image.startsWith("http")
          ? articleRequest.image
          : `${process.env.IMGIX}/${articleRequest.image}`
        : "/images/placeholder.png",
    };

    if (lang !== "en") {
      const { data: transRequest, error: transError } = await supabase
        .from("articles_translation")
        .select("title, description, content")
        .eq("language", lang)
        .eq("articles_id", article.id)
        .single();

      console.log(transRequest);

      if (transError) {
        console.log("unable to find article translation in " + lang + " for " + article.title);
        return article; // fallback to original
      } else {
        article = {
          ...article,
          title: transRequest?.title || article.title,
          description: transRequest?.description || article.description,
          content: transRequest?.content || article.content,
        };
      }
    }

    res.json(article);
  } catch (err) {
    next(err);
  }
};

// GET the articles for that activity
// /activity/:activityId
export const getArticlesForActivity = async (req, res, next) => {
  try {
    const { lang = "en" } = req.query;
    const { activityId } = req.params;

    const { data: articlesReq, error } = await supabase
      .from("articles")
      .select("*")
      .eq("activity_id", activityId);

    if (error) throw error;

    // Add the supabase image url if its in our database
    var articles = articlesReq.map((article) => ({
      ...article,
      image: article.image
        ? article.image.startsWith("http")
          ? article.image
          : `${process.env.IMGIX}/${article.image}?w=200&h=200&fit=crop&auto=format`
        : "/images/placeholder.png",
    }));

    if (lang !== "en") {
      const translatedArticle = await Promise.all(
        articles.map(async (article) => {
          const { data: transRequest, error: transError } = await supabase
            .from("articles_translation")
            .select("title, description, content")
            .eq("language", lang)
            .eq("articles_id", article.id)
            .single(); // ensures one row

          if (transError) {
            console.log("unable to find article translation in " + lang + " for " + article.title);
            return article; // fallback to original
          }

          return {
            ...article,
            englishTitle: articlesReq.at(article).title,
            title: transRequest?.title || article.title,
            description: transRequest?.description || article.description,
            content: transRequest?.content || article.content,
          };
        })
      );
      articles = translatedArticle;
    }

    res.json(articles);
  } catch (err) {
    next(err);
  }
};

// POST a new article
export const createArticle = async (req, res, next) => {
  try {
    const { id, activityId, url, title, image, rawContent, description, address, clientId } =
      req.body;

    console.log(req.body);
    var jsonContent;
    try {
      jsonContent = JSON.parse(rawContent);
    } catch (err) {
      jsonContent = [];
    }

    const { data, error } = await supabase
      .from("articles")
      .insert({
        id: id,
        activity_id: activityId,
        url: url,
        title: title,
        content: jsonContent,
        image: image,
        description: description,
        address: address,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        // Unique violation (duplicate)
        return res.status(400).json({ error: "An article with this title already exists." });
      }
      return res.status(400).json({ error: error.message || "Database error" });
    }

    // Send progress via SSE
    const sse = activeConnections.get(clientId);
    if (sse) sse.send("status", { message: "Article saved. Starting translations..." });
    let completed = 0;

    // Translate and upload data to the database.
    for (const language of supportedLanguages) {
      const [transTitle, transDescription, transArticle] = await Promise.all([
        translateText(title, language),
        translateText(description, language),
        translateArticle(jsonContent, language),
      ]);

      const { data: transData, error: transError } = await supabase
        .from("articles_translation")
        .insert({
          articles_id: data.id,
          language: language,
          title: transTitle,
          description: transDescription,
          content: transArticle,
        })
        .select();
      if (transError) throw transError;

      completed++;
      const progress = Math.round((completed / supportedLanguages.length) * 100);
      if (sse)
        sse.send("progress", { language, message: `${language} translation completed`, progress });
    }

    if (sse) sse.send("done", { message: "All translations completed!" });
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

// PUT update article
export const updateArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lang = "en" } = req.query;
    const { title, rawContent, image, url, address } = req.body;
    const file = req.file;

    // Rebuild the article
    let content;
    try {
      content = JSON.parse(rawContent);
    } catch (e) {
      content = rawContent;
    }

    // Get the old image path and title
    const { data: articleData } = await supabase
      .from("articles")
      .select("image, title")
      .eq("id", id)
      .single();

    // If there is an image, update it
    if (file) {
      // Switch the photos
      await deletePhoto(articleData.image);
      await uploadPhoto("/articles/" + file.originalname, file);
    }

    if (lang == "en") {
      // Update the title and content
      const { data: result, error } = await supabase
        .from("articles")
        .update({ title, content, image, url, address })
        .eq("id", id);

      articleData.title = title;

      if (error) {
        if (error.code === "23505") {
          // Unique violation (duplicate)
          return res.status(400).json({ error: "An article with this title already exists." });
        }
        return res.status(400).json({ error: error.message || "Database error" });
      }
      // Translation fetch
    } else {
      const { data: result, error } = await supabase
        .from("articles_translation")
        .update({ title, content })
        .eq("language", lang)
        .eq("articles_id", id);
      if (error) {
        if (error.code === "23505") {
          // Unique violation (duplicate)
          return res.status(400).json({ error: "An article with this title already exists." });
        }
        return res.status(400).json({ error: error.message || "Database error" });
      }
    }

    res.status(200).json({ message: "Article updated successfully", title: articleData.title });
  } catch (err) {
    console.log(err);

    next(err);
  }
};

// DELETE article
// /:id
export const deleteArticle = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get the name of the image for the article
    const { data: articleData, error: articleError } = await supabase
      .from("articles")
      .select("image")
      .eq("id", id)
      .single();

    if (articleError) throw articleError;
    if (!articleData) return res.status(404).json({ message: "Article not found" });

    // Delete the image.
    if (articleData.image) {
      const { error: deletePhotoError } = await supabase.storage
        .from("images")
        .remove([articleData.image]);
      if (deletePhotoError) throw deletePhotoError;
    }

    // Delete the row
    const { error: deleteRowError } = await supabase.from("articles").delete().eq("id", id);
    if (deleteRowError) throw deleteRowError;

    res.status(200).json({ message: "Activity deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// POST /generateArticleFromUrls
//
// Body: {urls}
export const generateArticleFromUrls = async (req, res, next) => {
  try {
    const sse = new SSEConnection(res);
    const { urls } = req.query;
    const parsedUrls = JSON.parse(urls);

    console.log(parsedUrls);

    if (!Array.isArray(parsedUrls) || parsedUrls.length === 0) {
      sse.send("error", { message: "No URLs provided" });
      return sse.close();
    }

    const allHtmlContent = await scrapeMultiple(parsedUrls, sse, sse.signal);
    if (sse.signal.aborted) return;

    sse.send("preProcessing", "Scraping complete.");

    const prompt = buildPrompt(allHtmlContent);
    sse.send("preProcessing", "Prompt assembled.");

    console.log(prompt);

    const article = await generateArticle(prompt, sse);
    if (sse.signal.aborted) return;

    sse.send("done", article);
    sse.close();
  } catch (err) {
    next(err);
  }
};
