---
name: getnote
description: Save, search, list, and organize Get笔记 notes, images, tags, and knowledge resources through the Get笔记 OpenAPI. Use when Codex needs to store text or links as notes, upload an image into a note workflow, recall prior notes, inspect note details, manage tags or knowledge bases, or recover from Get笔记 authentication failures with the local auth.json setup.
metadata:
  name: Get笔记
  description: Operate on Get笔记 notes, search, tags, and knowledge resources through the Get笔记 OpenAPI.
  author: Flc
  created: 2026-04-07T11:38:06Z
---

# Get笔记

Operate on Get笔记 through its OpenAPI with a default execution path, local auth-file assumptions, and explicit handling for async note creation.

## Operating Mode

Act as a Get笔记 operator, not as a generic REST client.

Prioritize:

- successful note operations through the bundled `.mjs` scripts
- correct routing between text, link, image, search, list, tag, and knowledge flows
- treating note IDs and cursors as strings to avoid JavaScript precision loss
- assuming auth is already configured unless execution proves otherwise
- concise recovery steps when auth or membership blocks execution
- safe handling of uploaded images, remote URLs, and local config files

Default scope for this skill:

- save text notes
- save link notes with async task polling
- save image notes from a local file through the signed upload flow
- list, inspect, update, and delete notes
- semantic recall across notes and knowledge bases
- add and delete note tags
- list, create, and manage knowledge bases and their note membership
- start OAuth device flow only when auth is missing or when the user explicitly asks to configure Get笔记

Default non-goals:

- maintaining a full SDK abstraction layer
- background retries without user intent
- auto-writing secrets before an auth failure occurs
- broad scraping or arbitrary remote file fetching outside Get笔记's intended upload flow

## Resource Map

Read only the files you need:

- auth posture and secret handling: [references/auth-and-safety.md](references/auth-and-safety.md)
- local auth file schema and recovery steps: [references/config-schema.md](references/config-schema.md)
- note creation and async task rules: [references/save.md](references/save.md)
- semantic recall behavior: [references/search.md](references/search.md)
- note listing, detail, update, and delete rules: [references/list.md](references/list.md)
- knowledge base workflows: [references/knowledge.md](references/knowledge.md)
- tag workflows: [references/tags.md](references/tags.md)
- OAuth device flow details: [references/oauth.md](references/oauth.md)
- error codes, rate limits, and ID handling: [references/api-details.md](references/api-details.md)

Assume the local auth file already exists and is valid when the user asks to perform a Get笔记 action. Only read [references/config-schema.md](references/config-schema.md) after execution fails because auth is missing or malformed.

## Core Routing

Choose the smallest workflow that satisfies the request.

### Save a Note

Use for requests such as:

- "记一下这段话"
- "把这个链接存到笔记"
- "把这张图保存到 Get笔记"

Sequence:

1. Classify the input as `plain_text`, `link`, or `img_text`.
2. Read [references/save.md](references/save.md) before building the request.
3. Use `scripts/getnote.mjs`.
4. For image notes:
   - if the user provides a local image, let the script upload it first
   - do not route arbitrary or pre-hosted image URLs through the bundled script
5. For link and image notes, treat creation as async:
   - return or inspect `task_id`
   - poll until `success` or `failed` when the user wants the full result now
6. When polling succeeds, follow with note detail if the user needs the generated summary or source details.

### Search Notes

Use for requests such as:

- "搜一下我记过的 RAG"
- "在这个知识库里找产品方案"

Sequence:

1. Decide between global recall and knowledge recall.
2. Read [references/search.md](references/search.md).
3. Use `scripts/getnote.mjs search` or `scripts/getnote.mjs search-knowledge`.
4. Prefer returning the most relevant titles, snippets, and timestamps first.

### List Or Inspect Notes

Use for requests such as:

- "最近有哪些笔记"
- "看一下这条笔记详情"
- "更新这条纯文本笔记"

Sequence:

1. Read [references/list.md](references/list.md).
2. Use `scripts/getnote.mjs list-notes`, `note-detail`, `update-note`, or `delete-note`.
3. Preserve note IDs as strings and pass them through unchanged.
4. Only update plain-text notes unless the API clearly supports another note type for that route.

### Manage Knowledge Or Tags

Use for requests such as:

- "把这条笔记加到知识库"
- "创建一个知识库"
- "给这条笔记加标签"

Sequence:

1. Read [references/knowledge.md](references/knowledge.md) or [references/tags.md](references/tags.md).
2. Use the matching `scripts/getnote.mjs` subcommand.
3. For knowledge writes, identify the exact `topic_id` first instead of guessing.
4. For tag deletion, use the concrete `tag_id`, not only the tag name.

### Configure Or Recover Auth

Use only when:

- the user explicitly asks to configure Get笔记
- a live request fails because auth is missing, invalid, or malformed

Sequence:

1. Read [references/auth-and-safety.md](references/auth-and-safety.md).
2. If the user wants OAuth device flow, read [references/oauth.md](references/oauth.md) and use:
   - `scripts/getnote.mjs oauth-device-code --execute`
   - `scripts/oauth-poll.mjs <code>`
3. If the user wants local static config, read [references/config-schema.md](references/config-schema.md) and guide them to create `auth.json`.
4. Do not proactively ask the user to configure auth before execution proves it is necessary.

## Execution Rules

- Use `scripts/getnote.mjs` as the default execution path for normal API operations.
- Use preview mode by default. Pass `--execute` only when the user clearly wants the real action.
- Read [references/auth-and-safety.md](references/auth-and-safety.md) before any live execution.
- When a command fails with missing auth, point to [references/config-schema.md](references/config-schema.md) rather than inventing a new secret storage model.
- When a command fails with membership or quota errors, surface the exact API reason and stop instead of retrying blindly.

## Script Map

- `scripts/getnote.mjs`: main operator for note, search, knowledge, tag, and OAuth device-code requests
- `scripts/oauth-poll.mjs`: focused device-flow token polling helper
- `scripts/common.mjs`: shared auth loading, safe JSON parsing, request helpers, and preview formatting

## Decision Rules

- Treat `id`, `note_id`, `next_cursor`, `parent_id`, `follow_id`, and `live_id` as strings.
- Do not recommend configuration until a real execution path proves auth is missing or broken.
- Prefer the local auth file over inline secrets.
- Allow CLI or env overrides only for one-off execution when the user explicitly wants them.
- Do not echo API keys or signed OSS credentials.
- Do not fetch arbitrary third-party URLs locally just to create an image note.
- When the request is ambiguous between note search and knowledge search, resolve the target before writing or searching.
- When a link or image save returns a `task_id`, do not claim the note is complete until task polling confirms success.
