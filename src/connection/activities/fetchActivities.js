import supabase from "connection/client";
import { slugify } from "../../utils.js";

export const fetchActivities = async () => {
  const { data, error } = await supabase.from("activities").select("*");
  if (error) console.error("Error fetching data:", error);
  else
    return data.map((item) => ({
      id: item.id,
      name: item.title,
      title: item.title,
      slug: "activities/" + slugify(item.title),
      image: item.image,
    }));
};
