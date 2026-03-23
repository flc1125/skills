# Engineering Backend Architect

This is a standalone skill for backend architecture design and review.

## Install

```bash
npx skills add https://github.com/flc1125/skills --skill engineering-backend-architect
```

It is intended for requests such as:

- designing a backend architecture for a new system
- reviewing an existing backend design
- defining service boundaries, APIs, and data models
- planning migrations, scaling, reliability, and security controls

## Files

- `SKILL.md`: Core skill instructions, workflow, output template, and decision rules
- `agents/openai.yaml`: Optional metadata for Codex/OpenAI-compatible tooling and UI integration

## What This Skill Does

The skill guides an agent or assistant to:

- frame backend requirements and assumptions
- choose an architecture shape with explicit tradeoffs
- define service or module boundaries
- design data models, storage, and communication patterns
- cover security, reliability, observability, and scale
- end with a delivery, rollout, and rollback plan

It intentionally prefers concrete tradeoffs over generic architecture slogans, and it defaults to the smallest architecture that satisfies the constraints.

## Notes

- This skill is written to operate independently. It does not require the original document to be usable.
- The core skill is tool-agnostic. Files such as `agents/openai.yaml` are additive support for specific ecosystems and are not required to use the skill.

## Source Attribution

This skill was created with reference to the following source material for licensing attribution and contributor credit:

- Author/Repository: `msitarzewski/agency-agents`
- Document: `engineering/engineering-backend-architect.md`
- URL: `https://github.com/msitarzewski/agency-agents/blob/main/engineering/engineering-backend-architect.md`
