# code-review

Local skill for requesting or performing a focused code review on a defined change set.

## Install

```bash
npx skills add https://github.com/flc1125/skills --skill code-review
```

## Scope

- define a review range with git SHAs
- summarize implementation and requirements for the reviewer
- dispatch a reviewer when available, or review directly in-session
- report findings by severity before proceeding

## Structure

```text
code-review/
├── SKILL.md
├── README.md
├── references/
│   └── reviewer-guide.md
└── agents/
    └── openai.yaml
```

## Notes

This port keeps the upstream intent of reviewing small, explicit change sets early and often, but removes platform-specific dependency on `superpowers:code-reviewer`. In this repository, the skill can be used with a local reviewer/subagent if one exists, or directly by the current agent using the same review brief and severity-based output.

## Source Attribution

This skill is a localized adaptation of third-party source material:

- Author/Repository: `obra/superpowers`
- Upstream path: `skills/requesting-code-review/SKILL.md`
- URL: <https://github.com/obra/superpowers/blob/main/skills/requesting-code-review/SKILL.md>
- Upstream path: `skills/requesting-code-review/code-reviewer.md`
- URL: <https://github.com/obra/superpowers/blob/main/skills/requesting-code-review/code-reviewer.md>
