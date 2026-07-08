# M1 — AN ACT Live Staging Environment · Completion Report

- **ADR:** ADR-0003 (Accepted) — `docs/governance/adr/ADR-0003-m1-anact-staging.md`
- **Constitutional trace:** AN ACT OC-1 gates 1–3; UHAA §6 (AN ACT authority); Manifesto Art. IV, VI
- **Scope:** infrastructure & operational deployment only. No features, no UX, no Wegleiter integration.
- **Governance:** ADR created, linked, boundary-checked (reflection/evidence separation ✓, consent boundary untouched ✓, independently deployable ✓, no second authority ✓) before execution.

## Honest status
M1 is **partially executed and correctly halted at the external-provisioning boundary.** Everything that does not require external credentials is prepared and **verified live in-sandbox**. Everything that requires a real PostgreSQL / Redis / object-store / host is **blocked** and is **not simulated**, per the milestone rule.

## What was deployed / prepared (and verified live)
Against the current build (`tsc` exit 0), the staging artifacts and boot behavior were confirmed on a running process:

| Item | Result |
|---|---|
| Backend builds from source | **PASS** (`tsc -p tsconfig.json` exit 0) |
| Deployment artifacts present | **PASS** (`Dockerfile`, `.dockerignore`, `.env.production.example`) |
| Fastify production boot | **PASS** (`app13-api listening`) |
| `GET /health/live` | **PASS** → 200 |
| `GET /health` reflects dependencies | **PASS** → 503 `degraded` with per-dependency detail (DB/Redis `down`) — will read 200 once deps are up |
| Route mounting | **PASS** (unknown route → 404) |
| Auth gating | **PASS** (`/v1/me` no token → 401 problem+json) |
| Idempotency enforced | **PASS** (login without `Idempotency-Key` → 400) |
| Graceful shutdown | **PASS** (SIGTERM → "shutting down" → clean exit; closes HTTP/DB/Redis, 10s guard) |
| Production config guard | **PASS** (verified in OC-1: refuses dev secrets/localhost in prod) |
| Frontend `VITE_API_BASE_URL` wiring | **PASS** (resolves `https://api…/v1/...`; empty → same-origin) |

## What failed
**Nothing failed in code.** No defects surfaced. The only non-passing items are those that cannot execute without provisioned infrastructure (below), which is a blocker, not a failure.

## Remaining blockers — required external infrastructure (STOP point)
The following M1 outcomes are **blocked** and were not attempted-as-simulated: migrations through 020, schema existence check, `/health`=200 with deps **up**, backup/recovery path, and the end-to-end staging test (Identity→…→Trust). Each requires an external account/service that cannot be created in the engineering sandbox (no root, no Docker, blocked registry, no cloud credentials).

| # | Account / service needed | Why it is needed | Recommended provider (per ET-2.5) | Setup steps |
|---|---|---|---|---|
| 1 | **Managed PostgreSQL 16** + `DATABASE_URL` | Source of truth for identity/contract/execution/evidence/trust/financial; required to run migrations 001→020 and for `/health` DB check | Fly Managed Postgres (backups/HA at base) or Neon/Railway PG | Provision PG16 → capture `DATABASE_URL` → `CREATE EXTENSION pgcrypto` → `npm run migrate` → verify `\dn` + `platform.schema_migrations` = 001..020 |
| 2 | **Managed Redis** + `REDIS_URL` | Sessions, token store, idempotency (hard runtime dependency; login/session issuance and idempotency require it) | Upstash Redis (Fly-integrated) or Railway Redis | Provision → capture `REDIS_URL` (prefer `rediss://` TLS) |
| 3 | **S3-compatible object storage** + keys | Evidence blob upload/download (metadata is in Postgres; bytes need a bucket) | Cloudflare R2 (S3-compatible, low cost) | Create bucket `app13-evidence-staging`, enable versioning → set `S3_ENDPOINT/BUCKET/ACCESS_KEY/SECRET_KEY/REGION` |
| 4 | **Backend hosting** (container) | Deploy the Docker image `node dist/index.js` as a long-lived process | Railway or Fly.io (Docker-native; reuses our Dockerfile) | Deploy image → inject env from `.env.production.example` → expose port 3000 → wire probes to `/health/live` (liveness) and `/health` (readiness) |
| 5 | **Secrets store** + real secrets | `JWT_SECRET` (≥32, non-default) and `KYC_WEBHOOK_SECRET`; production config guard **refuses to boot** on dev defaults | Host-native secret manager (Railway/Fly secrets) | Generate strong secrets → store in the host secret manager → never in git |
| 6 | **Backups** | OC-1 gate — automated DB backups + a tested restore; bucket versioning | Provider-managed PG backups/PITR + R2 versioning | Enable daily snapshots; take pre-migration `pg_dump`; rehearse one restore |

Once items 1–6 exist, the sequence is fully scripted and ready: `npm run migrate` → deploy image → confirm `/health`=200 (both deps up) → `BASE_URL=<staging> bash scripts/reality-bridge/e2e-reality-loop.sh` to execute the real Identity→…→Trust chain. No code changes are needed to proceed.

## Frontend connection
Wiring is verified in code (`VITE_API_BASE_URL` → runtime client → absolute staging URLs; localStorage holds no authoritative core state — confirmed in OC-1). The live check ("frontend communicates with real API") is downstream of item 4 (a reachable staging backend) and is therefore blocked with the rest.

## End-to-end staging test
**Not run — blocked and not simulated.** Requires items 1–4. The `e2e-reality-loop.sh` script (real endpoints, correct `Idempotency-Key` headers) will validate the full chain unchanged the moment staging is reachable.

## Updated readiness score
- **Launch readiness: 66 → 66** (unchanged): no live infrastructure was actually stood up, so the score cannot honestly rise. M1 *preparation* is complete and verified; M1 *completion* is gated on provisioning.
- **OC-1 gate status:** gates 1–3 prepared & scripted (blocked on provisioning); gates 4–5 blocked downstream (M2); config-guard/health/shutdown gates already met in code.

## Boundary compliance
No product/UX change; no Wegleiter coupling; AN ACT independently deployable; PostgreSQL remains the single source of truth; reflection/evidence firewall untouched (AN ACT holds no reflection data).

---

**M1 halted at the provisioning boundary as required — no bypass, no simulated success.** To continue, provide access to (or authorize creation of) items 1–6, or direct how you want provisioning handled. Awaiting approval.
