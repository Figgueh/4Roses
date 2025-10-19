export const generateArticle = async (prompt, res) => {
  let response;
  const apiKey = process.env.OPENROUTER_KEY;

  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tngtech/deepseek-r1t2-chimera:free",
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
      console.log(errorText);
      if (response.status == 429)
        throw new Error(`OpenRouter rate limit reached. Try again tomorrow`);
      throw new Error(`OpenRouter request failed (${response.status}): ${errorText}`);
    }
  } catch (err) {
    res.write(
      `event: error\ndata: ${JSON.stringify({
        message: "Failed to generate article",
        error: err.message,
      })}\n\n`
    );
    return res.end();
  }
  res.write(`event: preProcessing\ndata: request was sent successfully.\n\n`);

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let sentMeta = false;
  // eslint-disable-next-line no-unused-vars
  let total = "";
  let buffer = "";
  let firstMessage = true;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });

    chunk.split("\n").forEach((line) => {
      if (line.startsWith("data:")) {
        const json = line.slice(5);
        let partial = "";
        try {
          // parse the response from OpenRouter
          const parsed = JSON.parse(partial + json);
          const delta = parsed.choices?.[0]?.delta?.content;
          partial = ""; // clear buffer

          if (delta) {
            buffer += delta;
            total += delta;
            // console.log(delta);

            // All valid response starts with ```json
            if (firstMessage) {
              if (!delta.startsWith("```")) {
                throw new Error("Response from OpenRouter wasn't sent in a proper format");
              }
              firstMessage = false;
            }

            // Look for metadata if not sent yet
            if (!sentMeta && delta.trim().includes("article")) {
              var lines = buffer
                .split("\n")
                .map((line) => line.trim())
                .filter((line) => line.length); // Removes any lines that are empty
              lines.shift(); // removes "```json"
              lines.pop(); // removes "article:"
              lines.push("}"); // adds closing json tag
              var metaStr = lines.join("\n");
              metaStr = metaStr.replace(/,\s*}$/, "}"); // removes comma before the closing brace

              console.log("META:", metaStr);

              try {
                const parsedMeta = JSON.parse(metaStr);
                console.log(parsedMeta);
                res.write(`event: metadata\ndata: ${JSON.stringify(parsedMeta)}\n\n`);
                sentMeta = true;
              } catch (err) {
                // still incomplete JSON, wait for more chunks
              }

              //Clear the buffer sent
              buffer = "";
            }

            // --- 2. Send article sections individually ---
            if (sentMeta) {
              // look for complete section objects
              const sectionRegex = /{[\s\S]*?}(?=|])/g;
              let match;
              while ((match = sectionRegex.exec(buffer)) !== null) {
                try {
                  const sectionObj = JSON.parse(match[0]);
                  res.write(`event: section\ndata: ${JSON.stringify(sectionObj)}\n\n`);
                } catch (err) {
                  console.error("Failed to parse section:", err);
                }
              }

              // keep only trailing incomplete part in buffer
              const lastBracket = buffer.lastIndexOf("}");
              if (lastBracket !== -1) {
                buffer = buffer.slice(lastBracket + 1);
              }
            }
          }
        } catch (err) {
          if (json.trim() === "[DONE]") {
            res.write("event: done\ndata: [DONE]\n\n");
            res.end();
            return;
          }
          console.log("adding: ", json, " \nto: ", partial);

          // console.error(
          //   "Parse error while trying to make the OpenRouter response a JSON object",
          //   err
          // );
          partial += json;
        }
      }
    });
  }
};
