# Capability Matrix

This skill intentionally keeps one verified executable model in its default working set.

Schema checked: 2026-08-22 against the model catalog entry and linked OpenAPI schema returned by `GET https://api.atlascloud.ai/api/v1/models`.

| Model | Workflow | Required | Optional working set |
|---|---|---|---|
| `google/nano-banana-pro/text-to-image` | text-to-image | `model`, `prompt` | `aspect_ratio`, `resolution`, `output_format`, `enable_web_search` |

## Valid Values

Aspect ratios:

`1:1`, `3:2`, `2:3`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9`

Resolutions:

`1k`, `2k`, `4k`

Output formats:

`default`, `png`, `jpeg`

## Excluded Fields

The executor does not expose `enable_sync_mode`, `enable_base64_output`, or `media_resolution`. They are unnecessary for the text-only asynchronous workflow supported here.

Do not pass reference images or editing fields to this model. Fetch the live schema again before adding another model or capability because model IDs and accepted parameters may change.
