# CH5-X5 — AN ACT AI Action Planning Experience

Read-only AI Action Planning Experience for Chapter 5, consuming CH5-X4 AI Decision Support Experience.

## Chain

```
Intent → ... → AI Decision Support Experience → AI Action Planning Experience
```

## Module

- Path: `src/ai-action-planning-experience/`
- Factory: `createAiActionPlanningExperienceModule()`
- Bootstrap key: `aiActionPlanningExperience`
- Service: `AiActionPlanningExperienceService`

## Delegation Model

| Upstream | Role |
|----------|------|
| **CH5-X4** | Sole upstream — `AiDecisionSupportExperienceService.buildOutputForValidation()` |

## Action Planning Views

| View | Route |
|------|-------|
| Action Planning Home | `/ai-action-planning-experience` |
| Action Planning Context | `/ai-action-planning-experience/context` |
| Action Plan | `/ai-action-planning-experience/plan` |
| Prioritized Tasks | `/ai-action-planning-experience/tasks` |
| Milestones | `/ai-action-planning-experience/milestones` |
| Timeline | `/ai-action-planning-experience/timeline` |
| Dependencies | `/ai-action-planning-experience/dependencies` |
| Execution Checklist | `/ai-action-planning-experience/checklist` |
| Readiness | `/ai-action-planning-experience/readiness` |
| Delegation | `/ai-action-planning-experience/delegation` |
| Human-Readable Explanation | `/ai-action-planning-experience/explanation` |
| Compact Summary | `/ai-action-planning-experience/summary` |
| Validate | `/ai-action-planning-experience/validate` |

## Verification

```bash
npm run verify:ch5-x5
```

## Guarantees

- Read-only — no mutations, writes, runtime execution, payment, trust, contract, or execution changes
- Delegates-only — X4 sole upstream, no duplicated business logic
- Deterministic — fixed timestamp `2026-07-01T08:00:00.000Z`, stable builders, 4 tasks and 3 milestones per scenario
- Explainable — action planning narratives traceable through X4 → X3 → X2 → X1 → C22 chain
- Import-lint compliant
