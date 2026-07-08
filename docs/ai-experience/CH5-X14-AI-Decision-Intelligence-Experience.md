# CH5-X14 — AN ACT AI Decision Intelligence Experience

Read-only AI Decision Intelligence Experience for Chapter 5, consuming CH5-X13 AI Orchestration Experience.

## Chain

```
Intent → ... → AI Orchestration Experience → AI Decision Intelligence Experience
```

## Module

- Path: `src/ai-decision-intelligence-experience/`
- Factory: `createAiDecisionIntelligenceExperienceModule()`
- Bootstrap key: `aiDecisionIntelligenceExperience`
- Service: `AiDecisionIntelligenceExperienceService`

## Delegation Model

| Upstream | Role |
|----------|------|
| **CH5-X13** | Sole upstream — `AiOrchestrationExperienceService.buildOutputForValidation()` |

## Decision Intelligence Views

| View | Route |
|------|-------|
| Decision Intelligence Home | `/ai-decision-intelligence-experience` |
| Decision Dashboard | `/ai-decision-intelligence-experience/decision-dashboard` |
| Decision Tree | `/ai-decision-intelligence-experience/decision-tree` |
| Decision Options | `/ai-decision-intelligence-experience/options` |
| Decision Recommendations | `/ai-decision-intelligence-experience/recommendations` |
| Risk Analysis | `/ai-decision-intelligence-experience/risk-analysis` |
| Opportunity Analysis | `/ai-decision-intelligence-experience/opportunity-analysis` |
| Priority Matrix | `/ai-decision-intelligence-experience/priority-matrix` |
| Decision Confidence | `/ai-decision-intelligence-experience/confidence` |
| Human-Readable Explanation | `/ai-decision-intelligence-experience/explanation` |
| Compact Summary | `/ai-decision-intelligence-experience/summary` |
| Validate | `/ai-decision-intelligence-experience/validate` |

## Verification

```bash
npm run verify:ch5-x14
```

## Guarantees

- Read-only — no mutations, writes, runtime execution, payment, trust, contract, or execution engine changes
- Delegates-only — X13 sole upstream, no duplicated business logic
- Deterministic — fixed timestamp `2026-07-01T17:00:00.000Z`, stable builders, 3 options, 4 recommendations, 5 tree nodes, 3 risk factors, 3 opportunities
- Explainable — decision intelligence narratives traceable through X13 → X12 → … → C22 chain
- Import-lint compliant
