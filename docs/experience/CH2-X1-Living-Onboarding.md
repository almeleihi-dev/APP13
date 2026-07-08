# CH2-X1 — Intelligent Onboarding Experience

## Mission

Build the complete first-user experience for APP13 — a living onboarding journey that builds the user's first professional identity.

**Experience only.** No marketplace execution, pricing, or contracts.

## Philosophy

The user should feel: *"The platform is getting to know me."*

Every question has a future purpose. No unnecessary questions. Users never see engine names — they see simple, human guidance.

## Architecture

```
src/living-experience/
  onboarding/
    domain/
      onboarding-schema.ts
      onboarding-context.ts
      onboarding-journey.ts
      onboarding-classification.ts
      onboarding-projections.ts
    application/
      living-onboarding-service.ts
      onboarding-engine-feed.ts
    infrastructure/
      living-onboarding-repository.ts
  module.ts
```

## Experience Flow (12 Steps)

| Step | Purpose |
|------|---------|
| Welcome | "We will build your professional identity." |
| Account | Basic account information |
| Iron Verification | Identity, phone, email (government verification future) |
| Geographic Intelligence | Country, city, region, languages, currency, regulations |
| Professional Background | Skills, certificates, licenses, experience, industries |
| Professional Story | Guided storytelling |
| Smart Questions | Action preferences and work style |
| Professional Calibration | Three lightweight missions (no pass/fail) |
| Initial Classification | Professional identity, readiness, interests, growth path |
| Professional Passport | First passport with verified skills and unlocked actions |
| Live Frame | First trust frame with explanation |
| Personal Home | Today's best step, passport, frame, develop/learn, opportunity, journey |

## API Routes

All routes require authentication (`authRequired: true`).

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/living-onboarding` | Overview and current progress |
| GET | `/living-onboarding/journey` | Full 12-step journey state |
| GET | `/living-onboarding/steps` | All steps with status |
| GET | `/living-onboarding/steps/:stepId` | Single step content |
| POST | `/living-onboarding/steps/:stepId` | Submit step data |
| GET | `/living-onboarding/classification` | Explainable initial classification |
| GET | `/living-onboarding/passport` | First professional passport |
| GET | `/living-onboarding/live-frame` | First Live Frame |
| GET | `/living-onboarding/home` | Personalized personal home |
| POST | `/living-onboarding/complete` | Complete onboarding, generate all outputs |
| POST | `/living-onboarding/refresh` | Refresh projections |
| GET | `/living-onboarding/statistics` | Platform admin only |

## Intelligence Integration

The onboarding engine feeds X40–X55 read-only:

- **Action Blueprint (X40)** — action context
- **Develop Me (X50)** — growth roadmap
- **Learn by Action (X51)** — learning paths
- **Expert Network (X52)** — expert signals
- **Team Builder (X53)** — team compatibility
- **Knowledge Bank (X54)** — knowledge indexing
- **Personal Assistant (X49)** — today's recommendations
- **Intelligence Orchestration (X55)** — unified recommendation

Engine contributions are traced in `engine_feeds` on complete/refresh responses.

## Explainability

Every classification includes:

- Professional identity and readiness score
- Confidence level and score
- Reasoning steps
- Alternative paths
- Missing information

## Design Principles

- Simple, friendly, professional
- One purpose per screen
- No long forms or technical terminology
- Deterministic orchestration
- Read-only toward all intelligence engines

## Verification

```bash
npm run test:ch2-x1-living-onboarding
npm run verify:ch2-x1
```

`verify:ch2-x1` chains from `verify:x55`, runs tests, build, and import lint.

## Constraints

The onboarding experience must **not**:

- Execute contracts or payments
- Modify marketplace, pricing, or commissions
- Replace any intelligence engine

Its responsibility is the **living first-user experience** only.
