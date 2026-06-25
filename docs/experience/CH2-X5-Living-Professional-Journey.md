# CH2-X5 — Living Professional Journey Experience

## Mission

Build the Living Professional Journey — the user's living career map. It answers: Where did I start? Where am I today? Where am I going? What is my next milestone? What happens if I continue?

**Experience only.** No marketplace execution, contracts, or payments.

## Philosophy

Every action, project, certificate, learning achievement, and trusted milestone becomes part of the journey. The journey inspires continuous growth.

## Architecture

```
src/living-experience/professional-journey/
  domain/
    journey-schema.ts
    journey-context.ts
    journey-sections.ts
    journey-experience.ts
  application/
    living-journey-service.ts
    journey-collector.ts
  infrastructure/
    living-journey-repository.ts
```

Routes use `/living-journey/*`.

## Layout (13 Sections)

1. Journey Overview — name, stage, summary, years active
2. Current Position — level, Live Frame, passport, readiness
3. Past Milestones — first action, certificate, project, frame upgrades
4. Today's Position — strengths, opportunities, challenges
5. Future Milestones — certification, frame, role, income, knowledge
6. Professional Timeline — chronological career history
7. Journey Progress — completion, maturity, growth, timeline
8. Professional Goals — current, completed, suggested
9. Career Roadmap — recommended, alternative, high-demand, leadership, expert paths
10. Achievements — professional, learning, community, knowledge
11. Challenges — obstacles, missing skills, licenses, guidance
12. Recommended Next Step — one highest-impact recommendation
13. Future Projection — 30 days, 90 days, 1 year, 3 years

## Partnership Ecosystem

Read-only recommendations at `GET /living-journey/partnerships` for training partners, government programs, financial opportunities, professional organizations, and mentorship.

## Geographic Intelligence

Journey adapts to country, city, regional demand, government programs, regulations, and licensing via CH2-X1 onboarding.

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/living-journey` | Full living journey |
| GET | `/living-journey/sections` | All sections |
| GET | `/living-journey/overview` | Journey overview |
| GET | `/living-journey/current-position` | Current position |
| GET | `/living-journey/past-milestones` | Past milestones |
| GET | `/living-journey/todays-position` | Today's position |
| GET | `/living-journey/future-milestones` | Future milestones |
| GET | `/living-journey/timeline` | Professional timeline |
| GET | `/living-journey/progress` | Journey progress |
| GET | `/living-journey/goals` | Professional goals |
| GET | `/living-journey/roadmap` | Career roadmap |
| GET | `/living-journey/achievements` | Achievements |
| GET | `/living-journey/challenges` | Challenges |
| GET | `/living-journey/next-step` | Recommended next step |
| GET | `/living-journey/projection` | Future projection |
| GET | `/living-journey/partnerships` | Partnership recommendations |
| POST | `/living-journey/refresh` | Refresh journey |
| GET | `/living-journey/statistics` | Platform admin only |

## Intelligence Integration

Read-only from Develop Me, Personal Assistant, Learn by Action, Expert Network, Intelligence Orchestration.

## Verification

```bash
npm run test:ch2-x5-living-journey
npm run verify:ch2-x5
```

## Constraints

- Human language, motivating, explainable
- No engine names exposed
- One clear message per section
- Zero dependency violations
