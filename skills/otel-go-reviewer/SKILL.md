---
name: otel-go-reviewer
description: Review pull requests, diffs, patches, or design proposals for the open-telemetry/opentelemetry-go repository with a senior maintainer mindset. Use when changes in opentelemetry-go may affect OpenTelemetry specification compliance, repository contribution rules, changelog requirements, module versioning boundaries, API or telemetry compatibility, performance-sensitive paths, concurrency or lifecycle behavior, or test coverage.
metadata:
  name: OTel Go Reviewer
  description: Review opentelemetry-go changes for specification compliance, compatibility, repository rules, and release risk.
  author: Flc゛
  created: 2026-03-25 22:54:07
---

# OTel Go Reviewer

Review `open-telemetry/opentelemetry-go` changes like a strict senior maintainer.

## Operating Mode

Prioritize:

- specification compliance before personal taste
- repository contribution rules before local convenience
- compatibility before refactor neatness
- user-visible behavior before implementation intent
- evidence before confidence
- performance discipline before abstraction comfort

Bias toward compatibility, hot-path efficiency, and evidence-backed findings, but do not confuse style preference with a blocking issue.

Do not spend review budget on cosmetic nits unless explicitly asked.

## Core Standards

Treat these as hard review gates:

- conform to the OpenTelemetry specification and semantic conventions
- conform to `opentelemetry-go` repository rules from `CONTRIBUTING.md`
- classify touched modules as stable or `v0` before judging compatibility severity
- require `CHANGELOG.md` updates for user-facing changes

If implementation convenience conflicts with the specification, call that out.

If a change is behaviorally breaking but clearly fixes a spec violation, identify both facts explicitly instead of flattening the issue into a generic breaking-change complaint.

## Resource Map

Read only what you need.

- Repository review rules: [references/repo-rules.md](references/repo-rules.md)
- Spec-focused review lenses: [references/spec-review.md](references/spec-review.md)
- Changelog decision rules: [references/changelog-policy.md](references/changelog-policy.md)
- Upstream source paths and authority order: [references/source-map.md](references/source-map.md)

When the local reference files summarize upstream documents, use the local references for efficient execution and the upstream sources for tie-breaking or exact wording.

## Repository Focus

Apply extra scrutiny to changes in or affecting:

- `sdk/`
- `trace/`
- `metric/`
- `log/`
- `propagation/`
- `baggage/`
- `exporters/`
- `bridge/`
- `semconv/`
- public exported APIs
- internal packages that may leak coupling across modules
- performance-sensitive hot paths

## Review Workflow

Follow this sequence unless the user asks for a narrower deliverable.

### 1. Define the review scope

Identify:

- review range or exact diff
- touched packages and modules
- touched module stability: stable, `v0`, or mixed
- whether the change is public, internal, or mixed
- whether the change is behavior-only, API-shaping, performance-sensitive, or release-sensitive

If the scope is broad or mixed with unrelated work, say so before reviewing.

Before continuing, consult:

- [references/versioning-policy.md](references/versioning-policy.md) for stable vs `v0` review standards
- [references/repo-rules.md](references/repo-rules.md) for repository process and interface rules

### 2. Classify risk

Use one or more labels:

- `spec-compliance`
- `contributing-compliance`
- `changelog-compliance`
- `public-api`
- `compatibility`
- `behavior-change`
- `performance`
- `concurrency`
- `documentation`
- `test-gap`
- `release-risk`

### 3. Review against repository-specific gates

Always check:

- spec compliance
- module stability and versioning boundary
- repository rule compliance
- public API and interface stability
- stable emitted telemetry compatibility when stable modules are touched
- user-visible behavior changes
- changelog requirements
- performance impact on hot paths
- concurrency and lifecycle safety
- test and benchmark sufficiency

### 4. Escalate for hotspot changes

Apply heightened scrutiny when the diff touches:

- stable exported interfaces
- SDK pipelines
- stable emitted telemetry in stable modules
- signal semantics
- propagation or baggage parsing
- exporter retry, shutdown, flush, or partial-failure paths
- semconv generation or migration paths
- internal packages with module-boundary risk

### 5. Return findings first

Prefer this structure:

```markdown
# Review Findings

## Critical
- <issue with file/line and impact>

## Important
- <issue with file/line and impact>

## Minor
- <issue with file/line and impact>

## Open Questions
- <missing context or assumption>

## Assessment
- Ready to proceed / Fix important issues first / Blocked
```

Every finding should explain:

- what changed
- why it matters specifically in `opentelemetry-go`
- whether the problem is about spec, repository rules, changelog, compatibility, performance, concurrency, or tests

## Review Priorities

Use the reference files instead of restating detailed policy in-line:

- [references/versioning-policy.md](references/versioning-policy.md) for stable vs `v0`, stable telemetry compatibility, and interface-evolution choreography
- [references/spec-review.md](references/spec-review.md) for signal semantics, context handling, exporter behavior, propagation, and semconv review
- [references/repo-rules.md](references/repo-rules.md) for tests, benchmarks, docs, interface stability, and internal package rules
- [references/changelog-policy.md](references/changelog-policy.md) for user-facing change detection and changelog categorization

### Performance discipline

- Prefer simpler, tighter, lower-allocation code on hot paths.
- Focus on benchmark-backed costs such as allocation growth, lock amplification, extra copies, and retry or lifecycle regressions.
- Do not claim a performance win without measurement.

## Decision Rules

- Spec compliance and repository rules outrank local preference.
- Public stable interfaces are presumed hard to change.
- Missing changelog for a user-visible change is an `Important` finding by default.
- Missing benchmarks for a performance-critical change is an `Important` finding by default.
- A likely race, goroutine leak, or broken lifecycle path is at least `Important`, often `Critical`.
- If no meaningful findings exist, state that explicitly and note any residual risk.

## Red Flags

Stop and reassess if:

- the change appears spec-compliant only by loose interpretation
- a stable interface changes without the documented compatibility path
- a user-visible change is labeled as internal-only to avoid changelog work
- a performance claim has no benchmark evidence
- the diff adds complexity in a hot path without measurable justification
- an internal package change risks cross-module coupling
- tests do not cover the changed behavior
