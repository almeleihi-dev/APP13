# APP13 RC-1 Operational Checklist

**RC-1 status:** ready
**Readiness score:** 100/100
**Generated:** 2026-06-22T01:39:52.465Z

## Pre-release verification

- [x] **S3–S14 module registration** — 12 slice module factories found in src/index.ts
- [x] **Experience route registration** — 9 experience route bundles registered in src/api/server.ts
- [x] **Database migrations** — 20 SQL migrations found
- [x] **Dependency boundary verification** — dependency-cruiser config present
- [x] **Build verification** — TypeScript build pipeline configured
- [x] **Test suite verification** — 12/12 slice verify scripts registered in package.json
- [x] **Environment variable audit** — 3 required and 21 optional variables documented in config loader
- [x] **Required configuration audit** — Zod config schema validates required runtime configuration
- [x] **Documentation coverage audit** — 12/12 implementation docs present; RC-1 release docs present
- [x] **Event flow verification** — Outbox writer and inbox lifecycle observers are present
- [x] **Dashboard verification** — Customer (S9) and provider (S10) dashboards registered
- [x] **Analytics verification** — S14 platform analytics module and routes registered
- [x] **Notification verification** — S12 event inbox module and routes registered
- [x] **Discovery verification** — S13 discovery module and routes registered
- [x] **Security readiness** — Security kernel, auth middleware, and admin route bundles present
- [x] **Deployment readiness** — Migration script present; docker-compose available

## Environment configuration

### Required variables

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`

### Optional variables (defaults in `src/shared/config/index.ts`)

- `APP13_ENV`
- `APP13_SERVICE_ID`
- `APP13_HOST`
- `APP13_PORT`
- `APP13_LOG_LEVEL`
- `APP13_LOG_PRETTY`
- `S3_ENDPOINT`
- `S3_BUCKET`
- `S3_ACCESS_KEY`
- `S3_SECRET_KEY`
- `S3_REGION`
- `IDEMPOTENCY_TTL_SECONDS`
- ...

## Release commands

```bash
npm run migrate
npm run verify:rc1
npm run report:rc1
```

## Operational surfaces

- Dashboards verified: yes
- Analytics verified: yes
- Notifications verified: yes
- Discovery verified: yes
- Event flow verified: yes

Dashboards, analytics, notifications, discovery, and lifecycle event hooks are wired.
