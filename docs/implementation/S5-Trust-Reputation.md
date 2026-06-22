# S5 Trust & Reputation Experience

**Date:** 2026-06-19  
**Scope:** APP13 trust profile, live frame, history, and reputation APIs (S5.1–S5.6)  
**Status:** Complete

## Summary

S5 adds a trust and reputation experience layer on top of the existing S3 append-only trust event stream. Provider trust is projected from lifecycle events and identity verification tier using APP13 S5 scoring weights, then exposed through read APIs keyed by user id.

## Architecture

```
Trust lifecycle event (contract, issue, escrow, evaluation)
  → TrustService.recordEvent() (append-only, transaction-safe)
  → TrustScoreService.persistSnapshotForProvider() (S5 snapshot in dimension_scores.s5)
  → buildTrustProfile() / buildLiveFrame() / buildTrustHistory()
  → TrustProfileView / LiveFrameView / TrustHistoryView
  → GET /trust/profile|frame|history/:userId
```

## Deliverables

| Deliverable | Path |
|---|---|
| Trust profile domain | `src/trust/domain/trust-profile.ts` |
| Trust profile views | `src/trust/domain/trust-profile-view.ts` |
| Trust score service | `src/trust/application/trust-score-service.ts` |
| Trust repository (S5 snapshot) | `src/trust/infrastructure/trust-repository.ts` |
| Reputation routes | `src/api/routes/trust.ts` |
| Tests | `test/s5-trust-reputation.test.ts` |
| Verify script | `scripts/verify-s5.sh` |

## Domain Models

| Model | Purpose |
|---|---|
| `TrustProfile` | Full provider trust projection with score, breakdown, badge, history |
| `LiveFrame` | S5 tier classification from trust score |
| `TrustHistory` | Chronological supported lifecycle events |
| `TrustBadge` | Display badge derived from live frame tier |
| `TrustBreakdown` | Weighted component scores |

## APP13 S5 Scoring

| Component | Weight |
|---|---|
| Verification tier | 40% |
| Customer rating | 30% |
| Completion rate | 20% |
| Clean record | 10% |

Verification tier mapping: T0=20, T1=50, T2=70, T3=85, T4=100.

## S5 Live Frame Tiers

| Score | Tier |
|---|---|
| 95–100 | Platinum Elite |
| 85–94 | Emerald Pro |
| 70–84 | Sapphire Verified |
| 50–69 | Standard |
| 0–49 | Restricted |

S5 live frame tiers are separate from S3.5 `TRUSTED` / `WATCHLIST` classification used by marketplace experience projections.

## Supported Lifecycle Events

| Event | Trust event type |
|---|---|
| Contract completed | `contract_completed` |
| Contract cancelled | `contract_cancelled` |
| Issue raised | `issue_raised` |
| Issue resolved | `issue_resolved` |
| Escrow released | `escrow_released` |
| Evaluation submitted | `customer_evaluation_submitted` |

Events are recorded through existing S3 lifecycle observers in contract, complaint, execution, and financial engines. Contract cancellation is observed on contract cancel transition. S5 snapshots are refreshed inside the same database transaction after supported events are appended.

## API Endpoints

| Method | Path | Response |
|---|---|---|
| GET | `/trust/profile/:userId` | `TrustProfileView` |
| GET | `/trust/frame/:userId` | `LiveFrameView` |
| GET | `/trust/history/:userId` | `TrustHistoryView` |

Routes resolve the provider profile for the given user id and return `404` when the user is not a provider.

## Service API

```typescript
const { trust, trustScore } = createTrustModule(db);

await trustScore.getProfileByUserId(userId);
await trustScore.getFrameByUserId(userId);
await trustScore.getHistoryByUserId(userId);
await trustScore.recordEventTx(input); // direct append + S5 snapshot
```

## Verification

```bash
npm run test:s5-trust
npm run verify:s5
```

`verify:s5` runs S3 foundation, S3 trust/timeline/live-frame/matching/action/marketplace, all S4 experience suites, S5 trust tests, build, and import lint.

## Design Notes

- Domain objects in `trust-profile.ts` are pure functions with no infrastructure dependencies.
- S5 snapshots are stored under `trust.trust_scores.dimension_scores.s5` and do not overwrite the S3 aggregate score.
- No UI implementation is included in this slice; APIs return structured JSON views only.
