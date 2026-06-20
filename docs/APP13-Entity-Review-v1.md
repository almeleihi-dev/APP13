# APP13 Entity Model — Review v1

**Version:** 1.0  
**Status:** Review findings  
**Last updated:** June 19, 2026  
**Subject:** [APP13 Entity Model v1](./APP13-Entity-Model-v1.md)  
**Reviewer scope:** Missing entities, relationships, scalability, Trust Score, Complaint workflow

---

## Executive summary

Entity Model v1 delivers a **clear MVP-centric core** aligned with the constitutional chain (`Action → Contract → Milestone → Evidence → Trust → Complaint`). The ten named entities are sufficient to begin implementation scaffolding.

However, compared to [Architecture Database Entities v1](./architecture/03-database-entities.md), [Complaint Lifecycle v1](./architecture/06-complaint-lifecycle.md), and [TEKRR Framework v1](./APP13-TEKRR-Framework-v1.md), the model **compresses or omits several entities required to enforce platform laws** (especially Law 13 attestation, Law 24 immutable record, and Law 16 event-sourced trust).

**Overall assessment:**

| Area | Rating | Summary |
|------|--------|---------|
| MVP core coverage | Good | Ten entities cover the happy path |
| Constitutional completeness | Partial | Attestation, audit, verification history gaps |
| Cross-doc alignment | Partial | Complaint states and architecture entities diverge |
| Scalability readiness | Moderate | JSONB + 1:1 constraints will constrain Phase 2–3 |
| Trust Score design | Moderate | Event table exists but evaluation and decay not modeled |
| Complaint design | Weak | Single-table complaint insufficient for full lifecycle |

**Recommendation:** Proceed to implementation with Entity Model v1 as **MVP baseline**, but plan **Entity Model v1.1** before writing migration files — do not treat the schema draft as complete.

---

## 1. Missing entities

Entities present in architecture specs or platform laws but **absent or inadequately represented** in Entity Model v1.

### 1.1 Critical for MVP (should add before migrations)

| Missing entity | Why it matters | Referenced in |
|----------------|----------------|---------------|
| **Verification** | `users.verification_tier` is denormalized; no history of T1/T2 submissions, expiry, rejection, or admin review. Law 18 cannot be fully audited. | Architecture `verifications`, MVP Scope §1.2 |
| **Credential** | Provider trade licenses linked to Knowledge (K) dimension and contract templates requiring T2. Tier alone is insufficient. | Architecture `credentials`, Contract templates |
| **Attestation** | TEKRR per-dimension fulfillment (`FUL`/`PAR`/`UNF`) is central to Execution Success (30%) and complaints. Currently implied by milestone `accepted` status only. Law 13. | TEKRR Framework §4.3, Architecture `attestations` |
| **CustomerEvaluation** | Trust Score component (10%) has no entity. Structured post-completion eval is in MVP Scope and Contract Engine chain. | Contract Engine chain, TEKRR Framework §10.3 |
| **ContractStatusHistory** | Law 24 — immutable append-only transitions. Contract row overwrites `status` only. | Core Principles Law 24, Architecture §5.7 |
| **ComplaintEvidence** | Complaint lifecycle requires party uploads **and** auto-attached package distinct from execution `evidence`. | Complaint Lifecycle §10 |
| **ComplaintStatusHistory** | Same Law 24 gap for complaints. | Architecture §6.4 |

### 1.2 Important for MVP operability (admin and support)

| Missing entity | Why it matters |
|----------------|----------------|
| **Adjudication** | Architecture separates `adjudications` from `complaints`. Entity model flattens `outcome`, `severity`, `findings` onto complaint row — loses multi-dimension per-outcome and audit separation. |
| **ContractParty** | Acceptance is two timestamp columns on `contracts`. No record of party role, acceptance IP, user agent, or per-party tier at sign (Law 9 audit). |
| **AuditEvent** | Cross-cutting admin actions, tier changes, score appeals — no home in ten-entity model. |
| **ProviderInvite / ActionInvite** | `invited_provider_email` on Action is insufficient once provider registers; no invite token, expiry, or accept audit. |

### 1.3 Deferred but architecturally anticipated (Phase 2+)

| Missing entity | Phase | Why plan early |
|----------------|-------|----------------|
| **TEKRRSnapshot** (versioned) | 2 | Amendments need snapshot chain; only `contracts.tekrr_snapshot` exists |
| **ContractAmendment** | 2 | Roadmap Phase 2; 1:1 Action–Contract blocks without amendment entity |
| **ContractDocument** | 2 | PDF vs JSON hashes; separate from contract row for integrity |
| **MediationRecord** | 2 | Complaint lifecycle mediation proposals |
| **CompanyMember** | 3 | Institutional integrations |
| **Notification** | 2 | Email + in-app triggers across lifecycle |
| **Session** | 1 impl | Auth sessions not modeled (may live outside domain DB) |
| **Obligation** | 2 | Architecture separates obligations from milestones; model collapses to milestones only — may lose TEKRR obligation graph fidelity |

### 1.4 Entity naming inconsistencies (not missing but fragmented)

| Entity Model v1 | Architecture v1 | Risk |
|-----------------|-----------------|------|
| `users` | `actors` | Role/admin modeling diverges |
| `customers` | `customer_profiles` | Same concept, different name |
| `providers` | `provider_profiles` | Same |
| `companies` | `org_profiles` | Company vs org_type (gov, insurance) not extensible |
| `trust_scores` | `trust_profiles` | Naming drift across docs |

---

## 2. Missing relationships

Relationships implied by platform behavior but **not defined or not enforceable** in Entity Model v1.

### 2.1 Critical missing relationships

| From | To | Gap |
|------|-----|-----|
| **Complaint** | **Milestone** | No link when issue is milestone-specific (Issue Raised on M-VERIFY). Cannot freeze the correct checkpoint. |
| **Complaint** | **Attestation** | Adjudication must update dimension fulfillment; no FK or join path. |
| **Complaint** | **Provider** / **Customer** | Only `filed_by_user_id`. Respondent party not explicit; complicates party notifications. |
| **CustomerEvaluation** | **Contract** | Entity does not exist; 10% trust component orphaned. |
| **Verification** | **User** | Tier on user with no FK to active verification records. |
| **Credential** | **Provider** | Knowledge dimension in contracts references credentials not modeled. |
| **TrustScoreEvent** | **Evidence** | Chain Law 14; events reference generic `source_entity_id` without typed FKs or constraints. |
| **TrustScoreEvent** | **CustomerEvaluation** | Evaluation → trust path unspecified. |
| **Contract** | **Customer** / **Provider** | Only via Action; no direct party relationship for queries ("all contracts for provider X"). |
| **Milestone** | **Attestation** | One attestation per TEKRR dimension per contract — not linked to milestones that prove it. |

### 2.2 State synchronization relationships (implicit, undocumented)

| Relationship | Gap |
|--------------|-----|
| **Action.status** ↔ **Contract.status** | Two parallel state machines (`contract_active` vs `active`, `completed` on both). No documented sync rules or single source of truth. Risk of drift. |
| **Contract.status** ↔ **Complaint.status** | `issue_raised` / `disputed` on contract vs complaint lifecycle states — no FK from contract to active complaint. |
| **Milestone.status** ↔ **Complaint freeze** | `frozen` milestone status exists but no `frozen_by_complaint_id` (architecture Action Engine had this). |

### 2.3 Cardinality gaps for future phases

| Current | Needed later | Blocker |
|---------|--------------|---------|
| Action 1:1 Contract | Action 1:N Contract (amendments, renewals) | `contracts.action_id UNIQUE` |
| User 1:1 Customer OR Provider | User 1:1 Customer AND 1:1 Provider (dual role) | `role` enum single value |
| Company N:1 Customer | Company 1:N Members, Company N:N Provider endorsements | No join tables |
| Provider 1:1 TrustScore | Provider 1:N TrustScoreHistory (appeals, version changes) | Single row overwrite |

### 2.4 Recommended relationship additions (v1.1)

```
Contract ──1:N──▶ ContractParty (customer, provider)
Contract ──1:N──▶ Attestation (per TEKRR dimension)
Contract ──1:0..1──▶ CustomerEvaluation
Complaint ──N:1──▶ Contract
Complaint ──1:N──▶ ComplaintEvidence
Complaint ──0..N──▶ Milestone (affected milestones)
Complaint ──0..1──▶ Adjudication
Provider ──1:N──▶ Verification
Provider ──1:N──▶ Credential
User ──1:N──▶ TrustScoreEvent (via provider, for appeals on events)
```

---

## 3. Future scalability risks

### 3.1 Schema design risks

| Risk | Severity | Detail |
|------|----------|--------|
| **JSONB TEKRR blobs** | High | `actions.tekrr_profile` and `contracts.tekrr_snapshot` lack schema validation at DB layer. Querying by risk level, deadline, or credential across contracts requires full-table JSON scans. |
| **1:1 Action–Contract UNIQUE** | High | Blocks amendments, contract renewal, multi-phase engagements (Roadmap Phase 2). Requires migration to drop constraint. |
| **Denormalized trust counters** | Medium | `contract_count`, `complaint_upheld_count` on `trust_scores` will drift without transactional discipline or periodic reconciliation jobs. |
| **PostgreSQL ENUM types** | Medium | Many enums in schema draft; adding complaint states (e.g. `pending_external`) requires `ALTER TYPE` migrations — painful at scale. Prefer lookup tables or text + check for evolving lifecycles. |
| **ON DELETE CASCADE** | High | `milestones` and `evidence` CASCADE on contract delete conflicts with Law 24 retention (7+ years). Soft-delete or archive strategy needed. |
| **Recurring milestone uniqueness** | Medium | `UNIQUE (contract_id, sequence_order)` fails for D.1.1 / G.1.1 where many sessions share pattern — `session_index` exists but uniqueness model is wrong. |

### 3.2 Identity and multi-actor risks

| Risk | Severity | Detail |
|------|----------|--------|
| **Single role per User** | Medium | Real users may be customer and provider on different Actions. MVP constraint creates duplicate accounts → trust fragmentation (violates Law 17 spirit). |
| **Company stub without members** | Medium | Phase 3 requires `company_members`, KYB, org-scoped RBAC — no foundation in v1. |
| **verification_tier on User** | Medium | Stale tier if credential expires but user row not updated; contracts activated with wrong snapshot context. |

### 3.3 Query and volume risks

| Risk | Severity | Detail |
|------|----------|--------|
| **trust_score_events unbounded** | Medium | Append-only with no partition/archival strategy; hot provider accumulates millions of rows. |
| **No composite indexes for admin queues** | Low | Complaint triage needs `(status, filed_at)`; verification queue needs `(status, submitted_at)` — verification table missing entirely. |
| **Provider slug UNIQUE** | Low | Phase 2 public profiles; global uniqueness may conflict multi-jurisdiction. |

### 3.4 Cross-engine scalability

| Risk | Severity | Detail |
|------|----------|--------|
| **Collapsed Action + Contract status** | Medium | Two engines updating related rows without event sourcing increases race conditions at scale. |
| **No outbox / domain events table** | Medium | Architecture specifies `domain_outbox`; entity model omits it — async trust recomputation harder to scale. |
| **No read replicas consideration** | Low | Trust profile public reads will dominate; write path on `trust_scores` contends with reads. |

### 3.5 Mitigation priorities (v1.1)

1. Add `Attestation`, `Verification`, `CustomerEvaluation` before MVP launch.
2. Replace CASCADE with soft-delete + retention policy on contractual records.
3. Fix milestone uniqueness for recurring sessions (`UNIQUE (contract_id, sequence_order, session_index)` or drop sequence uniqueness).
4. Plan Action–Contract 1:N migration path (nullable `parent_contract_id` or amendment table).
5. Document JSONB TEKRR JSON Schema validation at application layer.

---

## 4. Trust Score weaknesses

Analysis of `trust_scores` and `trust_score_events` against [TEKRR Framework v1](./APP13-TEKRR-Framework-v1.md) and [Approval Addendum v1.1](./architecture/APPROVAL-ADDENDUM-v1.1.md).

### 4.1 Structural weaknesses

| Weakness | Impact | Detail |
|----------|--------|--------|
| **No CustomerEvaluation entity** | High | 10% weight (evaluation_component) has no source record. Score cannot be reproduced or appealed. |
| **No Attestation linkage** | High | Execution Success (30%) derives from TEKRR fulfillment ratings — not stored per contract/dimension. |
| **Verification split-brain** | Medium | `verification_component` on trust_scores vs `users.verification_tier` — no FK ensuring consistency. |
| **No pending complaint exclusion** | High | TEKRR Framework: contracts with `PEN` disputes excluded from aggregate — not modeled in events or score row. |
| **No recency decay** | Medium | Framework specifies 24-month decay; entity model stores only current aggregates. |
| **No risk normalization factor** | Medium | Complaints component should multiply by action risk level — not in payload schema. |
| **No score history snapshots** | Medium | Law 25 versioning — only `score_version` string; past scores lost on recompute (appeals impossible). |

### 4.2 Computation and integrity weaknesses

| Weakness | Impact | Detail |
|----------|--------|--------|
| **Component scores pre-aggregated** | Medium | Storing 0–1000 sub-components without raw inputs prevents algorithm changes (Law 25 prospective-only needs historical inputs). |
| **trust_score_events untyped payload** | Medium | JSONB `payload` without schema per `event_type` — debugging and replay fragile. |
| **repeat_customer_rate denormalized** | Low | No `contract_parties` or customer-provider engagement table to recompute. |
| **confidence_band rules not encoded** | Low | "Low until 3 contracts" — business rule only in TEKRR doc, not entity constraint. |
| **Provider-only scores** | By design (MVP) | Frivolous complaint filers (customers) unaccountable — Phase 2 gap noted in Complaint Lifecycle. |

### 4.3 Trust chain gaps in ERD

```
Evidence ──▶ TrustScoreEvent     ✅ (generic)
Contract ──▶ TrustScoreEvent     ✅ (generic)
Complaint ──▶ TrustScoreEvent    ✅ (generic)
CustomerEvaluation ──▶ ???       ❌ missing entity
Attestation ──▶ TrustScoreEvent  ❌ missing entity
Verification expiry ──▶ ???      ❌ missing event type
Milestone on_time ──▶ ???        ❌ time_component source unclear
```

### 4.4 Recommendations for Trust Score (v1.1)

| Priority | Change |
|----------|--------|
| P0 | Add `customer_evaluations` table FK → contracts |
| P0 | Add `attestations` table (contract_id, dimension, fulfillment_rating, source) |
| P0 | Add `trust_score_snapshots` or versioned history rows on recompute |
| P1 | Add `trust_score_events.event_type` enum and JSON Schema per type |
| P1 | Store `risk_level_at_contract` on trust events from contract snapshot |
| P2 | Add `customer_trust_flags` for frivolous complaint pattern (Phase 2) |

---

## 5. Complaint workflow gaps

Comparison of `complaints` entity against [Complaint Lifecycle v1](./architecture/06-complaint-lifecycle.md) and [Core Principles v1](./APP13-Core-Principles-v1.md) Laws 19–23.

### 5.1 State machine misalignment

| Architecture state | Entity Model v1 | Gap |
|--------------------|-----------------|-----|
| `resolved_upheld` | `resolved` (generic) | Granular outcomes lost |
| `resolved_dismissed` | `resolved` or `dismissed` | Conflation of triage dismiss vs adjudication dismiss |
| `resolved_mutual` | Missing | Mediation success not distinguished |
| `resolved_shared` | Missing | Shared fault outcome not a status |
| `escalated_external` | Missing | Phase 5 path absent from enum |
| `pending_external` | Missing | External wait state absent |

**Risk:** Application logic must infer outcome from `outcome` enum while `status` also says `resolved` — dual source of truth.

### 5.2 Missing complaint data fields

| Field / concept | Required by | Present in v1? |
|-----------------|-------------|----------------|
| `dismissed_reason_code` | Complaint Lifecycle EL codes | No |
| `assigned_admin_id` / `triaged_by` | SLA operational queues | No |
| `window_valid` / `eligibility_snapshot` | Filing gate audit | No |
| `active_dimension` unique constraint | EL-6 one per dimension | No DB constraint |
| `linked_milestone_ids` | Dimension freeze | No |
| `mediation_deadline_at` / SLA timestamps | 15-day MVP SLA | No |
| `frivolous_flag` on filer | Pattern detection | No |
| Per-dimension outcome JSON | Multi-dimension complaints | Flat `outcome` enum only |
| `external_referral_target` | Phase 5 escalation | No |

### 5.3 Missing related entities for workflow

| Entity | Workflow step unsupported |
|--------|---------------------------|
| **ComplaintEvidence** | Evidence gathering (party upload + auto-attach) |
| **Adjudication** | Separate findings from complaint row |
| **MediationRecord** | Mediation proposals and responses |
| **ComplaintStatusHistory** | Law 24 audit trail |
| **Issue** (optional) | `issue_raised` on contract before formal complaint |

### 5.4 Contract ↔ Complaint integration gaps

| Gap | Detail |
|-----|--------|
| **No FK Contract → active Complaint** | Cannot enforce one disputed state per contract cleanly. |
| **Contract `issue_raised` without Complaint** | Issue path starts on contract; entity model does not link pre-complaint issues. |
| **Milestone `frozen` without complaint_id** | Freeze scope undefined when multiple dimensions disputed. |
| **Post-completion vs active filing** | EL-2 references contract statuses (`in_execution`, `pending_completion`) not in entity contract enum — enum uses `active`, `completed` only. |

### 5.5 Complaint → Trust integration gaps

| Gap | Detail |
|-----|--------|
| **Severity at resolution not tied to event** | `severity` on complaint row but trust_score_events payload undefined. |
| **Upheld complaint must update Attestation** | No attestation entity to receive `UNF`/`PAR`. |
| **Closed vs Resolved ordering** | TEKRR Framework: trust updates on `closed`; entity has both `resolved` and `closed` without transition rules. |

### 5.6 Recommendations for Complaint model (v1.1)

| Priority | Change |
|----------|--------|
| P0 | Split `status` (lifecycle) from `outcome` (adjudication result) — align with architecture doc |
| P0 | Add `complaint_evidence` table |
| P0 | Add `complaint_status_history` table |
| P0 | Add `complaint_dimension_outcomes` JSON or child table for multi-dimension rulings |
| P1 | Add `assigned_to`, `sla_due_at`, `dismissed_reason_code` |
| P1 | Add `milestones.frozen_by_complaint_id` FK |
| P2 | Add `mediation_records`, `adjudications` as separate tables |

---

## 6. Cross-cutting findings

### 6.1 Strengths of Entity Model v1

- Clear MVP focus — ten entities map cleanly to product language.
- Constitutional FK rules on complaints and evidence are correct directionally.
- `trust_score_events` append-only pattern supports Law 16.
- TEKRR embedded in Action/Contract aligns with TEKRR Framework.
- Contract status includes issue path (approved addendum).

### 6.2 Highest-risk gaps (fix before implementation)

| Rank | Gap | Category |
|------|-----|----------|
| 1 | No **Attestation** entity | Missing entity |
| 2 | No **CustomerEvaluation** entity | Missing entity / Trust |
| 3 | No **Verification** / **Credential** entities | Missing entity |
| 4 | Complaint state/outcome conflation | Complaint |
| 5 | CASCADE delete on contractual records | Scalability / Law 24 |
| 6 | Action 1:1 Contract UNIQUE | Scalability |
| 7 | No status history tables | Missing entity / Law 24 |
| 8 | Action vs Contract status drift | Missing relationship |

### 6.3 Suggested Entity Model v1.1 scope

**Add (MVP-blocking):** Verification, Credential, Attestation, CustomerEvaluation, ContractStatusHistory, ComplaintEvidence, ComplaintStatusHistory, ContractParty

**Add (MVP-support):** Adjudication (or normalize complaint status/outcome)

**Defer (Phase 2+):** Amendment, TEKRRSnapshot chain, MediationRecord, Notification, CompanyMember

---

## 7. Document alignment matrix

| Source document | Alignment with Entity Model v1 |
|-----------------|--------------------------------|
| Core Principles v1 | Partial — Laws 13, 24 under-supported |
| MVP Scope v1 | Good — ten entities match MVP list |
| TEKRR Framework v1 | Partial — attestations and fulfillment ratings missing |
| Complaint Lifecycle v1 | Weak — states and evidence package gaps |
| Architecture DB Entities v1 | Partial — significant subset omitted |
| Contract Engine v1 | Partial — evaluation and party acceptance gaps |

---

## 8. Conclusion

Entity Model v1 is a **solid MVP sketch** but **not yet a complete domain model** for APP13's constitutional requirements. The largest gaps cluster around:

1. **Execution attestation** (the bridge between Evidence and Trust)
2. **Verification history** (the bridge between Identity and Trust)
3. **Complaint evidentiary and state machinery** (the bridge between Contract and Trust penalties)
4. **Immutable audit trails** (Law 24)

Addressing the P0 items in §6.2 before database migrations will reduce rework across Identity, Action, Contract, Complaint, and Trust engines.

---

**Next suggested deliverable:** `APP13-Entity-Model-v1.1.md` (additive — do not rewrite v1 history)

---

*Review complete. No existing files were modified.*
