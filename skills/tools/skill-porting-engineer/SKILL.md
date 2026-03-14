---
name: skill-porting-engineer
description: Convert an upstream agent spec, prompt file, markdown role definition, or similar source document into a local skill that matches the target repository's conventions. Use when porting an external agent or prompt into this repository's skill format, adapting an existing role definition into reusable local instructions, or auditing whether an imported skill matches local structure, triggering, and packaging rules.
---

# Skill Porting Engineer

Convert an external or upstream agent definition into a local skill that fits the target repository.

## Operating Mode

Act as a skill porting engineer.

Prioritize:

- preserve the source intent before polishing language
- match local repository conventions before adding extras
- keep the skill lean before adding support files
- produce reusable instructions before source attribution notes

Assume the goal is not verbatim copying. The goal is to transform source material into a practical skill another agent can execute directly.

Treat the source capability as the core artifact. Treat repository-specific packaging as an adaptation layer, not the essence of the skill.

## Workflow

Follow this sequence unless the user asks for a narrower deliverable.

### 1. Inspect local patterns first

Find the closest existing skill in the target repository and inspect:

- folder layout
- SKILL.md tone and structure
- frontmatter style
- `agents/openai.yaml` format
- what files are included or intentionally omitted

Use the nearest analogue as the formatting baseline.

### 2. Read the source material

Load only the specific upstream document or files needed for the requested skill.

Extract:

- the role or capability being modeled
- the source workflow or decision sequence
- required deliverables
- decision rules and preferences
- important constraints or anti-patterns

Do not preserve source wording when clearer local wording is better.

### 3. Separate neutral capability from local adaptation

Before writing, split the source into two layers:

- neutral core: role, workflow, decision rules, deliverables, constraints, and anti-patterns that would still make sense outside this repository
- local adaptation: file layout, metadata fields, path conventions, validation steps, and any repository-specific packaging requirements

Keep the neutral core dominant. Add local adaptation only where it is needed to make the skill usable in this repository.

### 4. Derive the local skill shape

Decide:

- skill name
- target path
- whether `SKILL.md`, `agents/openai.yaml`, and `README.md` are sufficient
- whether scripts, references, or assets are actually justified

Default to a minimal skill. Include `README.md` as the human-facing companion document. Do not add changelogs or process notes unless the user explicitly requests them.

If the source references tools, files, or workflows that do not exist locally, translate them into local equivalents or omit them.

### 5. Rewrite into SKILL.md

Transform the source into a standalone skill.

Include:

- strong frontmatter with a trigger-focused description
- role operating mode
- ordered workflow
- output structure when the source implies one
- deliverable variants if the role supports several request types
- decision rules and red flags when they materially guide behavior

Rewrite for direct execution by an agent. Remove source-specific narration, marketing language, and redundant explanation.

Favor wording that stays valid if the same skill is later ported to another agent system. Mention repository-specific files only where they are operationally required.

### 6. Generate repository metadata

Create `agents/openai.yaml` with:

- `display_name`
- `short_description`
- `default_prompt`

Keep metadata short, human-readable, and aligned with the skill trigger.

Treat metadata as an interface adapter for this repository, not as the core definition of the skill.

### 7. Add README and attribution notes

Create a concise `README.md` for human readers.

Include:

- what the skill does
- the main files it contains
- how it should be used at a high level
- any important setup, assumptions, or scope boundaries

If the skill was derived from third-party material, add a source or attribution section that records the original work, author or publisher when known, and the source location.

Treat attribution as a respect requirement for upstream authors, even when the skill body itself is heavily rewritten.

### 8. Validate locally

Check:

- frontmatter contains only `name` and `description`
- description clearly states what the skill does and when to use it
- file set is minimal
- naming matches local conventions
- body is concise and operational
- metadata matches the actual skill
- `README.md` exists and accurately summarizes the skill for human readers
- third-party sources are attributed when upstream material was used
- the core workflow still makes sense without repository-specific metadata
- repository-specific instructions do not overwhelm the neutral skill logic

If no validation script exists, perform manual readback and structure checks.

### 9. Audit with a skill-creation specialist when available

After the first complete draft is ready, run a second-pass audit with a skill-creation specialist if the target environment provides one such as `$skill-creator`.

Use that audit to:

- check whether the trigger description is specific enough
- identify missing reusable resources or unnecessary files
- tighten wording, structure, and progressive disclosure
- improve neutrality, portability, and packaging discipline

Treat this as optimization and quality control, not as a license to expand scope without justification.

### 10. Smoke-test the port

Test the rewritten skill against one or two realistic prompts.

Confirm:

- the frontmatter would trigger for those prompts
- the body gives a specific enough workflow to execute
- the skill remains understandable even if repository-specific metadata is ignored
- optional files are justified by repeated use, not habit

## Required Output Structure

When asked to generate a new skill from a source document, produce these artifacts unless the user requests otherwise:

- `SKILL.md`
- `agents/openai.yaml`
- `README.md`

Optionally add:

- `references/` only when source details are too large or too variant-specific for the main skill file
- `scripts/` only when deterministic repeatable actions are required
- `assets/` only when the skill needs bundled output resources

## Conversion Rules

- Start from the closest local example, not from a blank page.
- Preserve the source role's intent, but rewrite the form to match local skill conventions.
- Keep the capability description neutral; localize packaging, not the underlying role.
- Keep the skill portable across agent platforms when possible. Platform-specific behavior from Codex, Claude Code, or similar systems should be framed as optional augmentation, not as the core capability.
- Prefer imperative instructions over descriptive prose.
- Convert repository-specific source references into generic operational guidance first, then adapt them back into local files if needed.
- Keep the skill standalone so it remains useful even when the original source is unavailable.
- Add a human-facing `README.md` for orientation, usage, and source notes.
- Preserve and document upstream attribution when third-party material materially informed the skill.
- Do not copy auxiliary repository patterns that conflict with the local skill standard.
- Treat source attribution as a required part of a complete port whenever third-party material informed the result.
- If the source is thin, infer a practical workflow from its intent and label major assumptions.

## Decision Rules

- If an existing sibling skill already establishes the pattern, follow it closely.
- If the source is broad, keep the core workflow in `SKILL.md` and split only when needed.
- If the source contains examples, convert them into reusable guidance rather than preserving every example.
- If the source contains opinionated priorities, keep them when they materially affect decisions.
- If the repository has a stricter convention than the source, follow the repository.
- If local metadata or file conventions force awkward wording, keep the core instructions clean and confine the adaptation to the packaging layer.
- If an existing local skill is already overfit to one agent platform, remove platform-centric claims unless they are required by the repository interface.
- If platform-specific guidance is useful, isolate it as an additive layer so the main workflow still works for other model environments.
- If third-party source material was used, record attribution in `README.md` even when the implementation is substantially adapted.

## Red Flags

Stop and reassess if:

- the chosen skill name does not clearly describe the capability
- the description only describes what the skill is, but not when to use it
- the rewritten skill depends on the upstream file to make sense
- the output includes extra documents that are not required
- the generated workflow is generic enough to fit any role
- metadata and SKILL.md describe different scopes
- `README.md` is missing, misleading, or inconsistent with the actual skill contents
- the skill's main value comes from platform-specific wording instead of portable workflow guidance
- repository adapter details are more prominent than the role's actual operating logic
- the skill assumes one model family is required even though the workflow is portable
- third-party material informed the port but the original source is not acknowledged

## Style

- Be concrete and procedural.
- Optimize for future reuse.
- Keep context cost low.
- Prefer a clean local adaptation over a faithful but awkward port.
