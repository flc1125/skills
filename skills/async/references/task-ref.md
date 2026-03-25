# Task Ref

`task_ref` is the user-facing handle for an async subagent task.

Keep it readable, stable, and local to the current conversation.

## Syntax

Use:

`<verb>-<subject>-<n>`

Examples:

- `research-subagent-1`
- `trace-notify-1`
- `review-skill-md-1`
- `plan-alert-flow-1`

## Rules

- use lowercase only
- allow only `a-z`, `0-9`, and `-`
- prefer 2 to 4 segments total
- use a short `subject`
- end with a monotonic numeric suffix within the current session

## Verb Vocabulary

Prefer this fixed set:

- `research`
- `review`
- `plan`
- `trace`
- `test`
- `fix`
- `draft`
- `collect`

Only introduce a new verb when the existing set would make the handle misleading.

## Subject Rules

- use 1 or 2 short nouns from the current context
- prefer stable topic words over long descriptions
- avoid dates, UUIDs, and internal runtime ids unless they are operationally necessary

Good:

- `research-runtime-1`
- `trace-completion-1`
- `review-async-1`

Bad:

- `task-1`
- `agent-123456`
- `research-subagent-completion-notification-behavior-20260325`

## Assignment Rules

- if the user provides a reasonable name, normalize and reuse it
- otherwise generate one from the task objective
- if the objective changes materially, create a new `task_ref`
- once assigned, do not rename the `task_ref` within the same session
- once a `task_ref` has been shown to the user, child-agent outputs and later parent announcements must reuse that exact spelling

## Mapping Rule

The user should primarily see and reference `task_ref`.

Maintain an internal mapping:

`task_ref -> agent_id`

Expose raw `agent_id` only when debugging or when the runtime forces it.
