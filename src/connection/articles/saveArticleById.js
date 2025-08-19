import supabase from "connection/client";
import { addNewArticle } from "./addNewArticle";

export const saveArticleById = async (
  articleId,
  newTitle,
  newContent,
  urls, //Optional
  image, //Optional
  description //Optional
) => {
  const { data, error } = await supabase
    .from("articles")
    .update({ title: newTitle, content: newContent })
    .eq("id", articleId)
    .select();
  if (error) console.error("Error updating data:", error);
  else {
    if (data.length == 0) {
      console.log("ADDED: ", urls, image, description);
      addNewArticle(articleId, urls, newTitle, newContent, image, description);
    } else return data;
  }
};
