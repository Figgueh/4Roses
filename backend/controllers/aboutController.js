import supabase from "../config/supabaseClient.js";

// ── GET /about ───────────────────────────────────────────────
// Returns all 5 sections ordered by their sort_order column
export const getAboutSections = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("about_sections")
      .select("id, heading, body")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to fetch about sections" });
    }

    return res.json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ── PUT /about/:id ──────────────────────────────────────────
// Updates heading and body for a single section
export const updateAboutSection = async (req, res) => {
  const { id } = req.params;
  const { heading, body } = req.body;

  if (!heading || !body) {
    return res.status(400).json({ error: "Heading and body are required" });
  }

  try {
    const { data, error } = await supabase
      .from("about_sections")
      .update({ heading, body })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to update section" });
    }

    if (!data) {
      return res.status(404).json({ error: `Section "${id}" not found` });
    }

    return res.json({ success: true, section: data });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
