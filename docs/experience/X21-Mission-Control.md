# X21 Mission Control

**Date:** 2026-06-19  
**Scope:** Read-only executive mission control projection (X21)  
**Status:** Complete

## Summary

X21 consolidates X14–X20 platform intelligence into a single executive command surface that answers: **What is happening right now across APP13?** It exposes mission overview scores, top decisions, risks, opportunities, growth/government/investor/operations command panels, an executive action queue, and a weighted mission control score without schema changes or AI dependencies.

## Architecture

```
Authenticated platform_admin
  → mission control repository snapshot
      X20 strategic operating raw snapshot (X19 → X18 → X17 → X16 → X15 → X14 + analytics)
  → X21 mission control builders
  → MissionControlCenterView
```

## Deliverables

| Deliverable | Path |
|---|---|
| Domain | `src/experience/mission-control/domain/mission-control.ts` |
| Service | `src/experience/mission-control/application/mission-control-service.ts` |
| Repository | `src/experience/mission-control/infrastructure/mission-control-repository.ts` |
| Module factory | `createMissionControlModule(db)` |
| Routes | `src/api/routes/mission-control.ts` |
| Tests | `test/x21-mission-control.test.ts` |
| Verify script | `scripts/verify-x21.sh` |

## Core Views

| View | Contents |
|---|---|
| Mission overview | Mission score, strategic operating score, executive, release, marketplace, investor, and government scores |
| Top decisions panel | Top 5 decisions with urgency, expected impact, and source layer |
| Top risks panel | Top 10 risks with severity, probability, impact, and mitigation |
| Top opportunities panel | Ranked opportunities with value score, required action, and expected outcome |
| Growth command panel | User growth, provider growth, marketplace expansion, and simulation confidence |
| Government command panel | Top partnerships with readiness scores and required next actions |
| Investor command panel | Funding readiness, investor score, strategic strengths, and critical gaps |
| Operations command panel | Launch blockers, operational warnings, trust alerts, and escrow alerts |
| Executive action queue | Actions grouped by immediate, today, this week, and this month |
| Mission control score | Weighted strategic operating, release, executive, marketplace, investor, and government score |

## Mission Control Score Weights

| Dimension | Weight |
|---|---|
| Strategic operating score | 25% |
| Release readiness | 15% |
| Executive health | 15% |
| Marketplace health | 15% |
| Investor readiness | 15% |
| Government readiness | 15% |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/mission-control` | Full mission control center |
| `GET` | `/mission-control/overview` | Mission control overview |
| `GET` | `/mission-control/decisions` | Top decisions panel |
| `GET` | `/mission-control/risks` | Top risks panel |
| `GET` | `/mission-control/opportunities` | Top opportunities panel |
| `GET` | `/mission-control/growth` | Growth command panel |
| `GET` | `/mission-control/government` | Government command panel |
| `GET` | `/mission-control/investors` | Investor command panel |
| `GET` | `/mission-control/operations` | Operations command panel |
| `GET` | `/mission-control/action-queue` | Executive action queue |

All endpoints require `platform_admin` role. Mission control score is included in the full center response.

## Verification

```bash
npm run test:x21-mission-control
npm run verify:x21
```

`verify:x21` runs the X20 regression suite, X21 tests, build, and import lint.

## Constraints

- Read-only projections only
- No schema changes
- No AI dependencies
- Deterministic builders only
