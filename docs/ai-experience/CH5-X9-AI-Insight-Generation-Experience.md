# CH5-X9 — AN ACT AI Insight Generation Experience

Read-only AI Insight Generation Experience for Chapter 5, consuming CH5-X8 AI Adaptive Coaching Experience.

## Chain

```
Intent → ... → AI Adaptive Coaching Experience → AI Insight Generation Experience
```

## Module

- Path: `src/ai-insight-generation-experience/`
- Factory: `createAiInsightGenerationExperienceModule()`
- Bootstrap key: `aiInsightGenerationExperience`
- Service: `AiInsightGenerationExperienceService`

## Delegation Model

| Upstream | Role |
|----------|------|
| **CH5-X8** | Sole upstream — `AiAdaptiveCoachingExperienceService.buildOutputForValidation()` |

## Insight Generation Views

| View | Route |
|------|-------|
| Insight Generation Home | `/ai-insight-generation-experience` |
| Insight Context | `/ai-insight-generation-experience/context` |
| Generated Insights | `/ai-insight-generation-experience/insights` |
| Pattern Detection | `/ai-insight-generation-experience/patterns` |
| Key Findings | `/ai-insight-generation-experience/findings` |
| Opportunity Analysis | `/ai-insight-generation-experience/opportunities` |
| Risk Analysis | `/ai-insight-generation-experience/risks` |
| Strategic Insights | `/ai-insight-generation-experience/strategic` |
| Insight Readiness | `/ai-insight-generation-experience/readiness` |
| Delegation | `/ai-insight-generation-experience/delegation` |
| Human-Readable Explanation | `/ai-insight-generation-experience/explanation` |
| Compact Summary | `/ai-insight-generation-experience/summary` |
| Validate | `/ai-insight-generation-experience/validate` |

## Verification

```bash
npm run verify:ch5-x9
```

## Guarantees

- Read-only — no mutations, writes, runtime execution, payment, trust, contract, or execution engine changes
- Delegates-only — X8 sole upstream, no duplicated business logic
- Deterministic — fixed timestamp `2026-07-01T12:00:00.000Z`, stable builders, 4 generated insights, 4 patterns, 3 strategic insights
- Explainable — insight generation narratives traceable through X8 → X7 → X6 → X5 → X4 → X3 → X2 → X1 → C22 chain
- Import-lint compliant
