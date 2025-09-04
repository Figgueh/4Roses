/* eslint-disable no-unused-vars */
/* eslint-disable no-constant-condition */
import supabase from "../config/supabaseClient.js";
import { deletePhoto, uploadPhoto } from "../utils/helpers.js";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import puppeteer from "puppeteer";

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
    // Update the title and content
    const { data, error } = await supabase
      .from("articles")
      .upsert({ id, title, content, image }, { onConflict: "id" });
    // const { data, error } = await supabase
    //   .from("articles")
    //   .update({ title, content, image })
    //   .eq("id", id);

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

// POST /generateArticleFromUrls
//
// Body: {urls}
export const generateArticleFromUrls = async (req, res, next) => {
  try {
    const apiKey = process.env.OPENROUTER_KEY;
    const { urls } = req.body;

    console.log("RECEIVED: ", urls);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const scrapePage = async (url) => {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"
      );
      await page.setRequestInterception(true);

      page.on("request", (req) => {
        const resourceType = req.resourceType();
        if (["stylesheet", "font", "media"].includes(resourceType)) {
          req.abort(); // skip loading
        } else {
          req.continue();
        }
      });

      await page.goto(url, { waitUntil: "domcontentloaded" });

      const pageData = await page.evaluate(() => {
        const text = document.body.innerText;

        const images = Array.from(document.body.querySelectorAll("img"))
          .map((img) => img.src)
          .filter((src) => src && src.startsWith("http"));

        return { text, images };
      });

      await browser.close();

      return pageData;
    };

    const scrapeMultiple = async (urls) => {
      const results = [];
      for (const url of urls) {
        try {
          const { text, images } = await scrapePage(url);
          console.log(url, "Has been downloaded successfully.");
          res.write(`event: preProcessing\ndata: ${url} was downloaded successfully\n`);
          results.push({ page: url, text, images });
        } catch (err) {
          console.error(`Failed to scrape ${url}:`, err);
        }
      }
      return results;
    };

    const allHtmlContent = await scrapeMultiple(urls);

    const prompt = `Here are parts of a webpage: \n
          ${allHtmlContent
            .map(
              (value, index) => `Page ${index + 1} content:
  -------------------
  ${Object.entries(value).map(([key, value]) => {
    return key + ": " + value + "\n";
  })}
  -------------------`
            )
            .join("\n\n")}
Generate me an article that includes things like the price, location, services offered, values and give a good reason why it would be a good place to visit without sounding generic.
If the web pages don't include any information on the previously mentioned items, then don't include them and find something else that would be good to know.
The article should follow this schema:
{
  "title": "Main title",
  "image": "Leave blank or provide a working link",
  "description": "a short description summarizing the article",
  "article": [{
  "title": "Section 1",
  "content": "Text...",
  "detail": ["Item 1", "Item 2"]
  }]
}

if they have services available, then list them in detail
Don't feel obligated to add details in the article section.
Only add the details section if necessary.
Respond with valid JSON only.`;

    res.write(`event: preProcessing\ndata: prompt was successfully assembled.\n`);
    let response;
    try {
      response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat-v3.1:free",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant who generates structured articles based on web content.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status == 429)
          throw new Error(`OpenRouter rate limit reached. Try again tomorrow`);
        throw new Error(`OpenRouter request failed (${response.status}): ${errorText}`);
      }
    } catch (err) {
      res.write(
        `event: error\ndata: ${JSON.stringify({
          message: "Failed to generate article",
          error: err.message,
        })}\n\n`
      );
      return res.end();
    }
    res.write(`event: preProcessing\ndata: request was sent successfully.\n\n`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let sentMeta = false;
    let total = "";
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      chunk.split("\n").forEach((line) => {
        if (line.startsWith("data:")) {
          const json = line.slice(5).trim();
          if (json === "[DONE]") {
            res.write("event: done\ndata: [DONE]\n\n");
            res.end();
            return;
          }

          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              buffer += delta;
              total += delta;

              console.log(delta);
              // Look for metadata if not sent yet
              if (!sentMeta && delta.trim().includes("article")) {
                if (!buffer.trimStart().startsWith("```json")) {
                  throw new Error("Response from OpenRouter wasn't sent in a proper format");
                }

                var lines = buffer.split("\n");
                lines.pop(); // removes "```json"
                lines.shift(); // removes "article:"
                lines.push("}"); // adds closing json tag
                var metaStr = lines.join("\n");
                metaStr = metaStr.replace(/,\s*}$/, "}"); // removes comma before the closing brace

                try {
                  const parsedMeta = JSON.parse(metaStr);
                  console.log(parsedMeta);
                  res.write(`event: metadata\ndata: ${JSON.stringify(parsedMeta)}\n\n`);
                  sentMeta = true;
                } catch (err) {
                  // still incomplete JSON, wait for more chunks
                }
              }

              // }
              // --- 2. Send article sections individually ---
              if (sentMeta) {
                // look for complete section objects
                const sectionRegex = /{[\s\S]*?}(?=|])/g;
                let match;
                while ((match = sectionRegex.exec(buffer)) !== null) {
                  try {
                    const sectionObj = JSON.parse(match[0]);
                    res.write(`event: section\ndata: ${JSON.stringify(sectionObj)}\n\n`);
                  } catch (err) {
                    console.error("Failed to parse section:", err);
                  }
                }

                // keep only trailing incomplete part in buffer
                const lastBracket = buffer.lastIndexOf("}");
                if (lastBracket !== -1) {
                  buffer = buffer.slice(lastBracket + 1);
                }
              }
            }
          } catch (err) {
            console.error("Parse error", err);
          }
        }
      });
    }
  } catch (err) {
    next(err);
  }
};
