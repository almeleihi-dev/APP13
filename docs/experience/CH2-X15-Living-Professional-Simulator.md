# CH2-X15 — Living Professional Simulator

## Mission

Build the Living Professional Simulator — the experience layer that lets users explore professional "What If" scenarios before making decisions.

**Experience only. Read-only. Predicts only. Never executes.**

## Philosophy

Every simulation is deterministic, transparent, and assumption-driven. The simulator projects outcomes but never decides or acts on behalf of the user.

## Architecture

```
src/living-experience/professional-simulator/
  domain/
    simulator-schema.ts
    simulator-context.ts
    simulator-sections.ts
    simulator-experience.ts
  application/
    living-professional-simulator-service.ts
    simulator-collector.ts
  infrastructure/
    living-professional-simulator-repository.ts
```

Routes use `/living-professional-simulator/*`.

## Layout (13 Sections)

1. Simulation Summary — overall understanding and featured scenario
2. Ask What If — natural language what-if with deterministic keyword matching
3. Career Simulator — career trajectory projection
4. Learning Simulator — skill investment outcomes
5. Income Simulator — earning potential projections
6. Reputation Simulator — trust and community standing
7. Time Simulator — time investment tradeoffs
8. Risk Simulator — professional risk what-if
9. Opportunity Simulator — opportunity pursuit outcomes
10. Alternative Scenarios — side-by-side path comparison
11. Assumptions — global assumptions and data sources
12. Confidence & Explanation — evidence-based confidence
13. Simulation History — accepted/ignored simulation records

## Simulation Contract

Every simulation includes:

- scenario
- assumptions
- input_signals
- projected_outcomes
- best_case
- expected_case
- worst_case
- confidence_score
- explanation
- missing_information
- recommended_next_experiments

## Experience Rules

- `experience_only: true`
- `read_only: true`
- `predicts_only: true`
- `recommends_only: true`
- `never_execute: true`
- `never_decide_for_user: true`
- `never_fabricate_reasoning: true`
- `never_fabricate_data: true`
- `always_show_assumptions: true`
- `always_show_confidence: true`
- `user_controls_final_decision: true`

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/living-professional-simulator` | Full simulator experience |
| GET | `/living-professional-simulator/summary` | Simulation summary |
| GET | `/living-professional-simulator/ask` | Ask What If section |
| POST | `/living-professional-simulator/ask` | Natural language what-if |
| GET | `/living-professional-simulator/career` | Career simulator |
| GET | `/living-professional-simulator/learning` | Learning simulator |
| GET | `/living-professional-simulator/income` | Income simulator |
| GET | `/living-professional-simulator/reputation` | Reputation simulator |
| GET | `/living-professional-simulator/time` | Time simulator |
| GET | `/living-professional-simulator/risks` | Risk simulator |
| GET | `/living-professional-simulator/opportunities` | Opportunity simulator |
| GET | `/living-professional-simulator/alternatives` | Alternative scenarios |
| GET | `/living-professional-simulator/assumptions` | Assumptions |
| GET | `/living-professional-simulator/confidence` | Confidence & explanation |
| GET | `/living-professional-simulator/history` | Simulation history |
| POST | `/living-professional-simulator/accept` | Record accepted simulation |
| POST | `/living-professional-simulator/ignore` | Record ignored simulation |
| POST | `/living-professional-simulator/refresh` | Refresh experience |

## Verification

```bash
npm run verify:ch2-x15
```
