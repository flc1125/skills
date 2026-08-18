# Workflow Graph Review Checklist

Use the applicable checks. Report findings by severity and identify the affected graph element.

## Structure

- Entry node exists and is unique.
- Terminal nodes exist and have no outgoing edges.
- All nodes are reachable from the entry.
- Every non-terminal node has an outgoing path.
- Edges reference valid nodes.
- Node responsibilities are bounded and distinguishable.

## Routing

- Conditional outcomes are exhaustive.
- Conditions are mutually exclusive or have explicit priority.
- Every router has exactly one fallback.
- Alternative routing is not confused with parallel fan-out.
- Route decisions depend on explicit state.

## State and Concurrency

- Every read and write references a declared state field.
- State fields have owners and merge policies.
- Parallel branches do not silently overwrite shared state.
- Join completion, timeout, partial failure, and reduction are defined.
- Sensitive state is excluded or redacted from traces.

## Loops and Termination

- Every cycle is intentional and declared.
- Each loop has a progress signal and exit condition.
- Iteration, time, step, or cost budgets are measurable.
- Budget exhaustion has an explicit route or terminal outcome.
- Global execution also has a step and time bound.

## Failure and Recovery

- Failures are classified as retryable, correctable, rejectable, or terminal.
- Retry attempts, delay, and timeout are bounded.
- Successful work can be checkpointed and resumed.
- Cancellation and partial completion are defined.
- Repair paths cannot create an unbounded nested loop.

## Side Effects and Approval

- Side effects are explicit and occur as late as practical.
- Retried mutations are idempotent or use an idempotency key.
- Irreversible actions have appropriate validation or approval.
- Approval inputs and decisions persist across interruption.
- Compensation order and failure behavior are defined when rollback matters.
- Node permissions follow least privilege.

## Observability and Evaluation

- Traces record node start, node end, edge selection, state delta, retry, latency, and error.
- Route selection can be explained from recorded state.
- Node, routing, join, loop, and end-to-end quality can be evaluated separately.
- Logs do not expose credentials or sensitive state.
- Alerts distinguish stalled, exhausted, rejected, and failed executions.

## Severity Guidance

- `critical`: Can cause unauthorized or irreversible external effects.
- `high`: Can produce unbounded execution, duplicate effects, corrupted shared state, or unrecoverable progress loss.
- `medium`: Can select the wrong route, mishandle partial failure, or make recovery unreliable.
- `low`: Reduces clarity, operability, or evaluation quality without directly breaking correctness.
