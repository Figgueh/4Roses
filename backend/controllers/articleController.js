import supabase from "../config/supabaseClient.js";

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
    const { title, content } = req.body;
    const { data, error } = await supabase.from("articles").update({ title, content }).eq("id", id);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// DELETE article
export const deleteArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from("articles").delete().eq("id", id);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};
