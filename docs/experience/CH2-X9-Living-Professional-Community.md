# CH2-X9 — Living Professional Community Experience

## Mission

Build the Living Professional Community Experience — a professional ecosystem where people learn, help, collaborate, and grow through verified actions and knowledge.

**This is NOT a social network.** Experience only.

## Philosophy

People come to learn, teach, collaborate, ask, answer, build teams, and share verified experience. Every interaction strengthens professional reputation — measured by real impact, not followers or likes.

## Architecture

```
src/living-experience/professional-community/
  domain/
    community-schema.ts
    community-context.ts
    community-sections.ts
    community-experience.ts
  application/
    living-professional-community-service.ts
    community-collector.ts
  infrastructure/
    living-professional-community-repository.ts
```

Routes use `/living-professional-community/*`.

## Layout (13 Sections)

1. Community Overview — summary, groups joined, contribution score
2. Today's Community Highlight — exactly one valuable discussion
3. Professional Groups — by profession, action, industry, city, certification
4. Nearby Professionals — with explainable compatibility
5. Questions & Answers — verified answers, solved questions
6. Knowledge Contributions — blueprints, guides, Knowledge Bank links
7. Helpful Contributions — Helpful, Applied, Verified, Professional (no likes)
8. Expert Discussions — mentors, consultants, trainers, leaders
9. Community Challenges — learning, action, knowledge, team missions
10. Professional Events — meetups, workshops, conferences
11. Collaboration Requests — mentor, expert, team, trainer, reviewer
12. Community Reputation — explainable scores
13. Next Recommended Community Action — highest impact action

## Community Rules

- Professional only, verified identity
- No anonymous abuse, no popularity ranking
- Professional value before popularity
- Reward helping, teaching, verified answers — never spam or likes alone

## Geographic Intelligence

Adapts using country, city, region, language, profession, industry, and regulations.

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/living-professional-community` | Full community experience |
| GET | `/living-professional-community/sections` | All sections |
| GET | `/living-professional-community/overview` | Community overview |
| GET | `/living-professional-community/highlight` | Today's highlight |
| GET | `/living-professional-community/groups` | Professional groups |
| GET | `/living-professional-community/nearby` | Nearby professionals |
| GET | `/living-professional-community/qa` | Questions & answers |
| GET | `/living-professional-community/knowledge` | Knowledge contributions |
| GET | `/living-professional-community/helpful` | Helpful contributions |
| GET | `/living-professional-community/experts` | Expert discussions |
| GET | `/living-professional-community/challenges` | Community challenges |
| GET | `/living-professional-community/events` | Professional events |
| GET | `/living-professional-community/collaboration` | Collaboration requests |
| GET | `/living-professional-community/reputation` | Community reputation |
| GET | `/living-professional-community/next` | Next recommended action |
| POST | `/living-professional-community/refresh` | Refresh experience |
| GET | `/living-professional-community/statistics` | Platform admin only |

## Verification

```bash
npm run test:ch2-x9-living-professional-community
npm run verify:ch2-x9
```

## Constraints

- Human language, trust-first, explainable
- No engine names exposed
- No likes — helpful contribution system only
