# CH5-X18 — AN ACT AI Governance Assurance Experience

Read-only AI Governance Assurance Experience for Chapter 5, consuming CH5-X17 AI Executive Advisory Experience.

## Chain

```
Intent → ... → AI Executive Advisory Experience → AI Governance Assurance Experience
```

## Module

- Path: `src/ai-governance-assurance-experience/`
- Factory: `createAiGovernanceAssuranceExperienceModule()`
- Bootstrap key: `aiGovernanceAssuranceExperience`
- Service: `AiGovernanceAssuranceExperienceService`

## Delegation Model

| Upstream | Role |
|----------|------|
| **CH5-X17** | Sole upstream — `AiExecutiveAdvisoryExperienceService.buildOutputForValidation()` |

## Governance Assurance Views

| View | Route |
|------|-------|
| Governance Assurance Home | `/ai-governance-assurance-experience` |
| Governance Dashboard | `/ai-governance-assurance-experience/governance-dashboard` |
| Policy Alignment | `/ai-governance-assurance-experience/policy-alignment` |
| Control Map | `/ai-governance-assurance-experience/control-map` |
| Assurance Checks | `/ai-governance-assurance-experience/assurance-checks` |
| Risk Controls | `/ai-governance-assurance-experience/risk-controls` |
| Accountability | `/ai-governance-assurance-experience/accountability` |
| Escalation Guidance | `/ai-governance-assurance-experience/escalation-guidance` |
| Assurance Confidence | `/ai-governance-assurance-experience/confidence` |
| Human-Readable Explanation | `/ai-governance-assurance-experience/explanation` |
| Compact Summary | `/ai-governance-assurance-experience/summary` |
| Validate | `/ai-governance-assurance-experience/validate` |

## Builder Mapping

| Governance View | X17 Source |
|-----------------|------------|
| Governance Context | `advisoryContext` |
| Governance Dashboard | `advisoryDashboard` |
| Policy Alignment | `advisoryRecommendations.recommendations` (4) |
| Control Map | `actionPlan.items` (4) |
| Assurance Checks | `priorityActions.actions` (3) |
| Risk Controls | `riskAdvisory.items` (3) |
| Accountability | `opportunityAdvisory.opportunities` (3) |
| Escalation Guidance | `executiveBriefing` |
| Assurance Confidence | `advisoryConfidence` (re-scored) |
| Delegation | X17 sole upstream checks |
| Explanation | dashboard + policy + control map summaries |

## Verification

```bash
npm run verify:ch5-x18
```

## Guarantees

- Read-only — no mutations, writes, runtime execution, payment, trust, contract, or execution engine changes
- Delegates-only — X17 sole upstream, no duplicated business logic
- Deterministic — fixed timestamp `2026-07-01T21:00:00.000Z`, stable builders, 4 policies, 4 controls, 3 assurance checks, 3 risk controls, 3 accountability items
- Explainable — governance assurance narratives traceable through X17 → X16 → … → C22 chain
- Import-lint compliant
- Registry-approved namespace — no collision with CH4 `blueprint-governance` or CH3 runtime modules
