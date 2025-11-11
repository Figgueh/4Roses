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
    }));

    res.json(videos);
  } catch (err) {
    next(err);
  }
};
