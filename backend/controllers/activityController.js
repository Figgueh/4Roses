import supabase from "../config/supabaseClient.js";
import { slugify } from "../utils.js";

// GET all activities
// /
export const getActivities = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("activities").select("*");
    if (error) throw error;

    const activities = data.map((activity) => ({
      ...activity,
      slug: "activities/" + slugify(activity.title),
    }));

    res.json(activities);
  } catch (err) {
    next(err);
  }
};

// GET the activity id of a named activity
// /:activityName
export const getActivityIdByName = async (req, res, next) => {
  try {
    const { activityName } = req.params;
    const { data, error } = await supabase
      .from("activities")
      .select("id")
      .eq("title", activityName)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// POST a new activity
// /
// Body: title, image
export const addActivity = async (req, res, next) => {
  try {
    const { title, image } = req.body;
    console.log(title, image);
    const { data, error } = await supabase
      .from("activities")
      .insert([{ title: title, image: image }]);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};
