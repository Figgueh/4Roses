import supabase from "connection/client";
import { slugify } from "../../utils.js";

export const fetchActivities = async () => {
  const { data, error } = await supabase.from("activities").select("*");
  if (error) console.error("Error fetching data:", error);
  else
    return data.map((item) => ({
      name: item.title,
      slug: "activities/" + slugify(item.title),
      image: process.env.REACT_APP_SUPABASE_IMAGE + item.image,
    }));
};
