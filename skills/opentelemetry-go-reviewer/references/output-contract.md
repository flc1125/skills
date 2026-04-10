# Output Contract

Use this file for final review output.

## Severity Model

### Critical

Use for issues that should block merge and may cause:

- incorrect or unsafe runtime behavior
- serious compatibility breakage
- likely data loss or broken telemetry semantics
- race conditions, leaks, deadlocks, or lifecycle corruption
- broad generated-code drift from an incorrect source change

### Important

Use for issues that should normally be fixed before merge:

- user-visible behavior changes without required follow-through
- incomplete semantic support across sibling paths
- missing changelog for user-visible changes
- performance-sensitive changes without evidence
- missing tests for risky behavior
- improper boundary choice that is likely to create maintenance or correctness problems

Escalate to **Critical** when the issue creates immediate correctness, safety, or compatibility risk.

### Minor

Use for issues worth fixing but not normally merge-blocking:

- clarity problems that increase maintenance cost
- weak naming or structure choices with low immediate risk
- small documentation gaps
- low-risk cleanup that prevents confusion

## Findings Structure

Prefer this structure:

```markdown
# Review Findings

## Critical
- <issue with file/line and impact>

## Important
- <issue with file/line and impact>

## Minor
- <issue with file/line and impact>

## Open Questions
- <missing context or assumption>

## Assessment
- Ready to proceed / Fix important issues first / Blocked
```

If there are no meaningful findings, say so explicitly and still include residual risk or testing gaps.

## Writing Rules

- Put findings before summary.
- Make each finding standalone: what changed, why it matters, and what should happen next.
- Tie each finding to repository concerns such as compatibility, lifecycle, performance, generated-source integrity, or policy compliance.
- Use file and line references whenever available.
- Keep praise brief and secondary.
- Avoid vague statements like "could be improved" without impact.
