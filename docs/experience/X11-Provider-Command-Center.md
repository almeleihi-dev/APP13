# X11 Provider Command Center

**Date:** 2026-06-19  
**Scope:** Read-only provider command center projection (X11)  
**Status:** Complete

## Summary

X11 composes a provider-facing command center dashboard from S10 provider workspace data (revenue and contracts) and experience slices X7 (trust), X8 (opportunities), X9 (passport), X9.5 (seals economy), and X10 (live trust frame). All projections are deterministic with no schema changes and no AI dependencies.

## Architecture

```
Authenticated provider
  → provider command center repository snapshot
      S10 earnings + contracts + incoming offers
      X8 discoverable provider + open requests
      X7/X9/X9.5/X10 seals + platform context
  → X11 dashboard builders (overview, revenue, contracts, integrations)
  → ProviderCommandCenterView
```

## Deliverables

| Deliverable | Path |
|---|---|
| Domain | `src/experience/provider-command-center/domain/provider-command-center.ts` |
| Service | `src/experience/provider-command-center/application/provider-command-center-service.ts` |
| Repository | `src/experience/provider-command-center/infrastructure/provider-command-center-repository.ts` |
| Module factory | `createProviderCommandCenterModule(db, { trustScore, providerProfile })` |
| Routes | `src/api/routes/provider-command-center.ts` |
| Tests | `test/x11-provider-command-center.test.ts` |
| Verify script | `scripts/verify-x11.sh` |

## Features

| Feature | Description |
|---|---|
| Provider dashboard | Overview headline, next action, trust/frame/opportunity counts |
| Revenue summary | Released earnings, pending held, wallet balance from S10 |
| Contracts summary | Active/completed counts and recent contract highlights |
| X7 Trust integration | Trust overview embedded in command center |
| X8 Opportunities | Ranked open requests for the provider |
| X9 Passport | Passport level assessment |
| X9.5 Seals economy | Verification economy tier and seal points |
| X10 Live trust frame | Frame level, score breakdown, and top signals |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/provider-command-center` | Full provider command center |
| `GET` | `/provider-command-center/revenue` | Revenue summary |
| `GET` | `/provider-command-center/contracts` | Contracts summary |
| `GET` | `/provider-command-center/trust` | X7 trust integration |
| `GET` | `/provider-command-center/opportunities` | X8 opportunities integration |

Provider-only endpoints return 404 for non-providers.

## Verification

```bash
npm run test:x11-provider-command-center
npm run verify:x11
```

`verify:x11` runs the X10 regression suite, X11 tests, build, and import lint.

## Constraints

- Read-only projections only
- No schema changes
- No AI dependencies
- Deterministic builders only
