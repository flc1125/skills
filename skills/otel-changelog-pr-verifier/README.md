# otel-changelog-pr-verifier

Local skill for checking whether changelog PR references match the actual GitHub pull requests in OpenTelemetry Go repositories.

## Install

```bash
npx skills add https://github.com/flc1125/skills --skill otel-changelog-pr-verifier
```

## Scope

- review a release PR that updates `CHANGELOG.md`
- extract the target release section and collect referenced `#NNNN` values
- verify each referenced PR against GitHub metadata
- report only incorrect or suspicious changelog entries
- support repository-specific execution anchored to a concrete PR

## Structure

```text
otel-changelog-pr-verifier/
├── SKILL.md
├── README.md
├── agents/
│   └── openai.yaml
└── references/
    └── workflow.md
```

## Notes

This skill assumes the task is already anchored to a specific repository and PR, usually from a PR number or PR URL provided by the user. It prefers the current repository by default and falls back to explicit `gh -R <owner/repo>` usage only when repository context is ambiguous.
