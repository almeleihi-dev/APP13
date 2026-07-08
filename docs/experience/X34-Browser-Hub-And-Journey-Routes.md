# X34 Browser Hub & Journey Routes

**Date:** 2026-06-20  
**Scope:** Browser hub and journey HTML route expansion (X34)  
**Status:** Complete

## Summary

X34 extends the X32/X33 browser surface by wiring remaining high-priority X31 entry points and unwired UI page renderers into public HTML routes. Operators and customers can browse role hubs (`/home`, `/provider`, `/customer`) and journey surfaces (`/contracts`, `/marketplace/results`, execution, trust, and dispute dashboards) without changing domain or experience services.

## Architecture

```
Browser request
  → browser surface service
      browser-hub-fixtures (sync MVP workflow/provider snapshots)
      existing UI page renderers under src/ui/pages
      buildBrowserDocumentHtml (shared shell + /browser asset links)
  → text/html response (synchronous, no outbound HTTP)
```

## Deliverables

| Deliverable | Path |
|---|---|
| Hub fixtures | `src/browser-surface/domain/browser-hub-fixtures.ts` |
| Hub page shells | `src/browser-surface/domain/browser-hub-pages.ts` |
| Service extensions | `src/browser-surface/application/browser-surface-service.ts` |
| Routes | `src/api/routes/browser-surface.ts` |
| Tests | `test/x34-browser-hub-routes.test.ts` |
| Verify script | `scripts/verify-x34.sh` |

## Browser Routes

| Route | Auth | Renderer | Purpose |
|---|---|---|---|
| `GET /home` | Public | `renderPlatformHomePage` | Authenticated home hub entry |
| `GET /contracts` | Public | `renderContractSummaryPage` | Contract journey surface |
| `GET /marketplace/results` | Public | `renderMarketplaceResultsPage` | Marketplace results demo |
| `GET /provider` | Public | `renderProviderDashboardPage` | Provider command center |
| `GET /customer` | Public | `renderCustomerHubPage` | Customer hub shell |
| `GET /execution/dashboard` | Public | `renderExecutionDashboardPage` | Execution dashboard |
| `GET /trust/center` | Public | `renderTrustCenterPage` | Trust center |
| `GET /disputes/dashboard` | Public | `renderDisputeDashboardPage` | Dispute dashboard |

X32–X33 routes remain unchanged.

## Boundaries

- Uses synchronous MVP fixture snapshots via workflow and provider intelligence (no DB, HTTP, or Redis in render path)
- Does not modify experience domain services or business rules
- Public routes set `authenticate: false` so session cookie lookup cannot block HTML delivery
- Hub shells and cross-links live in `src/browser-surface/domain` only

## Verification

```bash
npm run verify:x34
```

Chains `verify:x33`, X34 tests, build, and import lint.

## Relationship to X31, X32, and X33

X31 Executive UX Readiness Center detects:

- HTML entry routes for `/home`, `/contracts`, `/provider`, and `/customer`
- wired UI page modules previously listed as unwired in the entry-point audit

X32 established the browser HTML shell; X33 added marketplace/login entry and static assets; X34 completes the hub and journey browser route baseline.
