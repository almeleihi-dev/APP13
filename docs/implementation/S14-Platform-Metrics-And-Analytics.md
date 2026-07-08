# S14 Platform Metrics & Analytics

**Date:** 2026-06-19  
**Scope:** Read-only analytics layer for platform leadership, operations, and investor reporting (S14)  
**Status:** Complete

## Summary

S14 provides admin-only analytics endpoints that aggregate existing platform data into deterministic KPIs with rolling 7-day and 30-day windows and trend indicators (`up`, `down`, `flat`).

## Architecture

```
Admin auth (platform_admin)
  → PlatformAnalyticsRepository (aggregate SQL across experience, contract, financial, execution, complaint, trust, identity)
  → domain metric builders (rates, rolling counts, trends)
  → AnalyticsSummaryView / section views
```

## Deliverables

| Deliverable | Path |
|---|---|
| Analytics domain | `src/analytics/domain/platform-analytics.ts` |
| Analytics service | `src/analytics/application/platform-analytics-service.ts` |
| Analytics repository | `src/analytics/infrastructure/platform-analytics-repository.ts` |
| Module factory | `createAnalyticsModule(db)` |
| Routes | `src/api/routes/analytics.ts` |
| Tests | `test/s14-platform-analytics.test.ts` |
| Verify script | `scripts/verify-s14.sh` |

## Domain Models

| Model | Purpose |
|---|---|
| `PlatformMetrics` | Active users/providers, utilization, totals |
| `GrowthMetrics` | Requests, offers, contracts, users created |
| `ConversionMetrics` | Offer→contract, contract→funded, search→match rates |
| `ContractMetrics` | Completion and issue/dispute rates |
| `EscrowMetrics` | Escrow counts and funded/released amounts |
| `ExecutionMetrics` | Milestones and evidence activity |
| `TrustMetrics` | Average score and tier distribution |
| `DiscoveryMetrics` | Search volume proxy and match rate |
| `RevenueMetrics` | Escrow flows and platform fees from ledger |
| `AnalyticsSummary` | Full overview aggregate |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/analytics/overview` | Full analytics summary |
| GET | `/analytics/growth` | Growth rolling metrics |
| GET | `/analytics/conversions` | Conversion funnel rates |
| GET | `/analytics/contracts` | Contract completion and dispute rates |
| GET | `/analytics/escrow` | Escrow lifecycle metrics |
| GET | `/analytics/trust` | Trust score analytics |
| GET | `/analytics/discovery` | Discovery/search proxy metrics |
| GET | `/analytics/revenue` | Ledger-based revenue metrics |

All endpoints require `platform_admin` role.

## Key Metrics

| Metric | Source |
|---|---|
| Requests created | `experience.customer_requests` |
| Offers created | `experience.match_contract_offers` |
| Offer→Contract rate | Offers with `contract_created` status |
| Contract→Funded rate | Contracts with funded escrow |
| Completion rate | Completed contracts / total |
| Issue/dispute rate | Contracts in issue/dispute states |
| Average trust score | `trust.trust_scores` |
| Trust tier distribution | S5 snapshot in `dimension_scores` |
| Search volume | Customer requests created (search intent proxy) |
| Search→Match rate | Offers / requests |
| Escrow funded/released amounts | `financial.journals` + `ledger_entries` |
| Platform fee totals | Ledger `fee` entries |
| Active users/providers | `identity.users`, `identity.providers` |
| Provider utilization | Active contracts / capacity (5) |

## Design Notes

- Read-only projections only; no writes
- Rolling 7-day and 30-day windows with prior-period comparison
- Deterministic rate calculations with documented denominators
- Discovery search volume uses request creation as intent proxy (no search log table)
- Reuses aggregate patterns from S11 operations console without modifying business rules

## Verification

```bash
npm run verify:s14
```
