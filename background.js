// background.js

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";

const DEFAULT_FACEBOOK_PROMPT = `Create a spicy, meme-style summary of the following Facebook profile.
Today's date is {{DATE}}.

Rules:
- 1–2 sentences max.
- No emojis, slang, or insults.
- Do not add new facts.

Profile:
{{TEXT}}`;

const DEFAULT_LINKEDIN_PROMPT = `Today's date is {{DATE}}.
If the post is about serious matters, and are not meme worthy, return "No summary needed.".
Otherwise, create a spicy, meme-worthy description of the following LinkedIn post
that captures the underlying social intent or subtext in a dry, slightly bored style.

Rules:
- 1–2 sentences max.
- Calm, neutral tone.
- No emojis, slang, or insults.
- Do not add new facts.
- Don't assume the gender, age, or location of the post author.

Post:
{{TEXT}}`;

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
    const data = await chrome.storage.sync.get(["facebookPrompt"]);
    const template = data.facebookPrompt || DEFAULT_FACEBOOK_PROMPT;
    const prompt = template.replace("{{TEXT}}", profileText);

    return await callGemini(prompt);
  } catch (error) {
    console.error("Meme Summary Error (Facebook):", error);
    return { error: "Failed" };
  }
}

async function handleLinkedinSummarize(postText) {
  try {
    const data = await chrome.storage.sync.get(["linkedinPrompt"]);
    const template = data.linkedinPrompt || DEFAULT_LINKEDIN_PROMPT;
    const prompt = template
      .replace("{{TEXT}}", postText)
      .replace("{{DATE}}", new Date().toLocaleDateString());

    return await callGemini(prompt);
  } catch (error) {
    console.error("Meme Summary Error (LinkedIn):", error);
    return { error: "Failed" };
  }
}
