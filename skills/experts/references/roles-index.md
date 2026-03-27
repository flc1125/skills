# Roles Index

Read this file first. Then open only the role cards that match the assessment.

## Registry

| Role | Primary Tags | Load When | Reference |
| --- | --- | --- | --- |
| `chair` | `chair`, `moderation`, `synthesis`, `decision-support` | Every panel needs one chair to frame the question and synthesize the recommendation | [role-chair.md](role-chair.md) |
| `architect` | `architecture`, `systems`, `boundaries`, `tradeoffs` | The problem touches system shape, interfaces, coupling, or long-term design | [role-architect.md](role-architect.md) |
| `frontend-expert` | `frontend`, `ux`, `interaction`, `delivery-surface` | The decision materially affects UI architecture, client behavior, or user interaction quality | [role-frontend-expert.md](role-frontend-expert.md) |
| `backend-expert` | `backend`, `services`, `apis`, `reliability` | The decision changes service contracts, backend flow, consistency, or operational reliability | [role-backend-expert.md](role-backend-expert.md) |
| `product-expert` | `product`, `user-value`, `prioritization`, `scope` | The decision changes user impact, value, workflow, or requirement tradeoffs | [role-product-expert.md](role-product-expert.md) |
| `security-expert` | `security`, `threat-modeling`, `abuse-cases`, `risk` | The decision affects trust boundaries, permissions, secrets, or attack surface | [role-security-expert.md](role-security-expert.md) |
| `privacy-expert` | `privacy`, `data-minimization`, `consent`, `retention` | The decision affects personal data collection, use, retention, sharing, or user control | [role-privacy-expert.md](role-privacy-expert.md) |
| `performance-expert` | `performance`, `latency`, `scale`, `efficiency` | The decision may affect responsiveness, throughput, cost, or scaling behavior | [role-performance-expert.md](role-performance-expert.md) |
| `data-expert` | `data`, `schema`, `governance`, `analytics` | The decision affects data models, lineage, quality, privacy, or analytical correctness | [role-data-expert.md](role-data-expert.md) |
| `devops-expert` | `devops`, `delivery`, `operations`, `platform` | The decision changes deployment shape, rollout safety, observability, or day-2 operations | [role-devops-expert.md](role-devops-expert.md) |
| `platform-expert` | `platform`, `developer-experience`, `enablement`, `internal-systems` | The decision affects shared engineering capabilities, internal product boundaries, or developer leverage | [role-platform-expert.md](role-platform-expert.md) |
| `mobile-expert` | `mobile`, `offline`, `device-constraints`, `app-lifecycle` | The decision materially affects native app behavior, mobile UX, or device-level constraints | [role-mobile-expert.md](role-mobile-expert.md) |
| `search-expert` | `search`, `retrieval`, `ranking`, `indexing` | The decision affects recall, ranking quality, query semantics, or index design | [role-search-expert.md](role-search-expert.md) |
| `payments-expert` | `payments`, `billing`, `ledger`, `settlement` | The decision affects money movement, billing correctness, reconciliation, or financial failure handling | [role-payments-expert.md](role-payments-expert.md) |
| `compliance-expert` | `compliance`, `controls`, `auditability`, `regulatory` | The decision changes policy obligations, evidence requirements, or regulated operating constraints | [role-compliance-expert.md](role-compliance-expert.md) |
| `ml-expert` | `ml`, `model-behavior`, `evaluation`, `inference` | The decision affects model quality, evaluation discipline, inference behavior, or ML system risk | [role-ml-expert.md](role-ml-expert.md) |
| `itinerary-expert` | `travel`, `routing`, `pace`, `itinerary-design` | The decision affects route structure, daily pacing, transfer efficiency, or sequencing of a trip | [role-itinerary-expert.md](role-itinerary-expert.md) |
| `budget-travel-expert` | `travel`, `budget`, `cost-structure`, `value` | The decision affects total trip cost, hidden expenses, cancellation exposure, or value-for-money tradeoffs | [role-budget-travel-expert.md](role-budget-travel-expert.md) |
| `travel-risk-expert` | `travel`, `risk`, `entry-rules`, `disruption` | The decision affects safety, entry requirements, disruption risk, health readiness, or itinerary fragility | [role-travel-risk-expert.md](role-travel-risk-expert.md) |
| `family-travel-expert` | `travel`, `family`, `group-dynamics`, `trip-resilience` | The decision affects family-wide suitability, child or elder burden, supervision complexity, or mixed-age trip resilience | [role-family-travel-expert.md](role-family-travel-expert.md) |
| `local-transport-expert` | `travel`, `transport`, `local-mobility`, `last-mile` | The decision depends on local transit realism, transfer burden, station friction, or regional movement practicality | [role-local-transport-expert.md](role-local-transport-expert.md) |
| `experience-curator` | `travel`, `experience-design`, `cultural-fit`, `trip-character` | The decision depends on experiential coherence, atmosphere, destination fit, or the overall quality of time allocation | [role-experience-curator.md](role-experience-curator.md) |
| `destination-culture-expert` | `travel`, `culture`, `local-context`, `sense-of-place` | The decision depends on local cultural understanding, place-specific priorities, landmark meaning, or which experiences best represent a destination | [role-destination-culture-expert.md](role-destination-culture-expert.md) |
| `information-discovery-expert` | `information`, `discovery`, `source-mapping`, `coverage-seeding` | The decision depends on where to look first, how to expand the source pool, and how to avoid missing important sources early | [role-information-discovery-expert.md](role-information-discovery-expert.md) |
| `source-verification-expert` | `information`, `verification`, `source-chain`, `authenticity` | The decision depends on whether reported information is real, well-sourced, and traceable to defensible original evidence | [role-source-verification-expert.md](role-source-verification-expert.md) |
| `recency-expert` | `information`, `recency`, `timeliness`, `update-state` | The decision depends on whether the information is current, whether newer developments supersede it, or whether old facts are being misapplied | [role-recency-expert.md](role-recency-expert.md) |
| `coverage-analyst` | `information`, `coverage`, `blind-spots`, `source-diversity` | The decision depends on whether important source classes, geographies, stakeholder views, or evidence categories are missing | [role-coverage-analyst.md](role-coverage-analyst.md) |
| `signal-vs-noise-analyst` | `information`, `signal`, `priority`, `materiality` | The decision depends on separating genuinely decision-relevant developments from hype, repetition, and low-value noise | [role-signal-vs-noise-analyst.md](role-signal-vs-noise-analyst.md) |
| `qa-expert` | `qa`, `validation`, `failure-modes`, `testability` | The decision needs stronger validation, acceptance criteria, or regression thinking | [role-qa-expert.md](role-qa-expert.md) |

## Selection Rules

- Choose exactly one `chair`.
- Choose experts with distinct lenses.
- Prefer two to six experts plus the `chair`.
- Add `architect` when design boundaries or technical shape matter.
- Add `frontend-expert` when browser UX, rendering, state, or client-side failure modes matter.
- Add `backend-expert` when service contracts, consistency, or reliability matter.
- Add `product-expert` when user value, scope, or prioritization matter.
- Add `security-expert` when misuse or trust boundaries matter.
- Add `privacy-expert` when data collection, user control, retention, or secondary use are part of the decision.
- Add `performance-expert` when scale, latency, or cost efficiency matter.
- Add `data-expert` when schemas, analytics, lineage, or privacy constraints matter.
- Add `devops-expert` when rollout risk, observability, operations, or platform complexity matter.
- Add `platform-expert` when shared tooling, internal developer workflows, or enablement boundaries matter.
- Add `mobile-expert` when offline behavior, device constraints, app lifecycle, or app-store realities matter.
- Add `search-expert` when recall, precision, ranking, or indexing quality materially changes the answer.
- Add `payments-expert` when billing, ledger correctness, reconciliation, or irreversible money movement matter.
- Add `compliance-expert` when controls, audit evidence, certifications, or regulatory obligations materially constrain the solution.
- Add `ml-expert` when model quality, evaluation rigor, prompt behavior, or inference cost and risk matter.
- Add `itinerary-expert` when trip pacing, transfer efficiency, route sequence, or day-structure quality materially changes the answer.
- Add `budget-travel-expert` when total cost, hidden travel expenses, cancellation exposure, or value tradeoffs materially change the answer.
- Add `travel-risk-expert` when safety, entry rules, disruption risk, weather fragility, health constraints, or scam exposure materially change the answer.
- Add `family-travel-expert` when the trip includes children, older adults, caregivers, or mixed-age constraints that materially change plan quality.
- Add `local-transport-expert` when station access, local transit realism, last-mile burden, or regional movement practicality materially changes the answer.
- Add `experience-curator` when several plans are operationally workable and the real question is which one creates the strongest overall trip.
- Add `destination-culture-expert` when the real question is what most meaningfully represents a place, which stops are culturally high-yield, or how to avoid shallow checklist tourism.
- Add `information-discovery-expert` when the main challenge is where to look, how to widen the source pool, or how to avoid missing important source classes early.
- Add `source-verification-expert` when authenticity, source-chain integrity, quote reliability, or original-source traceability materially changes the answer.
- Add `recency-expert` when the latest state matters and stale information, superseded reports, or update timing materially changes the answer.
- Add `coverage-analyst` when the panel needs to detect blind spots across source types, regions, languages, stakeholders, or evidence classes.
- Add `signal-vs-noise-analyst` when the real challenge is deciding which developments are materially important rather than merely visible or viral.
- Add `qa-expert` when validation depth or failure analysis matters.
- If no listed role fits, create a task-local expert with a precise name and remit by following [task-local-expert-template.md](task-local-expert-template.md).
- Avoid adding an expert unless that expert has a plausible reason to disagree with at least one other seat.
- Do not create a task-local expert unless it represents a real expert discipline with its own decision criteria and reject conditions.
- Do not use task-local experts to smuggle in implementation steps, project-local labels, or duplicate versions of existing cards.
- A task-local expert must state explicit non-goals and why an existing expert card is insufficient.

## Tag Vocabulary

Use tags from these groups so future expert cards plug in naturally:

- panel tags: `chair`, `moderation`, `synthesis`, `specialist`
- decision tags: `architecture`, `frontend`, `backend`, `product`, `security`, `privacy`, `performance`, `data`, `devops`, `platform`, `mobile`, `search`, `payments`, `compliance`, `ml`, `travel`, `budget`, `risk`, `family`, `transport`, `experience-design`, `culture`, `information`, `discovery`, `verification`, `recency`, `coverage`, `signal`, `qa`
- outcome tags: `recommendation`, `tradeoffs`, `risk`, `validation`

## Task-Local Expert Rules

Use a task-local expert only when all of these are true:

- the panel needs a real expert lens that is missing from the registry
- the missing lens has distinct evaluation criteria
- the expert would plausibly disagree with another seat on substantive grounds
- the expert can be described without referencing one specific project task or implementation step

Before creating one, check whether the need is actually:

- a narrower version of `product-expert`
- a deeper version of `backend-expert`, `data-expert`, or `security-expert`
- a privacy or policy concern already covered by `privacy-expert` or `compliance-expert`
- a search or retrieval concern already covered by `search-expert`
- a mobile or device constraint already covered by `mobile-expert`
- a billing or financial correctness concern already covered by `payments-expert`
- an ML behavior or evaluation concern already covered by `ml-expert`
- a trip-structure concern already covered by `itinerary-expert`
- a total-cost concern already covered by `budget-travel-expert`
- a travel-safety or entry concern already covered by `travel-risk-expert`
- a family-group suitability concern already covered by `family-travel-expert`
- a local movement concern already covered by `local-transport-expert`
- an experiential quality concern already covered by `experience-curator`
- a local cultural interpretation or destination-priority concern already covered by `destination-culture-expert`
- an information-finding problem already covered by `information-discovery-expert`
- an authenticity or source-chain problem already covered by `source-verification-expert`
- a timeliness or update-state problem already covered by `recency-expert`
- a completeness or blind-spot problem already covered by `coverage-analyst`
- a materiality or hype-filtering problem already covered by `signal-vs-noise-analyst`
- a platform or operational concern already covered by `platform-expert` or `devops-expert`
- a validation concern already covered by `qa-expert`

If any of those are true, prefer the existing card.
