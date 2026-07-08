# CH3-X13 — AN ACT Runtime State & Session Engine

Production runtime state engine that manages the entire AN ACT application session across all runtime experiences. Single authoritative source of runtime truth — delegates orchestration to CH3-X12, never duplicates runtime logic.

## Architecture

```
src/runtime-experience/runtime-state/
├── domain/
│   ├── runtime-state.ts
│   ├── runtime-session.ts
│   ├── runtime-phase.ts
│   ├── runtime-context.ts
│   └── runtime-history.ts
├── application/
│   ├── runtime-state-service.ts
│   ├── session-manager.ts
│   ├── context-manager.ts
│   └── lifecycle-manager.ts
├── presentation/
│   ├── runtime-state-summary.ts
│   ├── session-inspector.ts
│   └── lifecycle-view.ts
├── infrastructure/
│   └── runtime-state-repository.ts
├── validation/
│   └── runtime-state-validator.ts
└── module.ts
```

Consumes CH3-X5 through CH3-X12 only. No business logic, no AI, no persistence modification, no custom UI.

## Responsibilities

Maintains one authoritative runtime session tracking:

| Field | Description |
|-------|-------------|
| Current screen | Active screen identifier |
| Previous screen | Prior screen before last transition |
| Current mode | Need / Action / Transition |
| Navigation stack | Ordered route history |
| Runtime phase | Application lifecycle phase |
| Active contract | Contract context from handoff |
| Active conversation | Chat context from handoff |
| Active timeline | Timeline route context |
| Active notification | Notification route context |
| Active profile | Profile route context |
| Transition progress | Stage, in-progress flag, route |
| Session history | Step history with phase and mode |
| Return destination | Route for return transition |
| Launch timestamp | Session start time |
| Last activity timestamp | Most recent state update |

## Lifecycle

```
Launch
  ↓
Need Session
  ↓
Transition
  ↓
Action Session
  ↓
Completion
  ↓
Return Transition
  ↓
Need Session
```

## Runtime APIs

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/runtime-state` | Authoritative runtime state view |
| GET | `/runtime-state/session` | Session with inspector |
| GET | `/runtime-state/history` | Session history |
| GET | `/runtime-state/context` | Active contexts |
| GET | `/runtime-state/phase` | Lifecycle phase view |
| POST | `/runtime-state/start` | Start session (delegates to journey) |
| POST | `/runtime-state/update` | Advance or back via journey |
| POST | `/runtime-state/transition` | Advance through transition |
| POST | `/runtime-state/finish` | Complete session |
| POST | `/runtime-state/reset` | Reset session |
| GET | `/runtime-state/validate` | Validate integration |

## Validation

`validateRuntimeState()` verifies CH3-X5 through CH3-X12 integration, session/navigation/transition/lifecycle/context/history continuity, state consistency, no duplicate runtime state, and no dependency violations.

## Verification

```bash
npm run verify:ch3-x13
```

Pipeline: runtime state tests → TypeScript build → dependency cruiser → runtime state validation.
