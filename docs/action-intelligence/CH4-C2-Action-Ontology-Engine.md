# CH4-C2 — Action Ontology Engine

Chapter 4 canonical action vocabulary layer for AN ACT.

## Principle

Any user intent maps through:

**Raw Intent → Canonical Action → Action Category → Action Type → Required Skills → Required Resources → Preconditions → Risks → Evidence → Contract Hints → Execution Hints → Trust Signals**

This engine is **read-only** and provides the shared vocabulary for all future intelligence layers.

## Module

- Path: `src/action-ontology/`
- Factory: `createActionOntologyModule()`
- Service: `ActionOntologyService`
- Bootstrap key: `actionOntology`

## CH4-C1 Integration

CH4-C1 scenario IDs map to canonical actions via `c1-ontology-bridge.ts`:

| C1 Scenario | Canonical Action |
|-------------|------------------|
| `moving_a_room` | `act.move.room_contents` |
| `cleaning_an_apartment` | `act.clean.apartment_full` |
| `delivering_a_document` | `act.deliver.document_secure` |
| `fixing_small_home_issue` | `act.maint.fix_minor_issue` |
| `preparing_professional_service_request` | `act.pro.prepare_service_request` |

Query ontology endpoints with `?scenario_id=` to resolve C1 decomposition to canonical vocabulary.

## API Endpoints

All routes require authentication.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/action-ontology` | Ontology home + family catalog |
| GET | `/action-ontology/actions` | Canonical actions (filter by `family`, `action_id`, `scenario_id`) |
| GET | `/action-ontology/relationships` | Action relationships |
| GET | `/action-ontology/validate` | Catalog validation report |
| GET | `/action-ontology/summary` | Full ontology summary with C1 links |

## Seed Action Families

1. Moving
2. Cleaning
3. Delivery
4. Maintenance
5. Professional service request
6. Documentation / evidence
7. Inspection / verification
8. Scheduling / coordination
9. Pricing / estimation
10. Contract preparation

## Verification

```bash
npm run verify:ch4-c2
```

## Guarantees

- Read-only, deterministic seed catalog
- No database schema changes
- No business logic mutations
- CH4-C1 behavior unchanged (bridge only)
