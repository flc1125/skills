# Mac Keychain Security Rules

Use this reference when the request involves plaintext secret retrieval, user-visible disclosure, or future execution scripts.

## Core Rules

- Any plaintext secret retrieval requires explicit user confirmation.
- The same rule applies whether the caller is the user or another skill.
- The confirmation content differs by caller type:
  - user request: emphasize disclosure risk
  - skill request: emphasize caller identity, requested credential, and purpose
- Default output should never include a plaintext secret unless the confirmed action is `reveal-secret`.

## Caller Attribution

For skill-initiated secret reads, capture and present:

- requesting skill name
- target `service`
- target `account`
- purpose of use
- whether the secret will be shown to the user or used only downstream

If the caller cannot identify itself clearly, treat that as insufficient context for a secret read.

## Output Discipline

Prefer status messages such as:

```text
Credential located in macOS Keychain.
service: github
account: flc
secret_exposed_to_user: false
```

Avoid:

- echoing a plaintext secret in logs
- embedding a plaintext secret in error output
- casual debug prints containing secret material

## Runtime Guard

Before executing bundled scripts, verify that:

- the host is `macOS`
- `/usr/bin/security` exists
- `/bin/zsh` exists

If `zsh` is unavailable, stop and say that the current implementation cannot run as shipped. Offer a fallback plan instead of forcing execution.

## Future Script Guidance

If scripts are added later, design them so that:

- low-risk actions never print secrets
- high-risk secret-read actions are called only after confirmation
- outputs are structured and stable
- normal success paths are non-disclosing by default
