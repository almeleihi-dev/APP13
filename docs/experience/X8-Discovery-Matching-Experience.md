# X8 Discovery & Matching Experience

**Date:** 2026-06-19  
**Scope:** Read-only discovery and matching projection (X8)  
**Status:** Complete

## Summary

X8 unifies marketplace discovery and bidirectional matching into a single experience layer. It ranks providers and requests using a deterministic weighted score (40% skill, 25% trust, 15% availability, 10% distance, 10% price fit) while reusing S13 discovery data, S7 request intelligence, and S5 trust enrichment without schema or matching formula changes in underlying engines.

## Architecture

```
Authenticated user
  → discovery matching repository snapshot
      S13 discoverable providers + open requests
      S7 action/skill inference from request text
      S5 trust profile enrichment
  → X8 weighted score builders (skill/trust/availability/distance/price)
  → DiscoveryMatchingExperienceView
```

## Deliverables

| Deliverable | Path |
|---|---|
| Domain | `src/experience/discovery-matching/domain/discovery-matching.ts` |
| Service | `src/experience/discovery-matching/application/discovery-matching-service.ts` |
| Repository | `src/experience/discovery-matching/infrastructure/discovery-matching-repository.ts` |
| Module factory | `createDiscoveryMatchingModule(db, { trustScore })` |
| Routes | `src/api/routes/discovery-matching.ts` |
| Tests | `test/x8-discovery-matching.test.ts` |
| Verify script | `scripts/verify-x8.sh` |

## Match Score Weights

| Component | Weight | Source |
|---|---|---|
| Skill match | 40% | Action codes + inferred keywords via `scoreSkillFit` |
| Trust | 25% | S5 trust score via `scoreTrust` |
| Availability | 15% | Active contract capacity heuristic |
| Distance | 10% | Distance component (stub km from S13) |
| Price fit | 10% | Budget vs price estimate component |

## Features

| Feature | Description |
|---|---|
| Discovery feed | Ranked providers and requests in one feed |
| Match providers to requests | Customer-owned request → ranked providers |
| Match requests to providers | Provider account → ranked open requests |
| Available Now feed | Providers with capacity, ranked by X8 score |
| Component breakdown | Transparent skill/trust/availability/distance/price scores |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/discovery-matching` | Full discovery matching experience |
| `GET` | `/discovery-matching/feed` | Discovery feed projection |
| `GET` | `/discovery-matching/available-now` | Available now provider feed |
| `GET` | `/discovery-matching/requests/:requestId/providers` | Match providers to request |
| `GET` | `/discovery-matching/providers/requests` | Match requests to provider |

Provider-only endpoint returns 404 for non-providers. Request provider matching requires request ownership (404 for non-owners).

## Verification

```bash
npm run test:x8-discovery-matching
npm run verify:x8
```

`verify:x8` runs the X7 regression suite, X8 tests, build, and import lint.

## Constraints

- Read-only projections only
- No schema changes
- No business rule changes in S3/S7/S13 engines
- Deterministic calculations only
- No AI dependencies in X8 scoring path
