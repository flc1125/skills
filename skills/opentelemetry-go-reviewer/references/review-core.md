# Review Core

Use this file whenever actively reviewing `open-telemetry/opentelemetry-go`.

## Core Standards

Apply these as default merge-gating standards:

- correctness before personal taste
- repository rules before local convenience
- compatibility before refactor neatness
- explicit lifecycle handling before optimistic control flow
- specification and semantic consistency before local patch success
- evidence before confidence
- tests and benchmarks proportional to risk

## Always Check

- correctness of behavior, including edge cases
- compatibility of public APIs and stable-module behavior
- changelog requirement for user-visible changes
- versioning and module-boundary implications
- test coverage for changed behavior
- benchmark evidence for performance-sensitive changes
- concurrency and lifecycle safety
- maintainability of the chosen abstraction or boundary

## High-Risk Areas

Treat these areas as requiring extra scrutiny:

- `sdk/`
- `trace/`
- `metric/`
- `log/`
- `baggage/`
- `propagation/`
- `exporters/`
- `bridge/`
- `semconv/`
- generated code and generator templates
- release and version wiring

## Review Questions

- What user-visible behavior changed?
- What compatibility promise applies here?
- Is the true source of this behavior local code, shared code, or generated code?
- Are sibling packages or parallel exporters now inconsistent?
- Does the change alter queueing, retry, flush, shutdown, or cancellation behavior?
- Does the change touch a hot path, allocation pattern, or lock behavior?
- Are tests exercising the changed behavior rather than only happy paths?
- Did changelog, docs, versioning, and release surfaces move with the change?

## Evidence Rules

- Do not claim a performance improvement without benchmark evidence.
- Do not claim a breaking change without naming the affected contract.
- Do not praise or criticize generated output without checking the generator or template source.
- Do not trust flaky-test fixes unless the underlying nondeterminism is understood.
- Do not elevate style preferences into important findings unless they affect maintenance, safety, or policy.
