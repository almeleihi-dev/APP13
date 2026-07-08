# ADR-0009: AN ACT Staging Activation (Execution Step 1)

- **Status:** Accepted
- **Date:** 2026-07-07
- **Change tier:** 1 (infrastructure activation; no product/boundary change)
- **Milestone:** Execution Step 1 (AN ACT staging activation). First implementation step of the Engineering Execution Phase.
- **Constitutional trace:** Manifesto Art. IV (evidence/trust), VI (singular authority); HSTM S5–S10 (Action Realm); UHAA §6 (AN ACT authority); Technical Blueprint M6 (ADR-0008) Part 7 step 1
- **Depends on:** ADR-0003 (M1 staging prep), ADR-0008 (Blueprint)

## Context
Move AN ACT from OC-1 into a real staging environment: provision PostgreSQL 16 + Redis + object storage, deploy the backend, and run the real end-to-end loop. Infrastructure activation only — no Wegleiter change, no Consent Layer, no integration, no features, no redesign.

## Decision
Execute Step 1 exactly as scoped. Attempt real provisioning; run real migrations and a real E2E loop. **No mocks, no simulated success** — if a dependency is unavailable, stop and report the exact failure.

## Confirmations (pre-execution)
- **Reflection boundary unaffected:** Wegleiter is untouched; this step involves only the Action Realm. ✅
- **No cross-system communication:** no identity federation, no consent layer, no events — AN ACT alone. ✅
- **AN ACT independently deployable:** this step deploys AN ACT by itself. ✅

## Boundary compliance check
- Reflection→evidence separation: unaffected (no reflection data present in AN ACT). ✅
- Human-owned crossing: not in scope this step. ✅
- Independent deployability: this step *is* the independent deployment. ✅
- Second authority: none created. ✅
