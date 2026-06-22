# X6 Escrow & Payment Experience

**Date:** 2026-06-19  
**Scope:** Read-only escrow and payment journey projection (X6)  
**Status:** Complete

## Summary

X6 transforms financial lifecycle states into a user-facing trust and payment journey for contract parties. It composes S4 escrow initiation projections, financial kernel escrow state, ledger journals, contract journey context, S9/S10 dashboard next actions, and S12 inbox events without changing business rules or schema.

## Architecture

```
Contract party user
  → escrow-payment repository snapshot
      Contract kernel + parties
      Financial escrow agreement
      S9 milestone/issue aggregates
      Ledger journals + escrow status history
      S12 escrow/payment inbox events
  → domain summary / progress / readiness / timeline builders
  → EscrowPaymentExperienceView
```

## Deliverables

| Deliverable | Path |
|---|---|
| Domain | `src/experience/escrow-payment/domain/escrow-payment-experience.ts` |
| Service | `src/experience/escrow-payment/application/escrow-payment-experience-service.ts` |
| Repository | `src/experience/escrow-payment/infrastructure/escrow-payment-experience-repository.ts` |
| Module factory | `createEscrowPaymentExperienceModule(db)` |
| Routes | `src/api/routes/escrow-payment.ts` |
| Tests | `test/x6-escrow-payment-experience.test.ts` |
| Verify script | `scripts/verify-x6.sh` |

## Features

| Feature | Source |
|---|---|
| Contract value summary | S4 `buildEscrowSummary` |
| Escrow amount | Escrow agreement / commercial terms |
| Platform fee visibility | S4 fee projection |
| Net earnings visibility | Gross minus platform fee |
| Escrow lifecycle progress | Deterministic 5-stage funding progress |
| Funding readiness | Escrow status + S4 initiation |
| Release readiness | Financial kernel release-eligible statuses |
| Refund visibility | `deriveEscrowFinancials` |
| Financial timeline | Journals, escrow status history, S12 inbox |
| Recommended next financial action | S9/S10 contract next-action builders |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/escrow-payment/:contractId` | Full escrow payment experience |
| `GET` | `/escrow-payment/:contractId/progress` | Funding progress and readiness |
| `GET` | `/escrow-payment/:contractId/timeline` | Financial timeline |
| `GET` | `/escrow-payment/:contractId/readiness` | Release/funding readiness + next action |

All endpoints require authentication and contract party membership (404 for non-parties).

## Verification

```bash
npm run test:x6-escrow-payment
npm run verify:x6
```

`verify:x6` runs the X5 regression suite plus X6 tests.

## Constraints

- Read-only projections only
- No schema changes
- No business rule modifications
- Deterministic calculations only
