import supabase from "../config/supabaseClient.js";
import { deletePhoto, uploadPhoto } from "../utils/helpers.js";

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
    const { title } = req.params;
    const { data, error } = await supabase.from("articles").select("*").eq("title", title).single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// GET the articles for that activity
// /activity/:activityId
export const getArticlesForActivity = async (req, res, next) => {
  try {
    const { activityId } = req.params;

    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("activity_id", activityId);

    if (error) throw error;

    // Add the supabase image url.
    const articles = data.map((article) => ({
      ...article,
      image: process.env.SUPABASE_IMAGE + article.image,
    }));

    res.json(articles);
  } catch (err) {
    next(err);
  }
};

// POST a new article
export const createArticle = async (req, res, next) => {
  try {
    const { activityId, url, title, content, image, description } = req.body;
    console.log(req.body);
    const { data, error } = await supabase.from("articles").insert({
      activity_id: activityId,
      url: url,
      title: title,
      content: [content],
      image: image,
      description: description,
    });
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

// PUT update article
export const updateArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, rawContent, image } = req.body;
    const file = req.file;

    // Rebuild the article
    let content;
    try {
      content = JSON.parse(rawContent);
    } catch (e) {
      content = rawContent;
    }

    // If there is an image, update it
    if (file) {
      // Get the old image path
      const { data: articleData } = await supabase
        .from("articles")
        .select("image")
        .eq("id", id)
        .single();

      // Switch the photos
      await deletePhoto(articleData.image);
      await uploadPhoto("/articles/" + file.originalname, file);
    }

    // Update the title and content
    const { data, error } = await supabase
      .from("articles")
      .update({ title, content, image })
      .eq("id", id);

    if (error) throw error;
    res.status(200).json({ message: "Article updated successfully", article: data });
  } catch (err) {
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
