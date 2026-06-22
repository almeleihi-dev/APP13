# X14 Marketplace Intelligence

**Date:** 2026-06-19  
**Scope:** Read-only marketplace intelligence projection (X14)  
**Status:** Complete

## Summary

X14 composes deterministic marketplace intelligence from S14 platform analytics and discovery catalog snapshots. It exposes demand, supply, pricing, marketplace health, and ranked opportunity insights for platform leadership without schema changes or AI dependencies.

## Architecture

```
Authenticated platform_admin
  → marketplace intelligence repository snapshot
      S14 platform analytics snapshot
      Discovery providers, action counts, and open requests
  → X14 section builders
  → MarketplaceIntelligenceView
```

## Deliverables

| Deliverable | Path |
|---|---|
| Domain | `src/experience/marketplace-intelligence/domain/marketplace-intelligence.ts` |
| Service | `src/experience/marketplace-intelligence/application/marketplace-intelligence-service.ts` |
| Repository | `src/experience/marketplace-intelligence/infrastructure/marketplace-intelligence-repository.ts` |
| Module factory | `createMarketplaceIntelligenceModule(db)` |
| Routes | `src/api/routes/marketplace-intelligence.ts` |
| Tests | `test/x14-marketplace-intelligence.test.ts` |
| Verify script | `scripts/verify-x14.sh` |

## Analytics Sections

| Section | Source |
|---|---|
| Demand analytics | S14 request KPIs + live discoverable requests |
| Supply analytics | Discovery providers + published action counts |
| Pricing analytics | Request budgets vs provider price estimates + escrow amounts |
| Marketplace health | Conversion + discovery rates + demand/supply balance |
| Opportunity insights | Deterministic ranking of demand gaps, supply capacity, action gaps, pricing fit |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/marketplace-intelligence` | Full marketplace intelligence |
| `GET` | `/marketplace-intelligence/demand` | Demand analytics |
| `GET` | `/marketplace-intelligence/supply` | Supply analytics |
| `GET` | `/marketplace-intelligence/pricing` | Pricing analytics |
| `GET` | `/marketplace-intelligence/health` | Marketplace health analytics |
| `GET` | `/marketplace-intelligence/opportunities` | Ranked opportunity insights |

All endpoints require `platform_admin` role.

## Verification

```bash
npm run test:x14-marketplace-intelligence
npm run verify:x14
```

`verify:x14` runs the X13 regression suite, X14 tests, build, and import lint. `verify:x15` chains through `verify:x14`.

## Constraints

- Read-only projections only
- No schema changes
- No AI dependencies
- Deterministic builders only
