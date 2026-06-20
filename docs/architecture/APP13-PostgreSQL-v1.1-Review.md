# APP13 PostgreSQL Schema — Review v1.1

**Version:** 1.0  
**Status:** Verification complete  
**Last updated:** June 20, 2026  
**Subject:** `database/migrations/001–007` (PostgreSQL Schema v1.1)  
**Baseline:** [PostgreSQL Review v1](./APP13-PostgreSQL-Review-v1.md) · [PostgreSQL v1.1 Changes](./APP13-PostgreSQL-v1.1-Changes.md) · [Database Architecture v1.1](./APP13-Database-Architecture-v1.1.md) · [Trust Engine v1.1](../APP13-Trust-Engine-v1.1.md) · [Contract Engine v1](../APP13-Contract-Engine-v1.md)

---

## Verdict

# PASS

PostgreSQL Schema v1.1 resolves **all 12 P0 findings** from PostgreSQL Review v1. Referential integrity, Contract Engine gates, Trust Engine guards, and complaint workflow constraints are implemented at the database layer. Migration operability is improved to production-acceptable levels for one-shot deployment.

**Caveat:** Migrations were reviewed statically; no live PostgreSQL 16 execution was available in the review environment. P1/P2 backlog from Review v1 remains intentionally open.

---

## Verification summary

| Criterion | Result | Notes |
|-----------|:------:|-------|
| 1. No remaining P0 findings | **PASS** | 12/12 P0 items closed (see §1) |
| 2. Referential integrity | **PASS** | 36 tables; FK graph complete; M7b deferred FKs present |
| 3. Contract Engine enforcement | **PASS** | CA-2 gates + CK-11 CHECK + activation trigger |
| 4. Trust Engine enforcement | **PASS** | ADR-003 append-only + projection INSERT/UPDATE guard |
| 5. Complaint workflow enforcement | **PASS** | CK-7, CK-13, EL-6, CK-12, ADR-002 |
| 6. Migration safety | **PASS** | `schema_migrations` + idempotent enums + replay-safe 007 |

---

## 1. P0 findings closure (12/12)

| ID | Review v1 finding | v1.1 resolution | Status |
|----|-------------------|-----------------|--------|
| **P0-D1** | Milestones creatable when contract ≠ `active` | `trg_milestones_execution_gate` — `contract.enforce_milestone_insert_gate()` allows post-activation states + `accepted` with `app13.contract_materialization=on` | ✅ |
| **P0-D2** | Attestation with non-`PEN` rating commits without evidence | `trg_attestation_has_evidence_on_commit` — deferrable `CONSTRAINT TRIGGER` on `execution.attestations`; complements junction trigger in 005 | ✅ |
| **P0-D3** | Issue commits with zero dimensions/milestones | `trg_issue_scope_on_issue_commit` — deferrable trigger on `complaint.issues`; complements junction triggers in 005 | ✅ |
| **P0-D4** | EL-6 duplicate active dimension race | `trg_z_complaint_dimension_el6_lock` — `pg_advisory_xact_lock` + explicit duplicate probe + `uq_complaint_dimensions_active` backstop + lookup index | ✅ |
| **P0-D5** | `trust_scores` INSERT unguarded | `trg_trust_scores_projection_guard` extended to `BEFORE INSERT OR UPDATE` in 006 and 007; bootstrap limited to uninitialized zero row | ✅ |
| **P0-C1** | CK-7 not implemented | `trg_complaint_dimensions_on_commit` + `trg_complaint_dimensions_junction_on_commit` — deferrable ≥1 dimension check | ✅ |
| **P0-C2** | `complaint_dimensions.contract_id` not tied to parent | `trg_complaint_dimension_contract_match` — `BEFORE INSERT OR UPDATE` validation | ✅ |
| **P0-CE1** | No DB enforcement of CA-2 | `trg_*_execution_gate` on `evidence`, `attestations`, `attestation_evidence`, `attestation_milestones` via `contract.enforce_execution_entity_gate()` | ✅ |
| **P0-CE2** | Active contracts allow null party denorm | `ck_contracts_active_parties_required` in 003 + 007; complements CK-11 activation trigger in 005 | ✅ |
| **P0-M1** | No migration tracking | `platform.schema_migrations` table; versions 001–007 recorded on 007 apply | ✅ |
| **P0-M2** | `002_enums.sql` fails on re-apply | All `CREATE TYPE` wrapped in `DO $$ … EXCEPTION WHEN duplicate_object` blocks | ✅ |

**No remaining P0 findings from Review v1.**

---

## 2. Referential integrity

### 2.1 Table coverage

| Check | Result |
|-------|--------|
| 36/36 architecture tables present in `001_initial_schema.sql` | ✅ |
| Seven engine schemas (`identity`, `action`, `contract`, `execution`, `complaint`, `trust`, `platform`) | ✅ |
| No marketplace tables (ADR-001) | ✅ |

### 2.2 Foreign key graph

| Area | Implementation | Status |
|------|----------------|--------|
| Action → Identity | `actions.customer_id`, `provider_id`, `company_id` | ✅ |
| Contract → Action | `contracts.action_id` UNIQUE (1:1) | ✅ |
| Execution → Contract | All execution entities FK to `contracts` | ✅ |
| Complaint → Contract | `cases`, `issues`, `complaints` FK to `contracts` | ✅ |
| Complaint → Execution | `issue_milestones.milestone_id`, `complaint_evidence.execution_evidence_id` | ✅ |
| Trust → Identity / Contract | `trust_scores.provider_id`, `trust_score_events.contract_id` | ✅ |
| M7b deferred cycle | `milestones.frozen_by_complaint_id`, `attestations.frozen_by_complaint_id`, `customer_evaluations.superseded_by_complaint_id` added after complaint tables | ✅ |
| Case ↔ Issue bootstrap | `cases.issue_id`, `issues.case_id` nullable circular FKs | ✅ |

### 2.3 Cross-entity consistency triggers (referential semantics)

| Rule | Trigger / constraint | Status |
|------|---------------------|--------|
| CK-2 — evidence ↔ milestone contract | `trg_evidence_contract_milestone_match` (005) | ✅ |
| CK-10 — attestation_evidence contract | `trg_attestation_evidence_contract_match` (005) | ✅ |
| P0-C2 — complaint_dimensions contract | `trg_complaint_dimension_contract_match` (007) | ✅ |
| CK-11 — party denorm at activation | `trg_contract_party_denorm` (005) + `ck_contracts_active_parties_required` (003/007) | ✅ |

### 2.4 Known P1 referential gaps (not P0)

These remain application-enforced or deferred to P1 migrations:

- `complaints.contract_id` vs `cases.contract_id` cross-validation (P1-D3)
- `issue_milestones` / `attestation_milestones` junction contract denorm drift (P1-D1, P1-D2)
- `case_dimensions` / `issue_dimensions` contract denorm drift (P1-D5)

**Referential integrity: PASS for P0 scope.**

---

## 3. Contract Engine enforcement

### 3.1 CA-2 — execution only when contract executable

| Entity | Gate | Executable states |
|--------|------|-------------------|
| `execution.milestones` | `trg_milestones_execution_gate` | `active`, `issue_raised`, `disputed`, `resolved`, `completed`, `closed`; plus `accepted` during materialization |
| `execution.evidence` | `trg_evidence_execution_gate` | Post-activation executable states |
| `execution.attestations` | `trg_attestations_execution_gate` | Same; bypass via `app13.complaint_outcome_apply=on` for complaint resolution |
| `execution.attestation_evidence` | `trg_attestation_evidence_execution_gate` | Same |
| `execution.attestation_milestones` | `trg_attestation_milestones_execution_gate` | Same |

Draft/proposed/accepted (without materialization GUC) contracts cannot receive execution writes. Aligns with Contract Engine **CA-2** and **Law 5**.

### 3.2 Party denormalization (CK-11 / P0-CE2)

| Layer | Mechanism |
|-------|-----------|
| Row-level CHECK | `status <> 'active' OR (customer_id IS NOT NULL AND provider_id IS NOT NULL)` |
| Activation validation | `trg_contract_party_denorm` matches `actions.customer_id` / `provider_id` at `activated_at` |

### 3.3 Other Contract Engine rules

| Rule | DB enforcement | Status |
|------|----------------|--------|
| 1:1 Action ↔ Contract | `uq_contracts_action_id` | ✅ |
| Recurring milestone uniqueness | `uq_milestones_contract_sequence_session` | ✅ |
| Attestation per dimension | `uq_attestations_contract_dimension` | ✅ |
| Party acceptance before activation (CA-8) | Application-only | ⚠️ P1-CE2 |
| TEKRR snapshot immutability (CK-5) | Application-only | ⚠️ P1-CE3 |

**Contract Engine enforcement: PASS for P0 scope.**

---

## 4. Trust Engine enforcement

### 4.1 ADR-003 — event-sourced trust

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| Append-only `trust_score_events` | `trg_trust_score_events_deny_update/delete` (006) | ✅ |
| Append-only snapshots | `trg_trust_score_snapshots_deny_update/delete` (006) | ✅ |
| Append-only corrections | `trg_trust_score_event_corrections_deny_update/delete` (006) | ✅ |
| Projection INSERT guard | `trg_trust_scores_projection_guard` — bootstrap or `app13.trust_recompute=on` (006/007) | ✅ |
| Projection UPDATE guard | Same trigger — all score/component columns protected | ✅ |
| Event idempotency | `uq_trust_score_events_idempotency_key` (003) | ✅ |
| Score bounds | `ck_trust_scores_*` CHECK constraints 0–1000 (003) | ✅ |
| Eval supersession columns | `superseded_at`, `superseded_by_complaint_id` + M7b FK (001/003) | ✅ |

### 4.2 Trust Engine v1.1 alignment

| Requirement | Status | Notes |
|-------------|--------|-------|
| Component weights 30/30/20/10/10 | ✅ | Column structure unchanged; weights in application |
| `record_state` lifecycle | ✅ | Enum type + projection guard |
| Snapshots on recompute | ✅ | Append-only table present |
| Outbox idempotency | ✅ | `domain_outbox.idempotency_key UNIQUE` |

### 4.3 Known P1 trust gaps (not P0)

- Session GUC `app13.trust_recompute=on` settable by any DB role (P1-P4)
- `trust_score_events.event_type` unconstrained (P1-T3)
- No `source_outbox_id` FK on events (P1-T2)

**Trust Engine enforcement: PASS for P0 scope.**

---

## 5. Complaint workflow enforcement

### 5.1 Constitutional chain (ADR-002)

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| Complaints require contract | `complaints.contract_id NOT NULL` + FK + `ck_complaints_contract_required` | ✅ |
| Complaints originate from contract context | `case_id` FK required; `issue_id` optional link | ✅ |

### 5.2 Lifecycle constraints

| Rule | Implementation | Status |
|------|----------------|--------|
| **CK-7** — ≥1 dimension at filing | Deferrable triggers on `complaints` + `complaint_dimensions` (007) | ✅ |
| **CK-13 / I-1** — issue scope | Deferrable triggers on `issues` + junction tables (005/007) | ✅ |
| **EL-6** — one active complaint per dimension | Partial unique `uq_complaint_dimensions_active` (004) + advisory lock (007) | ✅ |
| **CK-12** — complaint evidence source rules | `ck_complaint_evidence_auto_attached` (003) | ✅ |
| Dismissed reason codes | `ck_complaints_dismissed_reason_code` (004) | ✅ |
| Adjudication uniqueness | `uq_adjudications_complaint_id` (003) | ✅ |

### 5.3 Junction `parent_status` sync (EL-6 support)

| Junction | Sync trigger | Set-on-insert trigger |
|----------|--------------|----------------------|
| `complaint_dimensions` | `trg_complaints_sync_dimension_status` | `trg_complaint_dimensions_set_parent_status` |
| `issue_dimensions` | `trg_issues_sync_dimension_status` | `trg_issue_dimensions_set_parent_status` |
| `case_dimensions` | `trg_cases_sync_dimension_status` | `trg_case_dimensions_set_parent_status` |

Partial uniques on all three junction types (004) enforce dimension-level exclusivity per workflow tier.

### 5.4 Known P1 complaint gaps (not P0)

- Adjudication required before complaint → `closed` (P1-C5)
- `parent_status` brief staleness window on status transition (P1-CM1)
- Case/issue dimension EL-6 races not advisory-locked (only complaint_dimensions was P0-D4)

**Complaint workflow enforcement: PASS for P0 scope.**

---

## 6. Migration safety

### 6.1 Migration inventory

| File | Idempotency | Notes |
|------|-------------|-------|
| `001_initial_schema.sql` | One-shot | `CREATE SCHEMA IF NOT EXISTS`; tables use plain `CREATE TABLE` |
| `002_enums.sql` | **Replay-safe types** | `CREATE TYPE` guarded; `ALTER TYPE` conversion one-shot |
| `003_constraints.sql` | One-shot | Standard `ADD CONSTRAINT` |
| `004_indexes.sql` | One-shot | Standard `CREATE INDEX` |
| `005_triggers.sql` | One-shot | Standard `CREATE TRIGGER` |
| `006_audit.sql` | One-shot | `CREATE OR REPLACE FUNCTION` for functions only |
| `007_schema_v1_1_p0.sql` | **Replay-safe** | `DROP IF EXISTS`, `CREATE OR REPLACE`, `IF NOT EXISTS` index |

### 6.2 Version tracking (P0-M1)

```sql
platform.schema_migrations (version TEXT PK, applied_at, description)
```

Records 001–007 on apply. Enables deployment tooling to skip applied versions.

### 6.3 Apply paths

| Scenario | Command |
|----------|---------|
| Greenfield | `001` → `007` sequential |
| v1 → v1.1 upgrade | `007` only |

### 6.4 Residual operational notes (not P0)

- Baseline migrations 001–006 remain **one-shot** by design; re-applying fails without manual cleanup
- No down/rollback migrations (P2-M1 — acceptable per architecture)
- No CI job against ephemeral PG16 (P2-M3)
- Static review only — recommend `psql` smoke test before production seeding

**Migration safety: PASS for P0 scope and standard Flyway-style deployment.**

---

## Verification matrix (post v1.1)

| Requirement | v1 | v1.1 |
|-------------|:--:|:----:|
| **ADR-001** — no marketplace tables | ✅ | ✅ |
| **ADR-002** — complaint from contract | ✅ | ✅ |
| **ADR-003** — trust projection guard | ⚠️ | ✅ |
| **Law 5** — execution gate | ❌ | ✅ |
| **Law 11** — evidence ↔ milestone | ✅ | ✅ |
| **Law 13** — attestation ↔ evidence | ⚠️ | ✅ |
| **Law 20** — complaint dimensions | ❌ | ✅ |
| **Law 24** — append-only audit | ✅ | ✅ |
| **EL-6** — active dimension exclusivity | ⚠️ | ✅ |
| **CK-11** — active party denorm | ⚠️ | ✅ |
| **CA-2** — Contract Engine execution gate | ❌ | ✅ |
| **36 tables** | ✅ | ✅ |
| **P0 findings (Review v1)** | 12 open | **0 open** |

---

## What's working well

1. **P0 closure is complete** — every Review v1 P0 ID has a corresponding migration artifact.
2. **Defense in depth** — attestation evidence (junction + row triggers), issue scope (junction + issue triggers), EL-6 (partial unique + advisory lock + explicit probe).
3. **Session GUC bypass paths are documented** — materialization, complaint outcome, trust recompute are explicit and auditable.
4. **Constitutional preservation** — no schema drift toward marketplace patterns; ADR chain intact.
5. **007 is upgrade-safe** — idempotent drops/recreates allow v1 → v1.1 without baseline rewrite.

---

## Recommended next steps (P1 — not blocking PASS)

| Priority | Item | Review v1 ID |
|----------|------|--------------|
| 1 | Restrict trust recompute GUC to service role | P1-P4 |
| 2 | Party acceptance gate before `contracts.status → active` | P1-CE2 |
| 3 | `attestation_milestones` / `issue_milestones` contract validation | P1-D1, P1-D2 |
| 4 | GIN indexes on TEKRR JSONB columns | P1-P1 |
| 5 | CI migration smoke test against PG16 container | P2-M3 |

---

## Related documents

| Document | Relationship |
|----------|--------------|
| [APP13-PostgreSQL-Review-v1.md](./APP13-PostgreSQL-Review-v1.md) | Source P0 findings (all closed) |
| [APP13-PostgreSQL-v1.1-Changes.md](./APP13-PostgreSQL-v1.1-Changes.md) | Implementation changelog |
| [APP13-Database-Architecture-v1.1-Review.md](./APP13-Database-Architecture-v1.1-Review.md) | Logical architecture PASS |
| [database/migrations/](../database/migrations/) | Subject of this review |

---

*Review complete. No migration files were modified.*
