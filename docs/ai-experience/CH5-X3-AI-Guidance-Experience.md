# CH5-X3 — AN ACT AI Guidance Experience

Read-only AI Guidance Experience for Chapter 5, consuming CH5-X2 AI Conversation Experience.

## Chain

```
Intent → ... → AI Conversation Experience → AI Guidance Experience
```

## Module

- Path: `src/ai-guidance-experience/`
- Factory: `createAiGuidanceExperienceModule()`
- Bootstrap key: `aiGuidanceExperience`
- Service: `AiGuidanceExperienceService`

## Delegation Model

| Upstream | Role |
|----------|------|
| **CH5-X2** | Sole upstream — `AiConversationExperienceService.buildOutputForValidation()` |

## Guidance Views

| View | Route |
|------|-------|
| Guidance Home | `/ai-guidance-experience` |
| Guidance Context | `/ai-guidance-experience/context` |
| Guidance Plan | `/ai-guidance-experience/plan` |
| Guidance Steps | `/ai-guidance-experience/steps` |
| Guidance Recommendations | `/ai-guidance-experience/recommendations` |
| Guidance Status | `/ai-guidance-experience/status` |
| Guidance Readiness | `/ai-guidance-experience/readiness` |
| Delegation | `/ai-guidance-experience/delegation` |
| Human-Readable Explanation | `/ai-guidance-experience/explanation` |
| Compact Summary | `/ai-guidance-experience/summary` |
| Validate | `/ai-guidance-experience/validate` |

## Verification

```bash
npm run verify:ch5-x3
```

## Guarantees

- Read-only — no mutations, writes, runtime execution, payment, trust, contract, or execution changes
- Delegates-only — X2 sole upstream, no duplicated business logic
- Deterministic — fixed timestamp `2026-07-01T06:00:00.000Z`, stable builders, 4 steps and 3 recommendations per scenario
- Explainable — guidance narratives traceable through X2 → X1 → C22 chain
- Import-lint compliant
