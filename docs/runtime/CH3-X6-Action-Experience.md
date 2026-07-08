# CH3-X6 — AN ACT Action Experience

The first production runtime Action-side experience for AN ACT. Begins immediately after the official Need-to-Action transition completes at **Action Ready.**

## Architecture

```
src/runtime-experience/action/
├── domain/
│   ├── action-screen.ts
│   ├── action-layout.ts
│   ├── action-state.ts
│   └── action-actions.ts
├── application/
│   ├── action-experience-service.ts
│   ├── action-navigation.ts
│   └── action-transition.ts
├── presentation/
│   ├── screen-builder.ts
│   ├── action-home.ts
│   ├── contract-preview.ts
│   ├── active-action.ts
│   ├── progress-screen.ts
│   ├── completion-screen.ts
│   ├── waiting-screen.ts
│   └── transition-screen.ts
├── infrastructure/
│   └── action-repository.ts
├── validation/
│   └── action-experience-validator.ts
└── module.ts
```

Consumes CH3-X1 through CH3-X5 only. No Bubble, no custom styling, no duplicated components.

## Runtime Flow

```
Transition Complete (Action Ready)
    ↓
Action Home
    ↓
Contract Preview
    ↓
Active Action
    ↓
Progress
    ↓
Completion
    ↓
Return Transition (an act...)
    ↓
Need Mode
```

Encoded in `ACTION_EXPERIENCE_FLOW`.

## Screens

### Action Home (`/action/home`)

- Current action
- Live status
- Active contract
- Remaining time
- Customer summary
- Live Frame
- Quick actions
- Bottom navigation + floating action button

### Contract Preview (`/action/contract`)

- Action summary
- Parties
- Time, cost, location, notes
- Agreement status
- Continue button

### Active Action (`/action/active`)

- Current stage
- Progress
- Timer
- Required steps
- Attachments placeholder
- Contact shortcut

### Progress (`/action/progress`)

- Timeline progress
- Current milestone
- Remaining milestones
- Completion percentage

### Completion (`/action/completion`)

- Completion summary
- Success state
- Continue button (starts return transition)

### Waiting (`/action/waiting`)

- Waiting for customer
- Waiting for confirmation
- Waiting for payment (no payment logic)

## Transitions

### Entry

Action Experience begins via `POST /action-experience/enter` after CH3-X5 Need transition completes. Accepts optional `need_handoff` from Need request draft.

### Return (Official)

Brand: `an act...`

Return stages:

1. Preparing...
2. Building Contract...
3. Executing...
4. Completing...
5. Returning...

Background path: Action Layout → Transition → Need Layout

Uses `core-ui-loading` and `core-ui-progress` (terminal variant) only.

## Navigation

| Pattern | Support |
|---------|---------|
| Back | Stack pop |
| Bottom navigation | Home, Contract, Progress, Completion |
| Contract navigation | Direct route to contract preview |
| Progress navigation | Direct route to progress screen |
| Transition navigation | Hides bottom nav and FAB during transition |

## Accessibility

- 44px minimum touch targets
- Keyboard navigation (tab order follows layout)
- Screen reader landmarks and transition stage announcements
- Reduced motion (skip animations, preserve progress)
- Focus management per CH3-X3 specs

## API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/action-experience` | Full experience state |
| POST | `/action-experience/enter` | Enter from Need transition |
| GET | `/action-experience/home` | Action Home |
| GET | `/action-experience/contract` | Contract preview |
| GET | `/action-experience/active` | Active action |
| GET | `/action-experience/progress` | Progress screen |
| GET | `/action-experience/completion` | Completion screen |
| GET | `/action-experience/waiting` | Waiting screen |
| POST | `/action-experience/contract/continue` | Continue to active action |
| POST | `/action-experience/complete` | Complete action |
| POST | `/action-experience/return` | Start return transition |
| POST | `/action-experience/transition/advance` | Advance return transition |
| GET | `/action-experience/flow` | Flow definition |
| GET | `/action-experience/validate` | Runtime validation |

## Implementation Notes

- **No chat** — contact shortcut is a button placeholder only
- **No payment logic** — waiting-for-payment is a display state only
- **No business logic** — repository holds demo execution context
- **CH3-X5 integration** — `need_handoff` maps Need request draft to action contract
- **Prototype compliance** — each screen maps via `ACTION_SCREEN_PROTOTYPE_MAP`

## Verification

```bash
npm run verify:ch3-x6
```
