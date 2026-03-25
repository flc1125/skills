# Completion Alerts

This skill uses layered completion announcements so finished async work is hard to miss.

## Priority Order

Use the strongest available option in this order:

1. `host-ui-alert`
2. `boxed-terminal-alert`
3. `structured-inline-alert`

Always keep user pull-based actions available:

- check status
- collect result
- summarize result
- inspect failure
- list async tasks

## Rules

- announce completion proactively when it becomes observable
- put the announcement before normal response content
- include `task_ref`, status, and next action
- do not repeatedly announce the same unchanged completion
- reuse the exact `task_ref` already shown to the user; do not introduce a replacement name in the completion alert

## Boxed Terminal Alert

Use this when host UI alerting is unavailable:

```text
+--------------------------------------------------+
| ASYNC TASK COMPLETED                             |
+--------------------------------------------------+
| Task Ref : research-subagent-1                   |
| Status   : completed_uncollected                 |
| Summary  : Background subagent work finished.    |
| Next     : collect research-subagent-1           |
+--------------------------------------------------+
```

For failures:

```text
+--------------------------------------------------+
| ASYNC TASK FAILED                                |
+--------------------------------------------------+
| Task Ref : research-subagent-1                   |
| Status   : failed                                |
| Next     : inspect research-subagent-1           |
+--------------------------------------------------+
```

For multiple updates:

```text
+--------------------------------------------------+
| ASYNC TASK UPDATES                               |
+--------------------------------------------------+
| completed : research-subagent-1                  |
| completed : review-async-1                       |
| failed    : trace-runtime-1                      |
| Next      : list async tasks                     |
+--------------------------------------------------+
```

## Structured Inline Alert

If boxed formatting is unsuitable, use a clear leading block:

```markdown
# Async Task Completed

Task: `research-subagent-1`
Status: `completed_uncollected`
Next: `collect research-subagent-1`
```
