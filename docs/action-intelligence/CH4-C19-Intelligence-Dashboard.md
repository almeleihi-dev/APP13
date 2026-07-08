# CH4-C19 — AN ACT Intelligence Dashboard

Unified executive dashboard presenting the complete C1–C18 intelligence journey through CH4-C18 Unified Action Intelligence Experience.

## Chain

```
Intent → ... → Unified Action Intelligence Experience → Intelligence Dashboard
```

## Module

- Path: `src/intelligence-dashboard/`
- Factory: `createIntelligenceDashboardModule()`
- Bootstrap key: `intelligenceDashboard`
- Service: `IntelligenceDashboardService`

## Delegation Model

| Upstream | Role |
|----------|------|
| **CH4-C18** | Sole upstream — `ActionIntelligenceExperienceService.buildOutputForValidation()` |

## Dashboard Panels

| Panel | Route |
|-------|-------|
| Dashboard Home | `/intelligence-dashboard` |
| Executive Overview | `/intelligence-dashboard/overview` |
| Intelligence Health | `/intelligence-dashboard/health` |
| Journey Progress | `/intelligence-dashboard/journey` |
| Confidence Metrics | `/intelligence-dashboard/confidence` |
| Readiness Metrics | `/intelligence-dashboard/readiness` |
| Trust Overview | `/intelligence-dashboard/trust` |
| Decision Overview | `/intelligence-dashboard/decision` |
| Recommendation Overview | `/intelligence-dashboard/recommendation` |
| Prediction Overview | `/intelligence-dashboard/prediction` |
| Strategy Overview | `/intelligence-dashboard/strategy` |
| Learning Overview | `/intelligence-dashboard/learning` |
| Optimization Overview | `/intelligence-dashboard/optimization` |
| Evolution Overview | `/intelligence-dashboard/evolution` |
| End-to-End Intelligence Timeline | `/intelligence-dashboard/timeline` |
| Executive Summary | `/intelligence-dashboard/executive-summary` |
| Compact Summary | `/intelligence-dashboard/summary` |
| Validate | `/intelligence-dashboard/validate` |

## Verification

```bash
npm run verify:ch4-c19
```

## Guarantees

- Read-only — no mutations
- Delegates-only — C18 sole upstream
- Deterministic — fixed timestamp, stable builders
- Import-lint compliant
