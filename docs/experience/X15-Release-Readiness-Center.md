# X15 Release Readiness Center

**Date:** 2026-06-19  
**Scope:** Read-only launch readiness control center (X15)  
**Status:** Complete

## Summary

X15 composes a platform launch readiness center from deterministic filesystem and wiring probes across sixteen readiness areas. It computes an overall launch readiness score, identifies blockers and warnings, highlights strengths, and recommends next actions without schema changes or AI dependencies.

## Architecture

```
Authenticated platform_admin
  → release readiness repository (index/server/package/path probes)
  → X15 readiness area evaluators (16 areas)
  → launch score, blockers, warnings, strengths, actions
  → ReleaseReadinessCenterView
```

## Deliverables

| Deliverable | Path |
|---|---|
| Domain | `src/experience/release-readiness/domain/release-readiness.ts` |
| Service | `src/experience/release-readiness/application/release-readiness-service.ts` |
| Repository | `src/experience/release-readiness/infrastructure/release-readiness-repository.ts` |
| Module factory | `createReleaseReadinessCenterModule({ rootDir? })` |
| Routes | `src/api/routes/release-readiness.ts` |
| Tests | `test/x15-release-readiness.test.ts` |
| Verify script | `scripts/verify-x15.sh` |

## Readiness Areas

| Area | Focus |
|---|---|
| Core lifecycle | Home, notifications, lifecycle wiring |
| Contracts | Contract engine and X3 contract journey |
| Escrow | Escrow services and X6 payment experience |
| Execution | Execution services and experience routes |
| Evidence | Evidence write/read routes |
| Issues / disputes | Issue service and dispute read routes |
| Trust | Trust engine and X7 trust reputation |
| Matching | Conversion and X8 discovery matching |
| Professional passport | X9 passport and X9.5 seals modules |
| Live trust frame | X2 live frame and X10 live trust frame |
| Provider command center | X11 provider command center |
| Customer command center | X12 customer command center |
| Platform control tower | X13 platform control tower |
| Security / auth | Security kernel and auth middleware |
| Tests / verification | Build, import lint, verify scripts |
| Documentation | RC-1 release docs and X15 documentation |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/release-readiness` | Full release readiness center |
| `GET` | `/release-readiness/score` | Overall launch readiness score |
| `GET` | `/release-readiness/areas` | Readiness area evaluations |
| `GET` | `/release-readiness/blockers` | Launch blockers |
| `GET` | `/release-readiness/warnings` | Launch warnings |
| `GET` | `/release-readiness/actions` | Recommended next actions |

All endpoints require `platform_admin` role.

## Verification

```bash
npm run test:x15-release-readiness
npm run verify:x15
```

`verify:x15` runs the X13 regression suite, X15 tests, build, and import lint.

## Constraints

- Read-only projections only
- No schema changes
- No AI dependencies
- Deterministic filesystem probes only
