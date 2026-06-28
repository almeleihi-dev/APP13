# CH4-C6 — AN ACT Execution Intelligence Engine

Deterministic, read-only execution guidance derived from CH4-C5 contract intelligence.

## Chain

```
Intent → Canonical Action → Action Plan → Dynamic Pricing → Contract Intelligence → Execution Intelligence
```

## Module

- Path: `src/execution-intelligence/`
- Factory: `createExecutionIntelligenceEngineModule()`
- Bootstrap key: `executionIntelligenceEngine`
- Service: `ExecutionIntelligenceEngineService`

## Delegation Model

| Upstream | Role |
|----------|------|
| **CH4-C5** | Contract recommendation (milestones, parties, escrow, acceptance) |
| **CH4-C4** | Pricing (via C5 repository chain) |
| **CH4-C3** | Action plan (tasks, stages, dependencies, timeline) |
| **CH4-C2** | Canonical actions (risk signals, evidence) |
| **CH4-C1** | Scenario IDs via `c5-execution-bridge` |

No planning, pricing, contract, or ontology logic is duplicated.

## Execution Guidance Outputs

- Execution roadmap and phases
- Ordered milestones
- Task sequencing with dependencies
- Responsibility matrix
- Stage evidence requirements
- Verification, quality, and escrow release checkpoints
- Acceptance workflow
- Exception handling guidance
- Recovery recommendations
- Execution progress model
- Execution confidence score
- Human-readable explanation

## API Endpoints

All routes require authentication.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/execution-intelligence` | Home + scenario catalog |
| GET | `/execution-intelligence/roadmap` | Roadmap + ordered milestones |
| GET | `/execution-intelligence/sequencing` | Task sequence + responsibility matrix |
| GET | `/execution-intelligence/checkpoints` | Evidence + verification + quality + escrow checkpoints |
| GET | `/execution-intelligence/acceptance` | Acceptance workflow + exceptions + recovery + progress |
| GET | `/execution-intelligence/explanation` | Explanation + confidence |
| GET | `/execution-intelligence/summary` | Compact summary |
| GET | `/execution-intelligence/validate` | Validation report |

Query parameters: `scenario_id`, `canonical_action_id`, `urgency`, `distance_band`, `intent`.

## Verification

```bash
npm run verify:ch4-c6
```

## Guarantees

- Read-only — no DB writes, no execution mutations, no payments, no trust changes
- Delegates-only — upstream engines provide all data
- Deterministic — fixed timestamp, stable builders
- Explainable — human-readable execution rationale
- Import-lint compliant
