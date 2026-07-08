# Render Layer Phase 4 — AN ACT Brand Experience

**Date:** 2026-06-28  
**Scope:** Official AN ACT visual identity across the Web Shell  
**Status:** Complete

## Summary

Phase 4 transforms the existing Runtime journey into the documented AN ACT brand experience. No backend changes, no business logic — only token-driven presentation refinements aligned with the Product Bible, Design Tokens Specification, Render Layer Architecture, Live Frame v1.0, and Runtime JSON Contract.

Opening AN ACT now communicates a premium global product: dual-mode identity (Need white / Action matte black), terminal-inspired brand moments, official button and card language, refined navigation rhythm, and desktop branding placeholders.

## Brand Requirements Met

| Requirement | Implementation |
|---|---|
| Official wordmark | `AnActWordmark` — typographic `an act`; swap via `VITE_AN_ACT_LOGO_URL` or `logoUrl` prop |
| Need Mode | White `#FFFFFF` bg, black `#000000` typography via semantic tokens |
| Action Mode | Matte black `#000000` bg, white `#FFFFFF` typography |
| No OS dark mode | Theme driven by `screen.mode`; no `color-scheme: dark` on Action |
| 640ms transition | `AN_ACT_TRANSITION_DURATION_MS` + emphasized easing on overlay |
| Terminal typography | `terminal` style on wordmark, loading, transition overlay |
| Official buttons | `.an-act-button--primary/secondary/ghost` — 48px min height, token colors |
| Cards | Elevation shadows from design tokens, 16px radius, medium/high elevation |
| Live Frame | `ui_tier` only — unchanged from Phase 3 |
| Official loading | `AnActBrandLoading` — `an act` + animated ellipsis + stage text |
| Navigation | Refined top/bottom nav — 44px touch targets, active accent, sticky bottom bar |
| Screen rhythm | `.an-act-screen`, `.an-act-section`, label typography hierarchy |
| Desktop branding | Favicon, PWA manifest, 192/512 icons, window title, brand JSON config |
| Accessibility | AA contrast via semantic tokens, focus rings, keyboard nav, reduced-motion rules |

## Architecture

```
Runtime JSON (unchanged)
  → p0-renderers (token-resolved styles + brand classes)
  → P0/P1 React components (an-act-* classes)
  → an-act-brand.css (presentation layer)
  → ThemeProvider (CSS variables from @an-act/tokens)
  → AnActAppShell (wordmark + mode label + screen rhythm)
```

## Files Created / Modified

### `@an-act/tokens`

| File | Purpose |
|---|---|
| `src/brand.ts` | Official brand constants (`an act...`, product name, stage texts) |
| `src/theme-css.ts` | Extended CSS variables: typography, spacing, radius, elevation, motion |
| `src/token-resolver.ts` | `resolveShadowCss`, `resolveElevationCss`, action-mode shadow scaling |

### `@an-act/runtime-ui`

| File | Purpose |
|---|---|
| `src/react/styles/an-act-brand.css` | Official brand stylesheet |
| `src/react/brand/AnActWordmark.tsx` | Wordmark with optional logo asset swap |
| `src/react/brand/AnActBrandLoading.tsx` | Official loading experience |
| `src/react/brand/AnActAppShell.tsx` | Application shell (header, main, footer) |
| `src/react/providers/ThemeProvider.tsx` | Mode-driven theme root, no OS dark scheme |
| `src/react/components/P0Components.tsx` | Brand button, card, nav, live-frame classes |
| `src/react/components/P1Components.tsx` | Token-driven inputs, search, loading wrapper |
| `src/react/transition/ModeTransitionOverlay.tsx` | Terminal typography + emphasized easing |
| `src/react/RuntimeScreenMount.tsx` | Screen/section rhythm classes |
| `src/react/registry/p0-renderers.ts` | Elevation shadows on cards |
| `package.json` | Exports `./brand.css` |

### `apps/web`

| File | Purpose |
|---|---|
| `public/manifest.webmanifest` | PWA manifest |
| `public/favicon.svg` | Browser favicon |
| `public/icons/an-act-icon-*.svg` | Application icon placeholders |
| `public/an-act-brand.json` | Logo URL placeholder config |
| `src/brand/config.ts` | Brand config + `VITE_AN_ACT_LOGO_URL` |
| `src/vite-env.d.ts` | Vite env types |
| `src/styles/global.css` | Imports `@an-act/runtime-ui/brand.css` |
| `src/pages/LoginPage.tsx` | Branded login panel |
| `src/pages/RuntimePage.tsx` | App shell + brand loading + theme-color meta |
| `index.html` | Title, favicon, manifest, theme-color |

### Tooling

| File | Purpose |
|---|---|
| `test/render-layer-phase4.test.ts` | Theme + branding + asset tests (14 tests) |
| `scripts/verify-render-layer-phase4.sh` | Full verification incl. branding + theme checks |
| `package.json` | `test:render-layer-phase4`, `verify:render-layer-phase4` |

## Logo Asset Swap (No Code Changes)

1. Place logo at e.g. `apps/web/public/brand/an-act-logo.svg`
2. Set environment variable: `VITE_AN_ACT_LOGO_URL=/brand/an-act-logo.svg`
3. Or update `public/an-act-brand.json` → `"logoUrl": "/brand/an-act-logo.svg"` (future runtime load)

The typographic wordmark hides automatically when `logoUrl` is set.

## Verification

```bash
npm run verify:render-layer-phase4
```

Includes: build, Phases 1–4 tests, branding asset checks, theme token verification, need experience regression, platform build, import lint.

## Manual Review

1. `npm run dev` + `npm run dev:web`
2. Login — white Need Mode panel with `an act` wordmark
3. Need Home — refined spacing, navigation, cards with elevation
4. Complete journey — 640ms transition with `an act...` terminal overlay
5. Contract Preview — Action Mode black background, white typography

## Remaining Work Before Public MVP

| Area | Gap |
|---|---|
| Logo asset | Replace SVG placeholders with final brand mark |
| Inter font loading | Self-host or CDN `@font-face` for production |
| Action-mode shadow tuning | Visual QA on elevated cards in dark surfaces |
| PWA service worker | Offline shell (placeholder manifest only) |
| Desktop packaging | Electron/Tauri wrapper using same icon assets |
| Motion QA | Device testing for reduced-motion vs transition preservation |
| i18n / RTL | Brand layout mirroring for Arabic markets |

## Goal Met

The Web Shell now presents the official AN ACT identity consistently — premium, mode-aware, and token-driven — without changing Runtime JSON architecture or backend behavior.
