---
name: subagent-orchestrator
description: Orchestrate subagent workflows for complex tasks that benefit from decomposition, role-based delegation, and parallel execution. Use when Codex should assemble a temporary team of subagents, choose roles from a reusable role library, create a controlled fallback role when no preset role fits, coordinate read-heavy work in parallel, or handle write-heavy work with ownership boundaries, staged execution, and an integrator-led merge path.
---

# Subagent Orchestrator

Assemble a temporary team of subagents for a user-requested task. Keep the main thread focused on scope, decisions, and synthesis while delegated agents handle bounded work.

## Operating Mode

- Use this skill when the user explicitly asks for subagents, delegation, parallel work, or a temporary team.
- Treat explicit invocation of `$subagent-orchestrator` as permission to use subagents.
- Treat team assembly as a planning problem first and an execution problem second.
- Prefer role-based delegation with explicit ownership over ad hoc spawning.
- Keep noisy intermediate work off the main thread and return summaries instead of raw agent chatter.

## Resource Map

Read [references/roles-index.md](references/roles-index.md) first. Then load only the role and pattern files that match the task.

- Role contract and extension rules: [references/role-contract.md](references/role-contract.md)
- Role registry: [references/roles-index.md](references/roles-index.md)
- Team patterns: [references/team-patterns.md](references/team-patterns.md)
- Core roles:
  - [references/role-lead.md](references/role-lead.md)
  - [references/role-planner.md](references/role-planner.md)
  - [references/role-explorer.md](references/role-explorer.md)
  - [references/role-implementer.md](references/role-implementer.md)
  - [references/role-reviewer.md](references/role-reviewer.md)
  - [references/role-tester.md](references/role-tester.md)
  - [references/role-integrator.md](references/role-integrator.md)

## Team Modes

Choose one mode before assembling the team:

- `assemble-only`: Build the roster, ownership map, and execution order without starting work.
- `assemble-and-run`: Build the team and execute immediately. Use this by default when the user asks to do the task now.
- `reuse-team`: Continue with live subagents that still own relevant context. If no suitable live team exists, fall back to `assemble-and-run`.

## Orchestration Workflow

Follow this sequence unless the user asks for a narrower deliverable.

### 1. Frame the task

Extract and restate:

- user objective
- required deliverable
- constraints, approvals, and safety boundaries
- relevant codebase, files, or artifacts
- time sensitivity
- desired team mode

If the request did not clearly ask for subagents and the skill was not explicitly invoked, do not spawn subagents. Ask or continue in a single-agent path.

### 2. Classify the execution shape

Use one label for the whole task or one label per slice:

- `read-only`: exploration, review, summarization, log analysis, test triage, architecture mapping
- `disjoint-write`: multiple owned slices with low overlap, such as separate modules or test files
- `overlap-write`: shared interfaces, hotspot files, schema changes, routing layers, central types, or config that multiple agents would otherwise touch

If uncertain, choose the stricter label.

### 3. Assemble the team

Read [references/roles-index.md](references/roles-index.md) and [references/team-patterns.md](references/team-patterns.md) as needed.

Apply these rules:

- Choose exactly one `lead`.
- Add a `planner` when the request is ambiguous, under-scoped, or likely to require contract freezing before implementation.
- Add one or more `explorer` roles for discovery-heavy work.
- Add `implementer` roles only when each writer can own a clear slice.
- Add a `reviewer` and a `tester` for validation when behavior can change.
- Add an `integrator` whenever multiple writers would touch shared surfaces or when overlap risk is nontrivial.

Prefer preset roles from the registry. If no preset role fits, synthesize a temporary role brief by following [references/role-contract.md](references/role-contract.md). Keep temporary roles task-local and do not persist them unless the user explicitly asks.

### 4. Declare ownership and handoffs

For each subagent, define:

- mission
- scope
- owned files, modules, or analysis slice
- forbidden areas
- required tools or artifacts
- expected deliverable
- stop conditions
- wait strategy

For write work:

- Assign exactly one designated writer for each hotspot or shared contract.
- Freeze shared interfaces before parallel implementation when possible.
- Convert risky overlap into a two-phase flow: parallel proposals first, implementation second.

### 5. Choose the execution pattern

Use the classification from Step 2:

- `read-only`: parallelize discovery, review, or summarization, then synthesize.
- `disjoint-write`: parallelize by owned slice, then integrate and validate.
- `overlap-write`: run a proposal-first phase, then route shared implementation through a single designated writer or an `integrator`.

After implementation, reopen parallelism for validation whenever it is safe:

- `reviewer` for bugs and regressions
- `tester` for commands and edge-case coverage
- `explorer` for missed call sites or dependency fallout

### 6. Execute with bounded prompts

Give each subagent the minimum task-local context needed to succeed.

Include:

- the task slice
- owned scope
- expected output
- constraints and forbidden areas
- whether to wait or continue independently

Do not leak intended answers or hidden diagnoses unless the task specifically requires them.

### 7. Synthesize on the main thread

Keep the main thread concise.

Return:

- the final roster
- execution class and chosen pattern
- ownership map
- key findings or implementation results
- unresolved risks and next steps

Use summaries from subagents instead of copying raw logs into the main thread.

## Write Safety Rules

Apply these rules whenever code changes are involved:

- Never let multiple writers edit the same hotspot file at the same time.
- Separate proposal work from write work when conflict risk is real.
- Route schema changes, shared types, public API contracts, migrations, central config, and routing through one designated writer.
- Use an `integrator` when multiple patches must land coherently.
- Re-parallelize only after shared-write risk has been reduced.
- Prefer a slower but controlled merge path over fast conflicting edits.

## Output Structure

When the user asks for a team plan or when the orchestration needs to be summarized, use this structure:

```markdown
# Team Plan

## Objective
- <goal>

## Team Mode
- <assemble-only | assemble-and-run | reuse-team>

## Execution Class
- <read-only | disjoint-write | overlap-write>

## Roster
- <role>: <mission and owned scope>

## Handoffs
- <who waits on whom and why>

## Risks
- <conflict, ambiguity, or approval risks>
```

When reporting completed work, replace `Handoffs` with `Results`.

## Extending the Role Library

Use the role registry as a plug-in system.

To add a new permanent role:

1. Create a new `references/role-<name>.md` file by following [references/role-contract.md](references/role-contract.md).
2. Register the role in [references/roles-index.md](references/roles-index.md).
3. Update [references/team-patterns.md](references/team-patterns.md) only if the new role introduces a reusable team slot or a new common pattern.
4. Keep capability tags stable so old selection logic still works.

Prefer selecting roles by capability tags and write policy rather than hardcoding exact role names into the main workflow.
