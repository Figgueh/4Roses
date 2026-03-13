import supabase from "../config/supabaseClient.js";

export const deletePhoto = async (path) => {
  if (!path) return;
  const { error: deletePhotoError } = await supabase.storage.from("images").remove([path]);
  if (deletePhotoError) throw deletePhotoError;
};

export const uploadPhoto = async (imageUrl, file) => {
  if (!file) return;
  const { error: photoUploadError } = await supabase.storage
    .from("images")
    .upload(imageUrl, file.buffer, { contentType: file.mimetype, upsert: true });
  if (photoUploadError) throw photoUploadError;
};
