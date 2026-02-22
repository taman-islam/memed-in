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

const DEFAULT_FACEBOOK_PROMPT = `Create a spicy, meme-style summary of the following Facebook profile. Remember today's date is {{DATE}}.

Rules:
- 1–2 sentences max.
- No emojis, slang, or insults.
- Do not add new facts.

Profile:
{{TEXT}}`;

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(
    ["apiKey", "linkedinPrompt", "facebookPrompt"],
    (result) => {
      if (result.apiKey) {
        document.getElementById("apiKey").value = result.apiKey;
      }
      document.getElementById("linkedinPrompt").value =
        result.linkedinPrompt || DEFAULT_LINKEDIN_PROMPT;
      document.getElementById("facebookPrompt").value =
        result.facebookPrompt || DEFAULT_FACEBOOK_PROMPT;
    },
  );
});

document.getElementById("save").addEventListener("click", () => {
  const apiKey = document.getElementById("apiKey").value;
  const linkedinPrompt = document.getElementById("linkedinPrompt").value;
  const facebookPrompt = document.getElementById("facebookPrompt").value;

  chrome.storage.sync.set(
    {
      apiKey: apiKey,
      linkedinPrompt: linkedinPrompt,
      facebookPrompt: facebookPrompt,
    },
    () => {
      const status = document.getElementById("status");
      status.textContent = "Options saved successfully!";
      status.style.display = "block";
      setTimeout(() => {
        status.textContent = "";
        status.style.display = "none";
      }, 2500);
    },
  );
});
