import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

const scrapePage = async (url) => {
  puppeteer.use(StealthPlugin());

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: puppeteer.executablePath(),
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // Create a browser context with a custom user agent
  const context = await browser.createBrowserContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();
  await page.setRequestInterception(true);

  page.on("request", (req) => {
    const resourceType = req.resourceType();
    if (["stylesheet", "font", "media"].includes(resourceType)) {
      req.abort(); // skip loading
    } else {
      req.continue();
    }
  });

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 7000));

  const pageData = await page.evaluate(() => {
    const text = document.body.innerText;

    const images = Array.from(document.body.querySelectorAll("img"))
      .map((img) => img.src)
      .filter((src) => src && src.startsWith("http"));

    return { text, images };
  });

  await browser.close();

  return pageData;
};

export const scrapeMultiple = async (urls, res) => {
  const results = [];
  for (const url of urls) {
    try {
      const { text, images } = await scrapePage(url);
      console.log(url, "Has been downloaded successfully.");
      res.write(`event: preProcessing\ndata: ${url} was downloaded successfully\n`);
      results.push({ page: url, text, images });
    } catch (err) {
      console.error(`Failed to scrape ${url}:`, err);
    }
  }
  return results;
};
