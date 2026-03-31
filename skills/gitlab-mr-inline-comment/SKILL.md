---
name: gitlab-mr-inline-comment
description: Publish a single inline comment on a GitLab merge request by anchoring it to a valid diff line with `glab api`. Use when Codex needs to place one review comment on a specific MR file and line, while reusing the user's existing `glab` authentication and stopping on invalid anchors instead of falling back to a general comment.
metadata:
  name: GitLab MR Inline Comment
  description: Post a single anchored GitLab MR inline comment with host-aware `glab` usage.
  author: Flc
  created: 2026-03-30T02:46:31Z
---

# GitLab MR Inline Comment

Publish one anchored inline comment on a GitLab merge request.

## Operating Mode

Act as a narrow GitLab review helper.

Prioritize:

- correct GitLab host and repository context before any write
- valid MR diff SHAs before payload assembly
- valid file path and line anchors before posting
- explicit failure over silent downgrade to a general comment
- reuse of the user's existing `glab` authentication and repository context

Assume `glab` is installed unless local evidence shows otherwise.

Do not require extra tokens, `.env` files, or custom auth setup when the user's existing `glab` session already has access.

Read these references only when needed:

- exact command patterns: [references/verified-commands.md](references/verified-commands.md)
- payload shape and field semantics: [references/api-shape.md](references/api-shape.md)
- current MR version and anchor resolution: [references/current-diff-resolution.md](references/current-diff-resolution.md)
- common failure cases and stop conditions: [references/failure-modes.md](references/failure-modes.md)

## Required Inputs

Collect or derive these values before posting:

- `mr_iid`
- `body`
- `old_path`
- `new_path`
- one valid line anchor shape:
  - added line: `new_line`
  - removed line: `old_line`
  - unchanged line: both `old_line` and `new_line`

Resolve one repository context:

- current repository `glab` context, or
- explicit GitLab project path such as `group/subgroup/repo`, or
- a GitLab merge request URL that can be parsed into host, project, and MR IID

Resolve these MR diff fields from the current merge request version:

- `base_sha`
- `start_sha`
- `head_sha`

## Workflow

Follow this sequence unless the user asks for one narrower part.

### 1. Confirm GitLab context with the lightest viable command

Prefer the user's current repository context first.

Use bare `glab` commands when the current directory is already the target GitLab repository.

Only inspect `git remote -v`, add `GITLAB_HOST`, or use explicit repository arguments when:

- `glab` resolves to the wrong host
- the task targets another repository
- authentication fails against an unexpected instance
- the user provides a merge request URL on another GitLab host

Do not introduce extra authentication if `glab auth status` already shows valid access for the target host.

### 2. Identify the target merge request

Normalize the task to one merge request.

If the user gives a merge request URL, parse it into:

- host
- project path
- MR IID

If the user gives a project path and MR IID, use them directly.

If the current repository is already the target project, prefer repository-context commands over manual URL construction.

### 3. Read the current MR version SHAs

Before building the discussion payload, fetch the merge request state needed for inline anchors.

Use [references/current-diff-resolution.md](references/current-diff-resolution.md) when exact field names or version-selection rules matter.

Resolve:

- `base_sha`
- `start_sha`
- `head_sha`

Do not guess or reuse stale SHAs from old output.

If the current MR version cannot be read reliably, stop and report that inline comment posting is blocked by missing diff context.

### 4. Validate the anchor

Confirm that:

- `old_path` and `new_path` match the current MR diff position
- the line anchor matches one valid text diff case:
  - added line: `new_line` only
  - removed line: `old_line` only
  - unchanged line: both `old_line` and `new_line`

Use [references/current-diff-resolution.md](references/current-diff-resolution.md) when deciding whether the target line is safely anchorable.

Do not guess the path or line.

Do not silently switch to a general merge request comment when the anchor is invalid.

### 5. Build the payload and post the discussion

Use the minimal payload shape from [references/api-shape.md](references/api-shape.md).

Post to the merge request discussions endpoint with `glab api`.

Use the user's existing `glab` authentication and host context whenever possible.

### 6. Return a concise result

On success, report:

- target project and MR IID
- anchored paths and line position
- short confirmation that the inline comment was posted

On failure, report the concrete blocking reason, such as:

- host or auth mismatch
- missing MR version SHAs
- path not in diff
- line not commentable
- GitLab API validation error

## Output Structure

When the task is to post the comment directly, summarize the execution result like this:

```markdown
# Inline Comment Result

## Target
- project: <group/subgroup/repo>
- mr: !<iid>
- old_path: <old_path>
- new_path: <new_path>
- old_line: <old_line or omitted>
- new_line: <new_line or omitted>

## Result
- status: <posted | failed>
- detail: <short reason or confirmation>
```

## Decision Rules

- Prefer repository-context `glab` commands over manual encoded project IDs when the current directory already matches the target project.
- Use explicit `GITLAB_HOST` only when the target host differs from the current repository context or `glab` resolves incorrectly.
- Treat inline comment posting as blocked when the current MR diff SHAs are unavailable or ambiguous.
- Treat invalid anchors as hard failures.
- Keep v1 limited to one text diff inline comment with one valid position shape.

## Red Flags

Stop and reassess if:

- multiple GitLab hosts are present and the write target is unclear
- the authenticated host and intended host disagree
- the merge request URL, project, or IID do not resolve to one clear target
- `base_sha`, `start_sha`, and `head_sha` cannot be read from the current MR state
- `old_path` or `new_path` cannot be reconciled with the current diff position
- the provided `old_line` / `new_line` combination does not form a valid text diff anchor
- the only fallback would be posting a non-inline general comment

## Out Of Scope For V1

Do not add these behaviors in v1:

- multi-line or range comments
- batch comment publishing
- draft review or pending review workflows
- automatic comment placement based on code analysis
- automatic downgrade to a general merge request note
