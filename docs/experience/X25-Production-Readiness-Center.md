# X25 Production Readiness Center

**Date:** 2026-06-19  
**Scope:** Read-only production readiness projection (X25)  
**Status:** Complete

## Summary

X25 evaluates whether APP13 is operationally ready for production deployment by auditing runtime, configuration, infrastructure, storage, database, security, monitoring, logging, and deployment artifacts. It answers: **If APP13 were deployed tomorrow, what is ready, what is missing, and what are the launch risks?** The experience is read-only, deterministic, has no AI dependencies, and requires `platform_admin` access.

## Architecture

```
Authenticated platform_admin
  → production readiness repository snapshot
      env/config/infrastructure artifacts + migration status
  → X25 production readiness builders
  → ProductionReadinessCenterView
```

## Deliverables

| Deliverable | Path |
|---|---|
| Domain | `src/experience/production-readiness/domain/production-readiness.ts` |
| Service | `src/experience/production-readiness/application/production-readiness-service.ts` |
| Repository | `src/experience/production-readiness/infrastructure/production-readiness-repository.ts` |
| Module factory | `createProductionReadinessModule(db)` |
| Routes | `src/api/routes/production-readiness.ts` |
| Tests | `test/x25-production-readiness.test.ts` |
| Verify script | `scripts/verify-x25.sh` |

## Core Views

| View | Contents |
|---|---|
| Production overview | Readiness score, launch/operational/deployment readiness, risk level |
| Environment audit | Env files, required variables, missing variables, coverage score |
| Database readiness | Postgres, migrations, connection config, backup readiness |
| Storage readiness | Object storage config, bucket, upload, retention readiness |
| Security readiness | Auth coverage, secret management, role protection, security score |
| Monitoring readiness | Logging, monitoring, health checks, observability score |
| Deployment readiness | Artifacts, startup scripts, runtime requirements, deployment score |
| Disaster recovery readiness | Backup coverage, recovery guidance, resilience, recovery score |
| Production risk register | Infrastructure, security, deployment, storage, database, monitoring risks |
| Launch recommendations | Blockers, before launch, after launch actions |
| Production readiness score | Weighted composite across seven operational dimensions |

## Production Readiness Score Weights

| Dimension | Weight |
|---|---|
| Environment | 15% |
| Database | 15% |
| Storage | 14% |
| Security | 14% |
| Monitoring | 14% |
| Deployment | 14% |
| Disaster recovery | 14% |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/production-readiness` | Full production readiness center |
| `GET` | `/production-readiness/overview` | Production overview |
| `GET` | `/production-readiness/environment` | Environment audit |
| `GET` | `/production-readiness/database` | Database readiness |
| `GET` | `/production-readiness/storage` | Storage readiness |
| `GET` | `/production-readiness/security` | Security readiness |
| `GET` | `/production-readiness/monitoring` | Monitoring readiness |
| `GET` | `/production-readiness/deployment` | Deployment readiness |
| `GET` | `/production-readiness/disaster-recovery` | Disaster recovery readiness |
| `GET` | `/production-readiness/risks` | Production risk register |
| `GET` | `/production-readiness/recommendations` | Launch recommendations |

All endpoints require `platform_admin` role. Production readiness score is included in the full center response.

## Verification

```bash
npm run test:x25-production-readiness
npm run verify:x25
```

The verification chain runs `verify-x24`, X25 tests, build, and import lint.

## Rules

- Read-only experience layer
- No mutations
- No AI dependencies
- No schema changes
- Deterministic calculations only
- Sources limited to runtime, configuration, infrastructure, and deployment artifacts
