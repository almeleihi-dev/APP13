# S13 Platform Search & Discovery

**Date:** 2026-06-19  
**Scope:** Unified read-only search and discovery across providers, actions, requests, and trust profiles (S13)  
**Status:** Complete

## Summary

S13 provides a platform-wide discovery layer for searching and ranking providers, catalog actions, and open customer requests. Results use deterministic scoring with trust-aware, availability, completion, rating, and dispute-aware ranking. All endpoints are read-only.

## Architecture

```
Authenticated user
  → DiscoveryService
  → DiscoveryRepository (providers, actions, requests SQL)
  → S5 TrustScoreService enrichment
  → S3 MatchingService ranking (when action_code provided)
  → deterministic discovery rank (trust, availability, completion, rating, dispute)
  → snake_case discovery views
```

## Deliverables

| Deliverable | Path |
|---|---|
| Discovery domain | `src/discovery/domain/discovery.ts` |
| Discovery service | `src/discovery/application/discovery-service.ts` |
| Discovery repository | `src/discovery/infrastructure/discovery-repository.ts` |
| Module factory | `createDiscoveryModule(db, { trustScore })` |
| Routes | `src/api/routes/discovery.ts` |
| Tests | `test/s13-discovery.test.ts` |
| Verify script | `scripts/verify-s13.sh` |

## Domain Models

| Model | Purpose |
|---|---|
| `SearchQuery` | Shared filter and ranking inputs |
| `ProviderResult` | Ranked provider with trust and availability |
| `ActionResult` | Catalog action with provider coverage |
| `RequestResult` | Open request with intent and eligible providers |
| `DiscoverySummary` | Totals and applied filters |
| `RankingExplanation` | Deterministic score breakdown |
| `AvailabilitySummary` | Capacity and availability state |
| `SearchResult` | Unified cross-entity search payload |

## Ranking

When `action_code` is provided, providers are ranked with S3 `MatchingService` weights (trust 40%, availability 25%, distance 15%, experience 10%, price 10%).

Otherwise, providers use discovery weights:

| Component | Weight |
|---|---|
| Trust | 35% |
| Availability | 20% |
| Completion | 15% |
| Rating | 15% |
| Dispute safety | 15% |

Tie-breakers: rank score → trust score → completed contracts → average rating → active issues → provider ID.

## Filters

| Filter | Applies to |
|---|---|
| `category` | Providers, actions, requests |
| `action_code` | Providers |
| `trust_tier` | Providers (S5 live frame tier) |
| `available_now` | Providers |
| `min_rating` | Providers |
| `min_completed` | Providers |
| `text` / `q` | All search endpoints |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/discover/providers` | Ranked provider search |
| GET | `/discover/actions` | Catalog action search |
| GET | `/discover/requests` | Open request search |
| GET | `/discover/search` | Unified cross-entity search |

All endpoints require authentication.

## Reuse

- **S5 trust** — `TrustScoreService.buildTrustProfile` for scores, ratings, dispute history
- **S6 provider profile** — dispute event counting helpers
- **S7 request experience** — request intent inference and action suggestions
- **S3 matching** — `MatchingService.rankProviders` when filtering by action code

## Design Notes

- Read-only projections; no writes to business tables
- Deterministic scoring and tie-breakers only; no AI orchestration
- Reuses matchable provider SQL from S7 without modifying request business rules
- Provider capacity model: available when active contracts < 5

## Verification

```bash
npm run verify:s13
```
