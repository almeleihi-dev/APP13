# X31 Executive UX Readiness Center

**Date:** 2026-06-20  
**Scope:** Read-only executive UX readiness projection (X31)  
**Status:** Complete

## Summary

X31 answers **“Is APP13 ready to be experienced by a human operator through a real browser/user-facing surface?”** by auditing the repository for frontend vs API-only surfaces, browser-usable routes, missing entry points, and readiness tiers (`api_ready`, `operator_ready`, `browser_ready`). The experience is read-only, deterministic, has no AI dependencies, requires no schema changes, and enforces `platform_admin` access.

## Architecture

```
Authenticated platform_admin
  → executive UX readiness repository snapshot
      server.ts + package.json + route sources + src/ui/pages
  → X31 executive UX readiness builders
  → ExecutiveUxReadinessCenterView
```

## Repository Sources

X31 inspects filesystem sources only (no upstream experience composition):

| Source | Purpose |
|---|---|
| `src/api/server.ts` | Registered route functions, static/HTML wiring |
| `package.json` | SPA framework and static hosting dependencies |
| `src/api/routes/**` | Route handlers, JSON vs HTML response patterns |
| `src/ui/pages/**` | HTML page renderer modules and wiring status |

## Deliverables

| Deliverable | Path |
|---|---|
| Domain | `src/experience/executive-ux-readiness/domain/executive-ux-readiness.ts` |
| Service | `src/experience/executive-ux-readiness/application/executive-ux-readiness-service.ts` |
| Repository | `src/experience/executive-ux-readiness/infrastructure/executive-ux-readiness-repository.ts` |
| Module factory | `createExecutiveUxReadinessModule(db)` |
| Routes | `src/api/routes/executive-ux-readiness.ts` |
| Tests | `test/x31-executive-ux-readiness.test.ts` |
| Verify script | `scripts/verify-x31.sh` |

## Core Views

| View | Contents |
|---|---|
| UX readiness overview | Readiness score, surface kind, highest tier, tier booleans |
| Surface detection | SPA/static/HTML signals, UI page module count, wiring status |
| Route browser audit | JSON API vs HTML-serving vs potential entry GET routes |
| Entry point audit | Missing/partial/present browser entry points, wired/unwired UI pages |
| Readiness classification | `api_ready`, `operator_ready`, `browser_ready` assessments |
| UX recommendations | Immediate, next-layer, and production actions |
| UX readiness score | Weighted 0–100 composite |

## Readiness Tiers

| Tier | Meaning |
|---|---|
| `api_ready` | Health endpoint and sufficient registered API routes for programmatic operation |
| `operator_ready` | Platform_admin JSON experience centers plus UI page renderer modules exist |
| `browser_ready` | HTML routes or static hosting wired with browser entry points |

## Surface Classification

| Kind | Meaning |
|---|---|
| `api_only` | JSON API backend without browser HTML integration |
| `hybrid_json` | UI page modules or SPA deps exist but are not fully wired to HTTP |
| `browser_ready` | HTML routes, static hosting, or wired SPA surface detected |

## UX Readiness Score Weights

| Dimension | Weight |
|---|---|
| API readiness | 25% |
| Operator readiness | 25% |
| Browser readiness | 20% |
| Route usability | 15% |
| Entry points | 15% |

## Routes

All routes require authenticated `platform_admin` access:

- `GET /executive-ux-readiness`
- `GET /executive-ux-readiness/overview`
- `GET /executive-ux-readiness/surface`
- `GET /executive-ux-readiness/routes`
- `GET /executive-ux-readiness/entry-points`
- `GET /executive-ux-readiness/classification`
- `GET /executive-ux-readiness/recommendations`
- `GET /executive-ux-readiness/score`

## Verification

```bash
npm run verify:x31
```

Chains `verify:x30`, X31 tests, build, and import lint.

## Current APP13 Posture (after X32)

After X32 browser surface wiring, APP13 classifies as:

- **api_ready:** yes (health + extensive JSON API)
- **operator_ready:** yes (JSON experience centers + wired UI page modules)
- **browser_ready:** yes (`GET /` and `GET /operator/dashboard` serve HTML via existing page renderers)

The operator dashboard links to X28–X31 JSON experience centers for authenticated platform_admin inspection.
