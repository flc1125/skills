# Verified `glab` Commands

Checked on 2026-03-31 against:

- GitLab Docs pages under `https://docs.gitlab.com/cli/`
- local `glab 1.90.0` `--help` output

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

- `https://docs.gitlab.com/cli/auth/login/`
- `https://docs.gitlab.com/cli/auth/status/`

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

Docs:

- `https://docs.gitlab.com/cli/repo/view/`
- `https://docs.gitlab.com/cli/repo/clone/`

## Merge request commands

- `glab mr create`
- `glab mr list`
- `glab mr view <iid>`
- `glab mr diff [<id> | <branch>]`
- `glab mr checkout <iid>`
- `glab mr note [<id> | <branch>]`
- `glab mr update [<id> | <branch>]`
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

Checked `diff` flags:

- `--color`
- `--raw`
- `-R, --repo`

Checked `note` flags:

- `-m, --message`
- `--unique`
- `-R, --repo`

Checked `update` flags:

- `-t, --title`
- `-d, --description`
- `-l, --label`
- `-u, --unlabel`
- `-a, --assignee`
- `--reviewer`
- `--draft`
- `-r, --ready`
- `--target-branch`
- `-R, --repo`
- `-y, --yes`

Doc pages:

- `https://docs.gitlab.com/cli/mr/create/`
- `https://docs.gitlab.com/cli/mr/diff/`
- `https://docs.gitlab.com/cli/mr/note/`
- `https://docs.gitlab.com/cli/mr/update/`

## Issue commands

- `glab issue list`
- `glab issue view <iid>`
- `glab issue create`
- `glab issue note <issue-id>`
- `glab issue update <id>`

Checked `create` flags:

- `-t, --title`
- `-d, --description`
- `-l, --label`
- `-a, --assignee`
- `-R, --repo`
- `--linked-mr`
- `--web`
- `-y, --yes`

Checked `note` flags:

- `-m, --message`
- `-R, --repo`

Checked `update` flags:

- `-t, --title`
- `-d, --description`
- `-l, --label`
- `-u, --unlabel`
- `-a, --assignee`
- `-m, --milestone`
- `--due-date`
- `-c, --confidential`
- `-p, --public`
- `-R, --repo`
- `-w, --weight`

Doc pages:

- `https://docs.gitlab.com/cli/issue/`
- `https://docs.gitlab.com/cli/issue/create/`
- `https://docs.gitlab.com/cli/issue/note/`
- `https://docs.gitlab.com/cli/issue/update/`

## CI/CD commands

- `glab ci list`
- `glab ci get`
- `glab ci run`
- `glab ci status`
- `glab ci trace <job-id|job-name>`
- `glab ci view [branch/tag]`

Confirmed behavior:

- `glab ci get` and `glab ci view` both exist in `glab 1.90.0`; neither appears deprecated in current help or docs.
- Keep `glab ci view` in the quick command set for interactive inspection, and keep `glab ci get` as the lower-level JSON-oriented variant.

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
- `--form`
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
