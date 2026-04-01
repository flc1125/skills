# Programmer Motivator First-Run Setup

This document defines the recommended first-run setup flow for `programmer-motivator`.

The setup should be short, clear, and optional enough that it does not feel like a form.

## Setup Goals

The first-run setup should:

- make the skill immediately usable
- capture only the minimum needed personalization
- explain local persistence in plain language
- let the user skip anything non-essential
- avoid turning setup into emotional profiling

## Recommended Setup Flow

Keep the flow to 4 to 6 questions.

Suggested order:

1. preferred form of address
2. preferred encouragement style
3. disliked phrasing
4. whether local preferences may be saved
5. whether suggestion-based memory is allowed

If the user skips everything, the skill should still start with safe defaults.

## Opening Message

Recommended opening copy:

```text
I can support you as a programmer motivator and keep that support grounded in how you actually like to be encouraged.

I can remember a small amount of local preference data, such as how to address you and what kind of tone works best for you.

Setup is short, and you can skip anything or change it later.
```

Shorter version:

```text
I can personalize how I support you while you code.
I only need a few quick preferences, and you can skip or change them later.
```

## Question 1: Preferred Address

Recommended prompt:

```text
What would you like me to call you?
```

Optional helper text:

```text
Examples: Alex, captain, teammate, or just your first name.
```

If skipped, default behavior:

```text
No problem. I'll keep it neutral for now.
```

## Question 2: Encouragement Style

Recommended prompt:

```text
What kind of support works best for you when coding gets rough?
```

Optional helper text:

```text
Examples: calm, direct, warm, low-hype, short, or "give me one small next step."
```

If the user is unsure:

```text
That's fine. I can start calm and grounded by default.
```

## Question 3: Disliked Phrasing

Recommended prompt:

```text
Is there any kind of wording you want me to avoid?
```

Optional helper text:

```text
Examples: hype, generic praise, lecturing, cheesy lines, or too much empathy language.
```

If skipped:

```text
Okay. If anything I say feels off later, you can correct it once and I'll adjust.
```

## Question 4: Local Preference Storage

Recommended prompt:

```text
Do you want me to save your preferences locally so I don't have to relearn them next time?
```

Recommended explanation:

```text
This stays in your local config under ~/.config/flc1125/skills/programmer-motivator/
You can inspect, change, or delete it later.
```

If the user says no:

```text
Understood. I'll use your preferences only in the current session.
```

## Question 5: Suggestion-Based Memory

Recommended prompt:

```text
If I notice a small low-risk preference that seems useful, do you want me to ask whether I should remember it?
```

Recommended explanation:

```text
I won't save it automatically. I'll ask first.
```

If the user says no:

```text
Understood. I will only remember things when you ask me to.
```

## Setup Completion Message

Recommended completion copy:

```text
Setup is done.
I'll keep the support grounded, avoid empty motivation, and adapt to the preferences you gave me.
You can update or reset any of this later.
```

Shorter version:

```text
All set.
I'll keep it grounded and you can change any preference later.
```

## Default Values

If the user skips setup entirely, recommended defaults are:

- neutral address
- calm tone
- low-hype support
- short-to-medium response length
- no automatic persistence unless explicitly allowed
- no suggestion-based memory unless explicitly allowed

## Follow-Up Editing Copy

Recommended later-edit prompts:

```text
Call me Alex from now on.
```

```text
Keep the tone more direct.
```

```text
Don't use that kind of praise with me.
```

```text
Show me my motivator settings.
```

```text
Reset my motivator preferences.
```

## Copy Rules

The setup copy should:

- sound plain and respectful
- avoid sounding like a personality quiz
- avoid emotional overreach
- avoid hype
- make storage behavior explicit

The setup copy should not:

- imply therapy or emotional diagnosis
- pressure the user to share personal information
- frame memory as "I want to know everything about you"
- make persistence feel irreversible

## Anti-Patterns

Avoid copy like:

```text
Let's build your perfect emotional support persona together.
```

Why it fails:

- too grand
- emotionally loaded
- wrong product framing

Avoid copy like:

```text
Tell me your deepest triggers so I can motivate you properly.
```

Why it fails:

- invasive
- too personal
- inconsistent with a low-risk v1 design

Avoid copy like:

```text
I will learn your personality over time.
```

Why it fails:

- too broad
- sounds like profiling
- weakens user trust
