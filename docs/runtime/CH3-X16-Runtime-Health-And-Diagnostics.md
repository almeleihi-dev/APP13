# CH3-X16 — AN ACT Runtime Health & Diagnostics

Production read-only runtime health and diagnostics layer for AN ACT. Consumes CH3-X5 through CH3-X15 validators and registry data only — never duplicates runtime logic.

## Architecture

```
src/runtime-experience/runtime-health/
├── domain/
│   ├── runtime-health.ts
│   ├── runtime-status.ts
│   ├── health-summary.ts
│   └── health-check.ts
├── application/
│   ├── runtime-health-service.ts
│   ├── diagnostics-service.ts
│   ├── health-validator.ts
│   └── health-reporter.ts
├── presentation/
│   ├── health-dashboard.ts
│   ├── health-summary-screen.ts
│   ├── diagnostics-screen.ts
│   ├── experience-health-screen.ts
│   ├── validation-screen.ts
│   └── screen-builder.ts
├── infrastructure/
│   └── runtime-health-repository.ts
├── validation/
│   └── runtime-health-validator.ts
└── module.ts
```

## Runtime Health Dashboard

| Field | Description |
|-------|-------------|
| Overall runtime status | healthy / degraded / unhealthy |
| Runtime version | Health module version |
| Registered experiences | Count (11) |
| Healthy experiences | Passing validation count |
| Warning / error counts | Aggregated from diagnostics |
| Validation status | Platform validation result |
| Readiness percentage | Healthy / registered × 100 |
| Coordinator / registry / journey / state status | Component health |

## Experience Diagnostics (11)

Need, Action, Contract, Chat, Timeline, Notification, Profile, Runtime Journey, Runtime State, Runtime Registry, Runtime Coordinator.

Each report includes: id, name, version, availability, validation status, dependency status, route status, lifecycle status, accessibility status, overall health, warnings, errors, recommendations.

## Runtime APIs

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/runtime-health` | Full health view |
| GET | `/runtime-health/dashboard` | Dashboard with summary |
| GET | `/runtime-health/diagnostics` | All experience diagnostics |
| GET | `/runtime-health/experience/:id` | Single experience health |
| GET | `/runtime-health/validation` | Validate health layer |
| POST | `/runtime-health/refresh` | Refresh diagnostics (reload registry) |

## Validation

`validateRuntimeHealth()` verifies CH3-X5–X15 registration, registry integrity, coordinator delegation, journey availability, state continuity, route availability, validator availability, accessibility compliance, readiness percentage, and no duplicated runtime logic.

## Verification

```bash
npm run verify:ch3-x16
```

Pipeline: runtime health tests → TypeScript build → dependency cruiser → runtime health validation.
