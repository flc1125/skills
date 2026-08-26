---
name: eli5
description: Create a dead-simple visual explanation of a topic as a self-contained HTML artifact. Use when the user says ELI5, asks to explain something like they are five, or wants a picture-first explanation with very few words; do not use for ordinary concise explanations that do not ask for this format.
metadata:
  name: ELI5
  description: Turn a topic into a picture-first HTML explainer for someone with no prior knowledge.
  author: Flc
  created: 2026-08-26T01:45:03Z
---

# ELI5

Explain the topic from the user's request as if the reader knows nothing about it.

Create one self-contained HTML artifact with big visuals and very few words. Prefer a simple diagram, pictograms, arrows, labels, and one concrete example over paragraphs of explanation.

## Outcome

The reader should be able to glance at the artifact and understand:

- what the thing is
- how its main parts or steps relate
- one useful mental model or everyday analogy
- the single most important takeaway

## Rules

- Use plain, respectful language. Simplify the topic, not the reader.
- Lead with the visual explanation; keep supporting text short.
- Focus on one core idea. Omit secondary details unless they prevent a false understanding.
- Use familiar examples and define unavoidable technical terms in place.
- Keep analogies accurate. Briefly label where an analogy stops matching reality when that boundary matters.
- Prefer meaningful CSS shapes, inline SVG, emoji, or simple icons that render without external assets.
- Make the artifact responsive, readable, and accessible with semantic HTML, sufficient contrast, and useful text alternatives.
- Keep everything in one HTML file with embedded CSS and JavaScript. Do not require packages, a build step, or network access.
- Do not ask follow-up questions when the topic is already clear. If it is broad, choose the smallest useful mental model and state that scope in the artifact.
- If the user explicitly requests another output medium, keep the same picture-first, few-words teaching style in that medium.

## Suggested Shape

Use only the sections the topic needs:

1. a short title and one-line meaning
2. a large visual showing the core relationship or flow
3. one everyday example
4. a one-sentence recap

Do not turn the artifact into a textbook page, slide deck, or dense dashboard.
