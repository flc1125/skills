# Config Schema

Use this file when local persistence details matter.

Persistent state should live under:

```text
~/.config/flc1125/skills/programmer-motivator/
```

Keep the storage model intentionally small. It exists to support the role, not to build a large profile of the user.

## Design Principles

- keep role state separate from runtime prompt text
- keep persona, owner profile, and memory distinct
- persist only what improves future encouragement quality
- make everything user-visible and user-editable
- prefer simple files for v1

## Recommended Files

- `config.json`
- `persona.json`
- `owner.json`
- `memory.json`

## `config.json`

Use this file for global settings and feature flags.

Example:

```json
{
  "version": 1,
  "language": "en",
  "setup_completed": true,
  "allow_persistence": true,
  "allow_suggestion_memory": true,
  "default_mode": "companion",
  "response_length": "short"
}
```

Recommended fields:

- `version`
- `language`
- `setup_completed`
- `allow_persistence`
- `allow_suggestion_memory`
- `default_mode`
- `response_length`

## `persona.json`

Use this file for motivator behavior settings.

Example:

```json
{
  "name": "Patch",
  "style": "grounded-supportive",
  "tone": "calm",
  "energy": "medium",
  "mode_bias": "companion",
  "rules": [
    "Understand first, encourage second, suggest third.",
    "Keep encouragement tied to technical facts.",
    "Do not use generic motivational cliches."
  ],
  "forbidden_phrases": [
    "You are unstoppable.",
    "Everything happens for a reason."
  ]
}
```

## `owner.json`

Use this file for user-specific preferences.

Example:

```json
{
  "display_name": "Alex",
  "preferred_address": "Alex",
  "preferred_tone": "plain",
  "preferred_response_length": "short",
  "likes": [
    "clear recognition",
    "small next steps"
  ],
  "dislikes": [
    "hype",
    "lecturing",
    "generic praise"
  ],
  "boundaries": [
    "Do not overpraise.",
    "Do not turn mistakes into life lessons."
  ]
}
```

## `memory.json`

Use this file for durable memory entries.

Example:

```json
{
  "entries": [
    {
      "id": "mem_001",
      "kind": "preference",
      "key": "prefers_plain_support",
      "value": true,
      "source": "explicit",
      "confidence": 1,
      "created_at": "2026-04-01T09:00:00Z",
      "updated_at": "2026-04-01T09:00:00Z"
    }
  ]
}
```

Recommended entry fields:

- `id`
- `kind`
- `key`
- `value`
- `source`
- `confidence`
- `created_at`
- `updated_at`

Recommended `kind` values:

- `preference`
- `boundary`
- `effective_pattern`
- `current_focus`
- `recent_win`

Do not add broad categories like:

- emotional profile
- productivity score
- personality model
- full conversation archive

## Suggested Memory Rules

When proposing memory instead of saving it directly:

- suggest only low-risk, high-value preferences
- do not suggest sensitive inferences
- ask before saving
- allow rejection without pressure

Example:

```text
You seem to prefer direct, low-hype support. Do you want me to remember that?
```

## Editing Semantics

The user should always be able to:

- inspect current config and memory
- update a field directly
- delete one memory entry
- reset all persistent state

Recommended operations:

- `view_config`
- `update_config`
- `view_memory`
- `save_memory`
- `update_memory`
- `delete_memory`
- `reset_state`

## Validation Rules

For v1:

- ignore unknown top-level files
- fall back to defaults when optional fields are missing
- skip invalid memory entries instead of crashing
- trigger first-run setup when `config.json` is missing
