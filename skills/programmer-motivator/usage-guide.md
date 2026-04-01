# Programmer Motivator Usage Guide

This guide explains how to use `programmer-motivator` in practice.

## What This Skill Is For

Use this skill when you want encouragement that stays grounded in programming reality.

Good use cases:

- you are stuck on a bug and getting frustrated
- you are tired and want a small push, not a lecture
- you are doubting yourself after a mistake
- you want someone to stay steady with you while debugging
- you just solved something difficult and want real recognition
- you want a short reflection after a rough session

This skill is not meant to replace:

- technical problem solving
- code review
- therapy or emotional crisis support
- general companionship

## How To Invoke It

You can invoke it explicitly by naming the skill:

```text
$programmer-motivator I'm getting irritated by this bug.
```

You can also trigger it through clear intent, for example:

```text
Encourage me a little. I'm stuck and getting annoyed.
```

```text
Stay with me on this. I want calm support while I debug.
```

```text
I fixed it. Celebrate this one with me, but keep it grounded.
```

## First-Run Experience

On first use, if no local state exists yet, the skill should guide the user through a lightweight setup.

Typical first-run questions:

- what should I call you
- what kind of encouragement works best for you
- what kind of phrasing do you dislike
- may I store long-term preferences locally
- may I suggest small memories to save when they look useful

The setup should be:

- short
- skippable
- usable with defaults
- adjustable later

## Common Ways To Use It

### 1. Ask For Calm Encouragement

```text
I'm getting tilted by this bug. Keep me grounded.
```

Expected behavior:

- catch frustration
- avoid hype
- give steady support

### 2. Ask For A Small Restart

```text
I'm tired and I don't want to touch this anymore. Help me restart.
```

Expected behavior:

- acknowledge fatigue
- avoid pressure
- suggest one small action

### 3. Ask For Companion Mode

```text
Stay with me while I debug this. I don't want a speech.
```

Expected behavior:

- keep responses steady and short
- acknowledge progress
- help with the next small step when useful

### 4. Ask For Recognition

```text
I finally found the root cause. Give me a proper reaction.
```

Expected behavior:

- recognize the concrete win
- explain why it matters
- avoid exaggerated praise

### 5. Ask For Reflection

```text
That session went badly. Help me reflect without turning it into self-blame.
```

Expected behavior:

- separate the session from the self
- identify useful takeaways
- keep the tone respectful

## Personalization Commands

The user should be able to set preferences in plain language.

Examples:

```text
Call me Alex from now on.
```

```text
Keep the tone calm and plain.
```

```text
Don't use hypey phrases with me.
```

```text
I respond better when you give me one small next step.
```

Expected behavior:

- update local state if persistence is enabled
- confirm the change clearly
- avoid making the user repeat the same preference later

## Memory Commands

Memory should stay explicit and controllable.

Examples:

```text
Remember that I don't like generic praise.
```

```text
Remember that short encouragement works better for me.
```

```text
Show me what you remember about my preferences.
```

```text
Forget that last memory.
```

```text
Reset all motivator memory.
```

Expected behavior:

- show stored memory when asked
- allow edits and deletion
- avoid hidden memory accumulation

## Suggested Memory

If suggestion-based memory is enabled, the skill may propose a memory instead of saving it automatically.

Example:

```text
You seem to prefer direct, low-hype support. Do you want me to remember that?
```

This is the preferred v1 behavior for implicit memory because it stays visible and reversible.

## Tone Control

The user should be able to steer tone at any time.

Examples:

```text
Be warmer.
```

```text
Be more direct.
```

```text
Keep it short.
```

```text
Don't sound like a motivational speaker.
```

Tone changes should be respected immediately, and persisted only if the user wants that.

## What Good Output Looks Like

Good output should:

- sound grounded rather than theatrical
- recognize the actual technical situation
- protect the user's dignity
- stay brief unless more is needed
- help the user move again when movement is possible

## What Bad Output Looks Like

Bad output usually has one of these problems:

- generic praise with no connection to the situation
- too much hype
- lecturing tone
- accidental profiling
- too much text when the user wants one short response

## Recommended User Prompts

Useful prompt patterns include:

```text
Encourage me, but keep it calm.
```

```text
I'm spiraling a bit. Help me get back to one small next step.
```

```text
Celebrate this with me, but don't make it cheesy.
```

```text
Remember that I prefer plain, direct support.
```

```text
Show me my programmer-motivator settings.
```
