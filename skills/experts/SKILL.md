---
name: experts
description: Assemble a panel of experts to assess a problem from multiple professional perspectives, surface agreement and disagreement, and deliver a chaired recommendation with clear tradeoffs. Use when the user wants multi-expert judgment, a second opinion, design critique, option comparison, or a recommendation backed by distinct expert viewpoints.
---

# Experts

Assemble a focused panel of experts around one problem and produce a chaired recommendation.

This skill is for expert judgment first. It is not a generic task router.

## Operating Mode

- Use this skill when the user wants expert advice, a multi-angle assessment, a second opinion, or a recommendation with explicit tradeoffs.
- Treat explicit invocation of `$experts` as permission to assemble a panel of subagents when the environment supports it.
- Prefer domain experts over generic worker roles.
- Require each expert to form an independent view before seeing other experts' conclusions.
- Treat disagreement as useful output, not failure.
- Keep the final answer focused on judgment, rationale, tradeoffs, and boundaries.

## Resource Map

Read [references/roles-index.md](references/roles-index.md) first. Then load only the expert cards that match the problem.

Common expert cards:

- [references/role-chair.md](references/role-chair.md)
- [references/role-architect.md](references/role-architect.md)
- [references/role-frontend-expert.md](references/role-frontend-expert.md)
- [references/role-backend-expert.md](references/role-backend-expert.md)
- [references/role-product-expert.md](references/role-product-expert.md)
- [references/role-security-expert.md](references/role-security-expert.md)
- [references/role-privacy-expert.md](references/role-privacy-expert.md)
- [references/role-performance-expert.md](references/role-performance-expert.md)
- [references/role-data-expert.md](references/role-data-expert.md)
- [references/role-devops-expert.md](references/role-devops-expert.md)
- [references/role-platform-expert.md](references/role-platform-expert.md)
- [references/role-mobile-expert.md](references/role-mobile-expert.md)
- [references/role-search-expert.md](references/role-search-expert.md)
- [references/role-payments-expert.md](references/role-payments-expert.md)
- [references/role-compliance-expert.md](references/role-compliance-expert.md)
- [references/role-ml-expert.md](references/role-ml-expert.md)
- [references/role-qa-expert.md](references/role-qa-expert.md)
- [references/example-platform-modernization-panel.md](references/example-platform-modernization-panel.md)
- [references/example-analytics-dashboard-panel.md](references/example-analytics-dashboard-panel.md)
- [references/example-subscription-billing-panel.md](references/example-subscription-billing-panel.md)
- [references/example-ai-assistant-panel.md](references/example-ai-assistant-panel.md)

Read the example only when you need a high-quality reference for what a professional panel output should look like.

## Panel Modes

Choose one mode before assembling the panel:

- `advisory`: provide expert judgment and recommendation only
- `decision-support`: provide recommendation plus a concrete next-step plan
- `deep-dive`: investigate a complex problem with more evidence gathering before recommendation

Use `advisory` by default unless the user asks for execution planning or deeper analysis.

## Workflow

Follow this sequence unless the user asks for a narrower deliverable.

### 1. Frame the question

Extract and restate:

- the exact question to be assessed
- the desired decision or output
- known constraints, assumptions, and approvals
- relevant code, documents, systems, or artifacts
- time sensitivity
- the panel mode

Reduce vague requests into a precise assessment question before assembling the panel.

### 2. Select the panel

Choose a small panel with one `chair` and two to six experts.

Pick experts that match the real decision surface. Prefer distinct viewpoints over panel size.

Use the role cards in [references/roles-index.md](references/roles-index.md) when they fit. If no card fits cleanly, synthesize a task-local expert with a clearly named professional lens and explicit remit.

### 3. Gather independent opinions

Ask each expert to assess the problem independently.

Each opinion should cover:

- core judgment
- evidence basis and what is inferred versus directly observed
- confidence level and the main reason for that confidence level
- reasoning and assumptions
- preferred option
- main risks
- critical unknowns that could change the recommendation
- decision thresholds that would cause the expert to change position
- what the expert would reject and why

Do not let experts anchor on each other too early.

### 4. Run cross-examination

After independent opinions exist, ask experts to challenge each other.

Focus on:

- hidden assumptions
- underestimated costs
- ignored failure modes
- disagreement about priorities
- conditions under which another expert would be right

Keep this phase evidence-driven and concise.

### 5. Deliver the chaired recommendation

The `chair` synthesizes the panel into a decision-ready output.

Return:

- the question
- the final panel
- each expert's core view
- the evidence and confidence profile behind each view
- agreement points
- disagreement points
- the recommended path
- tradeoffs and risks
- boundaries where the recommendation does or does not hold

When the user asks to proceed, include a short next-step plan after the recommendation. Do not turn the report into a full execution playbook unless explicitly requested.

## Expert Standards

Apply these rules to every expert:

- Act as the most senior expert for the assigned perspective.
- Stay rigorous, concrete, and scope-bound.
- Prefer defensible reasoning over confident tone.
- Distinguish observed facts from inference and speculation.
- State confidence level and what would increase or decrease it.
- Make assumptions explicit.
- Name the key unknowns that prevent a stronger recommendation.
- State reject conditions, not just preferred outcomes.
- Push back on weak framing, false binaries, and unsupported claims.
- Optimize for helping the user make a better decision, not for winning an argument.

## Selection Rules

- Prefer the smallest panel that can expose meaningful tradeoffs.
- Prefer domain experts to generic reviewers.
- Add a role expert only when a domain lens is not enough.
- Avoid duplicate experts with the same perspective.
- Expand the panel only when the decision has genuine cross-functional risk.
- If one expert would dominate because the question is narrow, use fewer experts and state that clearly.

## Output Structure

Use this structure when returning a panel result:

```markdown
# Expert Panel Report

## Question
- <the decision or problem being assessed>

## Panel
- chair: <why this chair is appropriate>
- <expert>: <perspective and remit>

## Expert Opinions
- <expert>: <core judgment, rationale, major risks>
- evidence: <what is known, what is inferred>
- confidence: <high | medium | low> and why
- critical unknowns: <what could still change the answer>
- reject conditions: <what would make this expert reject a path>

## Agreement
- <shared conclusions>

## Disagreement
- <meaningful differences in view or priorities>

## Recommendation
- recommended path: <best option>
- why: <main justification>

## Tradeoffs
- <what is gained and what is given up>

## Confidence and Unknowns
- <where the panel is confident>
- <where the panel is still reasoning under uncertainty>

## Boundaries
- holds when: <conditions where this advice fits>
- avoid when: <conditions where this advice should not be followed>
```

## Decision Rules

- Prefer explicit tradeoffs over vague best practices.
- Prefer recommendations that match the user's real constraints, not an idealized environment.
- State uncertainty when the evidence is incomplete.
- Keep minority concerns when they materially affect risk.
- Separate recommendation quality from implementation difficulty.
- If the panel lacks a necessary perspective, say so and adjust the panel before concluding.

## Red Flags

Stop and reassess if:

- the question is still too vague to judge
- the panel contains overlapping experts with no distinct lens
- experts are repeating the same argument in different words
- the recommendation hides unresolved disagreement
- evidence is too thin for a credible conclusion
- the user is asking for implementation but the panel has only produced advice
