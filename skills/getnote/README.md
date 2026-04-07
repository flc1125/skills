# Get 笔记 Skill

`getnote` is a skill for working with the Get 笔记 OpenAPI.

It covers:

- saving text notes
- saving link notes with async task polling
- saving image notes through the signed upload flow
- listing, reading, updating, and deleting notes
- semantic recall across notes and knowledge bases
- tag and knowledge-base operations
- OAuth device flow and local auth-file recovery when execution fails

## Install

```bash
npx skills add https://github.com/flc1125/skills --skill getnote
```

## Structure

- `SKILL.md`: agent-facing workflow, routing rules, and execution posture
- `agents/openai.yaml`: UI metadata for skill lists and invocation hints
- `scripts/getnote.mjs`: main executor for note, search, knowledge, tag, and OAuth device-code flows
- `scripts/oauth-poll.mjs`: focused OAuth device polling helper
- `scripts/common.mjs`: shared auth loading, parsing, preview, and request helpers
- `references/`: task-oriented API and safety guidance

## Quick Start

1. Install the skill.
2. Prepare local auth only if it is not already configured.
3. Run the bundled script in preview mode first.
4. Add `--execute` only when the target action is correct.

Minimal auth file:

```json
{
  "version": 1,
  "api_key": "gk_live_replace_me",
  "client_id": "cli_a1b2c3d4e5f6789012345678abcdef90",
  "base_url": "https://openapi.biji.com"
}
```

Recommended path:

```bash
mkdir -p ~/.config/flc1125/skills/getnote
```

Save a text note:

```bash
node skills/getnote/scripts/getnote.mjs save-text \
  --content "记一下：把结算流程里的异常提示做清楚" \
  --execute
```

Save a link note:

```bash
node skills/getnote/scripts/getnote.mjs save-link \
  --url "https://example.com/article" \
  --poll \
  --execute
```

## Auth Posture

- Assume local auth is already configured unless execution proves otherwise.
- Guide the user to config only after a real auth failure.
- Prefer the local `auth.json` file over inline secrets.
- Redact issued API keys and signed upload credentials from console output.

## Idea Source

This skill was inspired by [`iswalle/getnote-openclaw`](https://github.com/iswalle/getnote-openclaw).

The implementation in this repository keeps the `getnote` skill name, but adapts the workflow to this repo's conventions:

- `.mjs` helper scripts instead of Python helpers as the primary executable path
- local `auth.json` management under `~/.config/flc1125/skills/getnote/`
- preview-first execution and stricter output redaction
