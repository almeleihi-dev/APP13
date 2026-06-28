# CH4-C5 — AN ACT Contract Intelligence Engine

Transforms CH4-C4 dynamic pricing output into complete, deterministic, read-only contract recommendations.

## Chain

```
Intent → Canonical Action → Action Plan → Dynamic Pricing → Contract Intelligence → Execution
```

## Module

- Path: `src/contract-intelligence/`
- Factory: `createContractIntelligenceEngineModule()`
- Bootstrap key: `contractIntelligenceEngine`
- Service: `ContractIntelligenceEngineService`

> Note: Distinct from legacy `contractIntelligence` (AI contract generation at `/ai/contracts`).

## Architecture

| Layer | Components |
|-------|------------|
| **Domain** | Schema, context types, reference values, screens |
| **Application** | Service, structure/parties/milestone/payment/clause builders, confidence, explanation, validator |
| **Infrastructure** | `ContractIntelligenceRepository` — delegates to C4 pricing + C3 plan building |

## Delegation Model

- **CH4-C4**: Pricing range and confidence via `DynamicPricingService.getRange()`
- **CH4-C3**: Action plan via `DynamicPricingRepository.buildPlanFromContext()`
- **CH4-C2**: Canonical actions, risk signals, evidence, contract hints
- **CH4-C1**: Scenario IDs via `c4-contract-bridge` → `PLANNING_SCENARIO_TO_CANONICAL`

No planning, ontology, or pricing logic is duplicated.

## Contract Recommendation Outputs

- Recommended contract type
- Contract structure (8 standard sections)
- Required parties (customer, provider, platform)
- Roles and responsibilities
- Deliverables
- Milestones (aligned to plan stages)
- Acceptance criteria
- Required evidence
- Payment recommendation (linked to C4 pricing ID)
- Escrow recommendation
- Risk, cancellation, and warranty clauses
- Required approvals (from plan decision points)
- Estimated execution terms
- Contract confidence score
- Human-readable explanation

## API Endpoints

All routes require authentication.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/contract-intelligence` | Home + scenario catalog |
| GET | `/contract-intelligence/recommendation` | Full contract recommendation |
| GET | `/contract-intelligence/structure` | Contract type + structure |
| GET | `/contract-intelligence/parties` | Parties + deliverables |
| GET | `/contract-intelligence/milestones` | Milestones + acceptance + execution terms |
| GET | `/contract-intelligence/explanation` | Human-readable explanation |
| GET | `/contract-intelligence/summary` | Compact summary |
| GET | `/contract-intelligence/validate` | Validation report |

Query parameters: `scenario_id`, `canonical_action_id`, `urgency`, `distance_band`, `intent`.

## Scenarios

Same five scenarios as C1–C4: moving, cleaning, delivery, maintenance, professional service request.

## Verification

```bash
npm run verify:ch4-c5
```

## Guarantees

- Read-only — no DB writes, no contract creation, no payment execution
- Delegates-only — upstream engines provide plan and pricing data
- Deterministic — fixed timestamp, stable builders
- No trust mutations
- Import-lint compliant
