# Knowledge Resources

Use this file for knowledge-base reads and writes.

## List Owned Knowledge Bases

```text
GET /open/api/v1/resource/knowledge/list?page=1
```

## List Subscribed Knowledge Bases

```text
GET /open/api/v1/resource/knowledge/subscribe/list?page=1
```

Rules:

- owned knowledge bases are writable
- subscribed knowledge bases are typically read-only

## Create A Knowledge Base

```text
POST /open/api/v1/resource/knowledge/create
```

Body:

```json
{
  "name": "AI Notes",
  "description": "Working notes for AI product and engineering",
  "cover": ""
}
```

## List Notes In A Knowledge Base

```text
GET /open/api/v1/resource/knowledge/notes?topic_id=<topic_id>&page=1
```

## Add Notes To A Knowledge Base

```text
POST /open/api/v1/resource/knowledge/note/batch-add
```

Body:

```json
{
  "topic_id": "abc123",
  "note_ids": ["123456789", "123456790"]
}
```

Rules:

- keep `topic_id` and each note ID as strings
- owned knowledge bases are the default target for writes
- stop when the user refers to an ambiguous knowledge base name

## Remove Notes From A Knowledge Base

```text
POST /open/api/v1/resource/knowledge/note/remove
```

Body:

```json
{
  "topic_id": "abc123",
  "note_ids": ["123456789"]
}
```

## Blogger And Live Content

The bundled script also exposes read-only routes for knowledge subscriptions:

- `knowledge-bloggers`
- `knowledge-blogger-contents`
- `knowledge-blogger-detail`
- `knowledge-lives`
- `knowledge-live-detail`

Use them only when the user is explicitly exploring subscribed knowledge content.
