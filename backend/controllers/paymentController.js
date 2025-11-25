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

// GET price for all months
//
export const getMonthlyPrice = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("monthly_pricing")
      .select("month, price")
      .order("month", { ascending: true });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to load monthly prices" });
    }

    // Convert to useful format: {0: 120, 1: 130, ...}
    const monthlyPrices = {};

    data.forEach((row) => {
      monthlyPrices[row.month] = row.price;
    });

    return res.json(monthlyPrices);
  } catch (err) {
    console.error("PRICE ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
