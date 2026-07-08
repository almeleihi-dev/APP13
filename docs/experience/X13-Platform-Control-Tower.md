# X13 Platform Control Tower

**Date:** 2026-06-19  
**Scope:** Read-only platform control tower projection (X13)  
**Status:** Complete

## Summary

X13 composes a platform leadership control tower from S14 platform analytics, S11 operations admin console health signals, and X2 live frame platform trust context. It exposes deterministic overview, contracts, financial, trust, live frame distribution, marketplace, and system health metrics without schema changes or AI dependencies.

## Architecture

```
Authenticated platform_admin
  → platform control tower repository snapshot
      S14 platform analytics snapshot
      S11 operations overview + risk indicators
      X2 platform trust context (live frame distribution)
  → X13 section builders
  → PlatformControlTowerView
```

## Deliverables

| Deliverable | Path |
|---|---|
| Domain | `src/experience/platform-control-tower/domain/platform-control-tower.ts` |
| Service | `src/experience/platform-control-tower/application/platform-control-tower-service.ts` |
| Repository | `src/experience/platform-control-tower/infrastructure/platform-control-tower-repository.ts` |
| Module factory | `createPlatformControlTowerModule(db)` |
| Routes | `src/api/routes/platform-control-tower.ts` |
| Tests | `test/x13-platform-control-tower.test.ts` |
| Verify script | `scripts/verify-x13.sh` |

## Metric Sections

| Section | Source |
|---|---|
| Platform overview | S14 platform metrics + S11 operations health |
| Contracts metrics | S14 contract KPIs |
| Financial metrics | S14 escrow + revenue KPIs |
| Trust metrics | S14 trust KPIs |
| Live frame distribution | X2 platform trust context tier distribution |
| Marketplace metrics | S14 discovery + growth KPIs |
| System health metrics | S11 operations summary + risk indicators |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/platform-control-tower` | Full platform control tower |
| `GET` | `/platform-control-tower/overview` | Platform overview metrics |
| `GET` | `/platform-control-tower/contracts` | Contracts metrics |
| `GET` | `/platform-control-tower/financial` | Financial metrics |
| `GET` | `/platform-control-tower/trust` | Trust metrics |
| `GET` | `/platform-control-tower/live-frame` | Live frame distribution |
| `GET` | `/platform-control-tower/marketplace` | Marketplace metrics |
| `GET` | `/platform-control-tower/system-health` | System health metrics |

All endpoints require `platform_admin` role.

## Verification

```bash
npm run test:x13-platform-control-tower
npm run verify:x13
```

`verify:x13` runs the X12 regression suite, X13 tests, build, and import lint.

## Constraints

- Read-only projections only
- No schema changes
- No AI dependencies
- Deterministic builders only
