import supabase from "connection/client";

export const checkAdmin = async (id) => {
  const { data, error } = await supabase.from("users").select("*").eq("id", id).single();
  if (error) {
    console.error("Error fetching data:", error);
    return false;
  }
  return data?.is_admin;
};
