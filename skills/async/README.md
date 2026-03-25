# async

Local skill for launching and coordinating Codex subagent work as tracked async tasks.

## Install

```bash
npx skills add https://github.com/flc1125/skills --skill async
```

## Purpose

Use this skill when you want to:

- start a bounded Codex subagent task now
- keep the main thread moving without waiting by default
- wait later only when the result becomes blocking
- refer to async work through a stable `task_ref`
- get a strong completion announcement when async work finishes

This skill is designed for Codex-style runtimes with explicit subagent support. It is not a general background-job framework.

## What This Skill Adds

- default `launch-and-continue` behavior
- explicit `launch-and-wait` fallback when the user wants blocking behavior
- user-facing `task_ref` naming and mapping rules
- layered completion alerts with a boxed terminal fallback
- a clear runtime contract for notification uncertainty and session scope

## First Use

On first use in a conversation, Codex may need to:

- load the skill instructions
- frame the task
- assign a `task_ref`
- prepare the subagent launch

That setup step can make the first async request feel slower than a normal direct answer.

This matters when a new user request arrives during the initial setup window:

- the main thread can still answer the new request
- the async task can still be launched and tracked
- but the behavior may feel slightly less clean than after the skill is already loaded into the conversation

In practice, the first async run is the most likely place for timing and expectation mismatches, especially if the user quickly changes topics before the subagent is fully launched.

## Recommended Usage

For the cleanest first run:

1. invoke `$async` with one clear bounded task
2. let the skill assign the `task_ref` and launch the subagent
3. after launch, continue normal conversation or ask for status later

Example:

```text
Use $async to check the latest 7-day weather for Shenzhen and keep chatting while the task runs.
```

Then later:

```text
collect research-weather-1
```

or:

```text
status research-weather-1
```

## Structure

```text
async/
├── SKILL.md
├── README.md
├── agents/
│   └── openai.yaml
└── references/
    ├── alerts.md
    ├── runtime-contract.md
    └── task-ref.md
```

## Behavior Notes

- If the user explicitly invokes `$async` and the task is clear enough, the skill should launch promptly instead of lingering in preparation.
- Once a `task_ref` has been shown to the user, later alerts and follow-up actions should reuse that exact `task_ref`.
- If the user changes topics after the async task is launched, the main thread can continue normally while the original async task remains tracked.
- Completion announcements prefer host UI alerts when available, and otherwise fall back to a boxed terminal-style alert.

## Limits

- no durable cross-session task storage is promised
- no guaranteed real-time callback behavior is promised in every host
- no unbounded recursive async task trees are assumed
