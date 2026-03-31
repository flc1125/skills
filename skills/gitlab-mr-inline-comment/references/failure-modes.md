# GitLab MR Inline Comment Failure Modes

Use this reference when deciding whether to post or stop.

## Hard Failures

Treat these as blocking conditions:

- `glab` is not authenticated for the target GitLab host
- the target project or MR IID is wrong
- the current MR version SHAs cannot be read reliably
- `new_path` is not present in the current MR diff
- `new_line` is not a valid commentable line on the new side
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

- inspect the current MR diff path exactly as GitLab reports it
- for v1, stop if the path cannot be expressed as `new_path`

### Line mismatch

Symptoms:

- the line number exists in the file but is not commentable in the diff
- the path is correct but the API still rejects `new_line`

Action:

- verify the line against the current MR diff, not just the repository file
- for v1, stop if the target is not a new-side commentable line

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
- `Failed: internal/user/service.go is not present in the current MR diff.`
- `Failed: line 42 is not commentable on the new side of the current diff.`
