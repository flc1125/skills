# Graph Patterns

Select the smallest pattern that satisfies the control requirements. Combine patterns only when their contracts remain explicit.

## Pipeline

Use a linear sequence for fixed stages with no meaningful branching. Keep it as a pipeline instead of presenting it as a sophisticated graph.

```text
ingest -> normalize -> validate -> publish
```

## Conditional Router

Use one router when explicit state selects exactly one downstream path. Define mutually exclusive conditions and one fallback.

```text
classify -> routine_path
         -> exception_path
         -> fallback
```

## Fan-Out and Fan-In

Use parallel branches for independent work and an explicit join for aggregation. Declare whether the join waits for all, any, or a quorum, and how partial failures affect the result.

```text
plan -> research -------\
     -> risk_analysis ---+-> synthesize
     -> cost_analysis ---/
```

Avoid parallel branches that write the same state without a reducer or conflict policy.

## Bounded Review Loop

Use a repair loop when output can improve from actionable feedback. Record a progress signal and stop after a measurable budget.

```text
draft -> review -> accept
          |
          v
        revise -> review
```

On exhaustion, route to rejection, escalation, or best-effort completion instead of silently continuing.

## Human Approval Gate

Use an approval node before an irreversible or privileged action. Persist the reviewed artifact, decision, actor identity when required, and continuation token.

```text
prepare -> approval -> execute
                    -> reject
```

Treat approval as a pause-and-resume boundary, not as a long-running model call.

## Supervisor and Workers

Use a supervisor when work decomposition must be dynamic. Keep the supervisor responsible for task allocation and termination, not for performing every worker's task.

Bound worker creation, total steps, and re-planning. Prefer static fan-out when the branches are already known.

## Saga and Compensation

Use ordered side-effect nodes with compensating actions when distributed operations cannot share one transaction.

```text
reserve -> charge -> provision
   ^          ^          |
   | compensate in reverse order on failure
```

Define which failures trigger compensation, whether compensation is retryable, and what happens when compensation itself fails.

## Event-Driven Wait

Use an explicit wait node for external callbacks, timers, or asynchronous completion. Persist correlation identifiers and define timeout and duplicate-event behavior.

Do not model waiting as repeated polling by an LLM unless the runtime provides no better primitive and the polling budget is explicit.
