# Atlas Cloud Image Generator

`atlas-cloud-image-generator` is an executable agent skill for Atlas Cloud text-to-image requests.

It provides:

- schema-aware validation for `google/nano-banana-pro/text-to-image`
- preview-first request inspection
- one generation POST per execution
- bounded prediction polling
- optional, workspace-confined result download
- dependency-free execution on Node.js 20 or newer

## Preview

```bash
node skills/atlas-cloud-image-generator/scripts/generate-image.mjs \
  --prompt "A clean editorial illustration of a solar-powered city" \
  --aspect 16:9 \
  --resolution 2k
```

## Execute

Set `ATLASCLOUD_API_KEY` or create the local auth file described in `references/config-schema.md`, then add `--execute`:

```bash
node skills/atlas-cloud-image-generator/scripts/generate-image.mjs \
  --prompt "A clean editorial illustration of a solar-powered city" \
  --aspect 16:9 \
  --resolution 2k \
  --output output/solar-city.png \
  --execute
```

The script submits once to `POST /api/v1/model/generateImage`. It never retries that POST. When the API returns an asynchronous prediction, it performs bounded `GET /api/v1/model/prediction/{id}` reads until the task completes, fails, or reaches the polling limit.
