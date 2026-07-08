# CH4-C12 — AN ACT Prediction Intelligence Engine

Deterministic future projections from the complete C1–C11 intelligence chain.

## Chain

```
Intent → ... → Insight Intelligence → Prediction Intelligence
```

## Module

- Path: `src/prediction-intelligence/`
- Factory: `createPredictionIntelligenceEngineModule()`
- Bootstrap key: `predictionIntelligenceEngine`
- Service: `PredictionIntelligenceEngineService`

## Delegation Model

| Upstream | Role |
|----------|------|
| **CH4-C11** | Insight output via `InsightIntelligenceEngineService.buildOutputForValidation()` |
| **CH4-C1–C10** | Recommendation, decision, outcome, execution via `InsightIntelligenceRepository.resolveUpstream()` |

## Prediction Outputs

- Success probability projections
- Timeline forecasts
- Risk evolution forecasts
- Trust evolution forecasts
- Cost projections
- Outcome projections
- Opportunity forecasts
- Scenario comparisons
- What-if analysis
- Prediction confidence score
- Human-readable explanation
- Overall summary

## API Endpoints

All routes require authentication.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/prediction-intelligence` | Home + scenario catalog |
| GET | `/prediction-intelligence/predictions` | Success, outcome, cost projections |
| GET | `/prediction-intelligence/scenarios` | Scenario comparisons |
| GET | `/prediction-intelligence/forecasts` | Timeline, risk, trust, opportunity forecasts |
| GET | `/prediction-intelligence/what-if` | What-if analysis variants |
| GET | `/prediction-intelligence/explanation` | Explanation + prediction confidence |
| GET | `/prediction-intelligence/summary` | Compact summary |
| GET | `/prediction-intelligence/validate` | Validation report |

## Verification

```bash
npm run verify:ch4-c12
```

## Guarantees

- Read-only — no DB writes, no mutations
- Delegates-only — C11 primary upstream
- Deterministic — fixed timestamp, stable builders
- Explainable — traceable projection narratives
- Import-lint compliant
