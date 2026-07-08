# S3.6 Matching Engine v1 Report

**Date:** 2026-06-19  
**Scope:** Deterministic provider matching for action requests  
**Status:** Complete

## Summary

S3.6 delivers a transparent, non-LLM matching engine that ranks providers for an action using weighted component scores. The engine recommends only — no assignment, contract creation, booking, trust mutation, or financial changes.

## Architecture

```
Action + Provider Candidates
  → Trust / Availability / Distance / Experience / Price components
  → Weighted Match Score
  → Ranked Results
  → Marketplace UI
```

## Deliverables

| Deliverable | Path |
|---|---|
| Match score domain | `src/matching/domain/match-score.ts` |
| Matching service | `src/matching/application/matching-service.ts` |
| Module factory | `src/matching/module.ts` |
| Tests | `test/s3-matching-engine.test.ts` |
| Verify script | `scripts/verify-s3-matching.sh` |

## Match Score Model

| Field | Description |
|---|---|
| `providerId` | Provider identifier |
| `actionId` | Action being matched |
| `trustScore` | Trust component (0–100) |
| `availabilityScore` | Availability component |
| `distanceScore` | Distance component |
| `priceScore` | Price component |
| `experienceScore` | Experience component |
| `totalScore` | Weighted total |
| `generatedAt` | Projection timestamp |

## Scoring Weights

| Component | Weight |
|---|---:|
| Trust | 40% |
| Availability | 25% |
| Distance | 15% |
| Experience | 10% |
| Price | 10% |

## Component Rules

| Component | Rule |
|---|---|
| Trust | Uses supplied trust score (0–100) |
| Availability | Available now = 100; otherwise 35 |
| Distance | Closer provider scores higher (linear decay to `maxDistanceKm`) |
| Experience | More completed contracts for the action scores higher |
| Price | Lower price relative to budget scores higher |

## Ranking

Primary sort: `totalScore DESC`

Tie-breakers (in order):

1. Higher trust score
2. More completed contracts for the action
3. Lower price estimate
4. Provider ID (stable deterministic ordering)

## API

```typescript
const { matching } = createMatchingModule();

matching.scoreProviderForAction(candidate, action);
matching.rankProviders(action, candidates);
matching.getBestMatches(action, candidates, limit);
```

## Verification

```bash
npm run test:s3-matching
npm run verify:s3-matching
```

### Results (2026-06-19)

| Suite | Result |
|---|---|
| S3 foundation | 24/24 pass |
| S3 trust engine | 6/6 pass |
| S3 reputation timeline | 5/5 pass |
| S3 live frame | 7/7 pass |
| S3 matching engine | 7/7 pass |
| Build + lint | pass |

## Constraints Honored

- No LLM, OpenAI, or agent integration
- No contract mutations or automatic assignment
- No trust score modifications
- No financial logic changes
- Separate from `src/matching/intelligence/` AI read layer

## UI Integration Path

```
Action Request → MatchingService.getBestMatches() → Ranked providers + scores → Marketplace results UI
```

Wire marketplace search/results pages to `createMatchingModule()` as a follow-up.
