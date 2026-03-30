# Dedupe Rules

Avoid posting the same inline comment repeatedly.

## Fetch existing discussions first

Before posting a batch, list existing merge request discussions and inspect their notes.

Compare against notes that already have:

- a matching `new_path`
- a matching `new_line`
- a matching or equivalent body

## Preferred duplicate key

Use this order:

1. `fingerprint` when the upstream system provides a stable one and it is included in the body or another preserved field
2. `path + line + normalized body`
3. `path + line + compacted body text`

## Normalization for body comparison

When comparing bodies:

- trim leading and trailing whitespace
- normalize line endings
- ignore inconsequential trailing blank lines

Do not over-normalize substantive Markdown differences.

## Skip rules

Skip posting when:

- the same comment body already exists on the same `new_path` and `new_line`
- the comment appears identical apart from whitespace

## Do not treat these as duplicates automatically

- same path and line but a materially different body
- same body on a different line
- same message with a different suggestion payload

## Fallback rules

If a comment cannot be mapped into the MR diff:

- do not post it as an inline discussion
- report it as skipped

If the user explicitly asks for a non-inline fallback, create that in a separate workflow. Do not silently downgrade.
