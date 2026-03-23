# Auth And Errors

Use this file when a Yuque call fails or when preparing a new request.

## Authentication

- Base URL: `https://www.yuque.com`
- Header auth: `X-Auth-Token: <token>`
- Security scheme name in the OpenAPI file: `authToken`
- Local auth file: `skills/yuque/.env` copied from `.env.example`

Scripts auto-load `skills/yuque/.env` when it exists. Values from `.env` only fill missing environment variables and do not override variables already set in the shell.

Effective token resolution order:

1. `--token`
2. `YUQUE_TOKEN`
3. `YUQUE_AUTH_TOKEN`

If auth is not already wired, treat missing `X-Auth-Token` as the first likely cause of failure.

## Common Failure Modes

### 400

The request shape is invalid.

Check:

- path params are in the correct form
- query params use documented names
- enum values match the OpenAPI file
- numeric fields are not passed as arbitrary strings

### 401

The token is missing, invalid, or lacks the required scope.

Check:

- header name is exactly `X-Auth-Token`
- the token value is current
- the token can access the intended API domain
- local `skills/yuque/.env` exists and contains a real token rather than the placeholder from `.env.example`

### 403

The token is valid but cannot operate on the target resource.

Typical causes:

- trying to write in a repo without edit permission
- trying to read private content outside the token's scope
- trying to modify team membership without admin rights

### 404

The target resource was not found.

Typical causes:

- wrong `group_login`
- wrong `book_slug`
- wrong `book_id`
- wrong `doc_id`
- TOC node UUID was taken from stale state

### 422

The request passed routing but failed validation.

Typical causes:

- `body` missing for doc creation
- unsupported `format`
- invalid TOC action or missing required action fields
- malformed visibility value

### 429

The request rate is too high.

Respond by:

- reducing fan-out
- avoiding repeated reads inside the same step
- retrying cautiously instead of looping aggressively

### 500

The upstream API failed.

Before retrying writes:

- re-read the resource if possible
- confirm whether the prior write partially succeeded
- avoid replaying broad TOC or batch changes blindly

## Request Construction Defaults

- Default doc format to `markdown`
- Keep write payloads explicit
- Preserve existing `slug` and `public` unless the user asks to change them
- Read current TOC before any TOC write
