# X37 Operator Surface Navigation Center

**Date:** 2026-06-20  
**Scope:** Read-only operator surface navigation projection (X37)  
**Status:** Complete

## Summary

X37 answers **“Can a platform operator navigate and execute operational workflows across APP13’s browser HTML surface and JSON experience centers?”** After X36 validates browser stack completeness, X37 measures hybrid-surface navigability: cross-links from browser operator surfaces to JSON centers, predefined operator journey reachability, orphan center detection, and X31–X36 stack alignment. The experience is read-only, deterministic, has no AI dependencies, requires no schema changes, and enforces `platform_admin` access.

## Why X37 Exists After X36

| Layer | Question answered |
|---|---|
| X31 | Is APP13 UX-ready for humans? |
| X32–X35 | Browser HTML delivery implementation |
| X36 | Is the browser stack complete and verified? |
| **X37** | **Can operators actually navigate and run workflows across JSON + browser surfaces?** |

X36 confirms the browser stack is built; X37 confirms operators can **orchestrate** across hybrid surfaces without dead ends. It does not duplicate X27 (live ops metrics), X24 (API audit), or X36 (browser completeness).

## Architecture

```
Authenticated platform_admin
  → operator surface navigation repository snapshot
      X36 browser completeness raw snapshot (includes X31 UX readiness)
      + browser-surface cross-link sources
      + operator JSON experience route sources
  → X37 navigation builders
  → OperatorSurfaceNavigationCenterView
```

## Deliverables

| Deliverable | Path |
|---|---|
| Domain | `src/experience/operator-surface-navigation/domain/operator-surface-navigation.ts` |
| Service | `src/experience/operator-surface-navigation/application/operator-surface-navigation-service.ts` |
| Repository | `src/experience/operator-surface-navigation/infrastructure/operator-surface-navigation-repository.ts` |
| Module factory | `createOperatorSurfaceNavigationModule(db)` |
| Routes | `src/api/routes/operator-surface-navigation.ts` |
| Tests | `test/x37-operator-surface-navigation.test.ts` |
| Verify script | `scripts/verify-x37.sh` |

## Core Views

| View | Contents |
|---|---|
| Navigation overview | Score, status, linked/orphan JSON centers, ready journeys |
| Surface map | Operator JSON centers and browser anchor routes with reachability |
| Cross-link audit | Browser-to-JSON link coverage from operator surfaces |
| Operator journeys | Predefined runbooks (UX validation, launch review, ops triage, etc.) |
| Orphan centers | JSON experience centers not linked from browser operator surfaces |
| X-stack alignment | X31 browser_ready + X36 completeness + cross-link reconciliation |
| Recommendations | Immediate, next-layer, and production navigation actions |
| Navigation score | Weighted 0–100 composite |

## Operator Journeys

| Journey | Purpose |
|---|---|
| `ux_validation` | X31 → X36 → browser catalog → operator dashboard |
| `launch_review` | Launch control → business intelligence → post-launch monitoring |
| `ops_triage` | Platform operations → post-launch monitoring → execution/dispute dashboards |
| `production_gate` | Production → security → release readiness |
| `executive_briefing` | Mission control → executive experience → business intelligence |

## Navigation Score Weights

| Dimension | Weight |
|---|---|
| Cross-link coverage | 25% |
| Journey completeness | 25% |
| Orphan center inverse | 20% |
| Browser anchor reachability | 15% |
| X31–X36 stack alignment | 15% |

## Routes

All routes require authenticated `platform_admin` access:

- `GET /operator-surface-navigation`
- `GET /operator-surface-navigation/overview`
- `GET /operator-surface-navigation/surface-map`
- `GET /operator-surface-navigation/cross-links`
- `GET /operator-surface-navigation/journeys`
- `GET /operator-surface-navigation/orphan-centers`
- `GET /operator-surface-navigation/x-stack-alignment`
- `GET /operator-surface-navigation/recommendations`
- `GET /operator-surface-navigation/score`

## Verification

```bash
npm run verify:x37
```

Chains `verify:x36`, X37 tests, build, and import lint.

## Relationship to X31–X36

X37 composes X36 (and therefore X31) snapshots and adds operator navigability analysis. It surfaces actionable gaps—such as JSON centers reachable via API but not linked from the browser operator dashboard—that neither X31 nor X36 measure.
