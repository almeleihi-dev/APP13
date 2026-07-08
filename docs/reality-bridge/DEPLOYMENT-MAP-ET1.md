# AN ACT — Production Deployment Map (Reality Bridge ET-1)

**Status:** Map only. **Nothing is deployed by this document.**

## The problem it fixes

Today `vercel.json` builds and deploys **only** `apps/web/dist` (static SPA). The engineered Fastify + PostgreSQL backend is not in the deployed path, so the "live" site is a client-only demo. The frontend also targeted same-origin (`baseUrl=""`) only. ET-1 makes the API origin configurable (`VITE_API_BASE_URL`) so the two halves can be deployed and connected.

## Four deployables

| Component | What | Source | Host target |
|---|---|---|---|
| **Frontend** | Vite/React SPA | `apps/web` → `apps/web/dist` | Static host / CDN (Vercel, current) |
| **Backend** | Fastify API (`node dist/index.js`) | `src/` → `dist/` (`npm run build`) | Container/VM host (Fly, Render, Railway, ECS) — **not Vercel static** |
| **Database** | PostgreSQL 16 + 20 migrations | `database/migrations` via `npm run migrate` | Managed Postgres (Neon, RDS, Supabase) |
| **Supporting** | Redis (sessions/idempotency), S3/MinIO (evidence blobs) | `docker-compose.yml` (local) | Managed Redis + S3 bucket |

## Connection topology (choose one)

- **Recommended — same origin via reverse proxy.** Serve the SPA and proxy `/{v1,trust,requests,need-experience,action-experience,professional-passport,living-onboarding,...}` to the backend. No CORS needed; mirrors the existing Vite dev proxy. Leave `VITE_API_BASE_URL` empty.
- **Split origin.** SPA on CDN, API on `api.anact.app`. Set `VITE_API_BASE_URL=https://api.anact.app` at build time **and add CORS to the backend** (`@fastify/cors`, credentials-aware) — CORS is currently **not registered** in `src/api/server.ts`. This is the one backend gap the split topology requires.

## Environment variables

**Backend** (from `.env.example`): `APP13_ENV`, `APP13_PORT`, `DATABASE_URL`, `REDIS_URL`, `S3_ENDPOINT`/`S3_BUCKET`/`S3_ACCESS_KEY`/`S3_SECRET_KEY`/`S3_REGION`, `IDEMPOTENCY_TTL_SECONDS`, `JWT_SECRET` (**must be a real ≥32-char secret in prod**), `JWT_ACCESS_TTL_SECONDS`, `SESSION_COOKIE_NAME`, `SESSION_TTL_SECONDS`, `REFRESH_TTL_SECONDS`, `KYC_WEBHOOK_SECRET`, `KYC_SANDBOX_BASE_URL`.

**Frontend** (build-time): `VITE_API_BASE_URL` (empty for same-origin proxy; API URL for split origin), optional `VITE_SHOW_DEVELOPER_SURFACES=false` in prod to keep the Simulation Layer hidden.

## Migration & release order

1. Provision Postgres, Redis, S3 bucket.
2. `npm run migrate` (applies `database/migrations/001…020`).
3. Deploy backend; confirm `GET /health`.
4. Build frontend with the correct `VITE_API_BASE_URL`; deploy SPA.
5. Configure proxy/CORS per chosen topology.
6. Smoke-test the real loop: register → passport → offer/need → contract → milestone → evidence → trust.

## Pre-production gaps to close (not done here)

- CORS registration (only if split-origin).
- Real payment processor behind the `financial.*` schema (currently schema-complete, processor stubbed).
- Secrets management for `JWT_SECRET`/`KYC_*`.
- CI running the 329-test suite against a real Postgres.
