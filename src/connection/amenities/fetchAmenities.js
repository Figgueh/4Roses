import supabase from "connection/client";

export const fetchAmenities = async () => {
  const { data, error } = await supabase.from("amenities").select("*").eq("small", false);
  if (error) console.error("Error fetching data:", error);
  else
    return data.map((item) => ({
      name: item.title,
      description: item.description,
      image: process.env.REACT_APP_SUPABASE_IMAGE + item.image,
    }));
};
