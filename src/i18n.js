import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Get all the saved locals
const context = require.context("./locales", true, /\.json$/);

const resources = {};
context.keys().forEach((key) => {
  const lang = key.match(/\/(\w+)\.json$/)[1];
  resources[lang] = { translation: context(key) };
});

const resourceKeys = Object.keys(resources);
export const supportedLanguages = resourceKeys.reduce((acc, code) => {
  // Using the code itself as locale gives the language name in its own language
  const displayNames = new Intl.DisplayNames([code], { type: "language" });
  const name = displayNames.of(code);
  acc[code] = name.charAt(0).toUpperCase() + name.slice(1);
  return acc;
}, {});

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;
