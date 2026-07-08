# S3.4 Reputation Timeline Report

**Date:** 2026-06-19  
**Scope:** Read-only provider reputation timeline projection on S3.3 Trust Engine  
**Status:** Complete

## Summary

S3.4 adds a derived reputation timeline that reads append-only trust history from `trust.trust_score_events`, groups events by `provider_id`, orders by `occurred_at`, and produces human-readable timeline entries with score impact metadata. No mutations occur outside existing trust event persistence.

## Deliverables

| Deliverable | Path |
|---|---|
| Timeline domain model | `src/trust/domain/reputation-timeline.ts` |
| Timeline read service | `src/trust/application/reputation-timeline-service.ts` |
| Tests | `test/s3-reputation-timeline.test.ts` |
| Verify script | `scripts/verify-s3-timeline.sh` |

## Timeline Entry Model

Each `ReputationTimelineEntry` includes:

| Field | Source |
|---|---|
| `providerId` | Trust event provider |
| `eventType` | Trust event type |
| `sourceType` | `source_entity_type` |
| `sourceId` | `source_entity_id` |
| `occurredAt` | Event timestamp |
| `scoreDelta` | Recomputed delta using existing trust scoring library |
| `scoreAfter` | Cumulative score after applying event |
| `severity` | Presentation rule (`positive`, `neutral`, `negative`, `recovery`) |
| `title` | Human-readable headline |
| `description` | Human-readable detail |

## Presentation Rules

| Event | Severity | Notes |
|---|---|---|
| `contract_completed` | positive | Successful engagement completion |
| `milestone_accepted` | positive | Customer accepted delivery |
| `customer_evaluation_submitted` | positive / neutral / negative | Based on rating (≥4, 3, ≤2) |
| `issue_raised` | negative | Confirmed issues emphasized in copy |
| `issue_resolved` | recovery | Withdraw vs resolve wording |
| `escrow_released` | positive | Financial reliability signal |
| `escrow_refunded` | neutral / negative | Negative when prior confirmed issue or large refund amount |

## Score Projection

Score deltas reuse **unchanged** S3.3 logic:

1. Walk events in chronological order.
2. For each prefix, call `deriveTrustMetricsFromEvents()` + `calculateTrustScore()`.
3. `scoreDelta = scoreAfter - scoreBefore`.

This keeps timeline impact aligned with the Trust Engine without altering scoring rules.

## Read API

```typescript
const { reputationTimeline } = createTrustModule(db);
const timeline = await reputationTimeline.getProviderTimeline(providerId);
```

Pure projection helper for tests:

```typescript
buildReputationTimeline(providerId, events);
```

## Verification

```bash
npm run test:s3-timeline
npm run verify:s3-timeline
```

### Results (2026-06-19)

| Suite | Result |
|---|---|
| S3 foundation | 24/24 pass |
| S3 trust engine | 6/6 pass |
| S3 reputation timeline | 5/5 pass |
| Build + lint | pass |

## Constraints Honored

- No changes to Trust Engine scoring rules, escrow, ledger, contract, or issue business logic
- Read/projection only — timeline derived from append-only trust history
- No AI/LLM logic
- Idempotent duplicate trust events produce a single timeline entry (one DB row per idempotency key)

## Follow-ups (out of scope)

- Wire `/trust/:id/timeline` experience route to `ReputationTimelineService` instead of fixture assembler
- Pagination / cursor for long provider histories
- Snapshot caching for large event sets
