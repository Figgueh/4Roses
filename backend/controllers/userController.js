import supabase from "../config/supabaseClient.js";

// GET user info by id
// /users/:id
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
// /users/allData/:id
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
// users/allUserData
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

/* 
// Creates the users account and generates a link that will allow the user to confirm the email.
//
// POST {email, password, firstName, lastName, dateOfBirth, lang}:
// email:       The email the user will need to confirm
// password:    The password of the user
// firstName:   The first name of the user
// lastName:    The last name of the user
// dateOfBirth: The date of birth of the user (must be 21+)
// lang:        The language that is currently selected at the time the user made the account.
//
// POST /users/createUser
*/
export const createNewUser = async (req, res, next) => {
  const { email, password, firstName, lastName, dateOfBirth, lang } = req.body;

  try {
    const { data: userAccount, error } = await supabase.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        data: {
          full_name: `${firstName} ${lastName}`,
          date_of_birth: dateOfBirth,
          preferred_language: lang || "en",
        },
      },
    });

    if (error) {
      return res.json({ success: false, error: error.message });
    }

    return res.json({ success: true, data: userAccount });
  } catch (err) {
    next(err);
  }
};
