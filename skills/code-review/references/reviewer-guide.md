# Reviewer Guide

Load this reference when you are actively reviewing a diff or preparing the final findings.

## Review Checklist

Use this checklist to keep the review concrete:

- Code quality: separation of concerns, error handling, type safety where applicable, duplication, edge cases
- Architecture: sound design, maintainability, performance, security, integration fit
- Testing: whether tests exercise real behavior, cover edge cases, and match the change risk
- Requirements: spec alignment, missing functionality, unintended scope creep, documented breaking changes
- Production readiness: migrations, backward compatibility, rollout risk, obvious bugs

## Findings Structure

Use this structure for the final review:

```markdown
# Review Findings

## Strengths
- <what is well done and why>

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

## Writing Rules

- Acknowledge concrete strengths before listing issues, but do not let praise dilute important findings.
- Categorize findings by actual severity; do not inflate nits into Important or Critical issues.
- For each issue, state what is wrong, why it matters, and how to fix it when not obvious.
- Include file and line references when available.
- If there are no findings, say so explicitly and note any residual risk or test gap.
