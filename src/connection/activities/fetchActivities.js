import supabase from "connection/client";

export const fetchActivities = async () => {
  const { data, error } = await supabase.from("activities").select("*");
  if (error) console.error("Error fetching data:", error);
  else
    return data.map((item) => ({
      image: item.image,
      name: item.name,
      route: item.route,
    }));
};
