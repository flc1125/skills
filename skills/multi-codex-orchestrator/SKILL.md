---
name: multi-codex-orchestrator
description: Orchestrate multiple standalone Codex workers for parallel repository tasks. Use when the user wants task decomposition, isolated worktrees, structured worker outputs, patch collection, and final integration by a single coordinator.
metadata:
  name: Multi Codex Orchestrator
  description: Coordinate parallel Codex workers for isolated repository task execution.
  author: Flc
  created: 2026-04-10T15:40:40Z
---

# Multi Codex Orchestrator

Use this skill when the user explicitly wants multiple Codex workers running as independent agents, rather than relying on built-in sub-agent behavior.

## When To Use

- The task can be split into mostly independent workstreams.
- Each worker can own a bounded path set or responsibility.
- The coordinator can validate and integrate outputs at the end.

## When Not To Use

- The task is small enough for one agent.
- Several workers would need to edit the same core files.
- The task is highly sequential and cannot benefit from parallelism.

## Default Execution Model

1. Create a plan file from `assets/templates/plan.yaml`.
2. Give each worker a clear `id`, `role`, `paths`, and `goal`.
3. Use `scripts/spawn_agents.sh` to validate the plan and create one git worktree per worker under `/tmp/`.
4. Run each worker with `codex exec` in its own worktree.
5. Require each worker to write `result.json` in its run directory.
6. Use `scripts/collect_results.sh` to gather artifacts and diffs.
7. Integrate centrally. Do not let workers merge each other's changes.

## Hard Rules

- One worker owns one write scope.
- Default to isolated git worktrees, not one shared writable tree.
- Workers must produce structured outputs, not just free-form prose.
- The coordinator must re-validate before integrating.
- If two workers need the same file, redesign the split or serialize the work.

## File Layout

- `scripts/plan_tasks.sh`: copy a starter plan into a target project folder.
- `scripts/spawn_agents.sh`: parse the plan, create worktrees, and launch workers.
- `scripts/collect_results.sh`: summarize each worker run.
- `scripts/merge_patches.sh`: verify worker status and apply non-conflicting diffs into the integration branch.
- `references/task-schema.md`: the supported plan shape.
- `references/output-schema.md`: required worker outputs.
- `references/conflict-policy.md`: what to do when scopes collide.

## Quick Start

```bash
PROJECT_DIR=output/2026-04-10/my-parallel-run
mkdir -p "$PROJECT_DIR"

./scripts/plan_tasks.sh "$PROJECT_DIR"
# edit "$PROJECT_DIR/plan.yaml"

./scripts/spawn_agents.sh "$PROJECT_DIR/plan.yaml"
./scripts/collect_results.sh "$(cat "$PROJECT_DIR/.last-run-dir")"
```

## Plan Format

Read `references/task-schema.md` before editing `plan.yaml`.

This MVP expects a small, line-oriented YAML shape:

```yaml
goal: Add RBAC to the app
repo_path: /abs/path/to/repo
base_branch: main
run_root: /tmp/multi-codex-orchestrator
agents:
  - id: analyst
    role: analyze
    paths: src/auth,src/models
    goal: Inspect current auth model and propose changes
  - id: backend
    role: implement
    paths: src/auth,src/api
    goal: Implement middleware and API changes
```

## Worker Prompting

The launcher renders `assets/templates/agent-task.md` for each worker and appends the worker-specific fields from the plan.

Each worker should:

- stay inside its owned paths
- write `result.json`
- leave code changes in its worktree
- avoid rebasing, merging, or force-pushing

Before launch, the coordinator should reject any plan where two workers own overlapping paths.

## Validation

- Use `scripts/collect_results.sh` first.
- Review `result.json`, `last-message.txt`, and `diff.patch` for each worker.
- Only then apply `scripts/merge_patches.sh`, which will refuse blocked or conflicting worker outputs.

## Notes

- This is an MVP skill. It favors explicit structure over clever automation.
- If you need more flexible schemas later, replace the shell YAML parsing with a dedicated parser.
