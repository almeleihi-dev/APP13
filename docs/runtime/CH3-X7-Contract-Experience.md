# CH3-X7 — AN ACT Contract Experience

Production runtime Contract Experience for AN ACT. Turns the request/action handoff into a clear, reviewable, transparent contract journey before and during execution.

## Architecture

```
src/runtime-experience/contract/
├── domain/
│   ├── contract-screen.ts
│   ├── contract-layout.ts
│   ├── contract-state.ts
│   ├── contract-actions.ts
│   └── contract-summary.ts
├── application/
│   ├── contract-experience-service.ts
│   ├── contract-navigation.ts
│   ├── contract-transition.ts
│   └── contract-review.ts
├── presentation/
│   ├── screen-builder.ts
│   ├── contract-home.ts
│   ├── contract-review-screen.ts
│   ├── contract-parties.ts
│   ├── contract-terms.ts
│   ├── contract-timeline.ts
│   ├── contract-cost.ts
│   ├── contract-confirmation.ts
│   ├── contract-status.ts
│   └── contract-empty-state.ts
├── infrastructure/
│   └── contract-repository.ts
├── validation/
│   └── contract-experience-validator.ts
└── module.ts
```

Consumes CH3-X1 through CH3-X6 only. No Bubble, no custom styling, no payment logic, no legal automation, no auto-confirmation.

## Runtime Flow

```
Action Home
    ↓
Contract Preview (Action Experience)
    ↓
Contract Home
    ↓
Contract Review → Parties → Terms → Timeline → Cost → Confirmation → Status
    ↓
Official Transition (an act...)
    ↓
Active Action
```

## Contract State Model

| Field | Description |
|-------|-------------|
| `status` | `draft` \| `reviewing` \| `confirmed` \| `active` \| `completed` \| `cancelled` |
| `userConfirmed` | Explicit user confirmation flag — never set automatically |
| `visitedSections` | Sections the user has reviewed |
| `summary` | Full contract summary model (parties, terms, timeline, cost, review) |

Status transitions are deterministic display/state handling only — no legal decisions.

## Screens

| Screen | Route | Purpose |
|--------|-------|---------|
| Contract Home | `/contract/home` | Summary, status, cost, time, location, Live Frame, next step |
| Contract Review | `/contract/review` | Action summary, scope, assumptions, exclusions, risks, confidence |
| Parties | `/contract/parties` | Customer/provider, verification, badges, Live Frame |
| Terms | `/contract/terms` | Scope, steps, responsibilities, acceptance, disclaimers |
| Timeline | `/contract/timeline` | Start, duration, milestones, checkpoints |
| Cost | `/contract/cost` | Estimate, fee/escrow placeholders, assumptions |
| Confirmation | `/contract/confirmation` | Final review, explicit user confirmation |
| Status | `/contract/status` | Lifecycle states, continue to active action |
| Transition | `/system/transition` | Official transition to active action |
| Empty State | `/contract/empty` | Guided fallback |

## Transition Behavior

Brand: `an act...`

Stages (Contract Review → Active Action):

1. Reviewing...
2. Building Contract...
3. Confirming...
4. Action Ready.

Uses official transition components only (`core-ui-loading`, `core-ui-progress` terminal variant).

## Navigation

- Back (stack pop)
- Contract section navigation (bottom nav + section nav)
- Transition navigation (hides bottom nav during transition)
- Return to Action Home (`/action/home`)

## Accessibility

- 44px minimum touch targets
- Keyboard navigation
- Screen reader landmarks and transition announcements
- Reduced motion support
- Focus management per CH3-X3

## API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/contract-experience` | Full experience state |
| POST | `/contract-experience/enter` | Enter from action preview |
| GET | `/contract-experience/home` | Contract home |
| GET | `/contract-experience/review` | Contract review |
| GET | `/contract-experience/parties` | Parties |
| GET | `/contract-experience/terms` | Terms |
| GET | `/contract-experience/timeline` | Timeline |
| GET | `/contract-experience/cost` | Cost |
| GET | `/contract-experience/confirmation` | Confirmation |
| GET | `/contract-experience/status` | Status |
| POST | `/contract-experience/confirm` | Explicit user confirmation |
| POST | `/contract-experience/transition/start` | Start transition |
| POST | `/contract-experience/transition/advance` | Advance transition |
| GET | `/contract-experience/flow` | Flow definition |
| GET | `/contract-experience/validate` | Runtime validation |

## Implementation Notes

- **No payment logic** — cost/escrow/platform fee are placeholders
- **No chat** — contact availability is a placeholder button
- **No dispute engine** — dispute note is informational only
- **No auto-confirm** — `confirmContract` requires `confirmed: true` from user
- **CH3-X5/X6 integration** — accepts `need_handoff` from Need request draft; links versions in flow metadata

## Verification

```bash
npm run verify:ch3-x7
```
