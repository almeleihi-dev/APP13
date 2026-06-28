# CH4-C18 — AN ACT Unified Action Intelligence Experience

The first user-facing experience layer presenting the complete C1–C17 intelligence chain as one unified, explainable journey.

## Chain

```
Intent → ... → Orchestration Intelligence → Unified Action Intelligence Experience
```

## Module

- Path: `src/action-intelligence-experience/`
- Factory: `createActionIntelligenceExperienceModule()`
- Bootstrap key: `actionIntelligenceExperience`
- Service: `ActionIntelligenceExperienceService`

## Delegation Model

| Upstream | Role |
|----------|------|
| **CH4-C17** | Sole upstream — `OrchestrationIntelligenceEngineService.buildOutputForValidation()` |

No duplicated business logic. No DB writes, execution, payment, contract creation, or trust mutations.

## Experience Screens

| Screen | Route |
|--------|-------|
| Unified Intelligence Home | `/action-intelligence-experience` |
| Intent Understanding | `/action-intelligence-experience/intent` |
| Planning | `/action-intelligence-experience/planning` |
| Pricing | `/action-intelligence-experience/pricing` |
| Contract | `/action-intelligence-experience/contract` |
| Execution | `/action-intelligence-experience/execution` |
| Outcome | `/action-intelligence-experience/outcome` |
| Trust | `/action-intelligence-experience/trust` |
| Decision | `/action-intelligence-experience/decision` |
| Recommendation | `/action-intelligence-experience/recommendation` |
| Insights | `/action-intelligence-experience/insights` |
| Predictions | `/action-intelligence-experience/predictions` |
| Strategy | `/action-intelligence-experience/strategy` |
| Learning | `/action-intelligence-experience/learning` |
| Optimization | `/action-intelligence-experience/optimization` |
| Evolution | `/action-intelligence-experience/evolution` |
| Complete Orchestration Summary | `/action-intelligence-experience/orchestration` |
| End-to-End Journey | `/action-intelligence-experience/journey` |
| Explanation | `/action-intelligence-experience/explanation` |
| Summary | `/action-intelligence-experience/summary` |
| Validate | `/action-intelligence-experience/validate` |

## Verification

```bash
npm run verify:ch4-c18
```

## Guarantees

- Read-only — no mutations
- Delegates-only — C17 sole upstream
- Deterministic — fixed timestamp, stable builders
- Explainable — full C1–C17 journey narrative
- Import-lint compliant
