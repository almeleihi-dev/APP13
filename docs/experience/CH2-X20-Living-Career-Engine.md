# CH2-X20 — Living Career Engine

## Mission

Build the Living Career Engine — the deterministic career reasoning engine for the Living Experience platform. Continuously evaluates professional trajectory and recommends optimal career direction.

**Experience only. Read-only. Recommends only. Never decides or modifies user data.**

This module completes Chapter 2 and prepares the platform for Chapter 3: The Living Professional OS.

## Architecture

```
src/living-experience/professional-career-engine/
  domain/
    career-engine-schema.ts
    career-engine-context.ts
    career-engine-sections.ts
    career-engine-experience.ts
  application/
    living-professional-career-engine-service.ts
    career-engine-collector.ts
  infrastructure/
    living-professional-career-engine-repository.ts
```

Routes use `/living-professional-career-engine/*`.

## Layout (13 Sections)

1. Career Engine Summary — overview with career engine scores
2. Current Career Position — current standing and context
3. Career Readiness — readiness assessment
4. Career Opportunities — opportunity evaluation
5. Career Risks — risk exposure analysis
6. Career Growth Strategy — growth recommendations
7. Skill Evolution Strategy — skill development path
8. Financial Career Strategy — financial alignment (never executes)
9. Leadership Strategy — leadership development path
10. Career Decision Engine — path synthesis with alternatives
11. Recommended Next Career Moves — prioritized actions
12. Confidence & Explanation — evidence-based confidence
13. Career Engine History — accepted/ignored recommendation records

## Recommendation Contract

Every recommendation includes:

- id, title, description, category, priority, timeframe
- reasoning, assumptions, required_skills, expected_benefits
- possible_risks, alternatives, confidence_score, explanation

## Career Engine

Deterministic reasoning producing:

- current_career_stage, career_readiness_score, career_growth_score
- opportunity_score, leadership_score, financial_growth_score, learning_score
- career_risk_score, recommended_career_path, recommended_next_actions
- alternative_paths, projected_next_milestones, overall_career_score

## Experience Rules

- `recommends_only: true`
- `never_modify_user_data: true`
- `never_make_decisions: true`

## Verification

```bash
npm run verify:ch2-x20
```
