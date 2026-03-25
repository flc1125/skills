# Repository Review Rules

Use this file when a review needs repository-specific enforcement beyond generic Go review.

## Primary sources

See [source-map.md](source-map.md) for upstream file paths.

This file summarizes the review-relevant parts of `opentelemetry-go` repository policy.

## Core repository standards

- The repository follows the OpenTelemetry specification.
- It values idiomatic Go, but behavior and capability should still conform to the specification.
- `make precommit` is the normal quality gate for formatting, linting, validation, and module checks.

## Tests and benchmarks

- Each functionality should be covered by tests.
- Performance-critical functionality should also be covered by benchmarks.
- PRs adding performance-critical functionality should include `go test -bench` output in the PR description.
- PRs changing performance-critical functionality should include `benchstat` output in the PR description.
- Tests should never leak goroutines.
- Use `ConcurrentSafe` in top-level test names when the test is intended to verify absence of race conditions and benefit from repeated CI execution.

## Documentation and package hygiene

- Each non-internal, non-test package should be documented with Go doc comments, preferably in `doc.go`.
- Prefer examples over long code snippets in doc comments when possible.
- Each non-internal, non-test, non-documentation package should have a `README.md` with at least a title and a `pkg.go.dev` badge.

## API and interface stability

- Stable exported interfaces should not be modified unless the documented repository exception applies.
- Stable interfaces that explicitly warn that methods may be added in minor releases are the exception.
- When functionality must be added to a stable interface that cannot change, prefer adding a separate small interface or a super-set interface instead of mutating the original interface.
- When a specification-defined stable interface must gain a new method, check whether the SDK learned that method one release before the API change so mixed-version upgrade paths remain as safe as the repository expects.

## Configuration pattern expectations

When reviewing option-based construction APIs, prefer the repository's established pattern:

- unexported `config` type by default
- sealed `Option` interface with an unexported `apply` method
- exported `With*` or `Without*` functions wrapping unexported option implementations
- config-by-value patterns that avoid unnecessary heap allocation when practical

Treat deviations from this pattern as reviewable when they reduce consistency, compatibility, or performance.

## Internal package boundaries

- Internal packages should be scoped to a single module.
- A sub-module should not import from a parent internal package, except for the documented repository exceptions.
- Reviewer should treat new cross-module internal coupling as a serious compatibility and upgrade risk.

## Review consequences

Raise at least an `Important` finding when you see:

- missing tests for changed behavior
- missing benchmarks for performance-critical changes
- stable interface mutation without the documented path
- a spec-interface change that skips the repository's staged API/SDK compatibility choreography
- missing package docs or README for a new non-internal package
- internal package coupling that violates module boundaries

Raise `Critical` when the issue risks broken upgrades, compile failures across supported paths, or severe lifecycle/concurrency faults.
