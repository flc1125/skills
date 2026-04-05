# Volcengine Ark Image Generator

`volcengine-ark-image-generator` is a Codex skill for generating images with Volcengine Ark.

It focuses on a narrow executable path:

- `text-to-image`
- single-reference image generation
- model-aware validation before execution
- dependency-free local execution through `scripts/generate-image.mjs`

## Install

```bash
npx skills add https://github.com/flc1125/skills --skill volcengine-ark-image-generator
```

## Structure

- `SKILL.md`: agent-facing workflow, routing rules, and execution posture
- `agents/openai.yaml`: UI metadata for skill lists and invocation hints
- `scripts/generate-image.mjs`: dependency-free executor for the default Ark image generation path
- `references/capability-matrix.md`: verified model and parameter working set
- `references/auth-and-safety.md`: auth, URL, and file safety boundaries
- `references/config-schema.md`: local auth file contract
- `references/request-examples.md`: executable commands and compact response patterns

## Quick Start

1. Install the skill.
2. Create `~/.config/flc1125/skills/volcengine-ark-image-generator/auth.json`.
3. Put your Ark API key in `api_key`.
4. Run the bundled script.

Minimal `auth.json`:

```json
{
  "version": 1,
  "api_key": "replace_with_your_ark_api_key",
  "base_url": "https://ark.cn-beijing.volces.com/api/v3"
}
```

Create the config directory if needed:

```bash
mkdir -p ~/.config/flc1125/skills/volcengine-ark-image-generator
```

Text-to-image example:

```bash
node skills/volcengine-ark-image-generator/scripts/generate-image.mjs \
  --prompt "一只戴墨镜的橘猫坐在海边，日落，超写实" \
  --output output/cat.png \
  --execute
```

Single-reference example:

```bash
node skills/volcengine-ark-image-generator/scripts/generate-image.mjs \
  --prompt "以参考图作为产品主体参考，保留主体造型和金属质感，改成深色高端广告图" \
  --image path/to/reference.png \
  --output output/ad.jpg \
  --execute
```

## Execution Model

- The script defaults to preview mode.
- Add `--execute` to send the live request.
- The default text-to-image model is `doubao-seedream-5-0-lite-260128`.
- The default single-reference model is `doubao-seededit-3-0-i2i-250628`.
- The bundled script always sends `watermark: false`.
- `--output` must stay inside the current workspace.
- The bundled script refuses to overwrite an existing output file.
- The script redacts local image bytes and signed URLs from console output.

## Notes

- Assume `auth.json` is already configured when the user asks to generate an image.
- Only route the user to auth setup when execution fails because auth is missing or invalid.
- Keep requests inside the verified working set from `references/capability-matrix.md`.
