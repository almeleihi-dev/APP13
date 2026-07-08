# CH3-X9 — AN ACT Timeline Experience

Production runtime Timeline Experience for AN ACT. Provides a complete chronological, read-only view of every action in the AN ACT lifecycle.

## Architecture

```
src/runtime-experience/timeline/
├── domain/
│   ├── timeline-screen.ts
│   ├── timeline-layout.ts
│   ├── timeline-state.ts
│   ├── timeline-event.ts
│   └── timeline-summary.ts
├── application/
│   ├── timeline-experience-service.ts
│   ├── timeline-navigation.ts
│   ├── timeline-builder.ts
│   └── timeline-validator.ts
├── presentation/
│   ├── screen-builder.ts
│   ├── timeline-home.ts
│   ├── timeline-history.ts
│   ├── timeline-detail.ts
│   ├── timeline-progress.ts
│   ├── timeline-filters.ts
│   └── timeline-empty-state.ts
├── infrastructure/
│   └── timeline-repository.ts
├── validation/
│   └── timeline-experience-validator.ts
└── module.ts
```

Consumes CH3-X1 through CH3-X8 only. No AI, no business logic, no lifecycle mutations, no custom styling.

## Runtime Flow

```
Need → Request → Matching → Contract → Chat → Action → Completion → Archive
```

Display only. Never modifies lifecycle state.

## Timeline Event Model

| Field | Description |
|-------|-------------|
| `id` | Unique event identifier |
| `title` | Event title |
| `description` | Event description |
| `type` | Event type (request-created, match-found, contract-created, etc.) |
| `timestamp` | ISO timestamp |
| `status` | `completed` \| `current` \| `upcoming` \| `archived` |
| `relatedContractId` | Linked contract |
| `relatedActionId` | Linked action |
| `relatedConversationId` | Linked conversation |
| `relatedParticipant` | Linked participant |
| `icon` | Display icon |
| `colorToken` | Semantic design token |
| `confidence` | Confidence score (display only) |
| `recommendations` | Display-only recommendations |

## Screens

| Screen | Route | Purpose |
|--------|-------|---------|
| Timeline Home | `/timeline/home` | Today's activity, active actions, recent events, milestones, completion %, lifecycle stage, Live Frame |
| Timeline History | `/timeline/history` | Chronological history grouped by date |
| Timeline Detail | `/timeline/detail` | Event title, description, timestamp, contract, participant, type, recommendations, confidence |
| Timeline Progress | `/timeline/progress` | Visual lifecycle: Need → Match → Contract → Action → Completion |
| Timeline Filters | `/timeline/filters` | Today, Week, Month, Active, Completed, Archived |
| Empty State | `/timeline/empty` | Official fallback when no events |

## Navigation

| Action | Behavior |
|--------|----------|
| Timeline Home → History → Detail | Stack navigation |
| Back | Pop navigation stack |
| Return to Need Home | `/need/home` |
| Return to Action Home | `/action/home` |
| Return to Contract | `/contract/home` |
| Return to Chat | `/chat/home` |

## Accessibility

- 44px minimum touch targets
- Keyboard navigation
- Screen reader labels and roles
- Reduced motion support
- Focus management via tabIndex

## API Routes

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/timeline-experience` | Full experience snapshot |
| GET | `/timeline-experience/home` | Timeline Home screen |
| GET | `/timeline-experience/history` | Timeline History (optional filter) |
| GET | `/timeline-experience/detail/:id` | Timeline Detail for event |
| GET | `/timeline-experience/progress` | Timeline Progress screen |
| GET | `/timeline-experience/filters` | Timeline Filters screen |
| GET | `/timeline-experience/validate` | Runtime validation |
| POST | `/timeline-experience/refresh` | Refresh display (read-only) |

## Validation

`validateTimelineExperience()` checks design tokens, Core UI components, navigation framework, prototypes, all screens, event types, filters, progress stages, accessibility, and CH3-X5 through CH3-X8 version links.

## Verification

```bash
npm run verify:ch3-x9
```

Runs timeline experience tests, TypeScript build, and dependency lint.
