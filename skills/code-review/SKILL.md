---
name: code-review
description: Request or perform a git-backed code review for a defined diff or SHA range using implementation context and requirements. Use when finishing a task, completing a major feature, preparing to merge, or when you need a fresh review before proceeding.
metadata:
  name: Code Review
  description: Review a defined git-backed change set for bugs, regressions, missing requirements, and test gaps before merge.
  author: Flc゛
  created: 2026-03-14 22:54:38
---

# Code Review

Request or perform code review before issues compound.

## Operating Mode

Act as a pragmatic review coordinator first, and a reviewer second.

Prioritize:

- clear review scope before opinions
- requirement alignment before style nits
- bugs and regressions before polish
- explicit evidence before confidence

Review early and review often.

## Workflow

Follow this sequence unless the user asks for only one part of the review flow.

### 1. Define the review scope

Choose the smallest meaningful diff to review.

Prefer:

- branch review: `git merge-base origin/main HEAD` to `HEAD`
- task review: previous task commit to `HEAD`
- single-commit review: `HEAD~1` to `HEAD`

Use commands such as:

```bash
git merge-base origin/main HEAD
git rev-parse HEAD
git log --oneline --decorate -n 10
```

If the change set is too large or mixes unrelated work, call that out and split the review scope before continuing.

### 2. Gather review context

Capture the minimum context a reviewer needs:

- what was implemented
- plan, requirements, or acceptance criteria
- known risks or edge cases
- tests added, updated, or still missing
- exact `BASE_SHA` and `HEAD_SHA`

Do not rely on session history. Summarize the relevant context explicitly.

### 3. Choose the review path

If a dedicated review subagent or local review skill is available, dispatch it with the prepared scope and context.

If no dedicated reviewer is available, perform the review directly in the current session using the same scope and context.

When delegating, pass only the material needed for review:

- implementation summary
- requirements or plan reference
- `BASE_SHA`
- `HEAD_SHA`
- brief description of the change

### 4. Review the change set

Inspect the diff against the stated requirements.

Focus on:

- correctness bugs
- missing requirements
- behavioral regressions
- unsafe migrations or rollout risks
- missing or weak tests
- security, reliability, and performance issues when relevant

Prefer review commands such as:

```bash
git diff <base>..<head>
git log <base>..<head> --stat
```

For the detailed reviewer checklist and findings template, read [references/reviewer-guide.md](references/reviewer-guide.md).

### 5. Return findings in severity order

Report findings first.

Use this structure:

```markdown
# Review Findings

## Critical
- <issue with file/line and impact>

## Important
- <issue with file/line and impact>

## Minor
- <issue with file/line and impact>

## Open Questions
- <missing context or assumption>

## Assessment
- Ready to proceed / Fix important issues first / Blocked
```

Keep findings concrete. Include file and line references when available. If there are no findings, state that explicitly and note any residual risk or test gap.

### 6. Act on the review

- Fix Critical issues immediately.
- Fix Important issues before proceeding or merging.
- Track Minor issues deliberately instead of losing them.
- Push back on incorrect review comments with technical reasoning and evidence.

Do not wave through known Important issues just because the change is small.

## Review Brief Template

Use this when preparing a review request:

```markdown
# Review Request

## What Was Implemented
<what changed>

## Requirements
<plan, ticket, acceptance criteria, or intended behavior>

## Scope
- BASE_SHA: <sha>
- HEAD_SHA: <sha>

## Notes for Reviewer
- risks, edge cases, or areas needing extra scrutiny
```

## Decision Rules

- Prefer reviewing a precise diff over reviewing an entire branch by default.
- Prefer merge-base for branch reviews and `HEAD~1` only for truly single-commit reviews.
- Escalate when scope is ambiguous, requirements are missing, or the diff contains unrelated changes.
- Treat missing tests as a real finding when behavior changed.
- Keep reviewer context concise and independent from hidden chain-of-thought or session history.

## Red Flags

Stop and reassess if:

- the review scope is unclear
- the diff includes unrelated changes
- the requirements are too vague to judge correctness
- the review request lacks `BASE_SHA` or `HEAD_SHA`
- critical feedback is being ignored without evidence
