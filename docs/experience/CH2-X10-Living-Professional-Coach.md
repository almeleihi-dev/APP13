# CH2-X10 — Living Professional Coach Experience

## Mission

Build the Living Professional Coach Experience — the user's daily professional guide that explains, guides, prioritizes, encourages, and tracks progress.

**The Coach never makes decisions for the user.** Experience only. Every recommendation is explainable.

## Philosophy

Every morning the user should immediately know: What should I do today? What should I avoid? What opportunity deserves attention? What is slowing my growth?

## Architecture

```
src/living-experience/professional-coach/
  domain/
    coach-schema.ts
    coach-context.ts
    coach-sections.ts
    coach-experience.ts
  application/
    living-professional-coach-service.ts
    coach-collector.ts
  infrastructure/
    living-professional-coach-repository.ts
```

Routes use `/living-professional-coach/*`.

## Layout (13 Sections)

1. Morning Briefing — greeting, momentum, frame, journey
2. Today's One Best Action — exactly one highest-impact action
3. Priority Planner — top three priorities with order explanation
4. Opportunity Advisor — best opportunity, why now, risk if ignored
5. Professional Risk Alerts — explainable alerts
6. Learning Coach — skill gap, expert, training path
7. Career Coach — promotion, leadership, income, positioning
8. Community Coach — discussion, Q&A, knowledge, challenge
9. Partner Coach — recommendation only
10. Productivity Reflection — yesterday review, habits, suggestions
11. Today's Achievement Forecast — expected progress with confidence
12. Tomorrow Preparation — one recommendation to prepare
13. Coach Memory — preferences, working style, successful recommendations

## Coach Rules

- Never make decisions for the user
- Explain every recommendation
- Recommend only — respect permissions, protect privacy
- Never manipulate or prioritize commercial interests
- Always prioritize professional benefit

## Geographic Intelligence

Adapts using country, region, city, language, regulations, market demand, working week, and local context.

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/living-professional-coach` | Full coach experience |
| GET | `/living-professional-coach/sections` | All sections |
| GET | `/living-professional-coach/briefing` | Morning briefing |
| GET | `/living-professional-coach/best-action` | Today's one best action |
| GET | `/living-professional-coach/priorities` | Priority planner |
| GET | `/living-professional-coach/opportunity` | Opportunity advisor |
| GET | `/living-professional-coach/risks` | Professional risk alerts |
| GET | `/living-professional-coach/learning` | Learning coach |
| GET | `/living-professional-coach/career` | Career coach |
| GET | `/living-professional-coach/community` | Community coach |
| GET | `/living-professional-coach/partner` | Partner coach |
| GET | `/living-professional-coach/reflection` | Productivity reflection |
| GET | `/living-professional-coach/forecast` | Achievement forecast |
| GET | `/living-professional-coach/tomorrow` | Tomorrow preparation |
| GET | `/living-professional-coach/memory` | Coach memory |
| POST | `/living-professional-coach/accept` | Record accepted recommendation |
| POST | `/living-professional-coach/refresh` | Refresh experience |
| GET | `/living-professional-coach/statistics` | Platform admin only |

## Verification

```bash
npm run test:ch2-x10-living-professional-coach
npm run verify:ch2-x10
```

## Constraints

- Human language, friendly, professional, encouraging
- No engine names exposed
- Coach recommends — user decides
