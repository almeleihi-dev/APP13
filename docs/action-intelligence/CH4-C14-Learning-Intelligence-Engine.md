# CH4-C14 — AN ACT Learning Intelligence Engine

Deterministic learning, adaptation, and continuous-improvement intelligence from the complete C1–C13 chain.

## Chain

```
Intent → ... → Strategy Intelligence → Learning Intelligence
```

## Module

- Path: `src/learning-intelligence/`
- Factory: `createLearningIntelligenceEngineModule()`
- Bootstrap key: `learningIntelligenceEngine`
- Service: `LearningIntelligenceEngineService`

## Delegation Model

| Upstream | Role |
|----------|------|
| **CH4-C13** | Strategy output via `StrategyIntelligenceEngineService.buildOutputForValidation()` |
| **CH4-C1–C12** | Prediction, insight, evaluation via `StrategyIntelligenceRepository` and `PredictionIntelligenceRepository` |

## Learning Outputs

- Learning insights
- Knowledge gaps
- Lessons learned
- Adaptation recommendations
- Strategy adjustments
- Continuous improvement cycles
- Feedback loops
- Learning patterns
- Skill development recommendations
- Performance improvement opportunities
- Learning confidence score
- Human-readable explanation
- Overall summary

## API Endpoints

All routes require authentication.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/learning-intelligence` | Home + scenario catalog |
| GET | `/learning-intelligence/learning` | Insights + gaps + lessons |
| GET | `/learning-intelligence/adaptation` | Adaptations + strategy adjustments |
| GET | `/learning-intelligence/improvement` | CI cycles + feedback loops + performance opportunities |
| GET | `/learning-intelligence/patterns` | Learning patterns + skill development |
| GET | `/learning-intelligence/explanation` | Explanation + learning confidence |
| GET | `/learning-intelligence/summary` | Compact summary |
| GET | `/learning-intelligence/validate` | Validation report |

## Verification

```bash
npm run verify:ch4-c14
```

## Guarantees

- Read-only — no DB writes, no mutations
- Delegates-only — C13 primary upstream
- Deterministic — fixed timestamp, stable builders
- Explainable — traceable learning narratives
- Import-lint compliant
