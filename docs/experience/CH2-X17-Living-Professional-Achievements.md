# CH2-X17 — Living Professional Achievements

## Mission

Build the Living Professional Achievements experience — record, organize, explain, and project professional accomplishments as a living achievement portfolio.

**Experience only. Read-only. Never grants or verifies real credentials.**

## Philosophy

Achievements are deterministic evaluations derived from living experience data. The system recommends and projects — it never grants certificates, verifies credentials, or creates real achievements.

## Architecture

```
src/living-experience/professional-achievements/
  domain/
    achievements-schema.ts
    achievements-context.ts
    achievements-sections.ts
    achievements-experience.ts
  application/
    living-professional-achievements-service.ts
    achievements-collector.ts
  infrastructure/
    living-professional-achievements-repository.ts
```

Routes use `/living-professional-achievements/*`.

## Layout (13 Sections)

1. Achievements Summary — portfolio overview and achievement score
2. Professional Milestones — experience and readiness milestones
3. Certifications — from onboarding profile (never issued)
4. Awards & Honors — from professional story
5. Professional Badges — live frame and passport badges
6. Career Records — career-changing projects
7. Skill Achievements — identity and develop-me proficiency
8. Financial Achievements — income readiness from impact
9. Leadership Achievements — coach and calibration recognition
10. Achievement Timeline — chronological portfolio
11. Recommended Next Achievements — achievement engine recommendations
12. Confidence & Explanation — evidence-based confidence
13. Achievement History — accepted/ignored records

## Achievement Contract

Every achievement includes:

- id, title, description, category, level, earned_date, source
- evidence, verification_status, credibility_score, impact_score, rarity_score
- progress_to_next_level, recommendations, confidence_score, explanation

## Achievement Engine

Deterministic evaluation producing:

- achievement_score, achievement_level, achievement_progression
- unlocked_achievements, next_recommended_achievements
- achievement_gaps, projected_future_achievements

## Experience Rules

- `never_issue_real_certificates: true`
- `never_verify_real_credentials: true`
- Plus standard experience-only flags

## Verification

```bash
npm run verify:ch2-x17
```
