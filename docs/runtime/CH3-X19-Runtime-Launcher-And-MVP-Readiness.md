# CH3-X19 — AN ACT Runtime Launcher & MVP Readiness

Production runtime launcher and MVP readiness layer for AN ACT. Single entry point that determines whether the platform is ready to be launched, previewed, demoed, or handed off to MVP implementation. Delegates entirely to CH3-X5 through CH3-X18.

## Architecture

```
src/runtime-experience/runtime-launcher/
├── domain/
│   ├── runtime-launcher.ts
│   ├── launch-mode.ts
│   ├── launch-readiness.ts
│   ├── launch-session.ts
│   └── launch-check.ts
├── application/
│   ├── runtime-launcher-service.ts
│   ├── launch-controller.ts
│   ├── readiness-evaluator.ts
│   └── launch-validator.ts
├── presentation/
│   ├── launcher-home.ts
│   ├── launch-summary.ts
│   ├── readiness-screen.ts
│   ├── launch-checklist.ts
│   ├── mvp-readiness-screen.ts
│   ├── handoff-summary.ts
│   └── screen-builder.ts
├── infrastructure/
│   └── runtime-launcher-repository.ts
├── validation/
│   └── runtime-launcher-validator.ts
└── module.ts
```

## Launch Modes (6)

Development, Preview, Demo, MVP Readiness, Handoff, Production Candidate.

Each mode exposes: id, title, description, enabled, readiness status, required experiences, missing requirements, warnings, errors, recommended next step.

## Launcher Responsibilities

- Verify Runtime Health (CH3-X16)
- Verify Runtime Demo (CH3-X17)
- Verify Runtime Preview (CH3-X18)
- Verify Runtime Coordinator (CH3-X15)
- Verify Runtime Registry (CH3-X14)
- Verify Runtime State (CH3-X13)
- Verify Runtime Journey (CH3-X12)
- Verify all user runtime experiences (CH3-X5 through CH3-X11)
- Calculate MVP readiness percentage
- Produce launch checklist
- Produce handoff summary
- Identify blockers, warnings, and final missing items

Read-only only. No launch execution. No deployment. No Bubble implementation.

## Runtime APIs

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/runtime-launcher` | Launcher overview |
| GET | `/runtime-launcher/modes` | Launch modes |
| GET | `/runtime-launcher/readiness` | MVP readiness |
| GET | `/runtime-launcher/checklist` | Launch checklist |
| GET | `/runtime-launcher/handoff` | Handoff summary |
| GET | `/runtime-launcher/blockers` | Blockers |
| GET | `/runtime-launcher/warnings` | Warnings |
| GET | `/runtime-launcher/validate` | Validate launcher layer |
| POST | `/runtime-launcher/refresh` | Refresh readiness evaluation |

## Verification

```bash
npm run verify:ch3-x19
```

Pipeline: runtime launcher tests → TypeScript build → dependency cruiser → runtime launcher validation.
