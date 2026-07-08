# X28 Launch Control Center

**Date:** 2026-06-20  
**Scope:** Read-only launch governance projection (X28)  
**Status:** Complete

## Summary

X28 determines whether APP13 is ready for production launch by composing release, production, security, and operations readiness into a single launch governance view. It answers: **Should APP13 launch now?** The experience is read-only, deterministic, has no AI dependencies, requires no schema changes, and enforces `platform_admin` access.

## Architecture

```
Authenticated platform_admin
  → launch control repository snapshot
      X15 release + X25 production + X26 security + X27 operations
  → X28 launch control builders
  → LaunchControlCenterView
```

## Repository Sources

X28 composes snapshots from:

| Layer | Source |
|---|---|
| Release readiness | X15 Release Readiness Center |
| Production readiness | X25 Production Readiness Center |
| Security readiness | X26 Security & Compliance Readiness |
| Operations readiness | X27 Platform Operations Center |

## Deliverables

| Deliverable | Path |
|---|---|
| Domain | `src/experience/launch-control/domain/launch-control.ts` |
| Service | `src/experience/launch-control/application/launch-control-service.ts` |
| Repository | `src/experience/launch-control/infrastructure/launch-control-repository.ts` |
| Module factory | `createLaunchControlModule(db)` |
| Routes | `src/api/routes/launch-control.ts` |
| Tests | `test/x28-launch-control.test.ts` |
| Verify script | `scripts/verify-x28.sh` |

## Core Views

| View | Contents |
|---|---|
| Launch overview | Launch score, status, confidence, blocker/warning counts |
| Release readiness review | X15 score, status, areas, blockers, warnings |
| Production readiness review | X25 score, launch readiness, blockers, warnings |
| Security readiness review | X26 score, risk counts |
| Operations readiness review | X27 score, operational health, risks |
| Launch blockers | Critical, high, medium blockers |
| Launch warnings | Operational, security, production, release warnings |
| Launch checklist | Infrastructure, security, operations, deployment, monitoring |
| Launch recommendations | Before launch, launch day, first week actions |
| Launch decision | GO, GO_WITH_WARNINGS, or NO_GO |
| Launch confidence score | Weighted 0–100 composite |

## Launch Confidence Score Weights

| Dimension | Weight |
|---|---|
| Release readiness | 25% |
| Production readiness | 25% |
| Security readiness | 25% |
| Operations readiness | 25% |

## Decision Model

Deterministic launch decision logic:

| Decision | Conditions |
|---|---|
| **NO_GO** | Any critical blockers, release status blocked, or confidence below 55 |
| **GO** | Confidence ≥ 75, no high blockers, release status ready |
| **GO_WITH_WARNINGS** | Confidence ≥ 55, no critical blockers, but warnings remain |
| **NO_GO** (fallback) | Thresholds not met |

## Launch States

| Launch status | Maps from decision |
|---|---|
| `ready` | GO |
| `attention` | GO_WITH_WARNINGS |
| `blocked` | NO_GO |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/launch-control` | Full launch control center |
| `GET` | `/launch-control/overview` | Launch overview |
| `GET` | `/launch-control/release` | Release readiness review |
| `GET` | `/launch-control/production` | Production readiness review |
| `GET` | `/launch-control/security` | Security readiness review |
| `GET` | `/launch-control/operations` | Operations readiness review |
| `GET` | `/launch-control/blockers` | Launch blockers |
| `GET` | `/launch-control/warnings` | Launch warnings |
| `GET` | `/launch-control/checklist` | Launch checklist |
| `GET` | `/launch-control/recommendations` | Launch recommendations |
| `GET` | `/launch-control/decision` | Launch decision |

All endpoints require `platform_admin` role. Launch confidence score is included in the full center response.

## Verification

```bash
npm run test:x28-launch-control
npm run verify:x28
```

The verification chain runs:

1. `npm run verify:x27`
2. `npm run test:x28-launch-control`
3. `npm run build`
4. `npm run lint:imports`

## Rules

- Read-only experience layer
- No mutations
- No schema changes
- No migrations
- No AI dependencies
- Deterministic calculations only
