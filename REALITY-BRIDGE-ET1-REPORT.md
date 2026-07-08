# AN ACT — Reality Bridge ET-1 · Completion Report

**Mission:** Make the existing invention real — connect the two strong-but-separated halves into one coherent system. No new engines, no roadmap expansion, no redesign. Remove illusion, connect what exists.

**Method:** Read the real code, connect real seams, verify by TypeScript typecheck. Backend/DB could not be run in this environment (no provisioned Postgres; package registry blocked), so runtime end-to-end was verified by static wiring + compile, not a live run. This is stated plainly everywhere it matters.

---

## 1. What was connected

**Correction to the ET-0 audit:** the frontend↔backend bridge was *more* built than the audit credited. `RuntimeProvider` (mounted in `PlatformApp`) already wires **login, registration, provider registration, `/v1/me`, and the need/action journey transport** to the real `/v1/*` API through the pre-existing, unused-in-parts `@an-act/runtime-client` (with token storage + refresh). Auth and the core journey were already real. The true disconnect was narrower: the **Professional Passport / personal-identity layer ran entirely on browser `localStorage`**, and the client could only target same-origin.

ET-1 closed those gaps with three surgical, typechecked edits — connecting existing code, not adding engines:

1. **Configurable API origin** — `apps/web/src/providers/RuntimeProvider.tsx` now resolves `VITE_API_BASE_URL` (falls back to same-origin). This is what lets the deployed frontend reach a separately-hosted backend.
2. **Backend-authoritative passport hook** — new `apps/web/src/passport/useBackendPassport.ts` loads the passport from the real, DB-backed `/professional-passport` endpoint (which composes provider profile + trust profile + trust history from PostgreSQL) via the existing runtime client. Defensive by construction: on 401/404/network it resolves to `unavailable` and the caller falls back to the local draft.
3. **Passport dashboard reality wiring** — `PersonalPassportDashboardPage.tsx` now shows a **"Verified by AN ACT"** authority panel with the real trust score / tier / passport level / completed-action count when a verified session exists, and explicitly labels the localStorage copy as a **"Local draft — not yet synced"** otherwise.

**Verification:** `tsc -p tsconfig.json --noEmit` on `apps/web` → **exit 0, no errors.**

---

## 2. What remained unchanged (intentionally)

The Core Engine was preserved exactly as required — **no modifications** to Contract, Trust, Evidence, Identity, Financial, or Complaint. Confirmed real and left intact:

- `contract-engine.service.ts` — transactional `generateContract` + `materialize` (milestones + attestations, idempotent, GUC-gated).
- `trust.*` — event-sourced scoring; `trust.trust_score_events` written by the trust repository; complaints feed trust impacts via `issue-service.ts`.
- The 20-migration PostgreSQL schema, outbox, idempotency, audit, JWT/session auth — untouched.

No modules were deleted or duplicated. No new conceptual engine was created.

---

## 3. What simulations remain

All Simulation-Layer modules were **kept, not deleted**, and are now formally classified (see `docs/reality-bridge/MODULE-BOUNDARY-ET1.md`). Still simulation, still developer/demo-gated behind `SHOW_DEVELOPER_SURFACES`:

- The 28 deterministic `*-intelligence` modules (rule/weight heuristics — not AI/ML, no persistence).
- Self-grading / readiness surfaces: `production-readiness`, `release-readiness`, `launch-simulation`, `mission-control`, `investor-readiness`, `runtime-*readiness/authority/approval`, `post-launch-monitoring`.
- Executive/investor presentation surfaces and `runtime-demo`.
- `living-experience/*` motivational surfaces not backing the core loop.

The boundary rule: **simulation output must never be presented to users or external parties as real capability or metrics.**

---

## 4. New architecture (after ET-1)

```
                         ┌──────────────────────────────────────────┐
                         │            FRONTEND (apps/web)             │
                         │  React SPA · RuntimeProvider               │
                         │  baseUrl = VITE_API_BASE_URL | same-origin │
                         └───────────────┬────────────────────────────┘
                                         │ @an-act/runtime-client (JWT + refresh)
                                         │ HTTPS  /v1/* · /professional-passport
                                         │        /need-experience · /action-experience
              ┌──────────────────────────▼───────────────────────────┐
              │                 BACKEND  (Fastify, dist/)              │
              │                                                        │
              │  B — EXPERIENCE LAYER   (reads Core, shapes views)     │
              │     professional-passport · need/action journey ·      │
              │     trust-reputation · contract-journey · request-match│
              │                     │ composes                          │
              │  A — CORE ENGINE  (SOURCE OF TRUTH · unchanged)         │
              │     identity · action · contract-engine · execution ·  │
              │     evidence/attestation · complaint · trust(events) · │
              │     financial(ledger/escrow) · platform(outbox/idemp.) │
              │                     │ SQL (transactions, GUC gates)     │
              └─────────────────────┼──────────────────────────────────┘
                                    ▼
                     PostgreSQL 16   +   Redis   +   S3/MinIO (evidence)

   C — SIMULATION LAYER  (kept · developer/demo-gated · not on prod path):
       *-intelligence · *-readiness · launch-simulation · mission-control ·
       investor/executive · runtime-demo · living-experience motivational
```

**The real user loop (backend-verified by wiring):**
`register (/v1/auth/*) → passport (/professional-passport, DB-sourced) → offer/need (/v1/actions, /requests) → contract (/v1/actions/:id/contract/generate → materialize) → milestone transition → evidence (/v1/contracts/:id/milestones/:mid/evidence) → trust event (trust.trust_score_events) → passport reflects new trust`.

---

## 5. New readiness score

Scores reflect coherence gained, and honesty about what still needs a live run/deploy.

| Dimension | ET-0 | ET-1 | Why it moved |
|---|---:|---:|---|
| Architecture | 68 | 74 | Clear Core/Experience/Simulation boundary; configurable origin. |
| Product coherence | 45 | 66 | Passport now sourced from the real accountable record; halves joined at the trust-visible seam. |
| UX | 55 | 60 | Explicit authoritative vs. draft state replaces silent localStorage illusion. |
| Technical readiness | 50 | 58 | Bridge edits typecheck; deployment map defined. Still no live deploy / green CI. |
| Market potential | 70 | 70 | Unchanged — thesis intact. |
| Innovation | 62 | 62 | Unchanged — no new invention, by design. |
| **Launch readiness** | **28** | **45** | Bridge + deployment map exist; blocked on deploying backend+DB, running the 329-test suite, and (split-origin) CORS. |

**Net:** AN ACT moved from "two strong separated halves" toward "one coherent system with a labeled simulation layer." It is not yet launched — the remaining work is operational (deploy backend+DB, verify tests live, close CORS/payments), not inventive.

---

## Files changed / added

- `apps/web/src/providers/RuntimeProvider.tsx` — configurable API origin *(edited)*
- `apps/web/src/passport/useBackendPassport.ts` — backend-authoritative passport hook *(new)*
- `apps/web/src/pages/PersonalPassportDashboardPage.tsx` — authority-aware passport view *(edited)*
- `docs/reality-bridge/MODULE-BOUNDARY-ET1.md` — Phase 3 classification *(new)*
- `docs/reality-bridge/DEPLOYMENT-MAP-ET1.md` — Phase 5 deployment map *(new)*

Core Engine (Contract, Trust, Evidence, Identity, Financial, Complaint): **unchanged.**

**Stopping here per instruction — awaiting approval before any deploy or further work.**
