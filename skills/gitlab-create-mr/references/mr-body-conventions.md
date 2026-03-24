# Default MR Body Conventions

Use this file when drafting the default GitLab merge request description for this skill.

Keep the MR body simple, clear, and easy to scan. Prefer short sections, concrete bullets, and direct wording that helps reviewers understand the change quickly.

## Default Template

```markdown
## Summary
<!-- 1-2 sentences that describe the change -->

## Changes
- 
- 

## Motivation
- 

## Testing
- 
```

## Writing Rules

- Keep the body concise and reviewer-focused.
- Prefer concrete changes over line-by-line diff summaries.
- State only the testing that actually happened.
- Add `Breaking Changes` only when the change is actually breaking.
- Add `Notes` only for important reviewer context, limitations, or follow-up items.

## Example

```markdown
## Summary
Simplify the default MR body conventions for the GitHub and GitLab skills so the format is easier for reviewers to scan.

## Changes
- Replace the previous verbose structure with a shorter default template
- Remove overly detailed writing guidance and example-heavy sections
- Align the GitHub and GitLab body formats around the same core sections

## Motivation
- The previous template was too long and added unnecessary reading overhead during review

## Testing
- Manually reviewed the updated template structure and wording
```
