# subagent-orchestrator

Local skill for Codex that assembles and coordinates temporary subagent teams for complex tasks.

## Install

```bash
npx skills add https://github.com/flc1125/skills --skill subagent-orchestrator
```

## Purpose

This skill is designed for Codex environments that support:

- explicit subagent spawning
- parallel agent work
- role-based delegation
- model and reasoning selection per agent
- controlled integration of multi-agent results

It is not a generic prompt pack for any LLM runtime. The workflow assumes Codex can create bounded subagent threads, keep noisy work off the main thread, and synthesize results back into a concise final answer.

## What This Skill Adds

- a reusable role library for common team members
- a role contract for future extension
- team patterns for read-heavy and write-heavy tasks
- explicit handling for `read-only`, `disjoint-write`, and `overlap-write` work
- an `integrator` path for shared-write risk
- a controlled fallback for task-local temporary roles

## Core Idea

Use `subagent-orchestrator` when the user explicitly wants subagents, delegation, parallel work, or a temporary team.

The skill does three things:

1. Classify the task shape.
2. Assemble a temporary team from reusable roles.
3. Choose a safe execution pattern and synthesize the result.

For write-heavy tasks, the skill avoids uncontrolled parallel edits by separating proposal work from shared-surface implementation and routing hotspot files through one designated writer.

## Structure

```text
subagent-orchestrator/
├── SKILL.md
├── README.md
├── agents/
│   └── openai.yaml
├── docs/
│   ├── README.md
│   ├── tutorial-first-run.md
│   ├── how-to-add-a-role.md
│   ├── reference-system-map.md
│   └── explanation-design-rationale.md
└── references/
    ├── role-contract.md
    ├── roles-index.md
    ├── team-patterns.md
    ├── role-lead.md
    ├── role-planner.md
    ├── role-explorer.md
    ├── role-implementer.md
    ├── role-reviewer.md
    ├── role-tester.md
    └── role-integrator.md
```

## Documentation

Start here:

- [docs/README.md](docs/README.md)

Then use the document type that matches your goal:

- tutorial: [docs/tutorial-first-run.md](docs/tutorial-first-run.md)
- how-to: [docs/how-to-add-a-role.md](docs/how-to-add-a-role.md)
- reference: [docs/reference-system-map.md](docs/reference-system-map.md)
- explanation: [docs/explanation-design-rationale.md](docs/explanation-design-rationale.md)

## Extending the Skill

The extension model is intentionally simple:

1. Add or update a role file in `references/`.
2. Register it in `references/roles-index.md`.
3. Update `references/team-patterns.md` only if the new role changes a reusable team shape.

`SKILL.md` should remain the orchestration layer, not a catalog of every role.

## Codex-Specific Notes

- The skill assumes subagents are used only with explicit user intent or explicit skill invocation.
- The skill assumes read-heavy work is the best first use of parallelism.
- The skill assumes write-heavy work needs ownership boundaries and, when needed, an `integrator`.
- The skill is written to be extended without rewriting the main orchestration flow.
