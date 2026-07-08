# CH4-C17 — AN ACT Orchestration Intelligence Engine

Deterministic orchestration intelligence unifying the complete C1–C16 intelligence chain into a single read-only orchestration service.

## Chain

```
Intent → ... → Evolution Intelligence → Orchestration Intelligence
```

## Module

- Path: `src/orchestration-intelligence/`
- Factory: `createOrchestrationIntelligenceEngineModule()`
- Bootstrap key: `orchestrationIntelligenceEngine`
- Service: `OrchestrationIntelligenceEngineService`

## Delegation Model

| Upstream | Role |
|----------|------|
| **CH4-C16** | Primary — `EvolutionIntelligenceEngineService.buildOutputForValidation()` |
| **CH4-C1–C15** | Full chain via `EvolutionIntelligenceRepository.resolveUpstream()` |

## Orchestration Outputs

- Full C1–C16 chain trace
- Orchestration layer status (16 layers)
- Cross-engine coordination links
- Unified intelligence snapshots (C12–C16)
- Orchestration readiness assessment
- Orchestration recommendations
- Orchestration confidence score
- Human-readable explanation with chain traceability
- Overall summary

## API Endpoints

All routes require authentication.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/orchestration-intelligence` | Home + scenario catalog |
| GET | `/orchestration-intelligence/chain` | Chain trace + orchestration layers |
| GET | `/orchestration-intelligence/coordination` | Cross-engine coordination + recommendations |
| GET | `/orchestration-intelligence/unified` | Unified intelligence snapshots |
| GET | `/orchestration-intelligence/readiness` | Orchestration readiness |
| GET | `/orchestration-intelligence/explanation` | Explanation + orchestration confidence |
| GET | `/orchestration-intelligence/summary` | Compact summary |
| GET | `/orchestration-intelligence/validate` | Validation report |

## Verification

```bash
npm run verify:ch4-c17
```

## Guarantees

- Read-only — no DB writes, no mutations
- Delegates-only — C16 primary upstream, full C1–C16 chain traceability
- Deterministic — fixed timestamp, stable builders
- Explainable — full chain trace in orchestration narratives
- Import-lint compliant
