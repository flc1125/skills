# Conflict Policy

Use these rules before launching workers and again before integrating output.

## Preventive Rules

- Give each worker exclusive write ownership of its paths.
- If two workers need the same directory, split by file ownership or serialize the work.
- Keep review and test workers read-heavy when possible.

## Integration Rules

- Do not merge blindly. Inspect `diff.patch` and `result.json` together.
- If two workers touch the same file, stop and resolve manually.
- Prefer replaying small changes into the coordinator branch over merging opaque worker history.

## Escalation

- If a worker exceeds scope, treat it as a failed run and relaunch with a narrower prompt.
- If a worker cannot finish without another worker's result, convert the plan from parallel to staged.
