export const buildPrompt = (pages) => {
  return `Here are parts of a webpage: \n
          ${pages
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
  "title": "Main title, make sure to not include any special characters like @,:,",'...",
  "image": "Leave blank or provide a working link, make sure I have the full url",
  "description": "a short description summarizing the article",
  "article": [{
  "title": "Section 1",
  "content": "Text...",
  "detail": ["Item 1", "Item 2"]
  }]
}

the article section must also be in json format.
I'd prefer if the price was listed in the details
if they have services available, then list them in detail
Don't feel obligated to add details in the article section.
Only add the details section if necessary.
Respond with valid JSON only.`;
};
