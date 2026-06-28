# CH4-C11 — AN ACT Insight Intelligence Engine

Deterministic strategic and operational insights from the complete C1–C10 intelligence chain.

## Chain

```
Intent → ... → Recommendation Intelligence → Insight Intelligence
```

## Module

- Path: `src/insight-intelligence/`
- Factory: `createInsightIntelligenceEngineModule()`
- Bootstrap key: `insightIntelligenceEngine`
- Service: `InsightIntelligenceEngineService`

## Delegation Model

| Upstream | Role |
|----------|------|
| **CH4-C10** | Recommendation output via `RecommendationIntelligenceEngineService.getRecommendation()` |
| **CH4-C1–C9** | Decision, outcome, execution via `RecommendationIntelligenceRepository.resolveUpstream()` |

## Insight Outputs

- Strategic insights
- Operational insights
- Risk insights
- Opportunity insights
- Bottleneck detection
- Pattern recognition
- Root cause observations
- Optimization opportunities
- Hidden dependencies
- Recommendation consistency analysis
- Insight confidence score
- Human-readable explanation
- Overall summary

## API Endpoints

All routes require authentication.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/insight-intelligence` | Home + scenario catalog |
| GET | `/insight-intelligence/insights` | Strategic + operational + consistency |
| GET | `/insight-intelligence/patterns` | Patterns + root causes + hidden dependencies |
| GET | `/insight-intelligence/opportunities` | Opportunities + optimizations |
| GET | `/insight-intelligence/risks` | Risk insights + bottlenecks |
| GET | `/insight-intelligence/explanation` | Explanation + insight confidence |
| GET | `/insight-intelligence/summary` | Compact summary |
| GET | `/insight-intelligence/validate` | Validation report |

## Verification

```bash
npm run verify:ch4-c11
```

## Guarantees

- Read-only — no DB writes, no mutations
- Delegates-only — C10 primary upstream
- Deterministic — fixed timestamp, stable builders
- Explainable — traceable insight narratives
- Import-lint compliant
