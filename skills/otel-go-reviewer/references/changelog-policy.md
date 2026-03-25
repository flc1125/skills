# Changelog Policy

Use this file to decide whether a review should require a `CHANGELOG.md` update.

## Default posture

Do not treat changelog review as optional bookkeeping.

In `opentelemetry-go`, changelog quality is part of merge readiness for user-facing changes.

## Require a changelog entry when the change is user-facing

Treat a change as user-facing if it affects any of the following:

- exported API
- public behavior
- generated telemetry users may depend on
- configuration surface or environment variables
- compatibility expectations
- deprecations or removals
- user-visible bug fixes
- performance changes users are likely to care about
- migration-relevant semantic convention updates

Missing changelog for these changes is an `Important` finding by default.

## Changelog may be omitted when the change is truly internal-only

Usually acceptable examples:

- refactors with no user-visible behavior change
- test-only changes
- benchmark-only changes
- comment or documentation cleanups with no release-note value
- internal implementation cleanups that do not alter behavior, configuration, telemetry, or compatibility

Do not accept "internal only" at face value if the diff changes observable behavior.

## Format expectations

The project changelog follows Keep a Changelog and SemVer conventions.

Review whether the entry:

- belongs under `Unreleased`
- uses the appropriate section such as `Added`, `Changed`, `Deprecated`, `Fixed`, or `Removed`
- describes the user-visible impact rather than restating internal implementation details
- includes the pull request number in the established style when that information is available

## Reviewer questions

Ask these questions:

- Will users need to know this before upgrading?
- Could dashboards, alerts, integrations, or instrumentation behavior change?
- Would a maintainer mention this in release notes?
- Is the change technically internal but practically observable?

If yes to any of these, lean toward requiring changelog coverage.

## Review consequences

Raise `Important` when:

- a user-facing change has no changelog entry
- the changelog entry is materially misleading
- the section category is clearly wrong for the release note

Raise `Minor` when:

- the change should be in the changelog and likely will be noticed, but the current entry only needs wording or categorization cleanup
