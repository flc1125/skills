# Team Patterns

Use these patterns as reusable starting points. Replace a named role with another role that satisfies the same capability tags when that is a better fit.

## Discovery Pattern

Use for repository exploration, architecture mapping, requirements triage, and log or artifact analysis.

- Required roles: `lead`, one or more `explorer`
- Optional roles: `planner`, `reviewer`
- Flow:
  1. Let the `lead` define the questions and slices.
  2. Let `explorer` roles work in parallel by slice.
  3. Let the `lead` synthesize findings and next steps.
- Write policy: `read-only`

## Review Pattern

Use for change review, regression hunting, risk triage, and validation of another agent's work.

- Required roles: `lead`, `reviewer`, `tester`
- Optional roles: `explorer`
- Flow:
  1. Let the `lead` define scope and evidence needed.
  2. Let the `reviewer` inspect correctness and maintainability.
  3. Let the `tester` validate commands, test coverage, and edge cases.
  4. Let the `lead` combine findings by severity and confidence.
- Write policy: `read-only`

## Delivery Pattern

Use for bounded implementation where work can be split into owned slices.

- Required roles: `lead`, `implementer`, `tester`
- Optional roles: `planner`, `reviewer`, `integrator`
- Flow:
  1. Let the `lead` or `planner` freeze the contract and slice boundaries.
  2. Let `implementer` roles own disjoint slices in parallel.
  3. Let the `integrator` land shared follow-up only if overlap appears.
  4. Let the `tester` and `reviewer` validate the result.
- Write policy: `disjoint-write` by default

## Refactor Pattern

Use for cross-cutting changes, shared interfaces, migrations, schema work, or hotspot files.

- Required roles: `lead`, `planner`, `integrator`
- Optional roles: `explorer`, `implementer`, `reviewer`, `tester`
- Flow:
  1. Let the `planner` and `explorer` roles produce proposals and map risk.
  2. Let the `integrator` own the shared contract and hotspot files.
  3. Let `implementer` roles handle any non-overlapping slices that remain.
  4. Let the `reviewer` and `tester` validate after integration.
- Write policy: proposal-first, then `designated-writer`
