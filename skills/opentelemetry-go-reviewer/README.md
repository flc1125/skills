# opentelemetry-go-reviewer

Local skill for Codex that performs maintainer-grade review of changes in `open-telemetry/opentelemetry-go`.

## Install

```bash
npx skills add https://github.com/flc1125/skills --skill opentelemetry-go-reviewer
```

## Purpose

Use this skill when reviewing a diff, pull request, patch, commit range, or design proposal for `open-telemetry/opentelemetry-go`.

It is tuned for high-bar review of:

- correctness and edge cases
- API and compatibility risk
- lifecycle and concurrency behavior
- generated code and template alignment
- performance-sensitive changes
- changelog, versioning, and repository-rule compliance

## What This Skill Adds

- a merge-gating review workflow for `opentelemetry-go`
- an explicit severity and findings contract
- review lenses for subsystem integrity and API-contract scrutiny
- repository-specific emphasis on lifecycle, generated-source integrity, and evidence-backed performance claims

## Structure

```text
opentelemetry-go-reviewer/
├── SKILL.md
├── README.md
├── agents/
│   └── openai.yaml
└── references/
    ├── output-contract.md
    ├── profile-aegis.md
    ├── profile-sentinel.md
    └── review-core.md
```

## Notes

- The main workflow lives in [SKILL.md](SKILL.md).
- `references/review-core.md` defines the default review gates.
- `references/output-contract.md` defines severity and output structure.
- `references/profile-aegis.md` and `references/profile-sentinel.md` provide optional review lenses that should be loaded only when they match the diff.
