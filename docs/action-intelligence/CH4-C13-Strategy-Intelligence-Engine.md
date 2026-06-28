# CH4-C13 — AN ACT Strategy Intelligence Engine

Deterministic strategic planning from the complete C1–C12 intelligence chain.

## Chain

```
Intent → ... → Prediction Intelligence → Strategy Intelligence
```

## Module

- Path: `src/strategy-intelligence/`
- Factory: `createStrategyIntelligenceEngineModule()`
- Bootstrap key: `strategyIntelligenceEngine`
- Service: `StrategyIntelligenceEngineService`

## Delegation Model

| Upstream | Role |
|----------|------|
| **CH4-C12** | Prediction output via `PredictionIntelligenceEngineService.buildOutputForValidation()` |
| **CH4-C1–C11** | Insight, recommendation, execution via `PredictionIntelligenceRepository.resolveUpstream()` |

## Strategy Outputs

- Strategic objectives
- Strategic options
- Execution strategies
- Long-term roadmap
- Resource allocation strategy
- Priority optimization
- Contingency strategies
- Scenario planning
- Strategic risk mitigation
- Strategic opportunity matrix
- Strategic confidence score
- Human-readable explanation
- Overall summary

## API Endpoints

All routes require authentication.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/strategy-intelligence` | Home + scenario catalog |
| GET | `/strategy-intelligence/strategy` | Objectives, options, execution, allocation, priorities |
| GET | `/strategy-intelligence/roadmap` | Long-term roadmap |
| GET | `/strategy-intelligence/scenarios` | Scenario plans + contingencies |
| GET | `/strategy-intelligence/opportunities` | Opportunity matrix + risk mitigations |
| GET | `/strategy-intelligence/explanation` | Explanation + strategic confidence |
| GET | `/strategy-intelligence/summary` | Compact summary |
| GET | `/strategy-intelligence/validate` | Validation report |

## Verification

```bash
npm run verify:ch4-c13
```

## Guarantees

- Read-only — no DB writes, no mutations
- Delegates-only — C12 primary upstream
- Deterministic — fixed timestamp, stable builders
- Explainable — traceable strategic narratives
- Import-lint compliant
