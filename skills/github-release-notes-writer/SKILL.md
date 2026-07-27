---
name: github-release-notes-writer
description: Draft or update user-focused GitHub Release Notes from verified tags, commits, pull requests, existing releases, and supplied changelog baselines. Use when preparing prerelease or stable release notes, turning GitHub's generated What's Changed list into a curated narrative, documenting upgrades or breaking changes, or producing a major-version migration summary. Do not use merely to validate a repository changelog fragment.
metadata:
  name: GitHub Release Notes Writer
  description: Write accurate, user-focused GitHub Release Notes with practical upgrade and migration guidance.
  author: Flc
  created: "2026-07-27T01:03:37Z"
---

# GitHub Release Notes Writer

Write Release Notes that help users understand why a release matters and how to upgrade safely without losing the exact changelog record.

## Operating Boundaries

- Default to a local Markdown draft. Do not create, edit, publish, or delete a GitHub Release unless the user explicitly asks for that write.
- Inspect release URLs, tags, pull requests, and repository content read-only when the user asks to research or draft.
- Treat Release Notes as user- and upgrader-facing. Do not copy a reviewer-focused Release PR description unchanged.
- Preserve the exact changelog baseline while curating its narrative and categories.
- Prefer current code, tests, documentation, tags, and GitHub state over recalled conversation details.

## Workflow

### 1. Discover release conventions and inputs

Read applicable repository instructions, release documentation, recent Release Notes, version manifests, and any user-provided baseline.

Identify:

- repository and target version
- prerelease or stable status
- immediate previous tag
- target tag or immutable target commit
- release branch when the target tag does not yet exist
- last stable version of the previous major when preparing a stable major release
- monorepo or multi-module upgrade requirements
- requested output path and whether publication is authorized

Follow the repository's established tone and heading style unless the user asks for another format.

### 2. Resolve the exact changelog range

Use the immediate previous tag to target tag or commit for `What's Changed` and the Full Changelog link:

```bash
git fetch --tags
git rev-parse <previous-tag>^{commit}
git rev-parse <target-tag-or-commit>^{commit}
git log --format='%H%x09%s' <previous-tag>..<target>
```

When the target is a stable major release following prereleases, use two layers:

| Layer | Purpose |
| --- | --- |
| Immediate previous tag to target | Exact PR inventory and Full Changelog |
| Previous stable major to target | Concise cumulative upgrade and migration context, not automatically an exact Git range |

Do not replace the exact delta inventory with the cumulative major-version story. Link earlier prerelease notes when they already contain detailed history.

Before describing the previous stable major as a Git comparison range, verify ancestry:

```bash
git merge-base --is-ancestor <previous-stable-tag> <target>
```

If it is not an ancestor, treat the stable-to-major relationship as a conceptual migration scope assembled from published releases, migration documentation, branch history, and final APIs. Do not assign it an exact commit or PR inventory and do not present a three-dot comparison link as authoritative.

If the target tag does not exist, label the range as provisional and do not claim a final Full Changelog URL is verified.

### 3. Build and reconcile the exact inventory

Treat the resolved commit range as the primary membership boundary. Extract PR references from commits and resolve ambiguous commits through GitHub commit-to-PR associations.

If the user provides a generated `What's Changed` baseline:

- preserve it as an inclusion source
- compare its PR-number set with the Git range
- resolve duplicates, missing PRs, direct commits, reverts, and release-preparation PRs
- explain every deliberate addition or removal

Include the release-preparation PR when its merged commit is inside the final range or the verified baseline includes it. Keep it in the inventory without presenting metadata alignment as a product highlight.

Maintain an internal deduplicated list containing PR number, title, author, category, and user impact.

### 4. Research user impact

Inspect the important PRs, final code, tests, examples, and documentation. Determine:

- new user-visible capabilities
- important fixes and changed behavior
- breaking APIs, defaults, configuration, data, or operational assumptions
- required and optional upgrade actions
- supported runtime or dependency changes
- multi-module version alignment requirements

Do not infer breaking behavior from titles alone. Verify final signatures and semantics. Include short before-and-after examples only when they materially improve migration safety.

### 5. Draft the Release Notes

Read [references/release-notes-conventions.md](references/release-notes-conventions.md) completely before drafting.

Use an adaptive structure. Lead with the release outcome and upgrade command, then explain highlights and migrations before the complete categorized inventory.

For multi-module ecosystems, tell users to upgrade every directly used module to a compatible release version when the repository evidence requires alignment.

### 6. Validate the draft

Before handoff or publication:

- verify version names, tag SHAs, comparison range, PR count, and deduplicated PR-number set
- compare the final inventory against the supplied baseline, if any
- ensure every highlight and migration claim is supported by final repository evidence
- ensure breaking changes identify affected users and required actions
- verify code examples against the released API
- verify the Full Changelog link uses the immediate previous tag and target tag
- remove absolute local paths, credentials, private hosts, temporary filenames, and machine-specific output
- keep ordinary Markdown paragraphs naturally wrapped; never enforce a source-code line-width limit

### 7. Write locally by default

Use the user's requested destination. Otherwise create a clearly named temporary Markdown draft outside the repository unless repository instructions specify a release-draft location.

Report the path and leave GitHub unchanged.

### 8. Publish only with explicit authorization

When the user explicitly asks to create or update the GitHub Release, use the reviewed local draft:

```bash
gh release edit <tag> --notes-file <draft-file>
gh release view <tag> --json tagName,name,isDraft,isPrerelease,body
```

Use `gh release create` only when the user explicitly asks to create a new Release and the target tag, title, draft/prerelease state, and target commit are verified.

After any write, read the Release back and verify its body and state. Do not alter assets, tags, titles, draft state, prerelease state, or latest-release status unless requested.

## Handoff

Report:

- target release and exact changelog range
- cumulative migration range or conceptual scope when used
- exact included PR count
- supplied-baseline reconciliation result
- local draft path
- whether GitHub was changed
- provisional links, missing evidence, or intentionally omitted content
