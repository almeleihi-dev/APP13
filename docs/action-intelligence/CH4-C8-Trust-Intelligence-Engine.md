# CH4-C8 — AN ACT Trust Intelligence Engine

Deterministic, explainable trust recommendations from the complete C1–C7 intelligence chain.

## Chain

```
Intent → Canonical Action → Action Plan → Dynamic Pricing → Contract Intelligence → Execution Intelligence → Outcome Intelligence → Trust Intelligence
```

## Module

- Path: `src/trust-intelligence/`
- Factory: `createTrustIntelligenceEngineModule()`
- Bootstrap key: `trustIntelligenceEngine`
- Service: `TrustIntelligenceEngineService`

> Distinct from legacy `trustIntelligence` (AI trust at `/ai/trust`).

## Delegation Model

| Upstream | Role |
|----------|------|
| **CH4-C7** | Outcome evaluation via `OutcomeIntelligenceEngineService.getEvaluation()` |
| **CH4-C6–C1** | Execution, contract, plan, canonical via `OutcomeIntelligenceRepository` |

No upstream logic duplicated.

## Trust Recommendation Outputs

- Trust readiness (level, score, gates)
- Trust score recommendation (weighted factors, trust points band)
- Verification confidence
- Reputation projection (tier, trajectory)
- Risk confidence
- Evidence completeness
- Provider reliability projection
- Customer reliability projection
- Platform trust recommendation
- Human-readable trust explanation
- Trust confidence score

## API Endpoints

All routes require authentication.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/trust-intelligence` | Home + scenario catalog |
| GET | `/trust-intelligence/recommendation` | Full trust recommendation |
| GET | `/trust-intelligence/readiness` | Readiness + verification + evidence |
| GET | `/trust-intelligence/score` | Trust score + risk confidence |
| GET | `/trust-intelligence/reputation` | Reputation + reliability + platform recommendation |
| GET | `/trust-intelligence/explanation` | Explanation + trust confidence |
| GET | `/trust-intelligence/summary` | Compact summary |
| GET | `/trust-intelligence/validate` | Validation report |

## Verification

```bash
npm run verify:ch4-c8
```

## Guarantees

- Read-only — no DB writes, no trust mutations, no payments, no contract changes
- Delegates-only — C7 primary upstream
- Deterministic — fixed timestamp, stable builders
- Explainable — traceable factor narratives
- Import-lint compliant
