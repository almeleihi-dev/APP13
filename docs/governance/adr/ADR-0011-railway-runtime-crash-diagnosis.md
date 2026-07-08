# ADR-0011: Railway runtime-crash diagnosis & config remediation

- **Status:** Accepted (diagnosis); remediation pending human action on Railway
- **Date:** 2026-07-07
- **Change tier:** 1 (operational config; **no product code change**)
- **Milestone:** Execution Step 1 (AN ACT staging on Railway) — runtime recovery
- **Constitutional trace:** Manifesto Art. IV, VI; Blueprint M6 Part 5; ADR-0010 (Railway prep)

## Context
Railway: GitHub OK, build OK, **deployment CRASHED at runtime**. Diagnosis requested. No direct Railway access is available in this environment (no Railway connector/token), so the crash was **reproduced locally** against the same compiled `dist/` to identify the exact failure and fix.

## Root cause (evidence-based)
The backend's first action is `bootstrapApp() → bootstrapPlatform() → loadConfig()`, which **validates env via Zod and throws on missing/invalid variables**, causing `process.exit(1)` **before the server listens** → Railway sees a runtime crash. Reproduced:
- With required vars missing/invalid → `Error: Invalid APP13 configuration: …` then exit 1 (at `loadConfig → bootstrapPlatform → bootstrapApp`).
- With all required vars set → service **boots and listens** (only unreachable-host DNS notices remain, which resolve inside Railway's private network).
The Docker image **excludes `.env`** (`.dockerignore`), so on Railway *all* config must come from Railway Variables. Therefore the crash is caused by **absent/invalid production variables** — i.e., Railway PostgreSQL/Redis not attached and/or secrets + `APP13_PORT` mapping not set.

## Decision
Remediate by **configuration only** (no code change): attach Railway PostgreSQL + Redis, set the required secrets and the `APP13_PORT`→`PORT` mapping, then redeploy. Product logic untouched.

## Boundary compliance check
- Reflection boundary unaffected; no cross-system communication; AN ACT independently deployable; no second authority; **no product code changed.** ✅
