import supabase from "connection/client";

export const getProfilePicture = async (id) => {
  const { data, error } = await supabase.from("users").select("avatar_url").eq("id", id).single();
  if (error) {
    console.error("Error fetching data:", error);
    return false;
  }
  return data?.avatar_url;
};
