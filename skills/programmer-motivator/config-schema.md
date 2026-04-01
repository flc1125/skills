# Programmer Motivator Config Schema

This document defines the recommended local state format for `programmer-motivator`.

Persistent state should live under:

```text
~/.config/flc1125/skills/programmer-motivator/
```

The storage model is intentionally small. It exists to support the role, not to turn the skill into a large profiling system.

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

## 1. `config.json`

Global settings and feature flags.

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
  - integer schema version
- `language`
  - current content language for the skill
- `setup_completed`
  - whether first-run setup has been completed
- `allow_persistence`
  - master switch for local persistence
- `allow_suggestion_memory`
  - whether the skill may propose low-risk memories for saving
- `default_mode`
  - default encouragement mode such as `soothing`, `companion`, or `momentum`
- `response_length`
  - default response size such as `short`, `medium`, or `adaptive`

## 2. `persona.json`

Defines how the motivator behaves.

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

Recommended fields:

- `name`
  - persona display name
- `style`
  - short label for the motivator style
- `tone`
  - preferred tonal baseline
- `energy`
  - low, medium, or high expressive energy
- `mode_bias`
  - which working mode the role leans toward by default
- `rules`
  - stable behavior instructions
- `forbidden_phrases`
  - banned wording patterns

## 3. `owner.json`

Stores user-specific preferences.

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

Recommended fields:

- `display_name`
  - the user's name
- `preferred_address`
  - how the user wants to be addressed
- `preferred_tone`
  - plain, warm, calm, sharp, etc.
- `preferred_response_length`
  - short, medium, or adaptive
- `likes`
  - support patterns the user responds well to
- `dislikes`
  - support patterns the user dislikes
- `boundaries`
  - explicit tone or behavior boundaries

## 4. `memory.json`

Stores durable memory entries.

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
    },
    {
      "id": "mem_002",
      "kind": "recent_win",
      "key": "fixed_race_condition_in_sync_worker",
      "value": "User resolved the sync worker race condition after isolating the retry path.",
      "source": "explicit",
      "confidence": 1,
      "created_at": "2026-04-01T10:15:00Z",
      "updated_at": "2026-04-01T10:15:00Z"
    }
  ]
}
```

Recommended entry fields:

- `id`
  - stable memory identifier
- `kind`
  - memory category
- `key`
  - short machine-friendly key
- `value`
  - human-readable memory value
- `source`
  - `explicit` or `suggested`
- `confidence`
  - 0 to 1 confidence score
- `created_at`
  - first creation timestamp
- `updated_at`
  - latest update timestamp

## Memory Kinds

Recommended `kind` values:

- `preference`
  - stable user preference
- `boundary`
  - do-not-use or do-not-cross rule
- `effective_pattern`
  - a support style that works well for the user
- `current_focus`
  - a small amount of context for a longer-running task
- `recent_win`
  - a recent success worth recalling

Avoid adding broad categories like:

- emotional profile
- productivity score
- personality model
- full conversation archive

## Suggested Memory Rules

If the skill proposes a memory instead of saving it directly:

- only suggest low-risk and high-value preferences
- do not suggest sensitive inferences
- do not suggest full narrative summaries of the user
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

For v1, keep validation simple:

- unknown top-level files should be ignored
- missing optional fields should fall back to defaults
- invalid memory entries should be skipped instead of crashing the skill
- if `config.json` is missing, the skill should trigger first-run setup

## Minimal Viable State

If you want the smallest workable setup, these fields are enough:

```json
// config.json
{
  "version": 1,
  "setup_completed": true,
  "allow_persistence": true,
  "allow_suggestion_memory": true
}
```

```json
// owner.json
{
  "preferred_address": "Alex",
  "preferred_tone": "plain"
}
```

```json
// persona.json
{
  "name": "Patch",
  "style": "grounded-supportive"
}
```

```json
// memory.json
{
  "entries": []
}
```
