# Current MR Diff Resolution

Use this reference when resolving the live merge request version, the three required SHAs, and whether a target line is safe to anchor.

This skill only posts comments against the current merge request diff state.

## Goal

Before posting, resolve:

- the current merge request version
- `base_sha`
- `start_sha`
- `head_sha`
- whether `new_path` and `new_line` belong to a valid new-side diff anchor

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

Treat the newest returned version as the current candidate only when the response is unambiguous.

Prefer the version entry that clearly represents the latest merge request diff version. In practice, this is usually the last or most recently created version in the response.

## Step 2: Extract the required SHAs from one version entry

From the selected version entry, resolve:

- `base_commit_sha` as `base_sha`
- `start_commit_sha` as `start_sha`
- `head_commit_sha` as `head_sha`

Do not mix fields from different version entries.

Do not reuse SHAs from an earlier command once newer commits may have been pushed to the merge request.

## Step 3: Confirm the target path belongs to the current diff

Confirm that the requested `new_path` appears in the current merge request diff.

Acceptable evidence includes:

- the merge request diff or changes output explicitly includes `new_path`
- the file entry for the current version clearly maps to `new_path`

Reject these shortcuts:

- checking only the repository working tree
- assuming the path is valid because it exists on the branch
- assuming a renamed path still uses its old name

If the file is renamed, deleted, or only available on the old side, stop in v1.

## Step 4: Confirm the target line is safely anchorable

For v1, only post when all of these are true:

- the target is on the new side
- the line number is 1-based and matches the diff view
- the line is part of the current diff context that GitLab can anchor

Strong evidence:

- the diff output clearly shows `new_path` and the requested `new_line`
- the line is visibly present on the new side of the current merge request diff

Weak evidence that is not enough on its own:

- the line exists in the repository file
- the line existed in an earlier version of the merge request
- the line number looks plausible without checking the diff

If you can confirm the SHAs but cannot confirm the line is commentable, fail explicitly instead of attempting a best-effort post.

## Step 5: Post only with one coherent anchor set

Post the inline comment only after:

- one target merge request is selected
- one current version is selected
- all three SHAs come from that version
- `new_path` is confirmed in the current diff
- `new_line` is confirmed as a valid new-side anchor

Do not combine:

- SHAs from one version with a path from another
- repository file inspection with unverified diff assumptions
- fallback guesses from nearby lines

## Failure Policy

Treat these as hard failures:

- versions response is empty or ambiguous
- no trustworthy current version can be selected
- one or more required SHA fields are missing
- `new_path` cannot be confirmed in the current diff
- `new_line` cannot be confirmed as a commentable new-side line

Good failure phrasing:

- `Failed: could not resolve a trustworthy current MR version for !2236.`
- `Failed: could not map internal/user/service.go to the current MR diff.`
- `Failed: line 42 could not be confirmed as a new-side diff anchor.`
