# X33 Browser Entry & Static Delivery

**Date:** 2026-06-20  
**Scope:** Browser entry route expansion and static asset delivery (X33)  
**Status:** Complete

## Summary

X33 extends the X32 browser surface with additional public HTML entry routes and cached static asset delivery. Operators and customers can browse `/marketplace` and `/login` in a real browser, and all browser HTML pages share stylesheet, favicon, and manifest assets served from `/browser/*`.

## Architecture

```
Browser request
  → HTML entry routes (browser surface service)
      existing UI page renderers + login shell
      buildBrowserDocumentHtml (shared shell + /browser asset links)
  → static asset routes (@fastify/static)
      public/browser/*
  → text/html or asset response (synchronous, no outbound HTTP)
```

## Deliverables

| Deliverable | Path |
|---|---|
| Static domain | `src/browser-static/domain/browser-static.ts` |
| Static service | `src/browser-static/application/browser-static-service.ts` |
| Static module factory | `createBrowserStaticModule()` |
| Static routes | `src/api/routes/browser-static.ts` |
| Entry route extensions | `src/api/routes/browser-surface.ts` |
| Public assets | `public/browser/*` |
| Tests | `test/x33-browser-entry-static.test.ts` |
| Verify script | `scripts/verify-x33.sh` |

## Browser Routes

| Route | Auth | Renderer / Asset | Purpose |
|---|---|---|---|
| `GET /marketplace` | Public | `renderMarketplaceSearchPage` | Marketplace discovery entry |
| `GET /login` | Public | `renderLoginSurfacePage` | Sign-in HTML shell |
| `GET /browser/app.css` | Public | static file | Shared browser stylesheet |
| `GET /browser/favicon.svg` | Public | static file | Favicon |
| `GET /browser/manifest.webmanifest` | Public | static file | Web manifest |

X32 routes (`GET /`, `GET /operator/dashboard`) remain unchanged and now include static asset links in the HTML shell.

## Boundaries

- Uses existing `src/ui/pages/marketplace-search.ts` renderer for marketplace HTML
- Login shell is display-only HTML; authentication remains on existing JSON auth routes
- Static assets are served with `@fastify/static` under `/browser/` prefix
- Public routes and static paths skip session authentication to avoid Redis blocking
- Does not modify experience domain services or business rules

## Verification

```bash
npm run verify:x33
```

Chains `verify:x32`, X33 tests, build, and import lint.

## Relationship to X31 and X32

X31 Executive UX Readiness Center detects:

- additional HTML entry routes for `/marketplace` and `/login`
- static hosting via `@fastify/static` registration
- wired marketplace UI page renderer references from browser surface

X32 established the browser HTML shell; X33 completes the immediate browser entry expansion and production static asset baseline recommended by X31.
