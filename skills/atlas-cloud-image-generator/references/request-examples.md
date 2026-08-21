# Request Examples

All commands run from the repository or installed plugin root.

## Preview The Default Request

```bash
node skills/atlas-cloud-image-generator/scripts/generate-image.mjs \
  --prompt "A geometric poster of a mountain observatory at night"
```

## Preview A Wide 4K PNG Request

```bash
node skills/atlas-cloud-image-generator/scripts/generate-image.mjs \
  --prompt "An isometric cutaway of a sustainable research station" \
  --aspect 16:9 \
  --resolution 4k \
  --output-format png
```

## Execute And Download

```bash
node skills/atlas-cloud-image-generator/scripts/generate-image.mjs \
  --prompt "A precise botanical plate of alpine wildflowers" \
  --aspect 3:4 \
  --resolution 2k \
  --output-format png \
  --output output/alpine-wildflowers.png \
  --execute
```

## Optional Web Search Grounding

```bash
node skills/atlas-cloud-image-generator/scripts/generate-image.mjs \
  --prompt "A current infographic about the phases of the Moon this month" \
  --web-search
```

## Full Flag Surface

```text
--prompt <text>          Required generation prompt
--model <id>             Verified model override
--aspect <ratio>         Default: 1:1
--resolution <value>     Default: 1k
--output-format <value>  default | png | jpeg
--web-search             Enable model web search grounding
--output <path>          Download first completed output inside the workspace
--base-url <url>         Override API origin
--auth-file <path>       Override local auth file
--poll-attempts <n>      Prediction GET limit, 1-60 (default: 24)
--execute                 Submit exactly one live generation request
--help                    Show usage
```
