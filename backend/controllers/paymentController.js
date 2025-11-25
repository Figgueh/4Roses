import supabase from "../config/supabaseClient.js";
// GET all ICS for calendar
// /ics
export const getIcs = async (req, res, next) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send("Missing URL parameter");
  }

  try {
    const response = await fetch(url);
    const data = await response.text();

    res.set("Content-Type", "text/calendar");
    res.send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching ICS");
    next(err);
  }
};

// GET price for a certain date
// /price?date=YYYY-MM-DD
export const getPrice = async (req, res, next) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const parsed = new Date(date);

    if (isNaN(parsed.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const month = parsed.getMonth(); // 0 - 11

    const { data, error } = await supabase
      .from("monthly_pricing")
      .select("price")
      .eq("month", month)
      .single();

    if (error || !data) {
      console.error(error);
      return res.status(404).json({ error: "No price found for this month" });
    }

    return res.json({ price: data.price });
  } catch (err) {
    console.error("PRICE ERROR:", err);
    res.status(500).json({ error: "Server error" });
    next(err);
  }
};
