# Yuque Skill

`yuque` is a Codex skill for working with the Yuque OpenAPI.

It covers:

- user and group reads
- repo reads and safe repo writes
- doc reads and safe doc writes
- TOC reads and non-destructive TOC reorganization
- search, versions, and statistics
- guarded preflight flows for destructive actions

## Install

```bash
npx skills add https://github.com/flc1125/skills --skill yuque
```

## Structure

- `SKILL.md`: agent-facing workflow and execution rules
- `scripts/`: executable helpers for Yuque API operations
- `references/`: task-oriented API notes and data model guidance
- `docs/`: local OpenAPI source copy and auth documentation
- `.env.example`: local auth template

## Quick Start

1. Copy `skills/yuque/.env.example` to `skills/yuque/.env`
2. Fill in `YUQUE_TOKEN`
3. Run a script in preview mode first
4. Add `--execute` only when the target and action are correct

Example:

```bash
cp skills/yuque/.env.example skills/yuque/.env
node skills/yuque/scripts/read-repo.mjs --group-login your-team --book-slug handbook
node skills/yuque/scripts/read-repo.mjs --group-login your-team --book-slug handbook --execute
```

## Auth

- Header: `X-Auth-Token`
- Local auth guide: [docs/auth.md](docs/auth.md)
- OpenAPI source: [docs/yuque_openapi_20251121_green.yaml](docs/yuque_openapi_20251121_green.yaml)

## Safety Model

- Read operations are allowed by default
- Safe writes are supported when the target is explicit
- Destructive actions use preflight scripts instead of direct execution

Examples of guarded actions:

- delete doc
- delete repo
- remove TOC node
- remove group member

## Notes

- Prefer readable repo paths such as `group_login + book_slug`
- Read TOC before any TOC write
- Prefer `markdown` unless the user explicitly needs another format
