# Meme Summary for LinkedIn

A Chrome extension that turns the LinkedIn feed into a meme by summarizing each post into its honest subtext — with one quiet button.

## Vision

Turn the LinkedIn feed into a meme by summarizing each post into its honest subtext. "If this post were honest and short, what is it really saying?"

## Features

- **Summarize Button:** Injects a subtle, native-looking "Summarize" button to the top right of LinkedIn posts.
- **AI-Powered:** Uses Google Gemini (gemini-3-pro-preview) to analyze the post and generate a dry, observational, meme-style summary that captures the underlying social intent or subtext of the post.
- **Smart Filtering:** Automatically ignores Sponsored posts, Ads, Jobs, and Polls.
- **Clean UI:** Replaces the text of the post with the generated summary, making it feel like unintentional satire instead of an overlaid app.
- **Efficient:** Caches summaries for the active session to prevent redundant API calls on the same post.

## Quick Start

1. **Get an API Key:** Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/).
2. **Install:** Go to `chrome://extensions/`, enable **Developer mode**, click **Load unpacked**, and select this folder.
3. **Configure:** The options page will open automatically. Paste your API key and click **Save**.
4. **Use:** Refresh your [LinkedIn Feed](https://www.linkedin.com/feed/) and click "Summarize" on any post.

## How to Use

1. Navigate to your [LinkedIn Feed](https://www.linkedin.com/feed/).
2. You will see a "Summarize" button next to the three-dot menu on valid posts.
3. Click the button to replace the post's text with its honest subtext. Let the hilarity ensue.
