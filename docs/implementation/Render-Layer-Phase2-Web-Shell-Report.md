# Render Layer Phase 2 — Web Shell Report

**Date:** 2026-06-28  
**Scope:** First visible AN ACT web application — Runtime JSON on screen  
**Status:** Complete

## Summary

Phase 2 delivers the first working web application that renders AN ACT entirely from Runtime JSON. The React shell consumes `@an-act/tokens`, `@an-act/runtime-core`, `@an-act/runtime-ui`, and the new `@an-act/runtime-client` package. Need Home is the first rendered screen — no hardcoded UI, no fake components, presentation only.

## Architecture

```
Browser (apps/web)
  → RuntimeProvider + ThemeProvider
  → RuntimeClient (auth + GET/POST)
  → GET /need-experience → NeedExperienceEnvelope
  → RuntimeScreenMount (React)
  → ComponentDispatcher (P0 renderers)
  → RenderNodeTree → DOM
  → Action Relay → POST/GET experience APIs
```

## Deliverables

| Requirement | Implementation |
|---|---|
| Runtime Client | `packages/runtime-client` |
| Web Shell | `apps/web` (Vite + React + TypeScript) |
| ThemeProvider | `@an-act/runtime-ui/react` |
| RuntimeProvider | `apps/web/src/providers/RuntimeProvider.tsx` |
| Need Home screen | Loaded from `GET /need-experience` |
| P0 renderers | Button, Card, Live Frame, Navigation, Header |
| Need ↔ Action transition | `ModeTransitionOverlay` — 640ms |
| Live Frame | `ui_tier` only — no trust/score computation |
| Action Relay | Route + actionId → experience API transport |
| Verification | `scripts/verify-render-layer-phase2.sh` |

## Files Created

### `@an-act/runtime-client`

| File | Purpose |
|---|---|
| `packages/runtime-client/package.json` | Package manifest |
| `packages/runtime-client/tsconfig.json` | TypeScript config |
| `packages/runtime-client/src/index.ts` | Public exports |
| `packages/runtime-client/src/types.ts` | Envelope + auth types |
| `packages/runtime-client/src/auth-client.ts` | Login, token storage |
| `packages/runtime-client/src/http-client.ts` | Authenticated GET/POST |
| `packages/runtime-client/src/runtime-client.ts` | Experience loading + relay |

### `@an-act/runtime-ui` (React layer)

| File | Purpose |
|---|---|
| `packages/runtime-ui/src/react/index.ts` | `@an-act/runtime-ui/react` exports |
| `packages/runtime-ui/src/react/RenderNodeTree.tsx` | RenderNode → React DOM |
| `packages/runtime-ui/src/react/RuntimeScreenMount.tsx` | Screen mounting |
| `packages/runtime-ui/src/react/registry/p0-renderers.ts` | P0 token-driven renderers |
| `packages/runtime-ui/src/react/components/P0Components.tsx` | AnActButton, Card, LiveFrame, Header, Navigation |
| `packages/runtime-ui/src/react/providers/ThemeProvider.tsx` | Need/Action CSS variables |
| `packages/runtime-ui/src/react/transition/ModeTransitionOverlay.tsx` | 640ms mode transition |

### `apps/web`

| File | Purpose |
|---|---|
| `apps/web/package.json` | Web app manifest |
| `apps/web/vite.config.ts` | Dev server + API proxy |
| `apps/web/index.html` | Entry HTML |
| `apps/web/tsconfig.json` | TypeScript config |
| `apps/web/src/main.tsx` | Bootstrap |
| `apps/web/src/App.tsx` | Auth gate |
| `apps/web/src/providers/RuntimeProvider.tsx` | Runtime envelope + relay state |
| `apps/web/src/pages/LoginPage.tsx` | Auth entry |
| `apps/web/src/pages/RuntimePage.tsx` | Runtime screen mount |
| `apps/web/src/styles/global.css` | Base styles |

### Tooling & Tests

| File | Purpose |
|---|---|
| `scripts/verify-render-layer-phase2.sh` | Phase 2 verification |
| `test/render-layer-phase2.test.ts` | 6 deterministic tests |
| `packages/tokens/src/tokens-data.ts` | Browser-safe synced token module (generated) |

### Updated (Render Layer packages)

| File | Change |
|---|---|
| `packages/runtime-core/src/action-relay.ts` | Correct `/need-experience` paths + route relay |
| `packages/tokens/src/theme-css.ts` | CSS variable builder + 640ms constant |
| `packages/tokens/src/load-tokens.ts` | Browser-safe token loading |
| `scripts/sync-an-act-tokens.ts` | Generates `tokens-data.ts` |

## Package Structure

```
packages/
  tokens/           @an-act/tokens
  runtime-core/     @an-act/runtime-core
  runtime-ui/       @an-act/runtime-ui (+ ./react export)
  runtime-client/   @an-act/runtime-client  ← NEW

apps/
  web/              @an-act/web              ← NEW
```

## Dependencies

| Package | Depends on |
|---|---|
| `@an-act/runtime-client` | `@an-act/runtime-core` |
| `@an-act/runtime-ui/react` | `@an-act/runtime-core`, `@an-act/tokens`, `react`, `react-dom` |
| `@an-act/web` | All render layer packages + Vite + React |

## First Rendered Screen — Need Home

**Source:** `GET /need-experience` → `envelope.screen` (`NeedRuntimeScreenView`)

**Sections rendered from Runtime JSON:**

| Section | Components |
|---|---|
| welcome | `core-ui-navigation-bar` → **AnActHeader** (banner) |
| search-entry | `core-ui-search` |
| quick-categories | `core-ui-chip` × N |
| recommended-actions | `core-ui-card` × N |
| recent-activity | `core-ui-card` |
| suggested-opportunities | `core-ui-card` × N |
| bottom-navigation | `core-ui-bottom-navigation` → **AnActNavigation** |

All copy, routes, and structure originate from the backend `buildNeedHomeScreen()` — the React layer only dispatches and styles.

## Runtime JSON Flow

```
1. POST /v1/auth/login          → access_token
2. GET  /need-experience        → NeedExperienceEnvelope
3. envelope.screen              → AnActRuntimeScreenView
4. RuntimeScreenRenderer        → RenderNode tree (P0 renderers)
5. RenderNodeTree               → React DOM
6. User tap (route/actionId)    → RuntimeClient.relay()
7. GET/POST /need-experience/*  → updated screen envelope
8. Mode transition              → POST /need-experience/transition/advance (640ms overlay)
9. Complete                     → GET /action-experience (Action Mode)
```

## P0 Renderers

| Component ID | React Element | Token usage |
|---|---|---|
| `core-ui-button` | `an-act-button` | interactive.*, text.*, spacing, typography |
| `core-ui-card` | `an-act-card` | surface.*, border.*, text.* |
| `core-ui-live-frame` | `an-act-live-frame` | ui_tier accent only |
| `core-ui-navigation-bar` | `an-act-header` or `an-act-navigation` | background.*, text.*, border.* |
| `core-ui-bottom-navigation` | `an-act-navigation` | Same token paths |

## Mode System

| Mode | Background | Typography | Source |
|---|---|---|---|
| Need Mode | `#FFFFFF` (white) | `#000000` (black) | `@an-act/tokens` need theme |
| Action Mode | `#000000` (matte black) | `#FFFFFF` (white) | `@an-act/tokens` action theme |
| Transition | 640ms blend | Need → Action | `ModeTransitionOverlay` |

No OS `prefers-color-scheme`. Mode is driven exclusively by Runtime JSON `envelope.mode`.

## Live Frame Policy

- Consumes `props.uiTier` from Runtime JSON only
- Default tier: `silver` when absent
- **Never** reads `trustTier`, scores, or formulas on the client

## Verification

```bash
npm run verify:render-layer-phase2
```

### Results (2026-06-28)

| Suite | Result |
|---|---|
| Token sync + package builds | pass |
| Web app production build | pass |
| Phase 1 foundation tests | 11/11 pass |
| Phase 2 web shell tests | 6/6 pass |
| Platform build | pass |
| Import lint | pass |

### Run the web app

```bash
# Terminal 1 — platform API (port 3000)
npm run dev

# Terminal 2 — web shell (port 5173, proxies API)
npm run dev:web
```

Open `http://localhost:5173`, sign in, and Need Home renders from live Runtime JSON.

## Constraints Honored

- Zero business logic in React
- Runtime JSON driven rendering
- Token driven styling
- Component registry driven dispatch
- Server authoritative
- No backend modifications
- No product redesign
- No trust/score/AI on client

## Remaining Phase 3 Work

1. **Search → Opportunities → Request flow** — full route relay round-trip through web shell
2. **Action Home screen** — render from `GET /action-experience`
3. **P1 component renderers** — Input, Search, Chip, Badge, Progress, Loading (token-accurate)
4. **Region layout engine** — map `screen.regions` to layout containers
5. **Error boundary + Problem Details** — RFC 9457 display in UI
6. **E2E browser test** — Playwright against live API
7. **React Native shell** — shared `@an-act/runtime-ui/react` components

## Official Sources Used

- Product Bible
- Master Architecture Index
- Live Frame v1.0 Specification
- Runtime JSON Contract
- Design Tokens Specification
- Render Layer Architecture
- Render Layer Implementation Guide
