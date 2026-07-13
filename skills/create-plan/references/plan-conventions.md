# Plan Conventions

Use these conventions when creating or maintaining repository-local technical plans. Repository-specific instructions override this reference.

## Contents

1. Artifact selection
2. Discovery and evidence
3. Filename and metadata
4. Status lifecycle
5. Content and language
6. Scope and execution boundaries
7. Plan maintenance

## 1. Artifact Selection

Do not write a file merely because the user asked for an assessment or said "先给方案". Return a conversational proposal unless the user explicitly asks to create, save, record, or update a plan document.

Use a durable plan when work is non-trivial and benefits from one or more of:

- multiple implementation phases or pull requests
- public API or behavior decisions
- breaking changes and downstream migration
- risky lifecycle, concurrency, persistence, data, or deployment behavior
- several affected modules or adapters
- explicit validation and completion tracking

For a one-step change with an obvious implementation and validation path, prefer a compact plan or no durable artifact unless requested.

## 2. Discovery and Evidence

Read applicable repository instructions before inspecting plans. Plan directories may be ignored, so ordinary `rg --files` or `git ls-files` can omit the most relevant examples.

Use discovery that includes ignored content:

```bash
rg --files --hidden --no-ignore <candidate-plan-directory>
```

Inspect at least one plan with a similar task shape. For repositories with mixed history, infer current conventions from the newest relevant files and explicit `AGENTS.md` rules rather than copying the oldest plan.

Build the plan from:

1. current source and tests
2. current dependency and build metadata
3. repository instructions
4. current issues, pull requests, or upstream documentation when relevant
5. prior plans and conversation as secondary context

State uncertainty explicitly. Do not invent commands, paths, APIs, consumers, or migration requirements.

## 3. Filename and Metadata

When the repository uses ordered status-bearing names, prefer:

```text
NNN-YYYY-MM-DD-status-short-topic.md
```

Rules:

- Use a three-digit sequence.
- Scan ignored files before allocating the next sequence.
- Use the current local date unless the user specifies another date.
- Use one of `draft`, `planned`, `in-progress`, `blocked`, or `completed`.
- Use a short lowercase kebab-case topic slug.
- Reject duplicate sequence numbers even when the remaining filename differs.
- Keep filename date and status synchronized with document metadata.

Allocate the sequence as follows:

1. List all plan filenames, including ignored and hidden files.
2. Collect the three-digit prefixes from filenames that match the active convention.
3. Note any existing duplicate prefixes so they are not repeated.
4. Select the highest prefix plus one; do not fill an older gap unless repository instructions explicitly require it.
5. Check that the complete target filename is unused before creating the file.

If the next value no longer fits the repository's width convention, stop and ask how the repository wants to extend the scheme rather than silently changing it.

Metadata may follow the plan language:

```markdown
状态：planned
日期：2026-07-13
```

or:

```markdown
Status: planned
Date: 2026-07-13
```

Do not mix languages within one metadata block. Manually confirm that the status and date each appear exactly once and match the filename.

If the repository has a different naming scheme, follow it and do not force this format.

## 4. Status Lifecycle

### draft

Use when the document compares alternatives or still contains decision gates that prevent direct implementation. Include evidence, options, tradeoffs, a current preference if one exists, and the decisions required to promote it to `planned`.

### planned

Use when the target design, scope, non-goals, implementation phases, and validation strategy are sufficiently decided. Open questions may remain only when they do not block the next phase.

### in-progress

Use only after implementation has started with authorization. Check off work based on repository evidence. Do not mark an item complete merely because code was drafted if its required tests or review are still pending.

### blocked

Use when active work cannot proceed. Record:

- the concrete blocker
- evidence already gathered
- safe work that remains possible
- the input or external change needed to continue

### completed

Use only when the objective and required validation are complete. Record actual validation, deviations from the original plan, and remaining follow-up work that is explicitly out of scope.

Rename the file whenever the status changes. Keep the metadata synchronized in the same change.

## 5. Content and Language

Match the user's language for prose. Preserve API names, code, package paths, status tokens, and commands. Prefer concise Chinese plans for Chinese requests unless the repository requires English.

Use repository-relative paths in durable plans. Avoid:

- absolute workstation paths
- temporary directories and cache paths
- credentials, internal hosts, and machine-specific details
- raw command output that will become stale
- long transcripts of exploratory work

Keep implementation history and version migration details in the location chosen by the repository. If the convention says migrations belong in pull request descriptions rather than README files, reflect that boundary in the plan.

## 6. Scope and Execution Boundaries

A plan should define:

- the user or system outcome
- affected components and public contracts
- explicit non-goals
- dependencies and sequencing
- implementation phases
- validation and completion criteria

Do not broaden authority. Creating a plan does not authorize:

- editing runtime code
- creating a branch
- committing or pushing
- opening a pull request
- changing external systems

Perform read-only investigation freely within the named scope. Stop and request direction when a missing choice would materially change the outcome or public contract.

## 7. Plan Maintenance

Update the existing plan instead of creating a second plan for the same objective unless the work has genuinely split into independent efforts.

When implementation reveals a changed decision:

1. update the design and affected checklist items
2. record the reason briefly
3. remove stale instructions that should no longer be executed
4. update validation and migration requirements

Plans are execution aids, not append-only logs. Preserve important decisions, but keep the current path unambiguous.

When a repository has a memory or durable-context directory, move reusable architectural facts there after completion. Leave task-specific commands, checklists, and PR sequencing in the plan.
