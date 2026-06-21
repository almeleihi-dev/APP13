# S4.4 Escrow Initiation Experience Report

**Date:** 2026-06-19  
**Scope:** Read-only escrow initiation projection for accepted/active contracts  
**Status:** Complete

## Summary

S4.4 adds a financial experience layer that helps customers understand escrow funding requirements before payment. It projects contract value, escrow amount, platform fee, total funding amount, and funding instructions by reading the Contract Engine and Escrow Service — with no payments, ledger mutations, or escrow state changes.

## Architecture

```
Active Contract
  → ContractRepository.findById()
  → EscrowService.getByContractId() (optional)
  → buildEscrowSummary()
  → buildFundingInstructions()
  → EscrowInitiationView
```

## Deliverables

| Deliverable | Path |
|---|---|
| Escrow initiation domain | `src/financial-experience/domain/escrow-initiation.ts` |
| Escrow initiation service | `src/financial-experience/application/escrow-initiation-service.ts` |
| Module factory | `createFinancialExperienceModule(db)` |
| Tests | `test/s4-escrow-initiation.test.ts` |
| Verify script | `scripts/verify-s4-escrow.sh` |

## EscrowInitiationView

| Field | Source |
|---|---|
| `contractId`, `contractNumber` | Contract Engine |
| `contractValue`, `escrowAmount` | Escrow gross or `commercial_terms.estimated_value` |
| `platformFee` | Escrow agreement or projected from commercial terms |
| `fundingAmount` | Contract value + platform fee (customer total) |
| `fundingInstructions` | Deterministic reference + explanations |
| `status` | Escrow status or `awaiting_escrow` |

## Experience Rules

Users can understand:

- **What they fund** — escrow amount protected until milestones accepted
- **Why they fund** — contract execution protection explanation
- **Protected amount** — escrow amount held for provider delivery
- **Platform fee** — transparent facilitation fee line item

Example projection:

| Line | Amount |
|---|---|
| Contract Value | 10,000.00 SAR |
| Platform Fee | 500.00 SAR |
| Funding Amount | 10,500.00 SAR |

## Service API

```typescript
const { escrowInitiation } = createFinancialExperienceModule(db);

await escrowInitiation.buildEscrowInitiationView(contractId);
escrowInitiation.buildFundingInstructions(contractNumber, summary);
await escrowInitiation.buildEscrowSummary(contractId);
```

## Verification

```bash
npm run test:s4-escrow
npm run verify:s4-escrow
```

### Results (2026-06-19)

| Suite | Result |
|---|---|
| All S3 suites | pass |
| All prior S4 suites | pass |
| S4 escrow initiation | 7/7 pass |
| Build + lint | pass |

## Constraints Honored

- No payment processing or actual funding
- No ledger mutations or escrow state changes in projection path
- Reuses Contract Repository, Escrow Service, Ledger Service wiring
- Read-only experience layer

## Next Step

Connect `EscrowInitiationView` to payment intent creation when funding flow is implemented.
