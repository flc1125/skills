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
- Add `qa-expert` when validation depth or failure analysis matters.
- If no listed role fits, create a task-local expert with a precise name and remit.
- Avoid adding an expert unless that expert has a plausible reason to disagree with at least one other seat.

## Tag Vocabulary

Use tags from these groups so future expert cards plug in naturally:

- panel tags: `chair`, `moderation`, `synthesis`, `specialist`
- decision tags: `architecture`, `frontend`, `backend`, `product`, `security`, `privacy`, `performance`, `data`, `devops`, `platform`, `mobile`, `search`, `payments`, `compliance`, `ml`, `qa`
- outcome tags: `recommendation`, `tradeoffs`, `risk`, `validation`
