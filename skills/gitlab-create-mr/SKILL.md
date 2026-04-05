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
- concise, reviewer-friendly titles and descriptions
- repository conventions over generic templates
- optimistic execution in the current repository context

Assume `glab` is installed and already authenticated unless local evidence shows otherwise.

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
git log <base>..HEAD --oneline
```

If there are uncommitted changes that should be part of the merge request, stop creation and handle commits first.

If the branch is stale, diverged, or mixes unrelated work, call that out before opening the merge request.

### 2. Analyze the change set

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

### 3. Write the merge request title

Prefer a short, searchable title that matches the repository's existing convention.

If the repository uses conventional-commit style titles, follow that pattern:

- `feat(scope): add token refresh`
- `fix(api): handle null response`
- `refactor(auth): extract validation logic`

If no convention is visible, use a plain imperative summary.

### 4. Write the merge request description

Use the default MR Body conventions in [references/mr-body-conventions.md](references/mr-body-conventions.md) unless the user explicitly asks for another format.

### 5. Create or update the merge request

Prefer explicit title and description over relying only on autofill. Build the description from [references/mr-body-conventions.md](references/mr-body-conventions.md):

```bash
glab mr create --title "<title>" --description "<description>" --target-branch "<base>" --source-branch "<branch>" --yes
```

Use `--draft` when the branch is intentionally not ready for full review.

If the target repository or GitLab host is not the current context, complete step 6 first and then run the step-5 commands with `-R "$repo"` and/or `GITLAB_HOST="$host"` as needed.

Before creating a new merge request, check whether the source branch already has one:

```bash
glab mr list --source-branch "$branch"
GITLAB_HOST="$host" glab mr list --source-branch "$branch" -R "$repo"
```

If an existing merge request is already associated with the branch, inspect it with `glab mr view <iid>` and update it with `glab mr update <iid> --title "<title>" --description "<description>"` instead of creating another one.

### 6. Resolve GitLab context only when needed

Prefer bare `glab` commands when the current directory is already the target repository.

Only inspect `git remote -v`, set `GITLAB_HOST`, or use `-R "$repo"` when:

- `glab` resolves to the wrong instance
- the repository has multiple GitLab hosts and the target is unclear
- the task targets another repository
- a `glab` command fails due to host or auth context

Rules:

- If multiple GitLab hosts appear in `git remote -v`, do not silently choose one for write operations.
- If `GITLAB_HOST` is already set, let it override remote-derived host detection.
- Use `glab <command> -R "$repo"` only when the target repository is not the current one.
- Use `GITLAB_HOST="$host"` only when the target instance is not the current default.

If write commands fail because of auth or host context, then verify with commands such as:

```bash
glab auth status
glab auth status --hostname "$host"
glab repo view
GITLAB_HOST="$host" glab repo view
```

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
- the diff is too large to describe honestly as one reviewable unit
- the user asks to create a merge request without enough context to describe the change accurately
