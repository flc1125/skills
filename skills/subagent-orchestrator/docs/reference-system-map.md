# Reference: System Map

This document describes the moving parts of `subagent-orchestrator`.

## Directory Layout

```text
subagent-orchestrator/
├── SKILL.md
├── README.md
├── agents/openai.yaml
├── docs/
└── references/
```

## File Responsibilities

- `SKILL.md`: machine-facing orchestration rules for Codex
- `README.md`: human-facing overview of the skill and its purpose
- `agents/openai.yaml`: UI-facing metadata
- `docs/`: human-facing usage and maintenance docs
- `references/`: reusable role and pattern definitions loaded as needed

## Team Modes

- `assemble-only`: assemble the team and execution plan without starting work
- `assemble-and-run`: assemble the team and execute immediately
- `reuse-team`: continue with live subagents that already own useful context

## Execution Classes

- `read-only`: safe parallel exploration, review, summarization, or validation
- `disjoint-write`: parallel work on clearly owned slices
- `overlap-write`: shared surfaces or hotspot files that need proposal-first work and a designated writer

## Core Roles

| Role | Main Job | Write Policy |
| --- | --- | --- |
| `lead` | own scope, roster, handoffs, and synthesis | `read-only` |
| `planner` | freeze assumptions, slices, and shared contracts | `read-only` |
| `explorer` | gather bounded context and evidence | `read-only` |
| `implementer` | deliver a bounded owned slice | `disjoint-write` |
| `reviewer` | inspect proposals or patches for risk | `read-only` |
| `tester` | validate behavior with commands and checks | `read-only` |
| `integrator` | own hotspot files and final merge control | `designated-writer` |

## Reference Files

- `references/role-contract.md`: contract for permanent and temporary roles
- `references/roles-index.md`: registry and selection entry point
- `references/team-patterns.md`: reusable team shapes
- `references/role-*.md`: individual role definitions

## Extension Points

The system is designed to extend at three layers:

1. role definitions
2. team patterns
3. orchestration rules

Use the narrowest extension point that solves the problem.

## Design Rules

- keep `SKILL.md` focused on orchestration logic
- keep reusable role details in `references/`
- select by tags and write policy, not by hardcoded filenames alone
- use an `integrator` for shared-write risk
- prefer temporary roles before creating a permanent one

## Codex Assumptions

This skill assumes a Codex runtime that can:

- spawn subagents explicitly
- run agents in parallel
- keep separate agent threads
- summarize results back into the main thread
- control model and reasoning choices per delegated task
