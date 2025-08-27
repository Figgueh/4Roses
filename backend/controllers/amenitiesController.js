import supabase from "../config/supabaseClient.js";

// GET all amenities
// /
export const getAmenities = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("amenities").select("*");
    if (error) throw error;

    res.json(data);
  } catch (err) {
    next(err);
  }
};
