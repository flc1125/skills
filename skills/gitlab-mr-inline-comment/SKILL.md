---
name: gitlab-mr-inline-comment
description: Post prepared inline comments to exact lines in a GitLab merge request by resolving MR context, mapping comments onto the diff, deduplicating existing discussions, and creating line-level discussions through the GitLab API. Use when you already know what to comment and need those comments published on GitLab MR code lines.
metadata:
  name: GitLab MR Inline Comment
  description: Publish prepared comments as deduplicated line-level discussions on a GitLab merge request.
  author: Flc゛
  created: 2026-03-30T03:00:00Z
---

# GitLab MR Inline Comment

Publish prepared comments to exact lines in a GitLab merge request.

## Operating Mode

Act as a GitLab MR inline comment publisher, not as a reviewer.

Prioritize:

- exact MR context before any write
- correct diff mapping before any API call
- duplicate avoidance before bulk posting
- explicit skips over guessed line positions

Do not invent review findings. Do not silently convert vague comments into line comments.

## Resource Map

Read these only as needed:

- Input contract and examples: [references/input-schema.md](references/input-schema.md)
- GitLab position model: [references/gitlab-position.md](references/gitlab-position.md)
- Dedupe and fallback rules: [references/dedupe.md](references/dedupe.md)

Use [scripts/post-inline-comments.mjs](scripts/post-inline-comments.mjs) when the task is already reduced to validated GitLab discussion payloads or to comments with enough context for direct posting. The script prefers `glab` for repository context, auth context, and API calls, then falls back to direct HTTP only when `glab` is unavailable.

## Workflow

Follow this sequence unless the user asks for one narrow subtask.

### 1. Confirm the task is comment publication

Use this skill only when the user already has comment content or clearly wants Codex to post line comments.

Valid inputs include:

- structured comment JSON
- a file containing comments
- comments already produced earlier in the session
- lint or analysis output that is already normalized to path and line

If the task is really asking for review, use a review-oriented workflow first and come back to this skill only for publishing.

### 2. Resolve GitLab MR context before writing

Prefer existing GitLab CI context first.

Look for:

- `REVIEWDOG_GITLAB_API_TOKEN` or another explicitly provided GitLab API token
- `GITLAB_API` or `CI_API_V4_URL`
- `CI_PROJECT_PATH`
- `CI_MERGE_REQUEST_IID`
- `CI_COMMIT_SHA`

If not in CI, infer context from the local repository and prefer `glab`.

Before posting, identify:

- project path
- merge request IID
- head SHA
- target branch
- usable GitLab API base URL

If any of these are missing and cannot be derived safely, stop before write operations.

### 3. Normalize comments

Normalize every input comment to the contract in [references/input-schema.md](references/input-schema.md).

Minimum required fields:

- `path`
- `line`
- `body`

Optional fields:

- `old_path`
- `old_line`
- `fingerprint`
- `suggestion`

Keep comments explicit and ready to post. Do not add generic review framing.

### 4. Build diff-backed positions

Use local git history to map comments onto the merge request diff.

Prefer:

```bash
git merge-base <target_sha> <head_sha>
git diff --find-renames <merge_base> <head_sha>
```

For each normalized comment:

- verify the file is in the MR diff
- verify the line can be anchored in the diff
- derive `new_path` and `new_line`
- derive `old_path` and `old_line` when available and useful

Do not guess positions for comments outside the diff.

For GitLab API payload details, read [references/gitlab-position.md](references/gitlab-position.md).

### 5. Deduplicate before posting

List existing merge request discussions first and compare against the normalized comments.

Use the rules in [references/dedupe.md](references/dedupe.md).

Prefer skipping a probable duplicate over posting the same body again on the same line.

### 6. Post merge request discussions

Create GitLab merge request discussions with a `position` object.

Prefer `glab api` for write operations when `glab` is available in the current repository context. Fall back to direct HTTP only when `glab` is unavailable or clearly unusable.

Use `position_type: "text"` and populate:

- `base_sha`
- `start_sha`
- `head_sha`
- `new_path`
- `new_line`
- optional `old_path`
- optional `old_line`

If the user provided a suggestion, append it to the body only when the suggestion range is compatible with the anchored line.

### 7. Return a compact posting summary

Report:

- posted count
- skipped count
- failed count
- any comments skipped because they were outside the diff or missing context

If a comment could not be mapped to a valid diff line, say so explicitly instead of implying it was published.

## Decision Rules

- Prefer CI-derived MR context over manual prompts.
- Do not post inline comments without a stable path and line.
- Do not fabricate `old_line` or `old_path` if diff mapping does not support them.
- Do not downgrade to a general MR note unless the user explicitly asks for that fallback.
- Stop on missing auth, missing MR identity, or missing head SHA.
- Batch posting is fine, but context validation happens before the first write.

## Output Structure

When summarizing a completed posting run, use:

```markdown
# GitLab MR Inline Comment Result

## Context
- project: <group/project>
- mr: !<iid>

## Posted
- <count>

## Skipped
- <count and reason summary>

## Failed
- <count and reason summary>
```

When the task is blocked, replace the counts with the exact missing prerequisite.

## Red Flags

Stop and reassess if:

- the task does not actually provide comment content
- the repository is not in a usable git state for diff mapping
- the merge request target branch or head SHA cannot be identified
- the requested comments are mostly outside the diff
- the same comments appear to have already been posted
