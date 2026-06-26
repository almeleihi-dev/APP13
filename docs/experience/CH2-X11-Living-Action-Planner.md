# CH2-X11 — Living Action Planner Experience

## Mission

Build the Living Action Planner Experience — where professional recommendations become executable daily plans.

**The planner never executes marketplace actions automatically.** The user always decides. Experience only.

## Philosophy

Knowing is not enough. Planning is not enough. Professional growth happens through consistent execution. Every user should wake up with a clear plan.

## Architecture

```
src/living-experience/action-planner/
  domain/
    planner-schema.ts
    planner-context.ts
    planner-sections.ts
    planner-experience.ts
  application/
    living-action-planner-service.ts
    planner-collector.ts
  infrastructure/
    living-action-planner-repository.ts
```

Routes use `/living-action-planner/*`.

## Layout (13 Sections)

1. Today's Mission — exactly one mission with why and expected impact
2. Today's Action Plan — ordered actions with effort, dependencies, value
3. Priority Timeline — morning, afternoon, evening execution order
4. Professional Checklist — tasks, documents, certificates, evidence
5. Required Preparation — skills, tools, partners, location, requirements
6. Recommended Resources — learning, knowledge bank, experts, templates, government
7. Time Planner — duration, remaining time, flexible schedule, workload
8. Progress Tracker — completed, in progress, waiting, postponed, completion %
9. Completed Today — wins, evidence, knowledge, journey progress
10. Blocked Actions — explainable blockers with one recommended solution
11. Reschedule Planner — safe postponement with impact analysis
12. Tomorrow Queue — prepared priorities with one recommended first action
13. Execution History — daily archive, weekly/monthly trends, consistency

## Planner Rules

- Experience only — never execute contracts, spend money, or approve applications
- Never make decisions for the user
- Explain every recommendation and blocker
- Never executes automatically

## Geographic Intelligence

Adapts using country, city, working week, public holidays, professional regulations, and government services.

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/living-action-planner` | Full planner experience |
| GET | `/living-action-planner/sections` | All sections |
| GET | `/living-action-planner/mission` | Today's mission |
| GET | `/living-action-planner/action-plan` | Today's action plan |
| GET | `/living-action-planner/timeline` | Priority timeline |
| GET | `/living-action-planner/checklist` | Professional checklist |
| GET | `/living-action-planner/preparation` | Required preparation |
| GET | `/living-action-planner/resources` | Recommended resources |
| GET | `/living-action-planner/time` | Time planner |
| GET | `/living-action-planner/progress` | Progress tracker |
| GET | `/living-action-planner/completed` | Completed today |
| GET | `/living-action-planner/blocked` | Blocked actions |
| GET | `/living-action-planner/reschedule` | Reschedule planner |
| GET | `/living-action-planner/tomorrow` | Tomorrow queue |
| GET | `/living-action-planner/history` | Execution history |
| POST | `/living-action-planner/complete` | Record user-completed action |
| POST | `/living-action-planner/postpone` | Record user-postponed action |
| POST | `/living-action-planner/refresh` | Refresh experience |
| GET | `/living-action-planner/statistics` | Platform admin only |

## Verification

```bash
npm run verify:ch2-x11
```

Chains CH2-X10 regression, CH2-X11 tests, build, and import lint.
