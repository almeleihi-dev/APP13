# Execution Step 1 — AN ACT Staging Activation · Report

- **ADR:** ADR-0009 (Accepted) — `docs/governance/adr/ADR-0009-step1-anact-staging-activation.md`
- **Scope:** infrastructure activation of AN ACT only. No Wegleiter change, no Consent Layer, no integration, no features, no redesign.
- **Confirmed pre-execution:** reflection boundary unaffected; no cross-system communication; AN ACT independently deployable.

## Honest status — halted at the external-provisioning boundary
Step 1 requires a **real** PostgreSQL 16 + Redis + object-storage + a deployed backend. A definitive capability probe in this environment shows that cannot be created here, and per the rule (**"No mocks. No simulated success. If something fails: Stop."**) I did not fake it.

**Exact probe result (why it's blocked):**
- Not root (`uid 1001`); `apt-get` requires root — cannot install Postgres/Redis.
- **npm registry blocked (HTTP 403 even for `left-pad`)** — cannot install `embedded-postgres`, a Redis memory server, or any DB shim.
- No Docker; no `postgres`/`pg_ctl`/`initdb`/`redis-server` binaries on PATH; cannot download server binaries (registry blocked; binary fetch not permitted).
- Result: no way to stand up a real DB/Redis, no cloud credentials to provision managed services, no host to deploy to.

This is the same boundary M1 identified — now re-confirmed for the execution phase.

## Part 1 — Infrastructure preparation
| Item | Required verification | Status |
|---|---|---|
| PostgreSQL 16 | connection · migrations 001–020 · schema integrity · backup | **BLOCKED** — no DB provisionable here |
| Redis | sessions · token storage · idempotency store | **BLOCKED** — no Redis provisionable here |
| Object storage | evidence path · access policy · recovery | **BLOCKED** — no bucket/credentials |
| Backend runtime | Docker build · env · secrets · deploy health | **PARTIAL** — image definition + build **ready and verified** (below); actual container host **BLOCKED** |

The migration runner (`scripts/migrate.ts`, 001→020, `pgcrypto`, tracked in `platform.schema_migrations`) and `Dockerfile` are ready; they run unchanged the moment infra exists.

## Part 2 — Backend activation (verified LIVE, in-sandbox, no mocks)
Real backend booted from `dist/index.js` (rebuilt this step, `tsc` exit 0), with DB/Redis intentionally absent:

| Gate | Result |
|---|---|
| Fastify production boot | **PASS** (`app13-api listening`) |
| `GET /health/live` | **PASS** → 200 |
| `GET /health` reflects real dependency status | **PASS** → 503 `degraded`, `database: down (ECONNREFUSED 5432)`, `redis: down` (→ 200 when deps up) |
| Authentication gating | **PASS** (`/v1/me` no token → 401 RFC-7807) |
| Idempotency | **PASS** (login w/o key → 400; register w/ key → reaches DB → 500) |
| Database transactions | **REACHED, not verified** — code path hits the DB and fails only on connection (no DB present) |
| Graceful shutdown | **PASS** (SIGTERM → "shutting down" → clean exit; HTTP+DB+Redis close, 10s guard) |
| Logging | **PASS** (structured pino JSON, request_id per line) |
| Production config guard | **PASS** (verified OC-1: refuses dev secrets/localhost in prod) |

## Part 3 — Frontend connection
Wiring verified in code (ET-1/ET-2): `VITE_API_BASE_URL` → runtime client → absolute staging URLs; localStorage holds no authoritative core state. The **live** check ("frontend talks to real staging API") depends on a reachable deployed backend → **BLOCKED** with Part 1.

## Part 4 — First reality loop
**NOT RUN — BLOCKED, not simulated.** Identity→Authentication→Passport→Need/Offer→Match→Contract→Execution→Evidence→Trust requires real Postgres + Redis (+ S3 for evidence blobs). The ready-to-run `scripts/reality-bridge/e2e-reality-loop.sh` (real endpoints, correct Idempotency-Key headers) will execute the full chain unchanged once infra is reachable.

## Part 5 — Operational verification
- **Logs:** PASS (structured, live).
- **Monitoring readiness:** PASS design — `/health` (readiness, DB+Redis) + `/health/live` (liveness) live-verified; alert targets defined (OC-1 ops doc).
- **Backup restore path:** DEFINED (managed snapshots + PITR + pre-deploy `pg_dump`), **not exercisable** without a DB.
- **Rollback process:** DEFINED (stateless redeploy; forward-only migrations; snapshot restore), **not exercisable** without a host.
- **Deployment repeatability:** Docker image + migration runner + env template make it repeatable; unexecuted here.

## Final report
- **ADR reference:** ADR-0009.
- **Infrastructure status:** Postgres/Redis/Object-storage — **BLOCKED (external provisioning required)**; Backend build — **READY & verified**.
- **Deployment URL:** **none created** (no host/credentials).
- **Database status:** not provisioned; migrations unrun; runner ready (001–020).
- **E2E result:** **not run — blocked, not simulated.**
- **Failed gates:** none failed on code; blocked gates are all external-infrastructure dependent.
- **Fixed issues:** none required (build clean; all in-sandbox gates green).
- **Remaining blockers (exact external provisioning needed):**
  1. Managed **PostgreSQL 16** (+ `pgcrypto`) → `DATABASE_URL`
  2. Managed **Redis** → `REDIS_URL`
  3. **S3-compatible bucket** (e.g. Cloudflare R2) + keys
  4. **Backend host** (Railway/Fly per ET-2.5) to run the Docker image
  5. Real **secrets** (`JWT_SECRET` ≥32, `KYC_WEBHOOK_SECRET`)
  6. **Backups** enabled + one tested restore
- **Updated readiness score:** Launch readiness **66 → 66** (unchanged — no real live environment was stood up; raising it would be a simulated claim). Backend build/runtime readiness remains verified.

**To proceed:** grant access to / authorize creation of items 1–6 (or connect an existing staging stack). Then, with no code change: `npm run migrate` → deploy image → `/health`=200 (both deps up) → run `e2e-reality-loop.sh` → report real results.

---

**Step 1 halted at the provisioning boundary — no mocks, no simulated success.** Not proceeding to Identity Federation, Consent, or Wegleiter connection. Awaiting approval / infrastructure access.
