# P6 — Execution Experience

**Phase:** P6 (UI for read-only execution monitoring)  
**Status:** Implemented — read-only execution dashboard and milestone details  
**Date:** 2026-06-19

---

## Summary

P6 exposes project execution state through a read-only UI layer that consumes existing **Execution Service** snapshots, **Milestone**, **Evidence**, and **Evaluation** domain data, plus **Escrow** and **Contract** read fixtures. The UI validates requests, projects pre-supplied DTOs into dashboard cards and milestone detail views, and performs no execution, escrow, or ledger calculations.

---

## Architecture

```
Execution Dashboard / Milestone Details Request
        │
        ▼
execution-client.ts
        │
        ├── dashboardExecutor / milestoneDetailsExecutor (tests & integrations)
        └── MVP read fixtures (demo mode)
        │
        ▼
execution-dashboard.ts + milestone-details.ts
        │
        ▼
Execution Dashboard Page / Milestone Details Page
```

### Module layout

```
src/ui/execution/
  types.ts                 UI DTOs and card view models
  execution-payload.ts       Validation, fixtures, workflow/escrow mappers
  execution-client.ts        getExecutionDashboard(), getMilestoneDetails()
  index.ts

src/ui/pages/
  execution-dashboard.ts     Nine-card dashboard projection + render
  milestone-details.ts         Milestone detail projection + render
```

---

## Page Flow

1. Caller supplies `contract_id` (and `milestone_id` for details) or injects an executor returning `ExecutionExperienceSource`.
2. Payload layer validates UUID input only — no business rules or amount calculations.
3. Dashboard page projects nine cards from the source snapshot.
4. Milestone details page projects milestone fields, evidence list, acceptance ratings, and escrow context.

---

## Execution Dashboard Cards

| Card | Source |
|------|--------|
| 1. Project Status | Contract snapshot (status, title, category, duration) |
| 2. Progress | Pre-computed progress snapshot |
| 3. Active Milestones | Milestone snapshots filtered for display |
| 4. Evidence Summary | Evidence summary snapshot |
| 5. Acceptance Status | Attestation / fulfillment rating snapshot |
| 6. Escrow Status | Escrow status snapshot |
| 7. Timeline | Execution timeline events |
| 8. Risk Indicators | Risk indicator snapshot |
| 9. Final Evaluation | Evaluation snapshot |

---

## Milestone Details Page

| Section | Source |
|---------|--------|
| Milestone Summary | Milestone snapshot fields |
| Evidence | Evidence items filtered by milestone ID |
| Context | Escrow status, release allocation label, acceptance ratings |

---

## Dependencies

| Layer | Consumed As |
|-------|-------------|
| Execution Service | Milestone, evidence, attestation, evaluation snapshots (via executor) |
| Milestone domain | `MilestoneStatus` types for display |
| Evidence domain | Evidence type labels in summary |
| Evaluation domain | Final evaluation snapshot |
| Escrow snapshots | Escrow status card (from P5 fixtures or mapper) |
| Contract snapshots | Project status and workflow-backed contract context |

No modifications to execution, escrow, ledger, AI engines, or orchestrator logic.

---

## Verification

```bash
npm run test:p6
npm run verify:p6
```

`verify:p6` runs:

1. `test:p6`
2. `build`
3. `lint:imports`

---

## Tests

| File | Coverage |
|------|----------|
| `test/ui-execution-dashboard.test.ts` | Validation, projection, client, render, workflow+escrow integration |
| `test/ui-execution-milestone-details.test.ts` | Milestone projection, empty evidence, client, render |

Fixtures:

- `MVP_ACTIVE_EXECUTION_SOURCE` — active contract, in-progress milestone
- `MVP_COMPLETED_EXECUTION_SOURCE` — completed with evaluation
- `MVP_DISPUTED_EXECUTION_SOURCE` — disputed milestone, frozen escrow
- `MVP_EMPTY_EVIDENCE_MILESTONE_SOURCE` — empty evidence edge case

---

## Constraints

- Read-only UI — no database writes
- Deterministic projection from supplied snapshots
- No execution logic duplication
- No escrow or ledger logic duplication
- No AI engine modifications
- Fully typed DTOs in `src/ui/execution/types.ts`
