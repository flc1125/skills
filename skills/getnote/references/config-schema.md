# Config Schema

Use this file only when execution is blocked by local authentication setup.

Persistent auth state should live under:

```text
~/.config/flc1125/skills/getnote/
```

Keep the storage model intentionally small. For v1, this skill only needs one auth file.

## Recommended Files

- `auth.json`

## `auth.json`

Use this file for local Get笔记 authentication defaults.

Setup path:

```text
~/.config/flc1125/skills/getnote/auth.json
```

Example:

```json
{
  "version": 1,
  "api_key": "gk_live_replace_me",
  "client_id": "cli_a1b2c3d4e5f6789012345678abcdef90",
  "owner_id": "ou_optional_owner_id",
  "base_url": "https://openapi.biji.com"
}
```

Recommended fields:

- `version`
- `api_key`
- `client_id`
- `owner_id`
- `base_url`

Rules:

- `version` should be `1`
- `api_key` is required for normal note operations
- `client_id` is optional when the default OpenClaw-compatible client ID is acceptable
- `owner_id` is optional and helps the surrounding agent enforce private ownership policies
- `base_url` is optional and should normally remain `https://openapi.biji.com`
- do not store unrelated prompt defaults or workflow flags in `auth.json`

## Setup When Execution Fails For Auth

Create the parent directory if it does not exist:

```bash
mkdir -p ~/.config/flc1125/skills/getnote
```

Then save the JSON object above to `auth.json`.

## Runtime Contract

Read auth in this order:

1. explicit CLI flags
2. local `auth.json` when the command still needs missing values
3. environment variables
4. fail with a short setup message

Rules:

- explicit CLI overrides must still work even if the local auth file is malformed
- preview-only commands should not be blocked just because a local auth file is broken

If `auth.json` is missing:

- stop execution
- print the expected file path
- print a minimal valid JSON example
- guide the user to create the file only after the execution path reports the failure

If `auth.json` is malformed:

- stop execution
- report that the JSON is invalid
- do not guess or partially recover missing fields from the broken file
- guide the user to fix the file only after the execution path reports the failure
