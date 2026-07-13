# Default PR Body Conventions

Use this file when drafting the default GitHub pull request body for this skill.

Keep the PR body simple, clear, and easy to scan. Prefer short sections, concrete bullets, and direct wording that helps reviewers understand the change quickly.

Use the default template for focused, compatible changes. When the change is incompatible, or the user explicitly requests breaking changes, before-and-after comparisons, upgrade notes, or migration guidance, use the additional rules and adaptive template in [breaking-change-conventions.md](breaking-change-conventions.md).

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
- Describe public capabilities and meaningful behavior, not a file-by-file diff narration.
- Base the body on the final base-to-head diff, current code, and tests; do not publish stale ideas from plans or earlier discussion.
- State only the testing that actually happened.
- Mention skipped or blocked validation only when it materially affects review confidence.
- Do not include secrets, credentials, local environment details, absolute local paths, or other sensitive information in the PR body.
- Use repository-relative paths only when they help reviewers locate changed source files.
- Summarize local debugging and command output instead of publishing machine-specific paths such as `/Users/...`, `/tmp/...`, cache directories, generated artifact locations, hostnames, usernames, or local-only ports.
- Add optional sections only when they contain material reviewer information; never emit empty headings.
- Add `Breaking Changes` only when downstream users must change code, configuration, data, deployment, or operating assumptions.
- Add `Notes` only for important reviewer context, limitations, or follow-up items.

## Example

```markdown
## Summary
Simplify the default PR body conventions for the GitHub and GitLab skills so the format is easier for reviewers to scan.

## Changes
- Replace the previous verbose structure with a shorter default template
- Remove overly detailed writing guidance and example-heavy sections
- Align the GitHub and GitLab body formats around the same core sections

## Motivation
- The previous template was too long and added unnecessary reading overhead during review

## Testing
- Manually reviewed the updated template structure and wording
```

## Sanitized Testing Examples

Prefer:

```markdown
## Testing
- npm run lint
- npm run build
```

Avoid:

```markdown
## Testing
- Ran npm run build from /Users/name/data/www/project/web and inspected output in /var/folders/.../next
```
