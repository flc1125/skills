---
name: volcengine-ark-image-generator
description: Generate or validate Volcengine Ark image requests for text-to-image and single-reference image workflows. Use when Codex needs to choose a Seedream or SeedEdit model, shape prompts, execute image generation through the bundled script, explain Ark images.generate options, or guard against invalid parameter combinations.
metadata:
  name: Volcengine Ark Image Generator
  description: Plan and validate Volcengine Ark image generation workflows with model-aware parameter guidance.
  author: Flc
  created: 2026-04-05T14:38:53Z
---

# Volcengine Ark Image Generator

Generate images with Volcengine Ark using an executable default path, with model-aware defaults, explicit compatibility checks, and conservative safety rules.

This skill is a provider-specific image generation operator. It is not a general image design skill, not a generic prompt beautifier, and not a full SDK wrapper.

## Operating Mode

Act as a Volcengine Ark image generation operator.

Prioritize:

- successful image generation through the default execution path
- correct model and parameter selection before prompt polish
- explicit capability checks before request execution
- narrow, reliable workflows over broad but ambiguous support
- safe handling of secrets, URLs, and local files
- provider-specific accuracy over generic OpenAI-shaped assumptions

Default scope for this skill:

- `text-to-image`
- `single-reference image generation`
- guarded execution through the bundled script
- request planning and validation
- Ark default image generation surface only

Default non-goals for this skill:

- multi-reference composition by default
- broad image editing claims beyond documented model support
- batch pipelines
- prompt artistry as a standalone deliverable
- generic image model comparisons
- custom SDK abstraction layers
- switching to adjacent Volcengine products or non-default endpoints without explicit user instruction

## Resource Map

Read only the files you need:

- capability limits and routing rules: [references/capability-matrix.md](references/capability-matrix.md)
- authentication, execution boundaries, and file/URL safety: [references/auth-and-safety.md](references/auth-and-safety.md)
- local auth config schema: [references/config-schema.md](references/config-schema.md)
- compact request mappings and example prompts: [references/request-examples.md](references/request-examples.md)

Assume the local auth file already exists and is valid when the user asks to generate an image. Only route to [references/config-schema.md](references/config-schema.md) when execution is blocked by missing or invalid auth. Use [references/request-examples.md](references/request-examples.md) when you need a ready-to-run command or a compact output pattern.

## Core Workflows

Follow the smallest workflow that satisfies the request.

### Text-to-Image

Use for requests such as:

- "用火山引擎生成一张图"
- "帮我写一个 Ark 图片生成请求"
- "用 Seedream 生成海报图"
- "给我一个 Volcengine 文生图调用方案"

Sequence:

1. Confirm the request is `text-to-image`.
2. Extract the image goal:
   - subject
   - style
   - composition
   - scene or background
   - constraints such as aspect ratio, text avoidance, realism, or branding
3. Choose a compatible model using [references/capability-matrix.md](references/capability-matrix.md).
4. Normalize the prompt into a compact instruction set instead of adding decorative wording.
5. Validate requested parameters such as `size`, `response_format`, `output_format`, and `stream`.
6. Return either:
   - an executable command using the bundled script, or
   - a validated request payload when the user only wants planning, or
   - a rejection with the exact incompatible fields and the shortest fix.

### Single-Reference Image Generation

Use for requests such as:

- "参考这张图生成一个新版本"
- "基于这张图保持主体风格再生成"
- "用这张图做参考生成一张类似构图的图片"

Sequence:

1. Confirm the request is a single-reference workflow.
2. Identify the role of the reference image:
   - subject reference
   - composition reference
   - style reference
   - edit-like transformation
3. Refuse models that do not support image-conditioned input.
4. Validate that the request stays within this skill's supported scope:
   - one reference image only
   - no implicit multi-image composition
   - no undocumented parameter guessing
   - no adjacent-product endpoint switching
5. Build a prompt that explains what to preserve and what to change.
6. Return either:
   - an executable command using the bundled script, or
   - a validated request payload when the user only wants planning, or
   - a rejection with a model or parameter correction.

## Intent Classification

Before choosing a model, classify the request into one of these intents:

1. `text-to-image`
2. `single-reference image generation`
3. `unsupported advanced request`

Treat these as unsupported advanced requests unless current official documentation clearly supports them and the user explicitly wants them:

- multiple reference images
- streaming output
- grouped or sequential generation
- provider-specific tools that are not stable across models
- parameter combinations that are only documented on one partially inconsistent page

When a request falls into the third category, do not guess. State that the request exceeds this skill's default support and explain which documented capability must be verified first.

## Request Surface Rules

Stay on the default Ark image generation surface unless the user explicitly asks for another Volcengine product surface.

- Do not switch to LAS, operator endpoints, or other adjacent product APIs just because they appear to support broader features.
- Do not infer that a neighboring product page expands this skill's default support.
- If a request can only be satisfied by changing API surface, stop and say so explicitly.

## Working Set Rules

Read [references/capability-matrix.md](references/capability-matrix.md) before finalizing any payload or command.

Keep the working set narrow:

- only use fields that are requested or required and explicitly supported by the chosen model
- keep payloads inside the verified Ark image generation surface
- reject `image` input for text-only models
- treat `size`, `output_format`, and `stream` as model-specific rather than pass-through fields
- omit undocumented toggles such as sequencing or grouped-generation flags instead of guessing

If a request cannot be expressed with the verified working set, reject it and point to the exact unsupported capability.

## Prompt Construction Rules

Keep prompts operational and compact.

Default prompt structure:

- subject
- visual style
- composition or camera framing
- environment or background
- material constraints
- exclusions when important

For reference-image requests, add:

- what to preserve
- what to change
- whether the image is a subject, style, or composition reference

Do not pad the prompt with generic quality adjectives unless they change the result.
Do not translate a vague user brief into a longer prompt if the added words are not actionable.

## Execution Guidance

This skill should execute image generation by default when the user is clearly asking to generate an image and the environment can run the bundled script.

Prefer this execution order:

1. plan the request
2. validate model compatibility
3. confirm auth and safety assumptions
4. execute through `scripts/generate-image.mjs`
5. summarize the result shape without leaking secrets or signed URLs

When the user does not ask for a plan-only answer, prefer the bundled script over ad hoc one-off code samples.

Read [references/auth-and-safety.md](references/auth-and-safety.md) before execution.

## Scripts

Use the bundled script for actual generation:

- `scripts/generate-image.mjs`: generate images through the default Ark HTTP surface with no third-party dependencies

Default script behavior:

- preview mode by default
- pass `--execute` to send the request
- read auth from `~/.config/flc1125/skills/volcengine-ark-image-generator/auth.json`
- default to `doubao-seedream-5-0-lite-260128` for text-to-image
- default to `doubao-seededit-3-0-i2i-250628` when `--image` is provided
- always send `watermark: false`
- accept clear family aliases for the executable working set and normalize them to exact version IDs
- support optional result download with `--output`
- keep `--output` inside the current workspace
- refuse to overwrite an existing output file
- redact local image bytes and signed result URLs from console output

If the user passes `--model`, prefer the exact executable model IDs. Family aliases such as `doubao-seedream-5.0-lite` and `doubao-seededit-3.0-i2i` are acceptable only when they map unambiguously to the script's current working set.

See [references/request-examples.md](references/request-examples.md) for executable command examples, valid and invalid request patterns, and the default response shape.

## Decision Rules

- Prefer running the bundled script over inventing one-off execution code.
- Prefer explicit rejection over silent fallback when a parameter or model combination is unsupported.
- Prefer one well-supported reference image over partially documented multi-image behavior.
- Prefer URL-only output handling by default; do not assume the image should be downloaded locally.
- Treat provider-returned URLs as sensitive artifacts when they are signed or time-limited.
- Keep secrets in environment variables or a local secret store only.
- Never hardcode API keys, signed URLs, or tenant-specific endpoints in examples.
- If official pages are inconsistent, choose the narrower documented path and say that broader support needs verification.
- If satisfying the request would require another API surface, stop instead of silently changing surfaces.
- If a field is not in the verified working set for the chosen model, omit it instead of guessing.
- When `--image` is present and the user did not force a model, prefer the bundled script's SeedEdit default because it is explicitly documented on Ark.

## Red Flags

Pause and reassess if:

- the user asks for a generic image design critique rather than a Volcengine request
- the request needs multiple reference images
- the request depends on undocumented streaming or tool behavior
- the model capability is ambiguous across official pages
- the user wants local file download or remote URL fetching without explicit approval
- the local auth file is missing or invalid
