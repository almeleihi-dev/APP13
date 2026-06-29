# CH5-X15 — AN ACT AI Strategic Intelligence Experience

Read-only AI Strategic Intelligence Experience for Chapter 5, consuming CH5-X14 AI Decision Intelligence Experience.

## Chain

```
Intent → ... → AI Decision Intelligence Experience → AI Strategic Intelligence Experience
```

## Module

- Path: `src/ai-strategic-intelligence-experience/`
- Factory: `createAiStrategicIntelligenceExperienceModule()`
- Bootstrap key: `aiStrategicIntelligenceExperience`
- Service: `AiStrategicIntelligenceExperienceService`

## Delegation Model

| Upstream | Role |
|----------|------|
| **CH5-X14** | Sole upstream — `AiDecisionIntelligenceExperienceService.buildOutputForValidation()` |

## Strategic Intelligence Views

| View | Route |
|------|-------|
| Strategic Intelligence Home | `/ai-strategic-intelligence-experience` |
| Strategy Dashboard | `/ai-strategic-intelligence-experience/strategy-dashboard` |
| Strategic Goals | `/ai-strategic-intelligence-experience/strategic-goals` |
| Strategic Scenarios | `/ai-strategic-intelligence-experience/strategic-scenarios` |
| Strategic Priorities | `/ai-strategic-intelligence-experience/priorities` |
| Risk Landscape | `/ai-strategic-intelligence-experience/risk-landscape` |
| Opportunity Landscape | `/ai-strategic-intelligence-experience/opportunity-landscape` |
| Execution Roadmap | `/ai-strategic-intelligence-experience/execution-roadmap` |
| Strategic Confidence | `/ai-strategic-intelligence-experience/confidence` |
| Human-Readable Explanation | `/ai-strategic-intelligence-experience/explanation` |
| Compact Summary | `/ai-strategic-intelligence-experience/summary` |
| Validate | `/ai-strategic-intelligence-experience/validate` |

## Verification

```bash
npm run verify:ch5-x15
```

## Guarantees

- Read-only — no mutations, writes, runtime execution, payment, trust, contract, or execution engine changes
- Delegates-only — X14 sole upstream, no duplicated business logic
- Deterministic — fixed timestamp `2026-07-01T18:00:00.000Z`, stable builders, 3 goals, 4 scenarios, 3 priorities, 4 roadmap steps, 3 risk items, 3 opportunities
- Explainable — strategic intelligence narratives traceable through X14 → X13 → … → C22 chain
- Import-lint compliant
