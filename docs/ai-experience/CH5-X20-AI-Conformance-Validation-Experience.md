# CH5-X20 — AN ACT AI Conformance Validation Experience

Read-only AI Conformance Validation Experience for Chapter 5, consuming CH5-X19 AI Accountability Ledger Experience.

## Chain

```
Intent → ... → AI Accountability Ledger Experience → AI Conformance Validation Experience
```

## Module

- Path: `src/ai-conformance-validation-experience/`
- Factory: `createAiConformanceValidationExperienceModule()`
- Bootstrap key: `aiConformanceValidationExperience`
- Service: `AiConformanceValidationExperienceService`

## Delegation Model

| Upstream | Role |
|----------|------|
| **CH5-X19** | Sole upstream — `AiAccountabilityLedgerExperienceService.buildOutputForValidation()` |

## Conformance Validation Views

| View | Route |
|------|-------|
| Conformance Validation Home | `/ai-conformance-validation-experience` |
| Conformance Dashboard | `/ai-conformance-validation-experience/conformance-dashboard` |
| Validation Matrix | `/ai-conformance-validation-experience/validation-matrix` |
| Compliance Status | `/ai-conformance-validation-experience/compliance-status` |
| Conformance Rules | `/ai-conformance-validation-experience/conformance-rules` |
| Deviation Analysis | `/ai-conformance-validation-experience/deviation-analysis` |
| Corrective Actions | `/ai-conformance-validation-experience/corrective-actions` |
| Validation Report | `/ai-conformance-validation-experience/validation-report` |
| Conformance Confidence | `/ai-conformance-validation-experience/confidence` |
| Human-Readable Explanation | `/ai-conformance-validation-experience/explanation` |
| Compact Summary | `/ai-conformance-validation-experience/summary` |
| Validate | `/ai-conformance-validation-experience/validate` |

## Builder Mapping

| Conformance View | X19 Source |
|----------------|------------|
| Conformance Context | `ledgerContext` |
| Conformance Dashboard | `ledgerDashboard` |
| Validation Matrix | `accountabilityChain.links` (4) |
| Compliance Status | `decisionTrace.entries` (4) |
| Conformance Rules | `evidenceRegister.items` (3) |
| Deviation Analysis | `responsibilityMap.items` (3) |
| Corrective Actions | `auditTrail.entries` (3) |
| Validation Report | `transparencyReport` |
| Conformance Confidence | `ledgerConfidence` (re-scored) |
| Delegation | X19 sole upstream checks |
| Explanation | dashboard + matrix + rules summaries |

## Verification

```bash
npm run verify:ch5-x20
```

## Guarantees

- Read-only — no mutations, writes, runtime execution, payment, trust, contract, or execution engine changes
- Delegates-only — X19 sole upstream, no duplicated business logic
- Deterministic — fixed timestamp `2026-07-01T23:00:00.000Z`, stable builders, 4 matrix rows, 4 compliance items, 3 rules, 3 deviations, 3 corrective actions
- Explainable — conformance validation narratives traceable through X19 → X18 → … → C22 chain
- Import-lint compliant
- Registry-approved namespace — avoids CH4 certification and CH3 runtime certification collisions
