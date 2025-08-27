import { Readability } from "@mozilla/readability";

export const generateArticleFromUrl = async (urls, setResult, setLoading) => {
  const apiKey = process.env.REACT_APP_OPENROUTER_KEY;

  const fetchPageHTML = async (url) => {
    setLoading("Currently downloading " + url);
    try {
      // Use corsproxy to be able to download the HTML data
      const response = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error(`Status: ${response.status}`);

      // HTML parser setup
      const parser = new DOMParser();
      const doc = parser.parseFromString(await response.text(), "text/html");
      const reader = new Readability(doc);
      return reader.parse();
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  };

  // Get all the content from the websites
  const allHtmlContent = await Promise.all(urls.map(fetchPageHTML));

  const prompt = `Here are parts of a webpage: 
          ${allHtmlContent
            .map(
              (value, index) => `Page ${index + 1} content:
  -------------------
  ${Object.entries(value).map(([key, value]) => {
    return key + ": " + value + "\n";
  })}
  -------------------`
            )
            .join("\n\n")}
Generate me an article that includes things like the price, location, services offered, values and give a good reason why it would be a good place to visit without sounding generic.
If the web pages don't include any information on the previously mentioned items, then don't include them and find something else that would be good to know.
The article should follow this schema:
{
  "title": "Main title",
  "photo": "Leave blank or provide a working link",
  "description": "a short description summarizing the article",
  "article": [{
  "title": "Section 1",
  "content": "Text...",
  "detail": ["Item 1", "Item 2"]
  }]
}

if they have services available, then list them in detail
Don't feel obligated to add details in the article section.
Only add the details section if necessary.
Respond with valid JSON only.`;

  setLoading("Assembling prompt");
  let response;

  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant who generates structured articles based on web content.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter request failed (${response.status}): ${errorText}`);
    }
  } catch (err) {
    setLoading("Failed to generate article");
    throw err;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let text = "";

  setLoading("Generating...");
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    console.log(chunk);

    chunk.split("\n").forEach((line) => {
      if (line.startsWith("data:")) {
        const json = line.slice(5).trim();
        if (json === "[DONE]") {
          setLoading("Done");
          return;
        }

        try {
          const parsed = JSON.parse(json);

          if (parsed.error) {
            const { message, code, metadata } = parsed.error;
            throw new Error(
              `OpenRouter Error [${code}]: ${message}${metadata?.raw ? ` (${metadata.raw})` : ""}`
            );
          }

          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            text += delta;
            setResult(text);
          }
        } catch (err) {
          console.error("Error parsing chunk", err);
          throw new Error("Failed to parse streamed response from OpenRouter: " + err.message);
        }
      }
    });
  }
};
