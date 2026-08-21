---
name: atlas-cloud-image-generator
description: Generate images through Atlas Cloud with schema-aware validation, preview-first execution, bounded prediction polling, and safe local output handling.
metadata:
  name: Atlas Cloud Image Generator
  description: Generate images through Atlas Cloud with validated parameters and bounded polling.
  author: binyangzhu000-sudo
  created: 2026-08-21T16:23:48Z
---

# Atlas Cloud Image Generator

Generate text-to-image assets through Atlas Cloud's asynchronous image API. The bundled executor validates the current working set, previews requests by default, submits at most one generation request per execution, and polls only that prediction.

## Use This Skill For

- text-to-image requests through Atlas Cloud
- Nano Banana Pro image generation
- aspect ratio, resolution, and output format selection
- safe download of a completed result into the current workspace
- inspecting a request before any billable generation is submitted

Do not use this skill for image editing, reference-image composition, video generation, or undocumented model parameters. Those workflows require their own live model schema checks.

## Workflow

1. Read [references/capability-matrix.md](references/capability-matrix.md) before choosing parameters.
2. Convert the user's request into one compact prompt with subject, style, composition, environment, and material constraints.
3. Preview the exact payload with `scripts/generate-image.mjs`.
4. Confirm that authentication and output handling follow [references/auth-and-safety.md](references/auth-and-safety.md).
5. Add `--execute` only when the user clearly wants a live generation.
6. If a prediction ID is returned, poll that ID only. Never repeat the generation POST automatically.

## Quick Start

Preview without making an API request:

```bash
node skills/atlas-cloud-image-generator/scripts/generate-image.mjs \
  --prompt "A studio product photo of a ceramic mug on a white background" \
  --aspect 4:3 \
  --resolution 2k
```

Execute one request and save the first completed output:

```bash
node skills/atlas-cloud-image-generator/scripts/generate-image.mjs \
  --prompt "A studio product photo of a ceramic mug on a white background" \
  --aspect 4:3 \
  --resolution 2k \
  --output output/mug.png \
  --execute
```

The default model is `google/nano-banana-pro/text-to-image`. See [references/request-examples.md](references/request-examples.md) for the complete command surface.

## Execution Rules

- Preview mode is the default and does not require an API key.
- Live execution reads `ATLASCLOUD_API_KEY` or the local auth file documented in [references/config-schema.md](references/config-schema.md).
- A live run performs one `POST /api/v1/model/generateImage`. Submission is never retried automatically.
- Prediction reads use bounded backoff against `GET /api/v1/model/prediction/{id}`.
- `--output` must resolve inside the current workspace and must not already exist.
- Result URLs are redacted in console output and downloaded without forwarding the API key.
- An ambiguous submit timeout is not evidence that the request failed. Keep the prediction ID when available and inspect that task instead of resubmitting.

## Stop Conditions

Stop before execution when:

- the requested capability is absent from the current model schema
- authentication is missing or malformed
- the output path escapes the workspace or already exists
- the user has not authorized a live, potentially billable request
- a submit response is ambiguous and repeating it could create a duplicate charge
