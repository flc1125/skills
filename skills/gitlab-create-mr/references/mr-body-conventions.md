# Default MR Body Conventions

Use this file when drafting the default GitLab merge request description for this skill.

This file is not only a raw template. It defines:

- the default MR body structure
- what each section is for
- how detailed the content should be
- one concrete example

## Default Template

```markdown
## Summary
- <high-level change 1>
- <high-level change 2>

## Why
- <problem, goal, or context>

## Implementation Notes
- <important design choice, migration, or reviewer context>

## Testing
- <validation performed>

## Risks
- <risk, limitation, follow-up, or "None">

## References
- <issue, ticket, incident, or "None">
```

## Section Guidance

### `Summary`

Purpose:

- give reviewers a quick scan of the meaningful changes

Rules:

- prefer 2 to 4 bullets
- focus on user-visible, reviewer-relevant, or system-relevant changes
- avoid repeating commit messages line by line

### `Why`

Purpose:

- explain why this change is needed now

Rules:

- capture the problem, goal, or operational context
- explain motivation, not implementation detail
- prefer one concise bullet unless more context is necessary

### `Implementation Notes`

Purpose:

- surface details that matter during review but are not obvious from the diff alone

Rules:

- include migrations, rollout constraints, tradeoffs, compatibility notes, or review focus points
- omit this section only if the user explicitly asks for a shorter body

### `Testing`

Purpose:

- make validation explicit and honest

Rules:

- list concrete checks that actually ran
- use entries such as `npm run lint`, `npm run build`, manual verification, or `Not run`
- do not imply validation that was not performed

### `Risks`

Purpose:

- highlight what could still go wrong or what remains incomplete

Rules:

- include behavior risk, operational risk, missing coverage, or follow-up work
- use `None` only when the change is truly low risk

### `References`

Purpose:

- connect the merge request to surrounding work

Rules:

- include GitLab issues, tickets, incidents, specs, or `None`
- prefer concrete identifiers over vague wording

## Writing Rules

- keep bullets concise and specific
- optimize for reviewer comprehension, not exhaustive narration
- be explicit about missing tests, follow-up work, and uncertainty
- avoid empty boilerplate

## Avoid

- line-by-line diff summaries
- generic filler such as `some refactoring`
- overstated testing claims
- vague risk statements that hide uncertainty

## Example

```markdown
## Summary
- Add a dedicated `gitlab-create-mr` skill for drafting and opening GitLab merge requests
- Support both GitLab.com and self-managed GitLab host detection before write operations

## Why
- The repository needs a standalone GitLab MR workflow that does not depend on GitHub-specific or auxiliary skills

## Implementation Notes
- The skill defaults to bare `glab` usage and only inspects remotes when host context is unclear
- MR description generation follows a local conventions document so the format can be updated without changing the main skill

## Testing
- Manual review of skill structure and frontmatter

## Risks
- No automated validation; correctness depends on future real-world usage against `glab`

## References
- None
```
