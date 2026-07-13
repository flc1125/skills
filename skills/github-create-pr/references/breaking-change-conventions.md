# Breaking Change and Migration Conventions

Use this reference when a pull request is incompatible, or when the user asks for breaking changes, before-and-after comparisons, upgrade notes, or migration guidance.

## Identify Breaking Changes

Treat a change as breaking when downstream users must change code, configuration, data, deployment, or operating assumptions to upgrade safely.

Common examples include:

- removing or renaming public functions, types, fields, constants, packages, modules, commands, or flags
- changing function signatures, interfaces, return values, error types, module paths, imports, configuration keys, or environment variables
- changing defaults or behavior involving context, cancellation, panic, ordering, timeouts, retries, persistence, serialization, lifecycle, or concurrency
- changing schemas, wire formats, stored data, deployment requirements, or supported runtime versions
- removing an extension point without a direct replacement

The following are usually not breaking by themselves:

- internal refactors that preserve observable behavior
- documentation or test-only changes
- compatible additive APIs
- performance improvements that preserve contracts
- large diffs with no required downstream action

Do not infer compatibility from a commit title alone. Verify it against the base-to-head diff, current public surface, tests, and documented behavior.

## Adaptive Template

Start with the default PR body and add only the sections supported by the change:

```markdown
## Summary
<!-- 1-2 sentences describing the outcome -->

## Changes
- <!-- new capabilities and meaningful behavior -->

## Motivation
- <!-- why the change is needed -->

## Breaking Changes
- <!-- removed or changed public surfaces -->
- <!-- incompatible behavior changes -->

## Before and After
<!-- focused code examples or an old-to-new mapping table -->

## Migration
1. <!-- ordered upgrade action -->
2. <!-- ordered upgrade action -->

## Behavior and Compatibility
- <!-- important semantic changes -->
- <!-- contracts or scope boundaries that remain unchanged -->

## Testing
- <!-- commands or checks actually completed -->
```

Omit `Breaking Changes`, `Before and After`, `Migration`, or `Behavior and Compatibility` when the section would be empty or add no material reviewer value.

## Write Each Section Deliberately

### Changes

- Describe capabilities, public API changes, and meaningful runtime behavior.
- Group related changes instead of narrating individual files or commits.
- Distinguish additions, removals, and changed behavior when the scope is large.

### Breaking Changes

- Separate public surface changes from behavior changes when both exist.
- Name the affected API, configuration, protocol, or runtime contract precisely.
- Explain which downstream users are affected and what action they must take.
- Do not hide breaking behavior under a generic `Changes` bullet.

### Before and After

- Prefer a compact mapping table when several APIs have direct replacements.
- Use code examples for the primary migration path or when behavior cannot be explained clearly in a table.
- Include required imports or surrounding declarations when needed for the example to be self-contained.
- Keep examples aligned with the final code, not an earlier design proposal.

Example mapping:

```markdown
| Before | After |
| --- | --- |
| `oldpkg.Run(...)` | `newpkg.Do(...)` |
| `WithPolicy(...)` | `WithMaxAttempts(...)` and `WithBackoff(...)` |
| `legacy.Codec` | `legacy.Codec{}` |
```

### Migration

- Provide ordered, actionable upgrade steps.
- Cover import or module path changes, replacements, configuration updates, and required data or deployment actions.
- Call out changed defaults and semantics even when the new code looks similar.
- State explicitly when an API has no direct replacement.
- Distinguish required migration actions from optional follow-up improvements.
- Keep migration history in the PR body unless the user or repository convention separately requires documentation changes.

### Behavior and Compatibility

- Explain error, context, cancellation, panic, timeout, retry, ordering, concurrency, persistence, or lifecycle semantics that affect reviewers or users.
- State important unchanged contracts when a scoped refactor could otherwise look broader than it is.
- Use this section for operational risk and compatibility boundaries, not implementation trivia.

### Testing

- State only commands and checks that actually completed.
- Include meaningful coverage, race, build, lint, migration, or compatibility validation when relevant.
- Mention skipped or blocked validation with the reason when it affects confidence.
- Summarize results instead of pasting machine-specific output.

## Completeness Check

Before publishing the PR body, verify:

- every removed or renamed public surface has a replacement, migration action, or explicit no-replacement statement
- every incompatible behavior change explains its downstream impact
- before-and-after examples match the final diff and are internally coherent
- migration steps include required imports, configuration, data, or deployment changes
- preserved contracts are stated when they materially narrow the review scope
- no section claims documentation, tests, or validation that did not actually change or run
- no local paths, temporary plan files, credentials, hosts, or machine-specific details are exposed
