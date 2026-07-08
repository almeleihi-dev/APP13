# Railway Runtime-Crash — Operational Diagnosis

- **ADR:** ADR-0011
- **Constraint (honest):** I have **no direct access to your Railway account** (no Railway connector/token is connected here, and the registry has no Railway MCP). I cannot read your live Railway logs, attach plugins, or redeploy from here. I diagnosed by **reproducing the crash locally** against the same compiled `dist/`, and I provide the exact fix for you (or a connected agent) to apply. **I do not claim success — Railway is not showing me a running service.**

## 1–2. Exact runtime failure (root cause)
The service crashes **at startup, before it listens**. Boot order is `bootstrapApp() → bootstrapPlatform() → loadConfig()`, and `loadConfig()` **throws on missing/invalid environment variables**, which triggers `process.exit(1)` in `main().catch(...)`. Reproduced against `dist/`:

```
Error: Invalid APP13 configuration:
- REDIS_URL (config path: redisUrl): ...
- KYC_WEBHOOK_SECRET (config path: kyc.webhookSecret): ... development default; set a real secret.
    at loadConfig (dist/shared/config/index.js:207)
    at bootstrapPlatform (dist/bootstrap/platform.js:8)
    at bootstrapApp (dist/bootstrap/bootstrap.js:10)
EXIT: 1
```

Positive control — with **all** required vars set (staging, `APP13_PORT`, DB/Redis URLs, real secrets), the service **boots and listens**:
```
{"service":"app13-api","env":"staging","port":8080,"msg":"app13-api listening"}
```
(Only `getaddrinfo EAI_AGAIN *.railway.internal` remained locally, because those hosts resolve **only inside Railway's private network** — they will resolve on Railway.)

**Conclusion:** the crash is **missing/invalid production configuration**, not a code fault. The build succeeded; the runtime has nothing valid to configure against. The Docker image **excludes `.env`** (`.dockerignore`), so **every** variable must be supplied via Railway Variables — the classic first-deploy crash when the Postgres/Redis plugins aren't attached and secrets/port aren't set.

## 3. Required production variables — verification checklist
| Variable | Needed from | Present? (you verify in Railway) | Effect if missing |
|---|---|---|---|
| `DATABASE_URL` | Railway **PostgreSQL** plugin (reference var) | ☐ | `loadConfig` throws → crash |
| `REDIS_URL` | Railway **Redis** plugin (reference var) | ☐ | `loadConfig` throws → crash |
| `JWT_SECRET` (≥32 chars, not the dev default) | you set (secret) | ☐ | guard throws → crash |
| `KYC_WEBHOOK_SECRET` (not the dev default) | you set (secret) | ☐ | guard throws → crash |
| `APP13_PORT` = `${{PORT}}` | map to Railway-injected `PORT` | ☐ | app listens on 3000; Railway can't route → unhealthy/crash |
| `APP13_ENV` = `staging` | you set | ☐ | guard inactive (should be on for staging) |
| `APP13_CORS_ORIGINS` | frontend origin (only if split origin) | ☐ | CORS blocked for SPA (not a boot crash) |

## 4. Remediation (configuration only — I cannot apply it without Railway access)
Apply in the Railway dashboard/CLI, in this order:
1. **Attach PostgreSQL:** add the Railway PostgreSQL plugin → it exposes `DATABASE_URL`; reference it on the backend service. Enable `pgcrypto` (`CREATE EXTENSION IF NOT EXISTS pgcrypto;`).
2. **Attach Redis:** add the Railway Redis plugin → reference `REDIS_URL` on the backend service.
3. **Set secrets (Variables):** `JWT_SECRET` (≥32 random chars), `KYC_WEBHOOK_SECRET` (real value), `APP13_ENV=staging`.
4. **Map the port:** set `APP13_PORT=${{PORT}}` (Railway variable reference) so the app listens on Railway's assigned port.
5. **(If split origin)** set `APP13_CORS_ORIGINS` to the SPA origin.
6. **Healthcheck path:** set to `/health/live` with a start-period ≥ 20s (so the deploy doesn't fail before the DB is reachable; `/health` requires DB+Redis up).

## 5. Redeploy & verify (after config is correct)
- Redeploy the backend service.
- Expect log: `app13-api listening` (env `staging`).
- `GET /health/live` → **200**.
- `GET /health` → **200** with `database:{status:"up"}` and `redis:{status:"up"}` (503 if a plugin is still detached — read the per-dependency detail).
- **Migrations 001–020 readiness:** run `DATABASE_URL=… npm run migrate` (Railway one-off/shell) → expect `apply 001 … apply 020 / migrations complete`; verify `SELECT version FROM platform.schema_migrations` shows 001–020. (The runner is idempotent and ready; unrun until a DB exists.)

## Report
- **Root cause:** startup crash from `loadConfig()` throwing on missing/invalid env vars (`process.exit(1)` before listen) — Railway Postgres/Redis not attached and/or `JWT_SECRET`/`KYC_WEBHOOK_SECRET`/`APP13_PORT` not set. Confirmed by local reproduction; **not a code defect** (positive control boots cleanly).
- **What was changed:** **no product code** (per instruction). Governance ADR-0011 recorded; exact config remediation prepared. **No Railway changes made** — I have no access to your Railway account.
- **Final Railway status:** **unknown to me / presumed still crashed until the configuration above is applied.** I will not claim a running service I cannot observe.

## To finish this recovery
Either (a) apply steps in §4–§5 in your Railway dashboard and paste the new deploy logs / `/health` output here for me to verify, or (b) connect a Railway-capable agent/credentials so I can inspect logs and set variables directly. Then I'll confirm real status and proceed only on your approval.
