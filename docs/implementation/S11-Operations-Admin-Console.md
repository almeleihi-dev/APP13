# S11 Operations Admin Console

**Date:** 2026-06-19  
**Scope:** Read-only operations console for platform administrators (S11)  
**Status:** Complete

## Summary

S11 provides a platform-wide read model for administrators to monitor customer requests, conversion offers, contracts, escrow activity, execution progress, disputes, trust signals, operational risks, and platform health. All endpoints are read-only and restricted to `platform_admin` / `super_admin` roles.

## Architecture

```
Admin auth (platform_admin)
  → aggregate SQL metrics across experience, contract, financial, execution, complaint, trust, platform schemas
  → domain overview builders + risk indicators + health summary
  → PlatformOverviewView
```

## Deliverables

| Deliverable | Path |
|---|---|
| Admin console domain | `src/operations/domain/admin-console.ts` |
| Admin console service | `src/operations/application/admin-console-service.ts` |
| Admin console repository | `src/operations/infrastructure/admin-console-repository.ts` |
| Module factory | `createOperationsModule(db)` |
| Routes | `src/api/routes/admin-console.ts` |
| Tests | `test/s11-admin-console.test.ts` |
| Verify script | `scripts/verify-s11.sh` |

## Domain Models

| Model | Purpose |
|---|---|
| `PlatformOverview` | Full admin console aggregate |
| `RequestOverview` | Customer request counts and trends |
| `OfferOverview` | Conversion offer counts and conversion rate |
| `ContractOverview` | Contract status distribution |
| `EscrowOverview` | Escrow lifecycle distribution |
| `ExecutionOverview` | Milestone and evidence activity |
| `IssueOverview` | Complaint/issue distribution |
| `TrustOverview` | Provider trust and live-frame tiers |
| `RiskOverview` | Operational risk indicators |
| `OperationsSummary` | Platform health and next action |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/admin/overview` | Full platform overview |
| GET | `/admin/requests` | Request metrics |
| GET | `/admin/offers` | Offer metrics |
| GET | `/admin/contracts` | Contract metrics |
| GET | `/admin/escrow` | Escrow metrics |
| GET | `/admin/issues` | Issue metrics |
| GET | `/admin/trust` | Trust metrics |
| GET | `/admin/risks` | Risk indicators |

All endpoints require authentication with `platform_admin` or `super_admin` role.

## Risk Indicators

Deterministic risk signals include:

- Frozen escrow agreements
- Open and escalated issues
- Disputed contracts
- Failed async operations
- Stale conversion offers (>7 days)
- Low-trust providers (score < 50)
- Escrows pending funding

## Design Notes

- Read-only projections only; no modification endpoints
- Aggregates existing tables without changing business rules
- 7-day trend summaries compare recent vs prior period counts
- Platform health: `healthy`, `attention`, or `degraded`
- Deterministic only; no AI orchestration

## Verification

```bash
npm run test:s11-admin-console
npm run verify:s11
```
