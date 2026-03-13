import supabase from "../config/supabaseClient.js";
import { supportedLanguages, translateText } from "../middlewares/translate.js";
import { deletePhoto, uploadPhoto } from "../utils/helpers.js";

// ── GET /about ───────────────────────────────────────────────
// Returns all 5 sections ordered by their sort_order column
export const getAboutSections = async (req, res) => {
  const { lang = "en" } = req.query;

  try {
    const { data: aboutData, error } = await supabase
      .from("about_sections")
      .select("id, heading, body")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to fetch about sections" });
    }

    // If english, return as-is
    if (lang === "en") {
      return res.json(aboutData);
    }

    // Fetch all translations for this language in one query
    const { data: translations, error: translationError } = await supabase
      .from("about_translation")
      .select("about_id, heading, body")
      .eq("language", lang)
      .in(
        "about_id",
        aboutData.map((s) => s.id)
      );

    if (translationError) {
      console.error("Translation error:", translationError);
      // Fall back to english if translations fail
      return res.json(aboutData);
    }

    // Merge — replace heading/body with translation if it exists
    const merged = aboutData.map((section) => {
      const translation = translations.find((t) => t.about_id === section.id);
      return {
        ...section,
        heading: translation?.heading || section.heading,
        body: translation?.body || section.body,
      };
    });

    return res.json(merged);
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ── GET /about/aboutImage ──────────────────────────────────────────
// Fetches the images for the about hero banner.
export const getAboutImage = async (req, res) => {
  try {
    const { data: files, error } = await supabase.storage.from("images").list("homepage");

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to fetch image" });
    }

    const aboutFile = files?.find((f) => f.name.startsWith("aboutUs"));

    if (!aboutFile) {
      return res.status(404).json({ error: "No about image found" });
    }

    const url = `${process.env.SUPABASE_IMAGE}homepage/${aboutFile.name}`;

    return res.status(200).json({ url });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
// ── PUT /aboutImage ──────────────────────────────────────────
// Deletes the old about image and uploads the specified one
export const updateAboutImage = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No image provided" });
    }

    // Delete any existing aboutUs file regardless of extension
    const extensions = ["jpg", "jpeg", "png", "webp", "JPG", "JPEG", "PNG", "WEBP"];
    await Promise.allSettled(extensions.map((ext) => deletePhoto(`homepage/aboutUs.${ext}`)));

    // Upload new one
    const ext = file.mimetype.split("/")[1];
    await uploadPhoto(`homepage/aboutUs.${ext}`, file);

    return res.json({ success: true });
  } catch (err) {
    console.error("Image upload error:", err);
    return res.status(500).json({ error: "Failed to upload image" });
  }
};

// ── PUT /about/:id ──────────────────────────────────────────
// Updates heading and body for a single section
export const updateAboutSection = async (req, res) => {
  const { id } = req.params;
  const { heading, body } = req.body;
  const { lang = "en", toTranslate = "false" } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Section id is required" });
  }

  if (!heading || !body) {
    return res.status(400).json({ error: "Heading and body are required" });
  }

  try {
    let updateData, updateError;

    if (lang === "en") {
      ({ data: updateData, error: updateError } = await supabase
        .from("about_sections")
        .update({ heading, body })
        .eq("id", id)
        .select()
        .single());
    } else {
      // Upsert in case the translation row doesn't exist yet
      ({ data: updateData, error: updateError } = await supabase
        .from("about_translation")
        .upsert(
          { about_id: id, language: lang, heading, body },
          { onConflict: "about_id, language" }
        )
        .select()
        .single());
    }

    if (updateError) {
      console.error("Supabase error:", updateError);
      return res.status(500).json({ error: "Failed to update section" });
    }

    if (!updateData) {
      return res.status(404).json({ error: `Section "${id}" not found` });
    }

    if (toTranslate == "true") {
      // Translate and upload data to the database.
      for (const language of supportedLanguages) {
        const transHeading = await translateText(updateData.heading, language);
        const transBody = await translateText(updateData.body, language);

        const { error: transError } = await supabase
          .from("about_translation")
          .upsert(
            {
              about_id: updateData.id,
              language,
              heading: transHeading,
              body: transBody,
            },
            { onConflict: "about_id, language" }
          )
          .select();
        if (transError) throw transError;
      }
    }

    return res.json({ success: true, section: updateData });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
