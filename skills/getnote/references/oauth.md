# OAuth Device Flow

Use this file only when the user explicitly asks to configure Getnote or when a live request has already failed for missing auth.

## Device Code Request

```text
POST /open/api/v1/oauth/device/code
```

Body:

```json
{
  "client_id": "cli_a1b2c3d4e5f6789012345678abcdef90"
}
```

Rules:

- the default client ID can be used when no custom client ID is configured
- show both `verification_uri` and `user_code`
- after the device code is created, use `scripts/oauth-poll.mjs <code>` to poll for completion

## Device Token Poll

```text
POST /open/api/v1/oauth/token
```

Body:

```json
{
  "grant_type": "device_code",
  "client_id": "cli_a1b2c3d4e5f6789012345678abcdef90",
  "code": "device_code_here"
}
```

Poll behavior:

- default interval: 5 seconds
- stop on `rejected`, `expired_token`, or `already_consumed`
- return structured JSON on success

## Recovery Posture

- do not start OAuth unless configuration is explicitly requested or execution already proved auth is missing
- do not write returned API keys into repository files
- guide the user to persist the key into local `auth.json` after successful polling
