# Example: Task-Local Identity Panel

Use this example to show how a task-local expert should be introduced when the registry does not contain a needed expert lens.

This example demonstrates a valid task-local expert:

- it represents a real discipline
- it has explicit evaluation criteria
- it has clear reject conditions
- it is not just a project-local label or a renamed existing expert

## Scenario

A SaaS platform currently supports email/password login plus Google SSO for self-serve users. It now wants to support enterprise identity linking across:

- email/password accounts
- Google SSO
- Microsoft Entra ID SSO
- invited guest collaborators

The company also wants to let users merge historical workspaces and preserve access to prior documents, comments, and billing context across identity changes.

Current state:

- user identity is primarily keyed by email address
- account recovery is email-based
- guest invitations can create duplicate account records
- support already handles account-merging incidents manually
- enterprise customers are asking for stricter SSO enforcement and SCIM provisioning next

Business goals:

- reduce duplicate-account friction
- support enterprise SSO expansion
- preserve access continuity when users change auth methods
- avoid account-takeover or silent account-linking failures

Constraints:

- identity migration mistakes would be hard to reverse cleanly
- support cannot absorb a large wave of account-linking incidents
- some workspaces have strict enterprise ownership and offboarding expectations
- the existing registry does not contain a dedicated identity-focused expert

Assessment question:

Should the company add flexible cross-provider account linking now, or first redesign identity ownership, trust transitions, and recovery semantics before enabling account merges across auth methods?

## Why This Uses a Task-Local Expert

The existing registry has nearby experts:

- `security-expert`
- `backend-expert`
- `product-expert`

But none of them cleanly owns identity lifecycle judgment as its own expert discipline. This panel therefore introduces a task-local `identity-expert`.

## Task-Local Expert Definition

### `identity-expert`

Professional lens:

- evaluates identity lifecycle, trust transitions, account linking, recovery safety, and ownership continuity across authentication methods

Decision surface:

- account linking and account merge rules
- identity proof and recovery semantics
- SSO adoption effects on existing user records
- guest-to-member transitions
- offboarding and ownership transfer risk

Required evidence:

- current user and account data model
- account recovery and login flows
- enterprise ownership and offboarding rules
- known duplicate-account and merge incidents
- support escalation patterns for identity issues

Core evaluation criteria:

- safety of account linking
- reversibility of merge mistakes
- resistance to account takeover during auth-method transition
- clarity of ownership when one human has multiple credentials
- supportability of recovery and unlink flows

Critical unknowns:

- whether one email may legitimately correspond to multiple identity authorities
- whether enterprise customers require strict prevention of personal-to-enterprise account merges
- whether unlinking must preserve historical authorship and ownership semantics

Reject conditions:

- reject any design that silently merges accounts based only on email equality
- reject any recovery flow that can grant access across identity authorities without strong proof of continuity
- reject any model where support cannot deterministically unwind a mistaken merge

Non-goals and boundaries:

- does not own generic frontend UX polish
- does not replace `security-expert`; it focuses specifically on identity lifecycle and trust transitions
- does not replace `backend-expert`; it evaluates ownership semantics rather than general service design

## Panel

- chair: frame the decision and synthesize the recommendation
- identity-expert: assess identity lifecycle, linking safety, and ownership continuity
- security-expert: assess account-takeover, trust-boundary, and abuse implications
- backend-expert: assess data-model, service, and consistency implications
- product-expert: assess user friction, enterprise expectations, and rollout value
- qa-expert: assess validation, rollback, and support safety

## Independent Opinions

### Identity Expert

Core judgment:

The company should not launch flexible cross-provider account linking on top of the current email-keyed model. It should first redesign identity ownership and trust transition rules so linking is explicit, reviewable, and reversible.

Evidence basis:

- Known: identity is primarily keyed by email today.
- Known: guest invitations already create duplicate account records.
- Known: support handles merges manually.
- Inferred: a flexible linking rollout now would turn existing identity ambiguity into permanent ownership mistakes.

Confidence:

- High. The main failure modes follow directly from the current identity model.

Reasoning:

- Email equality is not sufficient proof of identity continuity once multiple identity authorities exist.
- Identity systems fail most dangerously at transition boundaries: guest to member, password to SSO, enterprise to personal, active to offboarded.
- Account linking must be treated as an ownership change with recovery consequences, not as a convenience feature layered on top of login.

Preferred path:

- Define a primary identity model independent of raw login method.
- Require explicit, auditable linking actions with strong proof and deterministic unwind paths.
- Delay broad merge flexibility until enterprise ownership and recovery semantics are stable.

Critical unknowns:

- Whether enterprise-managed identities must always dominate personal identities for the same human.
- Whether authorship, billing responsibility, and workspace ownership can diverge during identity transitions.

Reject conditions:

- Reject any linking flow that auto-merges on shared email without stronger proof.
- Reject any design where a mistaken merge cannot be reversed without manual database repair.

### Security Expert

Core judgment:

Cross-provider linking increases account-takeover risk materially unless trust transitions are explicit and strongly authenticated.

Evidence basis:

- Known: recovery is email-based today.
- Known: the platform wants to link identities across providers.
- Inferred: if the recovery model remains weaker than the linking model, attackers will target the weaker path.

Confidence:

- High. Identity-linking systems predictably shift attacker focus toward recovery and edge-case flows.

Reasoning:

- Linking changes the blast radius of a single authentication event.
- If a weakly protected account can be linked to a strongly protected enterprise identity, the whole identity surface inherits the weaker path.
- Security here is not just login strength; it is trust continuity across linking and unlinking events.

Preferred path:

- Strengthen trust-boundary checks before broad linking.
- Require stronger proof for linking than for ordinary login.
- Instrument high-risk identity transitions and make them reviewable.

Critical unknowns:

- Whether current recovery flows meet the proof threshold needed for cross-authority linking.
- Whether support can identify and freeze suspicious link events in time.

Reject conditions:

- Reject any design that treats successful login as sufficient proof for irreversible account merge.

### Backend Expert

Core judgment:

The current email-keyed data model is too weak a foundation for flexible account linking. Identity and credential association need clearer structural separation first.

Evidence basis:

- Known: identity is keyed primarily by email.
- Known: duplicate records already exist.
- Inferred: merge logic on top of this model will entangle ownership, authorship, billing context, and external identity mappings unpredictably.

Confidence:

- High. The structural weakness is already visible in current support incidents.

Reasoning:

- The system needs a stable notion of principal identity distinct from login credentials and invitations.
- Credential mappings, enterprise identity bindings, and workspace roles should not all collapse into one user record assumption.
- Without clearer structure, merge correctness will be hard to prove and harder to unwind.

Preferred path:

- Introduce explicit identity, credential, and membership boundaries.
- Make merge and unlink operations first-class, auditable system behaviors.
- Delay flexible linking until the data model supports safe reversibility.

Critical unknowns:

- Whether existing downstream systems assume one email equals one durable user principal.
- How many subsystems would be affected by separating identity from credential.

Reject conditions:

- Reject any implementation that adds merge logic without redesigning ownership and reversibility at the data-model level.

### Product Expert

Core judgment:

Reducing duplicate-account friction is a real need, but a mistaken identity merge is a much worse product failure than temporary login inconvenience.

Evidence basis:

- Known: duplicate-account friction exists today.
- Known: enterprise customers are asking for stronger SSO behavior.
- Inferred: a bad merge affecting access, authorship, or billing history would damage trust more than the current friction.

Confidence:

- Medium-high. The user-value tradeoff is clear, though the size of the current friction should still be quantified.

Reasoning:

- Identity systems are trust infrastructure, not convenience-only UX.
- The product should optimize for safe continuity first, then lower-friction linking once the foundation is defensible.
- A staged rollout can still solve visible pain, for example by improving duplicate-account detection and guided resolution without broad auto-linking.

Preferred path:

- Improve detection and user guidance first.
- Support narrower high-confidence linking cases before general flexibility.
- Treat enterprise SSO expansion as a reason to become more conservative, not less.

Critical unknowns:

- How often the current friction blocks activation versus merely annoys users.
- Which identity-transition cases actually drive the most support cost.

Reject conditions:

- Reject a roadmap that treats merge convenience as success while ownership ambiguity remains unresolved.

### QA Expert

Core judgment:

Identity linking should be treated as a high-risk migration problem with explicit rollback and forensic requirements.

Evidence basis:

- Known: merge mistakes are hard to reverse.
- Known: support already handles incidents manually.
- Inferred: once linking spans multiple identity authorities, validation complexity will increase sharply.

Confidence:

- High. Identity defects are high-severity and operationally expensive.

Reasoning:

- Validation must cover not just correct merges, but false-positive merge prevention, unlink safety, recovery edge cases, and enterprise offboarding interactions.
- The product needs scenario coverage for invitation collision, provider switch, offboarded user return, and mistaken support intervention.
- Release safety depends on having deterministic rollback for identity state, not just UI rollback.

Preferred path:

- Stage linking behind narrow high-confidence cases.
- Build audit and rollback tooling before broad rollout.
- Require identity-state fixtures and scenario-based validation before enabling more flexible linking rules.

Critical unknowns:

- Whether the team can reproduce identity-transition edge cases realistically.
- Whether rollback can be done safely once data ownership has propagated across subsystems.

Reject conditions:

- Reject any launch where mistaken merge recovery depends mainly on one-off manual intervention.

## Cross-Examination

### Identity Expert Challenges Product Expert

The product view rightly prioritizes user pain, but it risks understating how quickly “small” identity ambiguity becomes permanent ownership damage once linking is enabled.

### Product Expert Responds

That is fair. The product recommendation assumes safe continuity comes first. Friction reduction should be staged through guided resolution, not broad merge automation.

### Security Expert Challenges Backend Expert

The backend redesign is necessary, but not sufficient. Even with a better model, weak trust-transition proof would still make linking unsafe.

### Backend Expert Responds

Agreed. Structural clarity must be paired with stronger link authorization and recovery semantics.

### QA Expert Challenges Everyone

All recommendations depend on whether rollback is truly possible after a mistaken merge. If the answer is no, the rollout threshold should be dramatically stricter.

## Agreement

- The company should not launch broad cross-provider linking on top of the current email-keyed identity model.
- Identity lifecycle and ownership semantics need to be redesigned before flexible merging.
- Enterprise SSO expansion increases the need for stricter linking discipline, not looser convenience flows.
- Reversibility, auditability, and recovery safety are core requirements.

## Disagreement

- The main disagreement is not direction but how much user-friction reduction can safely ship before the deeper redesign is complete.
- The identity and security perspectives are the most conservative because merge mistakes change trust and ownership.
- The product perspective is somewhat more open to staged user-facing improvements before the full redesign, as long as they avoid unsafe auto-linking.

## Recommendation

Recommended path:

Do not enable flexible cross-provider account linking now. First redesign identity ownership, credential association, and trust-transition rules so identity linking becomes an explicit, auditable, and reversible operation. In the interim, reduce duplicate-account friction through detection, guided resolution, and narrow high-confidence linking cases rather than broad merge flexibility.

Why:

- It avoids turning current identity ambiguity into permanent ownership mistakes.
- It keeps enterprise SSO expansion from amplifying account-takeover and offboarding risk.
- It preserves the option to improve user experience without compromising identity integrity.

## Tradeoffs

- Users will continue to experience some friction in the short term.
- The deeper identity redesign costs more than a thin linking layer.
- Certain SSO and migration workflows will ship later.
- In exchange, the company avoids high-severity identity failures that are hard to unwind and expensive to support.

## Confidence and Unknowns

- High confidence that identity linking should be treated as an identity-lifecycle problem, not a convenience feature.
- Medium confidence on how much near-term friction can be reduced safely before the redesign, because that depends on the actual distribution of edge cases.
- The biggest open unknown is how many downstream systems currently assume email equality implies durable identity equality.

## Boundaries

Holds when:

- identity is still keyed primarily by email
- multiple auth authorities now need to coexist
- merge mistakes would be operationally and reputationally expensive

Avoid this recommendation when:

- the system already has explicit identity, credential, and ownership separation
- merge and unlink operations are already auditable and reversible
- current login friction is driven by narrow high-confidence cases that can be safely linked without broad identity redesign
