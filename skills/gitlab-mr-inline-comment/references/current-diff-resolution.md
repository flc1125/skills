# Current MR Diff Resolution

Use this reference when resolving the live merge request version, the three required SHAs, and whether a text diff position is safe to anchor.

This skill only posts comments against the current merge request diff state.

## Goal

Before posting, resolve:

- the current merge request version
- `base_sha`
- `start_sha`
- `head_sha`
- whether `old_path`, `new_path`, `old_line`, and `new_line` form one valid text diff anchor

If any of these remain unclear, stop instead of posting.

## Step 1: Read the current merge request versions

Use a merge request versions endpoint first.

Repository-context pattern:

```bash
glab api projects/:fullpath/merge_requests/<mr_iid>/versions
```

Explicit host and project pattern:

```bash
glab api --hostname <host> projects/<encoded_project>/merge_requests/<mr_iid>/versions
```

Treat the latest returned version as the current candidate only when the response is unambiguous.

Prefer the first version entry when the API response follows GitLab's documented ordering for latest-first versions.

## Step 2: Extract the required SHAs from one version entry

From the selected version entry, resolve:

- `base_commit_sha` as `base_sha`
- `start_commit_sha` as `start_sha`
- `head_commit_sha` as `head_sha`

Do not mix fields from different version entries.

Do not reuse SHAs from an earlier command once newer commits may have been pushed to the merge request.

## Step 3: Confirm the target paths belong to the current diff

Confirm that the requested `old_path` and `new_path` match the current merge request diff position.

Acceptable evidence includes:

- the merge request diff or changes output explicitly includes the before and after path
- the file entry for the current version clearly maps to the current position paths

Reject these shortcuts:

- checking only the repository working tree
- assuming the paths are valid because one side exists on the branch
- assuming a renamed path can reuse only one side of the path pair

If the path pair cannot be reconciled to one diff position, stop.

## Step 4: Confirm the target line shape is safely anchorable

For v1, only post when exactly one of these shapes is true:

- added line:
  - `new_line` is set
  - `old_line` is not set
- removed line:
  - `old_line` is set
  - `new_line` is not set
- unchanged line:
  - both `old_line` and `new_line` are set

In every case:

- the relevant line numbers are 1-based
- the line numbers match the current diff view
- the position is part of current diff context that GitLab can anchor

Strong evidence:

- the diff output clearly shows the target path pair and requested line shape
- the line is visibly present on the relevant side of the current merge request diff

Weak evidence that is not enough on its own:

- the line exists in the repository file
- the line existed in an earlier version of the merge request
- the line number looks plausible without checking the diff

If you can confirm the SHAs but cannot confirm the position shape is commentable, fail explicitly instead of attempting a best-effort post.

## Step 5: Post only with one coherent anchor set

Post the inline comment only after:

- one target merge request is selected
- one current version is selected
- all three SHAs come from that version
- `old_path` and `new_path` are confirmed for one diff position
- the line shape is confirmed as one valid text diff anchor

Do not combine:

- SHAs from one version with a path from another
- repository file inspection with unverified diff assumptions
- fallback guesses from nearby lines

## Failure Policy

Treat these as hard failures:

- versions response is empty or ambiguous
- no trustworthy current version can be selected
- one or more required SHA fields are missing
- `old_path` and `new_path` cannot be confirmed for one current diff position
- the line shape cannot be confirmed as a commentable text diff anchor

Good failure phrasing:

- `Failed: could not resolve a trustworthy current MR version for !2236.`
- `Failed: could not reconcile old_path and new_path to one current diff position.`
- `Failed: the requested old_line/new_line shape could not be confirmed as a valid diff anchor.`
