# CH5-X4 — AN ACT AI Decision Support Experience

Read-only AI Decision Support Experience for Chapter 5, consuming CH5-X3 AI Guidance Experience.

## Chain

```
Intent → ... → AI Guidance Experience → AI Decision Support Experience
```

## Module

- Path: `src/ai-decision-support-experience/`
- Factory: `createAiDecisionSupportExperienceModule()`
- Bootstrap key: `aiDecisionSupportExperience`
- Service: `AiDecisionSupportExperienceService`

## Delegation Model

| Upstream | Role |
|----------|------|
| **CH5-X3** | Sole upstream — `AiGuidanceExperienceService.buildOutputForValidation()` |

## Decision Support Views

| View | Route |
|------|-------|
| Decision Support Home | `/ai-decision-support-experience` |
| Decision Support Context | `/ai-decision-support-experience/context` |
| Decision Options | `/ai-decision-support-experience/options` |
| Decision Analysis | `/ai-decision-support-experience/analysis` |
| Decision Recommendation | `/ai-decision-support-experience/recommendation` |
| Decision Support Status | `/ai-decision-support-experience/status` |
| Decision Support Readiness | `/ai-decision-support-experience/readiness` |
| Delegation | `/ai-decision-support-experience/delegation` |
| Human-Readable Explanation | `/ai-decision-support-experience/explanation` |
| Compact Summary | `/ai-decision-support-experience/summary` |
| Validate | `/ai-decision-support-experience/validate` |

## Verification

```bash
npm run verify:ch5-x4
```

## Guarantees

- Read-only — no mutations, writes, runtime execution, payment, trust, contract, or execution changes
- Delegates-only — X3 sole upstream, no duplicated business logic
- Deterministic — fixed timestamp `2026-07-01T07:00:00.000Z`, stable builders, 4 decision options per scenario
- Explainable — decision support narratives traceable through X3 → X2 → X1 → C22 chain
- Import-lint compliant
