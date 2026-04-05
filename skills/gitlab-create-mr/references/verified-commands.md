# Verified `glab` Commands For Merge Request Creation

Checked on 2026-04-05 against:

- local `glab --help` output
- the existing repository skill conventions

Use this file when exact command names or key flags matter.

Host detection and decision rules live in `SKILL.md`. The default MR body conventions live in `references/mr-body-conventions.md` so the structure, example, and guidance can be updated independently.

## Context and authentication

- `glab auth login`
- `glab auth login --hostname <host>`
- `glab auth status`
- `glab auth status --hostname <host>`
- `glab auth status --all`

## Repository context

- `glab repo view`
- `glab repo view <group/repo>`

Common host-aware patterns:

```bash
glab repo view
GITLAB_HOST=<host> glab repo view
glab repo view <group/repo>
GITLAB_HOST=<host> glab repo view <group/repo>
```

## Merge requests

- `glab mr create`
- `glab mr list`
- `glab mr update [<id> | <branch>]`
- `glab mr view <iid>`

Checked branch-scoped listing:

- `glab mr list --source-branch <branch>`

Checked `glab mr create` flags:

- `-t, --title`
- `-d, --description`
- `-b, --target-branch`
- `-s, --source-branch`
- `-R, --repo`
- `-f, --fill`
- `--fill-commit-body`
- `--draft`
- `-w, --web`
- `-y, --yes`

Checked `glab mr update` flags:

- `-t, --title`
- `-d, --description`
- `--target-branch`
- `--draft`
- `-r, --ready`
- `-R, --repo`
- `-f, --fill`
- `--fill-commit-body`
- `-y, --yes`

Checked examples:

```bash
glab mr create --fill --yes
glab mr create --title "feat(api): add token refresh" --description "..." --target-branch main --source-branch feature/token-refresh --yes
glab mr create --draft --title "wip: replace legacy auth" --description "..." --target-branch main --source-branch auth-refactor --yes
GITLAB_HOST=gitlab.example.com glab mr create -R group/project --title "fix(ui): handle null state" --description "..." --target-branch main --source-branch fix/null-state --yes
glab mr update 23 --title "fix(ui): handle null state" --description "..." --yes
GITLAB_HOST=gitlab.example.com glab mr update 23 -R group/project --title "fix(ui): handle null state" --description "..." --yes
```
