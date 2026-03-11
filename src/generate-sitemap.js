// sitemap-generator.js
import dotenv from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env.production") });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);

const DOMAIN = "https://4roses.fignet.ca";

async function generateSitemap() {
  // Get all the static pages
  const staticUrls = [
    { path: "/", priority: "1.0" },
    { path: "/AboutUs", priority: "0.8" },
    { path: "/albums/interior", priority: "0.8" },
    { path: "/albums/exterior", priority: "0.8" },
    { path: "/albums/videos", priority: "0.8" },
    { path: "/terms-and-conditions", priority: "0.8" },
    { path: "/sign-in", priority: "0.8" },
    { path: "/contact-developer", priority: "0.8" },
  ]
    .map(
      ({ path, priority }) => `
  <url>
    <loc>${DOMAIN}${path}</loc>
    <changefreq>yearly</changefreq>
    <priority>${priority}</priority>
  </url>`
    )
    .join("");

  // Get all the pages that are stored in the database
  try {
    // The request for the data
    const [{ data: articles, error: articlesError }, { data: activities, error: activitiesError }] =
      await Promise.all([
        supabase.from("articles").select("activity_id, title"),
        supabase.from("activities").select("id, title"),
      ]);

    if (articlesError) throw articlesError;
    if (activitiesError) throw activitiesError;

    const articleSitemap = [...activities].map(
      (activity) =>
        // Construct the url for the activity page
        `  <url>
    <loc>${DOMAIN}/activities/${activity.title.replaceAll(" ", "-")}</loc>
    <changefreq>yearly</changefreq>
    <priority>0.7</priority>
  </url>${articles
    .filter((article) => article.activity_id == activity.id)
    .map(
      // Construct the url for the articles in that activity page
      (article) => `
  <url>
    <loc>${DOMAIN}/activities/${activity.title.replaceAll(" ", "-")}/${article.title.replaceAll(
        " ",
        "-"
      )}</loc>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join("")}
`
    );

    // Join both the static pages and the pages that are loaded from the database
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${articleSitemap.join("")}
</urlset>`;

    // Write to the file
    fs.writeFile("../public/sitemap.xml", sitemap, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("Sitemap generated successfully!");
    });
  } catch (err) {
    console.error("Error generating sitemap:", err);
  }
}

// Call the function
generateSitemap();
