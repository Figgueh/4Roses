export const generateArticle = async (prompt, sse, model) => {
  let response;
  const apiKey = process.env.OPENROUTER_KEY;

  const resolvedModel = model || "tngtech/deepseek-r1t2-chimera:free";

  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: sse.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: resolvedModel,
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

    if (sse.isAborted()) return;

    if (!response.ok) {
      const errorText = await response.text();
      console.log(errorText);
      if (response.status == 429)
        throw new Error(`OpenRouter rate limit reached. Try again tomorrow`);
      throw new Error(`OpenRouter request failed (${response.status}): ${errorText}`);
    }
  } catch (err) {
    if (err.name === "AbortError") {
      console.log("generateArticle aborted cleanly");
      return;
    }
    sse.send("error", { message: "Failed to generate article", error: err.message });
    return;
  }

  sse.send("preProcessing", `OpenRouter accepted. Model: ${resolvedModel}`);

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let partial = ""; // accumulates incomplete SSE JSON chunks
  let total = ""; // full raw model output

  // Collect the entire stream first
  while (true) {
    if (sse.isAborted()) return;

    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });

    for (const line of chunk.split("\n")) {
      if (!line.startsWith("data:")) continue;

      const json = line.slice(5).trim();
      if (json === "[DONE]") break;

      partial += json;
      let parsed;
      try {
        parsed = JSON.parse(partial);
        partial = "";
      } catch {
        continue;
      }

      const delta = parsed.choices?.[0]?.delta?.content;
      if (delta) total += delta;
    }
  }

  console.log("Full response received, length:", total.length);
  console.log("First 200 chars:", total.slice(0, 200));

  // --- Find the start of the JSON payload ---
  // Handle both plain JSON and ```json ... ``` wrapped responses
  let jsonStr = null;

  const fenceIdx = total.indexOf("```");
  const braceIdx = total.indexOf("{");

  if (fenceIdx !== -1 && (braceIdx === -1 || fenceIdx < braceIdx)) {
    // Code-fenced: find the { after the fence
    const braceAfterFence = total.indexOf("{", fenceIdx);
    const closingFence = total.lastIndexOf("```");
    if (braceAfterFence !== -1) {
      const end = closingFence > braceAfterFence ? closingFence : total.length;
      jsonStr = total.slice(braceAfterFence, end).trim();
    }
  } else if (braceIdx !== -1) {
    // Plain JSON: find the last closing brace
    const lastBrace = total.lastIndexOf("}");
    if (lastBrace !== -1) {
      jsonStr = total.slice(braceIdx, lastBrace + 1).trim();
    }
  }

  if (!jsonStr) {
    console.error("Could not find JSON in response:", total);
    sse.send("error", { message: "Model response did not contain valid JSON." });
    sse.close();
    return;
  }

  // --- Parse the full JSON ---
  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    console.error("JSON parse failed:", e.message);
    console.error("jsonStr:", jsonStr.slice(0, 500));
    sse.send("error", { message: "Failed to parse model response.", error: e.message });
    sse.close();
    return;
  }

  // --- Send metadata ---
  const { article, ...meta } = parsed;
  console.log("META:", meta);
  sse.send("metadata", meta);

  // --- Send sections ---
  if (!Array.isArray(article) || article.length === 0) {
    console.error("No article sections found in response:", parsed);
    sse.send("error", { message: "Model returned no article sections." });
    sse.close();
    return;
  }

  for (const section of article) {
    console.log("SECTION:", section.title);
    sse.send("section", section);
  }

  sse.send("done", "[DONE]");
  sse.close();
};
