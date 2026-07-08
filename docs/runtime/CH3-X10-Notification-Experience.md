# CH3-X10 — AN ACT Notification & Event Inbox Experience

Production runtime Notification & Event Inbox Experience for AN ACT. Unified read-only notification center that visualizes lifecycle events without executing business logic.

## Architecture

```
src/runtime-experience/notification/
├── domain/
│   ├── notification-screen.ts
│   ├── notification-layout.ts
│   ├── notification-state.ts
│   ├── notification-item.ts
│   └── notification-summary.ts
├── application/
│   ├── notification-experience-service.ts
│   ├── notification-navigation.ts
│   ├── notification-builder.ts
│   └── notification-validator.ts
├── presentation/
│   ├── screen-builder.ts
│   ├── notification-home.ts
│   ├── notification-list.ts
│   ├── notification-detail.ts
│   ├── notification-filters.ts
│   ├── notification-settings.ts
│   └── notification-empty-state.ts
├── infrastructure/
│   └── notification-repository.ts
├── validation/
│   └── notification-experience-validator.ts
└── module.ts
```

Consumes CH3-X1 through CH3-X9 only. No AI, no business logic, no push delivery, no persistence, no lifecycle mutations.

## Runtime Flow

```
Request Created → Match Found → Contract Ready → Chat Started → Action Started → Milestone → Completion → Archive
```

Notifications visualize events only. Never modify lifecycle state.

## Notification Model

| Field | Description |
|-------|-------------|
| `id` | Unique notification identifier |
| `title` | Notification title |
| `message` | Notification body |
| `type` | request, match, contract, chat, action, timeline, reminder, system, announcement |
| `priority` | low, normal, high, urgent |
| `timestamp` | ISO timestamp |
| `status` | unread, read, important, archived |
| `relatedContractId` | Linked contract |
| `relatedActionId` | Linked action |
| `relatedConversationId` | Linked conversation |
| `relatedTimelineEventId` | Linked timeline event |
| `icon` | Display icon |
| `colorToken` | Semantic design token |
| `confidence` | Confidence score (display only) |
| `recommendations` | Display-only recommendations |

## Screens

| Screen | Route | Purpose |
|--------|-------|---------|
| Notification Home | `/notification/home` | Unread count, recent, important, reminders, timeline highlights, contract updates, Live Frame |
| Notification List | `/notification/list` | Today/Yesterday/Earlier groups, Unread/Read/Important/Archived |
| Notification Detail | `/notification/detail/:id` | Full notification with related entities and return links |
| Notification Filters | `/notification/filters` | All, Unread, Contracts, Actions, Messages, Timeline, System |
| Notification Settings | `/notification/settings` | Push, Email, SMS, In-App, Sound, Vibration (display only) |
| Empty State | `/notification/empty` | Official fallback |

## Navigation

| Action | Behavior |
|--------|----------|
| Notification Home → List → Detail | Stack navigation |
| Back | Pop navigation stack |
| Return to Need Home | `/need/home` |
| Return to Action Home | `/action/home` |
| Return to Contract | `/contract/home` |
| Return to Chat | `/chat/home` |
| Return to Timeline | `/timeline/home` |

## Accessibility

- 44px minimum touch targets
- Keyboard navigation
- Screen reader labels and roles
- Reduced motion support
- Focus management via tabIndex

## API Routes

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/notification-experience` | Full experience snapshot |
| GET | `/notification-experience/home` | Notification Home screen |
| GET | `/notification-experience/list` | Notification List (optional filter) |
| GET | `/notification-experience/detail/:id` | Notification Detail |
| GET | `/notification-experience/filters` | Notification Filters screen |
| GET | `/notification-experience/settings` | Notification Settings screen |
| GET | `/notification-experience/validate` | Runtime validation |
| POST | `/notification-experience/refresh` | Refresh display (read-only) |

## Validation

`validateNotificationExperience()` checks design tokens, Core UI components, navigation framework, prototypes, all screens, notification types, filters, settings options, accessibility, and CH3-X5 through CH3-X9 version links.

## Verification

```bash
npm run verify:ch3-x10
```

Runs notification experience tests, TypeScript build, and dependency lint.
