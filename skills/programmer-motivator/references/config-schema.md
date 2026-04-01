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

## Minimal Runtime Contract

Use these rules to keep behavior consistent across implementations.

### Read Order

Read state in this order:

1. `config.json`
2. `persona.json`
3. `owner.json`
4. `memory.json`

Apply defaults first, then overlay file-backed state.

### Priority Rules

Use this precedence order when values overlap:

1. explicit user request in the current turn
2. persisted owner preference or boundary
3. persisted persona setting
4. default skill behavior

Current-turn explicit requests should win over stored preferences for that response.

### Memory Update Rules

- treat `id` as the stable identity when present
- otherwise treat the pair `kind + key` as the deduplication key
- if a new explicit memory matches an existing `kind + key`, update the existing entry instead of appending a duplicate
- if the user says to forget a memory, remove the matching entry entirely
- if the user asks to change a remembered preference, update the existing entry and refresh `updated_at`

### Retention Boundaries

- `recent_win` should stay short-lived and practical; replace or prune older entries when they stop being useful
- `current_focus` should describe the current longer-running task, not become a session transcript
- do not keep multiple stale `current_focus` entries for unrelated tasks

### Bad Data Fallback

- ignore unknown top-level files
- ignore unknown memory kinds instead of crashing
- skip malformed memory entries
- fall back to defaults when optional fields are missing
- trigger first-run setup when `config.json` is missing

### Suggested Memory Default

If `allow_suggestion_memory` is enabled:

- suggest first
- save only after user confirmation
- do not silently persist inferred preferences

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
