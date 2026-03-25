---
name: async
description: Launch and coordinate Codex subagents as deferred tasks. Use when the user wants to start bounded subagent work now, keep the main thread moving without waiting by default, then later join, collect, or redirect that work through a stable task reference.
---

# Async

Use this skill when the user wants to:

- start a Codex subagent task now and continue the main thread
- optionally wait for the result when the task becomes blocking
- manage subagent work through a user-facing `task_ref` instead of raw `agent_id`
- get a strong completion announcement when async work finishes
- query, collect, summarize, or redirect a previously launched async task

Do not use this skill for:

- generic background job systems outside Codex subagents
- cross-session durable task storage or reliable wake-up guarantees
- external queues, webhooks, cron, or service orchestration unless the runtime explicitly provides them

## Resource Map

Read these references only when needed:

- Runtime assumptions and fallback behavior: [references/runtime-contract.md](references/runtime-contract.md)
- `task_ref` naming and lifecycle rules: [references/task-ref.md](references/task-ref.md)
- Completion announcement policy and boxed alert templates: [references/alerts.md](references/alerts.md)

## Core Model

Treat each async task as a tracked subagent lifecycle:

1. frame a bounded task
2. launch one subagent
3. assign a stable `task_ref`
4. keep the main thread moving unless waiting is required
5. announce completion strongly when the runtime makes it observable
6. collect, summarize, or inspect the result later

Expose `task_ref` to the user. Keep `agent_id` internal unless debugging requires it.

## Defaults

- Default execution mode is `launch-and-continue`.
- If the user asks to wait, or if the result is required for the next critical step, switch to `launch-and-wait`.
- Default completion behavior is `announce-dont-auto-expand`: strongly announce that the task finished, but do not dump the full result unless the user asks or the result is short enough to inline safely.
- If the user explicitly invokes `$async` and the task is already clear enough to delegate, launch promptly instead of lingering in a preparation-only phase.

## Operating Rules

### 1. Frame the task

Before launch, identify:

- objective
- expected deliverable
- write scope and ownership
- whether the task is safe to defer
- whether the user wants immediate waiting

Prefer one async subagent per distinct objective.

### 2. Create the task handle

Generate a user-facing `task_ref` by following [references/task-ref.md](references/task-ref.md).

Requirements:

- `task_ref` is the primary handle in the conversation
- map `task_ref -> agent_id` in the current session context
- do not rename a `task_ref` once assigned
- if the objective changes materially, launch a new task with a new `task_ref`
- once a `task_ref` has been shown to the user, all later status updates, completion alerts, collection steps, and follow-up actions must reuse that exact `task_ref`

### 3. Launch

Spawn one subagent with:

- the bounded task
- owned scope
- expected output
- stop conditions
- whether it should work independently or be joined immediately

After launch:

- in `launch-and-continue`, return the `task_ref`, current mode, and the next main-thread action
- in `launch-and-wait`, wait explicitly and return the result when available

If the user explicitly invoked `$async` and the task is sufficiently clear, do not silently fall back to a normal single-threaded answer before attempting launch. Either:

- launch the async task promptly
- or explain clearly why launch is being deferred, blocked, cancelled, or replaced

### 4. Track state

Use this minimal state model:

- `running`
- `completed_uncollected`
- `completed_collected`
- `failed`
- `cancelled`

When completion is observed but the result has not yet been returned to the user, use `completed_uncollected`.

### 5. Announce completion strongly

Follow [references/alerts.md](references/alerts.md).

Policy:

- If host-level UI alerts are available, prefer them first.
- Otherwise, emit a terminal-style boxed alert.
- If boxed formatting is unsuitable, emit a structured inline alert.
- Keep user pull-based control available even after any push-style alert.

If a task finishes while the main thread is doing other work, announce the completion at the next available response opportunity. Do not silently wait for the user to ask first.

### 6. Support later interaction

Support these user intents against `task_ref`:

- check status
- collect result
- summarize result
- inspect failure
- send follow-up input
- interrupt and redirect
- list active async tasks

If the user changes topics after an async task has already been launched, continue answering normally on the main thread, but keep the original async task tracked until it is collected, cancelled, or fails.

### 7. Keep the model honest

Do not promise:

- durable execution beyond the current runtime unless explicitly supported
- guaranteed real-time callbacks in every host
- unbounded recursive async task trees

When runtime visibility is uncertain, fall back to explicit join or status checks instead of pretending the task is observable.

## Safety Rules

- Do not spawn speculative subagents without a clear deliverable.
- Do not let the main thread and child task write the same hotspot simultaneously.
- Prefer read-heavy or clearly bounded write tasks for async execution.
- Do not repeatedly re-announce the same completed task unless the user asks or the status changed materially.
- If notification visibility is unclear, be conservative and surface that uncertainty.

## Output Structure

When launching a task:

```markdown
# Async Task

## Objective
- <delegated goal>

## Task Ref
- <task_ref>

## Mode
- <launch-and-continue | launch-and-wait>

## Status
- <running | completed_uncollected | completed_collected | failed | cancelled>

## Main Thread Next Step
- <what happens now>

## Completion Strategy
- <host-ui-alert | boxed-terminal-alert | structured-inline-alert | explicit-join>
```

When a task completes or fails, put the completion announcement first, then continue with any normal response.
