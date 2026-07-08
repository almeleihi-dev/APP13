# AN ACT — Production Operations (OC-1)

Operational reference for running AN ACT. Describes the system exactly as implemented — no roadmap, no speculation.

## 1. Runtime architecture

- **Frontend:** React/Vite SPA (`apps/web`), static assets. State authority = backend; localStorage holds only tokens, UI prefs, drafts, and non-authoritative living/growth state.
- **Backend:** single Fastify process (`node dist/index.js`). Global hook chain: request-id → CORS → idempotency → authenticate (JWT/session) → require-auth → revalidate → service-auth → routes; `onSend` idempotency capture; central RFC-7807 error handler.
- **Datastores:** PostgreSQL (source of truth), Redis (sessions, token store, idempotency), S3-compatible bucket (evidence blobs).

## 2. Deployment architecture

```
Users ─HTTPS─► CDN (SPA)           VITE_API_BASE_URL ─► API tier
                                     (Docker: node dist/index.js :3000)
   API tier ── SQL ──► PostgreSQL 16   (identity, contract, execution,
             ── TCP ──► Redis            complaint, financial, trust, platform)
             ── HTTPS ─► S3 bucket (evidence blobs)
Probes: GET /health/live (liveness)   GET /health (readiness: DB+Redis)
```
Backend runs on a container host (Fly/Render/Railway now; AWS ECS later). SPA on a CDN. Same-origin proxy or split-origin via `APP13_CORS_ORIGINS` + `VITE_API_BASE_URL`.

## 3. Dependency graph

```
Fastify API
 ├─ PostgreSQL  (REQUIRED)  identity/contract/execution/complaint/financial/trust/platform
 ├─ Redis       (REQUIRED)  sessions · refresh/verify tokens · idempotency
 └─ S3 bucket   (REQUIRED for evidence upload/download)
Startup config validation REQUIRES: DATABASE_URL, REDIS_URL, JWT_SECRET(>=32), S3_*.
Boot refuses (staging/production) on dev-default secrets or localhost DB/Redis.
```
Hard dependencies: without Postgres `/health`=503 + data ops 500; without Redis, auth/session + idempotency fail. S3 needed only for evidence blob transfer (metadata is in Postgres).

## 4. Operational sequence (the real chain)

`Identity (identity.users/providers/customers)` → `Authentication (JWT + Redis session)` → `Professional Passport (composed from provider profile + trust profile + trust history)` → `Need (experience.customer_requests) / Offer (action.actions)` → `Match (deterministic scoring → persisted experience.match_contract_offers)` → `Contract (contract-engine generate → transactional materialize: contract.contracts + execution.milestones + execution.attestations, GUC-gated, idempotent)` → `Execution (milestone transitions)` → `Evidence (execution.evidence + upload-intent → S3)` → `Trust (trust.trust_score_events → recompute → trust.trust_scores)` → `Financial ledger (financial.journals + ledger_entries, escrow_agreements)`. Complaints (`complaint.*`) feed trust impacts via issue-service.

## 5. Migration procedure

```bash
psql "$DATABASE_URL" -c 'CREATE EXTENSION IF NOT EXISTS pgcrypto;'   # or rely on migration 001
DATABASE_URL="$DATABASE_URL" npm run migrate                          # applies 001..020, idempotent
psql "$DATABASE_URL" -c "SELECT version FROM platform.schema_migrations ORDER BY version;"  # expect 001..020
psql "$DATABASE_URL" -c "\dn"   # expect: identity, action, contract, execution, complaint, financial, trust, platform, experience
```
Runner (`scripts/migrate.ts`) tracks applied versions in `platform.schema_migrations`; re-runs skip applied files. Always take a pre-migration snapshot (see §7).

## 6. Health monitoring

- `GET /health/live` → always 200 while the process is up → **liveness** / restart probe.
- `GET /health` → 200 only when **DB and Redis are both reachable**, else 503 with per-dependency `{status, latency_ms, error}` → **readiness** / traffic gate.
- Alert on: `/health` 503 > 1 min, DB/Redis latency spikes, 5xx rate, shutdown-timeout fatal logs. Logs are structured JSON (pino) with `request_id` on every line.

## 7. Backup strategy (pilot)

- **PostgreSQL:** managed automated daily backups + PITR where available; **manual `pg_dump` before every deploy/migration**: `pg_dump "$DATABASE_URL" > pre_deploy_$(date +%F).sql`. Postgres holds all authoritative state — this is the critical backup.
- **Redis:** cache/session/idempotency only — recreatable; enable RDB snapshots but sessions re-establishing on loss is acceptable (users re-auth).
- **S3 evidence:** enable bucket versioning; evidence is legally significant — never hard-delete during pilot.

## 8. Recovery procedure

1. **Backend down:** orchestrator restarts container (liveness probe). Stateless — safe to restart/redeploy anytime.
2. **DB down:** `/health`=503, writes 500. Restore managed instance or latest snapshot/PITR; re-point `DATABASE_URL`; verify `/health`=200.
3. **Redis down:** auth/idempotency fail. Restart Redis; sessions re-establish on next login (no data loss — Postgres unaffected).
4. **Bad deploy:** roll back to previous image; if a migration is implicated, restore the pre-deploy `pg_dump`. Migrations are forward-only — never edit an applied migration; add a new one.
5. **Graceful shutdown:** SIGTERM drains HTTP, then closes DB + Redis, bounded by a 10s hard timeout (verified live).
