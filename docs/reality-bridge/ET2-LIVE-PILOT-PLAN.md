# AN ACT — ET-2 Live Infrastructure Pilot Plan

Exact plan to stand up a real pilot. **No blind deploys.** Every step lists the command and the expected verification output. This document plans; it does not execute a cloud deploy (no external credentials in this environment).

---

## 1. Production infrastructure (live architecture)

```
        Users ──HTTPS──► CDN (apps/web/dist, static SPA)
                              │  VITE_API_BASE_URL = https://api.anact.app
                              ▼
                    Backend API tier  (Docker: node dist/index.js, port 3000)
                    ├── GET /health/live  → liveness probe
                    ├── GET /health       → readiness (DB + Redis)
                    │
             ┌──────┼───────────────┬───────────────────┐
             ▼      ▼               ▼                   ▼
        PostgreSQL 16      Redis (sessions,        S3 bucket
        (source of truth)  idempotency, tokens)    (evidence blobs)
```

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Static host / CDN (Vercel ok) | build `apps/web` |
| Backend API | Container host — Fly.io / Render / Railway / ECS | **not** Vercel static; uses the provided `Dockerfile` |
| PostgreSQL | Managed PG 16 — Neon / RDS / Supabase | needs `pgcrypto` |
| Redis | Managed Redis — Upstash / Elasticache | **required** at runtime |
| Object storage | S3 / R2 | evidence uploads |

## 2. Environment variables & secrets

Source of truth: `.env.production.example`. Required at boot (validated by Zod + ET-2 production guard):

`APP13_ENV=production`, `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET` (≥32 chars, **not** the dev default), `KYC_WEBHOOK_SECRET` (**not** the dev default), `S3_*`. The production guard **refuses to boot** if `JWT_SECRET`/`KYC_WEBHOOK_SECRET` are dev defaults or if `DATABASE_URL`/`REDIS_URL` point at localhost (verified live).

Secrets to generate/obtain externally (cannot be created here): `JWT_SECRET`, `KYC_WEBHOOK_SECRET`, Postgres credentials, Redis credentials, S3 keys.

## 3. Database provisioning (exact steps)

```bash
# 3.1 Provision managed Postgres 16, capture DATABASE_URL.
# 3.2 Enable pgcrypto (migration 001 also does CREATE EXTENSION IF NOT EXISTS pgcrypto):
psql "$DATABASE_URL" -c 'CREATE EXTENSION IF NOT EXISTS pgcrypto;'
#     expected: CREATE EXTENSION  (or NOTICE: already exists)

# 3.3 Apply migrations 001..020 (idempotent; tracked in platform.schema_migrations):
DATABASE_URL="$DATABASE_URL" npm run migrate
#     expected tail: apply 001_initial_schema ... apply 020_event_inbox / migrations complete

# 3.4 Verify schemas exist:
psql "$DATABASE_URL" -c "\dn"
#     expected schemas: identity, action, contract, execution, complaint, financial, trust, platform, experience

# 3.5 Verify key tables:
psql "$DATABASE_URL" -c "\dt identity.*; \dt contract.*; \dt trust.*; \dt financial.*"
#     expected: identity.users, contract.contracts, trust.trust_score_events,
#               financial.ledger_entries, financial.escrow_agreements, ...

# 3.6 Provision Redis; capture REDIS_URL (rediss:// with TLS for managed).

# 3.7 Pilot backup strategy:
#     - Enable managed automated daily snapshots + PITR (point-in-time recovery).
#     - Pre-migration manual snapshot before each deploy:  pg_dump "$DATABASE_URL" > pre_deploy_$(date +%F).sql
#     - Redis is a cache/session store: sessions can be re-established; enable RDB snapshots but treat as recreatable.
```

## 4. Backend deploy (exact commands)

```bash
# Build image (uses the ET-2 Dockerfile):
docker build -t anact-api:pilot .

# Run with the pilot environment:
docker run --env-file .env.production -p 3000:3000 anact-api:pilot
#     expected log: "app13-api listening" with env:"production"

# Readiness (must be 200 only when DB AND Redis are reachable):
curl -s -o /dev/null -w "%{http_code}\n" https://api.anact.app/health
#     expected: 200   body: {"status":"ok","dependencies":{"database":{"status":"up",...},"redis":{"status":"up",...}}}
curl -s https://api.anact.app/health/live
#     expected: {"status":"ok",...}  (200)
```

## 5. Frontend connect & deploy

```bash
# Build the SPA pointing at the live API (split-origin) or leave empty for same-origin proxy:
VITE_API_BASE_URL=https://api.anact.app VITE_SHOW_DEVELOPER_SURFACES=false \
  npm --prefix apps/web run build
# Deploy apps/web/dist to the CDN.
```
Verified in ET-1/ET-2: the runtime client resolves `VITE_API_BASE_URL` → `https://api.anact.app/v1/...`; empty → same-origin. CORS (ET-1.5) allows the SPA origin; set `APP13_CORS_ORIGINS=https://anact.app` for split origin.

localStorage is retained only for UI preferences, drafts, and non-authoritative fallback; identity/contracts/trust/evidence/financial come from the backend.

## 6. End-to-end pilot verification

```bash
BASE_URL=https://api.anact.app bash scripts/reality-bridge/e2e-reality-loop.sh
# Drives: register → login → identity → passport → action(need/offer) →
#         contract → milestone → evidence intent → trust profile.
# expected: HTTP 2xx through each step; final trust profile returns a score object.
```

## 7. Go / no-go gates before opening to pilot users

1. `GET /health` = 200 with both dependencies `up`.
2. Migrations show `020_event_inbox` applied.
3. `e2e-reality-loop.sh` green on staging.
4. Production guard confirmed (boot rejects dev secrets — already verified).
5. Backend actually deployed (today only the SPA deploys).
6. Real `JWT_SECRET` + `KYC_WEBHOOK_SECRET` set.
7. Payment processor decision (schema ready; processor stubbed) — only if the pilot handles money.
