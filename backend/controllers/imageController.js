import supabase from "../config/supabaseClient.js";
// import { deletePhoto, uploadPhoto } from "../utils/helpers.js";

// GET all photos
// /
export const getImages = async (req, res, next) => {
  try {
    const { data, error } = await supabase.storage.from("images").list();
    if (error) throw error;

    return res.json({ data });
  } catch (err) {
    next(err);
  }
};

// GET the row from image_data of the image id
// /imageData/:id
export const getImageData = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase.from("image_data").select("*").eq("id", id);

    if (error) console.log(error);
    if (data) res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

// GET all photos from an album
// /:album
export const getImagesFromAlbum = async (req, res, next) => {
  try {
    const { album } = req.params;

    const { data: files, error: imageError } = await supabase.storage.from("images").list(album);

    if (imageError) {
      console.error("Error listing files:", imageError.message);
      return res.status(500).json({ error: imageError.message });
    }

    if (!files || files.length === 0) {
      return res.json({ files: [] });
    }

    return res.json({ files });
  } catch (err) {
    next(err);
  }
};

// GET all photos from an album
// /data/:album
export const getImageDataForAlbum = async (req, res, next) => {
  try {
    const { album } = req.params;

    const { data: imageData, error: imageDataError } = await supabase
      .from("image_data")
      .select("image_path,display_order")
      .like("image_path", `${album}/%`)
      .order("display_order", { ascending: true });
    if (imageDataError) {
      console.error("Error listing files data:", imageDataError.message);
      return res.status(500).json({ error: imageDataError.message });
    }

    if (!imageData || imageData.length === 0) {
      return res.json({ images: [] });
    }

    return res.json(imageData);
  } catch (err) {
    next(err);
  }
};

// GET ordered images
// /data/:album
export const getOrderedImages = async (req, res, next) => {
  try {
    const { album } = req.params;

    const [images, imageData] = await Promise.all([
      fetchFilesFromAlbum(album),
      fetchImageDataForAlbum(album),
    ]);

    // Create a map to link metadata to files
    const imageMeta = Object.fromEntries(
      imageData.map(({ image_path, id, display_order }) => [image_path, { id, display_order }])
    );
    const combinedData = images
      .map((file) => {
        const meta = imageMeta[`${album}/${file.name}`] ?? {};
        return {
          database_id: meta.id,
          ...file,
          display_order: meta.display_order ?? null,
        };
      })
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

    return res.json({ combinedData });
  } catch (err) {
    next(err);
  }
};

const fetchFilesFromAlbum = async (album) => {
  const { data: files, error } = await supabase.storage.from("images").list(album);
  if (error) throw new Error(error.message);
  return files || [];
};

const fetchImageDataForAlbum = async (album) => {
  const { data: imageData, error } = await supabase
    .from("image_data")
    .select("id, image_path, display_order, is_display")
    .like("image_path", `${album}/%`)
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return imageData || [];
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

    return res.json(largestOrder);
  } catch (err) {
    next(err);
  }
};

// GET album display image
// display/:album
export const getDisplayImage = async (req, res, next) => {
  try {
    const { album } = req.params;

    const { data: imageData, error: fetchError } = await supabase
      .from("image_data")
      .select("*")
      .eq("is_display", true)
      .like("image_path", `%${album}%`)
      .single();

    // If the image doesn't exist then just return a placeholder
    if (fetchError) {
      return res.json({
        image_path: `https://placehold.co/600x600?text=${
          album.charAt(0).toUpperCase() + album.slice(1)
        } placeholder`,
      });
    }

    const image = {
      ...imageData,
      image_path: `${process.env.IMGIX}/${imageData.image_path}?w=600&h=600&fit=crop&auto=format`,
    };

    return res.json(image);
  } catch (err) {
    next(err);
  }
};

// GET album display image
// Gets both interior and exterior
export const getDisplayImages = async (req, res, next) => {
  try {
    const { data: imagesData, error: fetchError } = await supabase
      .from("image_data")
      .select("*")
      .eq("is_display", true)
      .limit(2);

    if (fetchError) throw fetchError;

    return res.json(imagesData);
  } catch (err) {
    next(err);
  }
};

// DELETE a image based on path.
// /:id
export const deleteImageById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get the image that will be removed
    const { data: image, error: fetchError } = await supabase
      .from("image_data")
      .select("id, image_path")
      .eq("id", id)
      .single();

    if (fetchError || !image) {
      console.error("Error fetching image:", fetchError?.message);
      return res.status(404).json({ error: "Image not found" });
    }

    // Remove the image
    const { error: imageFileError } = await supabase.storage
      .from("images")
      .remove(image.image_path);

    if (imageFileError) {
      console.error("Error removing image from storage:", imageFileError.message);
    }

    // Remove image data
    const { error: imageDataError } = await supabase.from("image_data").delete().eq("id", id);

    if (imageDataError) {
      console.error("Error deleting image record:", imageDataError.message);
      return res.status(500).json({ error: "Failed to delete image record" });
    }

    return res.status(200).json({
      message: "Image deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

// PUT /images/reorder
// Body: { photos: [{ id: "...", display_order: 1 }, ...] }
export const reorderImages = async (req, res, next) => {
  try {
    const { photos } = req.body;

    if (!photos || !Array.isArray(photos)) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const updates = photos.map((photo) =>
      supabase.from("image_data").update({ display_order: photo.display_order }).eq("id", photo.id)
    );

    const results = await Promise.all(updates);

    // Check if any updates failed
    const errors = results.filter((r) => r.error);
    if (errors.length > 0) {
      console.error("Reorder errors:", errors);
      return res.status(500).json({ error: "Some updates failed" });
    }

    return res.status(200).json({ message: "Reorder successful" });
  } catch (err) {
    next(err);
  }
};

// Update the meta data for an image
// PUT /imageData/:id
export const updateImageData = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, alt } = req.body;

    const { data, error } = await supabase
      .from("image_data")
      .update({ title, alt })
      .eq("id", id)
      .select("*");

    if (error) throw error;

    res.status(200).json({ success: true, data: data[0] });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// update album display image
// PUT /display/:album/:id
export const updateDisplayImage = async (req, res, next) => {
  try {
    const { album, id } = req.params;

    // Get the current display image
    const { data: image, error: fetchError } = await supabase
      .from("image_data")
      .select("*")
      .eq("is_display", true)
      .like("image_path", `%${album}%`)
      .single();
    if (fetchError) console.warn("Was unable to find a display photo.");

    // Set it to false
    if (image) {
      const { error: oldToggleError } = await supabase
        .from("image_data")
        .update({ is_display: false })
        .eq("id", image.id);
      if (oldToggleError) throw oldToggleError;
    }

    // Set the new image to be the display image.
    const { error: newToggleError } = await supabase
      .from("image_data")
      .update({ is_display: true })
      .eq("id", id);
    if (newToggleError) throw newToggleError;

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error updating display image:", err);
    next(err);
  }
};

// POST delete all given id.
// /
// Body: { ids: [ "uuid1", "uuid2", ... ] }
export const deleteImagesByIds = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
      return res.status(400).json({ error: "No ids provided" });
    }

    // 1. Fetch all image paths for given ids
    const { data: images, error: fetchError } = await supabase
      .from("image_data")
      .select("id, image_path")
      .in("id", ids);

    if (fetchError) {
      console.error("Error fetching images:", fetchError.message);
      return res.status(500).json({ error: fetchError.message });
    }

    if (!images || images.length === 0) {
      return res.status(404).json({ error: "No matching images found" });
    }

    // 2. Remove from storage
    const paths = images.map((img) => img.image_path);
    const { error: storageError } = await supabase.storage.from("images").remove(paths);

    if (storageError) {
      console.error("Error removing from storage:", storageError.message);
      return res.status(500).json({ error: storageError.message });
    }

    // 3. Remove from DB
    const { error: dbError } = await supabase.from("image_data").delete().in("id", ids);

    if (dbError) {
      console.error("Error deleting DB records:", dbError.message);
      return res.status(500).json({ error: dbError.message });
    }

    return res.json({ success: true, deleted: ids.length });
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

    return res.status(201).json({
      message: "Image uploaded successfully",
      path: publicUrlData.path,
      url: publicUrlData.publicUrl,
    });
  } catch (err) {
    next(err);
  }
};
