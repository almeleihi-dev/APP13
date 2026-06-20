# APP13 Database Architecture — Review v1

**Version:** 1.0  
**Status:** Review findings  
**Last updated:** June 19, 2026  
**Subject:** [APP13 Database Architecture v1](./APP13-Database-Architecture-v1.md)  
**Reviewer scope:** Missing entities, FKs, circular dependencies, performance, audit, Trust/Contract/Complaint/Evidence gaps, MVP simplifications

---

## Executive summary

Database Architecture v1 is a **substantial improvement** over Entity Model v1 alone. It correctly introduces schema boundaries, closes most Entity Review gaps (attestations, verifications, case/issue, status history, domain outbox), and aligns constitutionally with ADR-001/002/003.

However, several **P0 gaps remain** that will block correct enforcement at the database layer or cause migration/runtime failures:

| Area | Rating | Summary |
|------|--------|---------|
| Domain & schema design | Good | Seven schemas map cleanly to engines |
| Table inventory completeness | Good | 28 tables cover MVP chain |
| FK integrity | Partial | Polymorphic refs, missing escalation links, EL-6 not enforceable |
| Constitutional enforcement | Partial | JSONB dimension arrays bypass partial uniques |
| Trust Engine v1.1 alignment | Partial | Attestation milestone binding, eval columns, idempotency |
| Complaint workflow | Partial | Dimension junction, issue link, SLA fields missing |
| Evidence chain | Partial | Cross-contract integrity, immutability after attestation |
| Audit (Law 24) | Partial | Action, Issue, Case history tables absent |
| Performance | Moderate | Provider contract queries, JSONB scans, event table growth |

**Recommendation:** Treat Database Architecture v1 as **implementation-ready after P0 fixes**. Do not write SQL migrations until v1.1 architecture patch addresses items below.

---

## Review methodology

Findings were cross-checked against:

- [Core Principles v1](../APP13-Core-Principles-v1.md) (Laws 11–24)
- [Entity Model v1](../APP13-Entity-Model-v1.md) · [Entity Review v1](../APP13-Entity-Review-v1.md)
- [State Machine v1](../APP13-State-Machine-v1.md)
- [Trust Engine v1.1](../APP13-Trust-Engine-v1.1.md)
- [Contract Engine v1](../APP13-Contract-Engine-v1.md)
- [Complaint Lifecycle v1](./06-complaint-lifecycle.md)
- [ADR-001](./adr/ADR-001-Action-Only.md) · [ADR-002](./adr/ADR-002-Complaint-Origin.md) · [ADR-003](./adr/ADR-003-Trust-Authority.md)

---

## P0 — Must fix before migrations

### 1. Missing entities

| ID | Finding | Source | Fix |
|----|---------|--------|-----|
| **P0-E1** | **`complaint_dimensions` junction table missing.** EL-6 requires one active complaint per `(contract_id, tekrr_dimension)`. Architecture defines partial unique on scalar `dimension`, but `complaints.tekrr_dimensions` is a JSONB array — PostgreSQL cannot enforce per-element uniqueness. | Complaint Lifecycle EL-6; §8.3 partial unique | Add `complaint.complaint_dimensions (complaint_id, tekrr_dimension)` with partial unique on `(contract_id, tekrr_dimension)` via denormalized `contract_id` on junction row |
| **P0-E2** | **`issue_dimensions` / `issue_milestones` junction missing.** Issues require ≥1 TEKRR dimension or milestone reference (Invariant I-1). No structured storage beyond implied JSON. | State Machine v1 §3 | Add `issue_dimensions (issue_id, tekrr_dimension)` and `issue_milestones (issue_id, milestone_id)` |
| **P0-E3** | **`action_status_history` missing.** State Machine v1 §1 requires append-only history for every stateful entity; convention states all transitions to `*_status_history`. | State Machine v1 §Conventions | Add `action.action_status_history` |
| **P0-E4** | **`issue_status_history` and `case_status_history` missing.** Same Law 24 requirement for Issue and Case lifecycles. | State Machine v1 §3, §5; Law 24 | Add both tables under `complaint` schema |

### 2. Missing foreign keys

| ID | Finding | Source | Fix |
|----|---------|--------|-----|
| **P0-F1** | **`complaints.issue_id` FK absent.** Escalation path links Issue → Complaint; Trust events reference `issue_id`. No join path from complaint back to originating issue. | State Machine §3.6, §4; Trust v1.1 `trust.issue.raised` | Add `complaints.issue_id → issues.id` (nullable) |
| **P0-F2** | **`milestones.frozen_by_complaint_id` indexed but not in FK inventory.** ADR-002 requires milestone freeze binding; index exists (§9.3) but §7.1 omits FK. | ADR-002; §9.3 | Add FK `milestones.frozen_by_complaint_id → complaints.id` |
| **P0-F3** | **`trust_score_events.contract_id` denormalized without FK.** Nullable column for query performance but no referential integrity — orphan events possible, breaking explainability. | ADR-003; Trust v1.1 §2 | Add FK to `contract.contracts` (nullable, RESTRICT) |
| **P0-F4** | **`attestation_evidence` lacks contract-consistency FKs.** Junction links attestation ↔ evidence but does not enforce both belong to same `contract_id`. Cross-contract evidence binding possible. | Law 13; CK-3 | Add CHECK/trigger: attestation.contract_id = evidence.contract_id; optional composite FK via contract_id on junction |
| **P0-F5** | **`attestations` missing `milestone_ids` persistence.** Trust v1.1 §2.1 and §6.7 require `milestone_ids[]` in attestation payloads. Architecture replaced UUID[] with junction for evidence only — milestone trace lost at rest. | Trust v1.1 P0-5 | Add `attestation_milestones (attestation_id, milestone_id)` junction OR `milestone_ids UUID[]` column with GIN index |

### 3. Circular dependencies

| ID | Finding | Source | Fix |
|----|---------|--------|-----|
| **P0-C1** | **Execution ↔ Complaint FK cycle:** `attestations.frozen_by_complaint_id → complaints` while complaints depend on contracts that depend on milestones/attestations. Migration M5 (execution) precedes M7 (complaint) but attestations reference complaints. | §7.1; §17.2 M5/M7 | Defer `frozen_by_complaint_id` FK to **M7b** migration after complaints table exists; document two-phase DDL |
| **P0-C2** | **Runtime write cycle undocumented:** Complaint close updates attestations (Action Engine) while attestations FK to complaints. Architecture says cross-schema writes in one transaction but does not define lock order — deadlock risk. | Trust v1.1 §7.2 recompute order | Document lock order: `complaints` → `adjudications` → `attestations` → `trust_score_events` in architecture v1.1 |

### 4. Performance risks

| ID | Finding | Source | Fix |
|----|---------|--------|-----|
| **P0-P1** | **EL-6 partial unique on JSONB is non-functional.** `uq_complaints_active_dimension` on `(contract_id, dimension)` cannot work with `tekrr_dimensions JSONB[]`. Duplicate active complaints per dimension undetectable at DB. | §8.3 | Resolved by P0-E1 `complaint_dimensions` junction |
| **P0-P2** | **Same issue for `uq_issues_active_dimension` and `uq_cases_active_contract_dimension`.** Scalar `primary_dimension` on cases/issues does not cover multi-dimension issues/complaints. | §8.3; State Machine CS-2 | Normalize dimensions to junction tables; partial unique on junction |

### 5. Audit gaps

| ID | Finding | Source | Fix |
|----|---------|--------|-----|
| **P0-A1** | **Action, Issue, Case lack status history tables** (see P0-E3, P0-E4). Law 24 and State Machine convention violated for three of six state machines. | State Machine v1; Law 24 | Add missing `*_status_history` tables |
| **P0-A2** | **`complaints` missing `dismissed_reason_code`.** Complaint Lifecycle defines EL dismissal codes (`OUT_OF_WINDOW`, `DUPLICATE_ACTIVE`, etc.) — no column to persist gate audit. | Complaint Lifecycle §5 | Add `dismissed_reason_code TEXT` on complaints |

### 6. Trust Engine gaps

| ID | Finding | Source | Fix |
|----|---------|--------|-----|
| **P0-T1** | **`customer_evaluations` column spec incomplete.** Trust v1.1 §2.2 requires `eval_form_id`, `dimension_scores`, `composite_score`, `submitted_at`. Architecture lists table but §15 omits column detail. | Trust v1.1 §2.2 | Add full column spec to architecture v1.1 |
| **P0-T2** | **`trust_score_snapshots` column spec incomplete.** Trust v1.1 requires `component_scores JSONB`, `score_version`, `computed_at`. Architecture mentions append-only but no column inventory. | Trust v1.1 §2.3 | Document snapshot columns explicitly |
| **P0-T3** | **No idempotency on event ingestion.** Duplicate domain outbox dispatch or retry can double-append trust events — score corruption. ADR-003 requires validated ingestion. | ADR-003; Trust v1.1 | Add `idempotency_key TEXT UNIQUE` on `trust_score_events` and `domain_outbox` |
| **P0-T4** | **`trust.evaluation.superseded` event has no persisted link.** Trust v1.1 §7.2 requires audit link to `complaint_id` when eval invalidated by adjudication. No column on `customer_evaluations` for supersession state. | Trust v1.1 §7.2 | Add `superseded_at`, `superseded_by_complaint_id` on customer_evaluations |

### 7. Contract Engine gaps

| ID | Finding | Source | Fix |
|----|---------|--------|-----|
| **P0-CE1** | **`contracts` party query path requires 3-table join** (contracts → actions → providers/customers). Contract Engine admin queues and collusion detection (Trust v1.1 §8.2) need provider/customer on contract. | Contract Engine; Trust v1.1 §8.2 | Denormalize `customer_id`, `provider_id` on `contracts` at activation (with CHECK against action FKs) |
| **P0-CE2** | **Milestone recurring-session uniqueness not specified.** Entity Review flagged `UNIQUE (contract_id, sequence_order)` failure for D.1.1/G.1.1 session patterns. Architecture silent on milestone uniqueness constraint. | Entity Review §3.1 | Add `uq_milestones_contract_sequence_session (contract_id, sequence_order, session_index)` |

### 8. Complaint workflow gaps

| ID | Finding | Source | Fix |
|----|---------|--------|-----|
| **P0-CM1** | **Complaint granular states documented in §14.2 but Entity Model generic `resolved` still referenced in constitutional matrix.** Architecture correctly lists State Machine states — ensure no `resolved` catch-all in implementation. | State Machine §4.1 vs Entity Model §1.9 | Explicitly forbid generic `resolved` status in CK constraint; use `resolved_*` substates only |
| **P0-CM2** | **`complaint_evidence` polymorphic reference without typed FK.** `reference_entity_type` + `reference_entity_id` can point to execution evidence but no FK enforcement — broken auto-attach audit chain. | Complaint Lifecycle PL-9 | Add optional `execution_evidence_id FK` when source = `auto_attached`; CHECK mutual exclusivity with storage_key |
| **P0-CM3** | **`adjudications` per-dimension outcomes underspecified.** Entity Review requires per-dimension JSON; architecture mentions it in §14.3 but no column names (`dimension_outcomes JSONB`, `findings`, `decided_by_user_id`). | Complaint Lifecycle PL-4, PL-8 | Full adjudication column spec |

### 9. Evidence chain weaknesses

| ID | Finding | Source | Fix |
|----|---------|--------|-----|
| **P0-EV1** | **CK-2 (evidence.contract_id matches milestone) marked application-only.** Law 11 orphan prevention should be DB-enforced via trigger or denormalized CHECK with milestone subquery. | §8.2 CK-2; Law 11 | Elevate to required DB trigger in migration spec |
| **P0-EV2** | **Content hash duplicate rejection optional.** §15.1 says "UNIQUE per contract optional" — Trust v1.1 §8.1 lists duplicate rejection as abuse protection. | Trust v1.1 §8.1 | Add `uq_evidence_contract_content_hash (contract_id, content_hash)` WHERE content_hash IS NOT NULL |

### 10. MVP simplifications (P0 acceptance criteria)

These simplifications are **acceptable for MVP** but must be **explicitly signed off** — they are not bugs, but implementers must not assume full enforcement:

| ID | Simplification | Risk if undocumented |
|----|----------------|---------------------|
| **P0-M1** | Polymorphic `source_entity_id` on trust events — no typed FK per entity | Orphan references; mitigated by idempotency + JSON Schema validation |
| **P0-M2** | Taxonomy/templates as deployment artifacts, not DB tables | Admin cannot edit templates at runtime — OK for MVP |
| **P0-M3** | Single role per user (CK-8 application-only) | Dual-role users need duplicate accounts |

---

## P1 — Recommended before MVP launch

### 1. Missing entities

| ID | Finding | Fix |
|----|---------|-----|
| **P1-E1** | **`action_invites` table missing.** Entity Model `invited_provider_email` on actions insufficient for token, expiry, accept audit. | Add `action.action_invites (action_id, email, token_hash, expires_at, accepted_at)` |
| **P1-E2** | **`verification_status_history` missing.** Tier changes need Law 24 trail beyond verifications row overwrite. | Add append-only history or status transitions on verifications |
| **P1-E3** | **`complaint_milestones` junction missing.** Milestone-specific disputes (M-VERIFY freeze) need explicit link. | Add `complaint_milestones (complaint_id, milestone_id)` |
| **P1-E4** | **`domain_event_consumption` / inbox dedup table.** Trust Engine ingesting from outbox needs consumer offset tracking. | Add `platform.domain_event_consumption (consumer_id, event_id, processed_at)` |

### 2. Missing foreign keys

| ID | Finding | Fix |
|----|---------|-----|
| **P1-F1** | **`complaints.assigned_admin_user_id`, `resolved_by_user_id` — no FK to users.** Referenced in §14.2 implicitly. | Add FKs to `identity.users` |
| **P1-F2** | **`cases.opened_by_user_id` missing.** Case creation audit incomplete. | Add FK on cases |
| **P1-F3** | **`issues.milestone_id` or junction FK missing.** Issue raised on specific milestone — only contract_id listed. | Add milestone FK or issue_milestones junction |
| **P1-F4** | **`attestation_evidence.milestone_id` — FK listed as optional trace but not in §7.1.** | Add FK to milestones |
| **P1-F5** | **`trust_score_event_corrections` missing `provider_id` FK.** Recompute scoping requires provider context without join through original event. | Denormalize provider_id on corrections row |

### 3. Circular dependencies

| ID | Finding | Fix |
|----|---------|-----|
| **P1-C1** | **Case ↔ Issue bootstrap order:** `cases.issue_id` nullable, `issues.case_id` nullable — chicken-and-egg on Issue raised → Case open. | Document: create Case first in same transaction, then update Issue.case_id; or use deferred FK constraint |

### 4. Performance risks

| ID | Finding | Fix |
|----|---------|-----|
| **P1-P1** | **No GIN index on JSONB TEKRR fields.** Risk-level queries, credential requirements across contracts require full scan. | Add `idx_actions_tekrr_profile_gin`, `idx_contracts_tekrr_snapshot_gin` (path-specific ops) |
| **P1-P2** | **`trust_score_events` provider recompute scan** — index `(provider_id, occurred_at)` exists but high-volume providers need BRIN or partitioning plan earlier than 10M rows. | Document partition at 1M rows for MVP scale planning |
| **P1-P3** | **Admin complaint queue index incomplete.** Needs `(status, filed_at)` — partially covered; add partial index `WHERE status IN ('triage_pending', 'evidence_gathering', 'adjudication_pending')`. | Partial index for active queues |
| **P1-P4** | **Collusion detection query** requires rolling window scan of actions by `(provider_id, customer_id)`. | Add composite index `idx_actions_provider_customer_created` |
| **P1-P5** | **`domain_outbox` missing `(engine_source, created_at)` index** for dispatcher fan-out. | Add index |

### 5. Audit gaps

| ID | Finding | Fix |
|----|---------|-----|
| **P1-A1** | **`audit_events` lacks `correlation_id` / `causation_id`.** Cross-engine flows (complaint close → attestation update → trust recompute) not traceable as single chain. | Add UUID correlation columns |
| **P1-A2** | **No audit trail for `users.verification_tier` changes.** Denormalized tier on user row overwritten without history. | Verification history (P1-E2) or audit_events on every tier change |
| **P1-A3** | **`contract_parties` decline path underdocumented.** `declined_at` listed but no status_history for party acceptance. | Add `contract_party_events` append-only or include in audit_events |
| **P1-A4** | **`mediation_records` lacks status/history.** Mediation proposals and responses not auditable beyond row state. | Add `mediation_status` + history or version column |

### 6. Trust Engine gaps

| ID | Finding | Fix |
|----|---------|-----|
| **P1-T1** | **`trust_scores.record_state` transitions not historized.** Dispute hold / frozen / active changes lost except via events. | Append `trust_record_state_history` or rely on trust events — document which is authoritative |
| **P1-T2** | **`public_summary.collusion_review_flag` computation needs persisted inputs.** Rolling 20-contract window not stored — recompute must scan actions each time. | Accept scan cost; cache `collusion_metrics JSONB` on trust_scores with computed_at |
| **P1-T3** | **Missing `trust_score_events.event_idempotency_source` link to domain_outbox.id.** Cannot trace trust event back to originating outbox row. | Add `source_outbox_id UUID FK` nullable |
| **P1-T4** | **`repeat_customer_rate` on trust_scores** — no engagement table to recompute; denormalized counter drift risk. | Document recompute formula from `actions`/`contracts` join; add reconciliation job spec |
| **P1-T5** | **Confidence band rules not encoded.** "Low until 3 contracts" is application-only. | Document in architecture; optional CHECK when completed_contract_count < 3 → confidence_band = 'low' |

### 7. Contract Engine gaps

| ID | Finding | Fix |
|----|---------|-----|
| **P1-CE1** | **`contracts` lifecycle timestamps underspecified in §13.1.** `activated_at`, `completed_at`, `customer_accepted_at`/`provider_accepted_at` denorm vs parties table authority unclear. | Document: parties authoritative; contract columns are cache with sync trigger |
| **P1-CE2** | **No `contract_activation_audit` for milestone materialization.** Factory output (which milestones created from template) not persisted beyond milestones rows. | Accept milestones as audit artifact; document template_id on each milestone |
| **P1-CE3** | **Action ↔ Contract status drift.** Two parallel state machines with no DB constraint preventing `actions.contract_active` while `contracts.draft`. | Add application invariant + periodic reconciliation job; optional CHECK via materialized sync view |
| **P1-CE4** | **Auto-accept attestation silence (7-day rule)** — no column for `auto_accepted_at` / `auto_accept_reason` on attestations. | Add attestation source metadata columns |

### 8. Complaint workflow gaps

| ID | Finding | Fix |
|----|---------|-----|
| **P1-CM1** | **SLA timestamps missing on complaints and cases.** `sla_due_at` on cases only; complaints need `triage_due_at`, `evidence_period_ends_at`, `mediation_ends_at`. | Add SLA columns per Complaint Lifecycle §7 |
| **P1-CM2** | **`window_valid` / `eligibility_snapshot JSONB` on complaints** mentioned in §14.2 but not column-specified. | Add `eligibility_snapshot JSONB NOT NULL` at filing |
| **P1-CM3** | **`frivolous_flag` / filer pattern tracking absent.** Trust v1.1 §8.4 manual Trust Ops queue needs queryable signal. | Add `filer_dismissed_count_12mo` denorm or `complaint_filer_flags` table |
| **P1-CM4** | **Post-completion complaint path:** Contract stays `completed` — no `complaints.contract_status_at_filing` snapshot for EL-2 audit. | Add `contract_status_at_filing TEXT` on complaints |
| **P1-CM5** | **Case 1:0..1 Complaint vs multiple dimensions.** One complaint with multiple dimensions OK; multiple complaints on different dimensions need multiple cases per CS-2 — architecture partial unique supports this once junction added. | Document case-per-dimension rule explicitly |

### 9. Evidence chain weaknesses

| ID | Finding | Fix |
|----|---------|-----|
| **P1-EV1** | **No evidence immutability after attestation.** Law 14 audit requires evidence not silently replaced post-attestation. | Add `locked_at TIMESTAMPTZ` on evidence when referenced by attestation_evidence |
| **P1-EV2** | **No `evidence_status_history`.** Milestone and contract have history; evidence submissions do not. | Add append-only history or audit_events on every evidence insert |
| **P1-EV3** | **Attestation CK-3 deferred to application** — PEN rating may exist without evidence junction. | DB trigger: reject attestation INSERT if rating NOT IN ('PEN') AND no attestation_evidence rows |
| **P1-EV4** | **Missing object metadata** (`file_size`, `mime_type`, `captured_at`) on evidence for EV-TS integrity. | Add optional metadata columns to evidence |

### 10. MVP simplifications (document as accepted tradeoffs)

| ID | Simplification | Notes |
|----|----------------|-------|
| **P1-M1** | 1:1 Action–Contract (`uq_contracts_action_id`) | Blocks amendments until Phase 2 |
| **P1-M2** | TEKRR embedded in JSONB on actions + snapshot on contracts | No versioned TEKRRSnapshot chain |
| **P1-M3** | No payment/escrow tables — readiness booleans only | Phase 4 hooks |
| **P1-M4** | Mediation as simple `mediation_records` rows | No full proposal/response state machine in DB |
| **P1-M5** | Trust computation sub-states not persisted | `pending_recompute` is job queue concern |
| **P1-M6** | Companies as stub — no members, no org RBAC | Phase 3 |
| **P1-M7** | Enum validation in application layer | Prefer TEXT + CHECK over PostgreSQL ENUM for evolving lifecycles |

---

## P2 — Future / Phase 2+

### 1. Missing entities

| ID | Finding |
|----|---------|
| **P2-E1** | `contract_amendments` — Action 1:N Contract path |
| **P2-E2** | `tekrr_snapshots` versioned chain for amendments |
| **P2-E3** | `contract_documents` — separate PDF/hash integrity from contract row |
| **P2-E4** | `notifications` — cross-engine delivery tracking |
| **P2-E5** | `company_members` — Phase 3 institutional |
| **P2-E6** | `customer_trust_flags` — frivolous complaint filer accountability |
| **P2-E7** | `trust_appeals` — full appeal workflow UI beyond corrections table |
| **P2-E8** | `platform.category_schemas` — runtime template admin |
| **P2-E9** | `obligations` — TEKRR obligation graph separate from milestones (architecture 03-database-entities) |

### 2. Missing foreign keys

| ID | Finding |
|----|---------|
| **P2-F1** | Typed FK views per `source_entity_type` on trust_score_events (PostgreSQL cannot enforce polymorphic FK natively — use partitioned child tables or validation triggers) |
| **P2-F2** | `providers.company_id` for business entity affiliation |
| **P2-F3** | `contracts.parent_contract_id` for renewal/amendment chain |

### 3. Circular dependencies

| ID | Finding |
|----|---------|
| **P2-C1** | Event-sourced Action+Contract sync — consider outbox-only status projection to eliminate dual-write drift |

### 4. Performance risks

| ID | Finding |
|----|---------|
| **P2-P1** | `trust_score_events` monthly partitioning (architecture defers to 10M — recommend 1M) |
| **P2-P2** | Read replica routing for public trust profile queries |
| **P2-P3** | Materialized view `provider_contract_summary` for dashboard aggregates |
| **P2-P4** | Archive strategy for `audit_events` > 7-year retention tier |

### 5. Audit gaps

| ID | Finding |
|----|---------|
| **P2-A1** | WORM / immutable storage tier for contractual PDFs and evidence blobs |
| **P2-A2** | Admin session audit separate from domain audit_events |
| **P2-A3** | Cross-region audit replication for disaster recovery |

### 6. Trust Engine gaps

| ID | Finding |
|----|---------|
| **P2-T1** | Customer trust scores (Phase 2) — frivolous complaint accountability |
| **P2-T2** | Company trust scores (Phase 3) |
| **P2-T3** | Raw input preservation for algorithm replay beyond component_scores snapshot |
| **P2-T4** | `trust_score_events` archival to cold storage with explainability API passthrough |

### 7. Contract Engine gaps

| ID | Finding |
|----|---------|
| **P2-CE1** | Contract amendment TEKRR diff storage |
| **P2-CE2** | Multi-party contracts (broker, guarantor) beyond customer+provider |
| **P2-CE3** | Payment schedule materialization tables |
| **P2-CE4** | Escrow policy binding tables |

### 8. Complaint workflow gaps

| ID | Finding |
|----|---------|
| **P2-CM1** | External referral tracking (`external_referral_target`, external case numbers) |
| **P2-CM2** | Complaint reopen (MVP forbids — new complaint if eligible) |
| **P2-CM3** | Multi-complaint consolidation under one case |
| **P2-CM4** | Automated SLA breach escalation records |

### 9. Evidence chain weaknesses

| ID | Finding |
|----|---------|
| **P2-EV1** | Blockchain/content-addressed storage anchoring for high-risk actions |
| **P2-EV2** | Third-party verified evidence (lab results API) as separate evidence_source type |
| **P2-EV3** | Evidence redaction/supersession chain for PII corrections |

### 10. MVP simplifications (Phase 2 unwind)

| ID | Simplification to unwind |
|----|---------------------------|
| **P2-M1** | Drop `uq_contracts_action_id` when amendments ship |
| **P2-M2** | Allow dual customer+provider role on single user |
| **P2-M3** | Move taxonomy to `platform.category_schemas` with admin UI |
| **P2-M4** | Replace JSONB dimension arrays with normalized TEKRR dimension tables |

---

## Cross-cutting findings

### Strengths

1. **Schema boundaries** map cleanly to engine ownership — best structural decision in the doc.
2. **ADR compliance** explicitly documented — forbidden tables, complaint contract_id, trust append-only.
3. **Entity Review closure** — attestations, verifications, credentials, cases, issues, adjudications, outbox all present.
4. **Migration phasing** M1–M10 is sensible; forward-only posture matches Law 24.
5. **RESTRICT on delete** for contractual data — correct vs Entity Model CASCADE draft.
6. **Junction table for attestation_evidence** — correct normalization vs UUID[].

### Highest-risk gap summary

| Rank | Gap | Priority |
|------|-----|----------|
| 1 | JSONB dimension arrays break EL-6 partial uniques | P0 |
| 2 | Missing issue/complaint/case/action status history | P0 |
| 3 | Attestation milestone binding incomplete for Trust v1.1 | P0 |
| 4 | Event idempotency absent | P0 |
| 5 | Execution↔Complaint FK migration ordering | P0 |
| 6 | Provider/customer denorm on contracts for queries + collusion | P0 |
| 7 | Polymorphic refs without integrity (complaint_evidence, trust events) | P1 |
| 8 | SLA and eligibility audit columns on complaints | P1 |

### Constitutional compliance after P0 fixes

| ADR / Law | Current | After P0 |
|-----------|---------|----------|
| ADR-001 Action-only | ✅ | ✅ |
| ADR-002 Complaint origin | ✅ | ✅ |
| ADR-003 Trust authority | ⚠️ idempotency gap | ✅ |
| Law 11 Evidence binding | ⚠️ app-only CK-2 | ✅ with trigger |
| Law 13 Attestation evidence | ⚠️ milestone gap | ✅ |
| Law 24 Immutable audit | ⚠️ 3 entities missing history | ✅ |
| EL-6 One active complaint/dimension | ❌ not enforceable | ✅ with junction |

---

## Recommended next deliverables

1. **`APP13-Database-Architecture-v1.1.md`** — patch document addressing all P0 items (do not rewrite v1)
2. **SQL migration pack** — only after v1.1 architecture patch
3. **JSON Schema pack** for trust event payloads (Trust v1.1 Appendix A)
4. **DB trigger spec** — evidence/contract consistency, attestation evidence gate, EL-6 enforcement

---

## Appendix: Finding index by category

| Category | P0 count | P1 count | P2 count |
|----------|:--------:|:--------:|:--------:|
| Missing entities | 4 | 4 | 9 |
| Missing foreign keys | 5 | 5 | 3 |
| Circular dependencies | 2 | 1 | 1 |
| Performance risks | 2 | 5 | 4 |
| Audit gaps | 2 | 4 | 3 |
| Trust Engine gaps | 4 | 5 | 4 |
| Contract Engine gaps | 2 | 4 | 4 |
| Complaint workflow gaps | 3 | 5 | 4 |
| Evidence chain weaknesses | 2 | 4 | 3 |
| MVP simplifications | 3 (sign-off) | 7 (document) | 4 (unwind) |

---

*Review complete. No existing files were modified.*
