# S9 Customer Order Dashboard

**Date:** 2026-06-19  
**Scope:** Read-only customer dashboard aggregating requests, offers, contracts, escrow, execution, evidence, and issues (S9)  
**Status:** Complete

## Summary

S9 provides a customer-facing read model that summarizes the full order lifecycle from S7 customer requests through S8 conversion offers into contracts and downstream escrow, execution, evidence, and issue status. It composes existing data without modifying business rules in underlying modules.

## Architecture

```
Customer user id
  → list requests (experience.customer_requests)
  → list offers (experience.match_contract_offers)
  → list contracts (contract.contracts + parties)
  → batch escrow / milestones / evidence / issues
  → domain card builders + dashboard summary
  → CustomerDashboardView
```

## Deliverables

| Deliverable | Path |
|---|---|
| Dashboard domain | `src/customer-experience/domain/customer-dashboard.ts` |
| Dashboard service | `src/customer-experience/application/customer-dashboard-service.ts` |
| Dashboard repository | `src/customer-experience/infrastructure/customer-dashboard-repository.ts` |
| Module factory | `createCustomerExperienceModule(db)` |
| Routes | `src/api/routes/customer-dashboard.ts` |
| Tests | `test/s9-customer-dashboard.test.ts` |
| Verify script | `scripts/verify-s9.sh` |

## Domain Models

| Model | Purpose |
|---|---|
| `CustomerDashboard` | Full dashboard aggregate |
| `CustomerRequestCard` | Request summary card |
| `CustomerOfferCard` | Conversion offer card |
| `CustomerContractCard` | Contract card with nested statuses |
| `CustomerEscrowStatus` | Customer-facing escrow projection |
| `CustomerExecutionStatus` | Milestone progress projection |
| `CustomerEvidenceStatus` | Evidence count projection |
| `CustomerIssueSummary` | Issue/dispute summary |
| `CustomerDashboardSummary` | Counts and next recommended action |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/customers/:userId/dashboard` | Full customer dashboard |
| GET | `/customers/:userId/requests` | Request cards only |
| GET | `/customers/:userId/offers` | Offer cards only |
| GET | `/customers/:userId/contracts` | Contract cards only |

All endpoints require authentication and only allow the authenticated user to read their own dashboard (`userId` must match auth context).

## Design Notes

- Read-only projections only
- Reuses request summaries, conversion summaries, escrow formatting, and dispute status mapping
- Shows customer-facing status labels only
- Does not expose sensitive provider internals beyond public display name
- Includes active and completed items with counts and next recommended action
- Deterministic only; no AI orchestration
- Does not modify escrow, ledger, contract, execution, trust, request, or conversion business rules

## Verification

```bash
npm run test:s9-customer-dashboard
npm run verify:s9
```
