# S6 Provider Public Profile Experience

**Date:** 2026-06-19  
**Scope:** Read-only public provider profile projection (S6)  
**Status:** Complete

## Summary

S6 adds a read-only provider public profile experience that combines provider identity, offered actions, APP13 S5 trust score, live frame, badges, completion summary, dispute summary, rating summary, and availability into a single API response keyed by provider user id.

## Architecture

```
Provider user id
  → ProviderProfileRepository (identity + published actions + contract activity)
  → TrustScoreService.buildTrustProfile() (S5 trust, badge, live frame, history)
  → ActionIntelligenceService.extractActionsFromProviderProfile()
  → buildProviderPublicProfile()
  → ProviderPublicProfileView
  → GET /providers/:userId/profile
```

## Deliverables

| Deliverable | Path |
|---|---|
| Provider profile domain | `src/provider-experience/domain/provider-profile.ts` |
| Provider profile service | `src/provider-experience/application/provider-profile-service.ts` |
| Provider profile repository | `src/provider-experience/infrastructure/provider-profile-repository.ts` |
| Module factory | `createProviderExperienceModule(db, { trustScore })` |
| Route | `src/api/routes/providers.ts` |
| Tests | `test/s6-provider-profile.test.ts` |
| Verify script | `scripts/verify-s6.sh` |

## API

| Method | Path | Response |
|---|---|---|
| GET | `/providers/:userId/profile` | `ProviderPublicProfileView` |

Returns `404` when the user is not a provider.

## Profile Sections

| Section | Source |
|---|---|
| Identity | `identity.providers` + `identity.users.verification_tier` |
| Offered actions | Published `action.actions` + action intelligence extraction from profile text |
| Trust score / live frame / badge | S5 `TrustScoreService` (not S3 aggregate score) |
| Completion summary | S5 trust history (`contract_completed`, `contract_cancelled`) |
| Dispute summary | S5 trust history counts only — no contract or customer details |
| Rating summary | S5 trust history evaluations + average rating |
| Availability | Active contract workload + provider status |

## Design Notes

- Read-only projection only; no escrow, ledger, or contract rule changes.
- S5 snapshots and S3 trust scores are not overwritten.
- S5 live frame tiers are used (Platinum Elite / Emerald Pro / Sapphire Verified / Standard / Restricted).
- Dispute summaries expose counts and neutral wording only.
- No UI implementation is included in this slice.

## Verification

```bash
npm run test:s6-provider-profile
npm run verify:s6
```

`verify:s6` runs S3 foundation, S3/S4/S5 regression suites, S6 tests, build, and import lint.
