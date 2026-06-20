# APP13 PostgreSQL Schema v1.1 — Change Summary

**Version:** 1.1  
**Status:** Applied  
**Last updated:** June 20, 2026  
**Baseline:** PostgreSQL Schema v1 (`database/migrations/001–006`)  
**Source review:** [APP13-PostgreSQL-Review-v1.md](./APP13-PostgreSQL-Review-v1.md)  
**Preserved:** Constitutional rules · ADR-001 · ADR-002 · ADR-003 · Trust Engine v1.1 · Contract Engine v1

---

## Executive summary

Schema v1.1 closes **all 12 P0 findings** from PostgreSQL Review v1. Changes are delivered as migration `007_schema_v1_1_p0.sql` plus targeted updates to migrations `002`, `003`, `004`, and `006` for greenfield installs.

| Area | v1 status | v1.1 status |
|------|-----------|---------------|
| Contract execution gate (CA-2) | ❌ | ✅ DB triggers |
| Attestation evidence completeness (CK-3) | ⚠️ Junction-only | ✅ Deferrable attestation trigger |
| Issue scope (CK-13 / I-1) | ⚠️ Junction-only | ✅ Deferrable issue trigger |
| Complaint dimensions (CK-7) | ❌ | ✅ Deferrable complaint triggers |
| EL-6 race (P0-D4) | ⚠️ Partial unique only | ✅ Advisory lock + lookup index |
| Trust projection INSERT (ADR-003) | ❌ | ✅ INSERT guard |
| Active contract parties (CK-11) | ⚠️ UPDATE trigger only | ✅ CHECK constraint |
| Migration idempotency | ❌ | ✅ `schema_migrations` + idempotent enums |

**Not in scope:** P1 and P2 items from the review remain deferred.

---

## Migration inventory

| File | Change type | Description |
|------|-------------|-------------|
| `001_initial_schema.sql` | Unchanged | v1 baseline — 36 tables, 7 schemas |
| `002_enums.sql` | **Updated** | Idempotent `CREATE TYPE` via `duplicate_object` guards (P0-M2) |
| `003_constraints.sql` | **Updated** | Added `ck_contracts_active_parties_required` (P0-CE2) |
| `004_indexes.sql` | **Updated** | Added `idx_complaint_dimensions_active_lookup` (P0-D4) |
| `005_triggers.sql` | Unchanged | v1 triggers retained; v1.1 triggers in 007 |
| `006_audit.sql` | **Updated** | Trust projection guard extended to `BEFORE INSERT` (P0-D5) |
| `007_schema_v1_1_p0.sql` | **New** | All P0 integrity fixes + `platform.schema_migrations` (P0-M1) |

### Apply order

```bash
psql -f database/migrations/001_initial_schema.sql
psql -f database/migrations/002_enums.sql
psql -f database/migrations/003_constraints.sql
psql -f database/migrations/004_indexes.sql
psql -f database/migrations/005_triggers.sql
psql -f database/migrations/006_audit.sql
psql -f database/migrations/007_schema_v1_1_p0.sql   # v1 → v1.1 upgrade
```

Existing v1 databases need only `007`. Greenfield installs run `001–007`.

---

## P0 fix mapping

### Data integrity

| ID | Fix | Implementation |
|----|-----|----------------|
| **P0-D1** | Milestones only when contract executable or during activation | `contract.enforce_milestone_insert_gate()` — `BEFORE INSERT` on `execution.milestones`. Allows post-activation states plus `accepted` when `app13.contract_materialization=on`. |
| **P0-D2** | Attestation row cannot commit without evidence when rating ≠ `PEN` | `execution.enforce_attestation_has_evidence_on_commit()` — deferrable `CONSTRAINT TRIGGER` on `execution.attestations` (`AFTER INSERT OR UPDATE OF fulfillment_rating`). Complements existing junction trigger in 005. |
| **P0-D3** | Issue cannot commit with zero scope | `complaint.enforce_issue_scope_on_issue_commit()` — deferrable `CONSTRAINT TRIGGER` on `complaint.issues`. Complements junction triggers in 005. |
| **P0-D4** | EL-6 duplicate active dimension race | `complaint.lock_complaint_dimension_insert()` — `pg_advisory_xact_lock` on `(contract_id, tekrr_dimension)` before active insert; explicit duplicate check. Index `idx_complaint_dimensions_active_lookup` added. |
| **P0-D5** | `trust_scores` INSERT unguarded | `trust.enforce_trust_score_projection_writes()` extended to `BEFORE INSERT OR UPDATE`. Allows only uninitialized zero bootstrap or `app13.trust_recompute=on`. Updated in 006 and 007. |

### Missing constraints

| ID | Fix | Implementation |
|----|-----|----------------|
| **P0-C1** | CK-7 — ≥1 `complaint_dimensions` at filing | `complaint.enforce_complaint_dimensions_on_commit()` — deferrable triggers on `complaint.complaints` and `complaint.complaint_dimensions`. |
| **P0-C2** | Junction `contract_id` must match parent complaint | `complaint.enforce_complaint_dimension_contract_match()` — `BEFORE INSERT OR UPDATE` on `complaint.complaint_dimensions`. |

### Contract Engine

| ID | Fix | Implementation |
|----|-----|----------------|
| **P0-CE1** | CA-2 — execution only when contract executable | `contract.enforce_execution_entity_gate()` — `BEFORE INSERT OR UPDATE` on `execution.evidence`, `execution.attestations`, `execution.attestation_evidence`, `execution.attestation_milestones`. Bypass for complaint outcome apply via `app13.complaint_outcome_apply=on`. |
| **P0-CE2** | Active contracts require party denorm | `ck_contracts_active_parties_required` CHECK on `contract.contracts` (003 + 007). Complements existing activation trigger (CK-11) in 005. |

### Migration operability

| ID | Fix | Implementation |
|----|-----|----------------|
| **P0-M1** | No migration tracking | `platform.schema_migrations` table; versions `001–007` recorded on apply. |
| **P0-M2** | Enum migration fails on re-apply | All `CREATE TYPE` in 002 wrapped in `DO $$ … EXCEPTION WHEN duplicate_object`. |

---

## New database objects (007)

### Functions

| Function | Schema | Purpose |
|----------|--------|---------|
| `is_contract_execution_allowed` | `contract` | Immutable helper — executable contract statuses |
| `is_contract_milestone_materialization_allowed` | `contract` | Milestone insert gate including activation session var |
| `enforce_milestone_insert_gate` | `contract` | P0-D1 trigger body |
| `enforce_execution_entity_gate` | `contract` | P0-CE1 trigger body |
| `enforce_attestation_has_evidence_on_commit` | `execution` | P0-D2 trigger body |
| `enforce_issue_scope_on_issue_commit` | `complaint` | P0-D3 trigger body |
| `enforce_complaint_dimensions_on_commit` | `complaint` | P0-C1 trigger body |
| `enforce_complaint_dimension_contract_match` | `complaint` | P0-C2 trigger body |
| `lock_complaint_dimension_insert` | `complaint` | P0-D4 advisory lock + duplicate guard |

### Triggers

| Trigger | Table | Event | Type |
|---------|-------|-------|------|
| `trg_milestones_execution_gate` | `execution.milestones` | INSERT | BEFORE |
| `trg_evidence_execution_gate` | `execution.evidence` | INSERT, UPDATE | BEFORE |
| `trg_attestations_execution_gate` | `execution.attestations` | INSERT, UPDATE | BEFORE |
| `trg_attestation_evidence_execution_gate` | `execution.attestation_evidence` | INSERT, UPDATE | BEFORE |
| `trg_attestation_milestones_execution_gate` | `execution.attestation_milestones` | INSERT, UPDATE | BEFORE |
| `trg_attestation_has_evidence_on_commit` | `execution.attestations` | INSERT, UPDATE | CONSTRAINT DEFERRED |
| `trg_issue_scope_on_issue_commit` | `complaint.issues` | INSERT, UPDATE | CONSTRAINT DEFERRED |
| `trg_complaint_dimensions_on_commit` | `complaint.complaints` | INSERT, UPDATE | CONSTRAINT DEFERRED |
| `trg_complaint_dimensions_junction_on_commit` | `complaint.complaint_dimensions` | INSERT, DELETE | CONSTRAINT DEFERRED |
| `trg_complaint_dimension_contract_match` | `complaint.complaint_dimensions` | INSERT, UPDATE | BEFORE |
| `trg_z_complaint_dimension_el6_lock` | `complaint.complaint_dimensions` | INSERT, UPDATE | BEFORE |
| `trg_trust_scores_projection_guard` | `trust.trust_scores` | INSERT, UPDATE | BEFORE (replaced) |

### Constraints

| Constraint | Table | Rule |
|------------|-------|------|
| `ck_contracts_active_parties_required` | `contract.contracts` | `status <> 'active' OR (customer_id IS NOT NULL AND provider_id IS NOT NULL)` |

### Indexes

| Index | Table | Purpose |
|-------|-------|---------|
| `idx_complaint_dimensions_active_lookup` | `complaint.complaint_dimensions` | EL-6 lock probe under `(contract_id, tekrr_dimension, parent_status)` |

---

## Application session variables

v1.1 introduces documented session GUCs for controlled bypass paths:

| GUC | Used by | When to set |
|-----|---------|-------------|
| `app13.contract_materialization=on` | Milestone materialization at activation | Contract activation transaction (accepted → active) |
| `app13.complaint_outcome_apply=on` | Attestation writes from complaint resolution | Complaint outcome application to execution |
| `app13.trust_recompute=on` | Trust projection INSERT/UPDATE | Trust Engine recompute job only |

---

## Constitutional preservation checklist

| Requirement | Preserved | Notes |
|-------------|:---------:|-------|
| **ADR-001** — Action-only tradable unit | ✅ | No marketplace tables added |
| **ADR-002** — Complaints from contract | ✅ | `complaints.contract_id NOT NULL` unchanged; CK-7 strengthens dimension binding |
| **ADR-003** — Event-sourced trust | ✅ | Append-only events unchanged; INSERT guard closes projection bypass |
| **Trust Engine v1.1** — weights 30/30/20/10/10 | ✅ | No weight column changes |
| **Trust Engine v1.1** — idempotency keys | ✅ | Unchanged |
| **Contract Engine v1** — CA-2 execution gate | ✅ | Now DB-enforced |
| **EL-6** — one active complaint per dimension | ✅ | Partial unique + advisory lock |
| **Law 5** — no execution before activation | ✅ | Milestone + execution entity gates |
| **Law 13** — attestation requires evidence | ✅ | Dual trigger (junction + attestation row) |
| **Law 20** — complaint dimensions required | ✅ | CK-7 implemented |
| **Invariant I-1** — issue scope | ✅ | Issue-level deferred trigger added |

---

## Verification matrix (post v1.1)

| Requirement | v1 | v1.1 |
|-------------|:--:|:----:|
| ADR-003 INSERT guard | ❌ | ✅ |
| Law 13 attestation completeness | ⚠️ | ✅ |
| EL-6 race safety | ⚠️ | ✅ |
| CK-11 active party CHECK | ⚠️ | ✅ |
| Contract CA-2 execution gate | ❌ | ✅ |
| CK-7 complaint dimensions | ❌ | ✅ |
| Issue scope at commit | ⚠️ | ✅ |
| Enum re-apply safety | ❌ | ✅ |
| Migration tracking | ❌ | ✅ |

---

## Deferred items (not in v1.1)

The following remain open from PostgreSQL Review v1 and are **intentionally excluded**:

- **P1:** GIN indexes on TEKRR JSONB, trust GUC role isolation, party acceptance before activation, attestation_milestones contract validation, and others
- **P2:** Partitioning, schema GRANTs, evidence immutability lock, rollback migrations

See [APP13-PostgreSQL-Review-v1.md](./APP13-PostgreSQL-Review-v1.md) §P1/P2 for full backlog.

---

## Related documents

| Document | Relationship |
|----------|--------------|
| [APP13-PostgreSQL-Review-v1.md](./APP13-PostgreSQL-Review-v1.md) | Source P0 findings |
| [APP13-Database-Architecture-v1.1.md](./APP13-Database-Architecture-v1.1.md) | Logical spec |
| [database/migrations/](../database/migrations/) | Implementation |

---

*v1.1 applies P0 fixes only. No P1/P2 changes were made.*
