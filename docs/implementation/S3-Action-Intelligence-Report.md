# S3.7 Action Intelligence Report

**Date:** 2026-06-19  
**Scope:** Deterministic capability-to-action extraction for action-first marketplace flows  
**Status:** Complete

## Summary

S3.7 introduces a production Action Intelligence layer that converts human capability (CV, profile, experience text) into contractable actions using deterministic catalog rules. This is separate from the existing AI read layer at `src/action/intelligence/`.

## Architecture

```
CV / Profile / Experience
  → Action Extraction
  → Action Profile
  → Task Decomposition
  → Matching Signals (future)
  → Marketplace
```

## Deliverables

| Deliverable | Path |
|---|---|
| Action profile domain | `src/action-intelligence/domain/action-profile.ts` |
| Action catalog | `src/action-intelligence/domain/action-catalog.ts` |
| Action intelligence service | `src/action-intelligence/application/action-intelligence-service.ts` |
| Module factory | `src/action-intelligence/module.ts` |
| Tests | `test/s3-action-intelligence.test.ts` |
| Verify script | `scripts/verify-s3-action.sh` |

## Catalog Categories

| Category | Actions |
|---|---|
| Legal | draft, review, negotiate, analyze, represent |
| Engineering | inspect, calculate, design, supervise, approve |
| HR | recruit, interview, evaluate, onboard, train |
| Finance | audit, reconcile, budget, report, forecast |
| Technology | code, test, deploy, document, troubleshoot |

## Confidence Scoring (0–100)

Derived from:

| Signal | Weighting |
|---|---|
| Keyword match strength | up to 35 points |
| Years of experience | up to 20 points |
| Completed contracts | up to 20 points |
| Certifications | up to 10 points |
| Previous action history | +15 when action performed before |
| Base | +10 |

`experienceWeight` combines confidence and experience years for downstream ranking signals.

## Service API

```typescript
const { actionIntelligence } = createActionIntelligenceModule();

actionIntelligence.extractActionsFromProviderProfile(input);
actionIntelligence.extractActionsFromExperience(input);
actionIntelligence.buildActionProfile(input);
actionIntelligence.decomposeTask("Build company website");
actionIntelligence.toMatchingSignals(profile);
actionIntelligence.lookupCatalogAction("technology.code");
```

## Task Decomposition Example

`"Build company website"` →

1. `engineering.design`
2. `technology.code`
3. `technology.test`
4. `technology.deploy`

## Matching Integration

`toMatchingSignals()` exposes:

- `actionCodes`
- `actionConfidences`
- `averageConfidence`

No changes were made to S3.6 matching weights or ranking rules.

## Verification

```bash
npm run test:s3-action
npm run verify:s3-action
```

### Results (2026-06-19)

| Suite | Result |
|---|---|
| S3 foundation | 24/24 pass |
| S3 trust | 6/6 pass |
| S3 timeline | 5/5 pass |
| S3 live frame | 7/7 pass |
| S3 matching | 7/7 pass |
| S3 action intelligence | 5/5 pass |
| Build + lint | pass |

## Constraints Honored

- No LLM, OpenAI, agents, or external APIs
- No contract, escrow, or trust mutations
- No matching rule changes
- Separate from legacy `src/action/intelligence/` keyword profession mapper

## UI Integration Path

```
Provider onboarding → buildActionProfile() → marketplace action badges + matching candidate enrichment
```

Wire marketplace provider cards to `ActionProfileMatchingSignals` as a follow-up.
