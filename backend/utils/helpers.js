import supabase from "../config/supabaseClient.js";

export const deletePhoto = async (path) => {
  if (!path) return;
  const { deletePhotoError } = await supabase.storage.from("images").remove([path]);
  if (deletePhotoError) throw deletePhotoError;
};

export const uploadPhoto = async (imageUrl, file) => {
  if (!file) return;
  const { photoUploadError } = await supabase.storage
    .from("images")
    .upload(imageUrl, file.buffer, { contentType: file.mimetype });
  if (photoUploadError) throw photoUploadError;
};
