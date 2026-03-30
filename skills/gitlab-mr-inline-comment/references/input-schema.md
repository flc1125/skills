# Input Schema

Use this schema when normalizing inline comments before posting to GitLab.

## Minimum contract

Each comment must have:

- `path`: repository-relative file path
- `line`: 1-based line number in the new file
- `body`: Markdown-ready comment body

Example:

```json
{
  "path": "internal/user/service.go",
  "line": 42,
  "body": "This dereference panics when `user` is nil."
}
```

## Optional fields

- `old_path`: old repository-relative path when rename or move context is known
- `old_line`: 1-based old file line number when known
- `fingerprint`: stable duplicate key when upstream tooling provides one
- `suggestion`: replacement text or a structured suggestion payload

Example:

```json
{
  "path": "internal/user/service.go",
  "line": 42,
  "old_path": "pkg/user/service.go",
  "old_line": 40,
  "body": "Guard `user` before dereferencing it.",
  "fingerprint": "internal/user/service.go:42:nil-user-guard",
  "suggestion": "if user == nil { return err }"
}
```

## Normalization rules

- Normalize path separators to `/`.
- Keep paths relative to the repository root.
- Reject line numbers less than `1`.
- Keep `body` final and publication-ready.
- Do not mix multiple unrelated issues into one comment body.

## Batch shape

Batch input should be a JSON array:

```json
[
  {
    "path": "a.go",
    "line": 10,
    "body": "First comment."
  },
  {
    "path": "b.go",
    "line": 18,
    "body": "Second comment."
  }
]
```

## Invalid input examples

Reject or stop on:

- missing `path`
- missing `line`
- missing `body`
- absolute filesystem paths
- zero-based line numbers
- comments that only contain a title with no actionable body
