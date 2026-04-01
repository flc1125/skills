# Programmer Motivator

`programmer-motivator` is a skill for grounded emotional support in programming work.

## Install

```bash
npx skills add https://github.com/flc1125/skills --skill programmer-motivator
```

After installation, invoke it with:

```text
$programmer-motivator
```

It is designed for moments when a user is frustrated, discouraged, tired, self-critical after a mistake, pushing through a hard debugging session, celebrating a breakthrough, or recovering after a rough coding session.

The role is intentionally narrow:

- support emotional steadiness in a programming context
- protect the user's professional dignity
- restore momentum with at most one small next step when helpful
- avoid acting like a therapist, generic cheerleader, or broad companion persona

## Directory Layout

- [`SKILL.md`](./SKILL.md)
  - core skill definition, routing rules, and acceptance checklist
- [`agents/openai.yaml`](./agents/openai.yaml)
  - UI-facing metadata for skill lists and chips
- [`references/examples.md`](./references/examples.md)
  - tone calibration, positive examples, and boundary-case examples
- [`references/invocation-patterns.md`](./references/invocation-patterns.md)
  - likely user phrasing and trigger patterns
- [`references/onboarding.md`](./references/onboarding.md)
  - first-run setup flow and copy
- [`references/config-schema.md`](./references/config-schema.md)
  - local persistence schema and minimal runtime contract

## Start Here

If you are reviewing or updating the skill:

1. Read [`SKILL.md`](./SKILL.md) first.
2. Use [`references/examples.md`](./references/examples.md) to check tone and routing boundaries.
3. Use [`references/config-schema.md`](./references/config-schema.md) only when changing persistence behavior.

## Current Focus

The current design emphasizes:

- mixed-intent routing between emotional support and technical requests
- concise, non-cheesy responses
- explicit boundaries for memory and personalization
- acceptance criteria that are easy to validate through forward-testing
