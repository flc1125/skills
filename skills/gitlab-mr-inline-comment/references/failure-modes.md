# GitLab MR Inline Comment Failure Modes

Use this reference when deciding whether to post or stop.

## Hard Failures

Treat these as blocking conditions:

- `glab` is not authenticated for the target GitLab host
- the target project or MR IID is wrong
- the current MR version SHAs cannot be read reliably
- `old_path` and `new_path` do not match one current diff position
- the provided `old_line` / `new_line` combination does not form a valid commentable text diff anchor
- the GitLab API rejects the payload as invalid

## Do Not Downgrade

Do not silently convert a failed inline comment attempt into:

- a general merge request note
- a summary comment without a line anchor
- a guessed anchor on a nearby line

Inline placement is the requirement. If the anchor is invalid, fail explicitly.

## Common Causes

### SHA mismatch

Symptoms:

- GitLab rejects the discussion position
- the same payload worked earlier but fails after new commits arrive

Action:

- re-read the current MR version
- refresh `base_sha`, `start_sha`, and `head_sha`

### Path mismatch

Symptoms:

- the file exists in the repository but not in the current MR diff
- a renamed path is referenced with the wrong side or wrong name

Action:

- inspect the current MR diff paths exactly as GitLab reports them
- stop if `old_path` and `new_path` cannot be mapped to one diff position

### Line mismatch

Symptoms:

- the line number exists in the file but is not commentable in the diff
- the path pair is correct but the API still rejects the requested `old_line` / `new_line` shape

Action:

- verify the line against the current MR diff, not just the repository file
- stop if the target is not a valid added-line, removed-line, or unchanged-line diff anchor

### Host or repo mismatch

Symptoms:

- `glab` commands resolve to the wrong GitLab instance
- auth looks valid, but for another host or project

Action:

- confirm the target host
- use explicit `GITLAB_HOST` or repository scoping only when needed

## Reporting Style

When posting fails, report the concrete blocker in one sentence first.

Good examples:

- `Failed: current MR diff SHAs could not be resolved for !2236.`
- `Failed: old_path and new_path do not match one current diff position.`
- `Failed: the requested old_line/new_line shape is not commentable in the current diff.`
