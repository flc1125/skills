# memories

Local skill for initializing project-local memory files and agent guidance.

## Install

```bash
npx skills add https://github.com/flc1125/skills --skill memories
```

## Scope

- create a lightweight `.agents/memories/` scaffold by default
- support a custom project memory directory
- create or update agent guidance in `AGENTS.md`
- preserve existing memory files instead of overwriting user content
- keep future memory updates scoped to reusable, project-level knowledge

## Structure

```text
memories/
├── SKILL.md
├── README.md
├── agents/
│   └── openai.yaml
└── scripts/
    └── init_project_memory.py
```

## Generated Project Files

The scaffold creates these files in the target project memory directory:

- `README.md`: purpose and maintenance rules for project memories
- `index.md`: routing index for future agents
- `project.md`: stable project conventions, structure, and decisions
- `workflows.md`: repeatable validation, release, CI, and maintenance workflows
- `lessons.md`: reusable pitfalls, fixes, and debugging lessons

## Notes

This skill is intentionally a scaffold, not a runtime memory database. It creates a small file-based convention that future agents can read and maintain through normal git review.

The script only updates marker-managed agent guidance automatically. If a project already has a hand-written `## Project Memory` section, the script preserves it and appends a managed block instead of replacing user-authored content.
