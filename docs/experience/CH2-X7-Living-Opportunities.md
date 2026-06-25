# CH2-X7 — Living Opportunities Experience

## Mission

Build the Living Opportunities Experience — an intelligent opportunity engine that continuously discovers and presents the best professional opportunities for every user.

**Experience only.** No marketplace execution, contracts, or payments.

## Philosophy

Every professional should open APP13 and immediately know: **What opportunity is best for me today?**

The answer is intelligent, personalized, geographic, professional, and explainable.

## Architecture

```
src/living-experience/opportunities/
  domain/
    opportunities-schema.ts
    opportunities-context.ts
    opportunities-sections.ts
    opportunities-experience.ts
  application/
    living-opportunities-service.ts
    opportunities-collector.ts
  infrastructure/
    living-opportunities-repository.ts
```

Routes use `/living-opportunities/*`.

## Layout (13 Sections)

1. Today's Best Opportunity — exactly one, highest impact
2. Recommended Opportunities — ranked, personalized
3. Nearby Opportunities — city, region, distance, local demand
4. Marketplace Opportunities — listings with match score (experience only)
5. Government Programs — regional support with eligibility
6. Training Opportunities — free, sponsored, certification paths
7. Funding Opportunities — recommendation only
8. Team Opportunities — teams, leadership, mentorship
9. Expert Opportunities — mentorship, consulting, knowledge sharing
10. Growth Opportunities — frame, passport, actions, knowledge, income
11. Opportunity History — viewed, saved, accepted, completed
12. Saved Opportunities — bookmarks with reminder support
13. Tomorrow's Opportunity — predicted best opportunity

## Geographic Intelligence

Adapts using country, city, region, currency, regulations, government programs, language, and market demand.

## Partnership Ecosystem

Read-only recommendations at `GET /living-opportunities/partnerships` from training partners, government agencies, financial partners, insurance partners, professional associations, and certification organizations.

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/living-opportunities` | Full living opportunities experience |
| GET | `/living-opportunities/sections` | All sections |
| GET | `/living-opportunities/best` | Today's best opportunity |
| GET | `/living-opportunities/recommended` | Recommended opportunities |
| GET | `/living-opportunities/nearby` | Nearby opportunities |
| GET | `/living-opportunities/marketplace` | Marketplace opportunities |
| GET | `/living-opportunities/government` | Government programs |
| GET | `/living-opportunities/training` | Training opportunities |
| GET | `/living-opportunities/funding` | Funding opportunities |
| GET | `/living-opportunities/team` | Team opportunities |
| GET | `/living-opportunities/expert` | Expert opportunities |
| GET | `/living-opportunities/growth` | Growth opportunities |
| GET | `/living-opportunities/history` | Opportunity history |
| GET | `/living-opportunities/saved` | Saved opportunities |
| GET | `/living-opportunities/tomorrow` | Tomorrow's opportunity |
| GET | `/living-opportunities/partnerships` | Partnership recommendations |
| POST | `/living-opportunities/save` | Save an opportunity |
| POST | `/living-opportunities/refresh` | Refresh experience |
| GET | `/living-opportunities/statistics` | Platform admin only |

## Intelligence Integration

Read-only from Develop Me, Personal Assistant, Learn by Action, Expert Network, Intelligence Orchestration.

## Verification

```bash
npm run test:ch2-x7-living-opportunities
npm run verify:ch2-x7
```

## Constraints

- Not a job board — intelligent opportunity engine
- Human language, positive, explainable
- No engine names exposed
- Recommendations only — never execute
