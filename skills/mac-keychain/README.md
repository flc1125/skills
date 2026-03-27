# mac-keychain

Local Codex skill for controlled access to macOS Keychain credentials.

## Install

```bash
npx skills add https://github.com/flc1125/skills --skill mac-keychain
```

## Purpose

Use this skill when you need to work with local credentials stored in macOS Keychain, including:

- creating a new credential
- updating an existing credential
- checking whether a credential exists
- reading non-secret metadata
- retrieving a plaintext secret after explicit confirmation
- deleting a credential after explicit confirmation

This skill is designed for macOS generic password items. It does not cover Windows Credential Manager, Linux keyrings, certificates, or private-key workflows.

## Security Model

This skill defaults to non-disclosure.

- `exists` and `read-meta` do not expose plaintext secrets
- `set` and `update` change credential state without echoing the secret
- `read-secret`, `reveal-secret`, and `delete` are high-risk actions and require explicit confirmation
- if another skill requests a plaintext secret, the caller identity, target credential, and purpose should be surfaced before approval

## Runtime Requirements

The current implementation assumes:

- `macOS`
- `/usr/bin/security`
- `/bin/zsh`

If `zsh` or `security` is unavailable, the skill should stop and present a fallback plan instead of pretending the bundled scripts can run.

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
High-risk scripts require `--confirmed`.

## Example Usage

Check whether a credential exists:

```bash
scripts/keychain-exists.sh --service github --account flc
```

Read metadata without exposing the secret:

```bash
scripts/keychain-read-meta.sh --service github --account flc
```

Read a plaintext secret for downstream use after approval:

```bash
scripts/keychain-read-secret.sh \
  --service github \
  --account flc \
  --requesting-type skill \
  --skill-name github-create-pr \
  --purpose "authenticate GitHub API operations" \
  --confirmed
```

Reveal a plaintext secret in user-visible output after approval:

```bash
scripts/keychain-reveal-secret.sh \
  --service github \
  --account flc \
  --requesting-actor current-user \
  --purpose "display the token to the current user" \
  --confirmed
```

## Structure

```text
mac-keychain/
├── SKILL.md
├── README.md
├── agents/
│   └── openai.yaml
├── references/
│   └── security-rules.md
└── scripts/
    ├── common.sh
    ├── keychain-delete.sh
    ├── keychain-exists.sh
    ├── keychain-read-meta.sh
    ├── keychain-read-secret.sh
    ├── keychain-reveal-secret.sh
    ├── keychain-set.sh
    └── keychain-update.sh
```
