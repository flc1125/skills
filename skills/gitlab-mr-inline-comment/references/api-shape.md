# GitLab MR Inline Comment Payload Shape

Use this reference when exact request fields matter.

The v1 skill posts one inline comment through the merge request discussions endpoint:

```bash
glab api projects/<project>/merge_requests/<mr_iid>/discussions -X POST --input <payload.json>
```

When the current repository context is already correct, prefer placeholder or repository-context usage over hardcoded encoded paths.

## Minimal Payload

```json
{
  "body": "This dereference panics when `user` is nil.",
  "position": {
    "position_type": "text",
    "base_sha": "abc123",
    "start_sha": "abc123",
    "head_sha": "def456",
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
- `position.new_path`: file path on the new side of the diff
- `position.new_line`: 1-based line number on the new side of the diff

## Field Notes

- `new_line` is valid only when the line is commentable on the new side of the current MR diff.
- `new_path` must match the path as GitLab sees it in the current MR diff.
- `base_sha`, `start_sha`, and `head_sha` must come from the current MR diff state, not from a stale local guess.
- v1 does not support `old_path`, `old_line`, or line ranges.

## Practical Guidance

- Prefer current repository context and existing `glab` auth over custom auth wiring.
- Build the payload only after the target MR and anchor are confirmed.
- If any required field is unknown, stop before posting.
