# Source Map

Use this file to locate authoritative upstream sources.

## Authority order

Use this order when guidance conflicts:

1. OpenTelemetry specification for normative behavior
2. `opentelemetry-go` repository policies for repository-specific contribution and versioning rules
3. Local reference summaries in this skill for efficient execution

If local summaries appear stale or conflict with upstream material, prefer the upstream material and say so explicitly in the review.

## Repository policy sources

- `CONTRIBUTING.md`
  - GitHub: <https://github.com/open-telemetry/opentelemetry-go/blob/main/CONTRIBUTING.md>
  - Raw: <https://raw.githubusercontent.com/open-telemetry/opentelemetry-go/main/CONTRIBUTING.md>
- `CHANGELOG.md`
  - GitHub: <https://github.com/open-telemetry/opentelemetry-go/blob/main/CHANGELOG.md>
  - Raw: <https://raw.githubusercontent.com/open-telemetry/opentelemetry-go/main/CHANGELOG.md>
- `VERSIONING.md`
  - GitHub: <https://github.com/open-telemetry/opentelemetry-go/blob/main/VERSIONING.md>
  - Raw: <https://raw.githubusercontent.com/open-telemetry/opentelemetry-go/main/VERSIONING.md>

## OpenTelemetry specification sources

- Specification entry point
  - <https://opentelemetry.io/docs/specs/otel/>
- Trace SDK
  - <https://opentelemetry.io/docs/specs/otel/trace/sdk/>
- Context and propagation
  - <https://opentelemetry.io/docs/specs/otel/context/>
  - <https://opentelemetry.io/docs/specs/otel/baggage/api/>
- Metrics
  - <https://opentelemetry.io/docs/specs/otel/metrics/>
- Logs
  - <https://opentelemetry.io/docs/specs/otel/logs/>
- Semantic conventions
  - <https://opentelemetry.io/docs/specs/semconv/>

## When to load which source

- Reviewing repository process, tests, benchmarks, docs, interface stability, or internal package rules:
  - consult `CONTRIBUTING.md`
- Reviewing changelog necessity or entry style:
  - consult `CHANGELOG.md`
- Reviewing stable versus experimental module expectations:
  - consult `VERSIONING.md`
- Reviewing behavior and signal semantics:
  - consult the relevant OpenTelemetry specification page

## Local companion summaries

- [versioning-policy.md](versioning-policy.md)
  - stable vs `v0` review thresholds
  - stable emitted telemetry compatibility
  - staged API and SDK interface evolution checks

## Usage note

Do not pull all upstream documents into context by default.

Start with the local reference summaries in this skill. Load upstream pages only when:

- exact wording matters
- there is ambiguity
- the change touches a likely spec boundary
- the review needs a source-backed conclusion
