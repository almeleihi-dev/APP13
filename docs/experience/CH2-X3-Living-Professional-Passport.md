# CH2-X3 — Living Professional Passport Experience

## Mission

Build the Living Professional Passport — the user's permanent professional identity inside APP13. Not a profile page. A trusted professional identity that summarizes who the user is, what they can do, why they are trusted, and how they continue to grow.

**Experience only.** No marketplace execution, payments, or contracts.

## Philosophy

One professional. One passport. Lifetime evolution.

Every completed action, verified skill, certificate, license, contribution, project, and learning achievement strengthens the passport over time.

## Architecture

```
src/living-experience/professional-passport/
  domain/
    passport-schema.ts
    passport-context.ts
    passport-sections.ts
    passport-experience.ts
  application/
    living-passport-service.ts
    passport-collector.ts
  infrastructure/
    living-passport-repository.ts
```

Routes use `/living-passport/*` to distinguish from X9's `/professional-passport/*`.

## Layout (13 Sections)

1. Professional Identity — ID, title, profession, summary, level
2. Professional Score — overall, readiness, trust, growth, confidence (explainable)
3. Live Frame — current frame, history, progress, reason
4. Verified Skills — verified, pending, recommended
5. Unlocked Actions — available, mastered, in progress, suggested next
6. Professional Roles — professional, trainer, supervisor, consultant, etc.
7. Certificates & Licenses — credentials, memberships, expiry reminders
8. Professional Experience — projects, actions, years, industries
9. Trust Timeline — milestones, achievements, frame upgrades, verified history
10. Knowledge Contributions — blueprint, knowledge bank, reviews, learning
11. Professional Impact — trained, teams, projects, satisfaction, influence
12. Career Journey — past, present, next goal, recommended path
13. Sharing & Verification — QR, secure link, partner/employer views (permission only)

## Geographic Intelligence

Passport adapts to country, regulations, licenses, language, currency, government requirements, and professional standards. Data sourced from CH2-X1 onboarding when available.

## Partnership Ecosystem

Passport sharing requires **explicit user approval**. Supported partner types:

- Training Partner
- Financial Partner
- Insurance Partner
- Employer
- Government Agency
- Certification Body

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/living-passport` | Full living passport |
| GET | `/living-passport/sections` | All sections |
| GET | `/living-passport/identity` | Professional identity |
| GET | `/living-passport/score` | Professional score |
| GET | `/living-passport/live-frame` | Live Frame |
| GET | `/living-passport/skills` | Verified skills |
| GET | `/living-passport/actions` | Unlocked actions |
| GET | `/living-passport/roles` | Professional roles |
| GET | `/living-passport/credentials` | Certificates & licenses |
| GET | `/living-passport/experience` | Professional experience |
| GET | `/living-passport/trust-timeline` | Trust timeline |
| GET | `/living-passport/knowledge` | Knowledge contributions |
| GET | `/living-passport/impact` | Professional impact |
| GET | `/living-passport/journey` | Career journey |
| GET | `/living-passport/sharing` | Sharing & verification |
| GET | `/living-passport/partners` | Approved partners |
| POST | `/living-passport/partners/approve` | Approve partner share |
| POST | `/living-passport/partners/revoke` | Revoke partner share |
| POST | `/living-passport/refresh` | Refresh passport |
| GET | `/living-passport/statistics` | Platform admin only |

## Intelligence Integration

Read-only composition from Develop Me, Learn by Action, Expert Network, Team Builder, Knowledge Bank, Personal Assistant, and Intelligence Orchestration.

## Verification

```bash
npm run test:ch2-x3-living-passport
npm run verify:ch2-x3
```

## Constraints

- Trust-first, explainable, human language only
- No engine names exposed to users
- Sharing only with explicit approval
- Zero dependency violations
