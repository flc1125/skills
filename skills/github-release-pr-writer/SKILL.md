---
name: github-release-pr-writer
description: Draft or update GitHub release pull request descriptions from verified tags, commits, merged pull requests, and the release diff. Use when a PR prepares a version, aligns release metadata, promotes a prerelease, or needs a reviewer-focused release summary, exact change inventory, breaking-change section, or migration summary. Do not use for ordinary feature or bug-fix pull requests.
metadata:
  name: GitHub Release PR Writer
  description: Draft accurate, reviewer-focused descriptions for GitHub release pull requests.
  author: Flc
  created: "2026-07-27T01:03:37Z"
---

# GitHub Release PR Writer

Write release pull request descriptions that help maintainers verify what will be released and why the release-preparation diff is correct.

## Operating Boundaries

- Treat this skill as a specialized companion to a general PR workflow. Use the general PR skill for branch readiness, ordinary change descriptions, reviewers, and PR creation.
- Default to a local Markdown draft. Do not create or update a GitHub pull request unless the user explicitly asks for that write.
- Inspect URLs and GitHub state read-only when the user asks to review, assess, draft, or improve wording.
- Separate release-preparation changes from the product history being released.
- Use repository evidence instead of reconstructing a release solely from conversation memory, commit wording, or the files changed by the release PR.

## Workflow

### 1. Discover repository and release conventions

Read applicable repository instructions, PR templates, release documentation, version manifests, and representative recent release pull requests.

Identify:

- repository and target PR
- base and head branches and immutable SHAs
- intended version and release channel
- previous released version or comparison tag
- whether the repository uses squash, merge, or rebase commits
- whether it is a monorepo or multi-module repository

Do not assume the repository default branch is the release base.

### 2. Inspect the target pull request

Read the PR metadata and full base-to-head diff:

```bash
gh pr view <pr> --json number,title,body,state,isDraft,baseRefName,baseRefOid,headRefName,headRefOid,commits,files,statusCheckRollup
git diff <base-sha>...<head-sha>
```

Determine what the release PR itself changes, such as:

- version manifests and exported version helpers
- module or package dependency alignment
- generated files, lockfiles, or release metadata
- final compatibility fixes made only on the release branch

Describe these as release-preparation changes, not as the entire release history.
Use `statusCheckRollup` only to report checks that actually completed; distinguish successful, skipped, pending, cancelled, and failed checks.

### 3. Resolve exact comparison ranges

Use two distinct ranges:

| Purpose | Default range |
| --- | --- |
| Release PR diff | PR base SHA to PR head SHA |
| Changes being released | Previous release tag to PR base SHA |

The second range normally excludes the release PR itself because that PR has not landed in its own base. If the repository uses another release model, explain and verify the adjusted boundary.

Prefer immutable SHAs after resolving branch and tag names:

```bash
git fetch --tags
git rev-parse <previous-tag>^{commit}
git rev-parse <pr-base-sha>^{commit}
git log --format='%H%x09%s' <previous-tag>..<pr-base-sha>
```

If the previous tag is ambiguous, inspect the tag graph and recent published releases. Do not silently choose the closest semantic version when multiple release lines are active.

### 4. Build and reconcile the pull request inventory

Treat the commit range as the membership boundary. Extract referenced PR numbers from commit subjects, then resolve ambiguous commits through GitHub commit-to-PR associations.

For every candidate PR:

- confirm its merged commit or released commits belong to the comparison range
- record its number, title, author, and user impact
- exclude the target release PR from the historical inventory unless it is truly inside the chosen released range
- identify reverts, duplicate references, backports, and commits with no PR

Maintain an internal exact set of PR numbers. If a user supplies a GitHub-generated `What's Changed` list, reconcile it against the range rather than replacing it casually. Explain every addition or removal.

Do not use merged-date search alone as proof of range membership.

### 5. Analyze release impact

Group changes by user or maintainer impact rather than by filename:

- breaking API or behavior changes
- new components and capabilities
- important fixes and behavioral corrections
- documentation and repository structure
- dependency, CI, and maintenance changes

For breaking changes, verify the final code and tests, then provide:

- affected public surface
- before-and-after mapping when useful
- required migration action
- important preserved contracts

For multi-module repositories, verify that version manifests, module requirements, exported version values, and release scope agree.

### 6. Draft the description

Read [references/release-pr-conventions.md](references/release-pr-conventions.md) completely before drafting.

Adapt the structure to the evidence. Omit empty headings. Keep the result reviewer-focused: explain the release-preparation diff, summarize the shipped history, and make validation boundaries auditable.

### 7. Sanitize and validate

Before handing off or publishing:

- verify the version names, comparison SHAs, PR count, and PR-number set
- ensure every highlighted claim maps to code, documentation, tests, or an included PR
- ensure breaking changes include migration guidance
- ensure testing lists only checks that actually completed
- remove absolute local paths, usernames, temporary files, tokens, hosts, and machine-specific output
- keep Markdown paragraphs naturally wrapped; do not impose source-code line-width wrapping

### 8. Publish only with explicit authorization

When the user explicitly asks to update the PR, write the reviewed body to a temporary or user-selected Markdown file and use:

```bash
gh pr edit <pr> --body-file <draft-file>
gh pr view <pr> --json body
```

Verify the final GitHub body after the write. Do not alter the title, reviewers, labels, state, or other PR fields unless requested.

## Handoff

Report:

- target PR and intended release
- released-history range and release-PR diff range
- exact included PR count
- local draft path, if created
- whether GitHub was changed
- unresolved evidence gaps or intentionally omitted items
