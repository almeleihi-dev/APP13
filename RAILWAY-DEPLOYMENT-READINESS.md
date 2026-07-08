# AN ACT — Railway Deployment Readiness (Guided Pilot)

**Preparation only. No deployment performed** (Railway credentials/access not yet available). No product logic changed; Wegleiter untouched; no integration; no features. ADR: ADR-0010.

## Artifact verification (present & current)
- `Dockerfile` — multi-stage `tsc` build → `node dist/index.js`; `EXPOSE 3000`; container `HEALTHCHECK` on `/health/live`. ✅
- `.dockerignore`, `.env.production.example` ✅
- `scripts/migrate.ts` — idempotent runner, migrations 001–020, `platform.schema_migrations`, needs `pgcrypto` ✅
- Health endpoints: `/health/live` (liveness), `/health` (readiness: DB+Redis) ✅
- Config reads `APP13_PORT` (default 3000), `APP13_HOST` default `0.0.0.0`; production guard rejects dev-default secrets & localhost deps ✅

## 1. Railway service plan
| Component | Railway resource | Notes |
|---|---|---|
| Backend API | **Service** built from `Dockerfile` (repo deploy) | listens on `APP13_PORT`; must map to Railway `PORT` (see env map) |
| PostgreSQL 16 | **Railway PostgreSQL plugin** | provides `DATABASE_URL` (reference var); enable `pgcrypto` |
| Redis | **Railway Redis plugin** | provides `REDIS_URL` (reference var) |
| Object storage (evidence) | **Cloudflare R2** (S3-compatible) — external | Railway has no native object storage |
| Secrets | Railway service **Variables** (secret) | `JWT_SECRET`, `KYC_WEBHOOK_SECRET`, R2 keys |

Networking: use Railway **private networking** (`*.railway.internal`) for DB/Redis so traffic stays internal; expose only the backend's public domain. Frontend (SPA) stays on its current CDN and points at the backend's public URL.

## 2. Deployment checklist (exact order — execute when credentials exist)
1. Create Railway **project** ("an-act-staging").
2. Add **PostgreSQL** plugin → capture `DATABASE_URL`.
3. Enable `pgcrypto`: `psql "$DATABASE_URL" -c 'CREATE EXTENSION IF NOT EXISTS pgcrypto;'`
4. Add **Redis** plugin → capture `REDIS_URL`.
5. Create **Cloudflare R2** bucket `app13-evidence-staging` (+ versioning) → capture S3 vars.
6. Create the **backend service** from the repo `Dockerfile`.
7. Configure **variables** (section 3) incl. `APP13_PORT=${{PORT}}`.
8. Set **healthcheck path** = `/health/live`; start-period ≥ 20s.
9. **Deploy** backend → confirm boot log `app13-api listening`.
10. **Run migrations:** `DATABASE_URL=… npm run migrate` → expect `apply 001…020 / migrations complete`.
11. **Verify health:** `GET /health` = 200 with `database:up` + `redis:up`; `GET /health/live` = 200.
12. **Run E2E loop:** `BASE_URL=<railway-url> bash scripts/reality-bridge/e2e-reality-loop.sh` → real Identity→…→Trust.

## 3. Environment map (required variables)
| Variable | Source | Notes |
|---|---|---|
| `APP13_ENV` | set = `staging` | activates production config guard |
| `APP13_PORT` | `${{PORT}}` (Railway-injected) | **required mapping** so the app listens on Railway's port |
| `APP13_HOST` | `0.0.0.0` | default ok |
| `DATABASE_URL` | Railway Postgres reference var | internal hostname (not localhost → guard passes) |
| `REDIS_URL` | Railway Redis reference var | internal hostname |
| `JWT_SECRET` | **secret** (generate ≥32 chars) | guard rejects dev default |
| `KYC_WEBHOOK_SECRET` | **secret** | guard rejects dev default |
| `S3_ENDPOINT` / `S3_BUCKET` / `S3_ACCESS_KEY` / `S3_SECRET_KEY` / `S3_REGION` | Cloudflare R2 | evidence blobs |
| `APP13_CORS_ORIGINS` | frontend origin(s) | only if SPA is a different origin than the API |
| `VITE_API_BASE_URL` | **frontend build** | set to the backend public URL (or empty for same-origin proxy) |

## 4. Safety checks
- **Production config guard:** PASS by design — with `APP13_ENV=staging` + real secrets + Railway-internal DB/Redis hostnames (non-localhost), boot succeeds; with any dev default or localhost dep, boot refuses (verified live in OC-1).
- **Backups:** enable Railway Postgres automated backups; take a pre-migration `pg_dump`; enable R2 versioning. (Configured at provisioning; a test restore is a go-live gate.)
- **Logs:** structured pino JSON with `request_id`, available in Railway logs; `/health` exposes per-dependency status.
- **Rollback:** stateless backend → redeploy previous Railway deployment instantly; DB → restore snapshot/`pg_dump`; migrations forward-only (fix via new migration).

## 5. Stop point — Railway readiness report
- **Status:** deployment **PREPARED, not executed.** All artifacts verified; plan, checklist, env map, and safety checks defined. No Railway access assumed; nothing deployed or faked.
- **Missing credentials / access (required to proceed):**
  1. Railway account **access/token** for the project (or an invite to an existing project).
  2. Decision to provision the **Railway PostgreSQL** and **Railway Redis** plugins (billing on the pilot plan).
  3. **Cloudflare R2** (or another S3-compatible) bucket + access keys for evidence.
  4. Real **`JWT_SECRET`** (≥32 chars) and **`KYC_WEBHOOK_SECRET`** values (I will not generate/hold production secrets; set them in Railway Variables).
  5. The **frontend origin URL** (to set `APP13_CORS_ORIGINS`) and the intended backend public URL (to set `VITE_API_BASE_URL` at SPA build).
- **Exact next human actions:**
  1. Create/authorize the Railway project and share access (or run the CLI yourself).
  2. Add the Postgres + Redis plugins; create the R2 bucket + keys.
  3. Provide the secrets by setting them directly in Railway Variables (not in chat/git).
  4. Confirm — then I execute the checklist §2 steps 6–12 with **no code changes** and report real results, stopping again for approval after the E2E run.

---

**Prepared to deploy on Railway; stopping before deployment as instructed. No deployment, no faked success, no assumed access.** Awaiting credentials/authorization.
