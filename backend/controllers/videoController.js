import supabase from "../config/supabaseClient.js";

const extractVideoId = (url) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]+)/);
  return match ? match[1] : null;
};

function getYouTubeThumbnail(url, quality = "hqdefault") {
  const id = extractVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/${quality}.jpg` : null;
}

export const getVideos = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("videos").select("*");
    if (error) throw error;

    // Attach thumbnails to each video
    const videos = data.map((video) => ({
      ...video,
      thumbnail: getYouTubeThumbnail(video.url),
      selected: false,
    }));

    res.json(videos);
  } catch (err) {
    next(err);
  }
};

export const addVideo = async (req, res, next) => {
  try {
    const { url } = req.body;

    // Get the largest display order
    const { data: latest } = await supabase
      .from("videos")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1);

    const order = latest?.[0]?.display_order + 1 ?? 0;

    const { data, error: insertError } = await supabase
      .from("videos")
      .insert({ url, display_order: order, is_display: false });

    if (insertError) throw insertError;

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

export const getDisplay = async (req, res, next) => {
  try {
    const { data, error: fetchError } = await supabase
      .from("videos")
      .select("*")
      .eq("is_display", true)
      .single();

    // If the image doesn't exist then just return a placeholder
    if (fetchError) {
      return res.json({
        thumbnail: `https://placehold.co/600x600?text=Video%20thumbnail%20placeholder`,
      });
    }

    // Attach thumbnail
    const video = {
      ...data,
      thumbnail: getYouTubeThumbnail(data.url),
    };

    res.json(video);
  } catch (err) {
    next(err);
  }
};

export const updateDisplayVideo = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get the current display image
    const { data: video, error: fetchError } = await supabase
      .from("videos")
      .select("*")
      .eq("is_display", true)
      .single();
    if (fetchError) console.warn("Was unable to find a display video.");

    // Set it to false
    if (video) {
      const { error: oldToggleError } = await supabase
        .from("videos")
        .update({ is_display: false })
        .eq("id", video.id);
      if (oldToggleError) throw oldToggleError;
    }

    // Set the new image to be the display image.
    const { error: newToggleError } = await supabase
      .from("videos")
      .update({ is_display: true })
      .eq("id", id);
    if (newToggleError) throw newToggleError;

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error updating display image:", err);
    next(err);
  }
};

// PUT /videos/reorder
// Body: { photos: [{ id: "...", display_order: 1 }, ...] }
export const reorderVideos = async (req, res, next) => {
  try {
    const { videos } = req.body;

    console.log(videos);

    if (!videos || !Array.isArray(videos)) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const updates = videos.map((video) =>
      supabase.from("videos").update({ display_order: video.display_order }).eq("id", video.id)
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

// POST delete all given id.
// /
// Body: { ids: [ "uuid1", "uuid2", ... ] }
export const deleteVideosByIds = async (req, res, next) => {
  try {
    const { ids } = req.body;

    console.log(ids);

    if (!ids || ids.length === 0) {
      return res.status(400).json({ error: "No ids provided" });
    }

    const { error: dbError } = await supabase.from("videos").delete().in("id", ids);

    if (dbError) {
      console.error("Error deleting DB records:", dbError.message);
      return res.status(500).json({ error: dbError.message });
    }

    return res.json({ success: true, deleted: ids.length });
  } catch (err) {
    next(err);
  }
};
