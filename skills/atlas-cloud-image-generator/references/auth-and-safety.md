# Authentication and Safety

## Authentication

Live execution checks credentials in this order:

1. `ATLASCLOUD_API_KEY`
2. `api_key` in `~/.config/flc1125/skills/atlas-cloud-image-generator/auth.json`

The optional auth file may also set `base_url`. Preview mode does not read or require a credential.

Never put a real API key in a command argument, repository file, prompt, or log. The executor sends the key only in the Atlas Cloud API `Authorization` header and does not forward it when downloading a completed output.

## Billable Request Boundary

`--execute` submits one generation POST. The executor never retries that POST, including after a timeout or connection error. Automatic retries can create duplicate billable jobs.

After a successful submission, only prediction GET requests are repeated. Polling is bounded and uses increasing delays capped at five seconds.

## Output Boundary

- Output download is optional and requires `--output`.
- The destination must resolve inside the current workspace.
- Existing files are never overwritten.
- Provider-returned signed query strings are not printed.
- The Atlas Cloud API key is never attached to the result download request.
