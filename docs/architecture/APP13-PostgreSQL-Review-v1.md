# APP13 PostgreSQL Schema — Review v1

**Version:** 1.0  
**Status:** Review findings  
**Last updated:** June 20, 2026  
**Subject:** `database/migrations/001–006` (PostgreSQL Schema v1)  
**Baseline:** [Database Architecture v1.1](./APP13-Database-Architecture-v1.1.md) · [Trust Engine v1.1](../APP13-Trust-Engine-v1.1.md) · [Contract Engine v1](../APP13-Contract-Engine-v1.md) · [State Machine v1](../APP13-State-Machine-v1.md)

---

## Executive summary

PostgreSQL Schema v1 implements the **36-table** v1.1 architecture across six ordered migrations with schemas, enums, FKs, EL-6 partial uniques, append-only audit guards, and core triggers (CK-2, CK-10, CK-11, CK-13 partial).

The schema is **substantially aligned** with constitutional requirements (ADR-001/002/003) but has **five P0 gaps** where database enforcement is incomplete or raceable under default isolation. These should be fixed before production seeding.

| Area | Rating | Summary |
|------|--------|---------|
| Table coverage | Good | 36/36 tables present |
| FK integrity | Good | M7b deferred FKs included in 003 |
| Constitutional ADRs | Partial | ADR-003 INSERT bypass on trust_scores |
| Contract Engine gates | Weak | No DB gate for execution when contract ≠ active |
| Trust Engine | Partial | CK-3/CK-7 incomplete; session-var guard bypassable |
| EL-6 enforcement | Partial | Race under READ COMMITTED |
| Migration operability | Partial | Non-idempotent enums; no version table |

---

## P0 — Must fix before production

### Data integrity

| ID | Finding | Location | Risk | Fix |
|----|---------|----------|------|-----|
| **P0-D1** | **Milestones can be created when contract is not `active`** | `execution.milestones` — no status gate | Violates **CA-2 / Law 5** — execution before activation | `BEFORE INSERT` trigger: parent `contract.status = 'active'` (or post-active states per policy) |
| **P0-D2** | **Attestation with non-`PEN` rating can commit without evidence** | CK-3 trigger only fires on `attestation_evidence` changes | Violates **Law 13** — empty attestation rows persist | Add `CONSTRAINT TRIGGER` on `execution.attestations` `AFTER INSERT OR UPDATE OF fulfillment_rating` (deferrable) |
| **P0-D3** | **Issue can commit with zero dimensions and zero milestones** | CK-13 triggers only on junction tables | Violates **Invariant I-1** — orphan issues | Add deferrable `CONSTRAINT TRIGGER` on `complaint.issues` at transaction commit |
| **P0-D4** | **EL-6 duplicate active dimension race** | `uq_complaint_dimensions_active` partial unique | Two concurrent complaints on same `(contract_id, dimension)` can both commit under READ COMMITTED | Use `SERIALIZABLE` for filing transaction **or** advisory lock on `(contract_id, tekrr_dimension)` **or** `INSERT ... ON CONFLICT` pattern |
| **P0-D5** | **`trust_scores` INSERT unguarded** | `006_audit.sql` guard is UPDATE-only | **ADR-003** — manual score seeding bypasses projection rule | Extend `trust.enforce_trust_score_projection_writes` to `BEFORE INSERT` or restrict INSERT to trust service role |

### Missing constraints

| ID | Finding | Location | Risk | Fix |
|----|---------|----------|------|-----|
| **P0-C1** | **CK-7 not implemented** — no ≥1 `complaint_dimensions` at filing | Architecture §9.2 CK-7 | Complaints without authoritative dimensions | Deferrable constraint trigger on `complaint.complaints` after insert of dimensions |
| **P0-C2** | **`complaint_dimensions.contract_id` not tied to `complaints.contract_id`** | Junction denorm | Cross-contract dimension rows | Trigger: junction `contract_id` must match parent complaint |

### Contract Engine violations

| ID | Finding | Spec | Risk | Fix |
|----|---------|------|------|-----|
| **P0-CE1** | **No DB enforcement of CA-2** (execution only when contract active) | Contract Engine §CA-2 | Evidence/attestations insertable in `draft`/`proposed` | Triggers on `evidence`, `attestations`, `attestation_*` junctions |
| **P0-CE2** | **`contracts.customer_id` / `provider_id` nullable when `status = active`** | Architecture §13.1 CK-11 | Active contracts without party denorm break collusion queries | `CHECK (status <> 'active' OR (customer_id IS NOT NULL AND provider_id IS NOT NULL))` plus existing activation trigger |

### Migration risks

| ID | Finding | Location | Risk | Fix |
|----|---------|----------|------|-----|
| **P0-M1** | **Migrations are not idempotent** | All files use `CREATE` without `IF NOT EXISTS` for types/tables | Re-run fails; CI rollback brittle | Add `schema_migrations` table + idempotent guards, or document Flyway one-shot only |
| **P0-M2** | **`002_enums.sql` fails on re-apply** | `CREATE TYPE` without guard | Enum migration cannot be replayed in dev | Use `DO $$ BEGIN ... EXCEPTION duplicate_object` blocks or separate baseline |

---

## P1 — Recommended before MVP launch

### Data integrity

| ID | Finding | Risk | Fix |
|----|---------|------|-----|
| **P1-D1** | `attestation_milestones.contract_id` not validated against attestation/milestone | Cross-contract milestone binding | Mirror CK-10 trigger for milestones junction |
| **P1-D2** | `issue_milestones.contract_id` not validated against issue/milestone | Wrong-contract issue scope | Trigger on insert/update |
| **P1-D3** | `complaints.contract_id` not validated against `cases.contract_id` | Case/complaint contract mismatch | Trigger or FK via composite key |
| **P1-D4** | `complaint_dimensions` / `tekrr_dimensions` JSONB cache can drift from junction | Dual source of truth | Sync trigger on dimension junction changes, or drop JSONB cache |
| **P1-D5** | `case_dimensions.contract_id` / `issue_dimensions.contract_id` denorm drift | EL-6 false negatives/positives | Validate against parent row on insert/update |
| **P1-D6** | `credentials.verification_id` FK is RESTRICT but nullable — revoked verification blocks credential row forever | Ops friction | `ON DELETE SET NULL` for optional link |

### Missing constraints

| ID | Finding | Fix |
|----|---------|-----|
| **P1-C1** | `complaints.fault_party` — no CHECK / enum | Use `contract.fault_party` enum |
| **P1-C2** | `contracts.cancellation_fault_party` — free TEXT | Use `contract.fault_party` enum |
| **P1-C3** | `complaint.dismissed_reason_code` enum defined but column uses TEXT + CHECK | `ALTER` to `complaint.dismissed_reason_code` type |
| **P1-C4** | `trust_score_event_corrections.provider_id` missing (Architecture P1-F5) | Denormalize for recompute scoping |
| **P1-C5** | No constraint that `adjudications` exists before complaint → `closed` | Application-only PL-4/PL-5; add deferrable trigger |
| **P1-C6** | `issue_milestones.milestone_id` must belong to same `contract_id` as issue | Composite validation trigger |
| **P1-C7** | Evidence insert allowed when contract not `active` (same class as P0-CE1 but evidence-specific) | Status gate trigger on `execution.evidence` |

### Performance risks

| ID | Finding | Fix |
|----|---------|-----|
| **P1-P1** | No GIN indexes on `actions.tekrr_profile`, `contracts.tekrr_snapshot` | `idx_*_gin` with `jsonb_path_ops` for taxonomy/risk queries |
| **P1-P2** | `trust_score_events` unbounded — no partition strategy | Document BRIN/monthly partition at 1M rows (Architecture MG-5) |
| **P1-P3** | Duplicate email indexes: `uq_users_email` + `idx_users_email_lower` | Drop `uq_users_email`; keep functional unique on `lower(email)` only |
| **P1-P4** | `trust_scores` projection guard uses session GUC — any DB user can `SET app13.trust_recompute=on` | Restrict GUC to trust service role via `ALTER DATABASE` + `GRANT SET ON PARAMETER` (PG15+) or dedicated role |
| **P1-P5** | Case/issue bootstrap requires 3-step insert (case → issue → link) — no DEFERRABLE FK | Document workflow; optional `DEFERRABLE INITIALLY DEFERRED` on circular FKs |

### Trust Engine violations

| ID | Finding | Spec | Fix |
|----|---------|------|-----|
| **P1-T1** | `trust_scores.execution_score_version` / `score_version` not guarded on INSERT | Trust v1.1 | Include in INSERT guard (P0-D5) |
| **P1-T2** | No DB link from `trust_score_events` to `domain_outbox` source row | Architecture P1-T3 | Add nullable `source_outbox_id UUID FK` |
| **P1-T3** | `trust_score_events.event_type` unconstrained — no validation against `trust.*` catalog | Trust v1.1 §6.2 | CHECK prefix `event_type LIKE 'trust.%'` or enum table |
| **P1-T4** | `customer_evaluations.superseded_at` not mutually exclusive with active scoring | Trust v1.1 §7.2 | CHECK: `(superseded_at IS NULL) OR (superseded_by_complaint_id IS NOT NULL)` |

### Contract Engine violations

| ID | Finding | Spec | Fix |
|----|---------|------|-----|
| **P1-CE1** | No DB enforcement that milestones materialize only at activation | Contract Engine AR-10 | Trigger: reject milestone INSERT unless contract transitioning to `active` in same txn |
| **P1-CE2** | `contract_parties` acceptance not required before `contracts.status → active` | CA-8 / Law 9 | Deferrable trigger validating both party rows accepted |
| **P1-CE3** | `tekrr_snapshot` immutability (CK-5) application-only | Law 7 | `BEFORE UPDATE` trigger: reject `tekrr_snapshot` change when `activated_at IS NOT NULL` |
| **P1-CE4** | Action ↔ Contract status drift not detectable | State Machine sync | Optional materialized check view or periodic reconciliation job spec |

### Complaint workflow

| ID | Finding | Fix |
|----|---------|-----|
| **P1-CM1** | `parent_status` on junction rows updated via AFTER trigger — brief window where partial unique sees stale status | Use BEFORE trigger on parent status change within same statement, or compute active flag via join in exclusion constraint (PG exclusion) |
| **P1-CM2** | `complaint_evidence` CK-12 allows `admin` source with no storage/evidence requirements | Tighten admin branch: require `storage_key OR execution_evidence_id` |
| **P1-CM3** | No index on `complaint.adjudications(decided_at)` for SLA reporting | Add index |

### Migration risks

| ID | Finding | Fix |
|----|---------|-----|
| **P1-M1** | M7b deferred FKs bundled into `003` — not a separate migration file as architecture specifies | Split to `003b_deferred_fks.sql` for clarity |
| **P1-M2** | No seed migration (`M11`) | Add `007_seed.sql` (non-prod admin, reference enums) |
| **P1-M3** | `platform.record_status_transition` uses dynamic SQL | Acceptable for internal use; add `SECURITY DEFINER` + fixed allowlist of table names |
| **P1-M4** | Status history `from_status`/`to_status` remain TEXT after enum migration | Convert to domain-specific enum types for validation |

---

## P2 — Future / Phase 2+

### Data integrity

| ID | Finding |
|----|---------|
| **P2-D1** | No evidence immutability lock after attestation references (`locked_at`) |
| **P2-D2** | No soft-delete propagation from `users.deleted_at` to profiles |
| **P2-D3** | `repeat_customer_rate` lacks `CHECK (value BETWEEN 0 AND 1)` |
| **P2-D4** | Polymorphic `trust_score_events.source_entity_id` — no typed FK enforcement (signed-off P0-M1) |

### Missing constraints

| ID | Finding |
|----|---------|
| **P2-C1** | CK-8 single-role-per-user — application-only |
| **P2-C2** | CK-4 action_code taxonomy registry — application-only |
| **P2-C3** | No `domain_event_consumption` table for outbox dedup at consumer |
| **P2-C4** | `mediation_records` lacks status enum / history |

### Performance

| ID | Finding |
|----|---------|
| **P2-P1** | Partition `trust.trust_score_events` by `occurred_at` month at scale |
| **P2-P2** | Read replica routing for public trust profile queries |
| **P2-P3** | Materialized view `provider_contract_summary` for dashboards |
| **P2-P4** | `audit_events` archival strategy beyond 7-year retention |

### Trust Engine

| ID | Finding |
|----|---------|
| **P2-T1** | `public_summary` JSONB schema not validated at DB layer |
| **P2-T2** | No `trust_record_state_history` — state changes only in events |
| **P2-T3** | Collusion metrics not cached on `trust_scores` (Architecture P1-T2 deferred) |
| **P2-T4** | Superuser / table owner bypasses append-only triggers — document ops policy |

### Contract Engine

| ID | Finding |
|----|---------|
| **P2-CE1** | No amendment / parent contract support (1:1 enforced — intentional MVP) |
| **P2-CE2** | `payment_schedule_ref` / `escrow_policy_ref` JSONB unconstrained |
| **P2-CE3** | Auto-accept attestation silence (7-day rule) — no `auto_accepted_at` column |

### Migration

| ID | Finding |
|----|---------|
| **P2-M1** | No rollback/down migrations (architecture prefers forward-fix — acceptable) |
| **P2-M2** | No schema-level GRANT separation per engine |
| **P2-M3** | No CI job running migrations against ephemeral PG16 container |

---

## Verification matrix

| Requirement | Implemented | Gap |
|-------------|:-----------:|-----|
| **ADR-001** — no marketplace tables | ✅ | — |
| **ADR-002** — complaint requires contract | ✅ | `contract_id NOT NULL` + FK |
| **ADR-003** — append-only trust events | ✅ | INSERT on `trust_scores` unguarded (P0-D5) |
| **Law 11** — evidence ↔ milestone | ✅ | Trigger CK-2 |
| **Law 13** — attestation ↔ evidence | ⚠️ | Junction trigger only; attestation row gap (P0-D2) |
| **Law 24** — immutable audit | ✅ | Deny UPDATE/DELETE triggers |
| **EL-6** — one active complaint/dimension | ⚠️ | Partial unique + race (P0-D4) |
| **CK-11** — party denorm at activation | ⚠️ | Trigger on UPDATE; active status CHECK missing (P0-CE2) |
| **Trust v1.1** — idempotency keys | ✅ | Both events + outbox |
| **Trust v1.1** — snapshots | ✅ | Append-only |
| **Trust v1.1** — eval supersession | ✅ | Columns present |
| **Contract CA-2** — execution gate | ❌ | P0-CE1 |
| **State Machine** — 6 history tables | ✅ | All present + append-only |
| **36 tables** | ✅ | Full inventory |

---

## What's working well

1. **Schema boundaries** — seven schemas match engine ownership from Architecture v1.1.
2. **M7b deferred FKs** — execution ↔ complaint cycle handled in `003_constraints.sql`.
3. **EL-6 infrastructure** — junction tables + `parent_status` + partial uniques + sync triggers.
4. **Append-only enforcement** — trust events, snapshots, corrections, status history, audit events.
5. **Evidence integrity** — CK-2 and content-hash partial unique implemented.
6. **Complaint evidence** — CK-12 auto-attach vs party upload enforced.
7. **Enum coverage** — State Machine and Trust record states aligned in `002_enums.sql`.
8. **Constitutional exclusions** — no `services`, `listings`, `gigs`, `skus` tables.

---

## Recommended fix order

| Priority | Migration | Scope |
|----------|-----------|-------|
| 1 | `007_p0_integrity.sql` | P0-D2, P0-D3, P0-C1, P0-C2, P0-CE1, P0-CE2, P0-D5 |
| 2 | Application | P0-D4 EL-6 filing uses advisory lock or SERIALIZABLE |
| 3 | `008_p1_contract_trust.sql` | P1-CE2, P1-CE3, P1-T2, P1-T3, P1-C3 |
| 4 | `009_p1_performance.sql` | P1-P1, P1-P3, partition prep |
| 5 | Ops | P1-P4 trust recompute role isolation |

---

## Related documents

| Document | Relationship |
|----------|--------------|
| [Database Architecture v1.1](./APP13-Database-Architecture-v1.1.md) | Source spec |
| [Database Architecture v1.1 Review](./APP13-Database-Architecture-v1.1-Review.md) | Logical review (PASS) |
| [PostgreSQL migrations](../database/migrations/) | Subject of this review |

---

*Review complete. No migration files were modified.*
