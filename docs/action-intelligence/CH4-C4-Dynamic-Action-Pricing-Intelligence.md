# CH4-C4 — AN ACT Dynamic Action Pricing Intelligence

Deterministic, explainable price ranges derived from CH4-C3 action plans.

## Chain

```
Intent → Canonical Action → Action Plan → Dynamic Pricing → Contract → Execution
```

## Module

- Path: `src/dynamic-pricing/`
- Factory: `createDynamicPricingModule()`
- Bootstrap key: `dynamicPricing`
- Service: `DynamicPricingService`

## Pricing Model

Pricing consumes a read-only **ActionPlan** from CH4-C3 (via `DynamicPricingRepository` + `ActionPlanBuilder`) and produces a **PricingRecommendation** with:

| Output | Description |
|--------|-------------|
| `recommended_range` | Min/max/midpoint in SAR |
| `confidence` | Level, score, rationale, data completeness |
| `breakdown` | 14 traceable pricing factors |
| `explanation` | Human-readable narratives per influence area |

### Pricing Factors

1. Planning complexity (score)
2. Number of stages
3. Number of tasks
4. Estimated timeline (category hourly rate)
5. Required skills
6. Required resources
7. Parallel execution opportunities (discount)
8. Sequential bottlenecks (dependencies)
9. Risk level (canonical risk signals)
10. Urgency multiplier
11. Distance band multiplier
12. Trust recommendation premium
13. Market category anchor
14. Difficulty level (from complexity score)

Reference values live in `domain/pricing-reference-values.ts` (read-only). C1-aligned market anchors are stored in `DynamicPricingRepository`.

## API Endpoints

All routes require authentication (`authRequired: true`).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dynamic-pricing` | Pricing home |
| GET | `/dynamic-pricing/range` | Recommended price range + confidence |
| GET | `/dynamic-pricing/breakdown` | Factor breakdown + complexity |
| GET | `/dynamic-pricing/explanation` | Human-readable explanation |
| GET | `/dynamic-pricing/summary` | Compact pricing summary |
| GET | `/dynamic-pricing/validate` | Validation report |

Query parameters: `scenario_id`, `canonical_action_id`, `urgency` (`standard`|`priority`|`urgent`), `distance_band` (`local`|`regional`|`remote`), `intent`.

## Pricing Scenarios

| Scenario ID | Canonical Action | C1 Category |
|-------------|------------------|-------------|
| `moving_a_room` | `act.move.room_contents` | moving |
| `cleaning_an_apartment` | `act.clean.apartment_full` | cleaning |
| `delivering_a_document` | `act.deliver.document_secure` | delivery |
| `fixing_small_home_issue` | `act.maint.fix_minor_issue` | maintenance |
| `preparing_professional_service_request` | `act.pro.prepare_service_request` | professional (deferred) |

## Integration

- **CH4-C1**: Scenario IDs reused via `c3-pricing-bridge` → `PLANNING_SCENARIO_TO_CANONICAL`
- **CH4-C2**: Canonical actions loaded through `ActionPlanningRepository` / ontology repo
- **CH4-C3**: Plans built with `ActionPlanBuilder` — no duplicated planning logic

Bootstrap registration:

- `bootstrap/intelligence.ts` — `createDynamicPricingModule()`
- `bootstrap/dependencies.ts` — `IntelligenceDependencies.dynamicPricing`
- `bootstrap/routes.ts` — `registerDynamicPricingRoutes`

## Verification

```bash
npm run verify:ch4-c4
```

## Guarantees

- Read-only (no DB writes, no mutations)
- Deterministic (fixed timestamp, stable formulas)
- Explainable (every factor has a trace string)
- No payment execution, contract creation, or trust mutations
- Import-lint compliant
