// Added to backend
import supabase from "connection/client";

export const fetchArticleByTitle = async (articleTitle) => {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("title", articleTitle)
    .single();
  if (error) console.error("Error fetching data:", error);
  else
    return {
      id: data.id,
      title: data.title,
      url: data.url,
      photo: process.env.REACT_APP_SUPABASE_IMAGE + data.image,
      article: data.content,
    };
};
