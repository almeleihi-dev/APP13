# X49 Personal Assistant Engine

**Date:** 2026-06-20  
**Scope:** Action Intelligence Layer — personal assistant (X49)  
**Status:** Complete

## Summary

X49 delivers the Personal Action Manager for APP13. It composes read-only signals from the user's professional identity, Live Frame, marketplace activity, goals, and credentials into explainable, deterministic guidance. The assistant analyzes, recommends, reminds, and guides — it never executes contracts, modifies marketplace listings, or performs financial operations.

## Philosophy

The assistant continuously answers: **"What is the best thing this user should do next?"**

Users see clear recommendations, not internal engines:

- "Today you can earn more by accepting this nearby action."
- "You are one license away from unlocking 42 new opportunities."
- "A trusted expert near you can teach the missing skill."

## Recommendation Categories

- Execute an action
- Learn a new skill
- Obtain a required license
- Complete a certification
- Improve Live Frame
- Increase Trust Score
- Join a Team / Build a Team
- Contact an Expert
- Accept a Marketplace Opportunity

## Assistant Cards

- Today's Best Action
- Recommended Learning
- Marketplace Opportunity
- Professional Improvement
- Missing Requirement
- Nearby Expert
- Suggested Team
- Goal Progress
- Important Reminder

## Routes

| Method | Path | Auth |
|---|---|---|
| GET | `/personal-assistant` | authenticated |
| GET | `/personal-assistant/today` | authenticated |
| GET | `/personal-assistant/cards` | authenticated |
| GET | `/personal-assistant/recommendations` | authenticated |
| GET | `/personal-assistant/goals` | authenticated |
| GET | `/personal-assistant/progress` | authenticated |
| GET | `/personal-assistant/opportunities` | authenticated |
| GET | `/personal-assistant/reminders` | authenticated |
| GET | `/personal-assistant/timeline` | authenticated |
| POST | `/personal-assistant/refresh` | authenticated |
| GET | `/personal-assistant/statistics` | platform_admin |

## Architecture

```
src/personal-assistant/
  domain/assistant-schema.ts
  domain/assistant-context.ts
  domain/assistant-profile.ts
  application/personal-assistant-service.ts
  infrastructure/personal-assistant-repository.ts
  module.ts
```

## Verification

```bash
npm run verify:x49
```

Chains: `verify:x49` → `verify:x48` → build → `lint:imports`

## Constraints

- Read-only architecture
- Explainable recommendations with reasons and expected impact
- Deterministic generation for identical inputs
- No contract execution or marketplace mutation
- No price or commission modification
