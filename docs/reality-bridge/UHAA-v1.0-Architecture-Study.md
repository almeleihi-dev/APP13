# Unified Human Action Architecture (UHAA v1.0)

**A relationship-design study between Wegleiter (ET-5.5) and AN ACT (OC-1).**
Not a merge. Not a rewrite. Not an implementation. Architecture only. Neither codebase is modified.

> **Scope honesty.** AN ACT is characterized from its real, audited codebase (OC-1). Wegleiter's internals were not available for this study; it is treated as the **reflection / decision / readiness-guidance** product its name ("wayfinder/guide") and the journey below describe. Every Wegleiter-specific claim is a design assumption to be confirmed against its real architecture before any implementation.

---

## 1. System identity

**Wegleiter — the inner system (who am I, what should I do, am I ready?).**
A guidance space for the *pre-action* human: self-reflection, awareness, decision support, and readiness. Its currency is *insight and intention*. Its posture is private, exploratory, forgiving — a place to be uncertain, change your mind, and not be measured. It **begins** when a person turns inward and **ends** at a formed, owned **intention**.

**AN ACT — the outer system (I have decided; now make it real and accountable).**
An accountable-action operating system. Its currency is *proof and trust*. Its posture is rigorous, tamper-evident, auditable, legally significant. It **begins** when an intention becomes a concrete **Need/Offer** and **ends** at durable **trust and professional reputation** built from executed, evidenced contracts.

**The handoff point (the single seam).**
Responsibility changes **exactly once, in one direction, at "Intention → Action."** Wegleiter owns everything up to and including a formed intention; AN ACT owns everything from the moment that intention is declared as an actionable Need/Offer. That seam is a **consent gate**, not a data pipe: the human explicitly chooses to carry an intention across it. Nothing reflective crosses automatically.

| | Wegleiter | AN ACT |
|---|---|---|
| Domain | Inner: reflection, decision, readiness | Outer: agreement, execution, accountability |
| Currency | Insight, intention | Proof, trust |
| Data posture | Private, mutable, forgettable | Auditable, append-only, durable |
| Emotional contract | "Safe to be uncertain" | "Provable and accountable" |
| Ends at | A formed intention | Durable professional reputation |

---

## 2. The human journey — who participates where

```
 Self-Reflection ─ Awareness ─ Decision ─ Readiness ─ Intention │ Action ─ Agreement ─ Execution ─ Evidence ─ Trust ─ Reputation
 ╰──────────────────── WEGLEITER (authoritative) ─────────────╯ │ ╰──────────────── AN ACT (authoritative) ──────────────────╯
                                                          consent gate ▲ (intention handoff)
```

| Stage | Primary | Secondary / notes |
|---|---|---|
| Self-Reflection | **Wegleiter** | AN ACT absent |
| Awareness | **Wegleiter** | — |
| Decision | **Wegleiter** | — |
| Readiness | **Wegleiter** | may *read* a coarse AN ACT reputation signal (opt-in) to inform readiness |
| Intention | **Wegleiter** | produces the consented handoff object |
| — consent gate — | **Human** | the person, not a system, authorizes crossing |
| Action (Need/Offer) | **AN ACT** | `action.actions` / `experience.customer_requests` |
| Agreement (Contract) | **AN ACT** | contract-engine materialization |
| Execution | **AN ACT** | milestones |
| Evidence | **AN ACT** | `execution.evidence` + object store |
| Trust | **AN ACT** | event-sourced trust engine |
| Reputation | **AN ACT** | published as a read-model Wegleiter may consume |

The only backward flow is a **coarse, published reputation signal** AN ACT → Wegleiter (to inform "readiness"), never raw contracts/evidence. The only forward flow is the **consented intention handoff** Wegleiter → AN ACT.

---

## 3. Data boundaries (privacy by design)

**Owned exclusively by Wegleiter (never leaves):** reflections, journals, emotional states, self-assessments, decision deliberations, doubts, drafts, "roads not taken." This is *pre-decisional* data and is radioactive to accountability systems.

**Owned exclusively by AN ACT (never leaves):** contracts, milestones, evidence artifacts, trust score events, financial ledger entries, complaints/adjudications. This is *legally significant, auditable* data.

**May be shared — narrowly, with consent:**
- Wegleiter → AN ACT: a **consented intention handoff** — a minimal, purpose-built object (e.g., action category, scope, timing, location, notes the user *chooses* to send). Not the reflection that produced it.
- AN ACT → Wegleiter: a **coarse published reputation/readiness signal** (e.g., tier, standing band) — a read-model, not the underlying trust events.

**Must never be shared (hard firewall):** raw reflection/emotional data into AN ACT (would poison the accountable record and chill honest reflection); raw evidence/financial/complaint detail into Wegleiter (would turn a safe space into a surveillance surface). **Reflection must never become evidence; evidence must never become reflection.**

**Design principle:** default-deny between systems; every cross-boundary datum is explicit, minimal, purpose-bound, consented, and one-directional. Privacy is enforced at the boundary, not by policy alone.

---

## 4. Integration models

### Model A — Reflection-First
Wegleiter is the front door; users always enter through reflection and are handed off to AN ACT when ready.
- **+** Natural human order; strong intention quality; Wegleiter drives top-of-funnel.
- **–** Forces reflection on users who just want to transact; couples AN ACT's growth to Wegleiter adoption.

### Model B — Action-First
AN ACT is the front door; Wegleiter is offered as an optional "think before you act / grow after you act" companion.
- **+** AN ACT keeps its independent go-to-market; reflection is value-add, not a gate.
- **–** Under-uses Wegleiter's differentiator; reflection becomes an afterthought.

### Model C — Dual Independent Systems
Two fully separate products, no runtime integration; a human may use both, manually.
- **+** Maximum simplicity, privacy, and independence; zero coupling risk.
- **–** No compounding value; the ecosystem thesis is unrealized; duplicated identity/login friction.

### Model D — Shared Professional Passport
The Professional Passport becomes a shared, jointly-rendered artifact spanning reflective growth and accountable reputation.
- **+** One coherent identity surface; visible bridge between growth and proof.
- **–** Passport authority must be crisply split or it becomes a conflicting-authority hotspot; risk of reflection data bleeding into a public artifact.

### Model E — Event-Driven Integration
Systems stay independent but exchange **domain events** across a boundary (intention-declared → to AN ACT; reputation-updated → to Wegleiter), no shared database.
- **+** Loose coupling; each system scales/evolves independently; clean privacy seams; resilient (async, degrade-independently).
- **–** Eventual consistency; needs event contracts and a bus; more operational parts.

### Model F — Recommended hybrid: **Consent-Gated, Event-Driven, Shared-Identity** (E + D + explicit consent seam)
Shared **identity** (one person, one login) via a federated identity provider; a **consent gate** that turns Wegleiter's intention into a purpose-built handoff to AN ACT; **domain events** carry the two narrow signals; the **Passport** is a *composed read-model* — AN ACT owns the accountable half, Wegleiter contributes a clearly-labeled growth half, neither writes the other's data.
- **+** Best privacy (default-deny + consent), loose coupling, one identity, a shared-yet-safe Passport, independent scaling/evolution.
- **–** Most moving parts to specify (identity federation + event contracts + consent object + Passport composition) — but each part is small and well-bounded.

### Comparison

| Criterion | A Reflection-First | B Action-First | C Dual | D Shared Passport | E Event-Driven | **F Hybrid (rec.)** |
|---|---|---|---|---|---|---|
| Simplicity | Med | Med | **High** | Med | Med | Med-Low |
| Scalability | Med | Med | High | Med | **High** | **High** |
| Privacy | Med | Med | High | Low-Med | High | **Highest** |
| Trust integrity | Med | Med | High | Med | High | **Highest** |
| Maintainability | Med | Med | High | Low-Med | High | High |
| Commercial value | High | Med | Low | Med-High | High | **Highest** |
| Long-term evolution | Med | Med | Low | Med | High | **Highest** |

---

## 5. Communication layer (architecture, no code)

Three complementary channels, each matched to its data's risk profile:

1. **Federated identity (synchronous, standards-based).** One human identity across both products via an identity provider (OIDC-style): each system maps the shared subject to its own local user, but neither reads the other's data. Solves single-login without a shared user database.
2. **Consent-gated handoff (synchronous, request/response, user-initiated).** At "Intention → Action," Wegleiter calls a narrow AN ACT intake with a minimal, user-approved intention object → becomes a Need/Offer. Explicitly triggered by the human; nothing flows without that action.
3. **Domain events over a message bus (asynchronous, one-way each).** AN ACT publishes coarse `reputation.updated` events; Wegleiter subscribes to inform readiness. Each system owns its event contract; consumers degrade independently if the other is down. **No shared database, ever** — the privacy firewall is also a data-store firewall.

An **API gateway** may front both for edge concerns (routing, auth, rate-limiting, audit) but must not merge data planes. Reject: shared DB, shared schema, or synchronous tight coupling on the hot path — they would recreate the conflicting-authority and privacy problems this design exists to prevent.

---

## 6. Governance — authority matrix (no conflicting authority)

Each concern has **exactly one** authoritative system.

| Concern | Authoritative | Other system |
|---|---|---|
| Human identity (shared subject) | **Federated Identity Provider** | both map locally, neither owns the other's profile |
| Reflection / self-assessment | **Wegleiter** | AN ACT has no access |
| Behavior / readiness | **Wegleiter** | may read AN ACT's coarse reputation signal |
| Intention (pre-handoff) | **Wegleiter** | becomes AN ACT's input only after consent |
| Need/Offer, Contracts | **AN ACT** | Wegleiter never writes |
| Execution / Evidence | **AN ACT** | Wegleiter never sees raw evidence |
| Trust | **AN ACT** | publishes coarse signal only |
| Financial records | **AN ACT** | never exposed to Wegleiter |
| Professional reputation | **AN ACT** (accountable half) | Wegleiter renders a labeled growth half in a composed Passport, without owning AN ACT's data |

Rule: authority is singular and non-overlapping; the Passport is the only *shared surface*, and it is a **composition of two independently-owned read-models**, not shared ownership of one dataset.

---

## 7. Unified vision — one Human Action Ecosystem

Not two products, not one app: a **Human Action Ecosystem** with two organs joined at a single consented seam. Wegleiter governs the **inner journey** (becoming ready and deciding); AN ACT governs the **outer journey** (acting accountably and building provable trust). Together they cover the whole arc from *"who am I and what should I do?"* to *"here is the proof of what I did and the reputation I earned."*

**The problem it uniquely solves.** Today, reflection tools don't produce accountable outcomes, and accountability/marketplace tools don't help people arrive at good, owned decisions. UHAA connects *intention* to *accountable action* while keeping each side true to its nature.

**Why separating reflection from accountable action is stronger than one combined app.**
1. **Privacy & psychological safety.** Reflection needs a space where you can be uncertain and change your mind. If reflection data could ever become evidence, honest reflection dies. Separation is an ethical firewall, not just a technical one.
2. **Trust integrity.** AN ACT's value is a minimal, tamper-evident, auditable core. Mixing in soft, mutable reflection data would dilute exactly what makes trust credible.
3. **Different data physics.** Reflection data is mutable and forgettable (privacy, right-to-be-forgotten); accountable data is append-only and durable (audit). One store cannot honor both truthfully.
4. **Independent evolution & blast radius.** Two bounded systems evolve, scale, and fail independently; a fault or breach in one does not compromise the other.
5. **Commercial clarity.** Two coherent value propositions that compound — reflection improves the quality of action; accountable outcomes deepen self-knowledge — without either becoming a confused super-app.

The whole is greater than the sum **because** the parts stay distinct: the consent gate is where human agency lives, and keeping it human-controlled is the source of both trust and dignity in the ecosystem.

---

## Risks

- **Boundary erosion.** Pressure to "just share a bit more" across the seam. *Mitigation:* default-deny, minimal consented objects, periodic boundary audits.
- **Conflicting authority creep** (esp. the Passport). *Mitigation:* the authority matrix; Passport as composed read-models, never shared ownership.
- **Identity federation complexity.** *Mitigation:* standards-based IdP; start with SSO only, add claims later.
- **Wegleiter assumptions unverified.** This study assumes Wegleiter's role; some models may not fit its real architecture. *Mitigation:* validate against Wegleiter's actual system before implementation.
- **Eventual-consistency confusion** (reputation signal lag). *Mitigation:* treat cross-system signals as advisory, never as authority.
- **Over-integration.** Building F's full surface prematurely. *Mitigation:* the phased roadmap below — earn each layer.

## Recommended architecture

**Model F — Consent-Gated, Event-Driven, Shared-Identity.** It maximizes privacy and trust integrity (the two non-negotiables), keeps both systems loosely coupled and independently evolvable, and still delivers the compounding ecosystem value via one identity, a safe consented handoff, and a composed Passport.

## Evolution roadmap (architecture only — no implementation)

1. **Phase 0 — Contracts & confirmation.** Validate Wegleiter's real architecture against this study; ratify the authority matrix and data boundaries; freeze the two cross-boundary contracts (intention handoff, reputation signal).
2. **Phase 1 — Shared identity.** Federated login only (one human, two mapped local users). No data sharing yet.
3. **Phase 2 — Consent-gated handoff.** Wegleiter → AN ACT intention intake, human-initiated, minimal object. One-directional, forward only.
4. **Phase 3 — Reputation signal.** AN ACT → Wegleiter coarse `reputation.updated` events over a bus; advisory only.
5. **Phase 4 — Composed Passport.** Jointly-rendered Passport from two independently-owned read-models, each half clearly labeled and owned.
6. **Phase 5 — Ecosystem hardening.** Boundary audits, privacy attestations, independent scaling/DR per system.

Each phase is independently valuable and reversible; stop at any phase and both systems remain whole.

## Final recommendation

Adopt **Model F** as the target architecture and proceed **only through Phase 0** next: confirm Wegleiter's real architecture and ratify the boundaries/contracts. Do not begin any implementation until the architecture is approved. The defining decision of UHAA is not technical but principled — **keep reflection and accountable action separate, joined only by a human-controlled consent gate** — because that separation is precisely what makes both trustworthy.

*Architecture study only. No code produced. Neither Wegleiter nor AN ACT modified. Awaiting approval.*
