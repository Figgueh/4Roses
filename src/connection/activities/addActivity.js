import supabase from "connection/client";

export const addActivity = async (title, image) => {
  const { data, error } = await supabase.from("activities").insert({ title: title, image: image });
  if (error) console.error("Error adding new activity:", error);
  else return data;
};
