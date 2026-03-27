# Experts

This is a standalone skill for expert-panel assessment and recommendation.

It is a cross-domain expert panel skill, not a domain-specific expert library. It can support engineering, product, risk, compliance, travel, and other complex decision areas, as long as each expert has a real professional lens, distinct judgment criteria, and expert-grade output discipline.

## Install

```bash
npx skills add https://github.com/flc1125/skills --skill experts
```

It is intended for requests such as:

- comparing solution options from multiple expert viewpoints
- asking for a second opinion on an architecture or design
- stress-testing a plan before implementation
- surfacing tradeoffs, risks, and dissent before making a decision
- getting a chaired recommendation instead of a single-agent answer

## Files

- `SKILL.md`: Core skill instructions, panel workflow, expert standards, and output template
- `agents/openai.yaml`: Optional metadata for Codex/OpenAI-compatible tooling and UI integration

## What This Skill Does

The skill guides an agent to:

- frame a decision as an assessment question
- assemble a focused panel of experts with distinct perspectives
- gather independent expert opinions
- run cross-examination across those opinions
- produce a chaired recommendation with explicit tradeoffs and boundaries

It prefers judgment quality over process theater and treats disagreement as useful signal when the decision has real tradeoffs.

## Notes

- This skill is designed to operate independently.
- It is recommendation-first by default. Execution planning is optional and secondary.
