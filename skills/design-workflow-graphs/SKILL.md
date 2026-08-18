---
name: design-workflow-graphs
description: Design, transform, review, and evolve graph-based workflows with explicit state, nodes, edges, routing, concurrency, joins, loops, approvals, recovery, termination, side effects, and observability. Use when Codex needs to decide whether graph orchestration fits a process; turn requirements, a linear workflow, or an agent loop into a workflow graph; audit an existing DAG or state graph; or produce a framework-neutral graph specification before implementation.
metadata:
  name: Design Workflow Graphs
  description: Design and review reliable graph-based workflows with explicit control flow, state, failure, and termination semantics.
  author: FLC
  created: "2026-08-18T15:14:41Z"
---

# Design Workflow Graphs

Design workflow graphs as explicit engineering contracts rather than decorative diagrams. Make control flow, state mutation, termination, failure behavior, and side effects reviewable before choosing an execution framework.

## Operating Principles

- Start from the objective, state, and termination contract; do not start by inventing agents or nodes.
- Use a graph only when branching, parallelism, bounded iteration, durable recovery, approval gates, or independently observable stages justify it.
- Prefer a linear workflow or one bounded agent loop when it is sufficient.
- Keep deterministic control in edges, guards, budgets, and validation. Use model reasoning inside nodes only where judgment is required.
- Give each state field and side effect an owner.
- Bound every cycle by attempts, elapsed time, cost, or another measurable budget.
- Place irreversible side effects after validation and approval whenever possible.
- Keep the core design framework-neutral. Map it to a runtime only after the graph contract is stable.

## Resource Map

Load only what the request needs:

- For field definitions and invariants, read [references/graph-model.md](references/graph-model.md).
- For reusable topologies, read [references/graph-patterns.md](references/graph-patterns.md).
- For audits or final design review, read [references/review-checklist.md](references/review-checklist.md).
- To create a machine-readable artifact, copy [assets/graph-spec.json](assets/graph-spec.json) and adapt it.
- To validate a Graph Spec, run `python3 scripts/validate_graph_spec.py --strict path/to/graph.json`.

## Choose the Work Mode

Choose one primary mode and state it when the distinction affects the deliverable:

- `design`: Create a new workflow graph from goals and constraints.
- `transform`: Convert a linear process, implicit agent loop, or prose procedure into an explicit graph.
- `review`: Find structural, state, concurrency, recovery, termination, and side-effect defects in an existing graph.
- `evolve`: Revise a graph using observed failures, traces, evaluation results, or changed requirements.

Do not force the full design workflow onto a narrow request. For example, review only the supplied graph when the user asks for an audit.

## Design Workflow

### 1. Frame the contract

Establish:

- objective and measurable completion criteria
- inputs, outputs, actors, systems, and trust boundaries
- irreversible actions and required approvals
- latency, cost, reliability, and compliance constraints
- what must persist across retries or pauses

Separate known facts, bounded assumptions, and decisions. Ask only when a missing decision would materially change topology or safety.

### 2. Decide whether a graph is warranted

Use a graph when at least one material requirement needs explicit topology:

- conditional routing with different downstream work
- parallel branches followed by defined aggregation
- iteration with measurable exit conditions
- pause and resume, durable recovery, or human approval
- stages with different permissions or side-effect boundaries
- independent node-level observability or evaluation

Recommend a simpler pipeline or loop when the graph adds ceremony without improving control, recovery, or understanding.

### 3. Define state before nodes

List every shared state field and define:

- meaning and type
- initial source
- owner or authorized writers
- merge strategy for concurrent or repeated writes
- persistence and sensitivity requirements
- retention or deletion rule when material

Keep large artifacts outside shared state when a reference is sufficient. Do not use conversation history as an implicit state schema.

In a Graph Spec, declare `state.writers` as the complete authorization set. It must exactly match the nodes that list the field under `writes`. Mark fields available before entry with `initial: true`; every node read must be available on every normal or recovery path into that node.

### 4. Define node contracts

Give every node one primary responsibility. Specify:

- required reads and produced writes
- deterministic work versus model judgment
- tools, permissions, and external dependencies
- timeout and retry policy
- idempotency and side effects
- success, failure, and cancellation outcomes

Split a node when its outputs need different retry, permission, evaluation, or ownership semantics. Merge nodes when separation creates no meaningful control boundary.

Classify each non-terminal node's exhausted failure as `retryable`, `correctable`, `rejectable`, or `terminal`, and route it to an explicit `on_failure` node.

### 5. Define edges and routing

For every edge, define its source, destination, and reason for selection.

- Make conditional routes collectively exhaustive.
- Make conditions mutually exclusive or define priority explicitly.
- Add a default route for unclassified results.
- Declare each guard's state dependencies under edge `reads`.
- Keep routing decisions based on explicit state, not hidden prompt context.
- Distinguish alternative branches from fan-out parallelism.

Use distinct positive priorities whenever multiple guarded edges leave the same node. Treat the validator as a structural check: arbitrary guard expressions still need runtime-specific tests for meaning, overlap, and boundary behavior.

### 6. Add joins, loops, and approvals

For parallel work, define the fan-out source, exact direct branch entries, join policy, timeout behavior, partial-result policy, and state merge semantics. Require every node with multiple unconditional outgoing edges to have exactly one matching parallel group; never model guarded or default alternatives as parallel branches. Reject normal or recovery entries from outside a branch, normal exits that bypass the group join, branch-local exceptional exits that bypass `on_partial_failure`, non-branch inputs to the join, and reuse of one join by multiple groups. Keep graph-wide cancellation and unhandled-error recovery separate.

Do not allow concurrent branches to write the same `replace` or `reject-conflict` field. Use independently owned fields, or an explicit `append` or `reduce` contract when concurrent aggregation is intentional.

For every loop, define:

- loop members
- progress signal
- exit condition
- member after which the exit condition is evaluated
- maximum iterations, duration, or cost
- behavior when the budget is exhausted

Require the declared loop members to match the actual cyclic component exactly. Do not add downstream nodes merely to make an exit condition appear available.

Represent human approval as an explicit resumable boundary. Persist the decision input, approver identity when required, decision, and continuation state.

Make approval rejection, expiry, loop exhaustion, partial failure, unhandled failure, and cancellation resolve to explicit nodes rather than free-form outcomes.

Include these implicit failure and recovery transitions when checking reachability and cycles. Re-entering normal work from recovery requires its own measurable loop boundary.

### 7. Design failure and side-effect behavior

Classify failures as retryable, correctable, rejectable, or terminal. Prefer local recovery over restarting the entire graph.

- Retry only when the operation is safe or protected by an idempotency key.
- Route correctable output to a bounded repair path.
- Define compensation for completed irreversible steps when rollback matters.
- Preserve enough checkpoint state to resume without repeating successful side effects.
- Define timeout, cancellation, and partial-completion behavior.

### 8. Add observability and evaluation

Capture at least node start, node end, selected edge, state delta, latency, retry, and error events. Redact sensitive values.

Define evaluation at the smallest useful level:

- node output quality
- route-selection correctness
- join or reduction correctness
- loop progress and budget use
- end-to-end completion and side-effect correctness

### 9. Validate and deliver

Read [references/review-checklist.md](references/review-checklist.md). When producing a Graph Spec, run the bundled validator in strict mode and fix errors and warnings before handoff.

The validator checks structural contracts and reference integrity. It does not interpret arbitrary guard languages or prove runtime behavior; add execution tests for route boundaries, recovery, resume, and side-effect semantics.

## Deliverables

Match the output to the request. A complete design should normally include:

1. **Suitability decision**: Why a graph, pipeline, or loop is appropriate.
2. **Assumptions and constraints**: Facts, decisions, and unresolved gates.
3. **State contract**: Fields, writers, merge rules, persistence, and sensitivity.
4. **Node contracts**: Responsibilities, reads, writes, retries, and side effects.
5. **Edge contracts**: Routing conditions, defaults, fan-out, joins, and loop exits.
6. **Topology**: A compact Mermaid flowchart.
7. **Graph Spec**: A machine-readable JSON artifact when implementation or validation is expected.
8. **Risk review**: Termination, concurrency, recovery, approval, and observability findings.
9. **Implementation handoff**: Runtime-specific mapping only when requested.

For reviews, lead with findings ordered by severity and cite the affected nodes, edges, or state fields. Do not redesign unaffected areas unless needed to demonstrate a fix.

## Quality Bar

Before finishing, verify that:

- every node is reachable from the entry
- every non-terminal node has an outgoing path
- every terminal state is explicit
- every branch has total routing behavior
- every join defines completion and merge semantics
- every quorum is achievable from its incoming paths
- every cycle has a measurable bound and exhaustion path
- concurrent writers have a declared merge or conflict policy
- retries cannot duplicate unsafe side effects
- approval and resume state can survive process interruption
- failure, cancellation, and partial-result routes resolve to nodes
- node reads are initialized on every normal and recovery arrival path
- failure and recovery routes cannot create undeclared cycles
- evaluation checks identify resolvable targets and stable metrics
- observability can explain which edge ran and why
- the design can be understood without framework-specific source code
