# ADR-0010: Railway Deployment Preparation (Execution Step 1 — infra)

- **Status:** Accepted
- **Date:** 2026-07-07
- **Change tier:** 1 (infrastructure prep; no product/boundary change)
- **Milestone:** Execution Step 1 (AN ACT staging activation) — provider: **Railway** (Guided Pilot). Preparation only until credentials exist.
- **Constitutional trace:** Manifesto Art. IV, VI; UHAA §6 (AN ACT authority); ET-2.5 Infrastructure Decision Brief (Railway = recommended pilot host); Blueprint M6 (ADR-0008) Part 5
- **Depends on:** ADR-0009 (Step 1)

## Context
Railway is the approved guided-pilot host. This ADR records the deployment **preparation**: service plan, checklist, environment map, and safety checks — **no deployment**, because credentials/access are not yet available.

## Decision
Adopt the Railway plan in `RAILWAY-DEPLOYMENT-READINESS.md`: one backend service (from the existing `Dockerfile`), a Railway PostgreSQL 16 plugin, a Railway Redis plugin, Cloudflare R2 for evidence blobs (Railway has no native object storage), variables/secrets mapped, and `/health/live` as the platform healthcheck. No product logic changes.

## Consequences
- One required **variable mapping** (not a code change): `APP13_PORT` must resolve to Railway's injected `PORT`.
- Evidence storage introduces one non-Railway dependency (R2/S3-compatible).
- Deployment proceeds only after the missing credentials (below) are provided.

## Boundary compliance check
- Reflection boundary: unaffected (Action Realm only; Wegleiter untouched). ✅
- Cross-system communication: none introduced. ✅
- Independent deployability: this deploys AN ACT alone. ✅
- Second authority: none — PostgreSQL remains single source of truth. ✅
- Product logic: **unchanged** — preparation is configuration/ops only. ✅
