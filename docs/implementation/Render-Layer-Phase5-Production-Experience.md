# Render Layer Phase 5 — Production Experience

**Date:** 2026-06-28  
**Scope:** First production-quality AN ACT application — presentation layer only  
**Status:** Complete

## Summary

Phase 5 elevates the Web Shell from a branded prototype to a production-quality experience. Every screen uses Design Tokens for spacing, motion, and color. The official Splash Experience opens the app, a 640ms transition hands off to Runtime, and the full Need journey (Login through Contract Preview) feels polished, fast, and consistent.

No backend engines, business logic, or Runtime JSON contract were changed.

## Priority 1 — Official Splash Experience

| Requirement | Implementation |
|---|---|
| Matte black background | `.an-act-splash` — `#000000` full viewport |
| Official wordmark | `AnActWordmark` centered on splash |
| Terminal typography | Token-driven terminal font on wordmark + stage |
| Animated loading indicator | `.an-act-splash__indicator` — sliding progress bar |
| 640ms transition into Runtime | Hold 640ms → exit 640ms via `AN_ACT_TRANSITION_DURATION_MS` |
| Need Mode exit → white | `data-target-mode="need"` → `#FFFFFF` background |
| Action Mode exit → black | `data-target-mode="action"` → `#000000` background |

**Flow:** `App.tsx` renders `AnActSplash` on first mount → completes → `RuntimeProvider` + journey.

## Priority 2 — Desktop Experience

| Asset | Path |
|---|---|
| Favicon | `apps/web/public/favicon.svg` |
| PWA 192/512 icons | `apps/web/public/icons/an-act-icon-*.svg` |
| Apple touch icon | `apps/web/public/icons/an-act-apple-touch-icon.svg` |
| PWA manifest | `apps/web/public/manifest.webmanifest` (id, scope, categories, splash bg) |
| Window title | `AN ACT` in `index.html` |
| Brand config | `apps/web/public/an-act-brand.json` |

## Priority 3 — Runtime Experience Polish

Production stylesheet: `@an-act/runtime-ui/production.css`

| Area | Enhancement |
|---|---|
| Spacing | Token variables on screen/section; desktop widened max-width |
| Scrolling | `overflow-y: auto`, `overscroll-behavior: contain`, smooth scroll |
| Transitions | Content enter animation; splash exit; preserved 640ms mode bridge |
| Loading | Compact inline status bar; splash indicator; brand loading unchanged |
| Empty states | `.an-act-empty-state` dashed card treatment |
| Error states | `.an-act-error-panel` grouped layout |
| Keyboard focus | Skip link; `:focus-visible` rings; `#an-act-main` landmark |
| Hover | Button secondary/ghost; interactive card lift + elevation |
| Mobile | 640px breakpoint — tighter padding, safe-area bottom nav |
| Desktop | 1024px breakpoint — wider screen padding |

## Priority 4 — Need Experience Screens

All screens render from Runtime JSON unchanged. Presentation refinements apply uniformly:

| Screen | Polish applied |
|---|---|
| Login | Branded panel, token fields, primary button, splash handoff |
| Need Home | App shell, section rhythm, card elevation, nav sticky bottom |
| Search | Label typography, token inputs, primary search button |
| Opportunity List | Interactive card hover, live frame, list grouping |
| Request | Field labels, draft inputs, disabled continue styling |
| Contract Preview | Action Mode theme, elevated contract card |

## Priority 5 — Application Quality

| Check | Verification |
|---|---|
| Performance | CSS `contain` on splash; `touch-action: manipulation`; bundle < 512KB |
| Accessibility | Skip link, ARIA on splash, focus rings, 44px targets, reduced-motion |
| Responsive | Mobile + desktop media queries, safe-area insets |
| Animation timing | 640ms splash + transition; 320ms content enter |
| Theme consistency | Need white / Action black from semantic tokens |
| Brand consistency | Wordmark, terminal moments, official loading |

## Files Created / Modified

### New

| File | Purpose |
|---|---|
| `packages/runtime-ui/src/react/brand/AnActSplash.tsx` | Official splash component |
| `packages/runtime-ui/src/react/styles/an-act-production.css` | Production polish + splash styles |
| `test/render-layer-phase5.test.ts` | 13 production verification tests |
| `scripts/verify-render-layer-phase5.sh` | Full Phase 5 verification pipeline |
| `apps/web/public/icons/an-act-apple-touch-icon.svg` | Apple touch icon placeholder |

### Modified

| File | Change |
|---|---|
| `apps/web/src/App.tsx` | Splash gate before Runtime |
| `apps/web/src/pages/RuntimePage.tsx` | Inline status bar, error panel |
| `packages/runtime-ui/src/react/brand/AnActAppShell.tsx` | Skip link, scrollable main, content enter |
| `apps/web/public/manifest.webmanifest` | Production manifest refinement |
| `apps/web/index.html` | Apple meta, viewport-fit, dual theme-color |
| `apps/web/src/styles/global.css` | Imports production.css |
| `packages/runtime-ui/package.json` | Exports `./production.css` |

## Verification

```bash
npm run verify:render-layer-phase5
```

Includes: build, Phases 1–5 tests (65 total), brand/responsive/a11y/performance checks, need regression, platform build, import lint.

## Manual Review

1. `npm run dev` + `npm run dev:web`
2. Observe matte black splash with `an act` wordmark and loading bar (~1.28s total)
3. Fade into Need Mode login (white)
4. Complete journey — polish on every screen
5. Contract Preview — Action Mode matte black

## Remaining Work Before Public Launch

| Area | Gap |
|---|---|
| Final logo/mark | Replace SVG icon placeholders |
| Font loading | Self-hosted Inter for production CDN independence |
| Service worker | Offline shell beyond manifest |
| Haptic / native | iOS/Android wrapper using same splash assets |
| Visual QA | Design sign-off on all journey screens |
| E2E | Browser automation for splash → contract path |

## Success Criteria Met

Opening AN ACT immediately feels like a premium global product — splash, typography, motion, and mode-aware theming are production-quality. Backend behavior and Runtime JSON contract are unchanged; only the presentation layer evolved.
