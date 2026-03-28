---
name: github-create-pr
description: Create GitHub pull requests from a local branch using a reviewable workflow for branch checks, diff analysis, PR title/body writing, and gh CLI creation. Use when opening a PR, drafting or improving a PR description, preparing a branch for review, or adding reviewers on GitHub.
metadata:
  name: GitHub Create PR
  description: Create or update GitHub pull requests from a local branch with a reviewable, repository-aware workflow.
  author: Flc゛
  created: 2026-03-14 11:24:59
---

# GitHub Create PR

Create GitHub pull requests with a clear, reviewable workflow.

## Operating Mode

Act as a pragmatic PR writer and GitHub workflow assistant.

Prioritize:

- branch hygiene before PR creation
- clear reviewer context before exhaustive detail
- concise PR bodies over diff narration
- repository conventions over generic defaults

Assume `gh` is installed and authenticated unless local evidence shows otherwise.

## Workflow

Follow this sequence unless the user asks for only one part of the PR process.

### 1. Verify branch readiness

Check:

- current branch
- working tree status
- base branch
- commits that will be included

Use commands such as:

```bash
git status
git branch --show-current
gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name'
git log <base>..HEAD --oneline
```

If there are uncommitted changes that should be part of the PR, stop PR creation and handle commits first.

If the branch is stale or diverged, call that out and recommend rebasing or merging before opening the PR.

### 2. Analyze the change set

Review the commits and full diff that will land in the PR.

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

Do not write the PR body until the scope is understood.

### 3. Write the PR title

Prefer a short, searchable title that matches the repository's existing convention.

If the repository uses conventional-commit style titles, follow that pattern:

- `feat(scope): add token refresh`
- `fix(api): handle null response`
- `refactor(auth): extract validation logic`

If no convention is visible, use a plain imperative summary.

### 4. Write the PR body

Use the default PR body conventions in [references/pr-body-conventions.md](references/pr-body-conventions.md) unless the user explicitly asks for another format.

### 5. Create or update the PR

For a new PR, prefer `gh pr create` with explicit title and body. Build the body from [references/pr-body-conventions.md](references/pr-body-conventions.md):

```bash
gh pr create --title "<title>" --body "$(cat <<'EOF'
<body>
EOF
)"
```

Use `--draft` when the branch is intentionally not ready for full review.

For an existing PR, use `gh pr edit` to update the title, body, or reviewers.

### 6. Add reviewers deliberately

Keep reviewer count focused. Prefer the smallest set of relevant reviewers.

Use commands such as:

```bash
gh pr edit --add-reviewer username1,username2
gh pr edit --add-reviewer org/team-name
```

If the user does not specify reviewers, infer likely owners only from clear local evidence such as CODEOWNERS or recent authorship. Otherwise leave reviewers unset.

## Output Structure

When the user asks for help writing a PR, provide:

```markdown
# PR Draft

## Title
<proposed PR title>

## Body
<proposed PR body>
```

Add `Notes` only when there is important reviewer context, a blocker, or a useful command to call out.

If the user asks to open the PR directly, still summarize the final title, body, and any assumptions after running the command.

## Decision Rules

- Follow repository-specific PR templates or title conventions when present.
- Prefer draft PRs when work is incomplete, risky, or waiting on feedback.
- Keep one PR focused on one coherent change set; call out unrelated changes if found.
- Explain behavior changes, migrations, and follow-up work only when they materially affect review.
- Use issue-closing syntax only when the linkage is clear and intended.

## Red Flags

Stop and reassess if:

- the working tree is dirty in a way that makes PR scope ambiguous
- the branch contains unrelated commits
- the diff is too large to describe honestly as one reviewable unit
- the requested PR body conflicts with visible repository conventions
- the user asks to create a PR without enough context to describe the change accurately
