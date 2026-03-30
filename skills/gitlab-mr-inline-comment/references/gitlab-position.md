# GitLab Position Model

GitLab merge request inline comments are created as discussions anchored by a `position` object.

## Required write context

Before posting, identify:

- project path
- merge request IID
- `head_sha`
- target branch
- API base URL
- API token

Resolve `base_sha` and `start_sha` from merge request context and repository history. For many GitLab MR comment flows, `position_type` should be `"text"`.

## Preferred payload shape

```json
{
  "body": "This dereference panics when `user` is nil.",
  "position": {
    "position_type": "text",
    "base_sha": "<base sha>",
    "start_sha": "<start sha>",
    "head_sha": "<head sha>",
    "new_path": "internal/user/service.go",
    "new_line": 42
  }
}
```

When rename or moved-line context is available, include:

```json
{
  "position": {
    "old_path": "pkg/user/service.go",
    "old_line": 40
  }
}
```

## Mapping rules

- `new_path` must match the file path visible in the MR diff.
- `new_line` must refer to the new-side line in the MR diff.
- `old_path` and `old_line` are optional and should only be sent when they are backed by the diff mapping.
- Do not send fake old-side coordinates to satisfy the API shape.

## Source of truth

Use the local git diff as the source of truth for path and line mapping. Prefer:

```bash
git diff --find-renames <merge_base> <head_sha>
```

This matters for renamed files. A naive diff without rename detection can produce wrong comment anchors.

## Posting boundary

Keep repository discovery, merge request discovery, auth selection, dedupe, and diff mapping outside the posting helper. By the time a script is invoked, prefer having a final payload that already includes:

- `project`
- `mr_iid`
- `body`
- `position`

This keeps the transport layer narrow and reduces hidden environment dependencies.

## Suggestion handling

If the comment includes a suggestion, append it to the discussion body only when:

- the replacement is coherent for the anchored line or lines
- the rendered Markdown will be valid on GitLab

If the suggestion range is ambiguous, prefer a plain body comment over a broken suggestion block.
