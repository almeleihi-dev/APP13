# X12 Customer Command Center

**Date:** 2026-06-19  
**Scope:** Read-only customer command center projection (X12)  
**Status:** Complete

## Summary

X12 composes a customer-facing command center dashboard from S9 customer workspace data (requests, contracts, escrow) and experience slices X8 (provider recommendations) and X10 (live trust frame on related providers). All projections are deterministic with no schema changes and no AI dependencies.

## Architecture

```
Authenticated customer
  → customer command center repository snapshot
      S9 requests + offers + contracts + escrows
      S13 discoverable providers for X8 matching
  → X12 dashboard builders (overview, requests, contracts, escrow, providers)
  → X8 rankProvidersForRequirement for recommendations
  → X10 public live trust frame per related provider
  → CustomerCommandCenterView
```

## Deliverables

| Deliverable | Path |
|---|---|
| Domain | `src/experience/customer-command-center/domain/customer-command-center.ts` |
| Service | `src/experience/customer-command-center/application/customer-command-center-service.ts` |
| Repository | `src/experience/customer-command-center/infrastructure/customer-command-center-repository.ts` |
| Module factory | `createCustomerCommandCenterModule(db, { liveTrustFrame })` |
| Routes | `src/api/routes/customer-command-center.ts` |
| Tests | `test/x12-customer-command-center.test.ts` |
| Verify script | `scripts/verify-x12.sh` |

## Features

| Feature | Description |
|---|---|
| Customer dashboard | Overview headline, next action, request/contract/escrow counts |
| Requests summary | Open requests and recent request highlights from S9 |
| Contracts summary | Active/completed counts and recent contract highlights |
| Escrow summary | Pending funding, funded/held totals, recent escrow highlights |
| Favorite/recent providers | Derived from offer and contract history |
| X8 recommendations | Ranked providers for the customer's primary open request |
| X10 live trust frame | Public frame cards on recommendations and provider relationships |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/customer-command-center` | Full customer command center |
| `GET` | `/customer-command-center/requests` | Requests summary |
| `GET` | `/customer-command-center/contracts` | Contracts summary |
| `GET` | `/customer-command-center/escrow` | Escrow summary |
| `GET` | `/customer-command-center/providers` | Favorite and recent providers |
| `GET` | `/customer-command-center/recommendations` | X8 provider recommendations |

Customer-only endpoints return 404 for non-customers.

## Verification

```bash
npm run test:x12-customer-command-center
npm run verify:x12
```

`verify:x12` runs the X11 regression suite, X12 tests, build, and import lint.

## Constraints

- Read-only projections only
- No schema changes
- No AI dependencies
- Deterministic builders only
