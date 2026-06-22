# X20 APP13 Strategic Operating System

**Date:** 2026-06-19  
**Scope:** Read-only strategic operating system projection (X20)  
**Status:** Complete

## Summary

X20 aggregates X14–X19 platform intelligence into one deterministic decision layer for APP13 leadership. It answers: **What are the most important strategic decisions APP13 leadership should take now?** The experience exposes strategic priorities, risks, opportunities, executive decision briefs, scale goals, operating cadence, action plans, and a weighted strategic operating score without schema changes or AI dependencies.

## Architecture

```
Authenticated platform_admin
  → strategic operating repository snapshot
      X19 government partnership raw snapshot (X18 → X17 → X16 → X15 → X14 + analytics)
  → X20 strategic operating builders
  → StrategicOperatingSystemView
```

## Deliverables

| Deliverable | Path |
|---|---|
| Domain | `src/experience/strategic-operating-system/domain/strategic-operating-system.ts` |
| Service | `src/experience/strategic-operating-system/application/strategic-operating-service.ts` |
| Repository | `src/experience/strategic-operating-system/infrastructure/strategic-operating-repository.ts` |
| Module factory | `createStrategicOperatingModule(db)` |
| Routes | `src/api/routes/strategic-operating-system.ts` |
| Tests | `test/x20-strategic-operating-system.test.ts` |
| Verify script | `scripts/verify-x20.sh` |

## Core Views

| View | Contents |
|---|---|
| Strategic overview | Strategic readiness, release, executive, simulation, investor, government, and marketplace scores |
| Strategic priority engine | Top priorities from launch blockers, marketplace gaps, simulation bottlenecks, investor/government gaps, financial and trust risks |
| Strategic risk register | Launch, marketplace, trust, financial, operational, infrastructure, investor, and government risks |
| Strategic opportunity map | Marketplace growth, provider supply, revenue, trust, investor, government, insurance, and workforce opportunities |
| Executive decision brief | Top 5 decisions with why now, expected effect, dependency, and urgency |
| Strategic goals | Readiness at 10k, 100k, 1m, and 10m users with blocking factors and confidence |
| Operating cadence | Daily, weekly, monthly, and quarterly metrics, decisions, alerts, and owner roles |
| Strategic action plan | Actions grouped by immediate, this week, this month, and this quarter |
| Strategic scorecard | Weighted release, marketplace, executive, simulation, investor, government, and trust-financial scores |
| Strategic operating score | Weighted composite across all dimensions |

## Strategic Operating Score Weights

| Dimension | Weight |
|---|---|
| Release readiness | 15% |
| Marketplace health | 15% |
| Executive health | 15% |
| Simulation readiness | 15% |
| Investor readiness | 15% |
| Government readiness | 15% |
| Trust and financial health | 10% |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/strategic-operating-system` | Full strategic operating system |
| `GET` | `/strategic-operating-system/overview` | Strategic overview |
| `GET` | `/strategic-operating-system/priorities` | Strategic priority engine |
| `GET` | `/strategic-operating-system/risks` | Strategic risk register |
| `GET` | `/strategic-operating-system/opportunities` | Strategic opportunity map |
| `GET` | `/strategic-operating-system/decision-brief` | Executive decision brief |
| `GET` | `/strategic-operating-system/goals` | Strategic goals view |
| `GET` | `/strategic-operating-system/cadence` | Operating cadence view |
| `GET` | `/strategic-operating-system/action-plan` | Strategic action plan |
| `GET` | `/strategic-operating-system/scorecard` | Strategic scorecard |

All endpoints require `platform_admin` role. Strategic operating score is included in the full system response.

## Verification

```bash
npm run test:x20-strategic-operating-system
npm run verify:x20
```

`verify:x20` runs the X19 regression suite, X20 tests, build, and import lint.

## Constraints

- Read-only projections only
- No schema changes
- No AI dependencies
- Deterministic builders only
