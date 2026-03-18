import supabase from "connection/client";

export const updateAccount = async (id, fullName, avatarUrl, preferredLanguage) => {
  if (!id) {
    console.error("Id can't be null or empty");
    return false;
  }

  // Build update object dynamically
  const updateData = {};

  if (fullName) updateData.full_name = fullName;
  if (avatarUrl) updateData.avatar_url = avatarUrl;
  if (preferredLanguage) updateData.preferred_language = preferredLanguage;

  // Nothing to update
  if (Object.keys(updateData).length === 0) {
    console.warn("No fields provided to update");
    return false;
  }

  const { error } = await supabase.from("users").update(updateData).eq("id", id);

  if (error) {
    console.error("Error updating account:", error);
    return false;
  }

  return true;
};
