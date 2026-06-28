# CH3-X5 — AN ACT Need Experience

The first production runtime experience of AN ACT. This module implements the complete Need-side user journey using CH3-X1 through CH3-X4.

## Architecture

```
src/runtime-experience/need/
├── domain/
│   ├── need-screen.ts      # Screen IDs, runtime view types, flow definition
│   ├── need-layout.ts      # Need/transition layout bindings (CH3-X3)
│   ├── need-state.ts       # Session, search, and request draft state
│   └── need-actions.ts     # Navigation and interaction actions
├── application/
│   ├── need-experience-service.ts  # Orchestrates screens and session
│   ├── need-navigation.ts          # Back, bottom nav, stack navigation
│   └── need-transition.ts          # Official an act... transition
├── presentation/
│   ├── screen-builder.ts   # Shared runtime screen builder
│   ├── need-home.ts
│   ├── search-screen.ts
│   ├── opportunity-list.ts
│   ├── request-screen.ts
│   └── empty-state.ts      # Empty state + transition screen builders
├── infrastructure/
│   └── need-repository.ts  # Demo categories, opportunities, activity
├── validation/
│   └── need-experience-validator.ts
└── module.ts
```

### Layer responsibilities

| Layer | Role |
|-------|------|
| Domain | Screen identity, state shapes, action types |
| Application | Service orchestration, navigation, transition engine |
| Presentation | Runtime screen payloads referencing CH3-X2 components |
| Infrastructure | In-memory repository for demo data |
| Validation | Token, component, prototype, navigation, accessibility, transition compliance |

## Flow

```
App Launch
    ↓
Need Home
    ↓
Search
    ↓
Opportunity List
    ↓
Request Screen
    ↓
an act...
    ↓
Transition Layer
    ↓
Action Mode
```

The official flow is encoded in `NEED_EXPERIENCE_FLOW` and mirrors CH3-X4 `flow-search-to-action`.

## Screens

### Need Home (`/need/home`)

- Welcome section
- Search entry (`core-ui-search`)
- Quick categories (`core-ui-chip`)
- Recommended actions (`core-ui-card`)
- Recent activity
- Suggested opportunities
- Bottom navigation (`core-ui-bottom-navigation`)

### Search (`/need/search`)

- Keyword search
- Category filters
- Recent searches
- Suggestions
- Loading state (`core-ui-loading`)
- Empty state (via `empty-state` screen)

### Opportunity List (`/need/opportunities`)

Each card includes:

- Live Frame (`core-ui-live-frame`)
- Rating
- Distance
- Availability
- Estimated time
- Estimated cost
- Professional badges (`core-ui-badge`)

### Request (`/need/request/create`)

- Action summary
- Location input
- Schedule input
- Notes input
- Estimated cost display
- Continue button (`core-ui-button`)

### Transition (`/system/transition`)

Official transition only:

- Brand line: `an act...`
- Dynamic stage text: Preparing… → Matching… → Building Contract… → Securing… → Action Ready.
- Terminal progress (`core-ui-progress`, variant: terminal)
- Background interpolation: Need → Transition → Action

## Navigation

| Pattern | Support |
|---------|---------|
| Back | Stack pop via `navigateBack` |
| Bottom Navigation | Home, Search, Timeline, Profile tabs |
| Search Navigation | Search entry routes to search screen |
| Transition Navigation | Hides bottom nav, blocks interaction |

Navigation consumes CH3-X3 `NavigationState`, stack, and accessibility specs.

## Accessibility

- Minimum touch target: 44px (CH3-X3 `NAVIGATION_ACCESSIBILITY_SPEC`)
- Keyboard navigation: tab order follows layout
- Screen readers: landmark regions, transition stage announcements
- Reduced motion: skips transition animations, preserves progress updates
- Focus management: modal/sheet focus trap rules from navigation framework

## Transition Behavior

Uses CH3-X3 transition engine and CH3-X4 `OFFICIAL_TRANSITION_SPEC`:

1. User completes request and taps Continue
2. `beginNeedTransition` hides bottom navigation
3. Transition screen displays `an act...` with dynamic stage text
4. Terminal progress advances through official stages
5. Background token interpolates `transition.start` → `transition.mid` → `transition.end`
6. On completion, mode becomes `action` (Action Experience not yet implemented)

## API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/need-experience` | Full experience state |
| GET | `/need-experience/home` | Need Home screen |
| GET | `/need-experience/search` | Search screen |
| GET | `/need-experience/opportunities` | Opportunity list |
| GET | `/need-experience/request` | Request screen |
| GET | `/need-experience/transition` | Transition screen |
| POST | `/need-experience/search` | Perform search |
| POST | `/need-experience/request/continue` | Start official transition |
| POST | `/need-experience/transition/advance` | Advance transition progress |
| GET | `/need-experience/flow` | Flow definition |
| GET | `/need-experience/validate` | Runtime validation |
| GET | `/need-experience/screen/:screenId` | Screen by ID |

All routes require authentication.

## Implementation Notes

- **No custom styling**: All screens reference CH3-X2 component IDs and CH3-X1 design tokens from prototypes.
- **No Bubble**: Runtime payloads are structured JSON views for API consumers.
- **No Action Experience**: Transition completes into `action` mode state only; Action screens are not implemented.
- **Prototype compliance**: Each screen maps to a CH3-X4 prototype via `NEED_SCREEN_PROTOTYPE_MAP`.
- **Validation**: `validateNeedExperience()` checks design system, core UI, navigation, prototypes, and transition compliance.

## Verification

```bash
npm run verify:ch3-x5
```

Runs:

1. CH3-X5 experience tests
2. TypeScript build
3. Dependency lint (`lint:imports`)
