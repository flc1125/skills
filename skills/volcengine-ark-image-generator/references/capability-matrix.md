# Capability Matrix

Use this file when you need to decide which Volcengine image model can satisfy a request without guessing.

This matrix is intentionally conservative. If official pages disagree or a capability is only implied on one page, prefer the narrower interpretation and tell the user what still needs verification.

## Verification Sources

Verify uncertain capabilities against these official pages before broadening behavior:

- Ark image generation API: `https://www.volcengine.com/docs/82379/1666945?lang=zh`
- Ark Base URL and authentication: `https://www.volcengine.com/docs/82379/1298459?lang=zh`
- Seedream series capability summary: `https://www.volcengine.com/docs/6492/2172373?lang=zh`
- SeedEdit tutorial for image-conditioned examples: `https://www.volcengine.com/docs/82379/1824691?lang=zh`

Observed recency from the official pages used while creating this skill:

- image generation API page showed `2026-04-02`
- Base URL and authentication page showed `2026-03-13`

This skill is bound to the default Ark image generation surface. If a request only works on another Volcengine product surface, stop and say so explicitly instead of silently changing surfaces.

## Core Rule

Route requests by intent first, then by model support.

- If the request is `text-to-image`, a text-only model may be sufficient.
- If the request uses a reference image, choose a model that explicitly supports image-conditioned input.
- If the request needs more than one reference image, treat it as advanced and verify current official docs before proceeding.
- If the request can only be satisfied by switching away from the default Ark image generation surface, stop and surface that boundary explicitly.

## Working Matrix For This Skill

The bundled script only executes against a narrow working set. Prefer these exact version IDs:

- `doubao-seedream-5-0-lite-260128`
- `doubao-seededit-3-0-i2i-250628`
- `doubao-seedream-3.0-t2i`

The bundled script also accepts these family aliases and normalizes them to the exact version IDs above:

- `doubao-seedream-5.0-lite` -> `doubao-seedream-5-0-lite-260128`
- `doubao-seededit-3.0-i2i` -> `doubao-seededit-3-0-i2i-250628`

### `doubao-seededit-3-0-i2i-250628`

- safest interpretation: single-reference image-conditioned generation on the default Ark surface
- image input: required
- bundled script alias: `doubao-seededit-3.0-i2i`
- use when:
  - the user supplies one reference image
  - the goal is to preserve subject structure or material while changing scene, style, or presentation
  - the bundled script is executing a single-reference request without an explicit model override
- reject when:
  - the request uses more than one reference image
  - the user asks for grouped generation or streaming behavior without a separately verified path

### `doubao-seedream-3.0-t2i`

- safest interpretation: `text-to-image` only
- image input: not supported
- use when:
  - the request is pure prompt-to-image
  - no reference image is needed
- reject when:
  - the user provides any `image` input
  - the user asks for image-conditioned generation

### `doubao-seedream-5.0-lite`

- safest interpretation for this skill: general-purpose current model for `text-to-image`
- bundled script exact model: `doubao-seedream-5-0-lite-260128`
- bundled script alias: `doubao-seedream-5.0-lite`
- image input: do not rely on it for the bundled script's default path
- `output_format`: treat as supported
- `stream`: do not enable by default; verify current official page first
- use when:
  - the user wants the current Ark image generation surface
  - the request is `text-to-image`
  - the user explicitly chooses this model family for prompt-to-image work
  - the user needs explicit control over response and output shape
- reject when:
  - the user supplies `image` input on the bundled script's default path
  - the user asks for a capability that is not clearly documented for the exact model version

### `doubao-seedream-4.5`

- safest interpretation: supports `text-to-image` and image-conditioned workflows in planning discussions
- image input: supported
- `stream`: verify before use
- bundled script execution: not in the current executable working set
- use when:
  - the project already targets Seedream 4.5
  - the request needs planning guidance for an environment that already uses this family

### `doubao-seedream-4.0`

- safest interpretation: supports `text-to-image` and image-conditioned workflows in planning discussions
- image input: supported
- `stream`: verify before use
- bundled script execution: not in the current executable working set
- use when:
  - the environment already uses Seedream 4.0
  - backward compatibility matters more than upgrading

## Parameter Handling Rules

This skill uses a closed payload philosophy:

- only include fields from the verified working set
- do not include "disable" flags for advanced features
- do not copy extra fields from nearby examples unless they are required on the exact Ark page you are using

### `model`

- Required.
- Never infer a model silently when the request depends on image input or model-specific fields.
- If the user gives a model alias or outdated name, normalize it only when the mapping is clear.

### `prompt`

- Required.
- Keep it concise and operational.
- For reference-image workflows, explain preserve-vs-change instructions explicitly.

### `image`

- Use only for models that explicitly support image-conditioned generation.
- In this skill, default support is one reference image.
- Do not silently expand one request into multi-image composition.

### `size`

- Treat as model-specific.
- Prefer a small curated set of documented sizes.
- If the user requests an arbitrary size, validate it against the current official page instead of passing it through.

### `response_format`

- Safe to expose when the current Ark page explicitly supports it.
- If support is unclear for the chosen model, avoid claiming the field is available.

### `output_format`

- Expose only when the chosen model clearly documents it.
- If support is ambiguous, keep the field unset and tell the user why.

### `watermark`

- Treat as opt-in or explicit default according to the current official page.
- Do not invent watermark behavior for models that do not document it.

### `stream`

- Advanced.
- Never enable by default in this skill.
- Use only after verifying the exact model page and current API documentation.

### Other model-specific fields

- Hide or reject provider-specific fields that are not clearly supported by the chosen model.
- If a field appears on one model family but not another, do not generalize it across all Seedream variants.
- Do not add fields such as `sequential_image_generation` to disable advanced behavior; just omit unsupported advanced fields entirely.

## Routing Examples

### Example 1

Request:

- "用火山引擎生成一张赛博朋克城市夜景"

Route:

- intent: `text-to-image`
- preferred model: `doubao-seedream-5.0-lite`

### Example 2

Request:

- "参考这张产品图，保留主体轮廓，换成极简白底海报风"

Route:

- intent: `single-reference image generation`
- preferred model: `doubao-seededit-3-0-i2i-250628`

### Example 3

Request:

- "把这三张图混合成一个新画面"

Route:

- intent: `unsupported advanced request`
- action: stop and verify current multi-reference support before constructing a payload

## Validation Contract

Before returning a payload, confirm all of these:

1. the chosen model matches the request intent
2. the request does not use fields forbidden by that model
3. every requested advanced field is documented for the exact model family
4. the skill is not silently broadening scope beyond `text-to-image` or single-reference generation
5. the request stays on the default Ark image generation surface unless the user explicitly asks otherwise

If any check fails, reject the request with the exact field and the smallest supported correction.

## Refuse These Moves

- do not satisfy a blocked request by switching to another Volcengine product endpoint
- do not accept more than one reference image in this skill's default path
- do not introduce unverified fields just because they appear in another page or code example
