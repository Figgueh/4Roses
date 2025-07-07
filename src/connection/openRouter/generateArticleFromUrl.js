export const generateArticleFromUrl = async (url) => {
  const apiKey = process.env.REACT_APP_OPENROUTER_KEY;

  const fetchPageHTML = async (url) => {
    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      console.log(data);

      return data.contents; // HTML of the target page
    } catch (error) {
      console.error("Error fetching page:", error);
      return null;
    }
  };

  const htmlContent = await fetchPageHTML(url);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
          content: `Here is a webpage: ${htmlContent} Generate me an article that includes things like the price, location, services offered, values and give a good reason why it would be a good place to visit without sounding generic.

The article should follow this schema:
{
  "title": "Main title",
  "photo": "Leave blank or suggest an image topic",
  "article": [
    {
      "title": "Section 1",
      "content": "Text...",
      "detail": ["Item 1", "Item 2"]
    }
  ]
}

if they have services available, then list them in detail

Don't feel obligated to add details in the article section.
Only add the details section if necessary

Respond with valid JSON only.`,
        },
      ],
    }),
  });

  const data = await response.json();
  // return data?.choices;
  console.log(data);
  return data?.choices?.[0]?.message?.content;
};
