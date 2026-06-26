# CH2-X13 — Living Professional Identity Experience

## Mission

Build the Living Professional Identity Experience — the unified identity layer of APP13 that combines every previous living experience into one explainable professional identity.

**Experience only. Read-only.** Never executes marketplace operations.

## Philosophy

One Professional. One Identity. One Living Profile. Everything the user has built should be visible here.

## Architecture

```
src/living-experience/professional-identity/
  domain/
    identity-schema.ts
    identity-context.ts
    identity-sections.ts
    identity-experience.ts
  application/
    living-professional-identity-service.ts
    identity-collector.ts
  infrastructure/
    living-professional-identity-repository.ts
```

Routes use `/living-professional-identity/*`.

## Layout (13 Sections)

1. Identity Summary — title, level, score, introduction
2. Professional DNA — personality, strengths, styles
3. Professional Passport — unified passport integration
4. Live Frame — current frame, history, next upgrade
5. Professional Journey — timeline, stage, roadmap
6. Professional Impact — growth, trust, knowledge, career
7. Verified Skills — verified, pending, recommended
8. Professional Strengths — advantages, capabilities, confidence
9. Professional Opportunities — opportunities and readiness
10. Professional Reputation — trust, knowledge, influence
11. Professional Network — experts, teams, partners, mentors
12. Future Identity — 30/90 days, 1/3 years with assumptions
13. Identity Sharing — QR, verification link, permission-based views

## Identity Rules

- Read-only — never fabricate achievements or change identity automatically
- Every metric explainable
- Permission-based sharing — never share without explicit permission
- Income and partner views require user consent

## Geographic Intelligence

Adapts using country, city, language, regulations, government programs, licensing, and local opportunities.

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/living-professional-identity` | Full identity experience |
| GET | `/living-professional-identity/sections` | All sections |
| GET | `/living-professional-identity/summary` | Identity summary |
| GET | `/living-professional-identity/dna` | Professional DNA |
| GET | `/living-professional-identity/passport` | Passport integration |
| GET | `/living-professional-identity/frame` | Live Frame |
| GET | `/living-professional-identity/journey` | Journey integration |
| GET | `/living-professional-identity/impact` | Impact integration |
| GET | `/living-professional-identity/skills` | Verified skills |
| GET | `/living-professional-identity/strengths` | Professional strengths |
| GET | `/living-professional-identity/opportunities` | Opportunities |
| GET | `/living-professional-identity/reputation` | Reputation |
| GET | `/living-professional-identity/network` | Network |
| GET | `/living-professional-identity/future` | Future identity |
| GET | `/living-professional-identity/sharing` | Identity sharing |
| POST | `/living-professional-identity/sharing-permissions` | Update sharing permissions |
| POST | `/living-professional-identity/refresh` | Refresh experience |
| GET | `/living-professional-identity/statistics` | Platform admin only |

## Verification

```bash
npm run verify:ch2-x13
```
