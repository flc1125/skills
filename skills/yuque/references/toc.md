# TOC Operations

Use this file for directory reads and non-destructive TOC changes.

## Read TOC

Route options:

- `GET /api/v2/repos/{book_id}/toc`
- `GET /api/v2/repos/{group_login}/{book_slug}/toc`

Always read TOC before attempting any TOC write. The write endpoints depend on node UUIDs and current tree shape.

## Write TOC

Route options:

- `PUT /api/v2/repos/{book_id}/toc`
- `PUT /api/v2/repos/{group_login}/{book_slug}/toc`

Supported action values in the schema:

- `appendNode`
- `prependNode`
- `editNode`
- `removeNode`

Supported action modes:

- `sibling`
- `child`

## Safe TOC Actions

Treat these as safe when the target is explicit and the change is narrow:

- create a new node under a known parent
- place a doc under a known parent node
- reorder a node relative to known siblings
- rename an existing node

Prefer:

- `appendNode` for normal insertion
- `editNode` for targeted updates or movement

Use `prependNode` only when the user explicitly wants the node at the beginning of the sibling list.

## Dangerous TOC Actions

Treat these as dangerous:

- `removeNode`
- broad rewrites of many nodes in one step
- moving nodes when the target identity is ambiguous

Deleting a TOC node does not necessarily delete the underlying doc, but it can still hide content and break navigation expectations. That is enough to treat it as high risk.

## Practical Rules

- recover `target_uuid` and `node_uuid` from a fresh TOC read
- do not guess UUIDs from stale notes
- when moving a doc under a menu, resolve the menu node first
- when multiple nodes have similar names, stop and disambiguate before writing
