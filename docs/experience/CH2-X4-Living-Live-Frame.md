# CH2-X4 — Living Live Frame Experience

## Mission

Build the Living Live Frame Experience — the user's living trust identity. Not just a score. It explains why the current frame exists, how it changes, how to improve it, and what affects it.

**Experience only.** No marketplace, payment, or contract execution.

## Philosophy

The Live Frame must feel alive. Every completed action, verified achievement, successful project, customer review, and learning milestone influences the frame. Users always understand why their frame changed.

## Architecture

```
src/living-experience/live-frame/
  domain/
    live-frame-schema.ts
    live-frame-context.ts
    live-frame-sections.ts
    live-frame-experience.ts
  application/
    living-live-frame-service.ts
    live-frame-collector.ts
  infrastructure/
    living-live-frame-repository.ts
```

Routes use `/living-live-frame/*` to distinguish from X2's `/live-frame/*`.

## Layout (13 Sections)

1. Current Live Frame — tier, color, professional explanation
2. Frame Meaning — what this frame represents
3. Trust Score — trust, readiness, confidence (explainable)
4. Frame History — previous frames, upgrades, milestones
5. Progress — percentage, remaining requirements, next upgrade
6. Positive Drivers — verified work, skills, knowledge, training, trust
7. Negative Drivers — missing skills, licenses, low activity
8. Professional Growth — frame improvement over time
9. Recommendations — highest-impact improvement actions
10. Timeline — chronological frame events
11. Achievements — frame-related achievements
12. Verified Evidence — evidence supporting the frame
13. Future Projection — expected frame if recommendations completed

## Frame Tiers

Watchlist → Standard → Trusted → Emerald Pro → Platinum Elite

## Geographic Intelligence

Adapted to country, professional regulations, licensing, and government requirements via CH2-X1 onboarding data.

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/living-live-frame` | Full living frame experience |
| GET | `/living-live-frame/sections` | All sections |
| GET | `/living-live-frame/current` | Current Live Frame |
| GET | `/living-live-frame/meaning` | Frame meaning |
| GET | `/living-live-frame/trust-score` | Trust score breakdown |
| GET | `/living-live-frame/history` | Frame history |
| GET | `/living-live-frame/progress` | Progress to next frame |
| GET | `/living-live-frame/positive-drivers` | Positive drivers |
| GET | `/living-live-frame/negative-drivers` | Negative drivers |
| GET | `/living-live-frame/growth` | Professional growth |
| GET | `/living-live-frame/recommendations` | Improvement recommendations |
| GET | `/living-live-frame/timeline` | Frame timeline |
| GET | `/living-live-frame/achievements` | Achievements |
| GET | `/living-live-frame/evidence` | Verified evidence |
| GET | `/living-live-frame/projection` | Future projection |
| POST | `/living-live-frame/refresh` | Refresh living frame |
| GET | `/living-live-frame/statistics` | Platform admin only |

## Intelligence Integration

Read-only composition from Develop Me, Personal Assistant, Learn by Action, Knowledge Bank, and Intelligence Orchestration.

## Verification

```bash
npm run test:ch2-x4-living-live-frame
npm run verify:ch2-x4
```

## Constraints

- Trust-first, explainable, human language only
- No engine names exposed to users
- Zero dependency violations
