# List And Inspect Notes

Use this file for note list, detail, update, and delete flows.

## List Notes

```text
GET /open/api/v1/resource/note/list?since_id=0
```

Rules:

- pass `since_id` as a string
- first page usually uses `"0"`
- keep `next_cursor` as a string for later pagination
- treat the response as potentially needing tolerant JSON parsing because note content can contain raw control characters

## Note Detail

```text
GET /open/api/v1/resource/note/detail?id=<note_id>
```

Optional query:

- `image_quality=original`

Rules:

- pass `note_id` as a string
- detail data lives under `data.note`
- detail can include `web_page`, `audio`, `attachments`, and `children_ids`

## Update Note

```text
POST /open/api/v1/resource/note/update
```

Body:

```json
{
  "note_id": "123456789",
  "title": "New title",
  "content": "Updated Markdown",
  "tags": ["work", "important"]
}
```

Rules:

- `note_id` is required
- provide at least one of `title`, `content`, or `tags`
- treat this as a plain-text note workflow unless the API explicitly proves another note type works

## Delete Note

```text
POST /open/api/v1/resource/note/delete
```

Body:

```json
{
  "note_id": "123456789"
}
```

Rules:

- delete moves the note to trash
- surface the exact target note ID before executing destructive intent

## Practical Script Mapping

- list: `node skills/getnote/scripts/getnote.mjs list-notes --since-id 0 --execute`
- detail: `node skills/getnote/scripts/getnote.mjs note-detail --note-id ... --execute`
- update: `node skills/getnote/scripts/getnote.mjs update-note --note-id ... --content-file ... --execute`
- delete: `node skills/getnote/scripts/getnote.mjs delete-note --note-id ... --execute`
