# API Details

Use this file for error handling, int64 rules, and rate-limit interpretation.

## Int64 Handling

The API uses 64-bit integer IDs in places such as:

- `id`
- `note_id`
- `next_cursor`
- `parent_id`
- `follow_id`
- `live_id`

In JavaScript, treat them as strings before JSON parsing or immediately after parsing through a tolerant helper. The bundled scripts already do this.

## Common Error Codes

| Code | Meaning |
| --- | --- |
| `10000` | invalid request parameters |
| `10001` | authentication failed |
| `10100` | resource not found |
| `10201` | membership required |
| `10202` | QPS limited |
| `42900` | quota limited |
| `30000` | upstream service call failed |
| `50000` | internal system error |

## Common Error Reasons

| Reason | Meaning |
| --- | --- |
| `not_member` | the account needs a qualifying Get 笔记 membership |
| `qps_global` | global QPS limit exceeded |
| `qps_bucket` | bucket-level QPS limit exceeded |
| `quota_day` | daily quota exhausted |
| `quota_month` | monthly quota exhausted |

## Rate-Limit Posture

When the API reports a quota or rate-limit failure:

- stop instead of retrying blindly
- surface the concrete reason
- mention the reset window only when the API returned it

## Response Handling Rules

- the API can return HTTP 200 with `success: false`; treat that as a failure
- some note-list responses may require tolerant parsing because content can contain raw control characters
- note detail payloads are nested under `data.note`
- link or image note creation may return task info in `data.tasks[0].task_id`
