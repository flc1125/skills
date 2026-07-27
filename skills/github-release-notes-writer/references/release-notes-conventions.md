# GitHub Release Notes Conventions

Use these conventions after the target version, exact comparison range, pull request inventory, and important user impacts have been verified.

## Audience

Write for users deciding whether and how to upgrade.

The Release Notes must answer:

1. What is this release?
2. Why should users care?
3. How do users upgrade?
4. What must users change to remain compatible?
5. What exactly changed since the immediate previous release?

Do not narrate the release-preparation diff as though it were the release's main value.

## Adaptive Structure

Use the smallest set of sections that explains the release completely:

```markdown
# <version>

<!-- One short paragraph positioning the release. -->

## Upgrade

<!-- Exact package, module, image, command, or installation guidance. -->

## Highlights

<!-- A curated summary of the most important user-visible outcomes. -->

## Changes Since <previous-version>

<!-- Important features, fixes, and behavioral changes in the exact delta. -->

## Breaking Changes

<!-- Affected users, before/after APIs or behavior, and required actions. -->

## Migration Guide

1. ...
2. ...

## What's Changed

### New Features
- ...

### Fixes and Behavioral Changes
- ...

### Documentation
- ...

### Dependencies and Maintenance
- ...

**Full Changelog**: <comparison-link>
```

For a stable major release after prereleases, add a concise major-version migration section. Keep `What's Changed` scoped to the immediate previous tag. Link earlier prerelease notes instead of duplicating their full inventories. If the previous stable major is not an ancestor of the target tag, label this section as migration context rather than an exact Git range.

Omit empty headings. Preserve a repository-provided title or introductory convention when one exists.

## Upgrade Guidance

- Give a direct upgrade command or dependency declaration when repository evidence supports one.
- For a multi-module repository, state whether users must align all directly used modules to the release version.
- Name minimum language, runtime, platform, database, or dependency requirements when they changed.
- Separate required migration work from optional cleanup or newly recommended practices.
- Do not promise compatibility that has not been verified.

## Highlights

- Select outcomes that affect user capability, correctness, safety, performance, operability, or upgrade decisions.
- Combine related PRs into one coherent outcome.
- Do not promote dependency churn, generated metadata, or the release PR itself as a headline unless it has material user impact.
- Keep the number of highlights proportional to the release. A long release can still have a short highlight section.

## Breaking Changes and Migration

For each incompatible change:

- name the affected API, module, configuration, wire format, data, or behavior
- identify which users are affected
- show the replacement or state that none exists
- give ordered migration actions
- call out changed semantics such as context, cancellation, panic, ordering, timeout, retry, lifecycle, persistence, or concurrency
- state important preserved behavior when it prevents over-migration

Use a compact mapping table when several old APIs have direct replacements:

```markdown
| Before | After |
| --- | --- |
| `oldpkg.Run(...)` | `newpkg.Run(...)` |
```

Use self-contained code examples only for the primary migration path. Verify imports, signatures, and behavior against the target release.

## Exact Inventory Rules

- Preserve every verified PR in the immediate comparison range.
- Keep each PR in one primary category unless the repository convention requires another layout.
- Include author attribution when the repository's generated format uses it.
- Include release-preparation PRs when they are inside the range, but categorize them as release or maintenance work.
- Summarize dependency updates compactly without dropping them from the complete inventory.
- Identify direct commits without PRs.
- Explain reverts so users can tell whether a previously announced capability remains.
- Do not move older prerelease changes into the exact delta merely to make the stable release look more complete.

## Writing Rules

- Lead with user outcomes and required actions.
- Use factual, calm language instead of promotional claims.
- Prefer short paragraphs and scannable bullets.
- Do not force Markdown source lines to a fixed width.
- Do not copy raw commit logs when a user-centered category is clearer.
- Do not publish local paths, temporary filenames, private infrastructure, credentials, or shell output.
- Keep PR titles accurate when quoted; clarify user impact separately rather than rewriting history.
- Link directly to PRs, prior releases, migration documentation, and the exact comparison when useful.

## Completeness Check

Before handoff, verify:

- target and previous tags resolve to the stated commits
- any cumulative stable-to-major Git range has a verified ancestor relationship; otherwise it is labeled as conceptual migration context
- final PR count equals the deduplicated inventory
- supplied baseline and final inventory reconcile exactly or have explained differences
- every highlight is represented by released code or documentation
- every breaking change has a concrete migration action
- upgrade commands use the target version and correct module or package paths
- prerelease-to-stable notes separate exact delta from cumulative migration context
- the Full Changelog link compares the immediate previous tag with the target tag
- the draft contains no forced line wrapping or machine-specific content
