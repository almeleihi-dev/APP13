# X27 Platform Operations Center

**Date:** 2026-06-19  
**Scope:** Read-only platform operations command center (X27)  
**Status:** Complete

## Summary

X27 provides real-time operational visibility into APP13 platform activity, execution, trust, financial activity, disputes, complaints, escrow, and system health. It answers: **How is APP13 operating right now?** The experience is read-only, deterministic, has no AI dependencies, requires no schema changes, and enforces `platform_admin` access.

## Architecture

```
Authenticated platform_admin
  → platform operations repository snapshot
      platform analytics + admin console operational metrics
  → X27 platform operations builders
  → PlatformOperationsCenterView
```

## Deliverables

| Deliverable | Path |
|---|---|
| Domain | `src/experience/platform-operations/domain/platform-operations.ts` |
| Service | `src/experience/platform-operations/application/platform-operations-service.ts` |
| Repository | `src/experience/platform-operations/infrastructure/platform-operations-repository.ts` |
| Module factory | `createPlatformOperationsModule(db)` |
| Routes | `src/api/routes/platform-operations.ts` |
| Tests | `test/x27-platform-operations.test.ts` |
| Verify script | `scripts/verify-x27.sh` |

## Data Sources

X27 uses existing operational repositories and platform analytics only:

- `platformAnalyticsRepository.loadSnapshot`
- `adminConsoleRepository` request, offer, contract, escrow, execution, issue, trust, and risk metrics

No filesystem audits or AI dependencies are used.

## Core Views

| View | Contents |
|---|---|
| Operations overview | Operations score, active users/providers, active contracts, open issues/complaints, escrow volume, platform activity score |
| Contract operations | Total, active, completed, disputed, cancelled contracts |
| Escrow operations | Active, funded, held, frozen, released escrows and volume |
| Trust operations | Trust events, evaluations, disputes, warnings, recovery events |
| Complaint operations | Open/resolved complaints, escalations, complaint health score |
| Execution operations | Milestones submitted/accepted/pending, execution health score |
| Financial operations | Transactions, platform fees, escrow balances, refunds, activity score |
| System health | Route count, module count, verification chain status, dependency health |
| Operational risk register | Contract, escrow, trust, complaint, execution, financial, system risks |
| Operational recommendations | Immediate, today, this week, this month actions |
| Operations score | Weighted composite across seven operational dimensions |

## Operations Score Weights

| Dimension | Weight |
|---|---|
| Contracts | 15% |
| Escrow | 15% |
| Trust | 15% |
| Complaints | 10% |
| Execution | 15% |
| Financial | 15% |
| System health | 15% |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/platform-operations` | Full platform operations center |
| `GET` | `/platform-operations/overview` | Operations overview |
| `GET` | `/platform-operations/contracts` | Contract operations |
| `GET` | `/platform-operations/escrow` | Escrow operations |
| `GET` | `/platform-operations/trust` | Trust operations |
| `GET` | `/platform-operations/complaints` | Complaint operations |
| `GET` | `/platform-operations/execution` | Execution operations |
| `GET` | `/platform-operations/financial` | Financial operations |
| `GET` | `/platform-operations/system-health` | System health |
| `GET` | `/platform-operations/risks` | Operational risk register |
| `GET` | `/platform-operations/recommendations` | Operational recommendations |

All endpoints require `platform_admin` role. Operations score is included in the full center response.

## Verification

```bash
npm run test:x27-platform-operations
npm run verify:x27
```

The verification chain runs `verify-x26`, X27 tests, build, and import lint.

## Rules

- Read-only experience layer
- No mutations
- No schema changes
- No AI dependencies
- Deterministic calculations only
- Sources limited to operational repositories and platform analytics
