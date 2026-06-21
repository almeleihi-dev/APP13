# S3.5 Live Frame Engine Report

**Date:** 2026-06-19  
**Scope:** Read-only Live Frame classification on Trust Engine + Reputation Timeline  
**Status:** Complete

## Summary

S3.5 converts provider trust scores into an instant visual identity (tier, color, label, risk level). Live Frame is a projection-only layer — no new persistence, no score mutation, no AI logic.

## Architecture

```
Trust Events → Trust Score → Reputation Timeline → Live Frame → UI Consumption
```

## Deliverables

| Deliverable | Path |
|---|---|
| Live Frame domain | `src/trust/domain/live-frame.ts` |
| Live Frame service | `src/trust/application/live-frame-service.ts` |
| Tests | `test/s3-live-frame.test.ts` |
| Verify script | `scripts/verify-s3-live-frame.sh` |

## Classification Rules

| Score | Tier | Color | Label | Risk |
|---:|---|---|---|---|
| 95–100 | `PLATINUM_ELITE` | `platinum_gold` | Platinum Elite | minimal |
| 85–94 | `EMERALD_PRO` | `emerald` | Emerald Pro | low |
| 70–84 | `TRUSTED` | `blue` | Trusted | moderate |
| 50–69 | `STANDARD` | `gray` | Standard | elevated |
| 0–49 | `WATCHLIST` | `red` | Watchlist | high |

Boundary scores (95, 85, 70, 50, 49) map to the higher tier at each threshold.

## Projection API

```typescript
const { liveFrame } = createTrustModule(db);

// Full provider projection with timeline context
const projection = await liveFrame.getProviderLiveFrame(providerId);

// Pure classification from score
const frame = liveFrame.buildLiveFrame(92, providerId);
```

`ProviderLiveFrameProjection` includes:

| Field | Source |
|---|---|
| Core frame fields | `trust.trust_scores` + classification rules |
| `latestTrustScore` | Reputation timeline `currentScore` |
| `latestScoreChange` | Last timeline entry `scoreDelta` |
| `currentTier` | Current Live Frame tier |

## Data Sources (read-only)

- `trust.trust_scores` — current score + `computed_at`
- `trust.trust_score_events` — timeline for latest score change

No writes. No new tables.

## Verification

```bash
npm run test:s3-live-frame
npm run verify:s3-live-frame
```

### Results (2026-06-19)

| Suite | Result |
|---|---|
| S3 foundation | 24/24 pass |
| S3 trust engine | 6/6 pass |
| S3 reputation timeline | 5/5 pass |
| S3 live frame | 7/7 pass |
| Build + lint | pass |

## Constraints Honored

- No Trust Engine scoring changes
- No Reputation Timeline changes
- No escrow, ledger, contract, or issue logic changes
- Projection only — ready for UI integration via existing trust experience routes

## UI Integration Path

```
ProviderLiveFrameProjection
  → frameColor + frameLabel + riskLevel
  → provider cards, trust center, marketplace results
```

Wire `TrustExperienceService` / `/trust/:id` to `LiveFrameService.getProviderLiveFrame()` as a follow-up.
