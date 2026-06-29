# CH5-X8 — AN ACT AI Adaptive Coaching Experience

Read-only AI Adaptive Coaching Experience for Chapter 5, consuming CH5-X7 AI Progress Intelligence Experience.

## Chain

```
Intent → ... → AI Progress Intelligence Experience → AI Adaptive Coaching Experience
```

## Module

- Path: `src/ai-adaptive-coaching-experience/`
- Factory: `createAiAdaptiveCoachingExperienceModule()`
- Bootstrap key: `aiAdaptiveCoachingExperience`
- Service: `AiAdaptiveCoachingExperienceService`

## Delegation Model

| Upstream | Role |
|----------|------|
| **CH5-X7** | Sole upstream — `AiProgressIntelligenceExperienceService.buildOutputForValidation()` |

## Adaptive Coaching Views

| View | Route |
|------|-------|
| Adaptive Coaching Home | `/ai-adaptive-coaching-experience` |
| Coaching Context | `/ai-adaptive-coaching-experience/context` |
| Adaptive Guidance | `/ai-adaptive-coaching-experience/guidance` |
| Coaching Insights | `/ai-adaptive-coaching-experience/insights` |
| Improvement Opportunities | `/ai-adaptive-coaching-experience/improvements` |
| Motivation Summary | `/ai-adaptive-coaching-experience/motivation` |
| Behavioral Suggestions | `/ai-adaptive-coaching-experience/behavior` |
| Readiness | `/ai-adaptive-coaching-experience/readiness` |
| Delegation | `/ai-adaptive-coaching-experience/delegation` |
| Human-Readable Explanation | `/ai-adaptive-coaching-experience/explanation` |
| Compact Summary | `/ai-adaptive-coaching-experience/summary` |
| Validate | `/ai-adaptive-coaching-experience/validate` |

## Verification

```bash
npm run verify:ch5-x8
```

## Guarantees

- Read-only — no mutations, writes, runtime execution, payment, trust, contract, or execution engine changes
- Delegates-only — X7 sole upstream, no duplicated business logic
- Deterministic — fixed timestamp `2026-07-01T11:00:00.000Z`, stable builders, 4 insights, 3 improvements, 4 behavioral suggestions
- Explainable — adaptive coaching narratives traceable through X7 → X6 → X5 → X4 → X3 → X2 → X1 → C22 chain
- Import-lint compliant
