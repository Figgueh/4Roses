import supabase from "connection/client";

export const getImageData = async (path) => {
  const { data, error } = await supabase
    .from("image_data")
    .select("*")
    .eq("image_path", path)
    .single();
  if (error) {
    console.error("Error fetching data:", error);
    return false;
  }
  return data;
};
