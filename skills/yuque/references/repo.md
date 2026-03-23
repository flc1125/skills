# Repo Operations

Use this file for Yuque knowledge base operations.

## Read Repo

Two route styles exist.

### By repo ID

- `GET /api/v2/repos/{book_id}`

### By readable path

- `GET /api/v2/repos/{group_login}/{book_slug}`

Prefer the readable path when the user gives a Yuque URL or a team and knowledge-base slug.

## List Repos

### Group repos

- `GET /api/v2/groups/{login}/repos`

### User repos

- `GET /api/v2/users/{login}/repos`

Use these endpoints when the user asks for "这个团队有哪些知识库" or when repo selection is still unresolved.

## Create Repo

Routes:

- `POST /api/v2/groups/{login}/repos`
- `POST /api/v2/users/{login}/repos`

Typical create fields include:

- `name`
- `slug`
- `description`
- `public`
- repo type when supported by the schema

Treat repo creation as safe write, but make the target owner explicit before sending the request.

## Update Repo

Routes:

- `PUT /api/v2/repos/{book_id}`
- `PUT /api/v2/repos/{group_login}/{book_slug}`

Use for metadata updates such as:

- name
- slug
- description
- visibility

Read the repo first if the change should preserve fields the user did not mention.

## Delete Repo

Routes:

- `DELETE /api/v2/repos/{book_id}`
- `DELETE /api/v2/repos/{group_login}/{book_slug}`

This is dangerous. Do not execute by default.

## Key Models

- `V2Book`: list-level repo object
- `V2BookDetail`: detail object with `toc_yml`, counts, timestamps, and `namespace`

Important fields:

- `id`
- `slug`
- `name`
- `user_id`
- `description`
- `public`
- `items_count`
- `namespace`
