# APP13 Trust Engine v1.1

**Version:** 1.1  
**Status:** Specification — Pre-implementation  
**Last updated:** June 19, 2026  
**Engine ID:** `trust`  
**Implementation host:** Identity Engine → Scoring Service  
**Supersedes:** [Trust Engine v1](./APP13-Trust-Engine-v1.md) for all P0/P1 items below  
**Applies review:** [Trust Engine Review v1](./reviews/APP13-Trust-Engine-Review-v1.md)  
**Depends on:** [Core Principles v1](./APP13-Core-Principles-v1.md) · [Approval Addendum v1.1](./architecture/APPROVAL-ADDENDUM-v1.1.md) · [TEKRR Framework v1](./APP13-TEKRR-Framework-v1.md) · [State Machine v1](./APP13-State-Machine-v1.md) · [Complaint Lifecycle v1](./architecture/06-complaint-lifecycle.md)

---

## Document purpose

This document is the **authoritative Trust Engine specification** for MVP implementation. It preserves the constitutional posture of [Trust Engine v1](./APP13-Trust-Engine-v1.md) and resolves **all P0 and P1 findings** from the review.

**Algorithm version:** `trust_score_v1` (unchanged weights — formula refinements only)  
**Schema version:** `trust_engine_v1.1` (entity bindings, events, snapshots)

> *Given verified platform evidence, how reliably does this party honor professional obligations bound by Contracts?*

---

## Change log (v1 → v1.1)

| ID | Issue | v1.1 resolution |
|----|-------|---------------|
| **P0-1** | Attestation + CustomerEvaluation entities missing | §4 Entity bindings — required tables and FKs in event payloads |
| **P0-2** | Double penalty on upheld complaints | §5.2 — **single penalty locus**; Execution UNF primary; Complaints component excludes UNF-scored contracts |
| **P0-3** | dispute_hold trigger on `filed` | §8.4, §12 — hold on `complaint.evidence_gathering` only (State Machine v1 authoritative) |
| **P0-4** | Event vocabulary drift | §7 — canonical `trust.*` event types + domain event mapping table |
| **P0-5** | Law 13 attestation evidence binding | §7.5 — `evidence_ids[]` + `milestone_ids[]` required; reject without |
| **P0-6** | No JSON Schema per event type | Appendix A — payload schemas for all MVP event types |
| **P1-1** | Law 14 per-evidence audit | §7 — `trust.evidence.recorded` on upload (audit; aggregate at completion) |
| **P1-2** | Synthetic eval default 500 | §5.2 — absent eval **excluded from denominator**; `trust.evaluation.absent` event |
| **P1-3** | trust_score_snapshots deferred | §4 — **MVP required**; append on every recompute |
| **P1-4** | Public score hides disputes | §4.1 — `public_summary.pending_disputes_count`, `dispute_hold_active` |
| **P1-5** | Credential temporal mixing | §5.2 — verification snapshot at contract activation; current tier for live component only |
| **P1-6** | Cancellation magic numbers | §5.2, §6.7 — formula-based offsets on 0–1000 scale |
| **P1-7** | execution_score output missing | §4.1 — `execution_score` + `execution_score_version` exposed |
| **P1-8** | Eval vs complaint race | §8.6 — recompute order; complaint supersedes eval on same contract |
| **P1-9** | Admin severity adjustment unaudited | §7 — `trust.adjudication.adjustment` event |
| **P1-10** | MVP appeal deferred | §10 — lightweight `trust.event.corrected` + recompute (MVP) |
| **P1-11** | No collusion baseline | §11 — Trust Ops flag when >50% rolling window shares one customer |
| **P1-12** | Partial PEN scoring undefined | §5.2 — partial contract inclusion formula |

**Unchanged from v1:** Master component weights (30/30/20/10/10), trust philosophy, no pre-adjudication complaint penalty, recency decay, evidence quality weights, forbidden rules (extended).

---

## 1. Trust philosophy and objectives

*Preserved from Trust Engine v1 §1.*

Trust is **derived, never declared** — event-sourced, explainable, non-manual, evidence-based, and neutral.

| Principle | Rule (v1.1) |
|-----------|-------------|
| **Explainability** | Component breakdown + event IDs + source entity FKs |
| **Event sourcing** | `trust_score_events` append-only; score is projection |
| **Single penalty locus** | Upheld fault penalized once — Execution OR Complaints, not both at full weight |
| **Pending exclusion** | `PEN` dimensions excluded; partial contracts scored proportionally |
| **Dispute transparency** | Public profile shows pending dispute count without revealing penalty |
| **Prospective versioning** | Law 25 — `score_version` on every event and snapshot |

**Constitutional chain (unchanged):**

```
Action → Contract → Execution (Evidence + Attestation) → Trust → Complaint (when triggered)
```

---

## 2. Required entity bindings (P0-1)

Trust Engine v1.1 **requires** these persisted entities. Event payloads must reference them by FK.

| Entity | Table | Trust role |
|--------|-------|------------|
| **Attestation** | `attestations` | Source of `FUL/SUF/PAR/UNF` per dimension; Law 13 |
| **CustomerEvaluation** | `customer_evaluations` | Evaluation component (10%); one per completed contract |
| **Verification** | `verifications` | Tier history; verification component |
| **Credential** | `credentials` | Knowledge dimension; credential_score |
| **Adjudication** | `adjudications` | Complaint outcome payload at close |
| **Issue** | `issues` | Informal dispute audit |
| **Case** | `cases` | Dispute file; links complaint + optional issue |
| **TrustScoreEvent** | `trust_score_events` | Append-only inputs |
| **TrustScoreSnapshot** | `trust_score_snapshots` | Point-in-time score on recompute (MVP) |
| **TrustScoreEventCorrection** | `trust_score_event_corrections` | MVP appeal corrections |

### 2.1 Attestation (minimum schema)

| Column | Type | Required |
|--------|------|:--------:|
| id | UUID | Yes |
| contract_id | UUID | Yes |
| tekrr_dimension | enum T/E/K/R/S | Yes |
| fulfillment_rating | enum FUL/SUF/PAR/UNF/PEN | Yes |
| evidence_ids | UUID[] | Yes — **Law 13** |
| milestone_ids | UUID[] | Yes |
| attested_by_user_id | UUID | Yes |
| attested_at | timestamp | Yes |

### 2.2 CustomerEvaluation (minimum schema)

| Column | Type | Required |
|--------|------|:--------:|
| id | UUID | Yes |
| contract_id | UUID | Yes, unique |
| submitted_by_user_id | UUID | Yes |
| eval_form_id | string | Yes — e.g. `EVAL-B-v1` |
| dimension_scores | JSONB | Yes — mapped T/E/K/R/S |
| composite_score | int | Yes — 0–1000 |
| submitted_at | timestamp | Yes |

### 2.3 TrustScoreSnapshot (MVP — P1-3)

| Column | Type | Required |
|--------|------|:--------:|
| id | UUID | Yes |
| provider_id | UUID | Yes |
| score | int | Yes |
| score_version | string | Yes |
| component_scores | JSONB | Yes |
| triggering_event_id | UUID | No |
| computed_at | timestamp | Yes |

Append snapshot on **every successful recompute** — never update in place.

---

## 3. Trust outputs (updated)

### 3.1 Provider Trust Score (MVP)

| Output | Table / artifact | Consumer |
|--------|------------------|----------|
| Composite score | `trust_scores.score` | Public profile |
| **Execution score** | `trust_scores.execution_score` | Public profile, Identity Engine alignment (**P1-7**) |
| Component scores | `trust_scores.*_component` | Provider self-view |
| Dimension breakdown | `trust_scores.dimension_scores` | Provider self-view |
| Confidence band | `trust_scores.confidence_band` | Public profile |
| **Public summary** | `trust_scores.public_summary` | Customer pre-contract view |
| Event log | `trust_score_events` | Audit, appeals |
| **Score snapshots** | `trust_score_snapshots` | History, appeals (**P1-3**) |
| Explainability bundle | API | Support, admin |

### 3.2 Public summary schema (P1-4)

```json
{
  "score": 768,
  "confidence_band": "medium",
  "completed_contract_count": 7,
  "dispute_hold_active": false,
  "pending_disputes_count": 0,
  "collusion_review_flag": false,
  "score_version": "trust_score_v1",
  "computed_at": "2026-06-19T12:00:00Z"
}
```

| Field | Rule |
|-------|------|
| `dispute_hold_active` | `true` when record state = `dispute_hold` |
| `pending_disputes_count` | Count of provider contracts with complaint ≥ `evidence_gathering` |
| `collusion_review_flag` | `true` when §11 threshold met — visible to customers |
| Score value | Unchanged during hold — **penalty not previewed** |

Client and Company trust scores remain Phase 2 / Phase 3 (unchanged).

---

## 4. Updated formula

**Version:** `trust_score_v1`  
**Scale:** 0–1000 (integer, half-up)

### 4.1 Master formula (unchanged weights)

```
trust_score = round(
    0.30 × verification_component +
    0.30 × execution_component +
    0.20 × time_component +
    0.10 × complaints_component +
    0.10 × evaluation_component
)
```

```
execution_score = execution_component   // exposed separately (P1-7)
execution_score_version = "execution_score_v1"
```

### 4.2 Verification component (30%) — P1-5 fix

**Live verification** (current provider standing):

```
verification_component = (
    0.50 × tier_score(current) +
    0.35 × credential_score(current) +
    0.15 × renewal_recency_score(current)
) × 1000
```

**Temporal rule:** Tier and credential scores for **historical contract replay** use `contracts.verification_snapshot` at activation — never retroactively rewritten when provider renews tier.

| tier_score | T0=0.00, T1=0.40, T2=0.70, T3=0.85, T4=0.95 |
| credential_score | valid_required / required_count from snapshot or current |
| renewal_recency_score | 1.00 current · 0.50 expiring ≤30d · 0.00 expired |

### 4.3 Execution component (30%) — P0-2, P1-12

**Eligible contract:** `completed` or `closed`; not under active dispute hold at recompute; partial `PEN` allowed.

**Partial PEN scoring (P1-12):**

```
For contract c with some dimensions in PEN at completion:
  eligible_emphasis = Σ domain_emphasis[d] where d ∉ {N/A, PEN}
  total_emphasis    = Σ domain_emphasis[d] where d ≠ N/A

  partial_weight[c] = eligible_emphasis / total_emphasis   // ∈ (0, 1]

For each scorable dimension d (not PEN, not N/A):
  fulfillment_score[d] from attestations table (FK required)

execution_input[c] = (
  Σ(fulfillment_score[d] × domain_emphasis[d]) / eligible_emphasis
) × evidence_confidence[c] × partial_weight[c] × 1000

Guard: if eligible_emphasis = 0 → exclude contract from execution aggregate

execution_component = weighted_avg(execution_input[c], recency_weight[c])
```

**Attestation source:** Read `attestations` rows only — reject if any applicable dimension lacks attestation or `evidence_ids[]` empty (Law 13).

### 4.4 Time component (20%)

Same as v1 per eligible contract. Partial PEN contracts: time metrics computed on **non-frozen milestones only**; weighted by `partial_weight[c]`.

### 4.5 Complaints component (10%) — P0-2 single penalty locus

**Primary rule:** Execution dimension ratings (`UNF`/`PAR`) from adjudication are the **fulfillment penalty**. Complaints component measures **pattern and severity of upheld disputes**, not duplicate fulfillment damage.

```
complaints_component = 1000 − pattern_penalty

pattern_penalty = Σ penalty_event[i]   for upheld/shared complaints in rolling 24 months

penalty_event[i] = base_penalty_units[severity]
                 × risk_normalization_factor
                 × recency_weight
                 × repeat_offense_multiplier
                 × shared_fault_factor        // 0.50 when shared_fault

EXCLUSION (P0-2):
  Skip penalty_event[i] if contract_id already contributes execution_input[c]
  with any dimension UNF or PAR from the same complaint_id adjudication
```

**Effect:** Upheld complaint updates attestation → execution drops via `execution_input[c]`. Complaints component adds **pattern penalty only when execution UNF/PAR not yet applied** (e.g., external_referral delay) or applies reduced **administrative severity tax** capped at 50% of base_penalty_units when execution already reflects UNF.

```
When execution already UNF from same complaint:
  penalty_event[i] = min(
    base_penalty_units[severity] × 0.50 × risk × recency × repeat,
    25   // administrative cap units
  )
```

Dismissed complaints: **neutral** — no penalty.

### 4.6 Customer Evaluation component (10%) — P1-2 fix

```
eval_eligible = { c | customer_evaluations row exists for contract c }

evaluation_component = weighted_avg(eval_input[c], recency_weight[c])
                     over eval_eligible ONLY

If no evaluations in window:
  evaluation_component = 1000   // neutral — not 500 synthetic midpoint
```

Emit `trust.evaluation.absent` per completed contract without eval after eval window (template-defined, default 14 days post-completion) — **audit only**, no score impact.

**Rejected:** `evaluation.submitted` for cancelled/void contracts.

### 4.7 Cancellation offsets (P1-6)

Replace magic numbers with normalized fault offsets on 0–1000 contract input scale:

```
fault_offset_execution:
  provider → 400 points deducted from execution_input[c] before aggregate
  shared   → 200
  customer → 0
  none     → 0

fault_offset_time:
  provider → 300
  shared   → 150
  customer → 0
  none     → 0

execution_input[c] = max(0, execution_input[c] − fault_offset_execution)
time_commitment_input[c] = max(0, time_commitment_input[c] − fault_offset_time)
```

Emit `trust.contract.cancelled` with `fault_party` and computed offsets in payload.

### 4.8 Recency and confidence (unchanged)

Rolling window: last **20** eligible contracts. Decay: 24mo=1.0, 36mo=0.5, >36mo excluded.

Confidence band: low <3 · medium 3–9 · high ≥10 completed contracts.

---

## 5. Weight tables

*Platform weights, fulfillment ratings, evidence quality, severity units, risk normalization, repeat offense — unchanged from Trust Engine v1 §6.1–6.6.*

### 5.1 Cancellation fault offsets (replaces v1 §6.7)

| Fault party | Execution offset | Time offset |
|-------------|:----------------:|:-----------:|
| `none` / pre-active | 0 | 0 |
| `customer` | 0 | 0 |
| `provider` | 400 | 300 |
| `shared` | 200 | 150 |

---

## 6. Updated event matrix

### 6.1 Canonical naming (P0-4)

All `trust_score_events.event_type` values use **`trust.{domain}.{action}`** namespace.

### 6.2 Domain event → trust event mapping

| Domain event (source engine) | Trust event type (canonical) | Score impact |
|------------------------------|------------------------------|--------------|
| `verification.approved` | `trust.verification.approved` | Verification ↑ |
| `verification.expired` | `trust.verification.expired` | Verification ↓ |
| `verification.credential_verified` | `trust.verification.credential_verified` | Verification ↑ |
| `verification.credential_revoked` | `trust.verification.credential_revoked` | Verification ↓ |
| `contract.activated` | `trust.contract.activated` | Audit only — snapshot ref |
| `contract.completed` | `trust.contract.completed` | Execution + Time ↑/− |
| `contract.cancelled` | `trust.contract.cancelled` | Offsets per fault |
| `milestone.evidence_submitted` | `trust.evidence.recorded` | **Audit only** (P1-1) |
| `milestone.accepted` | `trust.execution.milestone_completed` | Aggregated at complete |
| `milestone.rejected` / disputed | `trust.execution.milestone_failed` | Aggregated at complete |
| `milestone.on_time` | `trust.time.on_time` | Aggregated at complete |
| `milestone.late` | `trust.time.late` | Aggregated at complete |
| `attestation.recorded` | `trust.attestation.fulfilled` or `.unfulfilled` | Aggregated at complete |
| `evaluation.submitted` | `trust.evaluation.received` | Evaluation ↑/↓ |
| (no eval by window) | `trust.evaluation.absent` | Audit only |
| `complaint.filed` | `trust.complaint.filed` | **None** — audit only |
| `complaint.evidence_gathering` | `trust.complaint.dispute_hold_applied` | State → dispute_hold |
| `complaint.closed` | `trust.complaint.resolved` | Per outcome — see §6.4 |
| `issue.resolved_informally` | `trust.issue.resolved_informally` | Audit; optional rework flag |
| `issue.raised` | `trust.issue.raised` | Audit only |
| `case.opened` / `case.closed` | `trust.case.opened` / `trust.case.closed` | Audit / SLA |
| `provider.suspended` | `trust.provider.suspended` | → frozen |
| Admin severity downgrade | `trust.adjudication.adjustment` | Adjusts penalty (P1-9) |
| Admin event correction | `trust.event.corrected` | Triggers recompute (P1-10) |

### 6.3 Positive trust events

| Event type | Component | Trigger |
|------------|-----------|---------|
| `trust.verification.approved` | Verification | Tier approved |
| `trust.verification.credential_verified` | Verification | Credential verified |
| `trust.contract.completed` | Execution, Time | Contract completed |
| `trust.execution.milestone_completed` | Execution | Milestone accepted (rollup) |
| `trust.time.on_time` | Time | Milestone on time (rollup) |
| `trust.attestation.fulfilled` | Execution | Dimension FUL/SUF |
| `trust.evaluation.received` | Evaluation | EVAL submitted |
| `trust.complaint.resolved` (dismissed) | Complaints | Neutral |
| `trust.complaint.resolved` (customer_fault) | Complaints | Neutral to provider |

### 6.4 Negative trust events

| Event type | Component | Trigger |
|------------|-----------|---------|
| `trust.verification.expired` | Verification | Tier/credential expired |
| `trust.verification.credential_revoked` | Verification | Admin revocation |
| `trust.time.late` | Time | Milestone late (rollup) |
| `trust.execution.milestone_failed` | Execution | Milestone failed (rollup) |
| `trust.attestation.unfulfilled` | Execution | Dimension UNF |
| `trust.contract.cancelled` | Execution, Time | Provider/shared fault |
| `trust.complaint.resolved` (upheld) | Execution + Complaints | See §4.5 single locus |
| `trust.complaint.resolved` (shared) | Execution + Complaints | Partial |
| `trust.complaint.resolved` (critical) | All | + tier review → frozen |
| `trust.evaluation.received` (low) | Evaluation | Composite <400 |

### 6.5 Neutral / audit / hold events

| Event type | Effect |
|------------|--------|
| `trust.evidence.recorded` | **Audit trail only** — Law 14; aggregate at completion |
| `trust.complaint.filed` | Audit; **no penalty**, no hold |
| `trust.complaint.dispute_hold_applied` | Record state → `dispute_hold`; exclude pending contracts |
| `trust.complaint.dispute_hold_released` | Complaint terminal; re-include contracts |
| `trust.evaluation.absent` | Audit; eval excluded from denominator |
| `trust.issue.raised` | Audit; partial freeze (Action Engine) |
| `trust.contract.activated` | Audit; verification snapshot reference |
| `trust.case.opened` / `trust.case.closed` | Audit / SLA |

### 6.6 Full event impact matrix

| Trust event | V | E | T | C | Ev | Timing |
|-------------|:-:|:-:|:-:|:-:|:-:|:------:|
| `trust.verification.approved` | ✓ | | | | | Immediate |
| `trust.verification.expired` | ✓ | | | | | Immediate |
| `trust.verification.credential_verified` | ✓ | | | | | Immediate |
| `trust.verification.credential_revoked` | ✓ | | | | | Immediate |
| `trust.contract.activated` | | | | | | Audit |
| `trust.contract.completed` | | ✓ | ✓ | | | ≤24h |
| `trust.contract.cancelled` | | ✓ | ✓ | | | Immediate |
| `trust.evidence.recorded` | | | | | | Audit |
| `trust.execution.milestone_completed` | | ✓ | | | | Rollup |
| `trust.execution.milestone_failed` | | ✓ | | | | Rollup |
| `trust.time.on_time` | | | ✓ | | | Rollup |
| `trust.time.late` | | | ✓ | | | Rollup |
| `trust.attestation.fulfilled` | | ✓ | | | | Rollup |
| `trust.attestation.unfulfilled` | | ✓ | | | | On close/complete |
| `trust.evaluation.received` | | | | | ✓ | ≤24h |
| `trust.evaluation.absent` | | | | | | Audit |
| `trust.complaint.filed` | | | | | | **None** |
| `trust.complaint.dispute_hold_applied` | | | | | | Hold state |
| `trust.complaint.resolved` (upheld) | | ✓ | | ± | | ≤1h |
| `trust.complaint.resolved` (dismissed) | | | | ○ | | ≤1h |
| `trust.adjudication.adjustment` | | | | ± | | On admin action |
| `trust.event.corrected` | ± | ± | ± | ± | ± | On correction |
| `trust.provider.suspended` | | | | | | → frozen |
| `trust.issue.raised` | | | | | | Audit |
| `trust.case.opened` / `closed` | | | | | | Audit |

**Legend:** ✓ affects component · ± conditional · ○ neutral · Rollup = aggregated at contract completion

### 6.7 Attestation payload requirements (P0-5)

`trust.attestation.fulfilled` and `trust.attestation.unfulfilled` **must** include:

```json
{
  "attestation_id": "uuid",
  "contract_id": "uuid",
  "tekrr_dimension": "E",
  "fulfillment_rating": "FUL",
  "evidence_ids": ["uuid", "uuid"],
  "milestone_ids": ["uuid"],
  "evidence_confidence": 0.95
}
```

**Validation:** Reject ingestion if `evidence_ids` empty and no active dispute on dimension.

---

## 7. Lifecycle impact (updated)

### 7.1 Complaint impact — P0-3 hold trigger

| Complaint state | Trust effect |
|-----------------|--------------|
| `filed` | `trust.complaint.filed` — audit only; **no hold** |
| `triage_pending` | Audit only |
| `evidence_gathering` | `trust.complaint.dispute_hold_applied` — **dispute_hold**; exclude contract from aggregate |
| `mediation` / `adjudication_pending` | Hold continues |
| `closed` | `trust.complaint.resolved` — penalty per §4.5; hold released |

### 7.2 Recompute order (P1-8)

On `trust.complaint.resolved` for contract `c`:

```
1. Apply adjudication → update attestations (Action Engine)
2. Supersede prior trust.evaluation.received for contract c if fulfillment changed
3. Emit trust.complaint.resolved with adjudication_id FK
4. Recompute execution → time → complaints → evaluation → composite
5. Append trust_score_snapshot
6. Refresh public_summary (including pending_disputes_count)
```

Eval submitted before complaint close may be **invalidated for scoring** if adjudication changes dimension fulfillment; emit `trust.evaluation.superseded` (audit link to complaint_id).

### 7.3 State precedence: frozen + dispute_hold

| State | Rule |
|-------|------|
| `frozen` | Blocks recompute (FR-8); events queue |
| `dispute_hold` | Recompute allowed excluding pending contracts |
| Both active | `frozen` wins — no recompute until admin release |

### 7.4 Multiple concurrent complaints

Each complaint on distinct dimension → single `dispute_hold`; `pending_disputes_count` = active count. Pattern penalty uses **highest severity** among upheld in 12 months. Contract excluded until **all** complaints terminal.

### 7.5 Dismissed after PEN exclusion

When complaint dismissed: dimensions un-PEN; contract **re-included retroactively** in next recompute with attestations as they stood before dispute.

---

## 8. Updated abuse protections

### 8.1 MVP protections (new / strengthened)

| Threat | v1.1 protection |
|--------|-----------------|
| **Double penalty** | §4.5 single locus — execution primary |
| **Dispute opacity** | `pending_disputes_count` + `dispute_hold_active` in public_summary |
| **Collusion** | Auto-flag when >50% of rolling 20 contracts share same `customer_id` → Trust Ops queue + public `collusion_review_flag` |
| **Eval farming** | One eval per contract; rejected if collusion flag active until review cleared |
| **Complaint filing harassment** | No score penalty on filer (MVP); audit trail on `trust.complaint.filed`; repeat dismissed filings → Trust Ops queue (manual) |
| **Pre-adjudication penalty** | Preserved — no penalty until `closed` |
| **Evidence fabrication** | Content hash + duplicate rejection |
| **Synthetic eval inflation** | No 500 default — absent evals excluded |
| **Credential puffing** | Snapshot at activation; live expiry drops verification |
| **Admin manipulation** | `trust.adjudication.adjustment` + `trust.event.corrected` audit events |
| **Score stuffing** | TEKRR + evidence gates; collusion flag |

### 8.2 Collusion detection rule (P1-11)

```
collusion_flag = true when:
  count(distinct contract_id in rolling_window where customer_id = X)
  / count(contract_id in rolling_window) > 0.50

Action:
  - Set public_summary.collusion_review_flag = true
  - Block new contract acceptance by flagged customer until Trust Ops review (MVP manual)
  - Do NOT auto-reduce score — admin decides after review
```

### 8.3 Provider abuse — residual MVP risk

| Scenario | v1.1 mitigation | Residual |
|----------|-----------------|----------|
| Ally eval ring | Collusion flag + manual review | Medium until review |
| Dispute-hold shield | Pending count visible | Low |
| Easy-contract farming | Collusion + confidence band | Medium |
| Cancel before bad eval | Fault offsets | Medium |

### 8.4 Client abuse — residual MVP risk

| Scenario | v1.1 mitigation | Residual |
|----------|-----------------|----------|
| Complaint bombing | One per dimension; Trust Ops queue on pattern | High — no client score MVP |
| Eval extortion | Eval linked to contract; collusion blocks suspicious rings | Medium |
| Frivolous filings | Manual Trust Ops on 3+ dismissed/12mo per filer | High until Phase 2 client score |

---

## 9. Trust recovery and appeals

*Preserved from v1 §9–10 with additions.*

| Mechanism | MVP |
|-----------|:---:|
| Time decay | ✓ |
| Clean contracts dilute negatives | ✓ |
| Dismissed complaint → re-inclusion | ✓ |
| Mutual resolution attestation restore | ✓ |
| **Event correction appeal** | ✓ lightweight (P1-10) |

### 9.1 MVP appeal flow (P1-10)

```
1. Provider submits appeal with event_id reference
2. Admin reviews underlying evidence
3. If upheld: emit trust.event.corrected {
     original_event_id, correction_reason, corrected_payload
   }
4. Append-only — original event never deleted (Law 24)
5. Trigger full recompute + snapshot
```

Full appeal workflow UI Phase 2; **correction event + recompute required in MVP**.

---

## 10. Trust score lifecycle states

*Aligned with [State Machine v1 §6](./APP13-State-Machine-v1.md#6-trust-score).*

**dispute_hold trigger:** `trust.complaint.dispute_hold_applied` on complaint → `evidence_gathering` (**not** `filed`).

**frozen trigger:** `trust.complaint.resolved` with critical severity OR `trust.provider.suspended`.

MVP includes: `uninitialized`, `provisional`, `active`, `dispute_hold`, `frozen`, `archived`.

---

## 11. Forbidden rules (extended)

All v1 FR-1 through FR-15 preserved, plus:

| ID | Rule |
|----|------|
| **FR-16** | No attestation trust event without `evidence_ids[]` |
| **FR-17** | No double full penalty — execution UNF + full complaints penalty for same complaint_id |
| **FR-18** | No synthetic eval midpoint — absent evals excluded, not imputed |
| **FR-19** | No `trust.evaluation.received` for cancelled/void contracts |
| **FR-20** | No snapshot deletion — append-only (Law 24) |
| **FR-21** | No severity adjustment without `trust.adjudication.adjustment` event |

---

## 12. Constitutional law alignment (extended)

| Law | v1.1 enforcement |
|-----|------------------|
| **Law 10** — Every Contract Has Evidence | `trust.evidence.recorded` + completion rollup |
| **Law 11** — Evidence Milestone-Bound | Payload requires `milestone_id` |
| **Law 12** — Milestone-Driven Execution | Rollup from milestone events |
| **Law 13** — Attestation Requires Evidence | §6.7 mandatory `evidence_ids[]` |
| **Law 14** — Every Evidence Affects Trust | `trust.evidence.recorded` audit + completion aggregate |
| **Law 15** — Evidence-Based | No synthetic eval; structured EVAL only |
| **Law 16** — Never Manually Set | Event-sourced; appeals correct events |
| **Law 17** — Travels With Identity | Unchanged |
| **Law 18** — Verification Gates | Snapshot + live verification |
| **Law 22** — Proportional complaint impact | §4.5 single locus |
| **Law 24** — Immutable Record | Events + snapshots append-only |
| **Law 25** — Versioned Prospective | `trust_score_v1` unchanged; schema v1.1 |

---

## 13. MVP scope (v1.1)

### Included

All v1 §17.1 items, plus:

- Entity bindings: attestations, customer_evaluations, verifications, credentials, adjudications, trust_score_snapshots, trust_score_event_corrections
- `execution_score` output field
- Public dispute transparency fields
- Collusion baseline flag
- MVP event correction appeals
- Canonical `trust.*` event catalog
- JSON Schema payload validation (Appendix A)

### Excluded (unchanged)

Client trust, company trust, amendment trust events, completion streak bonus, automated collusion enforcement, ML anomaly detection, external API export.

### Recompute SLA

| Trigger | Target |
|---------|--------|
| `trust.contract.completed` | ≤24h |
| `trust.complaint.resolved` | ≤1h |
| `trust.evaluation.received` | ≤24h |
| `trust.event.corrected` | ≤1h |
| `trust.verification.*` | ≤1h |

---

## 14. Examples (updated)

### 14.1 Upheld complaint — single locus (P0-2)

**Context:** EFFORT_DEFICIENCY upheld, medium severity, execution dimension → UNF.

```
1. trust.complaint.resolved → attestation E = UNF
2. execution_input[c] drops (e.g. 850 → 520)
3. complaints_component: administrative cap only = 1000 − 12 = 988
   (not full 25-unit pattern penalty because execution already UNF)
4. Composite: 768 → 735 (proportional, not double-hit)
```

### 14.2 Dispute hold visibility (P1-4)

**Context:** Complaint enters evidence_gathering.

```
public_summary:
  score: 768                    // unchanged
  dispute_hold_active: true
  pending_disputes_count: 1
  collusion_review_flag: false
```

### 14.3 Absent evaluation (P1-2)

**Context:** 5 completed contracts; 3 evals submitted.

```
evaluation_component = weighted_avg(3 evals)   // denominator = 3, not 5
                                 // NOT imputed 500 for missing 2
```

---

## Appendix A — Event payload JSON Schema references

**Location (implementation):** `schemas/trust-events/v1/`  
**Validation:** Required at ingestion — reject malformed events (P0-6).

| Event type | Schema file | Required fields |
|------------|-------------|-----------------|
| `trust.verification.approved` | `verification.approved.json` | provider_id, tier, approved_at |
| `trust.verification.expired` | `verification.expired.json` | provider_id, tier, expired_at |
| `trust.verification.credential_verified` | `verification.credential_verified.json` | provider_id, credential_id |
| `trust.contract.completed` | `contract.completed.json` | contract_id, fulfillment_ratings, time_metrics, partial_weight |
| `trust.contract.cancelled` | `contract.cancelled.json` | contract_id, fault_party, fault_offset_execution, fault_offset_time |
| `trust.contract.activated` | `contract.activated.json` | contract_id, verification_snapshot_id |
| `trust.evidence.recorded` | `evidence.recorded.json` | evidence_id, milestone_id, contract_id, evidence_type, content_hash |
| `trust.attestation.fulfilled` | `attestation.fulfilled.json` | attestation_id, evidence_ids[], milestone_ids[] |
| `trust.attestation.unfulfilled` | `attestation.unfulfilled.json` | attestation_id, evidence_ids[], milestone_ids[] |
| `trust.evaluation.received` | `evaluation.received.json` | customer_evaluation_id, contract_id, composite_score |
| `trust.evaluation.absent` | `evaluation.absent.json` | contract_id, window_expired_at |
| `trust.evaluation.superseded` | `evaluation.superseded.json` | customer_evaluation_id, complaint_id, reason |
| `trust.complaint.filed` | `complaint.filed.json` | complaint_id, contract_id, dimensions[] |
| `trust.complaint.dispute_hold_applied` | `complaint.dispute_hold_applied.json` | complaint_id, provider_id, contract_id |
| `trust.complaint.resolved` | `complaint.resolved.json` | complaint_id, adjudication_id, outcome, severity, dimensions[] |
| `trust.adjudication.adjustment` | `adjudication.adjustment.json` | adjudication_id, original_severity, adjusted_severity, reason, admin_id |
| `trust.event.corrected` | `event.corrected.json` | original_event_id, correction_reason, corrected_payload, admin_id |
| `trust.provider.suspended` | `provider.suspended.json` | provider_id, reason |
| `trust.issue.raised` | `issue.raised.json` | issue_id, contract_id, dimensions[] |
| `trust.case.opened` | `case.opened.json` | case_id, contract_id |
| `trust.case.closed` | `case.closed.json` | case_id, outcome |

---

## Appendix B — Related documents

| Document | Relationship |
|----------|--------------|
| [Trust Engine v1](./APP13-Trust-Engine-v1.md) | Superseded for P0/P1 items; history preserved |
| [Trust Engine Review v1](./reviews/APP13-Trust-Engine-Review-v1.md) | Source of fixes |
| [TEKRR Framework v1](./APP13-TEKRR-Framework-v1.md) | Fulfillment scales |
| [State Machine v1](./APP13-State-Machine-v1.md) | dispute_hold on evidence_gathering |
| [MVP Scope v1](./APP13-MVP-Scope-v1.md) | Provider trust + appeal minimum |

---

## Quick reference (v1.1)

```
FORMULA:     0.30V + 0.30E + 0.20T + 0.10C + 0.10Ev  →  0–1000
EXECUTION:   execution_score = execution_component
PENALTY:     Single locus — UNF in execution; complaints pattern tax capped
HOLD:        evidence_gathering → dispute_hold (NOT filed)
EVAL ABSENT: Excluded from denominator — no synthetic 500
EVIDENCE:    trust.evidence.recorded on upload (audit)
PUBLIC:      pending_disputes_count + dispute_hold_active
COLLUSION:   >50% same customer in window → flag
APPEAL MVP:  trust.event.corrected → recompute → snapshot
EVENTS:      Canonical trust.* namespace only
```

---

*Trust Engine v1.1 complete. Trust Engine v1 remains unchanged as historical reference.*
