import supabase from "../config/supabaseClient.js";
// import { deletePhoto, uploadPhoto } from "../utils/helpers.js";

// GET all photos
// /
export const getImages = async (req, res, next) => {
  try {
    const { data, error } = await supabase.storage.from("images").list();
    if (error) throw error;

    res.json(data);
  } catch (err) {
    next(err);
  }
};

// GET largest display order
// /:album
//
export const getLargestDisplayOrder = async (req, res, next) => {
  try {
    const { album } = req.params;

    const { data: latest } = await supabase
      .from("image_data")
      .select("display_order")
      .like("image_path", `%${album}%`)
      .order("display_order", { ascending: false })
      .limit(1);

    const largestOrder = latest?.[0]?.display_order ?? 0;

    res.json(largestOrder);
  } catch (err) {
    next(err);
  }
};

// POST upload a photo
// /
// Body: filepath, image file
export const uploadImage = async (req, res, next) => {
  try {
    const { filePath, title, alt, displayOrder } = req.body;
    const image = req.file;

    const { data: publicUrlData, error: imageDataError } = await supabase.storage
      .from("images")
      .upload(filePath, image.buffer, { contentType: image.mimetype });
    if (imageDataError) throw imageDataError;

    // Insert metadata
    const { error: metaError } = await supabase.from("image_data").insert({
      image_path: filePath,
      title: title,
      alt: alt,
      display_order: displayOrder,
    });

    if (metaError) {
      console.error("Metadata insert error:", metaError);
    }

    res.status(201).json({
      message: "Image uploaded successfully",
      path: publicUrlData.path,
      url: publicUrlData.publicUrl,
    });
  } catch (err) {
    next(err);
  }
};
