---
name: otel-changelog-pr-verifier
description: Verify whether CHANGELOG entries in an OpenTelemetry Go repository point to the correct pull requests and whether each `(#NNNN)` matches the described change. Use when checking a release PR, validating a CHANGELOG section, or screening only mismatched changelog-to-PR references.
metadata:
  name: OTel Changelog PR Verifier
  description: Verify changelog PR numbers in OpenTelemetry Go release work.
  author: Flc
  created: 2026-04-03T04:32:49Z
---

# OTel Changelog PR Verifier

Verify `CHANGELOG.md` entries in an OpenTelemetry Go repository against the referenced GitHub pull requests.

## Operating Mode

Prioritize:

- exact PR-to-entry matching before prose quality
- the release section under review, not the entire changelog
- concrete mismatches only
- local repository evidence first, GitHub metadata second

Do not flood the user with entries that are already correct.

## Execution Assumption

Assume the user has provided a concrete target PR, usually as a PR number or PR URL in the current repository.

The default example repository is `open-telemetry/opentelemetry-go`, but the same workflow applies to similar OpenTelemetry Go repositories when the task is already anchored to a specific repository and PR.

## Workflow

### 1. Check out the target PR locally

Prefer:

```bash
gh pr checkout <pr-number>
git status --short --branch
gh pr view <pr-number> --json baseRefName
```

If the local checkout is not already anchored to the target repository, use an explicit repo selector:

```bash
gh pr checkout <pr-number> -R <owner/repo>
git remote -v
gh pr view <pr-number> -R <owner/repo> --json baseRefName
```

If `gh` cannot reach GitHub because of sandbox restrictions, request escalation and retry.

Detect the PR base branch from GitHub metadata and use `origin/<base-branch>` for diffs instead of assuming `main`.

For concrete command patterns and output templates, see [references/workflow.md](references/workflow.md).

### 2. Isolate the release section under review

Read only the relevant `CHANGELOG.md` block, usually the newest released section above the previous release.

Prefer commands such as:

```bash
git diff origin/<base-branch>...HEAD -- CHANGELOG.md
nl -ba CHANGELOG.md | sed -n '<start>,<end>p'
awk '/^## \[<release>\]/{flag=1;print;next}/^## \[<previous-release>\]/{flag=0}flag' CHANGELOG.md
```

If the user only cares about entries introduced by the release PR, review only that released section.

### 3. Extract the referenced PR numbers

Collect unique `#NNNN` values from the target section.

Prefer:

```bash
awk '/^## \[<release>\]/{flag=1;next}/^## \[<previous-release>\]/{flag=0}flag' CHANGELOG.md | rg -o '#[0-9]+' -N | sort -u
```

### 4. Fetch PR metadata from GitHub

Use `gh pr view` for each referenced number.

Prefer:

```bash
gh pr view <number> --json number,title,url,state,mergedAt
```

If the current repository context is not already clear, make the repository explicit:

```bash
gh pr view <number> -R <owner/repo> --json number,title,url,state,mergedAt
```

If needed, batch with a shell loop. Request escalation if network access is blocked.

### 5. Compare changelog text to PR metadata

For each entry, verify:

- the PR number resolves to the expected GitHub PR
- the PR title and changed area are consistent with the changelog description
- the entry is not obviously pointing at the wrong PR

Treat these as mismatches:

- changelog description refers to a different feature or package than the PR
- PR number resolves to a different topic than the entry text
- entry claims a fix/addition that is not plausibly what the PR did

Do not flag harmless wording differences if the referenced PR is clearly the same change.

When deciding whether wording is "close enough", use the matching heuristics in [references/workflow.md](references/workflow.md).

### 6. Report only the incorrect items

Default output:

```markdown
No incorrect entries found.
```

If mismatches exist, return a compact list:

```markdown
- CHANGELOG line <line>: `<entry text>` uses `#<number>`, but PR title is `<title>`.
  Correct PR: <if known>
  PR URL: <url>
```

## Review Rules

- Prefer the actual release section over guessing from the diff summary.
- Use exact line references when reporting problems.
- If all entries are consistent, say so directly.
- Keep the answer focused on incorrect references; a full mapping table is optional and only on request.
