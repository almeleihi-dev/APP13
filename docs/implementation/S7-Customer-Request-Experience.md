# S7 Customer Request Experience

**Date:** 2026-06-19  
**Scope:** Customer request creation, intent inference, action suggestions, and provider matching (S7)  
**Status:** Complete

## Summary

S7 adds a read-focused customer request experience that lets customers describe what they need, persist a request draft, infer intent from the description, suggest catalog actions, and rank matching providers using deterministic S3 matching and S5 trust data. No AI orchestrator or intelligence services are used in this slice.

## Architecture

```
Customer request text (+ budget, preferred days)
  → experience.customer_requests (persist)
  → inferRequestIntent() / suggestMatchingActions() (S3 action catalog)
  → listMatchableProviders() (identity + actions + trust scores)
  → MatchingService.getBestMatches() (deterministic S3 scoring)
  → TrustScoreService.buildTrustProfile() (S5 trust enrichment)
  → RequestSummary / MatchingSummary views
```

## Deliverables

| Deliverable | Path |
|---|---|
| Request domain | `src/request-experience/domain/request.ts` |
| Request intelligence service | `src/request-experience/application/request-intelligence-service.ts` |
| Request repository | `src/request-experience/infrastructure/request-repository.ts` |
| Module factory | `createRequestExperienceModule(db, { trustScore })` |
| Migration | `database/migrations/018_customer_requests.sql` |
| Routes | `src/api/routes/requests.ts` |
| Tests | `test/s7-customer-request.test.ts` |
| Verify script | `scripts/verify-s7.sh` |

## Domain Models

| Model | Purpose |
|---|---|
| `CustomerRequest` | Persisted request entity |
| `RequestSummary` | Human-readable request overview with intent |
| `RequestIntent` | Inferred primary category/action from description |
| `RequestSuggestion` | Ranked catalog action suggestions |
| `MatchingSummary` | Ranked provider matches for primary action |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/requests` | Create customer request (customer role required) |
| GET | `/requests/:id` | Get request with summary |
| GET | `/requests/:id/suggestions` | Catalog action suggestions |
| GET | `/requests/:id/matches` | Deterministic provider matching summary |

All routes require authentication. Requests are scoped to the authenticated customer user.

## Deterministic Matching

1. Infer primary action from request text using S3 catalog keyword matching and task decomposition rules.
2. Load active providers with published action codes and S3 trust scores.
3. Filter providers that offer the primary action code.
4. Rank with `MatchingService.getBestMatches()` (trust, availability, price, completion weights).
5. Enrich top matches with S5 trust profile scores and live frame labels.

## Design Notes

- Read-focused: POST only persists request input; projections are rebuilt on read.
- No AI services (`/ai/*` orchestrator) are invoked.
- Escrow, ledger, contract, execution, and trust business rules are unchanged.
- S3 and S5 trust scores are read, never overwritten.

## Verification

```bash
npm run test:s7-customer-request
npm run verify:s7
```

`verify:s7` runs S3–S6 regression suites, S7 tests, build, and import lint.
