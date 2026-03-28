---
name: mac-keychain
description: Use macOS Keychain to store, update, inspect, retrieve, and delete credentials with explicit confirmation for any plaintext secret access. Use when working on macOS and a user or another skill needs controlled access to local credentials such as API keys, tokens, passwords, or account secrets.
metadata:
  name: Mac Keychain
  description: Use macOS Keychain to store, update, inspect, retrieve, and delete local credentials with explicit safety gates.
  author: Flc゛
  created: 2026-03-27T07:51:16Z
---

# Mac Keychain

Use this skill to operate on `macOS Keychain` as a controlled credential store.

This skill is for:

- writing a new credential
- updating an existing credential
- checking whether a credential exists
- reading non-secret metadata for a credential
- retrieving a plaintext secret after explicit user confirmation
- deleting a credential with explicit caution

This skill is not for:

- Windows Credential Manager
- Linux keyring systems
- certificate, private key, or identity management
- broad keychain administration such as creating, unlocking, or switching whole keychains

## Operating Model

Treat Keychain access as a local privileged action with explicit safety gates.

Prioritize:

- precise target identification before any write or read
- `service + account` as the primary selector
- minimal disclosure by default
- explicit confirmation before any plaintext secret retrieval
- clear attribution when another skill requests a secret

Assume the default target is the current user's login keychain unless local evidence shows a different requested keychain.

## Runtime Requirements

This skill currently assumes:

- `macOS` is the host platform
- `/usr/bin/security` is available
- `/bin/zsh` is available for bundled helper scripts

Before using bundled scripts, verify the runtime.
If the host is not macOS, or if `security` is unavailable, stop and say this skill cannot execute in the current environment.
If `/bin/zsh` is unavailable, do not attempt to run the bundled scripts. Instead:

- explain that the current implementation depends on `zsh`
- surface the exact missing dependency
- propose either running equivalent `security` commands manually or porting the scripts to a more portable shell

Do not pretend the scripts are portable when they are not.

## Data Model

Use these fields consistently:

- `service`: required credential namespace or system name
- `account`: required account identifier
- `secret`: required for `set` and `update`
- `label`: optional human-readable description
- `keychain`: optional target keychain, defaults to `login`

Do not guess missing `service` or `account` values for write, delete, or secret-read operations.

## Risk Classes

Treat operations as three classes.

### 1. Low Risk

Default allow.

Includes:

- `exists`
- `read-meta`

These operations must not expose plaintext secrets.

### 2. Medium Risk

Default allow when the target is explicit.

Includes:

- `set`
- `update`

These operations change local credential state but do not expose plaintext secrets in output.

### 3. High Risk

Require an explicit user confirmation step before execution.

Includes:

- `read-secret`
- `reveal-secret`
- `delete`

`read-secret` returns a plaintext secret to the caller for downstream use.

`reveal-secret` returns a plaintext secret in user-visible output.

`delete` removes a credential from local secure storage.

## Actions

### `exists`

Use for questions such as:

- "这个 service/account 在不在"
- "检查一下这个 token 有没有存到钥匙串"

Return only existence state and target identifiers.

Example result shape:

```text
exists: true
service: github
account: flc
keychain: login
```

### `read-meta`

Use when the caller needs non-secret metadata without retrieving the secret value.

Return only fields that are safe to show:

- `service`
- `account`
- `label`
- `keychain`
- `exists`

Do not include plaintext secret material.

### `set`

Use to create a new credential.

Rules:

- require `service`, `account`, and `secret`
- fail if the target item already exists unless the user explicitly asked for overwrite semantics
- do not print the incoming secret back to the user

### `update`

Use to update an existing credential.

Rules:

- require `service`, `account`, and `secret`
- fail if the target item does not already exist
- read or resolve the target first instead of updating blindly
- do not print the new secret back to the user

### `read-secret`

Use when a plaintext secret is needed for machine use, another skill, or a downstream command.

This action is high risk and always requires explicit confirmation before execution.

By default, after confirmation, the secret may be returned to the caller for use, but it must not be echoed in normal user-visible status text unless the user explicitly asked for visible disclosure.

### `reveal-secret`

Use when the user explicitly wants the plaintext secret printed or otherwise shown in user-visible output.

This action is high risk and always requires explicit confirmation before execution.

This is stricter than `read-secret` because the result is intentionally shown in plain text.

### `delete`

Use to remove a credential from Keychain.

This action is high risk and should require explicit confirmation before execution.

## Confirmation Rules

Any action that can retrieve or disclose a plaintext secret must pause and request confirmation first.

The confirmation payload must include:

- `requesting_actor`
- `requesting_type`: `user` or `skill`
- `skill_name`: required when the caller is another skill
- `service`
- `account`
- `action`
- `purpose`
- `exposure_mode`: `downstream-use` or `user-visible`

### Confirmation For User Requests

When the user directly asks to see or retrieve a plaintext secret, emphasize disclosure risk.

Use a confirmation like:

```text
This action will retrieve a plaintext secret from macOS Keychain.

requesting_actor: current-user
service: github
account: flc
action: reveal-secret
exposure_mode: user-visible

Risk:
- the secret will appear in user-visible output
- it may persist in terminal or conversation history

Reply with explicit confirmation to continue.
```

### Confirmation For Skill Requests

When another skill requests a plaintext secret, emphasize attribution and purpose.

Use a confirmation like:

```text
A skill is requesting access to a plaintext secret from macOS Keychain.

requesting_type: skill
skill_name: github-create-pr
service: github
account: flc
action: read-secret
purpose: authenticate GitHub API operations
exposure_mode: downstream-use

Reply with explicit confirmation to allow this secret retrieval.
```

Do not retrieve the secret until the user confirms.

## Output Rules

Default to non-disclosure.

Allowed by default:

- existence checks
- metadata summaries
- success and failure status
- target identifiers such as `service`, `account`, and `keychain`
- confirmation prompts for high-risk actions

Not allowed by default:

- plaintext secrets in status output
- plaintext secrets in normal logs
- writing plaintext secrets to intermediate files unless the user explicitly asked for that workflow and accepted the risk

When a secret is retrieved for downstream use after confirmation, keep normal visible output limited to status such as:

```text
Secret retrieved from macOS Keychain for downstream use.
service: github
account: flc
secret_exposed_to_user: false
```

## Decision Rules

- Use `exists` when the question is only whether a credential is present.
- Use `read-meta` when the caller needs target context but not the secret value.
- Use `set` for create-only behavior.
- Use `update` for modify-only behavior.
- Use `read-secret` when a downstream workflow needs plaintext secret material after confirmation.
- Use `reveal-secret` only when the user explicitly wants to see the plaintext secret after confirmation.
- Use `delete` only with a clear target and explicit caution.

If the target is ambiguous, stop and resolve the exact `service + account` pair before proceeding.

## Suggested Execution Strategy

When execution is required, prefer the native macOS `security` CLI or another equally local, non-network mechanism.

If helper scripts exist in this skill, use them rather than reconstructing fragile shell commands in-line.

When no helper scripts exist yet:

1. resolve the exact target
2. classify the requested action by risk
3. request confirmation for any high-risk action
4. execute the smallest local Keychain operation needed
5. return a non-disclosing result unless `reveal-secret` was explicitly confirmed

## Scripts

Use these helper scripts when execution should be deterministic:

- `scripts/keychain-exists.sh`: check whether a generic password item exists
- `scripts/keychain-read-meta.sh`: read safe metadata only
- `scripts/keychain-set.sh`: create a new generic password item
- `scripts/keychain-update.sh`: update an existing generic password item
- `scripts/keychain-read-secret.sh`: retrieve a plaintext secret for downstream use after `--confirmed`
- `scripts/keychain-reveal-secret.sh`: reveal a plaintext secret in user-visible output after `--confirmed`
- `scripts/keychain-delete.sh`: delete an item after `--confirmed`

All scripts accept `--service` and `--account`.
Use `--keychain` only when the target is not the default login keychain.
High-risk scripts require `--confirmed`.

## References

Read [references/security-rules.md](references/security-rules.md) when refining confirmation behavior, output handling, or future script design.
