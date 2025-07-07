import supabase from "connection/client";
import { removeImage } from "connection/images/removeImage";
import { trimImagePathNoSize } from "utils";

export const deleteArticle = async (article) => {
  if (!article) return null;
  // Delete from Supabase table
  const { error } = await supabase.from("articles").delete().eq("id", article.id);

  if (error) {
    console.error("Error deleting article:", error.message);
  } else {
    // delete image
    if (article.photo) {
      const path = trimImagePathNoSize(article.photo);
      if (path) {
        return await removeImage(path);
      }
    }
  }
  return false;
};
