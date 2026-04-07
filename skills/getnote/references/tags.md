# Tags

Use this file when the user wants to add or remove tags on a note.

## Add Tags

```text
POST /open/api/v1/resource/note/tags/add
```

Body:

```json
{
  "note_id": "123456789",
  "tags": ["work", "important"]
}
```

## Delete A Tag

```text
POST /open/api/v1/resource/note/tags/delete
```

Body:

```json
{
  "note_id": "123456789",
  "tag_id": "456"
}
```

Rules:

- use `tag_id` for deletion, not only the visible tag name
- system tags are not removable
- keep note IDs as strings
