# X2 Live Frame Experience

**Date:** 2026-06-19  
**Scope:** Read-only Live Frame identity experience derived from S5 trust and reputation data (X2)  
**Status:** Complete

## Summary

X2 transforms S5 Trust & Reputation data into a dedicated user-facing Live Frame experience. It projects current frame identity, tier progress, 30-day evolution, positive and negative drivers, and a public trust view while reusing existing modules without changing business rules or schema.

## Architecture

```
Authenticated provider user
  → S5 TrustScoreService (profile, frame, history)
  → S6 ProviderProfileService (public profile + verification tier)
  → S11 operations trust aggregates (platform tier distribution)
  → S14 analytics trust metrics (rolling trust event counts)
  → domain builders (progress, evolution, drivers)
  → LiveFrameExperienceView
```

## Deliverables

| Deliverable | Path |
|---|---|
| Live Frame domain | `src/experience/live-frame/domain/live-frame-experience.ts` |
| Live Frame service | `src/experience/live-frame/application/live-frame-experience-service.ts` |
| Platform context repository | `src/experience/live-frame/infrastructure/live-frame-experience-repository.ts` |
| Module factory | `createLiveFrameExperienceModule(db, deps)` |
| Routes | `src/api/routes/live-frame.ts` |
| Tests | `test/x2-live-frame-experience.test.ts` |
| Verify script | `scripts/verify-x2.sh` |

## Domain Models

| Model | Purpose |
|---|---|
| `LiveFrameExperience` | Full live frame aggregate |
| `FrameIdentity` | Provider identity + current live frame |
| `FrameSummary` | Trust score, tier, badge headline |
| `FrameProgress` | Progress to next S5 tier |
| `FrameEvolution` | 30-day event evolution buckets |
| `FrameDriver` | Positive or negative trust driver |
| `FramePublicView` | Public trust projection (S6 shape) |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/live-frame` | Full live frame experience |
| `GET` | `/live-frame/progress` | Tier progress projection |
| `GET` | `/live-frame/evolution` | 30-day frame evolution |
| `GET` | `/live-frame/public` | Public trust view (`?user_id=` optional) |

All endpoints require authentication. Provider trust profile is required for frame endpoints; public view uses S6 public profile data.

## Tier Progress

Progress uses deterministic S5 tier thresholds:

| Tier | Minimum score |
|---|---|
| Restricted | 0 |
| Standard | 50 |
| Sapphire Verified | 70 |
| Emerald Pro | 85 |
| Platinum Elite | 95 |

## Verification

```bash
npm run test:x2-live-frame
npm run verify:x2
```

`verify:x2` runs the X1 regression suite plus X2 tests.

## Constraints

- Read-only projections only
- Reuses S5/S6/S11/S14 data paths
- No schema, business rule, or UI changes
- Deterministic builders and ordering
