# Request Examples

Use this file when the skill needs compact examples of how to map user intent into a validated Volcengine Ark image generation request.

When the user clearly wants the image to be generated rather than only planned, prefer returning a concrete `node skills/volcengine-ark-image-generator/scripts/generate-image.mjs ... --execute` command.

## Executable Command Examples

Text-to-image:

```bash
node skills/volcengine-ark-image-generator/scripts/generate-image.mjs \
  --prompt "一只戴墨镜的橘猫坐在海边，日落，超写实" \
  --output output/cat.png \
  --execute
```

Single-reference image generation:

```bash
node skills/volcengine-ark-image-generator/scripts/generate-image.mjs \
  --prompt "以参考图作为产品主体参考，保留主体造型和金属质感，改成深色高端广告图" \
  --image path/to/reference.png \
  --output output/ad.jpg \
  --execute
```

## Text-to-Image Example

User request:

- "用火山引擎生成一张新中式茶具海报，深色木桌，晨雾，留白适合加文案"

Recommended interpretation:

- intent: `text-to-image`
- subject: Chinese tea set
- style: modern Chinese editorial poster
- composition: negative space for copy
- environment: dark wood table, morning mist

Example prompt:

- `A modern Chinese editorial poster featuring a refined tea set on a dark wooden table, soft morning mist, calm premium atmosphere, balanced composition with clean negative space for copy`

Good output shape:

- intent: `text-to-image`
- model: a current general-purpose Seedream model in the executable working set
- prompt: compact, concrete, and visual
- validation: compatible

## Single-Reference Example

User request:

- "参考这张台灯产品图，保留主体形状和材质，改成杂志感暖调场景图"

Recommended interpretation:

- intent: `single-reference image generation`
- preserve: lamp silhouette and material
- change: scene, lighting mood, editorial presentation

Example prompt:

- `Use the reference image as the product subject reference. Preserve the lamp shape and material finish. Reframe it as a warm editorial interior scene with magazine-style lighting, clean composition, and premium home-living atmosphere.`

Good output shape:

- intent: `single-reference image generation`
- model: `doubao-seededit-3-0-i2i-250628` unless the user explicitly forces another verified model
- prompt: preserve subject structure and materials; change scene and presentation style
- validation: compatible if only one reference image is used

## Invalid Request Example

User request:

- "直接把这三张图融合一下，再顺便导出 png 并流式返回"

Recommended handling:

- classify as `unsupported advanced request`
- explain that multi-reference and streaming behavior must be verified against the current official model page
- avoid constructing a speculative payload

## Invalid Model Example

User request:

- "用 `doubao-seedream-3.0-t2i` 参考这张图生成一个新版本"

Recommended handling:

- reject the request
- explain that the selected model is treated as `text-to-image` only on this skill's default path
- suggest a model with explicit image-conditioned support in the executable working set

## Default Response Shape

For planning responses, prefer this compact structure:

```markdown
# Volcengine Ark Image Generation Plan

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
- <command to run, payload, or execution note>
```

If the request is invalid, replace `Next Step` with:

```markdown
## Fix Required
- <field>: <why it is invalid>
- <field>: <shortest supported correction>
```
