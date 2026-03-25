# Runtime Contract

This skill assumes a Codex-style runtime with explicit subagent tools.

## Preferred Runtime Model

- launching a subagent returns promptly with an internal handle such as `agent_id`
- the parent thread can continue doing other work
- the parent thread can later wait for completion explicitly
- the parent thread may be able to observe final-status notifications

## What This Skill Treats As Reliable

The reliable contract is:

- a task can be launched
- a task can be tracked by `task_ref`
- a task result can be joined or collected later

The skill does not treat host notification delivery as the only correct path.

## Fallback Rules

- If completion notifications are visible, use them to trigger a strong completion announcement.
- If completion notifications are absent or unclear, use an explicit wait or status check.
- If the runtime cannot clearly surface completion automatically, announce completion at the next confirmed check instead of implying real-time delivery.

## Session Scope

- `task_ref -> agent_id` mapping is assumed to be valid only within the current active runtime session.
- Do not promise durable recovery across new sessions unless the host explicitly supports it.

## Waiting Rules

- `launch-and-continue`: launch without immediate waiting
- `launch-and-wait`: launch, then explicitly wait because the user asked for the result or the next step depends on it

Waiting is a deliberate synchronization choice, not the default consequence of using a subagent.
