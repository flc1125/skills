# Specification Review Lenses

Use this file when the diff touches signal behavior, generated telemetry, propagation, semantic conventions, or other areas where OpenTelemetry specification compliance matters.

## Primary rule

Review behavior, not just naming.

The repository explicitly allows Go-idiomatic interfaces that do not mirror specification structure exactly. That flexibility does not extend to behavior that contradicts the specification.

## Always check

- Does the change alter observable behavior against the OpenTelemetry specification?
- Does it change the telemetry emitted by stable surfaces?
- Does it interpret semantic conventions consistently with upstream guidance?
- Does it preserve required context propagation and baggage behavior?
- Does it change sampling, aggregation, export, record mutation, or lifecycle semantics?
- Does it invert context-handling rules between recording paths and control paths?

## Trace-focused review

- sampling decisions and documented behavior
- span lifecycle semantics
- direct recording paths should not stop producing telemetry merely because the caller context is canceled
- trace context propagation and flag handling
- exporter behavior for partial failures, retries, flush, and shutdown
- record ordering or mutation assumptions that could break users

## Metric-focused review

- instrument semantics and temporality expectations
- aggregation behavior and edge cases
- cardinality handling
- exemplar behavior
- measurement hot-path costs
- measurement and recording paths should not incorrectly treat caller cancellation as a reason to skip work
- stable emitted telemetry compatibility

## Log-focused review

- record mutation and cloning safety
- dropped attribute accounting
- processor lifecycle behavior
- log record production should stay separate from shutdown and flush cancellation semantics
- partial export behavior and error surfaces
- deduplication and attribute semantics

## Propagation and baggage

- round-trip and idempotent behavior for inject/extract cycles
- parsing limits and compliance with relevant W3C behavior
- malformed input should not discard valid members unnecessarily
- preservation of required flags and fields
- handling of partial success plus error reporting
- behavior under malformed or oversized input

## Semantic conventions

- generated helpers should align with the targeted semantic convention version
- migrations should not silently drop required attributes
- version bumps should remain coherent with migration guidance
- stable migrations should explain telemetry-shape impact when users may need to update dashboards or alerts

## Exporter and pipeline lifecycle

- `ForceFlush` and `Shutdown` should be safe to call repeatedly when the implementation claims idempotence
- post-shutdown behavior should be explicit and consistent
- retryable and non-retryable failures should be classified correctly
- `ForceFlush` and `Shutdown` ordering should not drop work unexpectedly
- control paths such as export, flush, and shutdown should honor caller cancellation semantics

## Breaking but spec-correct changes

When a change is behaviorally breaking because the old behavior was not spec-compliant:

- explicitly say it is breaking
- explicitly say it is a spec-correction
- check whether changelog and migration guidance are sufficient
- judge whether the implementation now matches the intended spec behavior

## Review consequences

Raise at least an `Important` finding when:

- behavior appears inconsistent with a clear spec requirement
- stable telemetry shape changes without clear justification
- propagation or baggage behavior deviates from required semantics
- semconv changes look incomplete or migration-hostile

Raise `Critical` when a likely spec violation would materially break interoperability or produce wrong telemetry in a stable surface.
