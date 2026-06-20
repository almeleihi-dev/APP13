# ADR-003: Trust Is Event-Generated and Cannot Be Manually Edited

**Status:** Accepted  
**Date:** June 19, 2026  
**Deciders:** APP13 architecture (constitutional)  
**Related:** [ADR-001](./ADR-001-Action-Only.md) · [ADR-002](./ADR-002-Complaint-Origin.md) · Law 14–17 · [Trust Engine v1.1](../../APP13-Trust-Engine-v1.1.md)

---

## Context

Trust is APP13's **credibility projection** — a computed answer to whether a provider reliably honors contract-bound professional obligations. It is not a reputation badge, star rating, or admin-adjustable metric.

[Core Principles v1](../../APP13-Core-Principles-v1.md) establishes three related laws:

| Law | Rule |
|-----|------|
| **Law 14** | Every verified Evidence submission and milestone outcome produces Trust signals |
| **Law 15** | Trust derives from verified platform events — not anonymous reviews |
| **Law 16** | Trust Scores are **never manually assigned or overridden** |

Law 16 is explicit:

> Providers, customers, and commercial partners cannot edit their scores. Administrators may correct underlying *events* (with audit trail), not the algorithm output directly.

Many platforms treat trust as **editable or subjective**:

| Common pattern | Problem on APP13 |
|----------------|------------------|
| Star ratings and written reviews | Opinion-based; not contract-linked — violates Law 15 |
| Admin "fix score" dashboard | Direct algorithm override — violates Law 16 |
| Provider self-reported credentials as trust | Unverified — violates Law 14 |
| Pay-for-better placement / boosted reputation | Commercial manipulation — violates Law 4 |
| Delete bad history on account reset | Identity evasion — violates Law 17 |
| Complaint filing reduces score immediately | Pre-adjudication penalty — violates Law 22 spirit |
| Synthetic default scores for missing data | Imputed trust without evidence — violates Law 15 |

APP13 requires **event sourcing**: the `trust_scores` row is a **read-only projection** recomputed from append-only `trust_score_events`. If trust could be manually edited:

1. **Explainability breaks** — parties cannot trace score changes to contract evidence
2. **Disputes become unenforceable** — adjudication outcomes could be negated by admin edits
3. **Neutrality fails** — commercial or political pressure could alter scores without record
4. **Constitutional chain breaks** — Trust must follow Contract events, not arbitrary input

**Event chain (authoritative):**

```
Contract / Execution domain event  →  trust_score_event (append)  →  recompute  →  trust_scores (projection)
```

No domain event → no trust event → no score change.

---

## Decision

**Trust is event-generated and cannot be manually edited.**

### 1. Single writer

| Entity | Writer | Rule |
|--------|--------|------|
| `trust_score_events` | Trust Engine (Scoring Service) | Append-only ingestion from validated domain events |
| `trust_scores` | Trust Engine (Scoring Service) | Computed projection only — **no direct writes by humans or other engines** |
| `trust_score_snapshots` | Trust Engine | Append on every successful recompute |
| `trust_score_event_corrections` | Admin via audited API | References original event — never deletes |

**No engine other than Trust Engine** may set `trust_scores.score`, component fields, or `execution_score`.

### 2. Allowed inputs

Trust events may originate **only** from verified platform domain events:

| Source engine | Examples → `trust.*` event |
|---------------|----------------------------|
| Contract | `contract.completed` → `trust.contract.completed` |
| Action / Execution | `milestone.evidence_submitted` → `trust.evidence.recorded` |
| Identity / Verification | `verification.approved` → `trust.verification.approved` |
| Complaint (closed) | `complaint.closed` → `trust.complaint.resolved` |
| CustomerEvaluation | `evaluation.submitted` → `trust.evaluation.received` |

Full catalog: [Trust Engine v1.1 §6.2](../../APP13-Trust-Engine-v1.1.md).

**Rejected inputs:** user-submitted scores, external review imports, manual admin score fields, complaint filing alone (pre-adjudication).

### 3. Forbidden manual operations

| Operation | Status |
|-----------|--------|
| Provider edits own trust score | **Forbidden** |
| Customer edits provider score | **Forbidden** |
| Admin sets `trust_scores.score` directly | **Forbidden** |
| Admin sets component scores directly | **Forbidden** |
| DELETE on `trust_score_events` | **Forbidden** (Law 24) |
| UPDATE on historical `trust_score_snapshots` | **Forbidden** |
| Retroactive algorithm change on completed contracts | **Forbidden** (Law 25) |
| Trust penalty on `complaint.filed` | **Forbidden** — penalty only on `complaint.closed` |

### 4. Permitted admin intervention (event correction only)

Administrators may **correct underlying events**, not scores:

```
Appeal upheld  →  emit trust.event.corrected {
                   original_event_id,
                   correction_reason,
                   corrected_payload,
                   admin_id
                 }
              →  trigger recompute
              →  append trust_score_snapshot
```

Original event remains in the log (append-only). Severity adjustments require `trust.adjudication.adjustment` with documented reason (Trust Engine v1.1 FR-21).

### 5. Algorithm versioning

| Field | Rule |
|-------|------|
| `score_version` | e.g. `trust_score_v1` — on every event and snapshot |
| Formula changes | Prospective only — Law 25 |
| Completed contracts | Scored under version active at completion |

---

## Consequences

### Trust Engine

| Impact | Detail |
|--------|--------|
| **Event ingestion pipeline** | Validate payload JSON Schema before append |
| **Recompute job** | Async projection from events → `trust_scores` |
| **Explainability API** | `explainScore(provider_id)` returns event IDs per component |
| **Frozen state** | Recompute blocked while `frozen` — events queue (FR-8) |
| **Dispute hold** | Recompute excludes pending contracts — score unchanged until close |

### Contract & Action engines

| Impact | Detail |
|--------|--------|
| **Event emission duty** | Must emit domain events on lifecycle transitions — Trust depends on them |
| **No trust logic** | Contract Engine never computes or stores trust scores |
| **Evidence → trust audit** | `trust.evidence.recorded` on upload; aggregate at completion |

### Complaint Engine

| Impact | Detail |
|--------|--------|
| **No direct trust writes** | Emits `complaint.closed`; Trust Engine maps to `trust.complaint.resolved` |
| **Adjudication FK** | Trust penalty payload requires `adjudication_id` + `contract_id` |
| **Pre-adjudication neutral** | Filing does not reduce score |

### Identity Engine

| Impact | Detail |
|--------|--------|
| **Scoring Service host** | Trust Engine implemented as Identity sub-component |
| **Verification events** | Tier changes emit trust events — not manual tier → score mapping in UI |
| **Provider profile** | Public summary reads projection — no edit endpoint |

### Database & API

| Impact | Detail |
|--------|--------|
| **Schema** | `trust_scores` columns have no admin UPDATE path in application layer |
| **API** | No `PATCH /trust-scores/{id}` with score fields |
| **RBAC** | Only `trust.event.corrected` permission for Trust Ops — not score override |
| **Audit** | Every correction and adjustment is append-only with actor_id |

### Product & UX

| Impact | Detail |
|--------|--------|
| **Provider view** | Breakdown by component + "view contributing events" — not "edit score" |
| **Customer view** | Pre-contract trust summary read-only |
| **Support scripts** | "We cannot change your score; we can review underlying events" |
| **No star ratings** | Customer Evaluation is structured EVAL form post-contract only |

### MVP appeal flow

Lightweight correction supported in MVP (Trust Engine v1.1 §9.1):

1. Provider references `event_id`
2. Admin reviews evidence
3. If valid: `trust.event.corrected` → recompute
4. Score changes **only** as recomputation output

Full appeal workflow UI may expand in Phase 2; **event correction is required in MVP** per MVP Scope v1.

---

## Relationship to adjacent decisions

| Decision | Interaction |
|----------|-------------|
| **ADR-001** | Trust aggregates per Action-type contracts — not per listing |
| **ADR-002** | Complaint trust impact requires contract-scoped adjudication event |
| **Law 17** | Trust binds to verified identity; deactivation archives — no score wipe |
| **Law 22** | Penalties proportional to severity — applied via events on complaint close |
| **Law 25** | Versioned formula; no retroactive rescoring of closed obligations |

---

## Alternatives considered

| Alternative | Why rejected |
|-------------|--------------|
| **Admin score override for edge cases** | Breaks explainability and neutrality; no audit trail of *why* score changed — violates Law 16 |
| **Provider-submitted trust evidence** | Unverified; bypasses platform evidence chain — violates Law 14 |
| **Hybrid: events + manual adjustment field** | Adjustment field becomes de facto override; commercial pressure migrates there |
| **Star ratings merged into trust score** | Opinion-based; gameable — violates Law 15 |
| **Immediate complaint penalty** | Weaponized filing; violates pre-adjudication rule and Trust Engine v1.1 |
| **Delete events on appeal success** | Breaks immutable record — violates Law 24; correction events preferred |
| **Client trust score affecting provider (MVP)** | Asymmetric; client score Phase 2 — provider score remains event-generated only |

---

## Compliance checklist (implementation)

- [ ] No API endpoint writes `trust_scores.score` or `*_component` directly
- [ ] `trust_score_events` INSERT only — no UPDATE/DELETE in application code
- [ ] All score changes trace to ≥1 `trust_score_event` or correction event
- [ ] `score_version` on every event and snapshot
- [ ] Complaint filing emits audit event only — no penalty until close
- [ ] Admin panel exposes event log and correction form — not score input field
- [ ] `explainScore()` returns event IDs linked to source entities
- [ ] Recompute produces append-only `trust_score_snapshots`
- [ ] Contract Engine and Complaint Engine have no trust score columns writable by those services
- [ ] RBAC denies score override role — grants `trust.event.correct` only

---

## Related documents

| Document | Relationship |
|----------|--------------|
| [Core Principles v1](../../APP13-Core-Principles-v1.md) | Law 14–17, 25 — constitutional authority |
| [Trust Engine v1.1](../../APP13-Trust-Engine-v1.1.md) | Formula, events, forbidden rules FR-1–FR-21 |
| [Contract Engine v1](../../APP13-Contract-Engine-v1.md) | §23 Trust event integration |
| [Complaint Lifecycle v1](../06-complaint-lifecycle.md) | Trust update on close only |
| [MVP Scope v1](../../APP13-MVP-Scope-v1.md) | No manual override; appeal = event correction |
| [ADR-002](./ADR-002-Complaint-Origin.md) | Contract-scoped complaint outcomes → trust events |

---

## Summary

Trust on APP13 is **not assigned — it is computed**. Scores are projections of append-only platform events sourced from Contracts, Evidence, Verification, Evaluations, and closed Complaints. No party and no administrator may edit a trust score directly; they may only correct the underlying event record and trigger recomputation.

**Manual score edit is a constitutional violation.** Event → recompute → snapshot is the only lawful path.

---

*ADR-003 accepted. No existing files were modified.*
