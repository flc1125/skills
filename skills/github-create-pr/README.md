# github-create-pr

Local Codex skill for preparing and creating GitHub pull requests.

## Scope

- Check branch status and PR base
- Analyze commits and diff
- Draft a clear PR title and body
- Create or update a PR with `gh`
- Add reviewers when needed

## Structure

```text
github-create-pr/
├── SKILL.md
├── README.md
└── agents/
    └── openai.yaml
```

## Source Attribution

This skill is a localized adaptation of the following upstream skill:

- Source: `getsentry/skills`
- Upstream path: `plugins/sentry-skills/skills/pr-writer/SKILL.md`
- URL: <https://github.com/getsentry/skills/blob/main/plugins/sentry-skills/skills/pr-writer/SKILL.md>

## Notes

This version is not a verbatim copy of the upstream content. It was rewritten to match this repository's local skill conventions:

- The skill name was changed to `github-create-pr`
- Sentry-specific language was generalized into a GitHub PR workflow
- The output structure and metadata were adapted to the local Codex skill format
