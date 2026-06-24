# X38 Operator Experience Integrity Center

**Date:** 2026-06-20  
**Scope:** Read-only operator experience integrity projection (X38)  
**Status:** Complete

## Summary

X38 answers **“When a platform operator uses APP13’s hybrid browser HTML and JSON experience surfaces together, are those surfaces consistent, appropriately bounded, and trustworthy for operational decisions?”** After X37 validates navigability, X38 measures auth boundary clarity, data mode disclosure, workflow parity, journey integrity, and X31–X37 stack alignment. The experience is read-only, deterministic, has no AI dependencies, requires no schema changes, and enforces `platform_admin` access.

## Architecture

```
Authenticated platform_admin
  → operator experience integrity repository snapshot
      X37 operator surface navigation raw snapshot
      + browser-surface route/auth config sources
      + experience JSON route auth sources
      + browser HTML fixture/disclosure signals
  → X38 integrity builders
  → OperatorExperienceIntegrityCenterView
```

## Deliverables

| Deliverable | Path |
|---|---|
| Domain | `src/experience/operator-experience-integrity/domain/operator-experience-integrity.ts` |
| Service | `src/experience/operator-experience-integrity/application/operator-experience-integrity-service.ts` |
| Repository | `src/experience/operator-experience-integrity/infrastructure/operator-experience-integrity-repository.ts` |
| Module factory | `createOperatorExperienceIntegrityModule(db)` |
| Routes | `src/api/routes/operator-experience-integrity.ts` |
| Tests | `test/x38-operator-experience-integrity.test.ts` |
| Verify script | `scripts/verify-x38.sh` |

## Core Views

| View | Contents |
|---|---|
| Integrity overview | Score, status, public browser routes, JSON centers, disclosed fixtures, workflow pairs |
| Auth boundary audit | Public HTML vs authenticated JSON boundaries and hybrid conflicts |
| Data mode audit | Fixture vs live signals and disclosure markers in browser HTML |
| Workflow parity map | Browser workflow routes paired with JSON experience counterparts |
| Journey integrity audit | X37 journeys re-scored with per-step integrity checks |
| X-stack alignment | X31 browser_ready + X36 completeness + X37 navigation + integrity gates |
| Recommendations | Immediate, next-layer, and production integrity actions |
| Integrity score | Weighted 0–100 composite |

## Integrity Status Tiers

| Status | Meaning |
|---|---|
| `integrity_ready` | Score ≥85 with no hybrid auth conflicts |
| `developing` | Score ≥60 with partial integrity coverage |
| `attention_required` | Missing disclosure, parity, or boundary clarity |

## Integrity Score Weights

| Dimension | Weight |
|---|---|
| Auth boundary clarity | 25% |
| Data mode disclosure | 25% |
| Workflow parity coverage | 20% |
| Journey integrity | 15% |
| X31–X37 stack alignment | 15% |

## Routes

All routes require authenticated `platform_admin` access:

- `GET /operator-experience-integrity`
- `GET /operator-experience-integrity/overview`
- `GET /operator-experience-integrity/auth-boundaries`
- `GET /operator-experience-integrity/data-modes`
- `GET /operator-experience-integrity/workflow-parity`
- `GET /operator-experience-integrity/journey-integrity`
- `GET /operator-experience-integrity/x-stack-alignment`
- `GET /operator-experience-integrity/recommendations`
- `GET /operator-experience-integrity/score`

## Verification

```bash
npm run verify:x38
```

Chains `verify:x37`, X38 tests, build, and import lint.

## Relationship to X31–X37

X38 composes the X37 snapshot (which includes X36 and X31 signals) and adds hybrid integrity analysis that neither navigation nor completeness centers measure alone.
