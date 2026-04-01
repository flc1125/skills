# First-Run Setup

Use this file when the skill needs exact first-run setup behavior or copy.

## Setup Goals

The first-run setup should:

- make the skill immediately usable
- capture only the minimum useful personalization
- explain local persistence in plain language
- let the user skip anything non-essential
- avoid turning setup into emotional profiling

Keep the flow to 4 to 6 questions.

Suggested order:

1. preferred form of address
2. preferred encouragement style
3. disliked phrasing
4. whether local preferences may be saved
5. whether suggestion-based memory is allowed

If the user skips everything, start with safe defaults.

## Opening Copy

Longer version:

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

## Questions

### 1. Preferred Address

```text
What would you like me to call you?
```

Optional helper text:

```text
Examples: Alex, captain, teammate, or just your first name.
```

If skipped:

```text
No problem. I'll keep it neutral for now.
```

### 2. Encouragement Style

```text
What kind of support works best for you when coding gets rough?
```

Optional helper text:

```text
Examples: calm, direct, warm, low-hype, short, or "give me one small next step."
```

If unsure:

```text
That's fine. I can start calm and grounded by default.
```

### 3. Disliked Phrasing

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

### 4. Local Preference Storage

```text
Do you want me to save your preferences locally so I don't have to relearn them next time?
```

Explanation:

```text
This stays in your local config under ~/.config/flc1125/skills/programmer-motivator/
You can inspect, change, or delete it later.
```

If the user says no:

```text
Understood. I'll use your preferences only in the current session.
```

### 5. Suggestion-Based Memory

```text
If I notice a small low-risk preference that seems useful, do you want me to ask whether I should remember it?
```

Explanation:

```text
I won't save it automatically. I'll ask first.
```

If the user says no:

```text
Understood. I will only remember things when you ask me to.
```

## Completion Copy

Longer version:

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

## Defaults

If the user skips setup entirely, use:

- neutral address
- calm tone
- low-hype support
- short-to-medium response length
- no automatic persistence unless explicitly allowed
- no suggestion-based memory unless explicitly allowed

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
- frame memory as broad personal knowledge
- make persistence feel irreversible
