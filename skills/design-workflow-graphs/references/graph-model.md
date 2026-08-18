# Graph Model

Use this model when creating or interpreting a Graph Spec.

## Graph Contract

Define the graph identity, goal, entry node, terminal nodes, and global controls. Global controls should include a maximum step count and an elapsed-time budget so unexpected routing cannot run forever.

## State Fields

Define each shared field with:

- `name`: Stable identifier used by node `reads` and `writes`.
- `description`: Semantic meaning, not merely its storage type.
- `owner`: Source or component responsible for the field.
- `merge`: `replace`, `append`, `reduce`, or `reject-conflict`.
- `sensitive`: Whether traces and logs must redact the value.
- `persist`: Whether the field must survive pause or retry.

Use `replace` for one authoritative current value, `append` for event-like collections, `reduce` when parallel results have an explicit reducer, and `reject-conflict` when multiple writes indicate a design error.

## Node Contracts

Use one primary responsibility per node. Supported `kind` values in the template are:

- `task`: Perform bounded deterministic or model-assisted work.
- `router`: Select one downstream route from explicit state.
- `join`: Wait for and combine parallel branch results.
- `approval`: Pause for an external decision.
- `side_effect`: Change an external system.
- `terminal`: End execution without outgoing edges.

Declare `reads`, `writes`, `side_effects`, `idempotent`, `timeout`, and `retry`. A join also declares `join.strategy` as `all`, `any`, or `quorum`; quorum joins include a positive `join.quorum`.

## Edge Contracts

Every edge declares `from` and `to`. Add `when` for a guarded route and `default: true` for its fallback. For a router or any conditional branch, provide one default edge and conditions for the remaining edges.

Multiple unconditional outgoing edges represent fan-out. Record the corresponding branches and join in `parallel_groups` so aggregation semantics remain explicit.

## Loop Contracts

Declare each cycle under `loops` with:

- stable `id`
- complete member-node list
- measurable `exit_when`
- positive `max_iterations` or non-empty `timeout`
- `on_exhausted` destination or outcome

The declared member set must cover the actual cyclic component. A retry on one node is not a substitute for a graph-loop budget.

## Side Effects and Recovery

Use `side_effects` for writes, messages, payments, deployments, and other externally visible mutations. A retried side-effect node must be idempotent or protected by an idempotency key. Describe compensation in the design when a completed effect may need reversal.

Persist state required to resume after approvals, timeouts, and process restarts. Do not rely on transient model context for recovery.

## Core Invariants

- The entry and all terminal identifiers resolve to nodes.
- Every node is reachable from the entry.
- Every non-terminal node can progress.
- Terminal nodes have no outgoing edges.
- Router outcomes are exhaustive and have one fallback.
- Joins have at least two incoming paths and an explicit strategy.
- Cycles are declared and bounded.
- Node state references resolve to declared fields.
- Unsafe side effects are never retried blindly.
