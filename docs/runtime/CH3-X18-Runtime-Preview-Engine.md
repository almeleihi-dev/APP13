# CH3-X18 — AN ACT Runtime Preview Engine

Production read-only preview layer for every runtime experience before execution. Delegates entirely to CH3-X5 through CH3-X17. No lifecycle mutations, no persistence, no AI, no networking.

## Architecture

```
src/runtime-experience/runtime-preview/
├── domain/
│   ├── runtime-preview.ts
│   ├── preview-session.ts
│   ├── preview-screen.ts
│   └── preview-state.ts
├── application/
│   ├── runtime-preview-service.ts
│   ├── preview-builder.ts
│   ├── preview-controller.ts
│   └── preview-validator.ts
├── presentation/
│   ├── preview-home.ts
│   ├── preview-need.ts
│   ├── preview-action.ts
│   ├── preview-contract.ts
│   ├── preview-chat.ts
│   ├── preview-timeline.ts
│   ├── preview-notification.ts
│   ├── preview-profile.ts
│   ├── preview-summary.ts
│   └── screen-builder.ts
├── infrastructure/
│   └── runtime-preview-repository.ts
├── validation/
│   └── runtime-preview-validator.ts
└── module.ts
```

## Preview Coverage (13 targets)

Need, Action, Contract, Chat, Timeline, Notification, Profile, Runtime Journey, Runtime State, Runtime Registry, Runtime Coordinator, Runtime Health, Runtime Demo.

Each target exposes: id, title, description, category, entry screen, delegate module, readiness, validation status.

## Delegation

| Target | Delegates to |
|--------|-------------|
| Need | CH3-X5 `getHome` |
| Action | CH3-X6 `getHome` |
| Contract | CH3-X7 `getHome` |
| Chat | CH3-X8 `getHome` |
| Timeline | CH3-X9 `getHome` |
| Notification | CH3-X10 `getHome` |
| Profile | CH3-X11 `getHome` |
| Runtime Journey | CH3-X12 `getJourney` |
| Runtime State | CH3-X13 `getState` |
| Runtime Registry | CH3-X14 `getRegistry` |
| Runtime Coordinator | CH3-X15 `getCoordinator` |
| Runtime Health | CH3-X16 `getHealth` |
| Runtime Demo | CH3-X17 `getDemo` |

Never owns orchestration. Read-only only.

## Runtime APIs

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/runtime-preview` | Preview overview |
| GET | `/runtime-preview/coverage` | List all preview targets |
| GET | `/runtime-preview/target/:id` | Preview specific target |
| GET | `/runtime-preview/session` | Active preview session |
| GET | `/runtime-preview/summary` | Preview summary |
| GET | `/runtime-preview/all` | All target previews |
| GET | `/runtime-preview/validate` | Validate preview layer |

## Verification

```bash
npm run verify:ch3-x18
```

Pipeline: runtime preview tests → TypeScript build → dependency cruiser → runtime preview validation.
