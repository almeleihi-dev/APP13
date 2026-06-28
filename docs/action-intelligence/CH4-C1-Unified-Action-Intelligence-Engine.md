# CH4-C1 — Unified Action Intelligence Engine

Chapter 4 core intelligence layer that interprets user intent as executable actions.

## Principle

Every user request, goal, service, job, complaint, or project is interpreted through:

**Goal → Actions → Resources → Skills → Time → Risk → Price → Contract → Execution → Trust**

This engine is **read-only**. It does not execute contracts, create payments, mutate trust, or change runtime state.

## Module

- Path: `src/unified-action-intelligence/`
- Factory: `createUnifiedActionIntelligenceModule()`
- Service: `UnifiedActionIntelligenceService`
- Bootstrap key: `unifiedActionIntelligence`

## API Endpoints

All routes require authentication (`authRequired: true`).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/action-intelligence` | Intelligence home with scenario catalog |
| GET | `/action-intelligence/decomposition` | Action decomposition for intent or scenario |
| GET | `/action-intelligence/execution-path` | Execution path with contract/trust/price hints |
| GET | `/action-intelligence/risks` | Risk signals for the classified scenario |
| GET | `/action-intelligence/summary` | Full intelligence summary |
| GET | `/action-intelligence/validate` | Validation report for decomposition completeness |

Query parameters: `scenario_id`, `intent`, or `raw_text`.

## Sample Scenarios

1. `moving_a_room` — Move furniture and belongings between rooms
2. `cleaning_an_apartment` — Full apartment cleaning workflow
3. `delivering_a_document` — Secure document delivery with proof
4. `fixing_small_home_issue` — Minor home maintenance repair
5. `preparing_professional_service_request` — Structured service request preparation

## Verification

```bash
npm run verify:ch4-c1
```

## Guarantees

- Read-only intelligence
- Deterministic seed scenarios
- No database schema changes
- No business logic mutations
- Import-lint compliant bootstrap integration
