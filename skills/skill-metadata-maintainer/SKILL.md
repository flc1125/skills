---
name: skill-metadata-maintainer
description: Initialize or update the metadata field in one specific skill's SKILL.md according to this repository's CONTRIBUTING.md rules. Use when Codex needs to maintain metadata for exactly one target skill, derive author and created from git history, and require explicit confirmation before overwriting existing metadata values.
metadata:
  name: Skill Metadata Maintainer
  description: Initialize or update the metadata object in one target skill's SKILL.md.
  author: Flc゛
  created: 2026-03-28T12:24:13Z
---

# Skill Metadata Maintainer

Maintain `metadata` in exactly one target skill.

This skill exists to initialize or update the `metadata` object inside one `SKILL.md` file while following repository rules from [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Non-Negotiable Safety Rules

- You MUST operate on exactly one target skill per request.
- You MUST require the user to specify a unique target, such as the skill name, the skill directory path, or the `SKILL.md` path.
- You MUST NOT infer a bulk target such as "all skills", "the whole repo", or "every missing file" from ambiguous wording.
- If the request does not identify a single skill unambiguously, you MUST stop and ask the user to specify the exact target skill.
- Before modifying anything, you MUST read the existing `SKILL.md` and inspect the current `metadata` values if present.
- If any target metadata field already has a value and your change would add, replace, or normalize that value, you MUST explicitly show the user what exists now and ask for confirmation before writing.
- You MUST NOT silently overwrite existing metadata values.

## Inputs

The request MUST identify one target skill by at least one of:

1. skill name, for example `skill-metadata-maintainer`
2. skill directory path, for example `skills/skill-metadata-maintainer`
3. `SKILL.md` file path

Optional user intent may also specify:

- initialize missing metadata only
- update selected metadata fields
- normalize metadata to repository convention

## Source Of Truth

When generating or validating metadata, follow [CONTRIBUTING.md](../../CONTRIBUTING.md).

Apply these rules:

- `metadata.name`: human-readable display name for the target skill, derived from the skill name by default by removing hyphens and capitalizing each word while preserving well-known brand casing and common all-caps acronyms
- `metadata.description`: purpose statement that describes what the skill is for, not how it works, and should stay under 150 characters
- `metadata.author`: initialize from the first Git author for the target `SKILL.md`
- `metadata.created`: initialize from the first Git timestamp for the target `SKILL.md`, formatted as UTC `YYYY-MM-DDTHH:mm:ssZ`
- `metadata.version`: optional; keep unset by default, and only set or update it when the user explicitly asks for versioning

If Git history for the target `SKILL.md` is unavailable or incomplete, report that clearly and ask the user how to proceed. Do not invent `author` or `created` silently when the intended source of truth cannot be verified.

## Required Workflow

Follow this sequence:

1. Resolve the target skill to one unique `SKILL.md`.
2. Read the target `SKILL.md` frontmatter and current `metadata` state.
3. Read [CONTRIBUTING.md](../../CONTRIBUTING.md) and use it as the governing spec.
4. Determine whether the user wants initialization, selective update, or normalization.
5. Inspect Git history for the target `SKILL.md` to derive `author` and `created` when needed.
6. Determine whether `version` should remain unset or be set explicitly according to [CONTRIBUTING.md](../../CONTRIBUTING.md).
7. Prepare the exact metadata object that should exist after the change.
8. If any existing field with a current value would be changed, present a concise field-by-field diff and ask for explicit confirmation.
9. Only after confirmation, update the target `SKILL.md`.
10. Report the final applied metadata and any assumptions.

## Confirmation Policy

You MUST ask for confirmation before writing when any of the following is true:

- `metadata` already exists
- any target metadata key already has a non-empty value
- your update would replace text, not just add a missing field
- your update would normalize formatting for an existing value
- your update would add, change, or remove `version`

The confirmation message SHOULD include:

- the target skill identifier
- the exact fields that would change
- the current value and proposed value for each changed field

## Output Rules

When no overwrite confirmation is needed, return:

1. the resolved target skill
2. the metadata values to be written
3. the files changed

When overwrite confirmation is needed, return:

1. the resolved target skill
2. a concise before/after diff for each changed metadata field
3. a direct confirmation request before making edits

## Red Flags

Stop and ask the user instead of editing if:

- the request names more than one skill
- the path points outside the repository's skill directories
- multiple skills match the provided identifier
- the requested change conflicts with [CONTRIBUTING.md](../../CONTRIBUTING.md)
- Git history does not provide a trustworthy source for `author` or `created`

## Style

- Be strict about target scoping.
- Be explicit about overwrite risk.
- Prefer deterministic edits over inferred broad updates.
- Keep user-facing explanations short and concrete.
