# Task Schema

The current launcher supports a constrained `plan.yaml` format. Keep it simple.

## Required Top-Level Fields

- `goal`: overall objective for the run
- `repo_path`: absolute path to the repository to fork into worktrees
- `base_branch`: branch each worktree starts from
- `run_root`: absolute path under `/tmp/` used for runtime state
- `agents`: list of workers

## Required Agent Fields

- `id`: unique short identifier, lowercase letters, digits, hyphens
- `role`: one of `analyze`, `implement`, `test`, `review`, `docs`
- `paths`: comma-separated repository paths owned by the worker
- `goal`: worker-local objective

## Example

```yaml
goal: Add RBAC to the app
repo_path: /Users/name/code/my-app
base_branch: main
run_root: /tmp/multi-codex-orchestrator
agents:
  - id: analyst
    role: analyze
    paths: src/auth,src/models
    goal: Inspect auth model and suggest migration approach
  - id: backend
    role: implement
    paths: src/auth,src/api
    goal: Implement RBAC middleware and policy checks
  - id: tests
    role: test
    paths: src/auth,test
    goal: Add regression tests for role checks
```

## Constraints

- Keep each `goal` on one line.
- Keep each `paths` value on one line.
- Do not use nested YAML objects beyond the shown agent list.
- Do not include `_archives/` paths by default.
