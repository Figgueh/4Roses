import supabase from "connection/client";

export const getAllUserInfo = async (id) => {
  if (!id) {
    console.error("No user ID provided to getAllUserInfo");
    return null;
  }

  const { data, error } = await supabase.from("users").select("*").eq("id", id).single();
  if (error) {
    console.error("Error fetching data:", error);
    return false;
  }
  return data;
};
