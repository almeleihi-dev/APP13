# Render Layer Phase 1 — Foundation Report

**Date:** 2026-06-28  
**Scope:** AN ACT Render Layer foundation (`@an-act/tokens`, `@an-act/runtime-core`, `@an-act/runtime-ui`)  
**Status:** Complete

## Summary

Phase 1 establishes the presentation-only Render Layer foundation exactly as documented in the Render Layer Architecture and Implementation Guide. The frontend consumes Runtime JSON from the backend, resolves design tokens and themes, dispatches registered `core-ui-*` components into a framework-agnostic render tree, and relays user actions back to experience API routes — with zero business logic on the client.

## Architecture

```
Runtime JSON (backend)
  → Runtime Resolver (validate contract)
  → Theme Resolver + Token Resolver (@an-act/tokens)
  → Component Dispatcher (@an-act/runtime-ui)
  → Live Frame Resolver (presentation accent)
  → Runtime Screen Renderer (RenderNode tree)
  → Action Relay (transport map → experience APIs)
```

## Deliverables

| Priority | Module | Package / Path |
|---:|---|---|
| 1 | Design Tokens | `packages/tokens` (`@an-act/tokens`) |
| 2 | Runtime UI | `packages/runtime-ui` (`@an-act/runtime-ui`) |
| 3 | Runtime Resolver | `packages/runtime-core/src/runtime-resolver.ts` |
| 4 | Theme Resolver | `packages/tokens/src/theme-resolver.ts` |
| 5 | Token Resolver | `packages/tokens/src/token-resolver.ts` |
| 6 | Component Dispatcher | `packages/runtime-ui/src/component-dispatcher.ts` |
| 7 | Live Frame Resolver | `packages/tokens/src/live-frame-resolver.ts` |
| 8 | Action Relay | `packages/runtime-core/src/action-relay.ts` |
| 9 | Runtime Screen Renderer | `packages/runtime-ui/src/runtime-screen-renderer.ts` |

## Files Created

### `@an-act/tokens`

| File | Purpose |
|---|---|
| `packages/tokens/package.json` | Package manifest |
| `packages/tokens/tsconfig.json` | TypeScript build config |
| `packages/tokens/assets/tokens.json` | Synced token payload (generated) |
| `packages/tokens/src/index.ts` | Public exports |
| `packages/tokens/src/types.ts` | Token and theme types |
| `packages/tokens/src/load-tokens.ts` | Load synced JSON asset |
| `packages/tokens/src/token-resolver.ts` | Color, spacing, typography, shadow, motion resolution |
| `packages/tokens/src/theme-resolver.ts` | Need / Action / Transition theme resolution |
| `packages/tokens/src/live-frame-resolver.ts` | Live Frame v1.0 tier → accent mapping |

### `@an-act/runtime-core`

| File | Purpose |
|---|---|
| `packages/runtime-core/package.json` | Package manifest |
| `packages/runtime-core/tsconfig.json` | TypeScript build config |
| `packages/runtime-core/src/index.ts` | Public exports |
| `packages/runtime-core/src/types.ts` | Runtime JSON contract types, 23 `core-ui-*` ids |
| `packages/runtime-core/src/runtime-resolver.ts` | Runtime screen validation |
| `packages/runtime-core/src/live-frame-resolver.ts` | Re-export from tokens |
| `packages/runtime-core/src/action-relay.ts` | Action → experience route transport map |

### `@an-act/runtime-ui`

| File | Purpose |
|---|---|
| `packages/runtime-ui/package.json` | Package manifest |
| `packages/runtime-ui/tsconfig.json` | TypeScript build config |
| `packages/runtime-ui/src/index.ts` | Public exports |
| `packages/runtime-ui/src/render-node.ts` | Framework-agnostic `RenderNode` IR |
| `packages/runtime-ui/src/component-dispatcher.ts` | Registry-driven component dispatch |
| `packages/runtime-ui/src/runtime-screen-renderer.ts` | Full screen → render tree |
| `packages/runtime-ui/src/registry/default-components.ts` | Default renderers for all 23 core-ui components |

### Tooling

| File | Purpose |
|---|---|
| `scripts/sync-an-act-tokens.ts` | Sync platform `DESIGN_TOKENS` → `packages/tokens/assets/tokens.json` |
| `scripts/verify-render-layer-foundation.sh` | Phase 1 verification script |
| `test/render-layer-foundation.test.ts` | Foundation test suite (11 tests) |

## Package Structure

```
packages/
  tokens/           @an-act/tokens
    assets/tokens.json
    src/
  runtime-core/     @an-act/runtime-core  (depends on @an-act/tokens)
    src/
  runtime-ui/       @an-act/runtime-ui    (depends on @an-act/runtime-core, @an-act/tokens)
    src/
```

## Dependencies

| Package | Dependencies |
|---|---|
| `@an-act/tokens` | None (standalone; synced from `src/design-system/tokens/design-tokens.ts`) |
| `@an-act/runtime-core` | `@an-act/tokens` (file link) |
| `@an-act/runtime-ui` | `@an-act/runtime-core`, `@an-act/tokens` (file links) |

Root `package.json` scripts added:

- `sync:tokens` — regenerate `tokens.json` from platform source
- `build:tokens`, `build:runtime-core`, `build:runtime-ui`, `build:render-layer`
- `test:render-layer-foundation`
- `verify:render-layer-foundation`

## Design Decisions

1. **Framework-agnostic IR** — Phase 1 outputs a `RenderNode` tree (element, props, style, children) rather than React DOM. This keeps the foundation independent of a UI framework until `apps/web` is introduced.
2. **Token sync script** — Platform `src/design-system/` remains the authoring source; `@an-act/tokens` ships a serialized JSON asset for deterministic, publishable consumption.
3. **Presentation-only Live Frame** — `resolveLiveFramePresentation()` maps backend trust tiers to UI tiers and accent tokens. No score formulas or trust computation on the frontend.
4. **Action Relay transport map** — Maps `actionId` strings to experience API paths. No fetch, auth, or retry logic (deferred to `@an-act/runtime-client`).
5. **No backend changes** — All existing experience builders and APIs are consumed as-is.

## Verification

```bash
npm run verify:render-layer-foundation
```

### Results (2026-06-28)

| Suite | Result |
|---|---|
| Token sync | pass |
| `@an-act/tokens` build | pass |
| `@an-act/runtime-core` build | pass |
| `@an-act/runtime-ui` build | pass |
| Render layer foundation tests | 11/11 pass |
| Platform build | pass |
| Import lint | pass |

## Constraints Honored

- Zero business logic on frontend
- Runtime JSON driven
- Token driven
- Component registry driven (23 `core-ui-*` ids)
- Server authoritative
- No backend modifications
- No new architecture documents
- No UI redesign
- No full screen implementations beyond foundation rendering

## Next Milestone

**Phase 2 — Runtime Client + Web Shell**

1. **`@an-act/runtime-client`** — Auth context, experience fetch, action relay HTTP transport, error normalization (RFC 9457 Problem Details)
2. **`apps/web`** — Minimal React (or chosen framework) shell mounting `RuntimeScreenRenderer` output
3. **P0 component renderers** — Replace generic stubs with token-accurate renderers for Button, Card, Input, Search, Live Frame, Bottom Navigation, Navigation Bar
4. **Need Home screen** — End-to-end: `GET /api/experience/need-experience` → render → action relay round-trip
5. **Live Frame v1.0 visual parity** — Match CH3 core-ui Live Frame spec in real DOM/CSS

## Official Sources Used

- Product Bible
- Master Architecture Index
- Live Frame v1.0 Specification
- Runtime JSON Contract
- Design Tokens Specification
- Render Layer Architecture
- Render Layer Implementation Guide
