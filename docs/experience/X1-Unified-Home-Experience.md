# X1 Unified Home Experience

**Date:** 2026-06-19  
**Scope:** Read-only unified home projection for customer, provider, and hybrid activity (X1)  
**Status:** Complete

## Summary

X1 provides a single application entry experience that composes existing marketplace slices into one deterministic home projection. It detects whether the authenticated user is primarily seeking services, offering services, or operating in hybrid mode, then assembles customer and provider summaries, unread notifications, trust signals, a top recommended action, and quick actions without changing underlying business rules.

## Architecture

```
Authenticated user
  → activity snapshot (customer/provider counts + profiles)
  → detect HomeMode
  → parallel projections:
      S9 customer dashboard (when customer profile exists)
      S10 provider dashboard (when provider profile exists)
      S12 unread notification summary
      S5 trust profile
  → domain builders (recommended action + quick actions)
  → HomeExperienceView
```

## Deliverables

| Deliverable | Path |
|---|---|
| Home domain | `src/experience/domain/home-experience.ts` |
| Home service | `src/experience/application/home-experience-service.ts` |
| Activity repository | `src/experience/infrastructure/home-experience-repository.ts` |
| Module factory | `createHomeExperienceModule(db, deps)` |
| Routes | `src/api/routes/home.ts` |
| Tests | `test/x1-home-experience.test.ts` |
| Verify script | `scripts/verify-x1.sh` |

## Domain Models

| Model | Purpose |
|---|---|
| `HomeExperience` | Unified home aggregate |
| `HomeMode` | `need_service`, `offer_service`, or `hybrid` |
| `HomeSummary` | Unified headline and active work counts |
| `CustomerHomeSummary` | Compact S9 customer dashboard projection |
| `ProviderHomeSummary` | Compact S10 provider dashboard projection |
| `NotificationSummary` | S12 unread inbox projection |
| `TrustSummary` | S5 trust profile projection |
| `RecommendedAction` | Top deterministic next step |
| `QuickAction` | Mode-aware shortcut list |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/home` | Unified home for authenticated user |
| `GET` | `/home/customer` | Customer-focused home (requires customer profile) |
| `GET` | `/home/provider` | Provider-focused home (requires provider profile) |

All endpoints require authentication.

## Mode Detection

Mode is derived deterministically from existing activity:

1. Customer and provider activity present → `hybrid`
2. Provider activity only → `offer_service`
3. Customer activity only → `need_service`
4. No activity yet → infer from registered profiles, defaulting to `need_service`

## Composition Rules

- Customer summary is built from `CustomerDashboardService.getDashboard()` (S7 request data via S9 cards).
- Provider summary is built from `ProviderDashboardService.getDashboard()` (S6 trust context via S10 cards).
- Notifications use `EventInboxService.getUnreadSummary()`.
- Trust uses `TrustScoreService.getProfileByUserId()`.
- Recommended action prioritizes critical notifications, then role-specific dashboard recommendations.
- Quick actions are fixed per mode and sorted deterministically in hybrid mode.

## Verification

```bash
npm run test:x1-home
npm run verify:x1
```

`verify:x1` runs the S3–S14 regression suite, X1 tests, build, and import lint.

## Constraints

- Read-only projections only
- Reuses existing modules; no schema or business-rule changes
- No UI implementation
- Deterministic builders and ordering
