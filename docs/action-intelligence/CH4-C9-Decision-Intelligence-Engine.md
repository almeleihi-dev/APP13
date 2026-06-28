# CH4-C9 — AN ACT Decision Intelligence Engine

Deterministic, explainable decision recommendations from the complete C1–C8 intelligence chain.

## Chain

```
Intent → Canonical Action → Action Plan → Dynamic Pricing → Contract Intelligence → Execution Intelligence → Outcome Intelligence → Trust Intelligence → Decision Intelligence
```

## Module

- Path: `src/decision-intelligence/`
- Factory: `createDecisionIntelligenceEngineModule()`
- Bootstrap key: `decisionIntelligenceEngine`
- Service: `DecisionIntelligenceEngineService`

## Delegation Model

| Upstream | Role |
|----------|------|
| **CH4-C8** | Trust recommendation via `TrustIntelligenceEngineService.getRecommendation()` |
| **CH4-C1–C7** | Outcome, execution, contract via `TrustIntelligenceRepository.resolveUpstream()` |

No upstream planning, ontology, pricing, contract, execution, outcome, or trust logic duplicated.

## Decision Recommendation Outputs

- Decision readiness (level, score, trust/outcome signals)
- Recommended decision (`proceed`, `proceed_with_conditions`, `review`, `postpone`)
- Decision confidence score
- Blocking factors
- Supporting factors
- Required approvals
- Decision rationale
- Alternative options
- Mitigation recommendations
- Expected impact analysis
- Human-readable explanation

## API Endpoints

All routes require authentication.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/decision-intelligence` | Home + scenario catalog |
| GET | `/decision-intelligence/recommendation` | Full decision recommendation |
| GET | `/decision-intelligence/readiness` | Readiness + confidence + recommended decision |
| GET | `/decision-intelligence/factors` | Blocking/supporting factors + approvals + rationale |
| GET | `/decision-intelligence/alternatives` | Alternatives + mitigations + impact analysis |
| GET | `/decision-intelligence/explanation` | Human-readable explanation |
| GET | `/decision-intelligence/summary` | Compact summary |
| GET | `/decision-intelligence/validate` | Validation report |

## Verification

```bash
npm run verify:ch4-c9
```

## Guarantees

- Read-only — no DB writes, no payments, no contract mutations, no trust mutations
- Delegates-only — C8 primary upstream
- Deterministic — fixed timestamp, stable builders
- Explainable — traceable factor narratives and decision rationale
- Import-lint compliant
