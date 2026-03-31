---
name: glab-cli
description: GitLab CLI (`glab`) reference and workflow for repository, merge request, issue, CI/CD, release, and API operations across GitLab.com and self-managed or dedicated instances. Use when Codex needs to run or explain `glab` commands, usually by relying on the current `glab` context first, and only falling back to `git remote -v` or explicit host and repo arguments when the target platform or repository is unclear.
metadata:
  name: GLab CLI
  description: Use and explain GitLab CLI workflows across GitLab.com and self-managed instances with context-aware defaults.
  author: Flc゛
  created: 2026-03-20T03:23:59Z
---

# GLab CLI

Use `glab` with host-aware defaults instead of hardcoding `gitlab.com`.

## Workflow

Follow this order unless the user explicitly asks for a single command.

### 1. Let `glab` use the current context by default

Do not run host detection by default.

In a Git repository, prefer:

```bash
glab <command>
```

Only add `GITLAB_HOST`, `--hostname`, or `-R` when the task targets another repo or another instance, or when `glab` resolves the wrong context.

### 2. Detect the platform only when context is unclear or failing

Check `git remote -v` only when:

- `glab` resolves to the wrong instance
- auth checks fail against an unexpected host
- the repository has both GitHub and GitLab remotes
- multiple GitLab hosts are present
- the task targets a different instance than the current directory

Rules:

- Prefer a GitLab remote over any GitHub or Bitbucket remote.
- If the remote host is `gitlab.com`, treat the platform as `gitlab.com`.
- If the remote host is anything else, treat the platform as `self-managed-or-dedicated`.
- If multiple GitLab hosts appear in `git remote -v`, treat the result as ambiguous and confirm before any write operation.
- If `GITLAB_HOST` is already set, let it override the remote-derived host.

If `git remote -v` does not show a GitLab remote:

- check whether the user is in the intended repository
- ask for the GitLab host or repository URL only if the task is otherwise blocked
- avoid guessing `gitlab.com` for a private installation

If multiple GitLab hosts are present in `git remote -v`, do not silently pick one for write operations. Confirm the target or set `GITLAB_HOST` explicitly first.

### 3. Reuse explicit context only when needed

For repository-scoped commands, prefer one of these patterns:

```bash
glab <command>
GITLAB_HOST="$host" glab <command>
glab <command> -R "$repo"
GITLAB_HOST="$host" glab <command> -R "$repo"
```

Decision rules:

- If the current directory is already the target GitLab repository, keep using bare `glab` commands.
- If the command targets another repository on the same instance, add `-R "$repo"`.
- If the command targets another GitLab instance, set `GITLAB_HOST="$host"` and add `-R "$repo"` when the command is repository-scoped.
- For `glab api`, prefer `--hostname "$host"` when calling an instance other than the current repository context.

### 4. Confirm authentication after `glab` context is chosen

Check auth:

```bash
glab auth status
glab auth status --hostname "$host"
glab auth status --all
```

Sign in:

```bash
glab auth login
glab auth login --hostname "$host"
glab auth login --stdin < token.txt
glab auth login --hostname "$host" --token "$TOKEN"
```

Notes:

- `glab auth login` in an interactive Git repository can detect GitLab instances from Git remotes.
- `GITLAB_TOKEN`, `GITLAB_ACCESS_TOKEN`, and `OAUTH_TOKEN` override stored credentials.
- Prefer `--hostname` for self-managed or dedicated instances instead of relying on defaults.

### 5. Run the task-specific command

Use these command families.

#### Repository and project operations

```bash
glab repo view
glab repo view "$repo"
glab repo clone "$repo"
GITLAB_HOST="$host" glab repo clone "$repo"
```

#### Merge requests

```bash
glab mr create --fill --yes
glab mr create -t "title" -d "description" -b main -s feature-branch
glab mr list
glab mr view 123
glab mr diff 123
glab mr checkout 123
glab mr note 123 -m "Looks good to me"
glab mr update 123 --label needs-review --reviewer alice
glab mr merge 123
```

#### Issues

```bash
glab issue list
glab issue view 123
glab issue create -t "title" -d "description"
glab issue create -t "title" -l bug -a alice --web
glab issue note 123 -m "Can you share repro steps?"
glab issue update 123 --label triage --assignee alice
```

#### CI/CD

```bash
glab ci list
glab ci status
glab ci view
glab ci trace 12345
glab ci run
```

#### Releases

```bash
glab release create v1.2.3 --notes "release notes"
glab release create v1.2.3 --notes-file CHANGELOG.md
glab release view v1.2.3
```

#### API

```bash
glab api projects/:fullpath
glab api projects/:fullpath/merge_requests --paginate
glab api graphql -f query='query { currentUser { username } }'
glab api --hostname "$host" projects/:fullpath
```

For checked command syntax and doc links, read [references/verified-commands.md](references/verified-commands.md).

## Patterns

### Prefer repository context over manual URL building

Many `glab` commands accept `-R/--repo` with:

- `OWNER/REPO`
- `GROUP/NAMESPACE/REPO`
- a full HTTPS URL
- a Git URL

Use the repository path form when you already have `repo` from the detection step. It is shorter and easier to compose.

### Prefer `GITLAB_HOST` for cross-instance adaptation

For most CLI commands, `GITLAB_HOST="$host"` is the simplest host override.

Example:

```bash
GITLAB_HOST="$host" glab repo clone "$repo"
GITLAB_HOST="$host" glab issue list -R "$repo"
```

For `glab api`, `--hostname "$host"` is usually clearer than relying only on environment.

### Use placeholders in `glab api`

When running `glab api` inside a GitLab repository, placeholders such as `:fullpath`, `:branch`, `:namespace`, and `:repo` resolve from the current repository.

Prefer them when they remove brittle manual encoding:

```bash
glab api projects/:fullpath
glab api projects/:fullpath/repository/branches/:branch
```

### Escalate only when platform evidence conflicts

Stop and reassess if:

- Git remotes point to both GitHub and GitLab and the intended target is unclear
- the detected host and the authenticated host disagree
- the repository lives on a private host but the task uses `gitlab.com` URLs
- the command mixes one instance's host with another instance's repo path
