Extension Spec — Meme Summary for LinkedIn

# Vision

Turn the LinkedIn feed into a meme by summarizing each post into its honest subtext — with one quiet button.

# Platform

1. LinkedIn
2. Desktop web
3. Home feed only

# Core interaction (locked)

## UI

1. Add one button to the right side of each post card
2. Button label (exact): "Summarize". No emojis. No sarcasm in the label. It should look boring.
3. On click, a small box appears inside the post card, below the content
4. The box contains:
   A fun, dry, meme-style summary
   A subtle label on top: AI-generated summary (HONEST).
5. No animations. No popups. No overlays.

## What the “summary” actually is:

1. Not a literal summary.
2. It’s a social-intent summary.

Think:

1. “If this post were honest and short, what is it really saying?”

Tone rules (non-negotiable)

1. Dry
2. Flat
3. Calm
4. Slightly bored
5. Observational

Never:

1. Insult the author
2. Use emojis
3. Use slang
4. Sound angry or political
5. Add facts

Always:

1. Reduce to intent
2. Remove hype
3. Make the subtext explicit

Examples (gold standard)

1.  Original: Most people won’t tell you this, but consistency is everything.

Summary: A common piece of advice framed as rare insight to attract attention.

2.  Original: Today I had to make one of the hardest decisions of my career.

Summary: A vent about a difficult decision.

3.  Original: After mentoring dozens of founders, one thing is clear…

Summary: A personal experience used to establish authority before giving general advice.

4.  Original: I didn’t want to post this, but after so many messages…

Summary: A planned update framed as reluctant to increase credibility.

If it reads like a meme caption in your head — it’s right.

Prompt spec (final)
Summarize the following LinkedIn post into a short, dry, humorous description
that captures the underlying social intent or subtext.

Rules:

- 1–2 sentences max.
- Calm, neutral tone.
- No emojis, slang, or insults.
- Do not add new facts.
- Humor should come from clarity, not mockery.

Post:
{{POST_TEXT}}

This prompt is intentionally boring. That’s why it works.

Post eligibility

Include:

Text posts

Story-style posts

Announcements

Leadership / growth / layoff posts

Exclude:

Ads

Job listings

Polls

Posts under ~150–200 characters

Technical behavior (brief)

Content script:

Detect post cards

Inject Summarize button on the right

On click:

Extract post text

Call background worker

Render summary inline

Cache by post hash

One summary per post per session

If anything fails → do nothing. Silence > jank.

Why this works so well

“Summarize” sounds harmless

The humor is a surprise

It doesn’t attack — it reveals

It trains users to see patterns

The feed becomes unintentionally funny

People won’t say:

“This is an AI tool”

They’ll say:

“LinkedIn is hilarious now.”
