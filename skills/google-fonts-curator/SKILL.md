---
name: google-fonts-curator
description: Recommend high-taste Google Fonts for websites based on brand tone, page type, and visual direction. Use when the user needs font selection, font pairing, or aesthetic judgment within the Google Fonts ecosystem for landing pages, brand sites, editorial pages, portfolios, or digital products.
metadata:
  name: Google Fonts Curator
  description: Curate tasteful Google Fonts pairings for the web with strong aesthetic judgment and practical restraint.
  author: Flc
  created: 2026-03-28T14:22:59Z
---

# Google Fonts Curator

Recommend Google Fonts with strong aesthetic judgment for web use.

This skill is not a general web design skill. It does not own layout, color, spacing, or frontend implementation unless the user asks for a minimal handoff. Its job is to translate a design intention into a strong Google Fonts direction.

## Operating Mode

- Use this skill when the user asks for Google Fonts recommendations, font pairing, typography taste, or a better font direction for a website.
- Accept both English and Chinese aesthetic briefs. Translate vague language into concrete typographic intent before recommending fonts.
- Keep the recommendation constrained to the Google Fonts ecosystem unless the user explicitly asks for non-Google alternatives.
- Prioritize taste, restraint, and fit over popularity.
- Recommend a small number of strong options. Curated judgment is better than exhaustive lists.
- Treat "high-end", "editorial", "luxury", "modern", "minimal", "cultural", "tech", "fashion", and similar words as signals to interpret, not labels to mirror back blindly.
- If the user's requested aesthetic conflicts with web readability or with the Google Fonts constraint, say so directly and offer the best compromise inside Google Fonts.
- Do not treat support for Chinese prompts as proof that a Latin-only recommendation is valid for Chinese or mixed-script websites.

## Resource Map

Read only the files you need:

- Aesthetic language and evaluation axes: [references/aesthetic-axes.md](references/aesthetic-axes.md)
- Curated pairings and single-family systems: [references/pairings.md](references/pairings.md)
- Common failure modes and cheap-looking choices: [references/anti-patterns.md](references/anti-patterns.md)
- Page-type adjustments: [references/page-types.md](references/page-types.md)
- Script and language coverage rules: [references/script-and-language-coverage.md](references/script-and-language-coverage.md)
- Usage rules for weights, readability, and single-family decisions: [references/usage-rules.md](references/usage-rules.md)
- Bilingual calibration examples: [references/example-prompts-and-outputs.md](references/example-prompts-and-outputs.md)

## Workflow

Follow this sequence unless the user asks for only one part.

### 1. Decode the brief

Extract:

- page type
- target audience
- brand tone or emotional direction
- script and language context: `Latin-only`, `CJK`, or `mixed-script`
- whether the page needs editorial presence, product clarity, luxury, cultural depth, softness, technical precision, or other signals
- whether the font system is for hero-heavy marketing, long-form reading, brand storytelling, portfolio presentation, or a more functional product surface
- whether body copy is short-form, medium-form, or long-form
- whether the user already has candidate fonts or references

If the user gives vague taste words such as "高级" or "有设计感", translate them into clearer typographic axes before recommending fonts.
If the script or language context is unclear and it materially affects the answer, clarify it or state the assumption explicitly.

### 2. Choose a typographic strategy

Pick one primary strategy:

- `serif + sans`: for editorial, luxury, cultural, boutique, or brand-heavy work
- `display serif + neutral sans`: for strong hero presence with controlled body copy
- `single sans family`: for product, portfolio, or minimal systems that want cohesion
- `expressive sans + restrained sans`: for modern, graphic, or fashion-leaning work without serif
- `single serif family`: rare; only when the page is intentionally literary, cultural, or publication-led

Do not mix styles without a clear role split.

### 3. Evaluate taste before recommending

Check each candidate against these questions:

- Does it match the brand tone, or is it only superficially stylish?
- Does it feel overused, template-like, or default?
- Is the title font expressive in a controlled way, or merely decorative?
- Is the body font durable enough for real web use?
- Does the pairing create contrast without conflict?
- Does the result feel premium, current, and intentional inside the limits of Google Fonts?

Reject pairings that feel loud, sentimental, gimmicky, or fake-luxury unless the user explicitly wants that effect.
Reject answers that ignore script coverage, reading behavior, or body-text durability when those factors matter to the page.

### 4. Recommend a small set of options

Default to two or three options:

- one lead recommendation
- one credible alternative
- one contrastive alternative only if the brief has ambiguity

For each option, specify:

- heading font
- body font
- optional accent or utility font only if justified
- aesthetic read
- why it works for this brief
- risk or tradeoff

### 5. Critique existing choices when relevant

If the user already has fonts, assess them directly.

Focus on:

- what feels generic
- what feels mismatched
- what feels dated
- what feels over-designed
- what can be improved while staying inside Google Fonts

Do not soften clear aesthetic criticism into vague politeness.

### 6. Keep implementation lightweight by default

This skill is about selection and judgment, not implementation. If the user asks for implementation, provide only a minimal handoff:

- the exact Google Fonts names
- the intended role of each font
- any weight guidance that matters to the recommendation
- any subset, script, or language coverage note that materially affects implementation

Do not expand into full design systems unless asked.

## Output Structure

Use this structure by default:

```markdown
# Font Direction

## Aesthetic Read
- <brief interpretation of the user's taste goal>

## Recommended Direction
- Heading: <font name>
- Body: <font name>
- Why it works: <concise rationale>
- Risk: <what to watch>

## Alternative
- Heading: <font name>
- Body: <font name>
- Why it works: <concise rationale>
- Risk: <what to watch>

## Avoid
- <common Google Fonts choices that would weaken this brief, with a short reason>
```

If the user wants critique of an existing set, add:

```markdown
## Critique of Current Choice
- <what works>
- <what feels off>
- <what to replace>
```

## Decision Rules

- Prefer fewer, stronger suggestions over broad font dumps.
- Prefer pairings with role clarity: a font should know whether it is there for voice or for utility.
- Avoid recommending a trendy font merely because it is less common.
- Do not confuse ornament, nostalgia, or fragility with sophistication.
- When a safe font is the right answer, defend it with reasoning rather than apologizing for it.
- When no perfect Google Fonts answer exists, state that the recommendation is the best web-practical option within the constraint.
- When the page is Chinese or mixed-script, distinguish Latin voice from CJK readability instead of pretending one Latin pairing solves the whole system.
- Include at least minimal guidance on weights or reading suitability when body text is substantial.

## Red Flags

Pause and reassess if:

- the user is really asking for full visual direction rather than fonts
- the requested mood is contradictory
- the page type and reading behavior are unclear
- the script or language context is unclear
- the user wants a premium fashion or luxury outcome that Google Fonts can only approximate
- the user asks for too many fonts in one page system
