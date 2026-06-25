# X51 Learn by Action Engine

**Date:** 2026-06-20  
**Scope:** Action Intelligence Layer — learn by action (X51)  
**Status:** Complete

## Summary

X51 connects users with trusted experts to learn professional actions through real-world practice. The engine identifies the best learning opportunity, recommends the right expert, and measures professional impact. It analyzes, recommends, and guides only — it does not issue licenses, grant certifications, execute contracts, or enroll users automatically.

## Philosophy

The engine continuously answers: **"Who is the best person to teach this user the missing action?"**

Learning is based on doing, not only watching.

## Inputs

Composes read-only signals from Professional Passport tier, Develop Me gaps (X50), marketplace listings, and seed expert profiles.

## Learning Categories

- Practical Skills
- Professional Actions
- Technical Procedures
- Tool Usage
- Safety Practices
- Field Experience
- Mentorship
- Guided Practice

## Expert Recommendation Fields

Each recommendation includes expert identity, distance, trust score, Live Frame, passport level, experience, skills, estimated cost, estimated duration, and professional impact.

## Learning Impact

Every opportunity explains skills gained, actions unlocked, readiness increase, income potential increase, and marketplace opportunities unlocked.

## Routes

| Method | Path | Auth |
|---|---|---|
| GET | `/learn-by-action` | authenticated |
| GET | `/learn-by-action/opportunities` | authenticated |
| GET | `/learn-by-action/experts` | authenticated |
| GET | `/learn-by-action/nearby` | authenticated |
| GET | `/learn-by-action/impact` | authenticated |
| GET | `/learn-by-action/roadmap` | authenticated |
| GET | `/learn-by-action/history` | authenticated |
| POST | `/learn-by-action/refresh` | authenticated |
| GET | `/learn-by-action/statistics` | platform_admin |

## Architecture

```
src/learn-by-action/
  domain/learning-schema.ts
  domain/learning-context.ts
  domain/learning-profile.ts
  application/learn-by-action-service.ts
  infrastructure/learn-by-action-repository.ts
  module.ts
```

## Verification

```bash
npm run verify:x51
```

Chains: `verify:x51` → `verify:x50` → build → `lint:imports`

## Constraints

- Read-only architecture
- Deterministic, explainable learning guidance
- No license or certification issuance
- No marketplace, contract, price, or commission mutation
- No automatic enrollment
