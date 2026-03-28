---
name: yuque
description: Work with Yuque OpenAPI for reading, searching, creating, and updating users, groups, repos, docs, TOC structures, versions, and statistics. Use when Codex needs to operate on Yuque knowledge bases or documents, reorganize document placement in a repo, inspect API capabilities, or prepare guarded plans for destructive Yuque actions.
metadata:
  name: Yuque
  description: Operate on Yuque workspaces, repos, docs, TOC structures, and related resources through the Yuque OpenAPI.
  author: Flc゛
  created: 2026-03-23T03:05:50Z
---

# Yuque

Operate on Yuque through its OpenAPI with full capability awareness and explicit safety gates.

## Operating Mode

Act as a Yuque workspace operator, not as a generic REST client.

Prioritize:

- readable resource identification before raw IDs
- read and verify before write
- smallest effective change before broad updates
- guarded handling for destructive operations
- repo and TOC context before moving documents

Assume the upstream API base URL is `https://www.yuque.com` and authentication uses `X-Auth-Token` unless local evidence shows otherwise.

Read [docs/auth.md](docs/auth.md) when wiring local authentication for execution.

## Capability Model

Treat Yuque operations as three execution classes.

### 1. Read

Default allow.

Includes:

- current user and heartbeat
- user groups
- team members
- repo lists and repo details
- doc lists and doc details
- TOC reads
- search
- doc versions
- statistics

### 2. Safe Write

Default allow when the requested target is clear.

Includes:

- create repo
- update repo metadata
- create doc
- update doc
- change member role
- create TOC node
- rename TOC node
- move a doc or node within TOC without deleting anything

### 3. Dangerous Write

Default deny for execution. Produce a preflight plan unless the surrounding environment defines an explicit approval path.

Includes:

- delete doc
- delete repo
- remove TOC node
- remove group member
- broad or implicit TOC rewrites
- batch operations that can orphan or hide content

For dangerous requests:

- identify the exact targets
- explain impact and reversibility
- list the endpoint and action that would be used
- stop at the plan unless the user explicitly wants the higher-risk path and the current environment supports that confirmation model

## Resource Identification

Prefer readable paths over opaque identifiers.

Prefer this order when the user does not force a specific form:

1. `group_login + book_slug + doc_slug`
2. `group_login + book_slug + doc_id`
3. `book_id + doc_id`
4. raw numeric IDs only when that is all that is available

Use the slug-based repo routes when the user speaks in human-readable Yuque paths. Use the ID routes when an existing integration already has stable IDs.

Before any TOC write, read the current TOC first to recover node UUIDs and parent-child relationships.

## Core Workflows

Follow the smallest workflow that satisfies the request.

### Read Workspace State

Use for questions such as:

- "读取这个知识库"
- "看看这个文档内容"
- "列出这个团队的知识库"
- "把当前目录结构给我理一下"

Sequence:

1. Resolve the target repo or doc from readable identifiers.
2. Read the resource using the narrowest matching endpoint.
3. Return the fields that matter for the task.
4. For docs, prefer `body` plus the relevant format-specific body field when present.

Read [references/user-group.md](references/user-group.md) for user, group, and search tasks.
Read [references/repo.md](references/repo.md) for repo tasks.
Read [references/doc.md](references/doc.md) for document tasks.
Read [references/toc.md](references/toc.md) for TOC tasks.

### Create a Document

Use for requests such as:

- "在这个知识库里新建文档"
- "把这份 Markdown 发到语雀"
- "在某个目录下面创建一篇文档"

Sequence:

1. Resolve the target repo.
2. If placement matters, read TOC first and resolve the target parent node.
3. Build the create payload with explicit `title`, `body`, and optional `slug`, `public`, `format`.
4. Default to `format=markdown` unless the user clearly requires `html` or `lake`.
5. After create succeeds, place the document in TOC if the user requested a specific location.

### Update a Document

Use for requests such as:

- "修改这篇语雀文档"
- "把这段内容追加到现有文档"
- "把这个标题和 slug 改掉"

Sequence:

1. Read the current doc first.
2. Determine whether the user wants a full replacement or a targeted edit.
3. Produce the updated full body content.
4. Preserve fields the user did not ask to change, especially `slug`, `public`, and format.
5. Execute the update against the matching repo-scoped route.

Do not treat doc editing as a blind patch. The API is safer to use when the resulting full document state is explicit.

### Reorganize TOC

Use for requests such as:

- "把这篇文档放到某个菜单下面"
- "把这个节点移动到另一个父节点下"
- "新建一个目录节点"
- "重命名目录节点"

Sequence:

1. Read the current TOC.
2. Resolve the target node UUIDs and the intended parent or sibling relationship.
3. Choose the narrowest non-destructive action:
   - `appendNode`
   - `prependNode` only when head insertion is clearly intended
   - `editNode`
4. Execute only the local TOC change needed for the request.
5. Re-read TOC or summarize the expected new placement.

Do not use `removeNode` in normal execution.

## Decision Rules

- Prefer `markdown` for authoring unless the user clearly asks for `html`, `lake`, table, or sheet semantics.
- Prefer repo-scoped doc endpoints over generic doc-detail routes when repo context is known.
- Read before write for docs, repos, member changes, and all TOC actions.
- When moving content in TOC, operate on node UUIDs recovered from a fresh TOC read.
- Preserve visibility and slug unless the user explicitly asks to change them.
- Treat missing target clarity as a blocker for writes; resolve the target first instead of guessing.
- When the request spans many resources, break it into discrete operations and state the plan.

## API Surface Map

This skill covers the major Yuque API domains:

- user
- search
- group members
- repo read and write
- doc read and write
- doc versions
- TOC read and safe reorganization
- statistics

Read [references/capability-map.md](references/capability-map.md) for endpoint coverage and safety classification.

## Prepare

Before executing authenticated scripts, prepare local auth like this:

1. Copy `skills/yuque/.env.example` to `skills/yuque/.env`
2. Replace the placeholder `YUQUE_TOKEN` with a real token
3. Keep `skills/yuque/.env` local only and do not commit it

The scripts auto-load `skills/yuque/.env` when it exists.

Read [docs/auth.md](docs/auth.md) for token resolution order and auth details.

## Scripts

Use the bundled scripts when a concrete request should turn into a reproducible Yuque API call.

- `scripts/heartbeat.mjs` and `scripts/current-user.mjs`: inspect basic auth reachability and token identity
- `scripts/search.mjs`: search docs or repos
- `scripts/list-user-groups.mjs`, `scripts/list-group-members.mjs`, `scripts/update-group-member-role.mjs`: inspect groups and manage non-destructive membership changes
- `scripts/list-repos.mjs`, `scripts/read-repo.mjs`, `scripts/create-repo.mjs`, `scripts/update-repo.mjs`: operate on repos
- `scripts/list-docs.mjs`, `scripts/read-doc.mjs`, `scripts/create-doc.mjs`, `scripts/update-doc.mjs`: operate on docs
- `scripts/list-doc-versions.mjs`, `scripts/read-doc-version.mjs`: inspect doc history
- `scripts/read-toc.mjs`, `scripts/update-toc.mjs`, `scripts/move-toc-node.mjs`: inspect and reorganize TOC without deletion
- `scripts/read-statistics.mjs`: inspect team statistics
- `scripts/*-preflight.mjs`: prepare guarded plans for dangerous actions without executing them

Script rules:

- default to preview mode
- pass `--execute` only when the target is clear and the action is allowed by this skill's safety model
- prefer a local `skills/yuque/.env` copied from `.env.example` for normal execution
- allow `--token` to override local config when a one-off token is necessary
- read the current doc or TOC before using write scripts

## Error Handling

Use these defaults:

- `400`: request shape is wrong; re-check path params, query params, and enums
- `401`: token missing, invalid, or lacks scope
- `403`: token is valid but cannot access the target resource
- `404`: repo, doc, group, or node target is wrong
- `422`: payload validation failed; inspect required fields and enum values
- `429`: rate limited; reduce request volume and retry cautiously
- `500`: upstream failure; avoid repeating broad writes until the target state is checked again

Read [references/auth-and-errors.md](references/auth-and-errors.md) for auth and failure handling.

## Dangerous Requests

When the user asks for deletion or removal:

1. Do not execute the destructive call by default.
2. Produce a preflight summary with:
   - target identifiers
   - likely affected repo, doc, or nodes
   - endpoint and method
   - reversibility concerns
3. Suggest a safer alternative when one exists.

Examples:

- archive by renaming or moving a doc instead of deleting it
- move a TOC node out of the way instead of removing it
- restrict access or change role instead of removing a member

Read [references/safety-policy.md](references/safety-policy.md) for the full policy.
