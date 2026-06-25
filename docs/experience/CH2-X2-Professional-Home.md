# CH2-X2 — Professional Home Experience

## Mission

Build the Living Professional Home — the main experience users open every day. Not a dashboard. A professional command center that answers:

**"What is the best thing I should do right now?"**

Experience only. No marketplace, contract, or payment execution.

## Philosophy

The Professional Home must feel alive. It changes every day, after every completed action, learning achievement, and marketplace opportunity. Users never see a static page or engine names.

## Architecture

```
src/living-experience/professional-home/
  domain/
    professional-home-schema.ts
    professional-home-context.ts
    professional-home-sections.ts
    professional-home-experience.ts
  application/
    professional-home-service.ts
    professional-home-collector.ts
  infrastructure/
    professional-home-repository.ts
```

## Layout (13 Sections)

1. Greeting — dynamic daily welcome
2. Today's Best Step — one highest-impact recommendation with why, benefit, time
3. Best Opportunity — highest-value match with income, readiness, confidence
4. Professional Passport — level, skills, actions, score, progress
5. Live Frame — current tier, reason, progress to next level
6. Professional Journey — stage, next milestone, completed milestones
7. Develop Me — missing skill, course, government opportunity
8. Learn by Action — nearby expert, practical session, skills gained
9. My Team — suggested team, collaborations, recommended role
10. Expert Recommendations — mentor, reviewer, consultant
11. Knowledge Highlights — new knowledge, blueprint improvements, trends
12. Marketplace Snapshot — matching actions, demand, price trend, competition (read-only)
13. Weekly Progress — income, skills, actions, readiness, Live Frame growth

## Geographic Intelligence

Every section adapts to country, city, preferred work region, languages, currency, legal environment, regulations, and government programs. Geographic data is sourced from CH2-X1 onboarding when available, with tier-based defaults otherwise.

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/professional-home` | Full living home experience |
| GET | `/professional-home/sections` | All sections |
| GET | `/professional-home/greeting` | Greeting section |
| GET | `/professional-home/todays-best-step` | Today's best step |
| GET | `/professional-home/best-opportunity` | Best opportunity |
| GET | `/professional-home/passport` | Professional passport |
| GET | `/professional-home/live-frame` | Live Frame |
| GET | `/professional-home/journey` | Professional journey |
| GET | `/professional-home/develop-me` | Develop Me |
| GET | `/professional-home/learn-by-action` | Learn by Action |
| GET | `/professional-home/my-team` | My Team |
| GET | `/professional-home/expert-recommendations` | Expert recommendations |
| GET | `/professional-home/knowledge-highlights` | Knowledge highlights |
| GET | `/professional-home/marketplace-snapshot` | Marketplace snapshot |
| GET | `/professional-home/weekly-progress` | Weekly progress |
| POST | `/professional-home/refresh` | Refresh living home |
| GET | `/professional-home/statistics` | Platform admin only |

## Intelligence Integration

Read-only composition from:

- Personal Assistant (X49) — today's best action, opportunities
- Develop Me (X50) — gaps, roadmap, readiness
- Learn by Action (X51) — experts, sessions
- Expert Network (X52) — mentor/reviewer/consultant
- Team Builder (X53) — team recommendations
- Knowledge Bank (X54) — knowledge highlights
- Marketplace Compilation (X46) — marketplace snapshot
- Intelligent Pricing (X47) — price trends
- Intelligence Orchestration (X55) — unified recommendation fallback

## Verification

```bash
npm run test:ch2-x2-professional-home
npm run verify:ch2-x2
```

## Constraints

- Experience only — no execution
- No engine names exposed to users
- Everything explainable
- Deterministic daily variation via `dayKey`
- Zero dependency violations
