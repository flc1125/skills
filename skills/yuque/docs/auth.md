# Authentication

This skill authenticates against Yuque OpenAPI with the request header:

```http
X-Auth-Token: <token>
```

## Token Resolution Order

The bundled scripts first auto-load `skills/yuque/.env` if that file exists. Values from `.env` only fill missing environment variables and do not override variables that are already set in the shell.

The effective token resolution order is:

1. `--token` command-line argument
2. `YUQUE_TOKEN`
3. `YUQUE_AUTH_TOKEN`

If a script runs with `--execute` and no token is available, it fails before sending the request.

## Recommended Usage

Prefer environment variables over passing tokens on the command line.

Recommended local setup:

1. Copy `.env.example` to `.env`
2. Fill in the real `YUQUE_TOKEN`
3. Run the scripts normally

Example:

```bash
cp skills/yuque/.env.example skills/yuque/.env
```

Example:

```bash
node skills/yuque/scripts/read-doc.mjs --id 123 --execute
```

Command-line usage also works, but it is less safe because shell history may retain the token:

```bash
node skills/yuque/scripts/read-doc.mjs --id 123 --token your_token_here --execute
```

## Local Environment Template

Use the repository-local template file:

- `.env.example`

Recommended practice:

- copy `.env.example` to `.env`
- fill in the real token locally
- do not commit `.env`
- use shell environment overrides only when needed

## Notes

- Preview mode does not require a token because it only prints the planned request.
- Execute mode requires a valid token.
- The skill does not hardcode tokens in `SKILL.md`, `references/`, or scripts.
