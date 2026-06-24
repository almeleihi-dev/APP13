# X32 Browser Surface Wiring

**Date:** 2026-06-20  
**Scope:** Thin HTML route adapters for existing UI page renderers (X32)  
**Status:** Complete

## Summary

X32 wires existing `src/ui/pages` renderers into real browser-accessible HTML routes so a human operator can open APP13 in a browser and see the first platform surface. The layer adds thin HTTP adapters only; domain, application, and business logic remain unchanged.

## Architecture

```
Browser request
  → browser surface service
      MVP platform fixture snapshot (read-only UI source)
      create*PageModel + render*Page (existing UI page renderers)
      buildBrowserDocumentHtml (X32 shell + navigation)
  → text/html response (synchronous, no outbound HTTP)
```

## Deliverables

| Deliverable | Path |
|---|---|
| Domain shell | `src/browser-surface/domain/browser-surface.ts` |
| Service | `src/browser-surface/application/browser-surface-service.ts` |
| Module factory | `createBrowserSurfaceModule()` |
| Routes | `src/api/routes/browser-surface.ts` |
| Tests | `test/x32-browser-surface.test.ts` |
| Verify script | `scripts/verify-x32.sh` |

## Browser Routes

| Route | Auth | Renderer | Purpose |
|---|---|---|---|
| `GET /` | Public | `renderPlatformHomePage` | Browser platform home |
| `GET /operator/dashboard` | Public | `renderPlatformOverviewPage` | Operator dashboard shell |

Both routes return `text/html; charset=utf-8`.

## Operator Experience Links

The operator dashboard includes links to authenticated JSON experience centers:

| Layer | Route |
|---|---|
| X31 | `/executive-ux-readiness` |
| X30 | `/business-intelligence` |
| X29 | `/post-launch-monitoring` |
| X28 | `/launch-control` |

These remain JSON API endpoints requiring `platform_admin` authentication when invoked directly.

## Boundaries

- Uses existing `MVP_PLATFORM_HOME_SOURCE` fixture snapshots for page models (no DB, HTTP, or Redis in the render path)
- Does not modify experience domain services or business rules
- Public routes set `authenticate: false` so session cookie lookup cannot block HTML delivery
- HTML shell and navigation live in `src/browser-surface/domain` only

## Verification

```bash
npm run verify:x32
```

Chains `verify:x31`, X32 tests, build, and import lint.

## Relationship to X31

X31 Executive UX Readiness Center detects wired HTML routes and UI page imports from `browser-surface.ts`. After X32, APP13 should classify as `browser_ready` with a present `/` entry point.
