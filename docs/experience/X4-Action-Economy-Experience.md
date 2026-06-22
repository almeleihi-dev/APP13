# X4 Action Economy Experience

**Date:** 2026-06-19  
**Scope:** Read-only provider action economy projection (X4)  
**Status:** Complete

## Summary

X4 helps providers understand, manage, publish, and grow their action portfolio. It composes existing action, matching, trust, provider profile, discovery, and analytics modules without changing business rules or schema.

## Architecture

```
Provider user
  → action-economy repository snapshot
      Action module (provider actions)
      S6 provider profile context
      S13 discovery (open requests + marketplace counts)
      S10 provider earnings aggregates
      S5 trust score profile
      Contract performance by action code
  → domain portfolio / demand / opportunity / earnings builders
  → ActionEconomyExperienceView
```

## Deliverables

| Deliverable | Path |
|---|---|
| Domain | `src/experience/action-economy/domain/action-economy.ts` |
| Service | `src/experience/action-economy/application/action-economy-service.ts` |
| Repository | `src/experience/action-economy/infrastructure/action-economy-repository.ts` |
| Module factory | `createActionEconomyModule(db, { trustScore })` |
| Routes | `src/api/routes/action-economy.ts` |
| Tests | `test/x4-action-economy.test.ts` |
| Verify script | `scripts/verify-x4.sh` |

## Features

| Feature | Source |
|---|---|
| Published actions | Action module portfolio split |
| Draft actions | Draft / TEKRR-in-progress statuses |
| Recommended actions | Publish-ready drafts, eligible requests, trust, top performers |
| Demand indicators | S13 open requests + marketplace provider counts |
| Trust requirements | Contract template `minProviderTier` |
| Completion indicators | Contract counts and completion rate per action |
| Estimated earnings potential | S10 earnings + eligible request pipeline |
| Top performing actions | Ranked by completed contracts |
| Growth opportunities | High-demand actions not yet published |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/action-economy` | Full action economy experience |
| `GET` | `/action-economy/actions` | Published and draft portfolio |
| `GET` | `/action-economy/opportunities` | Opportunities, demand, growth, recommendations |
| `GET` | `/action-economy/earnings` | Earnings potential and performance ranking |

All endpoints require authentication and an active provider profile.

## Verification

```bash
npm run test:x4-action-economy
npm run verify:x4
```

`verify:x4` runs the X3 regression suite plus X4 tests.

## Constraints

- Read-only projections only
- No schema changes
- No business rule modifications
- Deterministic calculations only
