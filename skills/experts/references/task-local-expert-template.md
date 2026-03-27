# Task-Local Expert Template

Use this template when the registry does not contain a needed expert lens.

Task-local experts must feel like real experts, not improvised personas. The standard is the same as the permanent cards.

## When This Is Allowed

Create a task-local expert only when:

- the missing perspective is a genuine expert discipline
- an existing card cannot cover the judgment cleanly
- the missing expert has a distinct basis for agreement or disagreement
- the expert can be named without tying it to one implementation step

Good examples:

- `identity-expert`
- `fraud-expert`
- `observability-expert`
- `ad-tech-expert`

Bad examples:

- `checkout-page-expert`
- `phase-two-expert`
- `implementation-expert`
- `smart-reviewer`

## Required Standard

Every task-local expert must:

- act like the most senior expert in a real discipline
- have explicit decision criteria rather than generic opinions
- distinguish facts, inference, and uncertainty
- name critical unknowns and what would change the recommendation
- state reject conditions, not just preferences
- define clear non-goals so the seat does not sprawl into adjacent disciplines

## Required Fields

When synthesizing a task-local expert, define all of these fields in the panel notes or prompt:

### 1. Expert Name

Use a clear discipline name, such as `identity-expert` or `fraud-expert`.

### 2. Professional Lens

State the expert's exact judgment perspective in one sentence.

Example:

`identity-expert`: evaluates identity lifecycle, trust boundaries, account linking, and recovery safety.

### 3. Decision Surface

List the kinds of decisions this expert is allowed to judge.

Example:

- account linking
- login and recovery flows
- session trust transitions
- identity provider integration boundaries

### 4. Required Evidence

State what evidence this expert expects before making a strong recommendation.

Example:

- current trust boundary map
- identity flow definitions
- recovery and account-takeover risks
- failure and support escalation patterns

### 5. Core Evaluation Criteria

State the expert's main criteria explicitly.

Example:

- safety of account recovery
- resistance to account-linking mistakes
- blast radius of identity compromise
- supportability of edge-case recovery

### 6. Critical Unknowns

State which unknowns limit confidence.

Example:

- whether one person may legitimately hold multiple identities
- whether recovery must work without email possession

### 7. Reject Conditions

State which paths this expert would reject outright.

Example:

- reject any design that allows silent account merges without strong user confirmation
- reject any recovery flow that increases account takeover risk beyond the current baseline

### 8. Non-Goals and Boundaries

State what this expert does not own and which nearby experts cover adjacent concerns.

Example:

- does not own general frontend polish
- does not replace `security-expert`; focuses on identity-specific trust and recovery design

## Short Template

Use this structure:

```markdown
### <expert-name>

Professional lens:
- <one-sentence definition>

Decision surface:
- <area 1>
- <area 2>

Required evidence:
- <evidence 1>
- <evidence 2>

Core evaluation criteria:
- <criterion 1>
- <criterion 2>

Critical unknowns:
- <unknown 1>
- <unknown 2>

Reject conditions:
- <reject 1>
- <reject 2>

Non-goals and boundaries:
- <boundary 1>
- <boundary 2>
```

## Quality Check

Before using a task-local expert, verify:

- the name sounds like a real discipline
- the criteria are not generic
- the seat could disagree with another expert for principled reasons
- the seat has explicit reject conditions
- the seat does not duplicate an existing role with different wording
