# Save Notes

Use this file when the user wants to save content into Get 笔记.

## Contents

1. Supported Save Modes
2. Create A Note
3. Async Task Polling
4. Link Save Workflow
5. Image Save Workflow
6. Image Upload Token
7. Practical Script Mapping

## Supported Save Modes

- `plain_text`: synchronous text note creation
- `link`: asynchronous link ingestion with later polling
- `img_text`: asynchronous image note creation with upload before note save

## Create A Note

```text
POST /open/api/v1/resource/note/save
```

Body shape:

```json
{
  "title": "Optional title",
  "content": "Markdown body",
  "note_type": "plain_text",
  "tags": ["tag-a", "tag-b"],
  "parent_id": "0",
  "link_url": "https://example.com/post",
  "image_urls": ["https://..."]
}
```

Rules:

- use `plain_text` for normal text notes
- use `link` with `link_url`
- use `img_text` with `image_urls`
- keep `parent_id` as a string when provided
- pass tags as string arrays

## Async Task Polling

Link and image saves are asynchronous.

Poll with:

```text
POST /open/api/v1/resource/note/task/progress
```

Body:

```json
{
  "task_id": "task_xxx"
}
```

Status values:

- `pending`
- `processing`
- `success`
- `failed`

Rules:

- treat `task_id` as the next actionable output for link or image saves
- do not claim the note exists until polling reaches `success`
- treat `"0"` as a placeholder note ID while the task is still running
- after `success`, use note detail if the user wants the generated summary, OCR result, or source info

## Link Save Workflow

1. `save-link`
2. capture `data.tasks[0].task_id`
3. poll if the user wants completion now
4. inspect note detail after success when user-facing summary matters

## Image Save Workflow

1. if the user provides a local file, request an upload token
2. upload to OSS with the exact field order required by Get 笔记
3. save the note with `note_type=img_text`
4. capture `task_id`
5. poll if the user wants completion now

## Image Upload Token

```text
GET /open/api/v1/resource/image/upload_token?mime_type=<ext>&count=1
```

Rules:

- `mime_type` must match the real file type
- treat returned signed form fields as secrets
- preserve field order for multipart upload:
  `key -> OSSAccessKeyId -> policy -> signature -> callback -> Content-Type -> file`
- the bundled script only supports local-file upload for image notes; it does not accept arbitrary remote image URLs

## Practical Script Mapping

- text note: `node skills/getnote/scripts/getnote.mjs save-text ... --execute`
- link note: `node skills/getnote/scripts/getnote.mjs save-link ... --execute`
- image note: `node skills/getnote/scripts/getnote.mjs save-image ... --execute`
- poll task: `node skills/getnote/scripts/getnote.mjs task-progress ... --execute`
