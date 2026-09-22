# Compose a method for the task

Use these as ingredients. Adapt the questions and outputs to the user's goal instead of forcing the request into a preset workflow.

## Select and copy

Code finds candidate values or source spans and assigns IDs. A Choice selects an ID or no match. Code copies or normalizes the corresponding original value. Candidate coverage determines what can be found; a missing candidate cannot win. Use existing records, parsing, search, or agent-proposed spans as appropriate, and verify that selected spans exist.

Source: [pre-parsed extraction](https://docs.typesafe.ai/cookbooks/pre_parsed_value_extraction_cookbook).

## Judge dimensions, then combine

Ask independent questions for separately meaningful properties. Use multiple Nouls for labels that can coexist, a Choice for mutually exclusive alternatives, and comparable Scores for graded ranking. Code applies user priorities, weights, and hard conditions. Changing weights does not require new inference when the input and question meanings are unchanged.

For example, identifying work-log items needing intervention may use separate judgments for unresolved blockage, external dependency, current status, and impact. Dates and ownership lookups remain deterministic. Missing information should remain distinct from explicit absence when the distinction affects the decision.

Source: [composite scoring](https://docs.typesafe.ai/patterns/composite-scoring).

## Retrieve, rank, and inspect

Retrieve candidates with available search or code, score relevance using consistent criteria, and inspect the strongest candidates against the actual task. Ranking does not repair poor recall. If richer evidence is retrieved after ranking, a second call can evaluate that new state. Return source locations, not just scores.

Sources: [reranking](https://docs.typesafe.ai/cookbooks/rerank_typesafe), [skill suggestion](https://docs.typesafe.ai/cookbooks/skill_suggestion).

## Verify against evidence

Check exact claims mechanically when possible, then judge support, contradiction, or insufficient evidence in context. Evidence support is not proof that the source itself is true. Preserve claim and source IDs. If a generated explanation is needed, write it from the cited evidence and distinguish it from Jev's typed answer.

Source: [citation checks](https://docs.typesafe.ai/cookbooks/citation_check).

## Branch using judgments

Ask useful branch-specific questions together when their premises can be stated against the same state. Consume only the applicable answers. A second request is useful when an earlier answer determines data to fetch or options to construct, not merely because the next question has a different ID. Tool selection and argument selection do not grant permission to execute the chosen action.

Sources: [speculative fan-out](https://docs.typesafe.ai/patterns/fan-out), [function calling](https://docs.typesafe.ai/cookbooks/function_calling).

## Inspect failures

Look at the exact state, questions, candidates, probabilities, composition, and resulting behavior. Distinguish missing evidence, ambiguous criteria, model mistakes, code mistakes, and service errors. Keep failures and uncertain items visible instead of dropping them from totals. A higher confidence value alone is not evidence that a revised question is more accurate. Use labeled outcomes when comparing methods, including actual target-language examples.
