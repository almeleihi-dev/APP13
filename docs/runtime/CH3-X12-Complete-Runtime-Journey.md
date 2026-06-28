# CH3-X12 — AN ACT Complete Runtime Journey

Production runtime journey connecting CH3-X5 through CH3-X11 into one deterministic application flow. Orchestrates existing runtime experiences only — no duplicate screens, no business logic, no AI, no persistence modification.

## Architecture

```
src/runtime-experience/runtime-journey/
├── domain/
│   ├── runtime-journey.ts
│   ├── runtime-step.ts
│   ├── runtime-state.ts
│   └── runtime-session.ts
├── application/
│   ├── runtime-journey-service.ts
│   ├── runtime-orchestrator.ts
│   └── runtime-navigation.ts
├── presentation/
│   ├── runtime-builder.ts
│   ├── first-user-journey.ts
│   ├── return-journey.ts
│   └── session-summary.ts
├── infrastructure/
│   └── runtime-journey-repository.ts
├── validation/
│   └── runtime-journey-validator.ts
└── module.ts
```

Consumes CH3-X5 through CH3-X11 only. Delegates to existing experience services — never duplicates screens.

## Official Runtime Flow

```
Launch
  ↓
Need Home
  ↓
Search
  ↓
Opportunity List
  ↓
Request
  ↓
an act...
  ↓
Action Home
  ↓
Contract
  ↓
Chat
  ↓
Timeline
  ↓
Notification
  ↓
Profile
  ↓
Completion
  ↓
Return Transition
  ↓
Need Home
```

## Preserved State

| State | Description |
|-------|-------------|
| Navigation state | Current step, route, back/next availability |
| Transition state | Need and action transition payloads |
| Runtime session | Session id, history, generated_at |
| Handoff context | Need request, action id, contract id, conversation id |
| Return context | From experience, return route, completion flag |
| Lifecycle state | Phase (launch, need, transition, action, contract, shared, completion, return) |

## Experience Integration

| Step | Experience | Screen |
|------|------------|--------|
| Need Home | CH3-X5 Need | need-home |
| Search | CH3-X5 Need | search |
| Opportunity List | CH3-X5 Need | opportunity-list |
| Request | CH3-X5 Need | request |
| an act... | CH3-X5 Need | transition |
| Action Home | CH3-X6 Action | action-home |
| Contract | CH3-X7 Contract | contract-home |
| Chat | CH3-X8 Chat | chat-home |
| Timeline | CH3-X9 Timeline | timeline-home |
| Notification | CH3-X10 Notification | notification-home |
| Profile | CH3-X11 Profile | profile-home |
| Completion | CH3-X6 Action | completion-screen |
| Return Transition | CH3-X6 Action | transition |

## Runtime APIs

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/runtime-journey` | Full journey view |
| GET | `/runtime-journey/launch` | Launch journey (alias for start) |
| GET | `/runtime-journey/current` | Current step with active experience |
| GET | `/runtime-journey/session` | Session state and presentation |
| GET | `/runtime-journey/history` | Step history |
| POST | `/runtime-journey/start` | Start journey at launch |
| POST | `/runtime-journey/next` | Advance to next step |
| POST | `/runtime-journey/back` | Go to previous step |
| POST | `/runtime-journey/finish` | Complete journey at need home return |
| POST | `/runtime-journey/reset` | Reset and restart journey |
| GET | `/runtime-journey/validate` | Validate journey integration |

## Validation

`validateRuntimeJourney()` verifies:

- CH3-X5 through CH3-X11 integration
- Navigation continuity
- Transition continuity
- Session continuity
- Lifecycle continuity
- No broken routes
- No duplicated runtime screens
- No dependency violations

## Verification

```bash
npm run verify:ch3-x12
```

Pipeline: tests → TypeScript build → dependency cruiser → complete runtime journey validation.
