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
      if (response.status === 429)
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

  let partial = ""; // incomplete SSE line accumulator
  let total = ""; // full raw model output so far
  let ready = false; // true once we've found the opening { of the JSON payload
  let sentMeta = false;

  // ── Brace-depth section parser state ──
  // After metadata is sent, we scan the "article" array char-by-char.
  // sectionBuf accumulates characters for the current section object.
  // depth tracks how many { we're inside (0 = between sections).
  let sectionBuf = "";
  let depth = 0;
  let inString = false;
  let escape = false;

  /**
   * Feed new characters into the depth-tracking parser.
   * Emits a section SSE event whenever a top-level { ... } is completed.
   */
  function feedSectionChars(chars) {
    for (const ch of chars) {
      // Track string boundaries so braces inside strings don't count
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === '"') {
        inString = !inString;
      }

      if (!inString) {
        if (ch === "{") {
          depth++;
        } else if (ch === "}") {
          depth--;
        }
      }

      if (depth > 0) {
        sectionBuf += ch;
      } else if (depth === 0 && sectionBuf.length > 0) {
        // Completed a top-level object
        sectionBuf += ch; // include the closing }
        try {
          const sectionObj = JSON.parse(sectionBuf);
          console.log("SECTION:", sectionObj.title);
          sse.send("section", sectionObj);
        } catch (e) {
          console.error("Failed to parse section:", e.message, sectionBuf.slice(0, 100));
        }
        sectionBuf = "";
      }
    }
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (sse.isAborted()) return;

    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });

    for (const line of chunk.split("\n")) {
      if (!line.startsWith("data:")) continue;

      const json = line.slice(5).trim();

      if (json === "[DONE]") {
        sse.send("done", "[DONE]");
        sse.close();
        return;
      }

      // Accumulate partial SSE JSON across split lines
      partial += json;
      let parsed;
      try {
        parsed = JSON.parse(partial);
        partial = "";
      } catch {
        continue;
      }

      const delta = parsed.choices?.[0]?.delta?.content;
      if (!delta) continue;

      total += delta;

      // ── Step 1: Find the opening { of the JSON payload ──
      if (!ready) {
        const fenceIdx = total.indexOf("```");
        const braceIdx = total.indexOf("{");

        let jsonStart = -1;
        if (fenceIdx !== -1 && (braceIdx === -1 || fenceIdx < braceIdx)) {
          const braceAfterFence = total.indexOf("{", fenceIdx);
          if (braceAfterFence !== -1) jsonStart = braceAfterFence;
        } else if (braceIdx !== -1) {
          jsonStart = braceIdx;
        }

        if (jsonStart === -1) continue;

        // We found the start — everything from here feeds the meta parser
        total = total.slice(jsonStart);
        ready = true;
      }

      // ── Step 2: Send metadata as soon as we have it ──
      if (!sentMeta) {
        const articleKeyIdx = total.indexOf('"article"');
        if (articleKeyIdx !== -1) {
          let metaStr = total.slice(0, articleKeyIdx).trimEnd().replace(/,\s*$/, "") + "}";
          try {
            const parsedMeta = JSON.parse(metaStr);
            console.log("META:", parsedMeta);
            sse.send("metadata", parsedMeta);
            sentMeta = true;

            // Feed everything after "article": [ into the section parser
            const afterKey = total.slice(articleKeyIdx + '"article"'.length);
            const arrayStart = afterKey.indexOf("[");
            if (arrayStart !== -1) {
              feedSectionChars(afterKey.slice(arrayStart + 1));
            }
          } catch {
            // incomplete meta — wait for more
          }
        }
        continue;
      }

      // ── Step 3: Feed new delta directly into section parser ──
      feedSectionChars(delta);
    }
  }
};
