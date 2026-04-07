# Search Notes

Use this file when the user wants semantic recall across notes or knowledge content.

## Global Recall

```text
POST /open/api/v1/resource/recall
```

Body:

```json
{
  "query": "RAG design notes",
  "top_k": 3
}
```

Rules:

- `query` is required
- `top_k` defaults to `3`
- keep `top_k` small unless the user explicitly wants a broader list

## Knowledge Recall

```text
POST /open/api/v1/resource/recall/knowledge
```

Body:

```json
{
  "topic_id": "qnNX75j0",
  "query": "weekly product review",
  "top_k": 3
}
```

Rules:

- `topic_id` is required
- resolve the target knowledge base before searching

## Result Handling

Returned results are already ranked by relevance.

Prefer surfacing:

- title
- short content snippet
- note type or content type
- created timestamp
- note ID only when follow-up detail is likely

## Practical Script Mapping

- global search: `node skills/getnote/scripts/getnote.mjs search --query "..." --execute`
- knowledge search: `node skills/getnote/scripts/getnote.mjs search-knowledge --topic-id ... --query "..." --execute`
