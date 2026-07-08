# S4.2 Contract Initiation Experience Report

**Date:** 2026-06-19  
**Scope:** Read-only contract initiation projection between marketplace discovery and contract creation  
**Status:** Complete

## Summary

S4.2 adds a user-facing contract initiation layer that turns marketplace provider selection into a structured `ContractDraftView`. Users see who they are contracting with, why the provider was recommended, trust level, work category, and commercial estimates — with no persistence, contracts, escrow, or payments.

## Architecture

```
Marketplace Results (S4.1)
  → Provider Selection
  → ContractInitiationService.startContractInitiation()
  → Marketplace Experience provider summary
  → Trust + Live Frame projections
  → Action Intelligence confidence
  → ContractDraftView (projection)
  → Ready for contract creation (future)
```

## Deliverables

| Deliverable | Path |
|---|---|
| Contract initiation domain | `src/contracts-experience/domain/contract-initiation.ts` |
| Initiation service | `src/contracts-experience/application/contract-initiation-service.ts` |
| Module factory | `createContractInitiationModule(db?)` |
| Tests | `test/s4-contract-initiation.test.ts` |
| Verify script | `scripts/verify-s4-contract-initiation.sh` |

## Domain Models

### ContractInitiation

| Field | Source |
|---|---|
| `customerId`, `providerId`, `actionCode` | User selection |
| `proposedTitle`, `proposedDescription` | Action catalog + provider name |
| `estimatedValue` | Provider `priceEstimate` |
| `estimatedDuration` | Category-based heuristic |
| `createdAt` | Request timestamp |

### ContractDraftView

| Section | Contents |
|---|---|
| `providerSummary` | Identity, trust tier, recommendation reason, highlights |
| `actionSummary` | Catalog action, category, confidence |
| `trustSummary` | Score + explanation + tier |
| `liveFrameSummary` | Tier, color, label, risk explanation |
| `commercialTerms` | Value, duration, trust tier, completed contracts |

## Service API

```typescript
const { contractInitiation } = createContractInitiationModule(db);

contractInitiation.startContractInitiation(input, context);
await contractInitiation.buildContractDraftView(initiation, context);
await contractInitiation.buildProviderContractSummary(providerId, actionCode, context);
```

## Experience Rules

Users can understand:

- **Who** — provider name, top actions, reputation highlights
- **Why recommended** — trust explanation + optional marketplace match/rank context
- **Trust level** — score, tier, and plain-language explanation
- **Work category** — catalog action name and category label
- **Commercial estimate** — value from provider estimate, duration from category heuristic

No pricing engine. No negotiation engine. No mutations.

## Verification

```bash
npm run test:s4-contract-initiation
npm run verify:s4-contract-initiation
```

### Results (2026-06-19)

| Suite | Result |
|---|---|
| S3 foundation | 24/24 pass |
| S3 trust | 6/6 pass |
| S3 timeline | 5/5 pass |
| S3 live frame | 7/7 pass |
| S3 matching | 7/7 pass |
| S3 action intelligence | 5/5 pass |
| S3 marketplace | 6/6 pass |
| S4 marketplace experience | 5/5 pass |
| S4 contract initiation | 5/5 pass |
| Build + lint | pass |

## Constraints Honored

- No actual contract, escrow, or payment creation
- Read-only projection layer
- No UI framework changes
- Reuses S4.1 marketplace experience without duplicated trust/matching logic

## Next Step

Wire `ContractDraftView` into contract creation flow when S4.3+ adds mutable contract initiation.
