# Authentication and Safety

Use this file when preparing or executing a Volcengine Ark image generation request.

This skill is safe-by-default. Treat secrets, remote URLs, and local file writes as explicit trust boundaries.

## Authentication

Prefer environment variables for authentication.

Default assumptions:

- API key environment variable: `ARK_API_KEY`
- common base URL pattern: `https://ark.cn-beijing.volces.com/api/v3`

Verify current auth details against the official page before changing either assumption:

- `https://www.volcengine.com/docs/82379/1298459?lang=zh`

Rules:

- never hardcode a real API key in `SKILL.md`, `references/`, examples, or scripts
- never print auth headers or secret-bearing request objects
- prefer a local secret store or local environment configuration over command-line secrets
- if a project already uses another safe secret-loading mechanism, follow the project pattern instead of inventing a new one

## Safe Execution Classes

### Safe

- shape a request payload
- validate model compatibility
- normalize prompt and parameter values
- explain which fields are required
- provide a minimal code example without embedded secrets

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

## Minimal Example Shape

Use a minimal OpenAI-compatible client example when the user needs code and already works in that style:

```python
from openai import OpenAI
import os

client = OpenAI(
    base_url='https://ark.cn-beijing.volces.com/api/v3',
    api_key=os.getenv('ARK_API_KEY'),
)

result = client.images.generate(
    model='doubao-seedream-5.0-lite',
    prompt='A clean studio product shot of a ceramic mug on white background',
)
```

Keep examples short. The skill should teach model choice and parameter safety, not deliver a full client library.

## Error Handling Posture

- treat request validation errors as skill-level feedback first
- surface the incompatible field before suggesting retries
- if the provider rejects a request, summarize the likely mismatch between model and parameters
- when the docs are ambiguous, stop and point to the capability verification step instead of retrying with guessed fields

## Refuse These Patterns

- "just try every model until one works"
- "pass through all user fields untouched"
- "download the image automatically to whatever path looks convenient"
- "inline the API key for a quick demo"
- "fetch this arbitrary URL and upload it to Ark" without an explicit safe path
