# X3 Contract Journey Experience

**Date:** 2026-06-19  
**Scope:** Read-only unified contract lifecycle journey projection (X3)  
**Status:** Complete

## Summary

X3 transforms request, offer, contract, escrow, execution, evidence, issue, and completion states into a single user-facing contract journey. It composes existing marketplace modules without changing business rules or schema.

## Architecture

```
Contract party (customer or provider)
  → contract-journey repository snapshot
      contract + parties
      S7 request linkage
      S8 offer linkage
      escrow / milestones / evidence / issues aggregates
      evaluation presence
      S12 inbox + status history timeline events
  → domain stage detection + progress builders
  → ContractJourneyView
```

## Deliverables

| Deliverable | Path |
|---|---|
| Journey domain | `src/experience/contract-journey/domain/contract-journey.ts` |
| Journey service | `src/experience/contract-journey/application/contract-journey-service.ts` |
| Journey repository | `src/experience/contract-journey/infrastructure/contract-journey-repository.ts` |
| Module factory | `createContractJourneyModule(db)` |
| Routes | `src/api/routes/contract-journey.ts` |
| Tests | `test/x3-contract-journey.test.ts` |
| Verify script | `scripts/verify-x3.sh` |

## Journey Stages

| Stage | Signal |
|---|---|
| `request_created` | Linked customer request exists |
| `provider_matched` | Request matched or offer exists |
| `offer_created` | Conversion offer exists |
| `contract_created` | Contract record exists |
| `escrow_funded` | Escrow in funded/held/execution/released state |
| `execution_started` | Milestones in progress or contract active |
| `evidence_submitted` | Evidence count > 0 |
| `milestone_completed` | Completed milestone count > 0 |
| `evaluation_submitted` | Customer evaluation exists |
| `contract_completed` | Contract in completed/resolved/closed state |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/journeys/:contractId` | Full contract journey |
| `GET` | `/journeys/:contractId/timeline` | Journey timeline events |
| `GET` | `/journeys/:contractId/progress` | Stage progress and milestones |

All endpoints require authentication and contract party membership.

## Perspectives

Each journey includes:

- Customer summary and next action (S9-style)
- Provider summary and next action (S10-style)
- Recommended next action for the authenticated party

## Verification

```bash
npm run test:x3-journey
npm run verify:x3
```

`verify:x3` runs the X2 regression suite plus X3 tests.

## Constraints

- Read-only projections only
- Reuses S7/S8/S9/S10/S12 and contract/financial/execution/complaint data
- No schema or business rule changes
- Deterministic stage detection and progress math
