import supabase from "connection/client";

export const updateAccount = async (id, fullName, avatarUrl) => {
  const { error } = await supabase
    .from("users")
    .update({ full_name: fullName, avatar_url: avatarUrl })
    .eq("id", id);

  if (error) console.error("Error inserting data:", error);
};
