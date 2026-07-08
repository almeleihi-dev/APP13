# S10 Provider Work Dashboard

**Date:** 2026-06-19  
**Scope:** Read-only provider dashboard for work, trust, and earnings (S10)  
**Status:** Complete

## Summary

S10 provides a provider-facing read model that summarizes incoming conversion offers, active and completed contracts, escrow status, execution progress, evidence activity, disputes/issues, S5 trust profile, and earnings from existing financial ledger records.

## Architecture

```
Provider user id
  → list incoming offers (experience.match_contract_offers)
  → list contracts (contract.contracts + parties)
  → batch escrow / milestones / evidence / issues
  → S5 trust profile (TrustScoreService)
  → earnings aggregate (financial.accounts + ledger_entries)
  → domain card builders + dashboard summary
  → ProviderDashboardView
```

## Deliverables

| Deliverable | Path |
|---|---|
| Dashboard domain | `src/provider-workspace/domain/provider-dashboard.ts` |
| Dashboard service | `src/provider-workspace/application/provider-dashboard-service.ts` |
| Dashboard repository | `src/provider-workspace/infrastructure/provider-dashboard-repository.ts` |
| Module factory | `createProviderWorkspaceModule(db, { trustScore })` |
| Routes | `src/api/routes/provider-dashboard.ts` |
| Tests | `test/s10-provider-dashboard.test.ts` |
| Verify script | `scripts/verify-s10.sh` |

## Domain Models

| Model | Purpose |
|---|---|
| `ProviderDashboard` | Full provider dashboard aggregate |
| `ProviderOfferCard` | Incoming conversion offer card |
| `ProviderContractCard` | Contract card with nested statuses |
| `ProviderEscrowStatus` | Escrow projection |
| `ProviderExecutionStatus` | Milestone progress projection |
| `ProviderEvidenceStatus` | Evidence count projection |
| `ProviderIssueSummary` | Issue/dispute summary |
| `ProviderTrustSummary` | S5 trust/live-frame summary |
| `ProviderEarningsSummary` | Ledger-based earnings overview |
| `ProviderDashboardSummary` | Counts and next recommended action |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/providers/:userId/dashboard` | Full provider dashboard |
| GET | `/providers/:userId/offers` | Incoming offer cards |
| GET | `/providers/:userId/contracts` | Contract cards |
| GET | `/providers/:userId/earnings` | Earnings summary |

All endpoints require authentication and only allow the authenticated provider to read their own dashboard (`userId` must match auth context).

## Design Notes

- Read-only projections only
- Reuses conversion summaries, escrow formatting, dispute status mapping, and S5 trust profile
- Earnings derived from `provider_wallet` ledger entries and pending escrow net amounts
- Shows provider-facing status labels only; customer display names are public-safe
- Includes active and completed work with counts and next recommended action
- Deterministic only; no AI orchestration
- Does not modify escrow, ledger, contract, execution, trust, request, conversion, or financial business rules

## Verification

```bash
npm run test:s10-provider-dashboard
npm run verify:s10
```
