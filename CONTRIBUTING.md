# Contributing

This document defines the minimum contribution rules for `skills/*/SKILL.md` files in this repository. Unless stated otherwise, contributors should follow these rules when adding or modifying skills.

## Scope

- `SKILL.md` files must use valid YAML frontmatter.
- The existing `name` and `description` frontmatter fields remain the primary skill identity fields.
- When additional repository-level or display-oriented metadata is needed, use the `metadata` object.
- Human-facing explanatory content should be written in English.

## Metadata

Each `SKILL.md` should include a `metadata` field. `metadata` must be an object. The current convention is:

```yaml
metadata:
  name: Human-readable skill name
  description: One sentence describing what the skill is for.
  author: Flc
  created: 2026-03-28 21:15:00
  version: 1.0.0
```

Field requirements:

| Key | Type | Requirement | Rule |
|---|---|---|---|
| `name` | string | MUST | Human-readable display name derived from the skill name by default |
| `description` | string | MUST | Purpose statement that describes what the skill does, not how it works internally |
| `author` | string | MUST | Derived from the first recorded author of the skill |
| `created` | string | MUST | Derived from the first recorded creation time of the skill, formatted as `YYYY-MM-DD HH:mm:ss` |
| `version` | string | OPTIONAL | Metadata version for the skill; leave unset when no versioning policy exists |

Additional rules:

- `metadata` must appear inside the YAML frontmatter.
- `metadata` keys must use lowercase English field names.
- `metadata` values must be scalar strings.
- `name` should default to the skill `name` transformed into title case display text.
- `name` should remove hyphens and capitalize each word by default.
- `name` should preserve well-known brand casing and common all-caps acronyms when applicable.
- `description` should remain a single sentence.
- `description` should stay under 150 characters.
- `description` should not describe internal steps, call chains, or implementation details.
- `created` must not include a timezone offset or ISO 8601 suffix.
- If `version` is present, it should use `MAJOR.MINOR.PATCH` semantic versioning format.
- `version` represents the current metadata or skill definition version, not a Git commit, date, or branch name.
- Do not infer or auto-increment `version` unless an explicit versioning policy exists.

## Source Of Truth

- The initial values for `metadata.author` and `metadata.created` should come from Git history.
- Prefer the first commit recorded for the target `SKILL.md`.
- If the file history is not sufficient to reflect the real creation point of the skill, you may use the first commit for the skill directory instead, but the reason should be noted in the commit description.

## Update Policy

- New skills should add `metadata` as soon as possible.
- Existing skills that lack `metadata` should be filled in when first touched.
- Editing the main skill content should not also change `author` or `created`.
- If no explicit versioning policy exists, `version` should remain unset.
- Only set or update `version` when the skill is intentionally maintained with versioning.
- Existing `metadata` should only be corrected when the metadata is actually wrong.

## Example

```yaml
---
name: skill-metadata-maintainer
description: Maintain metadata for one target skill by reading repository rules, inspecting the current SKILL.md, and deriving historical fields from git before proposing changes.
metadata:
  name: Skill Metadata Maintainer
  description: Initialize or update the metadata object in one target skill's SKILL.md.
  author: Flc
  created: 2026-03-28 21:15:00
---
```
