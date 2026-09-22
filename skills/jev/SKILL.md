---
name: jev
description: Solve user tasks by dynamically designing and executing workflows that combine code with Jev semantic judgments. Use when the user asks to use Jev or TypeSafe to process supplied material, or when repeated semantic decisions would help complete a task; especially useful for batches and combinations of selection, comparison, extraction, and verification.
metadata:
  name: Jev
  description: Complete user tasks with adaptable semantic judgments and executable workflows.
  author: Flc
  created: "2026-09-22T09:19:27Z"
---

# Jev

Turn the user's goal into a working method. Design the necessary judgments, call the bundled Node.js helper, and combine its answers with code to deliver the requested result. The user does not need to choose primitives or start a software project.

## Shape the method

Start with the desired output and available evidence. Resolve routine implementation choices yourself. State reasonable assumptions; ask only when an ambiguity in the goal or decision criteria would materially change the result. Preserve the user's scope, chosen tools, and existing authorization.

Keep exact lookups, arithmetic, parsing, date comparisons, and execution in code. Use Jev for the parts that need semantic understanding. It accepts text or JSON and returns typed judgments, not generated prose, code, or reasoning explanations. Convert non-text inputs with an appropriate available tool first.

Choose the question type by what its answer means:

| Need | Primitive | Interpretation |
| --- | --- | --- |
| Select one known candidate | `choice` | Selected key, probabilities, and confidence; include a no-match option when appropriate |
| Judge whether a condition holds | `noul` | Probability of yes; near 0.5 is uncertainty, not medium intensity |
| Measure a described dimension | `score` | Position on ordered descriptive levels, with probabilities and confidence |

Use named state fields and stable source IDs. Write complete questions: question IDs are not sent to the model. Reference relevant fields with backticked paths. Provide concrete, self-contained criteria; split independently useful dimensions while retaining the context needed to judge them. For extraction, find candidate spans first, let Jev select a candidate ID, and copy the original value in code.

Ask independent questions about the same state together, including useful branch-specific questions whose premises are explicit. They cannot see one another's answers. Make another call when an earlier answer is needed to retrieve evidence, build new state, or determine candidate options. Ignore answers on unused branches. Large datasets need deliberate batches; do not silently truncate evidence to fit a request.

## Execute through the bundled helper

Requires Node.js 20 or newer; no npm installation is needed. Resolve `scripts/jev.mjs` relative to this skill's actual directory, not the user's working directory.

Read [the runner reference](references/runner.md) as needed for input shapes, output handling, and CLI options. Assume configuration is ready and execute the task directly. Do not run `config check`, inspect configuration files or environment variables, or load configuration guidance as a routine preflight. The helper reads and validates configuration internally.

Only read [the configuration guide](references/configuration.md) when execution fails with evidence of a configuration or authentication problem, or when the user explicitly asks to configure Jev. Diagnose the specific error before suggesting setup changes; request-format errors, network failures, and rate limits do not by themselves indicate bad configuration.

Construct the task's JSON request and pass it on stdin or with `--input`. Capture stdout as JSON; inspect the exit code before consuming it as a result. Use `--output` when a large response could exceed tool output limits or the user wants a saved result. Use structured process arguments or a safely quoted heredoc; do not interpolate user material into shell code.

The helper handles configuration, request/response validation, bounded retries, and API transport. You own the method and interpretation. Generate extra `.mjs` task code only when preprocessing, loops, or composition warrant it. Do not create a task directory, reusable framework, or new skill for every request. Save scripts or results when requested or operationally useful, in an appropriate task workspace or user-specified location.

## Check and deliver

For a new method applied to a batch, try a small representative subset, including a boundary or no-match case. Inspect the exact input, questions, candidate coverage, and answers before scaling. A plausible pilot is not an accuracy measurement; measured accuracy needs reference answers. Test Chinese and other non-English workloads on their actual language and material.

Treat confidence as a summary of the answer distribution, not proof of truth or permission to act. Set thresholds for the task and consequences; keep uncertain items visible. Separate hard conditions from weighted preferences so a favorable score cannot cancel a disqualifying condition. Low confidence on a harmless preference need not block the task.

Reuse judgments when only weights or presentation change. Rerun when evidence, questions, or candidate meanings change. Keep source locations so the user can inspect results. Explanations come from the agent's reading of evidence, not an invented Jev rationale.

Finish with the requested artifact or answer, relevant evidence, and any unresolved items. Distinguish successful evaluation from missing inputs, invalid requests, and service failures. If the input volume or required calls grow substantially beyond the understood task, estimate the additional work before expanding it. External actions still follow the user's authorized scope.

## Adapt to unfamiliar tasks

Read [composition patterns](references/patterns.md) when designing a method with multiple stages, dimensions, or candidate sets. These are building blocks, not a fixed catalog of supported tasks.

For version-dependent behavior or a new integration pattern, consult the live [documentation index](https://docs.typesafe.ai/llms.txt), [API](https://docs.typesafe.ai/api), and [models](https://docs.typesafe.ai/models). The local helper implements the documented v1 contract. If live docs are inaccessible, state that limitation rather than inventing capabilities.
