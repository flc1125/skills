# mac-keychain

Thin Codex skill for working with macOS Keychain generic password items.

## Install

```bash
npx skills add https://github.com/flc1125/skills --skill mac-keychain
```

## Purpose

Use this skill when you need to work with local credentials stored in macOS Keychain by `service + account`, including:

- creating a new credential
- updating an existing credential
- checking whether a credential exists
- reading non-secret metadata
- retrieving a plaintext secret for downstream use
- revealing a plaintext secret in visible output
- deleting a credential

This skill is designed for macOS generic password items. It does not cover Windows Credential Manager, Linux keyrings, certificates, private-key workflows, or broad keychain administration.

## Runtime Requirements

The current implementation assumes:

- `macOS`
- `/usr/bin/security`
- `/bin/zsh`

If `zsh` or `security` is unavailable, the skill should stop and report the missing dependency instead of pretending the bundled scripts can run.

## Interface

This skill is intentionally narrow:

- the target must be explicit through `service + account`
- caller attribution, approval prompts, and workflow policy belong to the caller
- `read-secret` is for downstream machine use
- `reveal-secret` and `delete` require `--confirmed`

## Bundled Scripts

```text
scripts/
├── common.sh
├── keychain-delete.sh
├── keychain-exists.sh
├── keychain-read-meta.sh
├── keychain-read-secret.sh
├── keychain-reveal-secret.sh
├── keychain-set.sh
└── keychain-update.sh
```

All scripts accept `--service` and `--account`.
Use `--keychain` only when the target is not the default `login` keychain.

## Example Usage

Check whether a credential exists:

```bash
scripts/keychain-exists.sh --service github --account flc
```

Read metadata without exposing the secret:

```bash
scripts/keychain-read-meta.sh --service github --account flc
```

Read a plaintext secret for downstream use:

```bash
scripts/keychain-read-secret.sh \
  --service github \
  --account flc
```

Emit only the secret value:

```bash
scripts/keychain-read-secret.sh \
  --service github \
  --account flc \
  --value-only
```

Reveal a plaintext secret in visible output:

```bash
scripts/keychain-reveal-secret.sh \
  --service github \
  --account flc \
  --confirmed
```

Delete a credential:

```bash
scripts/keychain-delete.sh \
  --service github \
  --account flc \
  --confirmed
```
