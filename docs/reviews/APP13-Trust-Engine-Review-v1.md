# APP13 Trust Engine — Review v1

**Version:** 1.0  
**Status:** Review findings  
**Last updated:** June 19, 2026  
**Subject:** [APP13 Trust Engine v1](../APP13-Trust-Engine-v1.md)  
**Reviewer scope:** Missing entities, events, circular dependencies, manipulation vectors, constitutional alignment, MVP consistency, edge cases, abuse scenarios, corrections

---

## Executive summary

Trust Engine v1 is a **substantial constitutional specification** — event-sourced, explainable, aligned with Approval Addendum weights (30/30/20/10/10), and correctly enforcing **no pre-adjudication complaint penalty**. It is the strongest trust design document in the APP13 corpus to date.

However, it **depends on entities and events not yet defined** in Entity Model v1, contains **double-penalty risk** across Complaints and Execution components, has **event naming drift** from the Action-Contract-Trust chain, and leaves **client-side abuse unmitigated in MVP** while provider score remains publicly visible during disputes.

**Overall assessment:**

| Area | Rating | Summary |
|------|--------|---------|
| Formula design | Good | Approved weights; clear component breakdown |
| Event sourcing model | Good | Append-only; explainability intent clear |
| Constitutional alignment | Partial | Laws 13–14 under-specified; Laws 10–12 unmapped |
| Entity readiness | Weak | Attestation, CustomerEvaluation, Verification absent |
| Cross-doc consistency | Partial | Event names, dispute_hold trigger, execution_score diverge |
| Anti-manipulation (MVP) | Moderate | Provider vectors partially covered; client vectors deferred |
| Abuse resistance | Moderate | Collusion and eval gaming gaps for MVP |

**Recommendation:** Do **not** implement scoring logic until P0 items are resolved in Trust Engine v1.1 and Entity Model v1.1. The formula is usable; the **event contract and entity bindings** are not yet implementation-ready.

---

## 1. Missing entities

Entities required by Trust Engine v1 but **absent or incomplete** in [Entity Model v1](../APP13-Entity-Model-v1.md) and architecture specs.

| Entity | Trust Engine dependency | Gap severity |
|--------|-------------------------|:------------:|
| **Attestation** | Execution component derives from per-dimension `FUL/SUF/PAR/UNF`; events `attestation.fulfilled`, `attestation.unfulfilled` | **Critical** |
| **CustomerEvaluation** | Evaluation component (10%); `evaluation.submitted`, `evaluation.poor` | **Critical** |
| **Verification** | Verification component; tier expiry, approval history | **Critical** |
| **Credential** | `credential_score` in verification formula | **Critical** |
| **Adjudication** | Complaint penalty payload (severity, per-dimension findings) at close | **Important** |
| **trust_score_snapshots** | Output §4.1 + architecture diagram; MVP excludes but appeals need history | **Important** |
| **trust_score_event_corrections** | Phase 2 appeals; no stub schema | Nice-to-have |
| **Issue** | `issue.resolved_informally` input; informal rework signal | **Important** |
| **Case** | Case lifecycle inputs §3.1, §8.5; no FK to trust events | **Important** |
| **execution_score** (logical) | Identity Engine exposes separate `execution_score`; Trust Engine omits as output | **Important** |

**Note:** Trust Engine consumes attestation and evaluation data but Entity Model v1 stores neither — the 40% of the score (Execution 30% + Evaluation 10%) lacks a persisted source of truth.

---

## 2. Missing events

### 2.1 Events referenced in integration but absent from Event Matrix

| Expected event | Referenced in | Trust Engine v1 status |
|----------------|---------------|------------------------|
| `trust.execution.milestone_completed` | Action-Contract-Trust Chain v1 | **Missing** — uses `milestone.accepted` instead |
| `trust.execution.milestone_failed` | Action-Contract-Trust Chain, template schema | **Missing** |
| `trust.time.on_time` / `trust.time.late` | Action-Contract-Trust Chain | Partial — `milestone.on_time` / `milestone.late` |
| `trust.evaluation.received` | Action-Contract-Trust Chain | **Missing** — uses `evaluation.submitted` |
| `trust.complaint.resolved` | Action-Contract-Trust Chain, Complaint Lifecycle | **Missing** — split into `complaint.upheld_*` variants |
| `verification.approved` | §20.1 consumed events | **Mismatch** — matrix uses `verification.tier_approved` |
| `milestone.evidence_submitted` | §20.1 consumed | **No trust signal defined** |
| `contract.activated` | §20.1 consumed | **No trust impact defined** |
| `provider.suspended` | Implied by frozen state | **Missing** |
| `complaint.resolved_mutual` | §8.4 outcome table | **No dedicated trust event** |
| `complaint.external_referral` | §8.4 | **No close-path event defined** |
| `issue.raised` / `issue.escalated` | State Machine v1 | Logged as non-input; no audit event type |

### 2.2 Law 14 gap — evidence submission events

Law 14 requires **every verified Evidence submission** to produce trust signals. Trust Engine batches execution/time signals at **`contract.completed`** only (§7.4, §8.1). Intermediate `evidence_submitted` events are consumed (§20.1) but produce **no documented trust effect**.

**Risk:** Implementation may omit per-evidence audit trail required by Law 14 spirit, even if contract-level aggregation satisfies Law 14 letter on completion.

### 2.3 Recommended canonical event catalog (v1.1)

Unify naming under `trust.{domain}.{action}` OR document explicit mapping table from engine domain events → trust event types. Currently **two parallel vocabularies** will cause integration bugs.

---

## 3. Circular trust dependencies

| Dependency loop | Description | Severity |
|-----------------|-------------|:--------:|
| **Double penalty on upheld complaint** | Same fault applies **Complaints component penalty** (§5.2) **and** Execution dimension → `UNF` (§8.4) on the same contract | **Critical** — may over-penalize; needs explicit "primary locus" rule |
| **Eval before complaint close** | Evaluation component updated on submit; complaint close may retroactively change attestation (§15) — eval may reflect stale fulfillment | **Important** |
| **Verification compounding** | Higher tier → higher verification_component (30%) → easier customer acquisition → more positive execution samples | **Low** — by design, but amplifies early advantage |
| **credential_score temporal mix** | Formula uses "contract snapshots + **current** credential state" (§5.2) — renewal retroactively changes verification_component without new contract events | **Important** |
| **dispute_hold vs public score** | Score unchanged during hold (§14.2) while contract excluded from aggregate — internally recomputed but externally static; customer decisions use stale score | **Important** — not circular but inconsistent |
| **Auto-accept → execution credit** | Customer silence auto-accepts milestone (§15) → provider gets FUL execution credit with capped confidence — customer non-participation feeds provider trust | **Important** |

**No true infinite recompute loop** detected. Primary concern is **double-counting punishment**, not circular computation.

---

## 4. Trust manipulation vectors

| Vector | MVP protection | Gap |
|--------|----------------|-----|
| **Self-dealing / collusion** | Flagged Phase 2 only (§11) | **MVP exposed** |
| **Easy-contract farming** | TEKRR complexity gates | No risk-weight normalization in execution aggregate |
| **Eval farming with allies** | One eval per contract | No client score; no outlier dampening spec |
| **Complaint harassment** | No pre-adjudication penalty ✓ | Unlimited dismissed filings; no filer cost MVP |
| **Dispute_hold opacity** | Prior score shown publicly | Customers cannot see pending dispute on trust profile |
| **Credential tier gaming** | Expiry events defined | Achieve T2 for high-risk contract, let expire after |
| **Cancel before bad outcome** | Provider fault cancellation penalty | Cancel before milestone submission may avoid eval |
| **Evidence hash duplicate** | Rejected ✓ | No image/metadata forensics |
| **Cherry-picked eval timing** | Eval post-completion only | Customer can delay eval strategically |
| **Informal issue resolution** | Minor rework signal only | Parties may bypass formal record |
| **Admin severity downgrade** | Documented discretion (§8.7) | Subjective; audit trail required but not specified |

---

## 5. Constitutional law violations

| Law | Trust Engine claim | Review finding | Severity |
|-----|-------------------|----------------|:--------:|
| **Law 13** — Attestation Requires Evidence | Attestation events in architecture | No requirement that `attestation.*` events carry `evidence_ids[]`; entity absent | **P0** |
| **Law 14** — Every Evidence Affects Trust | §19 mapped | Deferred to contract completion; no per-evidence event | **P1** |
| **Law 15** — Evidence-Based | Structured eval only ✓ | Eval neutral 500 default (§15) is synthetic, not evidence-based | **P1** |
| **Law 16** — Never Manually Set | FR-1, FR-14 ✓ | Admin severity downgrade (§8.7) affects penalty without event schema | **P1** |
| **Law 17** — Travels With Identity | FR-15 ✓ | Duplicate identity "flags" only — no merge/rebind algorithm | **P1** |
| **Law 18** — Verification Gates | Verification component ✓ | Tier score in trust loop separate from gate enforcement — OK | — |
| **Law 19–20** — Complaint binding | Complaint events ✓ | Adequate via Complaint Engine | — |
| **Law 21** — Complaint evidence | §8.7 adjudication weights | Trust penalty reduction from evidence quality lacks event record | **P1** |
| **Law 22** — Outcomes modify trust | On close only ✓ | **Double penalty** may exceed "proportional" intent | **P0** |
| **Law 23** — Issue paths | FR-10 ✓ | Informal resolution "minor rework" undefined numerically | **P2** |
| **Law 24** — Immutable record | FR-5 ✓ | `trust_score_snapshots` deferred — score history lost on recompute | **P1** |
| **Law 25** — Versioned prospective | FR-4, FR-12 ✓ | Adequate | — |
| **Laws 10–12** — Evidence/milestones | Not in §19 | Unmapped; execution derived from attestations not milestones directly | **P2** |

---

## 6. MVP inconsistencies

| Topic | Trust Engine v1 | Other MVP docs | Conflict |
|-------|-----------------|----------------|----------|
| **Customer Evaluation entity** | MVP included (§17.1) | Entity Model v1 — **missing** | **P0** |
| **dispute_hold trigger** | §8.4: `complaint.filed`; §12: `evidence_gathering`; State Machine v1: `evidence_gathering` | State Machine authoritative | **P0** — Trust Engine §8.4 wrong |
| **Event vocabulary** | `verification.tier_approved`, `evaluation.submitted` | Chain doc: `trust.execution.*`, `trust.complaint.resolved` | **P0** |
| **execution_score field** | Not an output | Identity Engine v1, architecture DB entities | **P1** |
| **trust_score_snapshots** | In architecture diagram (§2) | MVP excluded (§17.2) | **P1** — diagram misleading |
| **frozen state** | Included §17.1 | State Machine MVP list omits `frozen` explicitly | Minor — functionally included |
| **Eval default 500** | §15 edge case | Not in MVP Scope or TEKRR | **P1** — invented constant |
| **Appeal = event correction** | MVP Scope §1.8 | Phase 2 in Trust Engine §17.2 | **P1** — MVP Scope says appeal exists; Trust Engine defers |
| **Recompute SLA** | 24h contract / 1h complaint | MVP Scope "within 24h" for both | Complaint SLA stricter in Trust Engine — OK |
| **Amendment** | Phase 2 | Contract Lifecycle MVP includes basic amendments | **P1** — scope disagreement across docs |

---

## 7. Edge cases

### 7.1 Documented but underspecified

| Edge case | Trust Engine rule | Gap |
|-----------|-------------------|-----|
| Partial dimension `PEN` | Other dimensions score (§15) | Formula for partial contract inclusion not defined |
| Multiple concurrent complaints | Highest severity (§15) | Multiple `dispute_hold`? Multiple exclusions? |
| `frozen` + `dispute_hold` simultaneously | Not defined | State precedence unclear |
| Cancellation −40/−30 | §6.7 absolute values | Inconsistent with 0–1000 contract input scale elsewhere |
| Complaints component cumulative subtract | §5.2 | 10+ upheld complaints → floor 0; interaction with execution UNF unclear |
| Recurring session partial failure | §15 | Session-level attestation entity missing |
| Post-completion eval after complaint | §15 eval overrides | Recompute order not specified |
| Provider with only cancelled contracts | Not covered | verification-only score? |
| Mutual resolution partial restore | §8.6 | No numeric mapping for "per agreement" |
| `external_referral` close | §8.4 frozen until close | Penalty timing ambiguous |

### 7.2 Missing edge cases (not in §15)

| Edge case | Recommended rule |
|-----------|------------------|
| Complaint dismissed after contract was `PEN`-excluded | Re-include contract retroactively in aggregate |
| Provider completes contract during `frozen` | Event ingested but recompute blocked (FR-8) — queue depth? |
| Tier upgrade mid-rolling-window | Verification immediate; execution history unchanged — OK but undocumented |
| Same customer 20 contracts (rolling window cap) | One customer dominates sample — collusion risk |
| Eval submitted for cancelled contract | Should reject event |
| Zero applicable TEKRR dimensions (edge taxonomy) | Division by zero in execution_input formula |

---

## 8. Provider abuse scenarios

| Scenario | Attack | Current defense | Residual risk |
|----------|--------|-----------------|---------------|
| **Ally eval ring** | 5 friends hire provider for trivial actions, perfect evals | One eval per contract | **High** — no client score MVP |
| **Risk arbitrage** | Complete many risk-1 actions; avoid risk-4+ | Risk multiplier on complaints only, not execution | **Medium** |
| **Cancel and restart** | Cancel faulted work; re-contract with same customer | Cancellation penalty | **Medium** — collusion unchecked |
| **Credential puffing** | Obtain T2; complete contracts; let credentials lapse | Expiry event | **Low** — verification drops |
| **Slow completion gaming** | Delay M-COMPLETE to avoid eval window edge cases | Complaint window 30d | **Low** |
| **Evidence minimalism** | Submit only EV-TS where EV-TEST required | Confidence cap 0.60 | **Medium** — still counts in aggregate |
| **Mutual resolution negotiation** | Pressure customer for lenient mutual outcome | Admin oversight | **Medium** |
| **Dispute_hold reputation shield** | Public score unchanged while disputes pending | None MVP | **High** — customers see stale score |

---

## 9. Client abuse scenarios

| Scenario | Attack | Current defense | Residual risk |
|----------|--------|-----------------|---------------|
| **Complaint bombing** | File repeated complaints; dismiss after provider disruption | One per dimension | **High** — no filer penalty MVP |
| **Eval extortion** | Threaten low eval unless refund (declarative MVP) | None | **High** |
| **Strategic dismissal** | Withdraw complaint after provider concessions | Dismissed = neutral | **Medium** |
| **Post-completion ambush** | Positive eval then complaint within window | Both apply; complaint overrides | **Medium** — provider double-hit |
| **Auto-accept exploitation** | Never sign off; silence triggers auto-accept with audit flag | Confidence cap 0.75 | **Low** — still benefits provider |
| **Frivolous post-completion claims** | File knowing dismissal likely | Phase 2 client score | **High** MVP |
| **Collusive low-effort contracts** | Help provider build score cheaply | Phase 2 collusion detection | **High** MVP |

**Asymmetric accountability:** MVP fully scores providers publicly; customers face **no trust consequences** for abuse vectors above.

---

## 10. Recommended corrections

### P0 — Critical (block implementation)

| ID | Issue | Recommended correction |
|----|-------|------------------------|
| **P0-1** | **Attestation + CustomerEvaluation entities missing** | Add to Entity Model v1.1; Trust Engine must reference table/FK in event payload schemas |
| **P0-2** | **Double penalty on upheld complaints** | Define single primary penalty locus: either Complaints component **OR** Execution UNF drives complaint penalty, not both at full weight. Suggested: Execution UNF is source of truth; Complaints component = rolling upheld ratio × severity, excluding contracts already scored UNF in execution |
| **P0-3** | **dispute_hold trigger inconsistency** | Align §8.4 to State Machine v1: hold on `complaint.evidence_gathering`, not `complaint.filed` |
| **P0-4** | **Event vocabulary drift** | Publish event mapping table: domain events → `trust_score_events.event_type`; update Action-Contract-Trust Chain or Trust Engine to single canonical set |
| **P0-5** | **Law 13 attestation evidence binding** | Require `attestation.*` event payload: `evidence_ids[]`, `milestone_ids[]`; reject attestation without evidence |
| **P0-6** | **JSON Schema per event type** | Deliverable promised §1021 — required before any scoring code; include validation rules |

### P1 — Important (resolve before MVP launch)

| ID | Issue | Recommended correction |
|----|-------|------------------------|
| **P1-1** | **Law 14 per-evidence signals** | Emit lightweight `trust.evidence.recorded` events on upload (audit trail); aggregate at completion remains primary score driver |
| **P1-2** | **Eval neutral 500 default** | Replace with exclusion from evaluation rolling avg (reduce denominator) or explicit `evaluation.absent` event — not synthetic midpoint |
| **P1-3** | **trust_score_snapshots** | Add to MVP schema; append on every recompute for Law 24 appeals |
| **P1-4** | **Public dispute indicator** | `public_summary` must include `pending_disputes_count` or `dispute_hold` flag without revealing score penalty |
| **P1-5** | **credential_score temporal rule** | Verification component uses point-in-time snapshots at contract activation for historical contracts; current state for forward contracts only |
| **P1-6** | **Cancellation penalty units** | Express −40/−30 as contract_input offsets on 0–1000 scale with formula, not magic numbers |
| **P1-7** | **execution_score output** | Expose separate Execution Score per Identity Engine v1 or deprecate Identity Engine field explicitly |
| **P1-8** | **Eval vs complaint recompute order** | Define: on `complaint.closed`, supersede prior `evaluation.submitted` for same contract if fulfillment changed |
| **P1-9** | **Admin severity adjustment audit** | Emit `trust.adjudication.adjustment` event when §8.7 downgrade applied |
| **P1-10** | **MVP appeal minimum** | MVP Scope promises "appeal = event correction" — add lightweight admin correction event + recompute even if full workflow is Phase 2 |
| **P1-11** | **Collusion MVP baseline** | Manual Trust Ops queue: flag when >50% of rolling window contracts share same customer_id |
| **P1-12** | **Partial PEN contract scoring** | Specify: score non-frozen dimensions; weight by applicable emphasis fraction |

### P2 — Nice-to-have improvements

| ID | Issue | Recommended correction |
|----|-------|------------------------|
| **P2-1** | **Informal issue rework signal** | Quantify `issue.resolved_informally` impact (e.g., −5 execution on affected dimension) |
| **P2-2** | **Risk-normalized execution aggregate** | Weight execution_input by contract risk_level in rolling avg |
| **P2-3** | **Eval outlier dampening** | Trim top/bottom 10% of eval inputs when count ≥ 10 |
| **P2-4** | **Client trust score Phase 2 spec** | Expand §13.2 with event types and gating rules now to avoid rework |
| **P2-5** | **Company trust aggregation** | Define anti-gaming: member churn exclusion, minimum member sample |
| **P2-6** | **Map Laws 10–12** | Add constitutional alignment rows for milestone/evidence laws |
| **P2-7** | **Provider suspended event** | `provider.suspended` → auto `frozen` with reason code |
| **P2-8** | **Completion streak** | Remove from §7.1 positive events or mark Phase 2 consistently (listed in both MVP matrix and Phase 2 recovery) |
| **P2-9** | **Explainability API schema** | Formalize `explainScore()` response: component → event_ids → source entities |
| **P2-10** | **Partition strategy** | Document `trust_score_events` archival/partition plan for high-volume providers |

---

## Priority summary

### Critical issues (P0)

1. **Attestation and CustomerEvaluation entities missing** — 40% of score has no data model  
2. **Double penalty on upheld complaints** — Complaints component + Execution UNF may violate Law 22 proportionality  
3. **dispute_hold trigger mismatch** — `filed` vs `evidence_gathering` across docs  
4. **Event vocabulary drift** — two naming systems will break engine integration  
5. **Law 13 not enforceable** — attestation events lack evidence binding requirement  
6. **No JSON Schema for event payloads** — explainability and validation blocked  

### Important issues (P1)

1. Law 14 deferred evidence signals — per-upload audit events missing  
2. Synthetic eval default 500 — not evidence-based  
3. trust_score_snapshots excluded from MVP but required for appeals/history  
4. Public score hides pending disputes — provider abuse / customer deception vector  
5. Verification credential temporal mixing — retroactive score changes  
6. Cancellation penalty magic numbers — unit inconsistency  
7. execution_score output divergence from Identity Engine  
8. Eval/complaint recompute race — order undefined  
9. Admin severity adjustment without trust event  
10. MVP Scope appeal vs Trust Engine Phase 2 deferral  
11. No MVP collusion detection baseline  
12. Partial PEN contract scoring formula missing  

### Nice-to-have improvements (P2)

1. Quantify informal issue rework signal  
2. Risk-normalized execution rolling average  
3. Eval outlier dampening  
4. Client trust Phase 2 early spec  
5. Company trust anti-gaming rules  
6. Map Laws 10–12 to Trust Engine  
7. Provider suspended → frozen event  
8. Clean up completion_streak MVP/Phase 2 labeling  
9. Formal explainScore API schema  
10. trust_score_events partition strategy  

---

## Cross-document alignment matrix

| Source | Alignment with Trust Engine v1 |
|--------|-------------------------------|
| Approval Addendum v1.1 | **Good** — component weights match |
| TEKRR Framework v1 | **Good** — fulfillment scales, decay, PEN exclusion |
| State Machine v1 | **Partial** — dispute_hold trigger conflict |
| Entity Model v1 | **Weak** — attestation, evaluation, verification missing |
| Entity Review v1 | **Confirms** — same P0 entity gaps |
| Action-Contract-Trust Chain v1 | **Weak** — event naming mismatch |
| Complaint Lifecycle v1 | **Good** — severity, close-only penalty |
| Identity Engine v1 | **Partial** — old formula superseded; execution_score orphaned |
| MVP Scope v1 | **Partial** — eval entity, appeals, amendment scope |

---

## Conclusion

Trust Engine v1 establishes the **correct constitutional posture**: event-sourced, explainable, non-manual, complaint-safe pre-adjudication. The **master formula and weight tables are ready for ADR-003**.

Implementation is **blocked** on P0 entity bindings, event catalog unification, and the **double-penalty resolution**. MVP launch additionally requires P1 public dispute transparency, collusion baseline, and snapshot history.

**Next suggested deliverable:** `APP13-Trust-Engine-v1.1.md` — resolve P0/P1 items; add Event Catalog appendix with JSON Schema references; do not rewrite v1 history.

---

## Appendix — Quick reference: issue counts

| Category | P0 | P1 | P2 |
|----------|:--:|:--:|:--:|
| Missing entities | 2 | 4 | 2 |
| Missing events | 2 | 3 | 2 |
| Circular dependencies | 1 | 3 | 1 |
| Manipulation vectors | 2 | 4 | 2 |
| Constitutional | 2 | 5 | 1 |
| MVP inconsistencies | 3 | 5 | 0 |
| Edge cases | 1 | 4 | 6 |
| Provider abuse | 2 | 4 | 2 |
| Client abuse | 3 | 2 | 1 |
| **Corrections listed** | **6** | **12** | **10** |

---

*Review complete. No existing files were modified.*
