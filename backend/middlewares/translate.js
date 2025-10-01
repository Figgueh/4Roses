import axios from "axios";

export const supportedLanguages = ["fr", "es"];

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
