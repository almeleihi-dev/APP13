# Render Layer Phase 3 — First Complete User Journey

**Date:** 2026-06-28  
**Scope:** Vertical expansion — first end-to-end AN ACT user journey  
**Status:** Complete

## Summary

Phase 3 completes the first real user journey entirely inside the Runtime architecture. A user can log in, browse Need Home, search, review opportunities, create a request, pass through the Need → Action transition, and land on Contract Preview — all rendered from Runtime JSON with zero frontend business logic.

## First Complete Journey

```
Login
  ↓  POST /v1/auth/login → GET /need-experience
Need Home
  ↓  navigate-search / route relay
Search
  ↓  need.search (keyword or chip)
Opportunity List
  ↓  need.select-opportunity
Request Form (Create Request)
  ↓  need.update-draft (location, schedule, notes)
  ↓  need.continue-request
Request Submitted (Transition)
  ↓  need.advance-transition (640ms staged animation)
  ↓  action.enter (need handoff)
Contract Preview
  ↓  GET /action-experience/contract
```

Every screen is produced by backend experience services and consumed by the render layer. The web shell only relays actions, merges draft field values for display, and animates the mode transition.

## Runtime Flow

```
Browser (apps/web)
  LoginPage → RuntimeProvider.login()
    → AuthClient POST /v1/auth/login
    → RuntimeClient.loadNeedExperience()

  RuntimePage → RuntimeScreenMount
    → renderRuntimeScreenReact(screen)
    → RenderNodeTree (P0 + P1 renderers)
    → onRelay(intent)

  Relay chain (RuntimeProvider.relay)
    need.search          → POST /need-experience/search
    need.select-opportunity → GET /need-experience/request?opportunity_id=
    need.update-draft    → local draft state (display only)
    need.continue-request → POST /need-experience/request/continue
    need.advance-transition → POST /need-experience/transition/advance
    action.enter         → POST /action-experience/enter
    action.contract      → GET /action-experience/contract

  ModeTransitionOverlay
    → AN_ACT_TRANSITION_DURATION_MS (640ms)
    → ui_tier from Runtime JSON only
```

## Components Implemented (P1)

| Component ID | React Element | Purpose |
|---|---|---|
| `core-ui-input` | `AnActInput` | Request form fields (location, schedule, notes) |
| `core-ui-search` | `AnActSearch` | Keyword search with submit relay |
| `core-ui-chip` | `AnActChip` | Category / quick-search chips |
| `core-ui-list` | `AnActList` | Opportunity list grouping |
| `core-ui-avatar` | `AnActAvatar` | Provider initials |
| `core-ui-badge` | `AnActBadge` | Status / category badges |
| `core-ui-section` | `AnActSection` | Section wrapper with label |
| `core-ui-empty-state` | `AnActEmptyState` | No-results placeholder |
| `core-ui-loading` | `AnActLoading` | Loading / relaying states |
| `core-ui-error` | `AnActError` | Problem details display |
| `an-act-opportunity-card` | `AnActOpportunityCard` | Opportunity row with Live Frame (`ui_tier` only) |

P0 renderers from Phase 2 (button, card, live-frame, navigation, header) remain unchanged and compose with P1 on journey screens.

## Screens in Journey

| Screen ID | Experience API | P1 components used |
|---|---|---|
| `need-home` | `GET /need-experience` | button, card, navigation |
| `search` | `GET/POST /need-experience/search` | search, chip |
| `opportunity-list` | search POST / opportunities GET | list, opportunity-card, live-frame, badge |
| `request` | `GET /need-experience/request` | input, button |
| `transition` | `POST /need-experience/request/continue` | loading, progress |
| `contract-preview` | `POST /action-experience/enter` + `GET /action-experience/contract` | contract-card, badge, card |

## Files Created / Modified

### Packages

| File | Change |
|---|---|
| `packages/runtime-core/src/action-intent-resolver.ts` | Maps backend `props.action` → relay intents |
| `packages/runtime-core/src/action-relay.ts` | Journey routes + need/action relay targets |
| `packages/runtime-client/src/runtime-client.ts` | `performSearch`, `selectOpportunity`, `continueRequest`, `enterActionExperience`, `loadContractPreview` |
| `packages/runtime-ui/src/react/components/P1Components.tsx` | P1 React renderers |
| `packages/runtime-ui/src/react/registry/p0-renderers.ts` | P1 element dispatch + opportunity card |
| `packages/runtime-ui/src/react/RenderNodeTree.tsx` | Full `an-act-*` element tree |
| `packages/runtime-ui/src/react/RuntimeScreenMount.tsx` | Section / list / empty-state wrappers |
| `packages/runtime-ui/tsconfig.json` | DOM lib for React form handlers |

### Web Shell

| File | Change |
|---|---|
| `apps/web/src/providers/RuntimeProvider.tsx` | Full journey relay, draft merge, transition sequence, offline/error |
| `apps/web/src/pages/RuntimePage.tsx` | Loading, error, offline placeholder |
| `apps/web/vite.config.ts` | Proxy for `/action-experience`, `/contract-experience` |

### Backend (transport only)

| File | Change |
|---|---|
| `src/api/routes/need-experience.ts` | `request/continue` accepts location, schedule, notes |
| `src/runtime-experience/need/application/need-experience-service.ts` | Merges draft fields before validation |

### Tooling & Tests

| File | Purpose |
|---|---|
| `test/render-layer-phase3.test.ts` | Journey relay + screen render tests |
| `scripts/verify-render-layer-phase3.sh` | Full Phase 3 verification |
| `package.json` | `test:render-layer-phase3`, `verify:render-layer-phase3` |

## Policies Enforced

- **Runtime JSON only** — no hardcoded screen content in the web shell
- **No frontend calculations** — no score, trust, or pricing logic on the client
- **Live Frame** — renders `ui_tier` from JSON; never computes trust tiers
- **640ms transition** — `AN_ACT_TRANSITION_DURATION_MS` from design tokens
- **Offline placeholder** — blocks relay when `navigator.onLine === false`
- **Validation / loading / error** — server Problem Details → `AnActError`; relaying → loading overlay

## Verification

```bash
npm run verify:render-layer-phase3
```

Includes: token sync, render layer build, web build, Phase 1–3 tests, need experience regression, platform build, import lint.

## Manual Test Path

1. Start API: `npm run dev` (port 3000)
2. Start web: `npm run dev:web` (port 5173)
3. Login with demo credentials
4. Tap **Search** from Need Home
5. Search keyword `electrician` or tap a category chip
6. Tap an opportunity card
7. Fill **Location** and **Schedule**, optional notes
8. Tap **Continue** → 640ms transition overlay
9. Land on **Contract Preview** with contract summary and badges

## Remaining Work Before Public MVP

| Area | Gap |
|---|---|
| Auth | Production identity provider, refresh tokens, session expiry UX |
| Persistence | Real user sessions; draft recovery across reload |
| Action journey | Contract activation, execution milestones, completion |
| Chat / Timeline | Post-contract experiences not yet in web shell |
| Notifications | Push/inbox not wired to render layer |
| Mobile | Native shell or PWA packaging |
| Accessibility | Full WCAG audit on P1 components |
| E2E tests | Browser automation for full journey against live API |
| Error recovery | Retry/backoff for transient API failures |
| i18n | RTL polish and locale-aware formatting from Runtime JSON |

## Goal Met

The first real AN ACT user can complete one full journey — Login through Contract Preview — without leaving the Runtime architecture. All screens render from Runtime JSON; the frontend relays actions and presents tokens only.
