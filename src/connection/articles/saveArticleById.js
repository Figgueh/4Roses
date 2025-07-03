import supabase from "connection/client";

export const saveArticleById = async (articleId, newTitle, newContent) => {
  const { data, error } = await supabase
    .from("articles")
    .update({ title: newTitle, content: newContent })
    .eq("id", articleId);
  if (error) console.error("Error updating data:", error);
  else return data;
};
