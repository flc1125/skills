# Authentication And Safety

Use this file when preparing or executing a Get笔记 request.

This skill is safe-by-default. Treat secrets, note content, image uploads, and local config writes as explicit trust boundaries.

## Authentication

Prefer the local auth file for authentication.

Default assumptions:

- auth file: `~/.config/flc1125/skills/getnote/auth.json`
- auth keys: `api_key`, optional `client_id`, optional `owner_id`, optional `base_url`
- common base URL default: `https://openapi.biji.com`
- default client ID fallback: `cli_a1b2c3d4e5f6789012345678abcdef90`
- bundled script: `scripts/getnote.mjs`
- treat the local auth file as already configured unless execution proves otherwise

Read [config-schema.md](config-schema.md) only when live execution fails because the local auth file is missing, malformed, or missing required keys.

Rules:

- never hardcode a real API key in `SKILL.md`, `references/`, or scripts
- never print auth headers, signed OSS form fields, or secret-bearing request objects
- prefer the local auth file over command-line secrets
- allow CLI or env overrides only for one-off execution when the user explicitly wants them
- do not ask the user to configure auth before a real failure path demonstrates that it is needed

## Safe Execution Classes

### Safe

- classify a request into text, link, image, search, list, tag, or knowledge flow
- shape a Get笔记 payload
- validate IDs and tags as strings
- preview a request without sending it
- explain required fields or polling behavior
- assume auth is ready unless execution proves otherwise

### Guarded

- execute a live Get笔记 API call with clear user intent
- upload a local image to Get笔记 OSS for an image-note workflow
- poll a Get笔记 task until it succeeds or fails
- start OAuth device flow when the user explicitly requests config or auth has already failed

### Dangerous

- write secrets into repo files
- echo API keys, signed callbacks, or OSS policies
- fetch arbitrary remote images locally without an explicit safe path and clear user intent
- automatically overwrite local auth files with guessed values
- repeatedly retry write operations after quota, membership, or validation failures

## URL Rules

- treat Get笔记 and OSS URLs as temporary operational artifacts when they contain signed fields
- do not log signed query strings or raw upload credentials
- do not fetch third-party remote URLs in the background just to help a save-image flow
- prefer local file upload or an already trusted image URL supplied by the user

## Local File Rules

- default to request preview rather than local file writes
- store persistent auth outside the repository under `~/.config/flc1125/skills/getnote/`
- do not assume overwriting an existing auth file is safe
- keep uploaded image handling inside the requested workflow only

## Script Defaults

The bundled scripts are intentionally narrow:

- preview mode unless `--execute` is passed
- explicit CLI overrides first, then auth file, then env
- one command per invocation
- safe JSON parsing for Get笔记 int64 identifiers
- no third-party runtime dependencies
- polling helpers return structured JSON instead of conversational text
- polling helpers redact issued API keys by default
- image upload output must never include signed OSS form fields

## Error Handling Posture

- treat missing auth as a configuration recovery path, not as the initial assumption
- surface provider validation errors before suggesting retries
- stop on `not_member`, quota, or scope-like failures and explain the concrete block
- stop on malformed local auth rather than guessing partial defaults

## Refuse These Patterns

- "just inline the API key in the script"
- "retry writes until the API accepts them"
- "download this arbitrary internet image and upload it silently"
- "print the OSS signature so I can inspect it"
- "store auth inside the repository for convenience"
