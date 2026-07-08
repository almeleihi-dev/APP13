# CH5-X19 — AN ACT AI Accountability Ledger Experience

Read-only AI Accountability Ledger Experience for Chapter 5, consuming CH5-X18 AI Governance Assurance Experience.

## Chain

```
Intent → ... → AI Governance Assurance Experience → AI Accountability Ledger Experience
```

## Module

- Path: `src/ai-accountability-ledger-experience/`
- Factory: `createAiAccountabilityLedgerExperienceModule()`
- Bootstrap key: `aiAccountabilityLedgerExperience`
- Service: `AiAccountabilityLedgerExperienceService`

## Delegation Model

| Upstream | Role |
|----------|------|
| **CH5-X18** | Sole upstream — `AiGovernanceAssuranceExperienceService.buildOutputForValidation()` |

## Accountability Ledger Views

| View | Route |
|------|-------|
| Accountability Ledger Home | `/ai-accountability-ledger-experience` |
| Ledger Dashboard | `/ai-accountability-ledger-experience/ledger-dashboard` |
| Accountability Chain | `/ai-accountability-ledger-experience/accountability-chain` |
| Decision Trace | `/ai-accountability-ledger-experience/decision-trace` |
| Evidence Register | `/ai-accountability-ledger-experience/evidence-register` |
| Responsibility Map | `/ai-accountability-ledger-experience/responsibility-map` |
| Audit Trail | `/ai-accountability-ledger-experience/audit-trail` |
| Transparency Report | `/ai-accountability-ledger-experience/transparency-report` |
| Ledger Confidence | `/ai-accountability-ledger-experience/confidence` |
| Human-Readable Explanation | `/ai-accountability-ledger-experience/explanation` |
| Compact Summary | `/ai-accountability-ledger-experience/summary` |
| Validate | `/ai-accountability-ledger-experience/validate` |

## Builder Mapping

| Ledger View | X18 Source |
|-------------|------------|
| Ledger Context | `governanceContext` |
| Ledger Dashboard | `governanceDashboard` |
| Accountability Chain | `policyAlignment.policies` (4) |
| Decision Trace | `controlMap.controls` (4) |
| Evidence Register | `assuranceChecks.checks` (3) |
| Responsibility Map | `riskControls.items` (3) |
| Audit Trail | `accountability.items` (3) |
| Transparency Report | `escalationGuidance` |
| Ledger Confidence | `assuranceConfidence` (re-scored) |
| Delegation | X18 sole upstream checks |
| Explanation | dashboard + chain + evidence summaries |

## Verification

```bash
npm run verify:ch5-x19
```

## Guarantees

- Read-only — no mutations, writes, runtime execution, payment, trust, contract, or execution engine changes
- Delegates-only — X18 sole upstream, no duplicated business logic
- Deterministic — fixed timestamp `2026-07-01T22:00:00.000Z`, stable builders, 4 chain links, 4 decision traces, 3 evidence items, 3 responsibility items, 3 audit entries
- Explainable — accountability ledger narratives traceable through X18 → X17 → … → C22 chain
- Import-lint compliant
- Registry-approved namespace — no collision with existing CH3/CH4/CH5 modules
