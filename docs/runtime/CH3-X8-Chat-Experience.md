# CH3-X8 — AN ACT Chat Experience

Production runtime Chat Experience for AN ACT. Action-centric coordination chat tied to requests, contracts, or active actions — not social messaging.

## Architecture

```
src/runtime-experience/chat/
├── domain/
│   ├── chat-screen.ts
│   ├── chat-layout.ts
│   ├── chat-state.ts
│   ├── chat-message.ts
│   └── conversation.ts
├── application/
│   ├── chat-experience-service.ts
│   ├── chat-navigation.ts
│   ├── chat-session.ts
│   └── chat-validator.ts
├── presentation/
│   ├── screen-builder.ts
│   ├── chat-home.ts
│   ├── conversation-list.ts
│   ├── conversation-screen.ts
│   ├── message-input.ts
│   ├── attachment-placeholder.ts
│   ├── conversation-info.ts
│   └── empty-chat.ts
├── infrastructure/
│   └── chat-repository.ts
├── validation/
│   └── chat-experience-validator.ts
└── module.ts
```

Consumes CH3-X1 through CH3-X7 only. No Bubble, no custom styling, no realtime networking, no websockets, no notifications, no AI, no file uploads, no business logic.

## Runtime Flow

```
Need Request
    ↓
Contract
    ↓
Conversation Created
    ↓
Messages
    ↓
Action
    ↓
Completion
    ↓
Conversation Archived
```

## Conversation Model

| Field | Description |
|-------|-------------|
| `state` | `draft` \| `active` \| `waiting` \| `completed` \| `archived` |
| `context` | Related request, contract, or active action |
| `participants` | Customer and provider with optional Live Frame tier |
| `latestMessagePreview` | Most recent message preview |
| `unreadPlaceholder` | Unread count placeholder — no notification engine |
| `lastActivityAt` | Last activity timestamp |

Messages are stored locally in the repository. Sending appends to in-memory storage only — no messaging backend.

## Screens

| Screen | Route | Purpose |
|--------|-------|---------|
| Chat Home | `/chat/home` | Active conversations, unread placeholder, related contract/action, latest message, participant, last activity |
| Conversation List | `/chat/conversations` | Conversation cards, Live Frame, contract/action status, search placeholder |
| Conversation Screen | `/chat/conversation` | Messages, timestamps, sender, delivery placeholder, date separators, scroll state, message input |
| Conversation Info | `/chat/conversation/info` | Related contract, related action, participants, created date, current state |
| Empty Chat | `/chat/empty` | Illustration placeholder, guidance, start conversation message |

### Message Input

Text input, send button, attachment placeholder, disabled states when conversation is not active. Local append only.

### Attachment Placeholder

Display only: image, document, location, camera. No upload implementation.

## Navigation

| Action | Behavior |
|--------|----------|
| Back | Pop navigation stack |
| Conversation navigation | Open conversation by ID |
| Bottom navigation | Chat Home / Conversations |
| Return to Action Home | `/action/home` |
| Return to Contract | `/contract/home` |

## Accessibility

- Keyboard navigation via navigation framework spec
- Screen reader labels and roles on all interactive components
- Reduced motion support via `reduced_motion` query parameter
- Focus management with tabIndex on components
- Minimum touch targets per navigation accessibility spec (44px)

## API Routes

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/chat-experience` | Full experience snapshot |
| POST | `/chat-experience/enter` | Enter from contract context |
| GET | `/chat-experience/flow` | Flow and lifecycle metadata |
| GET | `/chat-experience/validate` | Runtime validation |
| GET | `/chat-experience/home` | Chat Home screen |
| GET | `/chat-experience/conversations` | Conversation List screen |
| GET | `/chat-experience/conversation/:id` | Conversation Screen |
| GET | `/chat-experience/info` | Conversation Info screen |
| POST | `/chat-experience/message` | Local message append |
| POST | `/chat-experience/complete` | Mark conversation completed |
| POST | `/chat-experience/archive` | Archive conversation |

## Validation

`validateChatExperience()` checks:

- Design token usage (semantic tokens only)
- Core UI component references
- Navigation framework compliance
- Prototype compliance (`prototype-chat`, `prototype-empty-state`)
- All required screens and conversation states
- Accessibility spec linkage
- CH3-X5/X6/X7 version links

## Implementation Notes

- **No realtime**: `local_only: true`, `realtime: false` on experience snapshot
- **No backend send**: `sendMessage` appends to in-memory repository only
- **Action-centric**: Conversations require contract/request/action context
- **Lifecycle**: `completeConversation` → `completed`, `archiveConversation` → `archived`
- **Enter flow**: `enterFromContract` creates conversation and navigates to conversation screen

## Verification

```bash
npm run verify:ch3-x8
```

Runs chat experience tests, TypeScript build, and dependency lint.
