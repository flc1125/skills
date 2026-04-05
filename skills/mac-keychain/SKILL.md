---
name: mac-keychain
description: Work with macOS Keychain generic password items through bundled scripts. Use when Codex needs to check, read metadata, create, update, retrieve, reveal, or delete local credentials by `service + account` on macOS, especially as a thin credential-store wrapper inside another workflow.
metadata:
  name: Mac Keychain
  description: Work with macOS Keychain generic password items for local credential checks, updates, retrieval, reveal, and deletion.
  author: Flc゛
  created: 2026-03-27T07:51:16Z
---

# Mac Keychain

Use this skill to operate on macOS Keychain generic password items.

## Scope

- Support `exists`, `read-meta`, `set`, `update`, `read-secret`, `reveal-secret`, and `delete`.
- Operate on generic password items only.
- Stop if the request involves certificates, identities, private keys, or broad keychain administration.

## Runtime

- Require `macOS`, `/usr/bin/security`, and `/bin/zsh`.
- Use the bundled scripts for deterministic behavior.
- Stop and explain the missing runtime dependency if the scripts cannot run as shipped.

## Operating Rules

- Resolve the target with `service + account` before any write, delete, or secret read.
- Default to the current user's `login` keychain.
- Pass `--keychain` only when the target is not the default login keychain.
- Keep caller attribution, approval prompts, and workflow policy in the caller. Do not model them inside this skill.
- Keep the script interface narrow. Do not pass legacy caller-attribution or purpose flags.
- Keep this skill thin. It should expose local Keychain operations, not orchestrate a larger secret-management workflow.

## Safety Model

- Do not guess missing `service` or `account` for `set`, `update`, `read-secret`, `reveal-secret`, or `delete`.
- Do not echo the incoming secret in `set` or `update`.
- Use `read-secret` for downstream machine use after the caller has already decided that retrieval is allowed.
- Use `reveal-secret` only when the user explicitly wants plaintext in visible output. Require `--confirmed`.
- Use `delete` only with a clear target. Require `--confirmed`.

## Scripts

All scripts accept `--service` and `--account`. Use `--keychain` only for a non-default keychain.

- `scripts/keychain-exists.sh`: return whether an item exists.
- `scripts/keychain-read-meta.sh`: return safe metadata only.
- `scripts/keychain-set.sh`: create a new item and fail if it already exists.
- `scripts/keychain-update.sh`: update an existing item and fail if it does not exist.
- `scripts/keychain-read-secret.sh`: return a plaintext secret for downstream use. Use `--value-only` to emit only the secret.
- `scripts/keychain-reveal-secret.sh`: return a plaintext secret for visible output. Require `--confirmed`.
- `scripts/keychain-delete.sh`: delete an item. Require `--confirmed`.

## Output

- Expect structured JSON on stdout for success and on stderr for failures, except `scripts/keychain-read-secret.sh --value-only`.
- Treat `read-secret` output as sensitive even when the caller does not print it.
- Keep normal user-facing status non-disclosing unless the requested action is `reveal-secret`.
