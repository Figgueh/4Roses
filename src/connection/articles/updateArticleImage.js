import supabase from "connection/client";

export const updateArticleImage = async (id, filePath) => {
  const { data: imageResult, error: articleError } = await supabase
    .from("articles")
    .update({ image: filePath })
    .eq("id", id);

  if (articleError) console.log(articleError);
  return imageResult;
};
