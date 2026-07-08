# CH3-X15 — AN ACT Runtime Experience Coordinator

Production runtime experience coordinator — the central orchestration layer that coordinates all registered runtime experiences without owning business logic. Delegates exclusively to CH3-X5 through CH3-X14.

## Architecture

```
src/runtime-experience/runtime-coordinator/
├── domain/
│   ├── runtime-coordinator.ts
│   ├── coordination-plan.ts
│   ├── coordination-request.ts
│   ├── coordination-result.ts
│   └── coordination-session.ts
├── application/
│   ├── runtime-coordinator-service.ts
│   ├── experience-coordinator.ts
│   ├── experience-resolver.ts
│   └── execution-planner.ts
├── presentation/
│   ├── coordination-summary.ts
│   ├── coordination-map.ts
│   └── execution-view.ts
├── infrastructure/
│   └── runtime-coordinator-repository.ts
├── validation/
│   └── runtime-coordinator-validator.ts
└── module.ts
```

## Responsibilities

- Resolve which experience answers a runtime request (via registry)
- Coordinate transitions, contexts, lifecycle, navigation, return flow, and validation
- Delegate all execution to runtime journey, runtime state, and runtime registry
- Never own business behavior

## Coordinator I/O

| Inputs | Outputs |
|--------|---------|
| Runtime session / state / journey / registry | Active experience |
| Current route / requested route | Navigation decision |
| Runtime context | Transition decision |
| | Lifecycle decision |
| | Context updates |
| | Validation result |

## Runtime APIs

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/runtime-coordinator` | Coordinator overview |
| GET | `/runtime-coordinator/status` | Delegated status from state |
| GET | `/runtime-coordinator/active` | Active experience resolution |
| GET | `/runtime-coordinator/plan` | Execution plan (no side effects) |
| GET | `/runtime-coordinator/map` | Coordination map from registry |
| POST | `/runtime-coordinator/coordinate` | Coordinate without business logic |
| POST | `/runtime-coordinator/navigate` | Delegate navigation to state |
| POST | `/runtime-coordinator/transition` | Delegate transition to state |
| POST | `/runtime-coordinator/reset` | Delegate reset to state/journey |
| GET | `/runtime-coordinator/validate` | Validate coordinator integration |

## Validation

`validateRuntimeCoordinator()` verifies CH3-X5–X14 integration, coordinator delegation, lifecycle/navigation/transition/context/registry coordination, and no duplicated orchestration.

## Verification

```bash
npm run verify:ch3-x15
```

Pipeline: runtime coordinator tests → TypeScript build → dependency cruiser → runtime coordinator validation.
