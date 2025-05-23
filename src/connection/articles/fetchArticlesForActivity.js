import supabase from "connection/client";

export const fetchArticlesForActivity = async (activityId) => {
  const { data, error } = await supabase.from("articles").select("*").eq("activity_id", activityId);
  if (error) console.error("Error fetching data:", error);
  else
    return data.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      url: item.url,
      photo: process.env.REACT_APP_SUPABASE_IMAGE + item.image,
      content: item.content,
    }));
};
