# CH2-X18 — Living Professional Analytics

## Mission

Build the Living Professional Analytics experience — transform all Living Experience data into meaningful analytics, trends, performance indicators, and professional insights.

**Experience only. Read-only. Analyzes only. Never modifies user data.**

## Architecture

```
src/living-experience/professional-analytics/
  domain/
    analytics-schema.ts
    analytics-context.ts
    analytics-sections.ts
    analytics-experience.ts
  application/
    living-professional-analytics-service.ts
    analytics-collector.ts
  infrastructure/
    living-professional-analytics-repository.ts
```

Routes use `/living-professional-analytics/*`.

## Layout (13 Sections)

1. Analytics Summary — overall score and analytics engine
2. Professional Growth — readiness and journey growth
3. Performance Metrics — calibration performance
4. Skills Analytics — skill proficiency and gaps
5. Financial Analytics — income readiness
6. Productivity Analytics — action completion rates
7. Opportunity Analytics — match and pipeline
8. Risk Analytics — risk exposure indicators
9. Achievement Analytics — portfolio scoring
10. Trend Analysis — multi-dimension trends
11. Recommended Insights — prioritized insights
12. Confidence & Explanation — evidence-based confidence
13. Analytics History — accepted/ignored insight records

## Analytics Metric Contract

Every section includes metrics with:

- id, title, description, category, measured_period
- current_value, previous_value, change_percentage, trend, benchmark
- strengths, weaknesses, opportunities, risks, recommendations
- confidence_score, explanation

## Analytics Engine

Deterministic evaluation producing:

- growth_score, performance_score, productivity_score, financial_score
- opportunity_score, risk_score, achievement_score, trend_score
- overall_professional_score, strongest_dimensions, weakest_dimensions
- projected_direction

## Experience Rules

- `analyzes_only: true`
- `never_modify_user_data: true`
- Plus standard experience-only flags

## Verification

```bash
npm run verify:ch2-x18
```
