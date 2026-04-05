# Authentication and Safety

Use this file when preparing or executing a Volcengine Ark image generation request.

This skill is safe-by-default. Treat secrets, remote URLs, and local file writes as explicit trust boundaries.

## Authentication

Prefer the local auth file for authentication.

Default assumptions:

- auth file: `~/.config/flc1125/skills/volcengine-ark-image-generator/auth.json`
- auth keys: `api_key`, optional `base_url`
- common base URL default: `https://ark.cn-beijing.volces.com/api/v3`
- bundled script: `scripts/generate-image.mjs`
- treat the local auth file as already configured unless execution proves otherwise

Verify current auth details against the official page before changing either assumption:

- `https://www.volcengine.com/docs/82379/1298459?lang=zh`

Read [config-schema.md](config-schema.md) only when live execution fails because the local auth file is missing or malformed.

Rules:

- never hardcode a real API key in `SKILL.md`, `references/`, examples, or scripts
- never print auth headers or secret-bearing request objects
- prefer the local auth file over command-line secrets
- allow command-line overrides only for one-off execution when the user explicitly wants them
- do not forward the Ark API key when downloading a provider-returned asset URL

## Safe Execution Classes

### Safe

- shape a request payload
- validate model compatibility
- normalize prompt and parameter values
- explain which fields are required
- execute the bundled script with explicit user intent
- provide a minimal code example without embedded secrets
- assume auth is ready unless the execution path reports an auth problem

### Guarded

- execute a live API call with an explicit user goal
- handle a provider-returned image URL without downloading it automatically
- save provider output only after the output location is explicit and safe

### Dangerous

- fetch arbitrary user-supplied remote image URLs locally
- download remote content automatically in the background
- write generated files outside the intended workspace
- echo signed URLs, full auth-bearing responses, or sensitive request logs
- upload local images without making that data transfer explicit
- switch to another product endpoint because it seems to unlock more features without making that boundary explicit

## URL Rules

- treat provider-returned URLs as temporary artifacts
- do not assume returned URLs are durable
- do not log signed query strings
- do not fetch arbitrary third-party URLs on the user's behalf unless the environment explicitly supports that and the user clearly wants it

If the user wants to download a provider-returned image URL:

- make the download explicit
- keep the destination inside a safe workspace path
- avoid broad redirect following
- preserve the original URL only as long as needed for the task

## Local File Rules

- default to returning a plan, payload, or code example rather than writing files
- if writing output is necessary, use a clear user-intended path
- do not assume overwriting is safe
- do not invent a filename from untrusted input without normalization
- the bundled script may write a downloaded image only when `--output` is explicit
- the bundled script should keep `--output` inside the current workspace

## Script Defaults

The bundled script is intentionally narrow:

- one prompt per invocation
- at most one reference image
- preview mode unless `--execute` is passed
- output download only when `--output` is passed
- local auth file first; explicit CLI overrides second
- no third-party runtime dependencies
- preview output should redact local image bytes instead of printing full `data:` URIs

## Minimal Example Shape

Use a minimal HTTP example when the user needs code and already works outside the bundled script:

```js
const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <api_key>',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'doubao-seedream-5-0-lite-260128',
    prompt: 'A clean studio product shot of a ceramic mug on white background',
  }),
});

console.log(await response.text());
```

Keep examples short. The skill should teach model choice and parameter safety, not deliver a full client library.

## Error Handling Posture

- treat request validation errors as skill-level feedback first
- surface the incompatible field before suggesting retries
- if the provider rejects a request, summarize the likely mismatch between model and parameters
- when the docs are ambiguous, stop and point to the capability verification step instead of retrying with guessed fields
- reject unsupported model and parameter combinations before sending the request when the skill already knows they are invalid

## Refuse These Patterns

- "just try every model until one works"
- "pass through all user fields untouched"
- "download the image automatically to whatever path looks convenient"
- "inline the API key for a quick demo"
- "fetch this arbitrary URL and upload it to Ark" without an explicit safe path
- "switch to a neighboring API surface and pretend it is the same workflow"
