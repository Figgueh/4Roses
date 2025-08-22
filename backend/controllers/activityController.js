import supabase from "../config/supabaseClient.js";
import { slugify } from "../utils.js";

// GET all activities
// /
export const getActivities = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("activities").select("*");
    if (error) throw error;

    const activities = data.map((activity) => ({
      ...activity,
      image: `${process.env.SUPABASE_IMAGE}${activity.image}`,
      slug: "activities/" + slugify(activity.title),
    }));

    res.json(activities);
  } catch (err) {
    next(err);
  }
};

// GET the activity id of a named activity
// /:activityName
export const getActivityIdByName = async (req, res, next) => {
  try {
    const { activityName } = req.params;
    const { data, error } = await supabase
      .from("activities")
      .select("id")
      .eq("title", activityName)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// POST a new activity
// /
// Body: title, image
export const addActivity = async (req, res, next) => {
  try {
    const { title, imageUrl } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: "No image uploaded" });

    // Upload photo
    await uploadPhoto(imageUrl, file);

    // Create the table
    const { data, error } = await supabase
      .from("activities")
      .insert({ title: title, image: imageUrl })
      .select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    next(err);
  }
};

// PUT an activity
// /:id
// Body: title, imageUrl
export const updateActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, imageUrl } = req.body;
    const image = req.file;

    if (image && imageUrl) {
      const { data: existingPhoto } = await supabase
        .from("activities")
        .select("image")
        .eq("id", id)
        .single();

      if (existingPhoto.image) await deletePhoto(existingPhoto.image);
      await uploadPhoto(imageUrl, image);

      const { error } = await supabase
        .from("activities")
        .update({ title, image: imageUrl })
        .eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("activities").update({ title }).eq("id", id);
      if (error) throw error;
    }
    res.status(200).send();
  } catch (err) {
    next(err);
  }
};

// DELETE an activity
// /:id
export const deleteActivity = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get the file path of the image
    const { data: filePathRequest } = await supabase
      .from("activities")
      .select("image")
      .eq("id", id)
      .single();

    // Delete the row in the table
    const { count, deleteRowError } = await supabase
      .from("activities")
      .delete({ count: "exact" })
      .eq("id", id);
    if (deleteRowError) throw deleteRowError;

    // Check for FK constraints
    if (count == null) {
      return res.status(409).json({
        message: "Activity could not be deleted. It may be referenced by other records.",
      });
    }

    // Delete the photo
    await deletePhoto(filePathRequest.image);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const deletePhoto = async (path) => {
  if (!path) return;
  const { deletePhotoError } = await supabase.storage.from("images").remove([path]);
  if (deletePhotoError) throw deletePhotoError;
};

const uploadPhoto = async (imageUrl, file) => {
  if (!file) return;
  const { photoUploadError } = await supabase.storage
    .from("images")
    .upload(imageUrl, file.buffer, { contentType: file.mimetype });
  if (photoUploadError) throw photoUploadError;
};
