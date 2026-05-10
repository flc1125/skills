---
name: memories
description: Scaffold a project-local memory directory and AGENTS.md guidance for reusable agent knowledge. Use when a user wants to initialize `.agents/memories/` or another project memory path so future agents can read and maintain durable project context.
metadata:
  name: Memories
  description: Scaffold project-local memory files and AGENTS.md guidance for future agents.
  author: Flc゛
  created: 2026-05-10T12:35:25Z
---

# Memories

Scaffold lightweight, project-local memory files that future agents can read and maintain.

Use this skill to initialize durable project knowledge, not to store one-off task notes. The default target is `.agents/memories/`, with `AGENTS.md` guidance for Codex-oriented future use.

## Workflow

1. Confirm the target project root.
2. Inspect whether the target memory directory and agent instruction file already exist.
3. Use `.agents/memories/` unless the user specifies another memory directory.
4. Run `scripts/init_project_memory.py`.
5. Review the generated or changed files.
6. Report the memory directory and whether the agent instruction file was created or updated.

## Command

From any location:

```bash
python3 <skill-dir>/scripts/init_project_memory.py /path/to/project
```

With a custom memory directory:

```bash
python3 <skill-dir>/scripts/init_project_memory.py /path/to/project --memory-dir docs/agent-memory
```

To create memory files without touching the agent instruction file:

```bash
python3 <skill-dir>/scripts/init_project_memory.py /path/to/project --skip-agent
```

With an alternate agent instruction file:

```bash
python3 <skill-dir>/scripts/init_project_memory.py /path/to/project --agent-file CLAUDE.md
```

## Generated Files

The scaffold creates missing files only. Existing memory files are preserved.

- `README.md`: explains the memory system, what belongs there, and what must not be stored.
- `index.md`: routes future agents to the relevant memory files.
- `project.md`: stores stable project conventions and durable context.
- `workflows.md`: stores repeatable commands, release steps, CI workflows, and maintenance procedures.
- `lessons.md`: stores reusable lessons, pitfalls, and verified fixes.

## AGENTS.md Guidance

By default, the script creates or updates `AGENTS.md` in the project root. It inserts a concise `## Project Memory` section that tells future agents to:

- read `index.md` before non-trivial work;
- open only task-relevant memory files;
- update memories when the user requests memory maintenance or when reusable project knowledge is a natural part of the current task;
- recommend a memory update instead of editing memory files when memory maintenance is outside the current task scope;
- avoid one-off task notes, temporary debugging details, secrets, credentials, and conversation-specific context;
- keep `index.md` aligned when memory files are added, removed, renamed, or materially changed.

If an existing managed block is present, update it instead of appending a duplicate. If only an unmarked `## Project Memory` / `## Project Memories` section exists, preserve the user-authored section and append a managed block.

## Memory Standard

Treat memory as durable project knowledge. Add or update entries only when the information is likely to help future agents across tasks.

Good memory candidates:

- stable repository conventions;
- commands or workflows that were verified locally;
- recurring environment constraints;
- cross-task architectural or maintenance decisions;
- reusable debugging lessons.

Do not store:

- secrets, credentials, tokens, or private keys;
- raw conversation logs;
- single-task progress notes;
- speculative conclusions that have not been verified;
- noisy command output that is not reusable.
