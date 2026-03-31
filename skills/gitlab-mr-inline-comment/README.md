# gitlab-mr-inline-comment

Local Codex skill for posting one anchored inline comment on a GitLab merge request with `glab api`.

## Install

```bash
npx skills add https://github.com/flc1125/skills --skill gitlab-mr-inline-comment
```

## Purpose

Use this skill when you already know what comment to post and where it should land in a GitLab merge request diff.

The workflow is intentionally narrow:

- post one inline comment at a time
- anchor only to a confirmed new-side diff line
- reuse the current `glab` authentication and repository context when possible
- fail explicitly when the anchor is invalid instead of downgrading to a general MR note

## What This Skill Adds

- a focused workflow for resolving one MR target and one inline comment
- explicit rules for reading the current MR diff SHAs before posting
- reference material for `glab` command patterns, payload shape, and failure handling
- a hard-failure policy for wrong hosts, stale SHAs, invalid paths, and invalid line anchors

## Required Inputs

Before posting, the skill needs:

- `mr_iid`
- `body`
- `new_path`
- `new_line`

It also needs one repository context:

- the current repository `glab` context, or
- an explicit GitLab project path such as `group/subgroup/repo`, or
- a GitLab merge request URL

## How It Works

1. Confirm the target GitLab host and repository with the lightest viable `glab` command.
2. Identify one merge request and read the current MR version.
3. Resolve `base_sha`, `start_sha`, and `head_sha` from that current version.
4. Validate that `new_path` and `new_line` are commentable on the new side of the current diff.
5. Build the discussion payload and post it with `glab api`.
6. Return a compact success or failure result with the concrete reason.

## References

The skill keeps detailed command and validation rules in `references/`:

- [references/verified-commands.md](references/verified-commands.md)
- [references/api-shape.md](references/api-shape.md)
- [references/current-diff-resolution.md](references/current-diff-resolution.md)
- [references/failure-modes.md](references/failure-modes.md)

## Requirements

- `glab` must be installed
- the current `glab` session must have access to the target GitLab host and project
- the target file path and line must be valid on the new side of the current MR diff

> [!IMPORTANT]
> This skill does not fall back to a general merge request comment. If the inline anchor cannot be validated, it stops and reports the blocker.

## Scope

Version 1 intentionally does not support:

- old-side line comments
- multi-line or range comments
- batch comment publishing
- draft review workflows
- automatic comment placement from analysis output
