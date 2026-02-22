// background.js

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarize") {
    if (request.source === "facebook") {
      handleFacebookSummarize(request.text).then(sendResponse);
    } else {
      handleLinkedinSummarize(request.text).then(sendResponse);
    }
    return true; // Keep message channel open for async response
  }
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.runtime.openOptionsPage();
  }
});

async function callGemini(prompt) {
  const data = await chrome.storage.sync.get(["apiKey"]);
  const apiKey = data.apiKey;
  if (!apiKey) {
    console.warn("No API key set for Meme Summary");
    return { error: "No API key" };
  }

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

  if (!res.ok) {
    throw new Error("API HTTP Error: " + res.status);
  }

  const json = await res.json();
  let summary = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (summary) {
    return { summary: summary.trim() };
  } else {
    return { error: "No summary generated" };
  }
}

async function handleFacebookSummarize(profileText) {
  try {
    const prompt = `Create a spicy, meme-style summary of the following Facebook profile.

Rules:
- 1–2 sentences max.
- No emojis, slang, or insults.
- Do not add new facts.

Profile:
${profileText}`;

    return await callGemini(prompt);
  } catch (error) {
    console.error("Meme Summary Error (Facebook):", error);
    return { error: "Failed" };
  }
}

async function handleLinkedinSummarize(postText) {
  try {
    const voices = ["Ricky Gervais", "Chris Rock", "Jimmy Carr"];
    const style = voices[Math.floor(Math.random() * voices.length)];

    const prompt = `
    Today's date is ${new Date().toLocaleDateString()}.
    If the post is about serious matters, and are not meme worthy, return "No summary needed.".
    Otherwise, create a spicy, meme-worthy description of the following LinkedIn post
    that captures the underlying social intent or subtext in ${style}'s style.

Rules:
- 1–2 sentences max.
- Use ${style}'s tone and style.
- No emojis, slang, or insults.
- Do not add new facts.
- Don't assume the gender, age, or location of the post author.

Post:
${postText}`;

    return await callGemini(prompt);
  } catch (error) {
    console.error("Meme Summary Error (LinkedIn):", error);
    return { error: "Failed" };
  }
}
