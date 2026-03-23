# User, Group, Search, And Statistics

Use this file for user identity, group membership reads, search, and reporting tasks.

## User

### Current token user

- Endpoint: `GET /api/v2/user`
- Purpose: identify who the token belongs to and what workspace context is likely available
- Primary model: `V2User`

Use this first when permissions are unclear.

### User groups

- Endpoint: `GET /api/v2/users/{id}/groups`
- Purpose: list groups a user belongs to
- Path input: user login or numeric ID

## Group Members

### Read members

- Endpoint: `GET /api/v2/groups/{login}/users`
- Purpose: inspect a team's members
- Optional filters: role and offset

### Change member role

- Endpoint: `PUT /api/v2/groups/{login}/users/{id}`
- Safe write classification: allowed
- Body field: `role`
- Supported role values:
  - `0` admin
  - `1` member
  - `2` read-only member

### Remove member

- Endpoint: `DELETE /api/v2/groups/{login}/users/{id}`
- Dangerous classification: do not execute by default

## Search

- Endpoint: `GET /api/v2/search`
- Required query params:
  - `q`
  - `type` as `doc` or `repo`
- Useful optional params:
  - `scope`
  - `page`
  - `creator`

Use search when the user knows content semantically but not structurally.

Prefer direct repo or doc routes when the target path is already known.

## Statistics

Endpoints:

- `GET /api/v2/groups/{login}/statistics`
- `GET /api/v2/groups/{login}/statistics/members`
- `GET /api/v2/groups/{login}/statistics/books`
- `GET /api/v2/groups/{login}/statistics/docs`

Use statistics for read-only reporting and trend inspection. Treat all statistics endpoints as read-only and safe.
