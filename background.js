// background.js

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarize") {
    handleSummarize(request.text).then(sendResponse);
    return true; // Keep message channel open for async response
  }
});

async function handleSummarize(postText) {
  try {
    const data = await chrome.storage.sync.get(["apiKey"]);
    const apiKey = data.apiKey;
    if (!apiKey) {
      console.warn("No API key set for Meme Summary");
      return { error: "No API key" };
    }

    const voices = ["Ricky Gervais", "Chris Rock", "Bill Burr", "Jimmy Carr"];

    const style = voices[Math.floor(Math.random() * voices.length)];

    const prompt = `Summarize the following LinkedIn post into a short, meme-worthy description
that captures the underlying social intent or subtext in ${style}'s style. If the post is not meme worthy, return "Good post. No summary needed.".

Rules:
- 1–2 sentences max.
- Use ${style}'s tone and style.
- No emojis, slang, or insults.
- Do not add new facts.

Post:
${postText}`;

    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 4000,
        },
      }),
    });

    console.log("Response: ", res);

    if (!res.ok) {
      throw new Error("API HTTP Error: " + res.status);
    }

    const json = await res.json();
    let summary = json.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("Summary: ", summary);

    if (summary) {
      summary = summary.trim();
      return { summary };
    } else {
      return { error: "No summary generated" };
    }
  } catch (error) {
    console.error("Meme Summary Error:", error);
    return { error: "Failed" };
  }
}
