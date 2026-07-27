# Release Pull Request Conventions

Use these conventions after the release range, release-preparation diff, and exact pull request inventory have been verified.

## Audience

Write for maintainers reviewing whether the proposed release is complete and internally consistent.

The description must answer:

1. What does this release PR itself change?
2. What product changes will the resulting release contain?
3. Which compatibility or migration concerns require review?
4. What evidence verifies the release?

Do not turn the body into end-user release notes. Detailed upgrade tutorials, promotional language, and cumulative version history belong in the published Release Note unless they are necessary to review a breaking change.

## Adaptive Structure

Start from this structure and keep only sections supported by evidence:

```markdown
## Summary
<!-- Intended version, release channel, and the purpose of this release PR. -->

## Release Changes
<!-- Version metadata, module alignment, generated artifacts, or final release-branch fixes changed by this PR. -->

## Highlights
<!-- A compact summary of the most important changes being released. -->

## Pull Requests Since <previous-version>
<!-- Exact categorized inventory for <previous-tag>..<pr-base-sha>. -->

### Breaking API Changes
- ...

### New Components and Features
- ...

### Fixes and Behavioral Changes
- ...

### Documentation and Repository Structure
- ...

### Dependencies, CI, and Maintenance
- ...

## Migration Summary
<!-- Required downstream actions only. Link detailed release or migration documentation when available. -->

## Validation
- ...

## Notes
<!-- Important scope boundaries, known gaps, or follow-up release work. -->
```

`Release Changes` and `Pull Requests Since ...` serve different purposes. Never collapse them in a way that implies version-file changes are the release's only content.

## Inventory Rules

- Preserve exact PR numbers and link each PR when the repository convention supports links.
- Prefer one category per PR. If a PR genuinely spans categories, list it once in the category matching its primary user impact.
- Keep dependency updates compact, but do not omit them from the exact inventory.
- Identify direct commits without PRs separately when they are inside the range.
- Treat reverts as changes in their own right and explain whether the reverted capability remains in the release.
- Do not count the release PR itself in a previous-tag-to-PR-base range.
- Do not list older prerelease work as newly introduced unless the chosen comparison range includes it.

## Breaking Changes

For each breaking change, include enough information to verify:

- the removed or changed public API, module, configuration, or behavior
- affected consumers
- replacement or explicit absence of a replacement
- ordered migration action
- behavior that remains unchanged when the scope could be misunderstood

A large refactor is not automatically breaking. A small default or semantic change can be breaking.

## Writing Rules

- Lead with the release outcome, not a file-by-file narration.
- Use stable version names and repository-relative identifiers.
- Keep claims factual and traceable.
- Avoid empty sections, duplicated bullets, and raw commit dumps.
- Do not force Markdown source lines to a fixed width.
- Do not publish local paths, temporary filenames, credentials, private hosts, or shell history.
- State only validation that actually ran and distinguish blocked checks from successful checks.

## Completeness Check

Before handoff, verify:

- intended version matches every release metadata surface
- previous tag and PR base resolve to the stated SHAs
- PR count equals the deduplicated inventory
- every inventory PR is inside the chosen range
- the target release PR is excluded or included for an explicitly verified reason
- every breaking change has a migration action
- no highlighted change exists only in an abandoned plan or stale PR description
- comparison and release links point to the intended repository and versions
