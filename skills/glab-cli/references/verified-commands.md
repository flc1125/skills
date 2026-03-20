# Verified `glab` Commands

Checked on 2026-03-20 against:

- GitLab Docs pages under `https://docs.gitlab.com/cli/`
- local `glab 1.89.0` `--help` output

Use this file when you need exact command names or flag spelling.

Host handling for this skill is intentionally described inline in `SKILL.md` with lightweight `git remote -v` rules, not with a required helper script, so the skill stays usable on minimal environments.

## Context and authentication

- `glab auth login`
- `glab auth login --hostname <host>`
- `glab auth login --stdin < token.txt`
- `glab auth status`
- `glab auth status --hostname <host>`
- `glab auth status --all`

Confirmed behavior:

- `glab auth login` can detect GitLab instances from Git remotes in interactive mode.
- `glab auth status` checks the instance from current context by default: `git remote`, `GITLAB_HOST`, or config.

Docs:

- `https://docs.gitlab.com/editor_extensions/gitlab_cli/`
- `https://docs.gitlab.com/cli/`

## Repository commands

- `glab repo view [repository]`
- `glab repo clone [<repo> | -g <group>] [<dir>] [-- <gitflags>...]`

Checked examples:

```bash
glab repo view
glab repo view group/namespace/repo
glab repo clone gitlab-org/cli
GITLAB_HOST=salsa.debian.org glab repo clone myrepo
```

## Merge request commands

- `glab mr create`
- `glab mr list`
- `glab mr view <iid>`
- `glab mr checkout <iid>`
- `glab mr merge <iid>`

Checked `create` flags:

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

Doc page:

- `https://docs.gitlab.com/cli/mr/create/`

## Issue commands

- `glab issue list`
- `glab issue view <iid>`
- `glab issue create`

Checked `create` flags:

- `-t, --title`
- `-d, --description`
- `-l, --label`
- `-a, --assignee`
- `-R, --repo`
- `--linked-mr`
- `--web`
- `-y, --yes`

Doc pages:

- `https://docs.gitlab.com/cli/issue/`
- `https://docs.gitlab.com/cli/issue/create/`

## CI/CD commands

- `glab ci list`
- `glab ci get`
- `glab ci run`
- `glab ci status`
- `glab ci trace <job-id|job-name>`
- `glab ci view [branch/tag]`

Doc page:

- `https://docs.gitlab.com/cli/ci/`

## Release commands

- `glab release create <tag> [<files>...]`
- `glab release view <tag>`

Checked `create` flags:

- `-N, --notes`
- `-F, --notes-file`
- `-r, --ref`
- `-D, --released-at`
- `-R, --repo`
- `-a, --assets-links`

Doc page:

- `https://docs.gitlab.com/cli/release/create/`

## API commands

- `glab api <endpoint>`
- `glab api graphql`

Checked flags:

- `--hostname`
- `-X, --method`
- `-F, --field`
- `-f, --raw-field`
- `-H, --header`
- `--paginate`
- `--input`
- `--output`
- `--silent`

Confirmed behavior:

- outside a Git repository, `glab api` defaults to `gitlab.com`
- inside a Git repository, it uses the authenticated host for the current directory
- placeholders include `:branch`, `:fullpath`, `:group`, `:id`, `:namespace`, `:repo`, `:user`, `:username`

Docs:

- `https://docs.gitlab.com/cli/api/`
- `https://docs.gitlab.com/api/`
- `https://docs.gitlab.com/api/graphql/`
