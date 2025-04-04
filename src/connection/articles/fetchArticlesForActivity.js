import supabase from "connection/client";

export const fetchArticlesForActivity = async (activityId) => {
  const { data, error } = await supabase
    .from("articles")
    .select("*, activities(image)")
    .eq("activity_id", activityId);
  if (error) console.error("Error fetching data:", error);
  else
    return data.map((item) => ({
      name: item.name,
      url: item.url,
      photo: process.env.REACT_APP_SUPABASE_IMAGE + item.activities.image,
      article: item.article,
    }));
};
