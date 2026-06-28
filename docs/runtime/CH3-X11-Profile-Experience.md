# CH3-X11 — AN ACT Profile Experience

Production runtime Profile Experience for AN ACT. Unified living profile for every user — read-only, no business logic, no persistence.

## Architecture

```
src/runtime-experience/profile/
├── domain/
│   ├── profile-screen.ts
│   ├── profile-layout.ts
│   ├── profile-state.ts
│   ├── profile-summary.ts
│   └── profile-sections.ts
├── application/
│   ├── profile-experience-service.ts
│   ├── profile-navigation.ts
│   ├── profile-builder.ts
│   └── profile-validator.ts
├── presentation/
│   ├── screen-builder.ts
│   ├── profile-home.ts
│   ├── profile-identity.ts
│   ├── profile-live-frame.ts
│   ├── profile-achievements.ts
│   ├── profile-analytics.ts
│   ├── profile-history.ts
│   ├── profile-settings.ts
│   └── profile-empty-state.ts
├── infrastructure/
│   └── profile-repository.ts
├── validation/
│   └── profile-experience-validator.ts
└── module.ts
```

Consumes CH3-X1 through CH3-X10 only. No AI, no business logic, no persistence, no lifecycle mutations.

## Runtime Flow

```
Open Profile → Identity → Live Frame → Achievements → Analytics → History → Settings → Back
```

Read-only only. Never modifies lifecycle state.

## Profile Summary Model

| Field | Description |
|-------|-------------|
| `id` | User profile identifier |
| `displayName` | Display name |
| `avatar` | Avatar reference |
| `liveFrame` | Current Live Frame tier |
| `verification` | Verification status and badges |
| `professionalScore` | Professional score |
| `trustScore` | Trust score |
| `completionScore` | Completion percentage |
| `badges` | Earned badges |
| `statistics` | Quick statistics |
| `recommendations` | Display-only recommendations |
| `confidence` | Confidence score |

## Screens

| Screen | Route | Purpose |
|--------|-------|---------|
| Profile Home | `/profile/home` | Avatar, name, Live Frame, badges, scores, stats, recent activity |
| Identity | `/profile/identity` | Profile info, verification, licenses, certifications, badges, member since |
| Live Frame | `/profile/live-frame` | Current frame, score, reputation, ranking, explanation, next level progress |
| Achievements | `/profile/achievements` | Unlocked, recent, milestone progress, recommended |
| Analytics | `/profile/analytics` | Activity, completion/response rates, contract/timeline summary, chart placeholders |
| History | `/profile/history` | Recent, completed, archived actions, timeline shortcuts |
| Settings | `/profile/settings` | Appearance, notifications, privacy, accessibility, language (display only) |
| Empty State | `/profile/empty` | Official fallback |

## Navigation

| Action | Behavior |
|--------|----------|
| Profile Home → sections | Stack navigation through profile screens |
| Back | Pop navigation stack |
| Return to Need Home | `/need/home` |
| Return to Action Home | `/action/home` |
| Return to Timeline | `/timeline/home` |
| Return to Notifications | `/notification/home` |

## Accessibility

- 44px minimum touch targets
- Keyboard navigation
- Screen reader labels and roles
- Reduced motion support
- Focus management via tabIndex

## API Routes

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/profile-experience` | Full experience snapshot |
| GET | `/profile-experience/home` | Profile Home screen |
| GET | `/profile-experience/identity` | Identity screen |
| GET | `/profile-experience/live-frame` | Live Frame screen |
| GET | `/profile-experience/achievements` | Achievements screen |
| GET | `/profile-experience/analytics` | Analytics screen |
| GET | `/profile-experience/history` | History screen |
| GET | `/profile-experience/settings` | Settings screen |
| GET | `/profile-experience/validate` | Runtime validation |
| POST | `/profile-experience/refresh` | Refresh display (read-only) |

## Validation

`validateProfileExperience()` checks design tokens, Core UI components, navigation framework, prototypes, all screens, profile sections, settings options, accessibility, and CH3-X5 through CH3-X10 version links.

## Verification

```bash
npm run verify:ch3-x11
```

Runs profile experience tests, TypeScript build, and dependency lint.
