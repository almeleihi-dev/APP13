# APP13 API Architecture — Review v1.1

**Version:** 1.0  
**Status:** Verification complete  
**Last updated:** June 20, 2026  
**Subject:** [APP13-API-Architecture-v1.1.md](./APP13-API-Architecture-v1.1.md)  
**Baseline:** [API Review v1](./APP13-API-Review-v1.md) · [API Architecture v1](./APP13-API-Architecture-v1.md) · [PostgreSQL Schema v1.1 Review](./APP13-PostgreSQL-v1.1-Review.md) · [Permissions Matrix v1](./04-permissions-matrix.md) · [State Machine v1](../APP13-State-Machine-v1.md) · [Contract Engine v1](../APP13-Contract-Engine-v1.md) · [Trust Engine v1.1](../APP13-Trust-Engine-v1.1.md) · [Complaint Lifecycle v1](./06-complaint-lifecycle.md)

---

## Verdict

# PASS

API Architecture v1.1 resolves **all 19 P0 findings** from API Review v1. Identity verification, authorization hardening, contract lifecycle orchestration, Trust Engine compatibility, and complaint workflow alignment are specified at a level sufficient for **OpenAPI 1.1 authoring** and MVP implementation.

**Caveat:** Architecture reviewed statically; OpenAPI YAML not yet generated. P1/P2 backlog from API Review v1 remains intentionally open. Admin routes beyond adjudication are incorporated by reference to v1 §10.

---

## Verification summary

| Criterion | Result | Notes |
|-----------|:------:|-------|
| 1. No remaining P0 findings | **PASS** | 19/19 P0 items closed (see §1) |
| 2. Identity verification coverage | **PASS** | T1/T2 public + KYC webhook + credentials; admin queue via v1 §10 |
| 3. Authorization completeness | **PASS** | DB revalidation, TEKRR ACL, assignment scope, CA-2 states (P0 scope) |
| 4. Contract lifecycle enforcement | **PASS** | Generate gates, CA-8, completion, issue-path orchestration |
| 5. Trust Engine compatibility | **PASS** | Outbox ingest, DTO allowlist, ADR-003 / CA-5 preserved |
| 6. Complaint workflow compatibility | **PASS** | Admin adjudication only, EL-2 map, CK-7, EL-6, ADR-002 |

---

## 1. P0 findings closure (19/19)

### Security (5/5)

| ID | Review v1 finding | v1.1 resolution | Status |
|----|-------------------|-----------------|--------|
| **P0-S1** | JWT tier/roles trusted without DB revalidation | §4.6 — mandatory DB lookup on gated mutations; `TIER_STALE` / `ROLES_STALE` / `ACCOUNT_SUSPENDED` | ✅ |
| **P0-S2** | Open internal trust event POST | §2.3 — removed; `trust-outbox-consumer` only via `/trust/ingest-from-outbox` | ✅ |
| **P0-S3** | Raw `X-Actor-Context` header | §2.2 — signed `X-Actor-Context-Token` with audit binding | ✅ |
| **P0-S4** | Upload intent lacks tenancy binding | §9.1 — server-generated `storage_key`, `intent_id`, hash verify on confirm | ✅ |
| **P0-S5** | Idempotency optional | §1.4 — required on all POST create/transition; `400` if missing | ✅ |

### Missing endpoints (4/4)

| ID | Review v1 finding | v1.1 resolution | Status |
|----|-------------------|-----------------|--------|
| **P0-E1** | No verification API | §5.2 — T1 start/complete/webhook, credentials, document upload | ✅ |
| **P0-E2** | No profile routes | §5.1 — `/me`, customers, providers, trust-summary alias | ✅ |
| **P0-E3** | No contract completion | §6.5 — `POST /internal/v1/contracts/{id}/complete` | ✅ |
| **P0-E4** | Token refresh undefined | §3.1–§3.2 — `POST /auth/token/refresh` + rotation | ✅ |

### Authorization (3/3)

| ID | Review v1 finding | v1.1 resolution | Status |
|----|-------------------|-----------------|--------|
| **P0-A1** | Monolithic TEKRR PATCH | §4.3 — per-dimension routes + permission codes | ✅ |
| **P0-A2** | Adjudicator role-only access | §4.4 — `assigned_admin_user_id` gate + 404 IDOR | ✅ |
| **P0-A3** | CA-2 `active` only | §4.2 — six executable states + complaint-outcome bypass | ✅ |

### Contract Engine (3/3)

| ID | Review v1 finding | v1.1 resolution | Status |
|----|-------------------|-----------------|--------|
| **P0-CE1** | Generate gates undocumented | §6.2 — preconditions + 409/422 codes | ✅ |
| **P0-CE2** | Issue-path transitions missing | §6.6 — cross-engine transition table + internal route | ✅ |
| **P0-CE3** | CA-8 misdocumented | §6.1 — per-party accept in `proposed`; activation system-only | ✅ |

### Trust Engine (2/2)

| ID | Review v1 finding | v1.1 resolution | Status |
|----|-------------------|-----------------|--------|
| **P0-T1** | Event log PII exposure | §7.2 — field allowlist; customer IDs admin/trust_ops only | ✅ |
| **P0-T2** | Direct trust event POST | §2.4 — outbox consumer path only (CA-5 / ADR-003) | ✅ |

### Complaint workflow (2/2)

| ID | Review v1 finding | v1.1 resolution | Status |
|----|-------------------|-----------------|--------|
| **P0-CM1** | Duplicate adjudication routes | §8.1 — public POST removed; admin-only adjudicate; GET read-only | ✅ |
| **P0-CM2** | EL-2 status drift | §8.3 — legacy terms mapped to State Machine v1 statuses | ✅ |

**No remaining P0 findings from API Review v1.**

---

## 2. Identity verification coverage

### 2.1 MVP requirements (MVP Scope §1.2)

| Requirement | API v1.1 | Status |
|-------------|----------|--------|
| Customer T1 (gov ID + liveness) | `POST /verifications/t1/start`, `/complete`, `/webhook` | ✅ |
| Provider T1 | Same T1 flow (both actor types) | ✅ |
| Provider T2 (credential upload) | `POST /credentials`, document upload-intent/confirm | ✅ |
| Admin T2 review queue | `/admin/verifications/*` (v1 §10, referenced §12) | ✅ |
| Tier gating at contract accept | §4.6, §4.7, §5.2 gates | ✅ |
| Verification snapshot at activation | Internal activate path §2.3 (Contract Engine) | ✅ |

### 2.2 User flow coverage

| Flow | Endpoints | Status |
|------|-----------|--------|
| **UF-02** Customer T1 | §5.2 T1 chain | ✅ |
| **UF-03** Provider T1 → T2 | §5.2 + credentials + admin queue | ✅ |
| **UF-12** Trust profile view | §5.1 `GET /providers/{id}`, `/trust-summary` + §7.1 | ✅ |

### 2.3 Profile chain (P0-E2)

Registration → profile → trust view is completable:

```
POST /auth/register/* → GET /me → POST /verifications/t1/start → … → GET /providers/{id}/trust-summary
```

**Minor note (not P0):** Credential document upload-intent should mirror evidence tenancy binding (§9.1 pattern) in OpenAPI — recommend explicit cross-reference during schema authoring.

---

## 3. Authorization completeness

### 3.1 P0 authorization model

| Layer | v1.1 specification | Aligned with Permissions Matrix |
|-------|-------------------|--------------------------------|
| RBAC roles | §4.1 step 4 | ✅ |
| Resource scope (party/initiator) | §4.5 | ✅ |
| Assignment scope (adjudicator) | §4.4 | ✅ |
| TEKRR dimension ACL | §4.3 | ✅ Permissions Matrix TEKRR table |
| Engine gates (tier, status) | §4.6, §4.7 | ✅ |
| IDOR-safe 404 | §4.5 | ✅ |
| Admin override audit | §4.1 step 7 (inherited v1) | ✅ |

### 3.2 CA-2 alignment with PostgreSQL v1.1

| PostgreSQL `is_contract_execution_allowed` | API §4.2 | Match |
|--------------------------------------------|----------|:-----:|
| `active` | ✅ Full execution | ✅ |
| `issue_raised` | ✅ Limited | ✅ |
| `disputed` | ✅ Frozen dimensions | ✅ |
| `resolved` | ✅ Outcome apply | ✅ |
| `completed` | ✅ Post-completion eval/attestation | ✅ |
| `closed` | ✅ Read + artifacts | ✅ |
| Pre-active / terminal void/cancelled | ❌ Blocked | ✅ |

Complaint-outcome bypass (`app13.complaint_outcome_apply`) documented in §4.2 — matches PostgreSQL Schema v1.1.

### 3.3 Deferred authorization (P1 — not blocking PASS)

| Item | Review ID |
|------|-----------|
| Session revocation on suspend | P1-S2 |
| Evidence `responsible_party` matrix on upload-intent | P1-A2 |
| Admin contract DTO field redaction | P1-A3 |
| Admin attestation override endpoint | P1-E6 |

---

## 4. Contract lifecycle enforcement

### 4.1 State Machine v1 alignment

| Transition | API enforcement | Status |
|------------|-----------------|--------|
| Action `ready_for_contract` → generate | §6.2 gates | ✅ |
| `draft` → `proposed` | Generate + propose transition | ✅ |
| `proposed` → per-party accept | §6.1, §6.3 | ✅ |
| All accepted → `accepted` | §6.1 CA-8 | ✅ |
| `accepted` → `active` | Internal `/activate` + materialize §2.3 | ✅ |
| `active` → `completed` | Internal `/complete` §6.5 | ✅ |
| Issue path | §6.6 table | ✅ |
| `void` / `cancelled` | Decline / cancel transitions | ✅ |
| Post-completion complaint | Contract stays `completed` (State Machine §2.4) | ✅ §8.3 |

### 4.2 Contract Engine rules

| Rule | API v1.1 | Status |
|------|----------|--------|
| CA-1 (1:1 action-contract) | §6.2 return existing | ✅ |
| CA-2 (execution gate) | §4.2, §11 | ✅ |
| CA-5 (trust from domain events) | Outbox only §2.4 | ✅ |
| CA-7 (template immutability) | §6.7 | ✅ |
| CA-8 (all parties accept) | §6.1 corrected | ✅ |
| CL-5 (document hash at accept) | §6.4 `document_hash_ack` | ✅ |

### 4.3 Async orchestration

Activation, completion, and outcome apply return `202` + `operation_id` with poll via `GET /operations/{id}` (§14.1) — closes UF-09 gap from Review v1.

---

## 5. Trust Engine compatibility

### 5.1 ADR-003 / CA-5

| Requirement | API v1.1 | Status |
|-------------|----------|--------|
| No direct score writes | Forbidden routes §7.3 | ✅ |
| Event-sourced trust | Outbox → ingest-from-outbox → events §2.4 | ✅ |
| Recompute projection only | `trust-worker` `/recompute` §2.3 | ✅ |
| Idempotency on events | Outbox `idempotency_key` (DB) | ✅ |

### 5.2 Trust Engine v1.1 surfaces

| Surface | Spec | API v1.1 | Status |
|---------|------|----------|--------|
| Public summary | §3.2 | `GET /trust/providers/{id}` | ✅ |
| Full breakdown (self) | §3.1 | `/full` endpoint | ✅ |
| Event log explainability | §6 — sanitized for provider | §7.2 allowlist | ✅ |
| Snapshots (MVP) | §2.3 P1-3 | `/snapshots` endpoints | ✅ |
| Appeals (MVP) | §10 P1-10 | POST/GET appeals + admin resolve | ✅ |
| `dispute_hold` trigger | §7.1 — `evidence_gathering` | Internal complaint validate → apply-outcome chain (implicit) | ⚠️ |

**Note:** `dispute_hold` is triggered when complaint reaches `evidence_gathering` (Trust v1.1 §7.1). v1.1 documents this via internal complaint worker orchestration rather than a public endpoint — acceptable; recommend one explicit sentence in OpenAPI internal spec.

### 5.3 PII protection (P0-T1)

Provider self-view of `/events` excludes `customer_id`, emails, and legal names per Permissions Matrix §9.1 — **closed**.

---

## 6. Complaint workflow compatibility

### 6.1 Constitutional and lifecycle rules

| Requirement | API v1.1 | Status |
|-------------|----------|--------|
| ADR-002 — `contract_id` required | §8.2 file body | ✅ |
| CK-7 — ≥1 dimension | Server creates `complaint_dimensions` §8.2 | ✅ |
| EL-6 — one active per dimension | Advisory lock (DB) + atomic file | ✅ |
| CK-9 — no generic `resolved` | States enumerated §8 (inherited) | ✅ |
| Admin adjudication only | §8.1, §12 | ✅ |
| Parties read adjudication | `GET …/adjudication` only | ✅ |

### 6.2 EL-2 mapping (P0-CM2)

| Authoritative check | v1.1 §8.3 | Status |
|---------------------|-----------|--------|
| During execution | `active`, `issue_raised` | ✅ |
| Pending completion path | `active`, `disputed`, `resolved` | ✅ |
| Post-completion window | `completed` + EL-3 | ✅ |
| Never activated | `draft`, `proposed`, `accepted`, `void`, `cancelled` | ✅ |

Legacy Complaint Lifecycle terms (`in_execution`, `pending_completion`) explicitly deprecated — implementers must use State Machine v1 codes.

### 6.3 Cross-engine effects

| Complaint transition | Documented effect | Status |
|---------------------|-------------------|--------|
| Triage pass | Contract → `disputed` §6.6 | ✅ |
| → `evidence_gathering` | Dimension freeze (DB + Contract Engine) | ✅ (implicit) |
| Outcome apply | Attestations + trust recompute §2.3 `/apply-outcome` | ✅ |
| Closed | Contract path update §6.6 | ✅ |

### 6.4 User flow coverage

| Flow | Status |
|------|--------|
| UF-10 File complaint | ✅ §8 |
| UF-11 Resolve complaint | ✅ §8 + §12 admin adjudicate |

---

## 7. Verification matrix (post v1.1)

| Requirement | v1 | v1.1 |
|-------------|:--:|:----:|
| **ADR-001** — no marketplace APIs | ✅ | ✅ |
| **ADR-002** — complaint from contract | ✅ | ✅ |
| **ADR-003** — no direct trust writes | ⚠️ | ✅ |
| **UF-02/03** Verification | ❌ | ✅ |
| **UF-09** Completion | ❌ | ✅ |
| **UF-10/11** Complaint | ⚠️ | ✅ |
| **UF-12** Trust profile | ⚠️ | ✅ |
| **CA-2** executable states | ⚠️ | ✅ |
| **CA-5** trust from domain events | ❌ | ✅ |
| **CA-8** party acceptance | ⚠️ | ✅ |
| **EL-2** status mapping | ❌ | ✅ |
| **Permissions Matrix TEKRR ACL** | ❌ | ✅ |
| **OpenAPI 3.1 ready (architecture)** | ⚠️ | ✅ |
| **P0 findings (Review v1)** | 19 open | **0 open** |

---

## 8. Documentation nits (non-blocking)

| Item | Location | Recommendation |
|------|----------|----------------|
| §4.7 references §7.6 for EL-2 map | Should be §8.3 | Fix in OpenAPI companion doc |
| §11 Execution APIs abbreviated | References v1 for full milestone table | Inline in OpenAPI or v1.1 addendum |
| §12 Admin routes partial | "unchanged from v1 §10" | Copy admin table into v1.1 or OpenAPI-only |
| `dispute_hold` trigger | Trust §7.1 | Add explicit internal transition note |

None of these affect PASS for architecture-level P0 closure.

---

## 9. What's working well

1. **Complete P0 closure** — all 19 Review v1 IDs have concrete API artifacts.
2. **Server-side auth truth** — JWT demoted to hint; DB authority on mutations.
3. **Trust boundary hardened** — outbox consumer replaces open internal POST.
4. **Contract chain completable** — generate → accept → activate → execute → complete documented end-to-end.
5. **Complaint privilege model clarified** — adjudication admin-only; assignment-scoped reads.
6. **PostgreSQL alignment** — CA-2 states match Schema v1.1 review PASS.

---

## 10. Recommended next steps

| Priority | Action |
|----------|--------|
| 1 | Author `openapi/public-v1.yaml` and `openapi/internal-v1.yaml` at version 1.1.0 |
| 2 | Fix §4.7 cross-reference (§7.6 → §8.3) in doc patch or OpenAPI only |
| 3 | Address P1 backlog before MVP launch (notifications, session revocation, composite complaint filing) |
| 4 | Integration tests: UF-01 through UF-12 against staging API |

---

## Related documents

| Document | Relationship |
|----------|--------------|
| [APP13-API-Architecture-v1.1.md](./APP13-API-Architecture-v1.1.md) | Subject of this review |
| [APP13-API-Review-v1.md](./APP13-API-Review-v1.md) | Source P0 findings (all closed) |
| [APP13-API-Architecture-v1.md](./APP13-API-Architecture-v1.md) | Superseded baseline |
| [APP13-PostgreSQL-v1.1-Review.md](./APP13-PostgreSQL-v1.1-Review.md) | CA-2 gate alignment |

---

*Review complete. No architecture files were modified.*
