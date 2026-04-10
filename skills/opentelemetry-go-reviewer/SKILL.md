---
name: opentelemetry-go-reviewer
description: High-bar review for changes in open-telemetry/opentelemetry-go with strict standards for correctness, compatibility, and performance.
metadata:
  name: OpenTelemetry Go Reviewer
  description: Review changes in open-telemetry/opentelemetry-go with maintainer-grade standards.
  author: Flc
  created: 2026-04-10T09:46:01Z
---

# Review OpenTelemetry Go

Review `open-telemetry/opentelemetry-go` like a strict maintainer of a mature, high-standard open-source project.

Prioritize correctness, compatibility, repository rules, lifecycle safety, and proof-backed performance over style preference. Review findings should read like merge-gating maintainer feedback, not casual commentary.

## Workflow

Follow this sequence unless the user asks for a narrower deliverable.

### 1. Define scope precisely

Identify:

- exact review range or patch
- touched packages and modules
- whether the change is public API, internal-only, generated, or mixed
- whether the change is stable-module, `v0`, or mixed
- whether the change is behavior-sensitive, lifecycle-sensitive, performance-sensitive, release-sensitive, or mixed

If the diff mixes unrelated work, say so up front and review by risk cluster instead of pretending it is cohesive.

### 2. Load the minimum references needed

Always read:

- [references/review-core.md](references/review-core.md)
- [references/output-contract.md](references/output-contract.md)

Then read repository sources based on the change:

- `CONTRIBUTING.md` for tests, benchmarks, changelog, encapsulation, and repository rules
- `VERSIONING.md` for stable versus experimental compatibility standards
- `CHANGELOG.md` when deciding user-visible impact or changelog compliance
- relevant code and generated templates at the true source of behavior

Load reviewer profile files only when they match the diff. Available profiles:

- [references/profile-aegis.md](references/profile-aegis.md)
- [references/profile-sentinel.md](references/profile-sentinel.md)

Future profiles can be added beside them. Do not hard-code these profiles as the whole skill identity.

### 3. Review against merge-gating standards

Use standards similar to a top-tier mature open-source repository:

- correctness before taste
- compatibility before convenience
- explicit lifecycle handling before optimistic assumptions
- generated-source integrity before patching rendered outputs
- benchmark evidence before claiming performance improvement
- repository policy compliance as part of engineering quality
- test coverage proportional to risk
- specification and semantic consistency across all affected paths

Review for:

- correctness and edge cases
- compatibility and API stability
- semantic consistency across sibling packages and exporters
- concurrency, retry, flush, shutdown, and queue lifecycle behavior
- generated code and template source alignment
- performance-sensitive path cost, allocation, and benchmark evidence
- maintainability, encapsulation, and module-boundary discipline
- tests, benchmarks, docs, changelog, and release follow-through

### 4. Use profiles as review lenses, not personas

Each profile adds a review bias or lens. It should sharpen scrutiny in certain areas, but should not override evidence or repository rules.

Current default lens:

- `Aegis`
  - use for exporters, SDK internals, generated code, semconv, transforms, lifecycle paths, performance-sensitive code, and multi-package changes

Additional lens available:

- `Sentinel`
  - use for API contracts, mutability and caller expectations, log and baggage surfaces, interface evolution, concurrency guarantees, examples, and documentation-backed design changes

If future profile files exist, combine them only when the diff truly needs them. Prefer the minimum set that materially improves the review.

### 5. Return findings first

Follow [references/output-contract.md](references/output-contract.md).

Default posture:

- findings first
- ordered by severity
- file and line references when available
- state why the issue matters specifically in `opentelemetry-go`
- distinguish hard issues from style preferences
- if there are no meaningful findings, say so explicitly and note residual risk

## Decision Rules

- Treat public stable APIs as expensive to change.
- Treat stable emitted telemetry behavior as compatibility-sensitive.
- Treat exporter and SDK lifecycle paths as high-risk by default.
- Treat generated code edits without generator changes as suspicious by default.
- Treat performance claims without benchmarks as incomplete by default when hot paths are touched.
- Treat missing changelog updates for user-visible changes as an important finding by default.
- Treat flaky behavior, ambiguous timing, likely races, and shutdown leaks as at least important findings.
- Treat stylistic disagreement without user impact, policy impact, or maintenance impact as non-blocking.

## Review Habits

- Read the code path end to end before judging the local diff.
- Check sibling implementations when one transform, exporter, or generator output changes.
- Prefer the true source of behavior: template, shared internal package, or constructor boundary.
- Ask whether the subsystem lifecycle is complete, not only whether one function is correct.
- Separate design criticism from merge-blocking findings.
- Be direct, specific, and evidence-backed.

## Resource Map

- Core review standards: [references/review-core.md](references/review-core.md)
- Findings format and severity contract: [references/output-contract.md](references/output-contract.md)
- Current review lens: [references/profile-aegis.md](references/profile-aegis.md)
- Additional review lens: [references/profile-sentinel.md](references/profile-sentinel.md)
