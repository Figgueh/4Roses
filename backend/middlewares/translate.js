import axios from "axios";
export const supportedLanguages = ["fr", "es", "de", "pt", "nl"];

export async function translateText(text, targetLang, source = "en") {
  try {
    const res = await axios.post(
      `${process.env.TRANSLATE_URL}`,
      {
        q: text,
        source,
        target: targetLang,
        format: "text",
        api_key: `${process.env.TRANSLATE_KEY}`,
      },
      { headers: { "Content-Type": "application/json" } }
    );

    return res.data.translatedText;
  } catch (err) {
    console.error(
      `Translation error (${source} → ${targetLang}):`,
      err.response?.data || err.message
    );
    throw err;
  }
}

export async function translateArticle(jsonArticle, targetLang) {
  try {
    const translated = await Promise.all(
      jsonArticle.map(async (section) => {
        const translatedSection = { ...section };

        // translate title (string)
        if (section.title) {
          translatedSection.title = await translateText(section.title, targetLang);
        }

        // translate detail (string or array of strings)
        if (Array.isArray(section.detail)) {
          translatedSection.detail = await Promise.all(
            section.detail.map(async (d) => await translateText(d, targetLang))
          );
        } else if (typeof section.detail === "string" && section.detail.trim()) {
          translatedSection.detail = await translateText(section.detail, targetLang);
        }

        // translate content (string)
        if (section.content) {
          translatedSection.content = await translateText(section.content, targetLang);
        }

        return translatedSection;
      })
    );
    return translated;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
