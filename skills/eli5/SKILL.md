---
name: eli5
description: Create a simple, picture-first explanation of a topic, defaulting to self-contained HTML. Use when the user says ELI5, asks to explain something like they are five, or wants a visual explanation with very few words; do not use for ordinary concise explanations that do not ask for this style.
metadata:
  name: ELI5
  description: Turn a topic into a picture-first HTML explainer for someone with no prior knowledge.
  author: Flc
  created: 2026-08-26T01:45:03Z
---

# ELI5

Explain the topic from the user's request as if the reader knows nothing about it.

By default, create one self-contained HTML artifact with big visuals and very few words. Prefer a simple diagram, pictograms, arrows, labels, and one concrete example over paragraphs of explanation. If the user requests another medium, honor it and adapt the explanation to what that medium supports.

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
- When using an analogy, explicitly connect its familiar objects or actions to the real concepts. Briefly label where the analogy stops matching reality when that boundary matters.
- Do not ask follow-up questions when the topic is already clear. If it is broad, choose the smallest useful mental model and state that scope in the artifact.

## Visual Decisions

- Choose the visual to match the idea: a flow for a process, a side-by-side view for a comparison, or a labeled structure for parts and their relationships.
- Make each arrow or connector explain a relationship or action. Icons and decoration alone do not explain how something works.
- Keep branches or exceptions that change the core explanation. For example, a cache diagram should distinguish a hit that returns stored data from a miss that fetches it from the source.
- Add interaction only when changing a value, switching a state, or stepping through a process helps the reader understand cause and effect. Keep the main takeaway visible without interaction.

## HTML Delivery

Apply these requirements when producing HTML:

- Keep everything in one HTML file with embedded CSS and JavaScript only when needed. Do not require packages, a build step, or network access to view it.
- Prefer meaningful CSS shapes, inline SVG, emoji, or simple icons that render without external assets.
- Make the artifact responsive, readable, and accessible with semantic HTML, sufficient contrast, and text alternatives that convey the diagram's meaning. Any interactive controls must work with a keyboard.
- When file output is available, save the HTML and provide a link or attachment the user can open. Otherwise, return the complete HTML in one code block.
- When preview tools are available, inspect the rendered result at wide and narrow widths for clipped text, overlapping elements, and unreadable labels. Exercise any controls and fix observed problems before delivery. If preview is unavailable, say that the result was not visually verified.

## Suggested Shape

Use only the sections the topic needs:

1. a short title and one-line meaning
2. a large visual showing the core relationship or flow
3. one everyday example
4. a one-sentence recap

Keep the explanation compact; avoid textbook-length prose or a dense dashboard. Use slides only when the user requests that medium.

## Final Check

Before delivery, check that the explanation answers the user's actual question, the visual communicates the core relationship, and the example and recap agree with it. Remove decorative elements or steps that do not help understanding. Check that simplification has not introduced a false causal claim or hidden a condition essential to the takeaway.
