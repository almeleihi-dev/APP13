# CH4-C3 — Action Planning Engine

Chapter 4 planning layer that transforms canonical actions into executable read-only plans.

## Principle

**Intent → Canonical Action → Action Plan → Execution Stages → Dependencies → Resources → Timeline → Decision Points → Completion Criteria**

## Module

- Path: `src/action-planning/`
- Factory: `createActionPlanningModule()`
- Service: `ActionPlanningService`
- Bootstrap key: `actionPlanning`

## Integration

- **CH4-C2**: Plans are built from canonical actions via `ActionOntologyRepository` (no duplicated ontology logic)
- **CH4-C1**: Planning scenarios reuse C1 scenario IDs via `c2-planning-bridge.ts`

## API Endpoints

All routes require authentication.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/action-planning` | Planning home + scenario catalog |
| GET | `/action-planning/plan` | Full action plan |
| GET | `/action-planning/timeline` | Estimated timeline |
| GET | `/action-planning/dependencies` | Dependency graph + parallel/sequential groups |
| GET | `/action-planning/completion` | Decision points + completion criteria |
| GET | `/action-planning/summary` | Planning summary |
| GET | `/action-planning/validate` | Plan or catalog validation |

Query parameters: `scenario_id`, `canonical_action_id`, or `intent`.

## Planning Scenarios

1. `moving_a_room`
2. `cleaning_an_apartment`
3. `delivering_a_document`
4. `fixing_small_home_issue`
5. `preparing_professional_service_request`

## Verification

```bash
npm run verify:ch4-c3
```

## Guarantees

- Read-only, deterministic plans
- No database, payment, contract execution, or trust mutations
- CH4-C1 and CH4-C2 behavior unchanged
