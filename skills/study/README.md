# Study

Structured learning skill for guided, staged study on one topic at a time.

## Install

```bash
npx skills add https://github.com/flc1125/skills --skill study
```

## Purpose

Use this skill when you want to:

- learn a topic step by step
- start from zero on a topic
- build a study plan for an exam, skill, or knowledge area
- get guided practice instead of only explanations
- keep learning through staged coaching across multiple turns

This skill is designed as a learning coach and study planner. It is not a generic tutor for dumping answers or producing submit-ready work.

## What This Skill Adds

- lightweight intake for topic, level, goal, and time budget
- a default learning loop of diagnosis, path-building, practice, feedback, review, and adjustment
- compact stage plans instead of oversized curricula by default
- active practice prompts that require evidence of learning
- guardrails against answer-dumping, fake memory, and unsafe authority claims

## Recommended Usage

Typical prompts include:

- `Use $study to help me learn Python from zero.`
- `Use $study to build a 4-week study plan for statistics.`
- `Use $study to coach me through interview prep for system design.`
- `Use $study to help me continue learning React step by step.`

The skill works best when the user is willing to answer small diagnostic questions and do short exercises during the session.

## Structure

```text
study/
├── SKILL.md
├── README.md
├── agents/
│   └── openai.yaml
└── references/
    ├── diagnostic-patterns.md
    ├── exercise-patterns.md
    ├── learning-loop.md
    └── review-patterns.md
```

## Limits

- It does not replace licensed or high-risk professional instruction.
- It does not promise durable long-term memory across sessions.
- It is weaker for one-off factual queries than for staged learning workflows.
