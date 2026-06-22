# S8 Match-to-Contract Conversion

**Date:** 2026-06-19  
**Scope:** Convert customer request matches into contract offers and real contracts (S8)  
**Status:** Complete

## Summary

S8 connects the S7 customer request experience to the existing S4 contract creation bridge. Customers select a matched provider and published action, preview a contract draft, accept the offer, and create a real contract through `ContractCreationBridgeService` without duplicating contract engine rules.

## Architecture

```
Customer request + provider match + selected action
  → validate request, provider, action ownership, matchability
  → ContractInitiationService.buildContractDraftView()
  → experience.match_contract_offers (offer_created)
  → GET draft preview (draft_previewed)
  → POST accept (transaction-safe row lock)
  → ContractCreationBridgeService.createContractFromDraft()
  → contract_created
```

## Deliverables

| Deliverable | Path |
|---|---|
| Conversion domain | `src/conversion/domain/match-contract-conversion.ts` |
| Conversion service | `src/conversion/application/match-contract-conversion-service.ts` |
| Conversion repository | `src/conversion/infrastructure/match-contract-conversion-repository.ts` |
| Module factory | `createConversionModule(db)` |
| Migration | `database/migrations/019_match_contract_conversions.sql` |
| Routes | `src/api/routes/conversions.ts` |
| Tests | `test/s8-match-contract-conversion.test.ts` |
| Verify script | `scripts/verify-s8.sh` |

## Domain Models

| Model | Purpose |
|---|---|
| `MatchContractConversion` | Offer + draft preview + summary |
| `ContractOffer` | Persisted conversion offer |
| `ContractDraftPreview` | Read-only draft projection before contract creation |
| `ConversionSummary` | Status-aware conversion narrative |
| `ConversionStatus` | Lifecycle state |

## Conversion Status Flow

| Status | Meaning |
|---|---|
| `offer_created` | Offer persisted with draft snapshot |
| `draft_previewed` | Customer viewed draft preview |
| `accepted` | Offer accepted; bridge invoked |
| `contract_created` | Contract created via existing bridge |
| `cancelled` | Offer cancelled before contract creation |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/conversions/offers` | Create contract offer from request match |
| GET | `/conversions/offers/:id` | Get offer and summary |
| GET | `/conversions/offers/:id/draft` | Get contract draft preview |
| POST | `/conversions/offers/:id/accept` | Accept offer and create contract |
| POST | `/conversions/offers/:id/cancel` | Cancel open offer |

## Validation Rules

- Customer request exists and belongs to authenticated customer
- Provider exists for `provider_user_id`
- Selected action exists and belongs to provider
- Provider is matchable for the action (S3 matching eligibility)
- Draft preview built before any contract write
- Contract creation delegated exclusively to S4 bridge + contract engine

## Design Notes

- Deterministic only; no AI orchestration
- Transaction-safe acceptance uses row-level locking on the offer
- Does not modify escrow, ledger, execution, trust, or request business rules
- Idempotent offer creation via `idempotency_key`

## Verification

```bash
npm run test:s8-conversion
npm run verify:s8
```
