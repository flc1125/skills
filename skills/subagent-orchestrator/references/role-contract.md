# Role Contract

Use this contract for every permanent or temporary role.

Keep one role per file and name it `role-<name>.md`.

## Required Sections

Every role file should contain these sections in this order:

1. `Summary`
2. `Mission`
3. `When to Use`
4. `Capabilities and Tags`
5. `Inputs`
6. `Deliverable`
7. `Ownership`
8. `Write Policy`
9. `Recommended Configuration`
10. `Collaboration Rules`
11. `Stop Conditions`

## Authoring Rules

- Optimize for capability, not personality.
- Use hyphen-case names for role files.
- Keep tags additive and stable.
- State non-goals or forbidden areas when they matter.
- Prefer one responsibility cluster per role.
- Let team patterns select roles by tags and write policy instead of exact filenames whenever possible.

## Write Policy Vocabulary

Use one of these values in each role file:

- `read-only`: inspect, analyze, summarize, or validate without editing implementation files
- `disjoint-write`: edit only an explicitly owned slice with low overlap risk
- `designated-writer`: own shared surfaces or hotspot files that must have one writer

## Adding a Permanent Role

1. Create the new role file with the required sections.
2. Add capability tags that help the orchestrator discover the role naturally.
3. Register the role in `roles-index.md`.
4. Update `team-patterns.md` only if the new role creates a reusable slot or new team pattern.
5. Keep existing tag meanings backward compatible.

## Creating a Temporary Role

When no registry role fits:

1. Derive the missing capability set from the task.
2. Write a temporary role brief with the same sections as a permanent role.
3. Mark the role as task-local in the roster summary.
4. Do not persist it to `roles-index.md` unless the user explicitly asks.

## Template

```markdown
# <Role Name>

## Summary
<one-sentence role summary>

## Mission
<primary job of the role>

## When to Use
- <trigger condition>

## Capabilities and Tags
- `<capability-tag>`

## Inputs
- <required context>

## Deliverable
- <expected output>

## Ownership
<owned scope and forbidden areas>

## Write Policy
`<read-only | disjoint-write | designated-writer>`

## Recommended Configuration
- agent type: `<default | explorer | worker>`
- model: `<recommended model family>`
- reasoning: `<low | medium | high>`

## Collaboration Rules
- <handoff and coordination rules>

## Stop Conditions
- <when to stop or escalate>
```
