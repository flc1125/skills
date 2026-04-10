# Output Schema

Each worker run should produce these artifacts in its run directory:

- `task.md`: the fully rendered task prompt used for the worker
- `last-message.txt`: final Codex message captured by `codex exec -o`
- `result.json`: structured self-report written by the worker
- `diff.patch`: `git diff` output from the worker worktree
- `commit.txt`: optional commit hash if the worker created a local commit
- `codex.jsonl`: optional raw event log if you enable `--json`

## `result.json` Shape

```json
{
  "agent_id": "backend",
  "status": "done",
  "summary": "Implemented RBAC middleware and policy checks",
  "owned_paths": ["src/auth", "src/api"],
  "tests": {
    "ran": true,
    "passed": true,
    "command": "go test ./..."
  },
  "risks": [],
  "next_action": "ready for coordinator review"
}
```

## Status Values

- `done`
- `blocked`
- `failed`

## Minimum Expectations

- `summary` must describe the actual outcome, not the plan.
- `owned_paths` must match the worker scope from the plan.
- `next_action` should tell the coordinator what to do next.
