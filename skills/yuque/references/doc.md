# Doc Operations

Use this file for listing, reading, creating, updating, and inspecting doc versions.

## List Docs

Two route styles exist for listing docs inside a repo.

- `GET /api/v2/repos/{book_id}/docs`
- `GET /api/v2/repos/{group_login}/{book_slug}/docs`

Use these endpoints to inspect available docs before selecting one for update or TOC movement.

## Read Doc

Route options:

- `GET /api/v2/repos/docs/{id}`
- `GET /api/v2/repos/{book_id}/docs/{id}`
- `GET /api/v2/repos/{group_login}/{book_slug}/docs/{id}`

Prefer repo-scoped routes when repo context is known.

## Create Doc

Route options:

- `POST /api/v2/repos/{book_id}/docs`
- `POST /api/v2/repos/{group_login}/{book_slug}/docs`

Important request fields:

- `body` required
- `title` optional but should usually be set explicitly
- `slug` optional
- `public` optional
- `format` optional with default `markdown`

Supported create formats:

- `markdown`
- `html`
- `lake`

## Update Doc

Route options:

- `PUT /api/v2/repos/{book_id}/docs/{id}`
- `PUT /api/v2/repos/{group_login}/{book_slug}/docs/{id}`

Important update fields:

- `title`
- `slug`
- `public`
- `format`
- `body`

Read before write. Generate the resulting full document state instead of blindly patching fragments.

## Delete Doc

Route options:

- `DELETE /api/v2/repos/{book_id}/docs/{id}`
- `DELETE /api/v2/repos/{group_login}/{book_slug}/docs/{id}`

This is dangerous. Do not execute by default.

## Doc Models

### `V2Doc`

Use as the list/search summary shape.

Important fields:

- `id`
- `type`
- `slug`
- `title`
- `description`
- `book_id`
- `public`
- `status`
- `likes_count`
- `comments_count`
- `word_count`
- timestamps

### `V2DocDetail`

Use as the full doc object for editing and export decisions.

Important content fields:

- `format`
- `body`
- `body_html`
- `body_lake`
- `body_draft`
- `body_sheet`
- `body_table`

Supported doc types include:

- `Doc`
- `Sheet`
- `Thread`
- `Board`
- `Table`

Default editing policy:

- prefer `markdown`
- only use `html` or `lake` when the user explicitly needs that format
- be careful with `Sheet` and `Table`, because their structured bodies are not ordinary markdown text

## Versions

Routes:

- `GET /api/v2/doc_versions`
- `GET /api/v2/doc_versions/{id}`

Use version endpoints to inspect prior states before risky updates or to recover context about recent edits.
