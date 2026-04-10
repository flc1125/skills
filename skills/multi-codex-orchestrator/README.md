# multi-codex-orchestrator

Local Codex skill for coordinating multiple standalone Codex workers against one repository with isolated git worktrees.

## Install

```bash
npx skills add https://github.com/flc1125/skills --skill multi-codex-orchestrator
```

## Scope

- Split one repository task into bounded worker scopes
- Create one git worktree per worker
- Generate a rendered task file for each worker
- Collect structured worker outputs and diffs
- Merge only non-conflicting worker patches back into a target repo

## Quick Start

```bash
PROJECT_DIR=output/2026-04-10/my-parallel-run
mkdir -p "$PROJECT_DIR"

./scripts/plan_tasks.sh "$PROJECT_DIR"
# edit "$PROJECT_DIR/plan.yaml"

./scripts/spawn_agents.sh "$PROJECT_DIR/plan.yaml"
./scripts/collect_results.sh "$(cat "$PROJECT_DIR/.last-run-dir")"
```

To actually launch workers after preparing the plan:

```bash
./scripts/spawn_agents.sh "$PROJECT_DIR/plan.yaml" --run
```

## Structure

```text
multi-codex-orchestrator/
├── SKILL.md
├── README.md
├── agents/
│   └── openai.yaml
├── assets/
│   └── templates/
│       ├── agent-task.md
│       ├── plan.yaml
│       └── result.json
├── references/
│   ├── conflict-policy.md
│   ├── output-schema.md
│   └── task-schema.md
└── scripts/
    ├── collect_results.sh
    ├── merge_patches.sh
    ├── plan_tasks.sh
    └── spawn_agents.sh
```

## Notes

- This skill is intentionally MVP-level and uses a constrained line-oriented YAML plan format.
- Worker path ownership is expected to be exclusive; overlapping scopes are rejected before launch.
- Runtime state is designed to live under `/tmp/` by default.
