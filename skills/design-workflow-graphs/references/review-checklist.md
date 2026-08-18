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
- Every unconditional fan-out has exactly one parallel group with the same source and direct targets.
- Branch regions have no normal or recovery entries that bypass their source.
- Normal branch exits reach the group join, and joins are not shared across groups.
- Branch-local exceptional exits use the group partial-failure route.
- Guard `reads` declare every state dependency available to the source node.
- Route decisions depend on explicit state and have runtime boundary tests.

## State and Concurrency

- Every read and write references a declared state field.
- State fields have types, owners, complete writer sets, and merge policies.
- Initial fields are explicit, and reads are available on every arrival path.
- Parallel branches do not silently overwrite shared state.
- Concurrent writes use `append` or an explicit `reduce` contract.
- Join completion, timeout, partial failure, and reduction are defined.
- Sensitive state is excluded or redacted from traces.

## Loops and Termination

- Every cycle is intentional and declared.
- Declared loop members exactly match the actual cyclic component.
- Each loop has a progress signal, exit condition, and evaluation point.
- Iteration, time, step, or cost budgets are measurable.
- Budget exhaustion resolves to an explicit node outside the loop.
- Global execution also has a step and time bound.

## Failure and Recovery

- Failures are classified as retryable, correctable, rejectable, or terminal.
- Every non-terminal node has an explicit exhausted-failure destination.
- Retry attempts, delay, and timeout are bounded.
- Successful work can be checkpointed in persistent state and resumed.
- Cancellation, unhandled failure, and partial completion resolve to nodes.
- Repair paths cannot create an unbounded nested loop.
- Failure and recovery transitions participate in cycle detection.

## Side Effects and Approval

- Side effects are explicit and occur as late as practical.
- Retried mutations are idempotent or use an idempotency key.
- Irreversible actions have appropriate validation or approval.
- Approval inputs, decisions, and resume state persist across interruption.
- Approval rejection and expiry have matching outgoing routes.
- Compensation order and failure behavior are defined when rollback matters.
- Node permissions follow least privilege.

## Observability and Evaluation

- Traces record node start, node end, edge selection, state delta, retry, latency, and error.
- Route selection can be explained from recorded state.
- Node, routing, join, loop, and end-to-end quality can be evaluated separately.
- Machine-readable evaluation checks use resolvable targets and stable metric names.
- Logs do not expose credentials or sensitive state.
- Alerts distinguish stalled, exhausted, rejected, and failed executions.

## Severity Guidance

- `critical`: Can cause unauthorized or irreversible external effects.
- `high`: Can produce unbounded execution, duplicate effects, corrupted shared state, or unrecoverable progress loss.
- `medium`: Can select the wrong route, mishandle partial failure, or make recovery unreliable.
- `low`: Reduces clarity, operability, or evaluation quality without directly breaking correctness.
