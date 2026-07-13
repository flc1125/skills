---
name: create-plan
description: Create and maintain repository-aware technical plans, implementation plans, refactor proposals, design drafts, and migration plans. Use when Codex is asked to investigate a codebase and propose a solution before implementation; write or update a durable plan file; produce a 方案、实施计划或重构计划; split engineering work into phases or pull requests; document scope, non-goals, API and behavior decisions, breaking changes, migrations, risks, testing, or validation; or transition a plan through draft, planned, in-progress, blocked, and completed states.
---

# Create Plan

Create evidence-backed engineering plans that another agent can execute without reconstructing the design from conversation history.

## Operating Mode

Act as a repository-aware technical planner.

Prioritize:

- verified repository facts over recalled conversation details
- explicit scope and non-goals over broad aspirations
- decisions and executable steps over generic advice
- validation tied to repository commands and risks
- adaptive structure over one mandatory large template

Do not implement runtime changes while the user is still asking for evaluation or a plan. Do not create a branch, commit, pull request, or plan file unless the user requested that action or repository instructions explicitly require the artifact.

## Workflow

### 1. Determine the deliverable

Distinguish between:

- **Conversational proposal**: The user asks to assess, compare, or "先给方案". Return the proposal in chat and do not create a file.
- **Durable plan**: The user explicitly asks to create, write, record, or update a plan document. Locate the repository plan directory and write the artifact.
- **Lifecycle update**: The user asks to start, block, resume, or complete an existing plan. Update both its contents and status-bearing filename.

Ask a question only when a missing decision would materially change scope or architecture. Otherwise make a bounded assumption and label it.

### 2. Discover repository conventions

Before drafting:

1. Read applicable `AGENTS.md` files and repository instructions.
2. Locate existing plan and memory directories.
3. Include hidden and ignored plans in discovery. Prefer:

   ```bash
   rg --files --hidden --no-ignore | rg '(^|/)(plans|plan)/|plan.*\.md$'
   ```

4. Inspect representative plans with the same task shape and status.
5. Read the relevant source, tests, dependency files, and build commands.
6. Check repository history or issues only when they affect the plan.

Treat current code and tests as primary evidence. Treat prior plans and conversation as secondary context because they may be stale.

When writing or updating a plan file, read [references/plan-conventions.md](references/plan-conventions.md) completely before editing.

### 3. Frame the problem

Establish:

- current behavior and evidence
- concrete objective and completion criteria
- affected modules, public surfaces, and users
- constraints and dependencies
- explicit non-goals
- unresolved decisions and bounded assumptions

Separate facts, decisions, assumptions, and open questions. Do not present a preferred design as an existing repository fact.

### 4. Choose the plan shape

Use the smallest structure that makes the work executable:

- **Compact plan** for a bounded removal, migration, fix, or configuration change.
- **Implementation plan** for a new component, refactor, API change, or multi-phase task whose direction is decided.
- **Design draft** when alternatives, compatibility strategy, package boundaries, or architecture remain unresolved.

Read [references/plan-templates.md](references/plan-templates.md) completely, then select and adapt one template. Do not emit empty or irrelevant sections.

### 5. Write the plan

Make each step actionable and verifiable. Name concrete packages, APIs, files, commands, or contracts when repository evidence supports them.

Add conditional sections when material:

- breaking changes and affected downstream users
- before-and-after API or behavior comparisons
- ordered migration steps
- context, cancellation, errors, panic, ordering, concurrency, persistence, timeout, retry, or lifecycle semantics
- rollout, rollback, data migration, or deployment requirements
- independent pull request boundaries and dependency order
- risks, rejected alternatives, and decision gates

For incompatible changes, give every removed or changed public surface a replacement, migration action, or explicit statement that no direct replacement exists.

Use the user's language for prose unless repository convention requires otherwise. Keep code identifiers, status tokens, commands, and filename slugs in their native form.

### 6. Create and validate the artifact

When the repository uses numbered status-bearing filenames:

1. List every plan file, including hidden and ignored files.
2. Read the numeric prefix only from filenames that follow the repository convention.
3. Identify existing duplicate numbers instead of assuming the directory is clean.
4. Use the highest existing number plus one unless repository instructions define another allocation rule. Do not reuse gaps merely because a lower number is available.
5. Format the number, current date, status, and short topic according to repository convention.
6. Confirm that the complete target path does not already exist before writing.

After writing or renaming a plan, inspect the final file and check:

- filename, metadata status, and metadata date agree
- exactly one title, status field, and date field are present
- the sequence number does not collide with another plan
- checklist items describe observable work
- validation commands exist and match the affected scope
- completed checks have evidence
- no absolute local paths, credentials, temporary files, or stale debug output remain
- the plan contains no unauthorized runtime implementation changes

If the plan directory is ignored by Git, report that fact and do not force-add it.

### 7. Maintain lifecycle truthfully

Use status according to execution state:

- `draft`: important design choices are still open; do not present it as ready to execute.
- `planned`: design and scope are sufficiently decided for implementation.
- `in-progress`: authorized implementation has begun.
- `blocked`: active execution cannot proceed until a concrete blocker changes.
- `completed`: implementation and required validation are finished, not merely the plan document.

When status changes, rename the file and update its metadata in the same edit. Preserve the original plan date unless repository convention says otherwise. Check off items only when evidence supports completion. Record the blocker and next unblocking action for `blocked` plans.

Move reusable project facts into the repository's memory or context mechanism when one exists; keep one-off execution notes in the plan.

## Quality Bar

Before handing off a plan, verify that:

- a future implementer can tell what to change and what not to change
- completion can be determined without subjective interpretation
- important behavior and compatibility decisions are explicit
- tests and validation are proportional to risk
- phases and pull requests are independently reviewable where practical
- open questions are real decision gates, not a substitute for investigation
- the plan reflects current repository evidence rather than an earlier idea

For a conversational proposal, summarize the recommendation, evidence, scope, tradeoffs, and next implementation steps. For a durable artifact, report its path, status, scope, and whether it is ignored or tracked; state that runtime code was not changed unless the user separately authorized implementation.
