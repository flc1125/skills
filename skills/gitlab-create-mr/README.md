# gitlab-create-mr

Local Codex skill for drafting and creating GitLab merge requests.

## Install

```bash
npx skills add https://github.com/flc1125/skills --skill gitlab-create-mr
```

## Scope

- Check branch status and likely MR base
- Detect the correct GitLab host for GitLab.com or self-managed instances
- Analyze commits and diff before drafting the MR
- Draft a clear merge request title and description
- Create the merge request with `glab`
- Reuse a local MR body conventions document for consistent descriptions

## Structure

```text
gitlab-create-mr/
├── SKILL.md
├── README.md
├── agents/
│   └── openai.yaml
└── references/
    ├── mr-body-conventions.md
    └── verified-commands.md
```

## Notes

- This skill is designed to run independently.
- It supports both `gitlab.com` and self-managed GitLab instances.
- It focuses on merge request creation only and does not handle reviewer assignment.
