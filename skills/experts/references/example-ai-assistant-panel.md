# Example: AI Assistant Panel

Use this example when you want a reference that exercises `ml-expert`, `search-expert`, `privacy-expert`, `mobile-expert`, and `platform-expert` on a modern product decision involving retrieval and LLM behavior.

## Scenario

A productivity app wants to launch an AI assistant that answers user questions across notes, tasks, meeting transcripts, and uploaded documents.

Current state:

- mobile apps are heavily used, especially during travel and weak-network conditions
- search today is basic keyword retrieval over titles and note bodies
- uploaded documents and transcripts are stored, but chunking and retrieval infrastructure do not exist yet
- the company has a small platform team and no dedicated ML platform group
- leadership wants a launch in two quarters with clear user-visible differentiation

Business goals:

- improve answer speed for “where did we decide this?” and “summarize what changed” workflows
- increase retention among power users by making stored knowledge easier to use
- create a premium feature tier around AI assistance
- avoid launching a system that feels magical in demos but unreliable in daily work

Constraints:

- many users access the app from mobile under inconsistent connectivity
- some workspaces contain sensitive internal documents
- the company cannot support a large annotation operation for manual evaluation
- the team can ship one serious platform investment, but not three loosely coordinated ones

Assessment question:

Should the company launch quickly with a general-purpose LLM assistant over broad workspace retrieval, or first constrain the product around narrower retrieval-backed workflows with stronger search quality, privacy controls, mobile degradation paths, and evaluation discipline?

## Panel

- chair: frame the decision and synthesize the recommendation
- ml-expert: assess model behavior, evaluation discipline, and inference risk
- search-expert: assess retrieval quality, query semantics, and ranking behavior
- privacy-expert: assess data-use boundaries, workspace sensitivity, and user expectations
- mobile-expert: assess degraded behavior, latency, and mobile experience constraints
- platform-expert: assess whether the team can support the required internal capabilities sustainably
- product-expert: assess what version of the assistant is actually valuable and shippable
- qa-expert: assess validation, rollout, and regression safety

## Independent Opinions

### ML Expert

Core judgment:

The company should not launch a broad “answer anything in your workspace” assistant first. It should begin with narrower retrieval-backed workflows whose success and failure can be evaluated against concrete user tasks.

Evidence basis:

- Known: retrieval infrastructure is immature today.
- Known: leadership wants visible differentiation on a short timeline.
- Known: the company cannot support a large manual labeling program.
- Inferred: a broad assistant would create large apparent capability with weak evaluation discipline, making it hard to separate model failure from retrieval and product failure.

Confidence:

- High. The evaluation and reliability problem follows directly from the proposed launch shape.

Reasoning:

- Broad assistant positioning tends to create implicit promises of correctness the system cannot consistently meet.
- Without task-bounded evaluation, the product will optimize for demos and anecdotal success rather than repeatable workflow value.
- The first version should focus on a few workflows such as retrieval-grounded answer with citations, change summaries over known scopes, and meeting recap over recent documents.

Preferred path:

- Define narrow assistant jobs with explicit acceptance criteria.
- Require citation-backed or provenance-backed output where possible.
- Treat model behavior, retrieval quality, and fallback rules as one system, not separate implementation concerns.

Critical unknowns:

- Whether users primarily want synthesis, precise answer retrieval, or drafting help.
- Whether the chosen model stack can meet mobile latency and cost goals for the target workflows.

Reject conditions:

- Reject a launch framed around general workspace intelligence without task-grounded evaluation and bounded failure expectations.
- Reject any architecture that hides weak retrieval behind a stronger model and hopes prompting will compensate.

### Search Expert

Core judgment:

Retrieval quality is the limiting factor. The company should improve query understanding, chunking, ranking, and citation behavior before promising a broad assistant.

Evidence basis:

- Known: current search is basic keyword retrieval.
- Known: documents and transcripts are heterogeneous and not yet retrieval-ready.
- Inferred: broad assistant behavior over weak retrieval will produce confidently phrased but poorly grounded answers.

Confidence:

- High. Retrieval immaturity is a direct constraint here.

Reasoning:

- Workspace assistants are only as good as their ability to find the right evidence under realistic query phrasing.
- Documents, transcripts, notes, and tasks have different granularity and freshness patterns; retrieval over them needs intentional indexing and ranking, not one generic store.
- The product should distinguish “find the answer,” “find the source,” and “summarize the relevant set,” because they optimize differently.

Preferred path:

- Build retrieval around a narrow set of document types and query intents first.
- Invest in chunking, metadata, ranking, and citation quality before broadening assistant claims.
- Measure retrieval separately from generation so failures remain diagnosable.

Critical unknowns:

- Which user intents dominate: known-item lookup, exploratory search, or synthesis over many artifacts.
- How much metadata quality exists today for document freshness, authorship, and workspace scope.

Reject conditions:

- Reject any assistant launch without explicit retrieval evaluation on real workspace tasks.
- Reject designs that collapse ranking, filtering, and generation into one opaque quality claim.

### Privacy Expert

Core judgment:

A workspace assistant is privacy-sensitive by default and should launch with narrow data-use boundaries, explicit workspace scoping, and conservative retention of prompts, citations, and derived artifacts.

Evidence basis:

- Known: some workspaces contain sensitive internal documents.
- Known: the product will connect many data types into one assistant surface.
- Inferred: users may tolerate search over their workspace but react differently to cross-document synthesis, background indexing, and prompt retention.

Confidence:

- Medium-high. Exact privacy posture depends on product details, but the sensitivity shift is already clear.

Reasoning:

- An assistant changes not only access but perception. The system can make latent data relationships visible in ways users may not expect.
- Privacy risk is not limited to model vendors; it also includes internal retention, secondary use, and workspace boundary leakage.
- The product should be explicit about what is indexed, when, for which workspace scope, and whether user prompts or generated answers are retained for improvement.

Preferred path:

- Start with strict workspace scoping and conservative retention defaults.
- Separate product functionality from training or improvement data collection.
- Avoid indexing or synthesizing sensitive classes of content until policy and controls are explicit.

Critical unknowns:

- Which content classes users expect to be searchable versus assistant-usable.
- Whether the company plans to retain prompts and completions for debugging or model improvement.

Reject conditions:

- Reject any launch that silently expands data use beyond obvious search behavior.
- Reject designs that cannot explain workspace scoping, retention, and improvement-data boundaries in plain language.

### Mobile Expert

Core judgment:

The mobile experience should be treated as a first-class design constraint, not a later adaptation of the web assistant.

Evidence basis:

- Known: mobile usage is heavy and often happens under weak connectivity.
- Known: leadership wants strong user-visible differentiation.
- Inferred: if the assistant assumes low latency, large context, and stable network access, the mobile experience will feel slow, brittle, and battery-hostile.

Confidence:

- High. The mobile constraints are directly stated.

Reasoning:

- Mobile assistant usage often happens in fragmented sessions, during context switching, and under degraded network conditions.
- Long streaming outputs, repeated retries, and heavy context fetches can feel acceptable on desktop and unacceptable on mobile.
- The product should decide upfront what happens when retrieval is partial, connectivity drops, or model latency exceeds the interaction budget.

Preferred path:

- Design a mobile-first assistant subset around short answer retrieval, recent context, and clear degraded behavior.
- Treat citations, loading states, retry semantics, and offline fallback as core product design.
- Avoid shipping a mobile surface that mirrors desktop ambition without mobile constraints.

Critical unknowns:

- The real acceptable latency budget for top mobile tasks.
- Whether users need assistant results while offline or only graceful failure and recovery.

Reject conditions:

- Reject a launch where mobile behavior is effectively “same as web, but slower.”
- Reject experiences that depend on large uninterrupted sessions or repeated network retries to feel trustworthy.

### Platform Expert

Core judgment:

The company should make one deliberate platform investment around retrieval and inference plumbing, but it should avoid building a general internal AI platform before product fit is proven.

Evidence basis:

- Known: there is a small platform team and no dedicated ML platform group.
- Known: the company can support one serious platform investment, not several.
- Inferred: without discipline, the assistant project could trigger parallel platform work in chunking, indexing, prompt orchestration, evaluation, monitoring, and vendor abstraction.

Confidence:

- High. The organizational constraint is explicit and materially changes the right architecture.

Reasoning:

- A product team can ship too little platform and drown in ad hoc implementation, or build too much platform and stall product learning.
- The right move is to create one narrow paved road for retrieval-backed assistant workflows rather than a universal AI substrate.
- The platform boundary should be drawn around repeated capabilities already needed by the first assistant jobs.

Preferred path:

- Build a narrow internal capability for document preparation, retrieval, citation handling, and model invocation with observability.
- Keep escape hatches for product iteration.
- Delay vendor abstraction layers and general orchestration frameworks until repeated product demand justifies them.

Critical unknowns:

- How many future assistant features are genuinely likely versus speculative.
- Whether the first shipped workflows share enough infrastructure to justify a reusable paved road.

Reject conditions:

- Reject a broad internal AI platform effort without proven repeated demand from concrete assistant jobs.
- Reject product implementations that duplicate retrieval and inference plumbing in every feature team.

### Product Expert

Core judgment:

The first assistant should be sold as a narrow, trustworthy workflow accelerator rather than an all-purpose knowledge oracle.

Evidence basis:

- Known: the company wants differentiation and premium value.
- Known: reliability matters more than demo magic in daily workflow products.
- Inferred: a narrower assistant can still be highly valuable if it clearly solves recurring retrieval and summarization tasks.

Confidence:

- Medium-high. The logic is strong, though exact positioning should still be validated against customer demand.

Reasoning:

- Premium AI value comes from trust and repeat utility, not only breadth of claims.
- Users are more likely to pay for “answers with sources” and “summaries over known scopes” than for vague assistant intelligence that sometimes goes wrong.
- A narrower launch also creates a cleaner story for privacy, mobile behavior, and evaluation.

Preferred path:

- Launch two or three assistant jobs with clear scopes and visible provenance.
- Price the feature around trustworthy workflow acceleration, not generalized intelligence.
- Expand only after the first workflows show strong repeated use and acceptable failure rates.

Critical unknowns:

- Which assistant tasks users will repeat weekly rather than demo once.
- How much citation and provenance users need to trust the feature enough to pay for it.

Reject conditions:

- Reject positioning that implies general reliability the system cannot yet support.

### QA Expert

Core judgment:

The rollout should be staged around task-specific evaluation and traceable failures, not broad beta excitement.

Evidence basis:

- Known: there is no large manual labeling operation available.
- Known: the proposed system spans retrieval, generation, mobile experience, and sensitive data boundaries.
- Inferred: if failures are not structured and attributable, the team will learn too slowly to improve safely.

Confidence:

- High. The complexity of the system demands disciplined evaluation.

Reasoning:

- Assistant quality is multi-dimensional: retrieval correctness, citation quality, answer usefulness, latency, privacy boundary compliance, and mobile behavior.
- The team needs scenario-based evaluation, representative task sets, and rollout gating tied to real failure categories.
- Safety here means not only avoiding catastrophic output, but also avoiding a product that trains users to mistrust the system.

Preferred path:

- Define task-based evaluation sets for the first workflows.
- Instrument retrieval and answer traces so product, search, and ML failures can be separated.
- Roll out gradually with clear rollback criteria tied to trust-damaging failure modes.

Critical unknowns:

- Whether the team can capture enough representative tasks without a formal annotation program.
- Whether support and product telemetry can be structured enough to distinguish failure classes after launch.

Reject conditions:

- Reject any launch where success is measured mainly by engagement while failure classes remain opaque.

## Cross-Examination

### Search Expert Challenges ML Expert

The ML framing is correct, but it still risks centering generation too early. In this product, retrieval quality may matter more than model sophistication for the first year.

### ML Expert Responds

Agreed. That is why the recommendation is workflow-bounded and retrieval-backed. The model should amplify a good retrieval system, not compensate for a weak one.

### Privacy Expert Challenges Product Expert

The narrow-product framing is strong, but premium positioning can still create pressure to expand data use quietly over time. The launch plan should explicitly state what the assistant does not access by default.

### Product Expert Responds

That is fair. Clear non-access and non-retention boundaries are part of the product promise, not just legal support text.

### Mobile Expert Challenges Platform Expert

The paved-road idea is directionally right, but platform scope must not assume desktop-first latency and context budgets. If the internal capability is designed around heavy retrieval and long streaming, mobile will inherit a poor foundation.

### Platform Expert Responds

Agreed. Mobile constraints should be part of the first platform contract, not a downstream adapter problem.

### QA Expert Challenges Everyone

All recommendations still depend on choosing a few first-class tasks. If that choice is vague, every other discipline will be forced to optimize for a moving target.

## Agreement

- The company should not launch a broad “answer anything in your workspace” assistant first.
- Retrieval quality and evaluation discipline must mature before broad assistant claims are credible.
- Privacy boundaries and workspace scoping need to be explicit from day one.
- Mobile degraded behavior is a product requirement, not an optimization.
- One narrow platform investment is justified, but a broad AI platform build is premature.

## Disagreement

- The main disagreement is how much platform work should precede launch and how ambitious the first assistant jobs can be.
- The search and ML perspectives agree on narrowing scope, but differ on whether the primary bottleneck is retrieval maturity or evaluation maturity.
- The platform perspective wants one reusable capability early, while the product perspective is more concerned about avoiding invisible platform overbuild.
- The privacy perspective is specifically concerned that premium pressure could gradually widen data use beyond the initial narrow promise.

## Recommendation

Recommended path:

Do not launch a general-purpose workspace assistant in two quarters. First ship a narrowly scoped, retrieval-backed assistant focused on a few high-frequency workflows such as answer with citations over recent workspace content and bounded summaries over clearly defined document sets. Pair that with explicit privacy boundaries, mobile-specific degraded behavior, task-based evaluation, and one narrow internal platform capability for retrieval, citations, and observable model invocation.

Why:

- It creates a product users can trust repeatedly rather than a broad assistant that is hard to evaluate and hard to explain.
- It aligns with the team's staffing and platform constraints.
- It allows the company to learn which assistant jobs truly deserve deeper investment.

## Tradeoffs

- The company gives up a broader AI narrative in the first release.
- Some leadership-visible demo breadth will be deferred.
- The team must invest in retrieval, evaluation, and product scoping before claiming broad assistant capability.
- In exchange, the launch has a better chance of becoming a durable premium workflow rather than a short-lived novelty feature.

## Confidence and Unknowns

- High confidence that a narrow retrieval-backed launch is safer and more defensible than a broad general assistant.
- Medium confidence on exactly which workflows should be first, because that depends on real user demand and existing content quality.
- The biggest open unknown is whether the current corpus and metadata quality are good enough to support trustworthy retrieval for the target jobs without a larger-than-expected platform effort.

## Boundaries

Holds when:

- retrieval quality is currently immature
- users access the product heavily from mobile and weak-network contexts
- workspace content includes sensitive internal information
- the team can invest in one meaningful platform capability but not a large generalized AI substrate

Avoid this recommendation when:

- the company already has strong retrieval quality, evaluation loops, and explicit privacy controls in place
- the first assistant workflows are already narrow, observable, and task-bounded
- mobile usage is not strategically important for assistant adoption
