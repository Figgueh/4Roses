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

// GET user info by id with email.
// /allData/:id
export const getFullUserInfo = async (req, res, next) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single();
    if (error) throw error;

    const [first_name = "", ...rest] = (data.full_name || "").split(" ");
    const last_name = rest.join(" ");

    //Get the auth data for the email
    const { data: userInfo } = await supabase.auth.admin.getUserById(id);
    const email = userInfo.user.email || "N/A";

    return res.json({ ...data, first_name, last_name, email });
  } catch (err) {
    next(err);
  }
};

// GET all user info by id with email.
// /allUserData

export const getAllUsersInfo = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("users").select("*");
    if (error) throw error;

    const users = await Promise.all(
      data.map(async (user) => {
        const [first_name = "", ...rest] = (user.full_name || "").split(" ");
        const last_name = rest.join(" ");

        const { data: userInfo } = await supabase.auth.admin.getUserById(user.id);
        const email = userInfo.user.email || "N/A";

        return { ...user, first_name, last_name, email };
      })
    );

    return res.json(users);
  } catch (err) {
    next(err);
  }
};
