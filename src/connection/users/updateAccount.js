import supabase from "connection/client";

export const updateAccount = async (id, fullName, avatarUrl) => {
  if (id == null || "") console.error("Id can't be null");

  // If all information is provided
  if (fullName != null || "") {
    if (avatarUrl != null || "") {
      const { error: fullError } = await supabase
        .from("users")
        .update({ full_name: fullName, avatar_url: avatarUrl })
        .eq("id", id);

      if (fullError) {
        console.error("Error trying to insert full account info: ", fullError);
        return false;
      }

      return true;
    }
    // If there isn't an avatar to update
    else {
      const { error: nameError } = await supabase
        .from("users")
        .update({ full_name: fullName })
        .eq("id", id);

      if (nameError) {
        console.error("Error trying to insert full name: ", nameError);
        return false;
      }

      return true;
    }
  }
  //If there isn't a name to update
  else {
    const { error: avatarError } = await supabase
      .from("users")
      .update({ avatar_url: avatarUrl })
      .eq("id", id);

    if (avatarError) {
      console.error("Error trying to insert avatar: ", avatarError);
      return false;
    }

    return true;
  }
};
