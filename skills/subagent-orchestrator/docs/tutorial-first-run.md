# Tutorial: First Run

This tutorial walks through a safe first use of `subagent-orchestrator`.

## Goal

Assemble a temporary subagent team and use it for a read-only repository analysis.

## Audience

Use this tutorial if you are new to the skill and want to see the full flow without risking write conflicts.

## What You Will Learn

- when to invoke the skill
- how the skill decides on a team shape
- what a successful read-heavy run looks like
- how to read the returned team plan

## Before You Start

Make sure you are in a Codex environment that can run subagents.

This skill is designed for Codex-style workflows with:

- explicit subagent delegation
- parallel agent work
- role-based coordination

## Step 1: Choose a safe first task

Start with a read-only task such as:

- repository structure analysis
- code review planning
- architecture mapping
- log or artifact triage

Good first prompt:

```text
Use $subagent-orchestrator to analyze this repository with a temporary subagent team. Keep the work read-only, parallelize discovery, and summarize the main maintainability risks with file references.
```

Why this works:

- the task is read-heavy
- ownership is simple
- the skill can parallelize without write conflicts

## Step 2: Let the skill classify the task

For this tutorial, the expected execution class is:

```text
read-only
```

The skill should avoid writers and favor a team such as:

- `lead`
- one or more `explorer` roles
- optional `reviewer` if the task also needs critique

## Step 3: Inspect the team plan

A healthy first result should include:

- a team mode such as `assemble-and-run`
- an execution class of `read-only`
- a roster with explicit missions
- slice boundaries for each subagent
- concise synthesis from the main thread

The important check is not the exact wording. The important check is whether the team has clear ownership and whether the main thread stays concise.

## Step 4: Review the output

Look for these signs of a good run:

- the `lead` defines the objective and the slices
- `explorer` roles work in parallel on distinct questions
- the result summarizes findings instead of dumping raw logs
- file references point to the evidence

If the output looks like one noisy undifferentiated dump, the team was not bounded tightly enough.

## Step 5: Move to the next level

After a successful read-only run, try one of these:

- `assemble-only` for a write-heavy task that needs planning but not execution yet
- a `disjoint-write` task with clear ownership
- an `overlap-write` task where the skill should add an `integrator`

Example planning prompt for shared-write work:

```text
Use $subagent-orchestrator to plan a refactor of this feature. Do not execute changes yet. Classify the work, assemble a temporary team, identify hotspot files, and explain where an integrator is required.
```

## What to Avoid on the First Run

- do not start with a large overlapping refactor
- do not let multiple writers touch the same hotspot files
- do not assume every task benefits from subagents
- do not treat the role roster as fixed forever

## Next Reading

- For extension work, read [how-to-add-a-role.md](how-to-add-a-role.md).
- For exact vocabulary and structure, read [reference-system-map.md](reference-system-map.md).
- For design reasoning, read [explanation-design-rationale.md](explanation-design-rationale.md).
