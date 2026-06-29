# CH5-X21 — AN ACT AI Operational Oversight Experience

Read-only AI Operational Oversight Experience for Chapter 5, consuming CH5-X20 AI Conformance Validation Experience.

## Chain

```
Intent → ... → AI Conformance Validation Experience → AI Operational Oversight Experience
```

## Module

- Path: `src/ai-operational-oversight-experience/`
- Factory: `createAiOperationalOversightExperienceModule()`
- Bootstrap key: `aiOperationalOversightExperience`
- Service: `AiOperationalOversightExperienceService`

## Delegation Model

| Upstream | Role |
|----------|------|
| **CH5-X20** | Sole upstream — `AiConformanceValidationExperienceService.buildOutputForValidation()` |

## Operational Oversight Views

| View | Route |
|------|-------|
| Operational Oversight Home | `/ai-operational-oversight-experience` |
| Oversight Dashboard | `/ai-operational-oversight-experience/oversight-dashboard` |
| Operational Health | `/ai-operational-oversight-experience/operational-health` |
| Oversight Matrix | `/ai-operational-oversight-experience/oversight-matrix` |
| Compliance Monitor | `/ai-operational-oversight-experience/compliance-monitor` |
| Exception Monitor | `/ai-operational-oversight-experience/exception-monitor` |
| Intervention Plan | `/ai-operational-oversight-experience/intervention-plan` |
| Oversight Report | `/ai-operational-oversight-experience/oversight-report` |
| Oversight Confidence | `/ai-operational-oversight-experience/confidence` |
| Human-Readable Explanation | `/ai-operational-oversight-experience/explanation` |
| Compact Summary | `/ai-operational-oversight-experience/summary` |
| Validate | `/ai-operational-oversight-experience/validate` |

## Builder Mapping

| Oversight View | X20 Source |
|----------------|------------|
| Oversight Context | `conformanceContext` |
| Oversight Dashboard | `conformanceDashboard` |
| Operational Health | `conformanceDashboard` (healthScore-derived) |
| Oversight Matrix | `validationMatrix.rows` (4) |
| Compliance Monitor | `complianceStatus.items` (4) |
| Exception Monitor | `deviationAnalysis.items` (3) |
| Intervention Plan | `correctiveActions.actions` (3) |
| Oversight Report | `validationReport` |
| Oversight Confidence | `conformanceConfidence` (re-scored) |
| Delegation | X20 sole upstream checks |
| Explanation | dashboard + matrix + compliance summaries |

## Verification

```bash
npm run verify:ch5-x21
```

## Guarantees

- Read-only — no mutations, writes, runtime execution, payment, trust, contract, or execution engine changes
- Delegates-only — X20 sole upstream, no duplicated business logic
- Deterministic — fixed timestamp `2026-07-02T00:00:00.000Z`, stable builders, 4 matrix rows, 4 compliance items, 3 exceptions, 3 interventions
- Explainable — operational oversight narratives traceable through X20 → X19 → … → C22 chain
- Import-lint compliant
- Registry-approved namespace — avoids CH3 runtime-operations and CH4 orchestration collisions
