# GitLab MR Inline Comment Payload Shape

Use this reference when exact request fields matter.

The v1 skill posts one inline comment through the merge request discussions endpoint:

```bash
glab api projects/<project>/merge_requests/<mr_iid>/discussions -X POST --input <payload.json>
```

When the current repository context is already correct, prefer placeholder or repository-context usage over hardcoded encoded paths.

## Text Diff Position Rules

For merge request diff threads with `position_type: text`:

- include `old_path`
- include `new_path`
- use exactly one valid line shape:
  - added line: `new_line` only
  - removed line: `old_line` only
  - unchanged line: both `old_line` and `new_line`

## Added Line Example

```json
{
  "body": "This dereference panics when `user` is nil.",
  "position": {
    "position_type": "text",
    "base_sha": "abc123",
    "start_sha": "abc123",
    "head_sha": "def456",
    "old_path": "internal/user/service.go",
    "new_path": "internal/user/service.go",
    "new_line": 42
  }
}
```

## Required Fields

- `body`: comment text
- `position.position_type`: always `text` for this skill
- `position.base_sha`: merge request diff base SHA
- `position.start_sha`: merge request diff start SHA
- `position.head_sha`: merge request diff head SHA
- `position.old_path`: file path before the change
- `position.new_path`: file path after the change
- one valid line anchor:
  - `position.new_line` for an added line
  - `position.old_line` for a removed line
  - both `position.old_line` and `position.new_line` for an unchanged line anchor

## Field Notes

- `old_path` and `new_path` must match the file path before and after the change for the current diff position.
- `new_line` is valid only when the target is commentable on the new side of the current MR diff.
- `old_line` is valid only when the target is commentable on the old side of the current MR diff.
- `base_sha`, `start_sha`, and `head_sha` must come from the current MR diff state, not from a stale local guess.
- v1 does not support line ranges.

## Removed Line Example

```json
{
  "body": "This branch deletes behavior that callers still rely on.",
  "position": {
    "position_type": "text",
    "base_sha": "abc123",
    "start_sha": "abc123",
    "head_sha": "def456",
    "old_path": "internal/user/service.go",
    "new_path": "internal/user/service.go",
    "old_line": 42
  }
}
```

## Unchanged Line Example

```json
{
  "body": "Please clarify this condition before the surrounding change lands.",
  "position": {
    "position_type": "text",
    "base_sha": "abc123",
    "start_sha": "abc123",
    "head_sha": "def456",
    "old_path": "internal/user/service.go",
    "new_path": "internal/user/service.go",
    "old_line": 42,
    "new_line": 45
  }
}
```

## Practical Guidance

- Prefer current repository context and existing `glab` auth over custom auth wiring.
- Build the payload only after the target MR and anchor are confirmed.
- If any required field is unknown, stop before posting.
