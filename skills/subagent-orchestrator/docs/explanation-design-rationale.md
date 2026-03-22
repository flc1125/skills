# Explanation: Design Rationale

This document explains why `subagent-orchestrator` is structured the way it is.

## Why This Skill Is Codex-Specific

The skill is designed around Codex subagent workflows, not around generic prompt chaining.

It assumes:

- subagents can be spawned explicitly
- multiple agents can work in parallel
- delegated work can stay off the main thread
- the main thread can synthesize the results

Without those capabilities, the skill loses most of its value. The role library and team patterns would remain conceptually useful, but the orchestration flow would no longer match the runtime.

## Why Roles Live in `references/`

The role library is meant to grow over time.

If every role were embedded directly in `SKILL.md`, the orchestration logic would become noisy and harder to maintain. Moving roles into `references/` keeps the main skill lean and lets future maintainers add roles without rewriting the orchestration layer.

This also supports progressive disclosure:

- `SKILL.md` stays small
- `roles-index.md` acts as the registry
- individual role files load only when needed

## Why the Skill Uses a Registry

The registry exists so the system can scale without becoming brittle.

Instead of hardcoding every decision around exact role names, the skill can reason about:

- capability tags
- write policy
- reusable team slots

That makes future extension cheaper. A new role can join the system by following the contract and registering itself.

## Why Write Work Is Split Into Classes

Parallelism is useful, but not every task should be parallelized in the same way.

The skill separates work into:

- `read-only`
- `disjoint-write`
- `overlap-write`

This avoids the most common failure mode of multi-agent systems: uncontrolled shared editing.

## Why the Skill Uses an `integrator`

The `integrator` exists because shared surfaces need one writer.

Without an explicit designated writer, overlapping changes tend to create:

- patch conflicts
- hidden contract drift
- inconsistent naming and structure
- rework during validation

The `integrator` concentrates shared-write responsibility into one role while still allowing discovery and proposal work to happen in parallel.

## Why Temporary Roles Are Allowed

Not every useful role deserves to become permanent immediately.

Temporary roles let the skill handle novel tasks without bloating the permanent role library. They are a safe bridge between:

- one-off task needs
- stable reusable responsibilities

Once a temporary role proves reusable, it can be promoted into the permanent registry.

## Why Human Docs Exist Beside `SKILL.md`

`SKILL.md` is optimized for the agent.

Human maintainers need different material:

- tutorials for a first successful run
- how-to guides for extension tasks
- reference for exact structure and vocabulary
- explanation for design tradeoffs

Keeping those documents in `docs/` avoids overloading the machine-facing skill instructions while still making the system maintainable by people.
