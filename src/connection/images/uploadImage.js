import supabase from "connection/client";

export const uploadImage = async (filePath, file) => {
  let { error: uploadError } = await supabase.storage.from("images").upload(filePath, file);

  if (uploadError) console.error(uploadError.message);
};
