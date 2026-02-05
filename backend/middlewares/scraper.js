import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

puppeteer.use(StealthPlugin());

export const scrapePage = async (url, method = "new") => {
  const isLocal = process.env.NODE_ENV === "development";

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: isLocal ? puppeteer.executablePath() : "/usr/bin/google-chrome",
    args: [
      "--disable-extensions",
      "--disable-default-apps",
      "--disable-popup-blocking",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-features=IsolateOrigins,site-per-process",
    ],
  });

  const context = await browser.createBrowserContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();
  await page.setRequestInterception(true);

  page.on("request", (req) => {
    const type = req.resourceType();
    if (["stylesheet", "font", "media"].includes(type)) {
      req.abort();
    } else {
      req.continue();
    }
  });

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 0 });
    await new Promise((r) => setTimeout(r, 7000));

    let result = { title: "", text: "", images: [] };

    if (method === "new") {
      const html = await page.content();
      const cleanedHtml = html
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi, "");

      const dom = new JSDOM(cleanedHtml, { url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();

      if (article) {
        const images = Array.from(
          new JSDOM(article.content).window.document.querySelectorAll("img")
        )
          .map((img) => img.src)
          .filter((src) => src && src.startsWith("http"));

        const cleanText = article.textContent
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .join("\n"); // preserves paragraphs

        result = {
          title: article.title || "",
          text: cleanText,
          images,
        };
      }
    } else if (method === "old") {
      result = await page.evaluate(() => {
        const body = document.body;
        // Remove unwanted elements
        ["header", "nav", "footer", ".menu", ".sidebar"].forEach((selector) => {
          body.querySelectorAll(selector).forEach((el) => el.remove());
        });

        const text = body.innerText || "";
        const images = Array.from(body.querySelectorAll("img"))
          .map((img) => img.src)
          .filter((src) => src && src.startsWith("http"));

        return { title: document.title || "", text, images };
      });
    }

    return result;
  } catch (err) {
    console.error(`Failed to scrape ${url}:`, err);
    return { title: "", text: "", images: [] };
  } finally {
    await browser.close();
  }
};

export const scrapeMultiple = async (urls, sse, signal, method = "old") => {
  const results = [];
  for (const url of urls) {
    if (sse.isAborted()) {
      return results;
    }

    const { title, text, images } = await scrapePage(url, method);

    if (sse.isAborted()) {
      return results;
    }

    console.log(url, "scraped successfully.");
    sse.send("preProcessing", `${url} scraped successfully`);
    results.push({ page: url, title, text, images });
  }
  return results;
};
