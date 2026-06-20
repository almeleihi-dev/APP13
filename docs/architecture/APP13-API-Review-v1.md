# APP13 API Architecture — Review v1

**Version:** 1.0  
**Status:** Review findings  
**Last updated:** June 20, 2026  
**Subject:** [APP13-API-Architecture-v1.md](./APP13-API-Architecture-v1.md)  
**Baseline:** [Permissions Matrix v1](./04-permissions-matrix.md) · [State Machine v1](../APP13-State-Machine-v1.md) · [Contract Engine v1](../APP13-Contract-Engine-v1.md) · [Trust Engine v1.1](../APP13-Trust-Engine-v1.1.md) · [Complaint Lifecycle v1](./06-complaint-lifecycle.md) · [MVP Scope v1](../APP13-MVP-Scope-v1.md) · [User Flows v1](./02-user-flows.md) · ADR-001/002/003

---

## Executive summary

API Architecture v1 establishes a sound **REST-first, transition-based** surface aligned with engine ownership and constitutional exclusions (no marketplace routes, no direct trust writes). The public/internal split, RFC 7807 errors, and presigned evidence upload pattern are appropriate for MVP.

However, the document has **11 P0 gaps** that block the approved MVP chain (`Register → Verify → Action → Contract → Execute → Trust → Complaint`) or create exploitable authorization/security holes. A further **18 P1** and **14 P2** items should be tracked before OpenAPI authoring and implementation.

| Area | Rating | Summary |
|------|--------|---------|
| Security | Partial | JWT stale-claim risk; internal trust ingest; upload tenancy |
| Endpoint coverage | Weak | Identity verification, profiles, completion path missing |
| Authorization | Partial | TEKRR dimension ACL, adjudicator assignment, executable states |
| Contract Engine | Partial | CA-2 state coverage; completion transition; gate preconditions |
| Trust Engine | Partial | Event log PII; CA-5 internal ingest path |
| Complaint workflow | Partial | EL-2 status drift; duplicate adjudication routes |
| OpenAPI readiness | Good | Structure defined; schemas not yet authored |

**Recommended verdict before OpenAPI implementation:** resolve P0 items in API Architecture v1.1.

---

## P0 — Must fix before OpenAPI / implementation

### Security risks

| ID | Finding | Location | Risk | Fix |
|----|---------|----------|------|-----|
| **P0-S1** | **JWT `tier` and `roles` trusted without mandatory server-side revalidation** | §3.3, §4.1 | Suspended user or demoted tier retains access until token expiry; tier gate bypass on contract accept | Resolve tier/roles/account status from DB on every gated mutation; reject if JWT ≠ DB |
| **P0-S2** | **`POST /internal/v1/trust/events` callable by any engine service** | §2.3, §6.4 | Forged `trust.*` events bypass CA-5/ADR-003 event-sourcing chain | Restrict to Trust Ingest service; validate event against preceding domain outbox row or signed engine payload schema |
| **P0-S3** | **`X-Actor-Context` impersonation header without binding rules** | §2.2 | Compromised worker can act as arbitrary user without audit trail | Require signed actor-context token issued by public API gateway; log `service_id` + `actor_context` + `original_request_id` on every internal mutation |
| **P0-S4** | **Presigned upload intent lacks tenancy binding** | §8.3 | Attacker obtains upload URL for another contract's `storage_key` prefix | Bind `upload-intent` to authenticated user, contract party, milestone; reject confirm if object not at issued key or hash mismatch |
| **P0-S5** | **`Idempotency-Key` recommended, not required** | §1.5 | Duplicate transitions (double accept, double file) under retries | Require on all POST transition/create endpoints; return `409` on key reuse with different body |

### Missing endpoints

| ID | Finding | Location | Risk | Fix |
|----|---------|----------|------|-----|
| **P0-E1** | **No Identity verification API (T1/T2)** | §1.4 catalogs `/verifications`; no paths | **UF-02, UF-03 blocked** — MVP SC-1 fails | Add `POST /verifications/t1/start`, `/verifications/t1/complete`, `POST /credentials`, document upload intents, webhook/callback for KYC provider |
| **P0-E2** | **No profile / `/me` endpoints** | §1.4 catalogs `/me`, `/customers`, `/providers`; no paths | Registration → profile → trust view chain incomplete | Add `GET/PATCH /me`, `GET/PATCH /customers/{id}`, `GET/PATCH /providers/{id}`, `GET /providers/{id}` public view |
| **P0-E3** | **No contract completion path** | §5.2, §11.1, §2.3 internal | **UF-09 blocked** — `active` → `completed` never triggered | Add system transition via internal `POST /internal/v1/contracts/{id}/complete` (or document milestone-driven auto-complete with explicit contract transition emission) |
| **P0-E4** | **`POST /auth/token/refresh` referenced but not defined** | §3.3 vs §3.2 | 15-minute access TTL breaks SPA sessions | Add refresh endpoint + rotation policy to auth table |

### Authorization gaps

| ID | Finding | Location | Risk | Fix |
|----|---------|----------|------|-----|
| **P0-A1** | **`PATCH /actions/{id}/tekrr` lacks dimension-level authorization** | §1.7 vs Permissions Matrix TEKRR table | Provider can overwrite customer-only dimensions (T) or customer overwrites K | Split into dimension-scoped routes or enforce per-dimension RBAC in handler (`tekrr.t.write`, `tekrr.k.write`, etc.) |
| **P0-A2** | **Adjudicator access is role-only, not assignment-scoped** | §4.3, §7.2, §10.1 | Any adjudicator reads all complaints; violates least privilege | Gate reads/mutations on `complaints.assigned_admin_user_id` or explicit case assignment |
| **P0-A3** | **Engine gate lists only `contract = active`** | §4.4 | Evidence/attestations incorrectly blocked during `issue_raised`/`disputed`/`resolved` or allowed when `completed` per PostgreSQL v1.1 CA-2 gates | Align with `is_contract_execution_allowed` states: `active`, `issue_raised`, `disputed`, `resolved`, `completed`, `closed` + complaint-outcome bypass |

### Contract Engine violations

| ID | Finding | Spec | Risk | Fix |
|----|---------|------|------|-----|
| **P0-CE1** | **Contract generate lacks documented preconditions** | CA-1, Law 2, Law 6; §5.2 | Contract generated from incomplete TEKRR or wrong tier | Document gates on `POST /actions/{id}/contract/generate`: action `ready_for_contract`, TEKRR 100%, tier gates, return `422` with engine codes |
| **P0-CE2** | **No API contract for issue-path state transitions** | State Machine §2.3: `active` → `issue_raised` → `disputed` | Contract state drift from Issue/Complaint engines | Document cross-engine transitions: issue raise → contract `issue_raised`; complaint triage pass → `disputed`; outcome → `resolved`/`completed`/`closed` via internal orchestration |
| **P0-CE3** | **CA-8 misdocumented in §5.5** | Contract Engine CA-8 | Implementers may reject penultimate party accept | Correct: activation blocked until **all** required parties accept; per-party accept allowed in `proposed` |

### Trust Engine violations

| ID | Finding | Spec | Risk | Fix |
|----|---------|------|------|-----|
| **P0-T1** | **`GET /trust/providers/{id}/events` may expose customer identities** | Permissions Matrix §9.1; Trust v1.1 explainability | PII leak to provider self-view beyond spec | Define event response DTO with field allowlist; strip `customer_id`/party identifiers unless trust_ops/admin |
| **P0-T2** | **Direct internal trust event POST bypasses domain-event chain** | CA-5, ADR-003 | User-originated or engine-spoofed score inputs | Trust events emitted only from validated domain outbox consumer or recompute job — not direct arbitrary POST |

### Complaint workflow violations

| ID | Finding | Spec | Risk | Fix |
|----|---------|------|------|-----|
| **P0-CM1** | **Duplicate adjudication routes with inconsistent guards** | §7.2 `POST /complaints/{id}/adjudication` vs §10.1 `/admin/complaints/{id}/adjudicate` | Privilege confusion; party-facing route may expose admin-only operation | Single admin-only adjudication route under `/admin`; remove or alias public route; parties read-only via `GET` |
| **P0-CM2** | **EL-2 contract status vocabulary drift** | Complaint Lifecycle EL-2 uses `in_execution`, `pending_completion`; State Machine uses `active`, `completed` | Filing eligibility implemented against wrong statuses | Map EL-2 to authoritative states: `active`, `issue_raised`, `disputed`, `resolved`, `completed` (+ window) |

---

## P1 — Recommended before MVP launch

### Security risks

| ID | Finding | Risk | Fix |
|----|---------|------|-----|
| **P1-S1** | No account lockout / rate limit on `/auth/login` and password reset | Credential stuffing, email enumeration | Add lockout after N failures; uniform reset response |
| **P1-S2** | No session revocation on `suspend` / password change | Stolen session persists | Invalidate all sessions on suspend, password reset, role change |
| **P1-S3** | No bot protection on registration | Mass fake accounts | CAPTCHA or proof-of-work on register |
| **P1-S4** | Bearer JWT + session cookie dual auth without precedence rules | Auth confusion, CSRF on hybrid clients | Document: cookie for web; Bearer for API; mutual exclusion per client type |
| **P1-S5** | Admin override JSON not required on all ‡ actions | Unaudited privileged ops | Require `reason` + ticket on attestation override, force-void, admin complaint actions |
| **P1-S6** | Presigned download URLs lack TTL and audit | Evidence exfiltration | Short TTL (≤15 min); log download with actor + evidence_id |

### Missing endpoints

| ID | Finding | Risk | Fix |
|----|---------|------|-----|
| **P1-E1** | `POST /actions/{id}/tekrr/proposals` mentioned but not in endpoint table | Provider T-dimension propose flow incomplete | Add proposal CRUD endpoints |
| **P1-E2** | No `GET /issues` list endpoint | Party cannot see open issues on contract | Add scoped list with `?contract_id=` |
| **P1-E3** | No notification endpoints despite catalog | MVP Scope §3 in-app notifications undeliverable | Add `GET /notifications`, `PATCH /notifications/{id}/read` |
| **P1-E4** | No credentials admin/provider endpoints beyond verification queue | T2 credential lifecycle incomplete | Add `GET /providers/{id}/credentials`, admin credential review |
| **P1-E5** | No contract `start_execution` or equivalent | Contract Engine `active` → in-execution semantics unclear | Document whether `active` subsumes execution or add explicit transition |
| **P1-E6** | No admin attestation override endpoint | Permissions Matrix ‡ emergency attestation | Add `POST /admin/contracts/{id}/attestations/{id}/override` with audit |
| **P1-E7** | No dimension freeze admin endpoint | Permissions Matrix "Freeze dimension (complaint)" | Add internal or admin freeze/unfreeze on milestone/attestation |
| **P1-E8** | `GET /operations/{id}` defined in §13.2 but absent from resource catalog | Async activation/completion polling undiscoverable | Add to §1.4 catalog |
| **P1-E9** | No provider invite token endpoint for unregistered providers | UF-05 invite-before-register flow awkward | Add `POST /auth/register/provider?invite_token=` or public invite accept |
| **P1-E10** | No `GET /contracts/{id}/complaints` nested read | Parties must scan global complaint list | Add nested collection route |

### Authorization gaps

| ID | Finding | Risk | Fix |
|----|---------|------|-----|
| **P1-A1** | `GET /action-types` allows unauthenticated access (implied "Any") | Low — taxonomy not secret; enables scraping | Require auth or rate-limit aggressively |
| **P1-A2** | Evidence upload actor footnote only — no API-level role matrix | Customer uploads rejected or provider uploads over-restricted | Document per `responsible_party` + evidence_type matrix on upload-intent |
| **P1-A3** | Admin contract search without field-level redaction spec | Support staff over-exposure of PII | Define admin contract DTO vs party DTO |
| **P1-A4** | `POST /contracts/{id}/transitions` `cancel` allows admin without ‡ audit flag in table | Policy violation | Mark admin cancel as audited override in endpoint spec |
| **P1-A5** | Super_admin template endpoints absent | OK if deployment-only — document explicitly | Add note: templates not API-mutable in MVP |

### Contract Engine violations

| ID | Finding | Risk | Fix |
|----|---------|------|-----|
| **P1-CE1** | `PATCH /contracts/{id}/commercial-terms` customer-only — provider cannot read via dedicated endpoint | Provider blind to terms they accepted | Include in contract GET or add provider read |
| **P1-CE2** | No acceptance timeout / void transition exposed | 7-day void (Contract Engine §3.3) requires system job | Document cron + internal void transition |
| **P1-CE3** | Auto-accept attestation silence (7-day) not in API | Milestones stuck in `submitted` | Internal job + optional `GET` flag `auto_accept_scheduled_at` |
| **P1-CE4** | Contract `accepted` state description implies partial accept in wrong state | Client state machine bugs | Clarify: per-party acceptance recorded in `proposed`; status → `accepted` only when all parties done |
| **P1-CE5** | No document hash verification endpoint at accept time | CL-5 acceptance integrity | Return `document_hash` in GET; client confirms before accept |

### Trust Engine violations

| ID | Finding | Risk | Fix |
|----|---------|------|-----|
| **P1-T1** | Public summary schema missing `collusion_review_flag` | Trust v1.1 §3.2 public_summary incomplete | Add field per Trust Engine v1.1 |
| **P1-T2** | No `record_state` in trust responses | Clients cannot show dispute_hold/frozen | Expose on full view; map to `dispute_hold_active` on public |
| **P1-T3** | Appeal flow duplicates admin resolve paths | §6.2 vs §10.1 trust appeals | Consolidate: public submit + admin resolve only |
| **P1-T4** | Eval submission timing/window not specified | Eval rejected or scored wrong window | Document post-completion window (default 14 days) and supersession on complaint |

### Complaint workflow violations

| ID | Finding | Risk | Fix |
|----|---------|------|-----|
| **P1-CM1** | `POST /complaints` requires `case_id` — no composite filing endpoint | Race between case create + complaint file under EL-6 | Offer `POST /complaints` with optional `case_id` + auto-create case atomically |
| **P1-CM2** | Party `POST /complaints/{id}/transitions` underspecified | Invalid mediation/withdraw transitions | Enumerate allowed party transitions per state (withdraw, accept_mediation) |
| **P1-CM3** | No admin SLA queue filters | MVP 15-day median SLA not operable | Add `?sla_breach=true`, `?filed_before=` on admin queue |
| **P1-CM4** | Issue raise does not document contract side-effect | Contract stays `active` if API omits engine call | Specify: `POST /issues` triggers contract → `issue_raised` when during execution |
| **P1-CM5** | Mediation `GET` endpoints missing | Parties cannot list proposals | Add `GET /complaints/{id}/mediation/proposals` |
| **P1-CM6** | Case dimension junction APIs missing | Case-level EL-6 partial uniques unsupported | Add case dimension CRUD if cases use dimension scope |

---

## P2 — Future / Phase 2+

### Security risks

| ID | Finding |
|----|---------|
| **P2-S1** | No mTLS pinning spec for KYC provider webhooks |
| **P2-S2** | No WAF / IP allowlist spec for admin routes |
| **P2-S3** | No secrets rotation policy for service JWT signing keys |
| **P2-S4** | No field-level encryption spec for verification document metadata |

### Missing endpoints

| ID | Finding |
|----|---------|
| **P2-E1** | Webhooks for async operations (deferred MVP) |
| **P2-E2** | Contract amendment APIs (UF-13 excluded MVP but listed in user flows index) |
| **P2-E3** | Institutional org APIs (Phase 2) |
| **P2-E4** | Bulk admin exports |
| **P2-E5** | Provider slug/public URL (Phase 2 profile SEO) |

### Authorization gaps

| ID | Finding |
|----|---------|
| **P2-A1** | Multi-role user switching (same person customer + provider) |
| **P2-A2** | Org-scoped institutional RBAC |
| **P2-A3** | Fine-grained trust_ops vs platform_admin field masks |

### Contract Engine violations

| ID | Finding |
|----|---------|
| **P2-CE1** | Payment/escrow readiness hooks (Phase 4) |
| **P2-CE2** | Amendment graph versioning API |
| **P2-CE3** | Multi-jurisdiction template selection API |

### Trust Engine violations

| ID | Finding |
|----|---------|
| **P2-T1** | Third-party trust certification API (explicitly excluded MVP) |
| **P2-T2** | Customer trust scores (not in MVP) |
| **P2-T3** | Real-time score streaming / SSE |

### Complaint workflow violations

| ID | Finding |
|----|---------|
| **P2-CM1** | External escalation automation (`escalated_external` workflow) |
| **P2-CM2** | Automated mediation recommendations |
| **P2-CM3** | Legal referral workflow APIs |

---

## Verification matrix

| Requirement | API v1 | Gap |
|-------------|:------:|-----|
| **ADR-001** — no marketplace APIs | ✅ | — |
| **ADR-002** — complaint requires contract | ✅ | `contract_id` on file body |
| **ADR-003** — no direct trust score writes | ⚠️ | Internal event POST (P0-T2) |
| **UF-01** Registration | ⚠️ | Auth paths present |
| **UF-02/03** Verification | ❌ | P0-E1 |
| **UF-04–07** Action → Contract | ⚠️ | Generate gates (P0-CE1) |
| **UF-08** Execution | ⚠️ | CA-2 states (P0-A3) |
| **UF-09** Completion | ❌ | P0-E3 |
| **UF-10/11** Complaint | ⚠️ | P0-CM1, P0-CM2 |
| **UF-12** Trust profile | ⚠️ | P0-E2 |
| **Law 5** — contract before execution | ⚠️ | Gate doc incomplete |
| **Law 13** — attestation evidence | ✅ | Link evidence endpoint |
| **CA-2** — executable states | ⚠️ | P0-A3 |
| **CA-5** — trust from domain events | ❌ | P0-T2 |
| **EL-6** — one active dimension | ✅ | Server-side; filing flow P1-CM1 |
| **Permissions Matrix** | ⚠️ | TEKRR ACL, adjudicator assign |
| **OpenAPI 3.1 compatible** | ✅ | Structure ready |

---

## What's working well

1. **Constitutional exclusions explicit** — marketplace, payment, trust PUT routes documented as forbidden.
2. **Transition-based mutations** — aligns with State Machine v1 and PostgreSQL deferrable triggers.
3. **Public/internal split** — materialization, triage, recompute correctly internalized.
4. **Evidence upload pattern** — presigned two-step with content hash is appropriate.
5. **Problem Details error model** — engine + code supports client and ops debugging.
6. **Complaint dimension junction** — file body creates `complaint_dimensions` (CK-7 aware).
7. **Admin audit intent** — override reason JSON and audit events referenced.

---

## Recommended fix order

| Priority | Scope | IDs |
|----------|-------|-----|
| 1 | API Architecture v1.1 — identity + auth completion | P0-E1, P0-E2, P0-E4 |
| 2 | Authorization hardening spec | P0-S1, P0-A1, P0-A2, P0-A3 |
| 3 | Contract + complaint orchestration | P0-E3, P0-CE2, P0-CM1, P0-CM2 |
| 4 | Trust security | P0-S2, P0-T1, P0-T2 |
| 5 | Upload + idempotency | P0-S4, P0-S5 |
| 6 | OpenAPI authoring | After v1.1 doc patch |
| 7 | P1 backlog | Pre-launch hardening |

---

## Related documents

| Document | Relationship |
|----------|--------------|
| [APP13-API-Architecture-v1.md](./APP13-API-Architecture-v1.md) | Subject of this review |
| [APP13-PostgreSQL-v1.1-Review.md](./APP13-PostgreSQL-v1.1-Review.md) | DB gate alignment reference |
| [Permissions Matrix v1](./04-permissions-matrix.md) | Authorization source |
| [User Flows v1](./02-user-flows.md) | MVP flow coverage |

---

*Review complete. No API Architecture files were modified.*
