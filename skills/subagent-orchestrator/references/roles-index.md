# Roles Index

Read this file first. Then open only the role files that match the task.

## Registry

| Role | Primary Tags | Write Policy | Load When | Reference |
| --- | --- | --- | --- | --- |
| `lead` | `lead`, `orchestration`, `synthesis`, `risk-triage` | `read-only` | Every team needs one owner of scope, roster, and synthesis | [role-lead.md](role-lead.md) |
| `planner` | `planning`, `decomposition`, `contract-freezing`, `scoping` | `read-only` | Requirements are vague or implementation needs a frozen contract first | [role-planner.md](role-planner.md) |
| `explorer` | `exploration`, `repo-analysis`, `context-gathering`, `call-site-scan` | `read-only` | The task needs codebase, artifact, or requirement discovery | [role-explorer.md](role-explorer.md) |
| `implementer` | `implementation`, `patching`, `owned-slice`, `delivery` | `disjoint-write` | A bounded code or content slice has a clear owner | [role-implementer.md](role-implementer.md) |
| `reviewer` | `review`, `risk-analysis`, `regression-check`, `maintainability` | `read-only` | A patch or proposal needs independent critique | [role-reviewer.md](role-reviewer.md) |
| `tester` | `testing`, `verification`, `command-execution`, `edge-cases` | `read-only` | Behavior must be validated with commands, tests, or manual checks | [role-tester.md](role-tester.md) |
| `integrator` | `integration`, `merge-control`, `shared-surface`, `conflict-resolution` | `designated-writer` | Multiple patches or shared contracts need one final writer | [role-integrator.md](role-integrator.md) |

## Selection Rules

- Choose exactly one `lead`.
- Add a `planner` before implementation when scope or interfaces are unclear.
- Add one or more `explorer` roles for discovery-heavy work.
- Add `implementer` roles only when ownership is explicit.
- Add an `integrator` for hotspot files, shared contracts, or multi-writer output.
- Add `reviewer` and `tester` for validation after meaningful changes.
- Synthesize a temporary role only when the registry cannot cover the needed capability set.

## Capability Vocabulary

Use tags from these groups so new roles can plug in naturally:

- task tags: `orchestration`, `planning`, `exploration`, `implementation`, `review`, `testing`, `integration`
- domain tags: `frontend`, `backend`, `docs`, `infra`, `security`, `data`
- collaboration tags: `lead`, `specialist`, `integrator`
- risk tags: `read-only`, `disjoint-write`, `designated-writer`, `shared-surface`
