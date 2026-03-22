# How to Add a Role

Use this guide when you want to add a new permanent role to `subagent-orchestrator`.

## Goal

Add a role that plugs into the existing system without rewriting the orchestration rules in `SKILL.md`.

## When to Add a New Role

Add a role when:

- the existing registry cannot express a repeated responsibility cleanly
- a temporary role keeps reappearing across tasks
- a new domain or validation function needs its own stable capability tags

Do not add a new role just because one task uses unusual wording. Prefer temporary roles for one-off needs.

## Step 1: Confirm the gap

Before adding anything, check:

- [../references/roles-index.md](../references/roles-index.md)
- [../references/team-patterns.md](../references/team-patterns.md)
- [../references/role-contract.md](../references/role-contract.md)

Ask:

- Is this really a new responsibility?
- Could an existing role cover it with a better prompt?
- Should this be a temporary task-local role instead?

## Step 2: Choose the role boundary

Define the role as one responsibility cluster.

Good examples:

- a security reviewer
- a migration planner
- a performance tester

Weak examples:

- a role that explores, implements, tests, and reviews everything
- a role whose only distinction is a project-specific nickname

## Step 3: Create the role file

Create a new file in `references/` named:

```text
role-<name>.md
```

Follow the contract in [../references/role-contract.md](../references/role-contract.md).

At minimum, define:

- mission
- when to use
- capability tags
- ownership
- write policy
- recommended configuration
- stop conditions

## Step 4: Pick stable tags

Tags are how the orchestrator discovers and reuses roles naturally.

Choose tags from the existing vocabulary when possible:

- task tags such as `review`, `testing`, `integration`
- domain tags such as `frontend`, `backend`, `security`
- risk tags such as `read-only`, `disjoint-write`, `designated-writer`

Add new tags only when they express a stable new concept that future roles may also use.

## Step 5: Register the role

Add the role to [../references/roles-index.md](../references/roles-index.md).

Update:

- role name
- primary tags
- write policy
- when to load it
- file reference

This keeps the registry discoverable and prevents the role from becoming a hidden file that the orchestrator never selects.

## Step 6: Update team patterns only if needed

Open [../references/team-patterns.md](../references/team-patterns.md) only if the new role changes a reusable team shape.

Examples:

- add a `security-review` role to a review pattern
- add a `migration-planner` role to a refactor pattern

Do not edit team patterns when the role is just another implementation detail of an existing slot.

## Step 7: Test the new role

Use one of these checks:

- `assemble-only` on a realistic task and confirm the new role gets selected
- a read-only forward test if the role is analytical
- a bounded execution test if the role owns a safe write slice

Focus on these questions:

- Does the role get selected when it should?
- Does it avoid work owned by other roles?
- Are its tags and write policy clear enough?

## Temporary Role vs Permanent Role

Choose a temporary role when:

- the need is rare
- the capability is too task-specific
- you are still exploring the right shape

Promote it to a permanent role when:

- the same role brief is reused
- the same tags keep appearing
- the role changes how teams should be assembled repeatedly

## Adding Other Extensible Pieces

If you are adding a new reusable concept beyond a role:

- update `roles-index.md` for registry changes
- update `team-patterns.md` for reusable team shapes
- update `SKILL.md` only when the orchestration rules themselves change

Keep `SKILL.md` stable whenever possible.

## Completion Checklist

- new role file exists in `references/`
- role follows the contract
- tags are stable and useful
- role is registered in `roles-index.md`
- team patterns were updated only if necessary
- at least one realistic task was used to verify selection behavior
