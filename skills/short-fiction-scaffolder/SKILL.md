---
name: short-fiction-scaffolder
description: Scaffold a new Chinese commercial short-fiction project with versioned drafts, one maintained outline, publication metadata, revision notes, and optional cover artwork. Use when starting a new short-story repository or directory; do not use for drafting or revising an existing story.
metadata:
  name: 短篇小说骨架器
  description: Create a safe, versioned, and sustainable project skeleton for Chinese commercial short fiction.
---

# Short Fiction Scaffolder

Create a sustainable project skeleton for a new Chinese commercial short story. Initialize structure only: do not invent characters, plot, manuscript prose, or promotional copy, and do not treat scaffolding permission as authorization for Git or GitHub operations.

## Collect Inputs

Obtain two required inputs before starting:

- output path
- work title

The following inputs are optional. Do not ask for them when omitted unless the user says they affect the current initialization:

- pen name
- genre
- target length or length range
- PNG cover path

Extract these values from the user's natural-language request, then call the deterministic script. Do not require the user to restate their request as command-line arguments.

## Scaffold the Project

Run this skill's `scripts/scaffold_project.py`:

```bash
python3 <skill-directory>/scripts/scaffold_project.py \
  --output <project-path> \
  --title <work-title> \
  [--pen-name <pen-name>] \
  [--genre <genre>] \
  [--target-length <target-length>] \
  [--cover <png-path>]
```

The script accepts only a nonexistent or empty target directory. If the target contains any file, preserve it and explain the refusal; do not add or simulate a force-overwrite option. When a cover is provided, the script validates the PNG and copies it to `assets/cover.png`. Without a cover, the README must not contain an image link.

Do not run `git init`, create a remote repository, commit, or push during scaffolding. If the user explicitly requests one of those operations afterward, treat it as a separate task and confirm its scope.

## Preserve the Output Contract

The generated project must preserve these relationships:

- `README.md` is the project entry point. It links only to the current recommended draft, the outline, publication metadata, and revision notes that actually exist for the current version.
- `docs/outline.md` is the single continuously maintained story outline.
- Manuscripts use `docs/drafts/vN.md`. A major rewrite creates the next version instead of overwriting history.
- Revision notes use `docs/revision-notes/vN.md` and match the manuscript version. Do not create revision notes for the initial `v1.md`.
- `docs/publication/metadata.md` reserves the formal-draft path, one-line pitch, spoiler-free synopsis, tags, content notice, byline, and cover information.
- Publication assets live in `assets/`; the primary cover is always `assets/cover.png`.
- Do not create `latest.md`, `current.md`, or other duplicate current-version files.

Templates establish structure and writing prompts only; they do not fill in story-specific content. Markdown files use UTF-8 and exactly one H1 each. Use `---` only for scene or chapter breaks in the manuscript.

## Verify the Result

After scaffolding:

1. List generated files and confirm that the structure and optional fields match the user's inputs.
2. Search for unreplaced `{{TOKEN}}` markers.
3. Confirm that every local README link exists and that a coverless project has no cover image tag.
4. If the target already belongs to a Git repository, run `git diff --check` when useful, but do not initialize, commit, or push merely to perform validation.

Report the generated path, the optional inputs used, and the external operations that were intentionally not performed.
