# CH3-X17 — AN ACT Runtime Demo Mode

Official production read-only runtime demo for AN ACT. Provides deterministic demonstration of the complete journey using simulated data. Delegates playback to CH3-X12 through CH3-X16 only.

## Architecture

```
src/runtime-experience/runtime-demo/
├── domain/
│   ├── runtime-demo.ts
│   ├── demo-session.ts
│   ├── demo-scenario.ts
│   └── demo-state.ts
├── application/
│   ├── runtime-demo-service.ts
│   ├── demo-orchestrator.ts
│   ├── demo-controller.ts
│   └── demo-validator.ts
├── presentation/
│   ├── demo-home.ts
│   ├── demo-journey.ts
│   ├── demo-step.ts
│   ├── demo-summary.ts
│   ├── demo-controls.ts
│   └── screen-builder.ts
├── infrastructure/
│   └── runtime-demo-repository.ts
├── validation/
│   └── runtime-demo-validator.ts
└── module.ts
```

## Demo Scenarios (10)

First User Journey, Need Journey, Action Journey, Contract Journey, Chat Journey, Timeline Journey, Notification Journey, Profile Journey, Full Runtime Journey, Return Journey.

Each scenario exposes: id, title, description, runtime mode, entry screen, current step, total steps, progress, expected destination, readiness, validation status.

## Demo Controls

start, pause, resume, restart, next, previous, stop — read-only only.

## Delegation

Playback delegates to Runtime Journey, Runtime State, Runtime Registry, Runtime Coordinator, and Runtime Health. Never owns orchestration.

## Runtime APIs

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/runtime-demo` | Demo overview |
| GET | `/runtime-demo/scenarios` | List scenarios |
| GET | `/runtime-demo/scenario/:id` | Scenario detail |
| GET | `/runtime-demo/session` | Active demo session |
| GET | `/runtime-demo/summary` | Runtime summary |
| GET | `/runtime-demo/validate` | Validate demo layer |
| POST | `/runtime-demo/start` | Start scenario |
| POST | `/runtime-demo/pause` | Pause playback |
| POST | `/runtime-demo/resume` | Resume playback |
| POST | `/runtime-demo/restart` | Restart scenario |
| POST | `/runtime-demo/next` | Next step |
| POST | `/runtime-demo/previous` | Previous step |
| POST | `/runtime-demo/stop` | Stop demo |

## Verification

```bash
npm run verify:ch3-x17
```

Pipeline: runtime demo tests → TypeScript build → dependency cruiser → runtime demo validation.
