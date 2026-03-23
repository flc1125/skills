# Capability Map

Use this file to map user intent to Yuque endpoint groups and safety level.

## Read

- `GET /api/v2/hello`
- `GET /api/v2/user`
- `GET /api/v2/users/{id}/groups`
- `GET /api/v2/search`
- `GET /api/v2/groups/{login}/users`
- `GET /api/v2/groups/{login}/repos`
- `GET /api/v2/users/{login}/repos`
- `GET /api/v2/repos/{book_id}`
- `GET /api/v2/repos/{group_login}/{book_slug}`
- `GET /api/v2/repos/{book_id}/docs`
- `GET /api/v2/repos/{group_login}/{book_slug}/docs`
- `GET /api/v2/repos/docs/{id}`
- `GET /api/v2/repos/{book_id}/docs/{id}`
- `GET /api/v2/repos/{group_login}/{book_slug}/docs/{id}`
- `GET /api/v2/doc_versions`
- `GET /api/v2/doc_versions/{id}`
- `GET /api/v2/repos/{book_id}/toc`
- `GET /api/v2/repos/{group_login}/{book_slug}/toc`
- `GET /api/v2/groups/{login}/statistics`
- `GET /api/v2/groups/{login}/statistics/members`
- `GET /api/v2/groups/{login}/statistics/books`
- `GET /api/v2/groups/{login}/statistics/docs`

## Safe Write

- `POST /api/v2/groups/{login}/repos`
- `POST /api/v2/users/{login}/repos`
- `PUT /api/v2/repos/{book_id}`
- `PUT /api/v2/repos/{group_login}/{book_slug}`
- `POST /api/v2/repos/{book_id}/docs`
- `POST /api/v2/repos/{group_login}/{book_slug}/docs`
- `PUT /api/v2/repos/{book_id}/docs/{id}`
- `PUT /api/v2/repos/{group_login}/{book_slug}/docs/{id}`
- `PUT /api/v2/groups/{login}/users/{id}` for role changes
- `PUT /api/v2/repos/{book_id}/toc` with `appendNode`, `prependNode`, or `editNode`
- `PUT /api/v2/repos/{group_login}/{book_slug}/toc` with `appendNode`, `prependNode`, or `editNode`

## Dangerous Write

- `DELETE /api/v2/groups/{login}/users/{id}`
- `DELETE /api/v2/repos/{book_id}/docs/{id}`
- `DELETE /api/v2/repos/{group_login}/{book_slug}/docs/{id}`
- `DELETE /api/v2/repos/{book_id}`
- `DELETE /api/v2/repos/{group_login}/{book_slug}`
- `PUT /api/v2/repos/{book_id}/toc` with `removeNode`
- `PUT /api/v2/repos/{group_login}/{book_slug}/toc` with `removeNode`

## Important Models

- `V2User`
- `V2Group`
- `V2GroupUser`
- `V2Book`
- `V2BookDetail`
- `V2Doc`
- `V2DocDetail`
- `V2TocItem`
- `V2DocVersion`
- `V2DocVersionDetail`
- `V2SearchResult`
- `V2GroupStatistics`
- `V2MemberStatistics`
- `V2BookStatistics`
- `V2DocStatistics`

## Selection Rules

- Use repo slug routes when the user gives a human-readable Yuque path.
- Use repo ID routes when an integration already persists `book_id`.
- Use generic doc-detail route only when repo context is missing.
- Use TOC endpoints only after reading TOC and resolving node UUIDs.
