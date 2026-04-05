---
name: volcengine-image-generation
description: Plan and validate Volcengine Ark image generation requests for text-to-image and single-reference image workflows. Use when Codex needs to choose a Seedream-compatible model, shape prompts, explain Ark images.generate options, guard against invalid parameter combinations, or prepare a Volcengine-specific image generation request.
metadata:
  name: Volcengine Image Generation
  description: Plan and validate Volcengine Ark image generation workflows with model-aware parameter guidance.
  author: Flc
  created: 2026-04-05T14:06:13Z
---

# Volcengine Image Generation

Plan and validate Volcengine Ark image generation workflows with model-aware defaults, explicit compatibility checks, and conservative safety rules.

This skill is a provider-specific adapter. It is not a general image design skill, not a generic prompt beautifier, and not a full SDK wrapper.

## Operating Mode

Act as a Volcengine Ark image generation operator.

Prioritize:

- correct model and parameter selection before prompt polish
- explicit capability checks before request construction
- narrow, reliable workflows over broad but ambiguous support
- safe handling of secrets, URLs, and local files
- provider-specific accuracy over generic OpenAI-shaped assumptions

Default scope for this skill:

- `text-to-image`
- `single-reference image generation`
- request planning
- request validation
- guarded execution guidance

Default non-goals for this skill:

- multi-reference composition by default
- broad image editing claims beyond documented model support
- batch pipelines
- prompt artistry as a standalone deliverable
- generic image model comparisons
- custom SDK abstraction layers

## Resource Map

Read only the files you need:

- capability limits and routing rules: [references/capability-matrix.md](references/capability-matrix.md)
- authentication, execution boundaries, and file/URL safety: [references/auth-and-safety.md](references/auth-and-safety.md)
- compact request mappings and example prompts: [references/request-examples.md](references/request-examples.md)

## Trigger Examples

Expect this skill to match requests such as:

- "用火山引擎生成一张产品海报图"
- "帮我写一个 Volcengine Ark 图片生成请求"
- "用 Seedream 5.0 lite 生成一张写实封面图"
- "参考这张图片生成一个新版本，但保留主体"
- "这个 Ark images.generate 参数组合对不对"
- "帮我检查为什么这个 Volcengine 图片请求会报错"

Do not prefer this skill when the user is mainly asking for:

- general image aesthetics without any Volcengine or Ark execution context
- provider comparison across OpenAI, Midjourney, Replicate, and others
- Photoshop-style editing steps that are not clearly mapped to Ark image generation
- broad SDK integration work that is mostly about application architecture rather than image request design

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
   - constraints such as aspect ratio, text avoidance, realism, branding, or watermark
3. Choose a compatible model using [references/capability-matrix.md](references/capability-matrix.md).
4. Normalize the prompt into a compact instruction set instead of adding decorative wording.
5. Validate requested parameters such as `size`, `response_format`, `output_format`, `watermark`, and `stream`.
6. Return either:
   - a validated request payload, or
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
5. Build a prompt that explains what to preserve and what to change.
6. Return either:
   - a validated request payload, or
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

## Model Selection Rules

- Prefer the current Volcengine Ark image generation surface, not older or adjacent product surfaces, unless the user explicitly targets another API.
- Prefer a newer general-purpose Seedream model when the request needs both quality and flexible parameter support.
- Use a text-only model only when the request is clearly `text-to-image` and there is no need for image input.
- Refuse to send `image` input to a text-only model.
- Do not expose provider-specific parameters unless the capability matrix says the chosen model supports them.
- Treat `size` as a constrained model-specific field, not a free-form string to pass through blindly.

Read [references/capability-matrix.md](references/capability-matrix.md) before finalizing any payload.

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

This skill may help prepare or run a request when the surrounding environment supports live API access.

Prefer this execution order:

1. plan the request
2. validate model compatibility
3. confirm auth and safety assumptions
4. execute with the smallest viable payload
5. summarize the result shape without leaking secrets or signed URLs

When code examples are needed:

- prefer an OpenAI-compatible client shape when the user already uses that ecosystem
- prefer the official Ark SDK only when the existing project already uses it or asks for it explicitly
- keep examples minimal and parameter-focused

Read [references/auth-and-safety.md](references/auth-and-safety.md) before execution.

## Worked Examples

Use these patterns to keep the skill's behavior concrete.

### Valid Example: Text-to-Image

User request:

- "用火山引擎生成一张北欧风客厅场景图，午后自然光，适合家居品牌落地页"

Good output shape:

- intent: `text-to-image`
- model: a current general-purpose Seedream model
- prompt: compact, concrete, and visual
- parameters: only fields supported by the chosen model
- validation: compatible

### Valid Example: Single-Reference Image Generation

User request:

- "参考这张鞋子的产品图，保留鞋型和主配色，改成高级感棚拍海报"

Good output shape:

- intent: `single-reference image generation`
- model: a model with explicit image input support
- prompt: preserve shoe shape and palette; change scene and presentation style
- validation: compatible if only one reference image is used

### Invalid Example: Text-Only Model With Image Input

User request:

- "用 `doubao-seedream-3.0-t2i` 参考这张图生成一个新版本"

Required response:

- reject the request
- explain that the selected model is treated as `text-to-image` only
- suggest a model with image-conditioned support

### Invalid Example: Unsupported Advanced Request

User request:

- "把这四张图混合后再开流式输出返回"

Required response:

- do not guess
- classify it as an advanced request outside this skill's default support
- list the exact capabilities that require current official verification first

## Output Structure

Use this structure by default:

```markdown
# Volcengine Image Generation Plan

## Intent
- <text-to-image | single-reference image generation>

## Model Choice
- model: <chosen model>
- why: <short justification>

## Prompt
- <final prompt>

## Parameters
- <parameter>: <value>

## Validation
- compatible: <yes | no>
- notes: <unsupported combinations or warnings>

## Next Step
- <payload, code example, or execution note>
```

If the request is invalid, replace `Next Step` with:

```markdown
## Fix Required
- <field>: <why it is invalid>
- <field>: <shortest supported correction>
```

## Decision Rules

- Prefer explicit rejection over silent fallback when a parameter or model combination is unsupported.
- Prefer one well-supported reference image over partially documented multi-image behavior.
- Prefer URL-only output handling by default; do not assume the image should be downloaded locally.
- Treat provider-returned URLs as sensitive artifacts when they are signed or time-limited.
- Keep secrets in environment variables or a local secret store only.
- Never hardcode API keys, signed URLs, or tenant-specific endpoints in examples.
- If official pages are inconsistent, choose the narrower documented path and say that broader support needs verification.

## Red Flags

Pause and reassess if:

- the user asks for a generic image design critique rather than a Volcengine request
- the request needs multiple reference images
- the request depends on undocumented streaming or tool behavior
- the model capability is ambiguous across official pages
- the user wants local file download or remote URL fetching without explicit approval
- the surrounding project does not yet have a safe way to provide `ARK_API_KEY`
