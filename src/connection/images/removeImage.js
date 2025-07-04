import supabase from "connection/client";

export const removeImage = async (toDeleteUrl) => {
  const { error: deleteError } = await supabase.storage.from("images").remove([toDeleteUrl]);

  if (deleteError) {
    console.error("Failed to delete image:", deleteError.message);
  } else {
    console.log("Successfully deleted:", toDeleteUrl);
  }
};
