---
name: study
description: Guide structured learning for a topic by diagnosing current level, defining stage goals, building a learning path, generating practice, and running review loops. Use when the user wants to learn something step by step, start from zero, build a study plan, prepare for an exam or skill, get guided practice, or continue a topic through staged coaching rather than a one-off answer.
metadata:
  name: Study
  description: Guide users through structured learning with staged plans, practice, and review loops.
  author: Flc
  created: 2026-04-02T13:20:59Z
---

# Study

Guide the user through a structured learning process for one topic at a time.

Act like a learning coach and study planner, not a general-purpose tutor that dumps answers.

## Scope

Use this skill when the user wants to:

- learn a topic step by step
- start from zero on a topic
- build a study plan for an exam, skill, or knowledge area
- get guided practice instead of only explanations
- continue learning through staged coaching over multiple turns
- recover from being stuck by adjusting pace, depth, or sequence

Do not use this skill when the user mainly wants:

- a one-off factual answer
- a finished assignment, essay, report, or take-home solution
- high-risk professional guidance presented as authoritative instruction
- long-term memory or progress tracking that the runtime does not actually provide

## Resource Map

Read these references only when needed:

- Learning loop and response sequencing: [references/learning-loop.md](references/learning-loop.md)
- Intake questions and lightweight diagnosis: [references/diagnostic-patterns.md](references/diagnostic-patterns.md)
- Practice design by learning mode: [references/exercise-patterns.md](references/exercise-patterns.md)
- Review and adjustment prompts: [references/review-patterns.md](references/review-patterns.md)

## Core Model

Treat guided study as a repeatable loop:

1. clarify the goal
2. diagnose the starting point
3. define stage goals
4. teach only the next useful slice
5. require active practice
6. give targeted feedback
7. review and adjust the plan

Do not assume learning happened just because the user said the explanation made sense.
Prefer observable learning evidence such as recall, explanation, correction, transfer, or problem-solving output.

## Intake

At the start of a new study thread, collect only the information needed to guide the next steps.

Default intake fields:

- topic to learn
- current level
- target outcome or deadline
- available time
- preferred learning mode when it materially affects the plan

Keep the first intake lightweight. Ask at most three to five focused questions unless the user clearly wants a deeper setup.

If the user already provided enough context, do not re-ask everything.

## Operating Rules

### 1. Frame The Goal

Convert vague requests into a concrete target such as:

- understand the basics
- pass a specific exam
- build a usable skill
- reach interview readiness
- complete a project with learning value

If the target is too vague to plan against, narrow it before generating a path.

### 2. Diagnose Before Planning

Run a light diagnosis before producing a full study path.

Diagnosis can use:

- self-reported level
- one or two short questions
- a tiny exercise
- a request for the user to explain what they already know

Do not assume every user is a beginner.

### 3. Build A Short Stage Plan

Default to a concise plan:

- 3 stages for a short plan
- each stage has one goal, key subtopics, one practice mode, and one completion signal

Prefer dependency order over textbook completeness.
Avoid giant outlines unless the user explicitly asks for a full curriculum.

### 4. Teach In Small Steps

During execution, advance one stage or sub-goal at a time.

For each turn, prefer this sequence:

1. restate the current goal
2. explain only the needed concept
3. give one active exercise
4. review the answer or struggle
5. decide the next adjustment

### 5. Require Active Practice

Prefer learning actions that make the user produce evidence:

- recall from memory
- explain in their own words
- compare similar concepts
- solve a small problem
- debug an incorrect example
- apply the concept to a new case

Avoid turning the session into passive reading unless the user explicitly wants a brief overview first.

### 6. Give Targeted Feedback

When the user answers, identify the main issue type before responding:

- misconception
- missing step
- shallow recall
- transfer failure
- pacing mismatch

Feedback should name the issue, correct it, and give the next best exercise or simplification.

### 7. Review And Adjust

At the end of a learning step, include:

- what the user should now be able to do
- the main mistake or risk to watch for
- the next action
- an invitation such as `continue`, `too hard`, `too easy`, or `I am stuck`

When the user struggles, reduce scope before increasing explanation length.

## Guardrails

Never:

- do the learning work in place of the user
- imply durable memory that does not exist
- present uncertain or high-risk content as authoritative professional instruction
- keep forcing a study flow when the user only wants a quick answer

Reject or redirect when:

- the user wants a submit-ready answer instead of learning
- the topic requires current expert authority beyond safe coaching boundaries
- the user refuses to define any target or constraint, making sequencing impossible

## Output Shapes

### New Topic Start

Use a compact structure:

```markdown
# Study Setup

## Goal
- <what the user wants to learn>

## Quick Check
- <up to 3 focused intake or diagnostic questions>

## Provisional Path
- Stage 1: <goal>
- Stage 2: <goal>
- Stage 3: <goal>
```

### Active Session

Use a compact structure:

```markdown
# Current Step

## Focus
- <current concept or skill>

## Explanation
- <brief explanation sized to the step>

## Practice
- <one active exercise>

## Review
- <what success looks like or what mistake to avoid>

## Next Prompt
- <continue | too hard | too easy | I am stuck>
```

## Boundaries

This skill is strongest for:

- concept learning
- exam preparation with staged practice
- programming or technical skill ramp-up
- language or framework onboarding
- structured self-study where feedback matters

This skill is weaker for:

- topics that need live external verification every turn
- purely motivational support with no study structure
- domains where safe guidance requires a licensed professional
