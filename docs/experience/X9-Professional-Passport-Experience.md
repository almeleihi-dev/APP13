# X9 Professional Passport Experience

**Date:** 2026-06-19  
**Scope:** Read-only professional passport projection (X9)  
**Status:** Complete

## Summary

X9 composes a provider's professional passport from S6 identity profile, identity verification and credentials, X7 trust overview, and S5 historical performance metrics. Passport level (Bronze → Elite) is computed with deterministic rules without schema changes or AI dependencies.

## Architecture

```
Provider user
  → professional passport repository snapshot
      S6 public profile (identity + performance summaries)
      S5 trust profile + history
      Identity verification status + credentials
      X2 platform trust context (for X7 trust overview)
  → passport level / badges / credentials builders
  → ProfessionalPassportView
```

## Deliverables

| Deliverable | Path |
|---|---|
| Domain | `src/experience/professional-passport/domain/professional-passport.ts` |
| Service | `src/experience/professional-passport/application/professional-passport-service.ts` |
| Repository | `src/experience/professional-passport/infrastructure/professional-passport-repository.ts` |
| Module factory | `createProfessionalPassportModule(db, { trustScore, providerProfile })` |
| Routes | `src/api/routes/professional-passport.ts` |
| Tests | `test/x9-professional-passport.test.ts` |
| Verify script | `scripts/verify-x9.sh` |

## Passport Levels

| Level | Deterministic gates |
|---|---|
| Bronze | Default baseline for active providers |
| Silver | Trust ≥ 50, verification T1+, ≥1 completed contract |
| Gold | Trust ≥ 70, verification T2+, ≥3 completed contracts, verified credential/license |
| Platinum | Trust ≥ 85, verification T3+, ≥10 completed contracts, rating ≥ 4.0, no active disputes |
| Elite | Trust ≥ 95, verification T4, ≥25 completed contracts, ≥2 verified credentials, rating ≥ 4.5, no active disputes |

## Features

| Feature | Source |
|---|---|
| Identity profile | S6 `ProviderPublicProfileView` |
| Verification status | `identity.verifications` + user verification tier |
| Trust score | X7 `buildTrustOverview()` from S5 profile |
| Historical performance | S6 completion/rating/dispute + S5 breakdown + confidence band |
| Licenses | `identity.credentials` where type includes license |
| Certifications | Remaining verified credentials |
| Professional badges | Passport level, S5 trust badge, verified credentials, performance milestones |
| Passport level | Deterministic X9 rules |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/professional-passport` | Full professional passport |
| `GET` | `/professional-passport/level` | Passport level assessment |
| `GET` | `/professional-passport/performance` | Historical performance metrics |
| `GET` | `/professional-passport/credentials` | Licenses and certifications |
| `GET` | `/professional-passport/public` | Safe public passport card (`?user_id=` optional) |

Provider-only endpoints return 404 for non-provider accounts.

## Verification

```bash
npm run test:x9-professional-passport
npm run verify:x9
```

`verify:x9` runs the X8 regression suite, X9 tests, build, and import lint.

## Constraints

- Read-only projections only
- No schema changes
- No business rule changes in S5/S6 engines
- Deterministic calculations only
- No AI dependencies
