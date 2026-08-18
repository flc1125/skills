# Graph Model

Use this model when creating or interpreting a Graph Spec.

## Graph Contract

Define the graph identity, goal, entry node, terminal nodes, and global controls. Global controls should include a maximum step count and an elapsed-time budget so unexpected routing cannot run forever.

## State Fields

Define each shared field with:

- `name`: Stable identifier used by node `reads` and `writes`.
- `description`: Semantic meaning, not merely its storage type.
- `type`: Runtime-neutral value shape or schema name.
- `owner`: Source or component responsible for the field.
- `writers`: Complete list of nodes authorized to write the field.
- `merge`: `replace`, `append`, `reduce`, or `reject-conflict`.
- `sensitive`: Whether traces and logs must redact the value.
- `persist`: Whether the field must survive pause or retry.
- `initial`: Whether the field is available before the entry node runs.

Use `replace` for one authoritative current value, `append` for event-like collections, `reduce` when parallel results have an explicit reducer, and `reject-conflict` when multiple writes indicate a design error. The declared `writers` must exactly match node `writes`; ownership alone is not write authorization. Every node read must be definitely available on every route into that node, either initially or from preceding writes.

## Node Contracts

Use one primary responsibility per node. Supported `kind` values in the template are:

- `task`: Perform bounded deterministic or model-assisted work.
- `router`: Select one downstream route from explicit state.
- `join`: Wait for and combine parallel branch results.
- `approval`: Pause for an external decision.
- `side_effect`: Change an external system.
- `terminal`: End execution without outgoing edges.

Declare `reads`, `writes`, `side_effects`, `idempotent`, `timeout`, `retry`, and `failure`. The failure contract contains a `classification` (`retryable`, `correctable`, `rejectable`, or `terminal`) and an `on_failure` node used after local handling is exhausted. A join also declares `join.strategy` as `all`, `any`, or `quorum`; quorum joins include a positive `join.quorum` no greater than the number of incoming edges.

## Edge Contracts

Every edge declares `from` and `to`. Add `when` for a guarded route and `default: true` for its fallback. A guarded edge also declares `reads`, listing every state field used by its condition. Those fields must be available in the source node's declared reads or writes.

For a router or any conditional branch, provide exactly one default edge and conditions for the remaining edges. Duplicate guards are invalid. When more than one guarded edge leaves a node, assign each guard a distinct positive `priority`. This makes overlap deterministic; the validator cannot prove logical exclusivity for arbitrary runtime expressions, so test guard semantics in the target runtime.

Multiple unconditional outgoing edges represent fan-out. Record the corresponding branches and join in `parallel_groups` so aggregation semantics remain explicit. Parallel branches may share a state field only when its merge policy is `append` or `reduce`; `replace` and `reject-conflict` are rejected because completion order would affect the result. `on_partial_failure` must resolve to a node.

## Loop Contracts

Declare each cycle under `loops` with:

- stable `id`
- complete member-node list
- measurable `exit_when`
- explicit `reads` for state referenced by the exit condition
- `evaluate_after` identifying the loop member after which those reads are available
- positive `max_iterations` or non-empty `timeout`
- `on_exhausted` destination node outside the loop

The declared member set must exactly match an actual cyclic component; do not pad it with upstream, downstream, or terminal nodes. A retry on one node is not a substitute for a graph-loop budget.

## Side Effects and Recovery

Use `side_effects` for writes, messages, payments, deployments, and other externally visible mutations. A retried side-effect node must be idempotent or protected by an idempotency key. Describe compensation in the design when a completed effect may need reversal.

An approval node declares `approval.decision_state`, persistent and definitely available `approval.resume_state`, and resolvable `approval.on_rejected` and `approval.on_expired` routes. Persist state required to resume after approvals, timeouts, and process restarts. Do not rely on transient model context for recovery.

At graph level, declare `recovery.checkpoint_state`, `recovery.on_unhandled_error`, and `recovery.on_cancel`. Recovery destinations must resolve to non-join nodes, and checkpoint fields must persist. Failure, partial-failure, exhaustion, and global recovery transitions participate in reachability and cycle checks; a recovery route that re-enters work therefore needs an explicit bounded loop contract.

Declare machine-readable `evaluation.checks`. Each check has a `scope` (`node`, `route`, `join`, `loop`, or `graph`), a resolvable `target`, and a stable `metric` identifier. The runtime or evaluation harness defines how each metric is computed.

## Core Invariants

- The entry and all terminal identifiers resolve to nodes.
- Every node is reachable from the entry.
- Every non-terminal node can progress.
- Terminal nodes have no outgoing edges.
- Router outcomes are exhaustive and have one fallback.
- Joins have at least two incoming paths and an explicit strategy.
- Cycles are declared and bounded.
- Node, guard, loop, recovery, and approval state references resolve to declared fields.
- Every node read is initialized on all normal and recovery paths into the node.
- State writer declarations exactly match node writes.
- Parallel writes use order-independent merge semantics.
- Unsafe side effects are never retried blindly.
