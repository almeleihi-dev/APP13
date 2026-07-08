# ADR-0003: AN ACT live staging environment (EIP M1)

- **Status:** Accepted
- **Date:** 2026-07-07
- **Change tier:** 1 (infrastructure/operational — no product or boundary change)
- **Milestone:** EIP M1
- **Constitutional trace:** AN ACT OC-1 gates 1–3; UHAA §6 (AN ACT authoritative for action/contract/evidence/trust/financial); Manifesto Art. IV (evidence/trust), Art. VI (singular authority)

## Context
OC-1 certified AN ACT as code-operational but infrastructure-blocked. M1 brings it into a real **staging** environment: provisioned PostgreSQL + Redis + object storage, migrations applied through 020, backend deployed, health green with dependencies. Scope is infrastructure and operational deployment only — no features, no UX, no Wegleiter integration.

## Options considered
1. **Managed pilot stack** (Railway or Fly.io per ET-2.5 brief) + Cloudflare R2 for evidence (chosen for staging).
2. AWS staging now — rejected: over-heavy for staging; correct destination later (EIP R9), not the starting line.
3. Local/sandbox "staging" — rejected: not a real environment; would violate "do not simulate success."

## Decision
Stand up staging on a managed pilot host using the existing Docker image, migration runner, and health endpoints. All authoritative state lives in PostgreSQL; Redis for sessions/idempotency; R2/S3 for evidence blobs. No shared database with any other system; AN ACT remains independently deployable.

## Consequences
- Requires **external accounts/credentials** (Postgres, Redis, object storage, host). These cannot be created inside the engineering sandbox; M1 execution stops at that boundary and hands off an exact provisioning list (see M1 report).
- Everything not requiring external credentials is prepared and verified in-sandbox (image builds, config guard, health/auth/idempotency/shutdown behavior, frontend base-URL wiring).
- No change to the accountable core; OC-1 authority matrix preserved.

## Boundary check
- Reflection/evidence separation preserved: **Yes** — AN ACT holds no reflection data; Wegleiter untouched.
- Consent crossing preserved: **Yes** — no cross-boundary flow introduced in M1.
- Independent deployability: **Yes** — AN ACT deploys alone; no Wegleiter coupling.
- Second authority created: **No** — PostgreSQL remains the single source of truth.
