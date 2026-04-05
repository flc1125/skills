# Request Examples

Use this file when the skill needs compact examples of how to map user intent into a validated Volcengine Ark image generation request.

When the user clearly wants the image to be generated rather than only planned, prefer returning a concrete `python3 skills/volcengine-ark-image-generator/scripts/generate-image.py ... --execute` command.

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

## Single-Reference Example

User request:

- "参考这张台灯产品图，保留主体形状和材质，改成杂志感暖调场景图"

Recommended interpretation:

- intent: `single-reference image generation`
- preserve: lamp silhouette and material
- change: scene, lighting mood, editorial presentation

Example prompt:

- `Use the reference image as the product subject reference. Preserve the lamp shape and material finish. Reframe it as a warm editorial interior scene with magazine-style lighting, clean composition, and premium home-living atmosphere.`

## Invalid Request Example

User request:

- "直接把这三张图融合一下，再顺便导出 png 并流式返回"

Recommended handling:

- classify as `unsupported advanced request`
- explain that multi-reference and streaming behavior must be verified against the current official model page
- avoid constructing a speculative payload
