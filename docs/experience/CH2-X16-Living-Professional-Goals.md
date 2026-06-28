# CH2-X16 — Living Professional Goals

## Mission

Build the Living Professional Goals experience — transform long-term professional vision into structured, measurable, and actionable goals.

**Experience only. Read-only. Recommends only. Never creates real tasks.**

## Philosophy

Goals are deterministic recommendations derived from living experience projections. The user decides which goals to adopt — the system never auto-creates or executes goals.

## Architecture

```
src/living-experience/professional-goals/
  domain/
    goals-schema.ts
    goals-context.ts
    goals-sections.ts
    goals-experience.ts
  application/
    living-professional-goals-service.ts
    goals-collector.ts
  infrastructure/
    living-professional-goals-repository.ts
```

Routes use `/living-professional-goals/*`.

## Layout (13 Sections)

1. Goals Summary — overall understanding and primary focus
2. Life Vision — long-term vision with aligned goals
3. One-Year Goals — structured 12-month objectives
4. Three-Year Goals — mid-term career trajectory
5. Five-Year Goals — long-term expert and business goals
6. Professional Milestones — quarterly and passport checkpoints
7. Skill Development Goals — learning-aligned objectives
8. Financial Goals — income readiness objectives
9. Business & Leadership Goals — separate business and leadership tracks
10. Goal Progress — on-track and at-risk goal tracking
11. Goal Recommendations — prioritized goal suggestions
12. Confidence & Explanation — evidence-based confidence
13. Goals History — accepted/ignored goal records

## Goal Contract

Every goal includes:

- id, title, description, category, priority, timeframe
- current_progress, target_value, estimated_completion
- required_actions, required_skills, dependencies
- success_indicators, risks, recommendations
- confidence_score, explanation

## Goal Planning

Each timeframe section includes deterministic planning:

- yearly_roadmap
- quarterly_milestones
- monthly_objectives
- weekly_focus
- suggested_daily_actions

## Experience Rules

- `experience_only: true`
- `read_only: true`
- `recommends_only: true`
- `never_execute: true`
- `never_create_real_tasks: true`
- `never_decide_for_user: true`
- `never_fabricate_reasoning: true`
- `never_fabricate_data: true`
- `always_show_assumptions: true`
- `always_show_confidence: true`
- `user_controls_final_decision: true`

## Integration

Reuses projections from:

- Living Professional Passport, Journey, Impact, Coach, Planner
- Live Frame, Identity, Intelligence Center, Simulator

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/living-professional-goals` | Full goals experience |
| GET | `/living-professional-goals/summary` | Goals summary |
| GET | `/living-professional-goals/vision` | Life vision |
| GET | `/living-professional-goals/one-year` | One-year goals |
| GET | `/living-professional-goals/three-years` | Three-year goals |
| GET | `/living-professional-goals/five-years` | Five-year goals |
| GET | `/living-professional-goals/milestones` | Professional milestones |
| GET | `/living-professional-goals/skills` | Skill development goals |
| GET | `/living-professional-goals/financial` | Financial goals |
| GET | `/living-professional-goals/business` | Business & leadership goals |
| GET | `/living-professional-goals/progress` | Goal progress |
| GET | `/living-professional-goals/recommendations` | Goal recommendations |
| GET | `/living-professional-goals/confidence` | Confidence & explanation |
| GET | `/living-professional-goals/history` | Goals history |
| POST | `/living-professional-goals/accept` | Record accepted goal |
| POST | `/living-professional-goals/ignore` | Record ignored goal |
| POST | `/living-professional-goals/refresh` | Refresh experience |
| GET | `/living-professional-goals/statistics` | Admin statistics |

## Verification

```bash
npm run verify:ch2-x16
```
