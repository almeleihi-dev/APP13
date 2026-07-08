# X7 Trust & Reputation Experience

**Date:** 2026-06-19  
**Scope:** Read-only trust and reputation projection (X7)  
**Status:** Complete

## Summary

X7 explains the S5 Trust Engine to providers in a transparent, actionable way. It composes S5 trust profile/history, S6 public profile, S11 operations trust metrics, S12 inbox trust notifications, S14 analytics aggregates, and X2 live frame builders without changing trust formulas or schema.

## Architecture

```
Provider user
  → trust reputation repository snapshot
      S5 TrustScoreService profile + history
      S6 provider public profile (verification tier)
      S11 + S14 platform trust context (via X2 repository)
      S12 inbox trust category events (30-day window)
  → domain overview / drivers / progress / timeline builders
  → TrustReputationExperienceView
```

## Deliverables

| Deliverable | Path |
|---|---|
| Domain | `src/experience/trust-reputation/domain/trust-reputation-experience.ts` |
| Service | `src/experience/trust-reputation/application/trust-reputation-experience-service.ts` |
| Repository | `src/experience/trust-reputation/infrastructure/trust-reputation-repository.ts` |
| Module factory | `createTrustReputationExperienceModule(db, { trustScore, providerProfile })` |
| Routes | `src/api/routes/trust-reputation.ts` |
| Tests | `test/x7-trust-reputation.test.ts` |
| Verify script | `scripts/verify-x7.sh` |

## Features

| Feature | Source |
|---|---|
| Trust overview | S5 profile + S6 verification tier + platform context |
| Positive trust drivers | S5 breakdown via X2 driver classification |
| Negative trust drivers | S5 breakdown via X2 driver classification |
| Progress to next tier | X2 tier ladder projection |
| 30-day trust timeline | S5 history + S12 inbox trust events |
| Reputation summary | Deterministic reputation label from score/drivers |
| Safe public trust card | S6 public profile without internal admin data |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/trust-experience` | Full trust reputation experience |
| `GET` | `/trust-experience/drivers` | Positive and negative trust drivers |
| `GET` | `/trust-experience/progress` | Progress to next live frame tier |
| `GET` | `/trust-experience/timeline` | 30-day trust timeline |
| `GET` | `/trust-experience/public` | Safe public trust card (`?user_id=` optional) |

Provider-only endpoints return 404 for non-provider accounts. Public endpoint requires authentication and uses S6 public profile projection.

## Verification

```bash
npm run test:x7-trust-reputation
npm run verify:x7
```

`verify:x7` runs the X6 regression suite, X7 tests, build, and import lint.

## Constraints

- Read-only projections only
- No schema changes
- No business rule changes
- No trust formula changes
- Deterministic calculations only
