# X5 Request-to-Match Experience

**Date:** 2026-06-19  
**Scope:** Read-only customer request-to-match projection (X5)  
**Status:** Complete

## Summary

X5 unifies the customer journey from request creation through action suggestions, provider matching, and contract conversion readiness. It composes S7 request intelligence, S8 conversion state, S13 discovery counts, S5 trust, S6 provider context, and X2 live frame labels without changing business rules or schema.

## Architecture

```
Customer user + owned request
  → request-match repository snapshot
      S7 request record + matchable providers
      S13 marketplace provider counts
      S8 conversion offers for request
      S5 trust profiles for ranking enrichment
      Matching service (same weights as S7)
  → domain understanding / match / readiness builders
  → RequestMatchExperienceView
```

## Deliverables

| Deliverable | Path |
|---|---|
| Domain | `src/experience/request-match/domain/request-match-experience.ts` |
| Service | `src/experience/request-match/application/request-match-experience-service.ts` |
| Repository | `src/experience/request-match/infrastructure/request-match-experience-repository.ts` |
| Module factory | `createRequestMatchExperienceModule(db, { trustScore })` |
| Routes | `src/api/routes/request-match.ts` |
| Tests | `test/x5-request-match-experience.test.ts` |
| Verify script | `scripts/verify-x5.sh` |

## Features

| Feature | Source |
|---|---|
| Request understanding summary | S7 `buildRequestSummary` + intent inference |
| Intent inference display | S7 `inferRequestIntent` |
| Suggested actions | S7 `suggestMatchingActions` |
| Match overview | S7 matching summary + S13 marketplace counts |
| Ranked provider recommendations | Matching service + S5 trust enrichment |
| Trust-aware ranking | Matching weights (trust 40%) |
| Availability indicators | Provider active contract capacity |
| Conversion readiness | S8 offer status guards |
| Recommended next action | Deterministic readiness-driven routing hints |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/request-match/:requestId` | Full request-to-match experience |
| `GET` | `/request-match/:requestId/actions` | Understanding + suggested actions |
| `GET` | `/request-match/:requestId/providers` | Match summary + ranked providers |
| `GET` | `/request-match/:requestId/readiness` | Conversion readiness + next action |

All endpoints require authentication and request ownership (404 for non-owners).

## Verification

```bash
npm run test:x5-request-match
npm run verify:x5
```

`verify:x5` runs the X4 regression suite plus X5 tests.

## Constraints

- Read-only projections only
- No schema changes
- No business rule modifications
- Deterministic calculations only
