# CH4-C7 — AN ACT Outcome Intelligence Engine

Evaluates expected and projected completion outcomes, closing the primary AN ACT intelligence loop.

## Chain

```
Intent → Canonical Action → Action Plan → Dynamic Pricing → Contract Intelligence → Execution Intelligence → Outcome Intelligence
```

## Module

- Path: `src/outcome-intelligence/`
- Factory: `createOutcomeIntelligenceEngineModule()`
- Bootstrap key: `outcomeIntelligenceEngine`
- Service: `OutcomeIntelligenceEngineService`

## Delegation Model

| Upstream | Role |
|----------|------|
| **CH4-C6** | Execution guidance via `ExecutionIntelligenceEngineService` (roadmap, sequencing, checkpoints, acceptance, explanation) |
| **CH4-C5–C1** | Contract, plan, canonical action via `ExecutionIntelligenceRepository` chain |

No planning, pricing, contract, execution, or ontology logic is duplicated.

## Outcome Evaluation Outputs

- Expected outcomes (goal, deliverables, acceptance criteria, canonical evidence)
- Completion outcome model (structural readiness projection)
- Success criteria evaluations
- Outcome quality assessment
- Deliverable verification summaries
- Milestone completion summaries
- Goal achievement analysis
- Variance analysis (expected vs actual-ready model)
- Improvement recommendations
- Lessons learned
- Future optimization suggestions
- Outcome confidence score
- Human-readable explanation

> Projections are deterministic structural readiness models — not live execution results. Read-only intelligence only.

## API Endpoints

All routes require authentication.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/outcome-intelligence` | Home + scenario catalog |
| GET | `/outcome-intelligence/evaluation` | Full outcome evaluation |
| GET | `/outcome-intelligence/expected` | Expected outcomes + success criteria |
| GET | `/outcome-intelligence/completion` | Completion model + deliverables + milestones + achievement |
| GET | `/outcome-intelligence/variance` | Variance + quality + improvements |
| GET | `/outcome-intelligence/explanation` | Explanation + confidence + lessons + optimizations |
| GET | `/outcome-intelligence/summary` | Compact summary |
| GET | `/outcome-intelligence/validate` | Validation report |

Query parameters: `scenario_id`, `canonical_action_id`, `urgency`, `distance_band`, `intent`.

## Verification

```bash
npm run verify:ch4-c7
```

## Guarantees

- Read-only — no DB writes, no execution mutations, no payments, no trust changes
- Delegates-only — C6 is primary upstream
- Deterministic — fixed timestamp, stable builders
- Explainable — quality, variance, achievement, and improvement narratives
- Import-lint compliant
