# Verified `glab` Commands For GitLab MR Inline Comments

Checked on 2026-03-31 against:

- local `glab --help` usage patterns
- existing repository skill conventions

Use this file when exact command patterns matter.

The skill should reuse the user's current `glab` authentication whenever possible.

For version-field extraction and anchor validation rules, also read [current-diff-resolution.md](current-diff-resolution.md).

## Authentication and context

- `glab auth status`
- `glab auth status --hostname <host>`
- `glab repo view`

Common patterns:

```bash
glab auth status
glab auth status --hostname gitlab.example.com
glab repo view
GITLAB_HOST=gitlab.example.com glab repo view
glab repo view group/project
```

## Merge request inspection

- `glab mr view <iid>`
- `glab mr view <iid> --repo <group/project>`

Common patterns:

```bash
glab mr view 2236
glab mr view 2236 --repo group/project
GITLAB_HOST=gitlab.example.com glab mr view 2236 --repo group/project
```

## Raw API patterns

Use `glab api` for merge request metadata, versions, and discussions.

Repository-context pattern:

```bash
glab api projects/:fullpath/merge_requests/2236
glab api projects/:fullpath/merge_requests/2236/versions
```

Explicit host and repo pattern:

```bash
glab api --hostname gitlab.example.com projects/group%2Fproject/merge_requests/2236
glab api --hostname gitlab.example.com projects/group%2Fproject/merge_requests/2236/versions
glab api --hostname gitlab.example.com projects/group%2Fproject/merge_requests/2236/discussions -X POST --input /tmp/payload.json
```

## Discussion posting

Added-line pattern:

```bash
glab api projects/group%2Fproject/merge_requests/2236/discussions \
  -X POST \
  -H 'Content-Type: application/json' \
  --input /tmp/gitlab-inline-comment-payload.json
```

Host-aware pattern:

```bash
glab api --hostname gitlab.example.com projects/group%2Fproject/merge_requests/2236/discussions \
  -X POST \
  -H 'Content-Type: application/json' \
  --input /tmp/gitlab-inline-comment-payload.json
```

## Notes

- Prefer current repository context before manually encoding project paths.
- Use encoded project paths only when a raw API path requires them.
- Read the current MR version immediately before posting when SHA freshness matters.
- For text diff notes, build the payload with both `old_path` and `new_path`, then choose the line shape that matches the diff.
