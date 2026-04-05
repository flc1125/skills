# Config Schema

Use this file only when execution is blocked by local authentication setup.

Persistent auth state should live under:

```text
~/.config/flc1125/skills/volcengine-ark-image-generator/
```

Keep the storage model intentionally small. For v1, this skill only needs one auth file.

## Recommended Files

- `auth.json`

## `auth.json`

Use this file for local Ark authentication defaults.

Setup path:

```text
~/.config/flc1125/skills/volcengine-ark-image-generator/auth.json
```

Example:

```json
{
  "version": 1,
  "api_key": "replace_with_your_ark_api_key",
  "base_url": "https://ark.cn-beijing.volces.com/api/v3"
}
```

Recommended fields:

- `version`
- `api_key`
- `base_url`

Rules:

- `version` should be `1` for the current schema
- `api_key` is required
- `base_url` is optional; when omitted, the script should fall back to the default Ark base URL
- do not store extra prompt defaults or behavior flags in `auth.json`

## Setup When Execution Fails For Auth

Create the parent directory if it does not exist:

```bash
mkdir -p ~/.config/flc1125/skills/volcengine-ark-image-generator
```

Then save the JSON object above to `auth.json`.

## Runtime Contract

Read auth in this order:

1. explicit CLI flags
2. `auth.json`
3. fail with a short setup message

If `auth.json` is missing:

- stop execution
- print the expected file path
- print a minimal valid JSON example
- guide the user to create the file only after the execution path reports the failure

If `auth.json` is malformed:

- stop execution
- report that the JSON is invalid
- do not guess or partially recover missing auth values
- guide the user to fix the file only after the execution path reports the failure
