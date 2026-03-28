---
name: gitlab-create-mr
description: Create GitLab merge requests from a local branch using a reviewable workflow for branch checks, GitLab host detection, diff analysis, title and description writing, and `glab mr create`. Use when opening a GitLab merge request, drafting or improving merge request copy, preparing a branch for review, or working across GitLab.com and self-managed GitLab instances.
metadata:
  name: GitLab Create MR
  description: Create or update GitLab merge requests from a local branch with host-aware review and writing workflows.
  author: Flc゛
  created: 2026-03-24T05:52:06Z
---

# GitLab Create MR

Create GitLab merge requests with a clear, reviewable workflow.

## Operating Mode

Act as a pragmatic merge request writer and GitLab workflow assistant.

Prioritize:

- branch hygiene before merge request creation
- correct GitLab host selection before any write operation
- repository conventions over generic templates

Assume `glab` is installed unless local evidence shows otherwise.

For exact command names and commonly used flags, read [references/verified-commands.md](references/verified-commands.md).

## Workflow

Follow this sequence unless the user asks for only one part of the process.

### 1. Verify branch readiness

Check:

- current branch
- working tree status
- commits that will be included

Use commands such as:

```bash
git status
git branch --show-current
git remote -v
git log <base>..HEAD --oneline
```

If there are uncommitted changes that should be part of the merge request, stop creation and handle commits first.

If the branch is stale, diverged, or mixes unrelated work, call that out before opening the merge request.

### 2. Detect the GitLab instance only when needed

Prefer bare `glab` commands first when the current directory is already the target GitLab repository.

Only inspect `git remote -v` or set explicit host context when:

- `glab` resolves to the wrong instance
- the repository has multiple remotes and the target is unclear
- auth checks fail against an unexpected host
- the task targets another repository or another GitLab instance

Rules:

- Prefer a GitLab remote over any GitHub or Bitbucket remote.
- If the GitLab remote host is `gitlab.com`, treat the platform as GitLab.com.
- If the GitLab remote host is anything else, treat it as self-managed or dedicated GitLab.
- If multiple GitLab hosts appear in `git remote -v`, do not silently choose one for write operations.
- If `GITLAB_HOST` is already set, let it override remote-derived host detection.

If the repository context is already correct, use:

```bash
glab <command>
```

If the repository is on another GitLab host, use:

```bash
GITLAB_HOST="$host" glab <command>
```

If the command targets another repository on the same host, use:

```bash
glab <command> -R "$repo"
```

If the command targets another repository on another host, use:

```bash
GITLAB_HOST="$host" glab <command> -R "$repo"
```

### 3. Confirm authentication after context is chosen

Check auth with:

```bash
glab auth status
glab auth status --hostname "$host"
glab auth status --all
```

If the selected host is self-managed, prefer `--hostname "$host"` during login or auth checks instead of assuming defaults.

After host context is confirmed, inspect repository metadata and identify the likely target branch:

```bash
glab repo view
GITLAB_HOST="$host" glab repo view
```

### 4. Analyze the change set

Review the commits and diff that will land in the merge request.

Use commands such as:

```bash
git log <base>..HEAD
git diff <base>...HEAD
```

Extract:

- what changed
- why it changed
- user or system impact when relevant
- risks, migrations, or rollout notes only when they materially affect review
- any issue references already implied by commits or branch naming

Do not write the merge request until the scope is understood.

### 5. Write the merge request title

Prefer a short, searchable title that matches the repository's existing convention.

If the repository uses conventional-commit style titles, follow that pattern:

- `feat(scope): add token refresh`
- `fix(api): handle null response`
- `refactor(auth): extract validation logic`

If no convention is visible, use a plain imperative summary.

### 6. Write the merge request description

Use the default MR Body conventions in [references/mr-body-conventions.md](references/mr-body-conventions.md) unless the user explicitly asks for another format.

### 7. Create the merge request

Prefer explicit title and description over relying only on autofill. Build the description from [references/mr-body-conventions.md](references/mr-body-conventions.md):

```bash
glab mr create --title "<title>" --description "<description>" --target-branch "<base>" --source-branch "<branch>" --yes
```

Use `--draft` when the branch is intentionally not ready for full review.

If repository context is not the current directory, add `-R "$repo"`. If the target instance is not the current host, set `GITLAB_HOST="$host"` as well.

Before creating a new merge request, check whether the source branch already has one:

```bash
glab mr list --source-branch "$branch"
GITLAB_HOST="$host" glab mr list --source-branch "$branch" -R "$repo"
```

If an existing merge request is already associated with the branch, inspect it with `glab mr view <iid>` before creating another one.

## Output Structure

When the user asks for help drafting a merge request, provide:

```markdown
# MR Draft

## Title
<proposed MR title>

## Description
<proposed MR description>
```

Add `Notes` only when there is important reviewer context, a blocker, or a useful command to call out.

If the user asks to open the merge request directly, still summarize the final title, description, target branch, and any host assumptions after running the command.

## Decision Rules

- Use the default MR Body conventions unless the user explicitly provides another structure.
- Prefer draft merge requests when work is incomplete, risky, or waiting on feedback.
- Keep one merge request focused on one coherent change set.
- Explain behavior changes, migrations, and follow-up work only when they materially affect review.
- Use issue-closing syntax only when the linkage is clear and intended for GitLab.

## Red Flags

Stop and reassess if:

- the working tree is dirty in a way that makes scope ambiguous
- the branch contains unrelated commits
- multiple GitLab hosts are present and the target is unclear
- the detected host and authenticated host disagree
- the diff is too large to describe honestly as one reviewable unit
- the user asks to create a merge request without enough context to describe the change accurately
