# ADR-002: Every Complaint Must Originate From a Contract

**Status:** Accepted  
**Date:** June 19, 2026  
**Deciders:** APP13 architecture (constitutional)  
**Related:** [ADR-001](./ADR-001-Action-Only.md) · Law 19–23 · [Complaint Lifecycle v1](../06-complaint-lifecycle.md)

---

## Context

APP13's accountability chain terminates in formal dispute resolution:

```
Action → Contract → Execution (Evidence + Attestation) → Trust → Complaint
```

A **Complaint** is the platform's binding dispute mechanism — not a review, not a support ticket, and not a reputation attack against a person or listing.

[Core Principles v1](../../APP13-Core-Principles-v1.md) establishes **Law 19 — Every Complaint Originates From a Contract**:

> There are no free-floating disputes, general reputation attacks, or complaints unrelated to a bound professional obligation. Accountability requires a contract record.

Many platforms allow disputes that are **not contract-anchored**:

| Common pattern | Problem on APP13 |
|----------------|------------------|
| Report this user / provider | No TEKRR dimension, no evidence package, no obligation reference |
| Review or rating without transaction | Violates Law 15 (evidence-based trust) |
| Dispute about a listing or profile | No contract snapshot; violates ADR-001 |
| Support ticket about "bad experience" | Not adjudicable against milestones and attestations |
| Complaint before any agreement | No frozen obligations; no filing window rules |
| Platform-mediated chargeback without record | Payments excluded MVP; no contract linkage |

Without a Contract origin, the Complaint Engine cannot:

1. **Validate eligibility** — filing windows, party membership, and contract state (EL-1–EL-8)
2. **Assemble evidence** — auto-attach TEKRR snapshot, milestones, execution evidence, attestations (Law 21)
3. **Freeze dimensions** — scope dispute to specific TEKRR obligations (Law 20, Law 23)
4. **Apply outcomes** — update attestations and trust proportionally (Law 22)
5. **Preserve audit trail** — immutable record tied to a specific binding event (Law 24)

**Law 20** further requires every Complaint to declare ≥1 TEKRR dimension — dimensions exist only on the **Contract's TEKRR snapshot**, not on Actions in draft or on provider profiles.

**Distinction: Issue vs Complaint**

- An **Issue** is a pre-formal flag during Active execution — still requires an Active **Contract** (State Machine v1).
- A **Complaint** is formal dispute resolution — requires a **Contract** in an eligible state and passes triage.

Neither Issues nor Complaints may exist without a contract record.

---

## Decision

**Every Complaint must originate from a Contract.**

A Complaint record **must** include:

| Field | Requirement |
|-------|-------------|
| `contract_id` | Valid FK to an existing Contract — **mandatory, non-null** |
| `tekrr_dimensions[]` | ≥1 dimension from Contract's TEKRR snapshot — **mandatory** |
| `complaint_types[]` | Mapped to declared dimensions — **mandatory** |
| `filed_by_user_id` | Must be a Contract party — **mandatory** |

**Forbidden Complaint origins:**

| Origin | Status |
|--------|--------|
| Complaint against a Provider profile | **Rejected** |
| Complaint against an Action without Contract | **Rejected** |
| Complaint against a Customer profile | **Rejected** (MVP) |
| Complaint against a service listing | **Rejected** (ADR-001) |
| Complaint with only free-text grievance | **Rejected** at triage (EL-8, Law 20) |
| Complaint without `contract_id` | **Rejected** at API layer |

**Eligible Contract states for filing** (Contract Engine authoritative):

| State | Filing allowed | Notes |
|-------|:--------------:|-------|
| `active` | Yes | During execution |
| `issue_raised` | Yes | Pre-formal issue may precede |
| `disputed` | Yes* | *Only if new dimension; EL-6 blocks duplicate active dimension |
| `completed` | Yes | Within `complaint_window_ends_at` (EL-3) |
| `draft`, `proposed`, `accepted` | No | No execution record yet |
| `void`, `cancelled` | No | Terminal without completion path |
| `resolved`, `closed` | No | Issue path terminal |

**Post-completion rule:** Contract status remains `completed` during post-completion Complaints — Contract does **not** transition to `disputed` (State Machine v1).

**Chain integrity:**

```
Action (1) → Contract (1) → Complaint (N, one active per dimension)
```

Every Complaint is traceable to exactly one Action via `complaint.contract_id → contract.action_id`.

---

## Consequences

### Complaint Engine

| Impact | Detail |
|--------|--------|
| **Filing gate** | `validateComplaintEligibility(contract_id)` called before `complaint.filed` |
| **Auto-dismiss** | Missing/invalid `contract_id` → `dismissed` with `CONTRACT_NOT_ACTIVE` or equivalent |
| **Evidence package** | Assembled from Contract artifacts at triage — snapshot, milestones, evidence, parties |
| **Case linkage** | Every formal Case references `contract_id`; `case_number` is operational, not a substitute for contract origin |
| **SLA** | 15 business days median from filing — clock starts only after valid contract validation |

### Contract Engine

| Impact | Detail |
|--------|--------|
| **Eligibility API** | Contract Engine owns EL-1–EL-5, EL-7; exposes pass/fail to Complaint Engine |
| **State transitions** | During execution: `issue_raised` → `disputed` on triage pass; post-completion: status unchanged |
| **Complaint window** | `complaint_window_ends_at` set at `completed` — gates EL-3 |
| **Template binding** | `eligible_complaint_types[]` per Action template — validated at EL-7 |
| **No contract, no dispute path** | Contract Engine rejects Issue/Complaint routing without Active-or-completed contract |

### Trust Engine

| Impact | Detail |
|--------|--------|
| **No pre-adjudication penalty** | `trust.complaint.filed` — audit only; no score change |
| **Dispute hold** | `trust.complaint.dispute_hold_applied` on `evidence_gathering` — contract excluded from aggregate |
| **Outcome on close** | `trust.complaint.resolved` requires `adjudication_id` + `contract_id` |
| **Single penalty locus** | Attestation updates on Contract dimensions; see Trust Engine v1.1 §4.5 |
| **No profile-level complaints** | Trust cannot penalize provider without contract-scoped adjudication |

### Action Engine

| Impact | Detail |
|--------|--------|
| **Dimension freeze** | `freezeDimension(contract_id, dimension, complaint_id)` — requires contract FK |
| **Attestation updates** | Adjudication outcomes write to `attestations` on Contract |
| **Milestone freeze** | Milestones link to `frozen_by_complaint_id` when dimension disputed |

### Entity model

| Impact | Detail |
|--------|--------|
| **FK constraint** | `complaints.contract_id NOT NULL` → `contracts.id` |
| **No orphan complaints** | Database rejects insert without contract |
| **Audit** | `complaint_status_history` rows always include resolvable contract context |

### Product and UX

| Impact | Detail |
|--------|--------|
| **Filing entry point** | Complaint UI launched from Contract detail — not from provider profile |
| **Copy** | "Dispute this contract" — not "Report this provider" |
| **Post-completion** | Filing available on completed contracts within window |
| **Rejected flows** | Generic "contact support about provider" routed outside Complaint Engine |

---

## Relationship to adjacent decisions

| Decision | Interaction |
|----------|-------------|
| **ADR-001** (Action-only) | Complaint → Contract → Action; no listing-level disputes |
| **Law 23** (Issue path) | Issue also requires Active Contract; Complaint formalizes dispute |
| **Law 15** (Evidence-based trust) | No standalone reviews; eval is post-contract, complaint is dispute |
| **Law 22** (Trust consequences) | Penalties require closed Complaint with contract-scoped outcome |

---

## Alternatives considered

| Alternative | Why rejected |
|-------------|--------------|
| **Provider-level complaints** ("Report this provider") | No obligation record; enables reputation attacks without contract evidence — violates Law 19 |
| **Action-level complaints without Contract** | Action alone has no immutable TEKRR snapshot or milestone evidence until Contract Active — violates Law 21 |
| **Optional contract_id** (nullable FK) | Allows free-floating disputes; cannot enforce EL rules or evidence package |
| **Post-hoc contract linking** | Admin attaches contract after filing — breaks filing-window integrity and party validation |
| **Generic support tickets as complaints** | Not dimension-specific; not trust-scored; duplicates non-accountability support channel |
| **Customer profile complaints (MVP)** | No client trust score MVP; no contract party symmetry — deferred Phase 2 with contract context |

---

## Compliance checklist (implementation)

- [ ] `complaints.contract_id` NOT NULL with FK to `contracts`
- [ ] `complaints.tekrr_dimensions` NOT NULL, min length 1
- [ ] API rejects POST `/complaints` without valid `contract_id`
- [ ] Filing UI only accessible from Contract context (party-authenticated)
- [ ] EL-1–EL-8 enforced before `evidence_gathering`
- [ ] Evidence auto-package pulls from Contract-linked entities only
- [ ] Trust events include `contract_id` in payload
- [ ] No "report provider" or "report user" endpoint in Complaint Engine
- [ ] Post-completion complaints do not mutate Contract status off `completed`
- [ ] Dismissal reason codes include contract eligibility failures

---

## Related documents

| Document | Relationship |
|----------|--------------|
| [Core Principles v1](../../APP13-Core-Principles-v1.md) | Law 19–23 — constitutional authority |
| [Contract Engine v1](../../APP13-Contract-Engine-v1.md) | §17 Complaint eligibility |
| [Complaint Lifecycle v1](../06-complaint-lifecycle.md) | State machine, EL rules, evidence package |
| [State Machine v1](../../APP13-State-Machine-v1.md) | Contract ↔ Complaint sync |
| [Trust Engine v1.1](../../APP13-Trust-Engine-v1.1.md) | Complaint → trust event chain |
| [ADR-001](./ADR-001-Action-Only.md) | Action → Contract → Complaint chain |

---

## Summary

APP13 does not adjudicate vague grievances against people, profiles, or listings. **Every Complaint must originate from a Contract** because only a Contract provides the immutable TEKRR snapshot, milestone evidence, party binding, filing windows, and dimensional vocabulary required for fair adjudication and proportional trust consequences.

No contract → no complaint → no trust penalty.

---

*ADR-002 accepted. No existing files were modified.*
