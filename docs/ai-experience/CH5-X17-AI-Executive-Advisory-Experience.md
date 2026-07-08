# CH5-X17 — AN ACT AI Executive Advisory Experience

Read-only AI Executive Advisory Experience for Chapter 5, consuming CH5-X16 AI Predictive Forecast Experience.

> **Naming note:** CH5-X12 already occupies `src/ai-executive-intelligence-experience/` (upstream CH5-X11). CH5-X17 is the predictive-forecast-derived executive advisory layer and uses `src/ai-executive-advisory-experience/` with chain token `ai_executive_advisory_experience`.

## Chain

```
Intent → ... → AI Predictive Forecast Experience → AI Executive Advisory Experience
```

## Module

- Path: `src/ai-executive-advisory-experience/`
- Factory: `createAiExecutiveAdvisoryExperienceModule()`
- Bootstrap key: `aiExecutiveAdvisoryExperience`
- Service: `AiExecutiveAdvisoryExperienceService`

## Delegation Model

| Upstream | Role |
|----------|------|
| **CH5-X16** | Sole upstream — `AiPredictiveForecastExperienceService.buildOutputForValidation()` |

## Executive Advisory Views

| View | Route |
|------|-------|
| Executive Advisory Home | `/ai-executive-advisory-experience` |
| Advisory Dashboard | `/ai-executive-advisory-experience/advisory-dashboard` |
| Executive Briefing | `/ai-executive-advisory-experience/executive-briefing` |
| Advisory Recommendations | `/ai-executive-advisory-experience/recommendations` |
| Action Plan | `/ai-executive-advisory-experience/action-plan` |
| Priority Actions | `/ai-executive-advisory-experience/priority-actions` |
| Risk Advisory | `/ai-executive-advisory-experience/risk-advisory` |
| Opportunity Advisory | `/ai-executive-advisory-experience/opportunity-advisory` |
| Advisory Confidence | `/ai-executive-advisory-experience/confidence` |
| Human-Readable Explanation | `/ai-executive-advisory-experience/explanation` |
| Compact Summary | `/ai-executive-advisory-experience/summary` |
| Validate | `/ai-executive-advisory-experience/validate` |

## Builder Mapping

| Advisory View | X16 Source |
|---------------|------------|
| Advisory Context | `predictiveForecastContext` |
| Advisory Dashboard | `predictionDashboard` + `probabilityModel` |
| Executive Briefing | `predictiveExplanation` |
| Recommendations | `futureScenarios.scenarios` (4) |
| Action Plan | `forecast.steps` (4) |
| Priority Actions | `trendAnalysis.trends` (3) |
| Risk Advisory | `riskForecast.items` (3) |
| Opportunity Advisory | `opportunityForecast.opportunities` (3) |
| Advisory Confidence | `predictiveConfidence` (re-scored) |
| Delegation | X16 sole upstream checks |
| Explanation | dashboard + briefing + action plan summaries |

## Verification

```bash
npm run verify:ch5-x17
```

## Guarantees

- Read-only — no mutations, writes, runtime execution, payment, trust, contract, or execution engine changes
- Delegates-only — X16 sole upstream, no duplicated business logic
- Deterministic — fixed timestamp `2026-07-01T20:00:00.000Z`, stable builders, 4 recommendations, 4 action plan items, 3 priority actions, 3 risk/opportunity advisory items
- Explainable — executive advisory narratives traceable through X16 → X15 → … → C22 chain
- Import-lint compliant
