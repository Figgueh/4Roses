import supabase from "../config/supabaseClient.js";

// GET user info by id
// /:id
export const getUserInfo = async (req, res, next) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single();
    if (error) throw error;

    const [first_name = "", ...rest] = (data.full_name || "").split(" ");
    const last_name = rest.join(" ");

    return res.json({ ...data, first_name, last_name });
  } catch (err) {
    next(err);
  }
};
