# AN ACT — Design Tokens Export Plan

**Version:** 1.0  
**Companion:** [Design Tokens Specification](./AN-ACT-Design-Tokens-Specification.md)  
**Target package:** `@an-act/tokens`  
**Constraint:** Planning document only. No source code modified.

---

## Status Classification Key

| Label | Meaning |
|-------|---------|
| **Implemented** | Exists in repository today |
| **Concept only** | Not yet built as export artifact |
| **Recommended** | Official export guidance |

---

## Executive Summary

The authoritative token source is **`DESIGN_TOKENS`** in `src/design-system/tokens/design-tokens.ts` — **Implemented**. Resolvers `resolveSemanticColor`, `shadowTokenToCss`, `motionToCss`, `elevationToShadow` exist — **Implemented**.

The **`@an-act/tokens` NPM package** is **Concept only** (Transition To MVP Plan P0). This plan defines how to extract, format, and consume tokens across React, React Native, Flutter, SwiftUI, Bubble, and CSS — without modifying platform source until explicitly requested.

---

## 1. Future NPM Package Structure (`@an-act/tokens`)

**Classification:** **Recommended**

```
packages/tokens/
├── package.json                 # name: "@an-act/tokens", version: "1.0.0"
├── README.md
├── CHANGELOG.md
├── src/
│   ├── index.ts                 # public API
│   ├── design-tokens.ts         # re-export or sync from platform
│   ├── resolve.ts               # resolveSemanticColor, resolveSpacing, etc.
│   ├── css.ts                   # generateCssVariables()
│   └── types.ts                 # SemanticColorTokenPath, AnActMode, ...
├── dist/
│   ├── index.js
│   ├── index.d.ts
│   └── tokens.json
├── assets/
│   ├── tokens.json              # canonical JSON export
│   ├── tokens.need.css          # CSS variables — Need Mode
│   ├── tokens.action.css        # CSS variables — Action Mode
│   └── tokens.schema.json       # JSON Schema for tokens.json
└── scripts/
    └── sync-from-platform.ts    # copies from src/design-system/ (CI)
```

### Public API surface (**Recommended**)

```typescript
export const TOKENS_VERSION = "an-act-design-system-v1";

export type AnActMode = "need" | "action";

export function getTokens(): DesignTokens;
export function resolveColor(mode: AnActMode, path: SemanticColorTokenPath): string;
export function resolveSpacing(name: SpacingTokenName): number;
export function resolveTypography(style: TypographyStyle): TypographyToken;
export function resolveShadow(level: ElevationLevel, mode?: AnActMode): string;
export function resolveMotion(duration: MotionDuration): MotionToken;
export function resolveLiveFrameAccent(tier: LiveFrameTier, mode: AnActMode): string;

export { DESIGN_TOKENS as tokens };
```

### Workspace integration

Monorepo root `package.json` adds:

```json
{
  "workspaces": ["packages/*"]
}
```

Platform `src/design-system/` remains source of truth; CI syncs into package — **Recommended** to avoid drift.

---

## 2. JSON Export Format

**Classification:** **Recommended**

Canonical file: `assets/tokens.json`

```json
{
  "version": "an-act-design-system-v1",
  "meta": {
    "generated_at": "2026-06-28T12:00:00.000Z",
    "source": "src/design-system/tokens/design-tokens.ts"
  },
  "colors": {
    "semanticGroups": ["background", "surface", "text", "accent", "border", "status", "interactive", "overlay", "transition"],
    "semanticPaths": ["background.primary", "..."],
    "themes": {
      "need": {
        "background.primary": "#FFFFFF",
        "text.primary": "#000000"
      },
      "action": {
        "background.primary": "#000000",
        "text.primary": "#FFFFFF"
      }
    }
  },
  "typography": {
    "display": { "fontFamily": "...", "fontSize": 40, "fontWeight": 700, "lineHeight": 48, "letterSpacing": -0.5 }
  },
  "spacing": {
    "space-4": 4,
    "space-8": 8
  },
  "radius": {
    "small": 4,
    "medium": 8,
    "large": 12,
    "extraLarge": 16,
    "pill": 9999,
    "circle": "50%"
  },
  "elevation": {
    "none": { "zIndex": 0, "shadowToken": "shadow-none" }
  },
  "shadows": {
    "shadow-low": { "offsetX": 0, "offsetY": 1, "blur": 2, "spread": 0, "color": "rgba(0,0,0,0.06)" }
  },
  "motion": {
    "durations": { "fast": 120, "normal": 240, "slow": 400, "extraSlow": 640 },
    "easing": { "standard": "cubic-bezier(0.4, 0, 0.2, 1)" },
    "tokens": {
      "fast": { "durationMs": 120, "easing": "cubic-bezier(0.4, 0, 0.2, 1)" }
    }
  },
  "icons": {
    "names": ["home", "search", "..."],
    "sizes": { "xs": 12, "sm": 16, "md": 20, "lg": 24, "xl": 32 },
    "defaultStrokeWidth": 1.75
  },
  "transitions": {
    "forward": {
      "durationMs": 640,
      "brandLine": "an act...",
      "backgroundSteps": [
        { "progress": 0, "colorToken": "transition.start" },
        { "progress": 0.5, "colorToken": "transition.mid" },
        { "progress": 1, "colorToken": "transition.end" }
      ]
    }
  },
  "accessibility": {
    "minimumTouchTargetPx": 44,
    "minimumContrastRatioNormalText": 4.5,
    "focusRingWidthPx": 2
  },
  "extensions": {
    "liveFrame": {
      "uiTiers": ["bronze", "silver", "gold", "platinum", "diamond"],
      "tierAccentTokens": {
        "bronze": "status.warning",
        "silver": "border.subtle",
        "gold": "status.warning",
        "platinum": "accent.highlight",
        "diamond": "accent.primary"
      }
    }
  }
}
```

### Flat theme export (optional helper)

For Bubble and CSS, also emit flattened maps:

```json
{
  "need": {
    "--an-act-background-primary": "#FFFFFF",
    "--an-act-text-primary": "#000000"
  }
}
```

Generation script: walk `SEMANTIC_COLOR_TOKEN_PATHS`, resolve per theme — **Recommended**.

---

## 3. TypeScript Export Format

**Classification:** **Implemented** (in platform); package re-export **Concept only**

### Source types (already exist)

| Type | Location |
|------|----------|
| `DesignTokens` | `design-tokens.ts` |
| `SemanticColorTokenPath` | `foundation/colors.ts` |
| `SpacingTokenName` | `foundation/spacing.ts` |
| `TypographyStyle` | `foundation/typography.ts` |
| `RadiusToken` | `foundation/radius.ts` |
| `ElevationLevel` | `foundation/elevation.ts` |
| `MotionDuration` | `foundation/motion.ts` |
| `LiveFrameTier` | `core-ui/components/live-frame.ts` |

### Package exports map

```typescript
// @an-act/tokens — Recommended entry
export type { DesignTokens, SemanticColorTokenPath, ... } from "./types";
export { getTokens, resolveColor, resolveSpacing } from "./resolve";
export { tokens } from "./design-tokens";
```

### Strict path typing

`SemanticColorTokenPath` union prevents invalid color lookups — **Implemented**. Package MUST preserve this — **Recommended**.

---

## 4. CSS Variables Mapping

**Classification:** **Recommended** (helpers **Implemented** partially)

### Naming convention

```
--an-act-{group}-{key}
```

Examples:

| Token path | CSS variable |
|------------|--------------|
| `background.primary` | `--an-act-background-primary` |
| `accent.primary` | `--an-act-accent-primary` |
| `border.focus` | `--an-act-border-focus` |
| `status.error` | `--an-act-status-error` |

### Spacing, radius, motion

| Token | CSS variable |
|-------|--------------|
| `space-16` | `--an-act-space-16: 16px` |
| `radius.medium` | `--an-act-radius-medium: 8px` |
| `motion.fast` | `--an-act-motion-fast-duration: 120ms` |

### Generated CSS file structure

```css
/* tokens.need.css — Recommended */
:root[data-an-act-mode="need"] {
  --an-act-background-primary: #FFFFFF;
  --an-act-text-primary: #000000;
  /* ... all 32 semantic paths ... */
  --an-act-space-16: 16px;
  --an-act-shadow-medium: 0 4px 8px -2px rgba(0, 0, 0, 0.08);
}

/* tokens.action.css */
:root[data-an-act-mode="action"] {
  --an-act-background-primary: #000000;
  --an-act-text-primary: #FFFFFF;
}
```

### Usage in web apps

```html
<html data-an-act-mode="need">
```

```css
.card {
  background: var(--an-act-surface-elevated);
  color: var(--an-act-text-primary);
  border-radius: var(--an-act-radius-large);
  box-shadow: var(--an-act-shadow-medium);
}
```

Implement `generateCssVariables(mode: AnActMode): string` in package — **Recommended**. Port existing `shadowTokenToCss`, `motionToCss` — **Implemented** in platform.

---

## 5. React Export Strategy

**Classification:** **Recommended** (primary MVP path)

### Install

```bash
npm install @an-act/tokens @an-act/runtime-ui
```

### Theme provider

```tsx
import { AnActModeProvider, useAnActTheme } from "@an-act/runtime-ui";
import { resolveColor } from "@an-act/tokens";

function App({ screen }) {
  return (
    <AnActModeProvider mode={screen.mode}>
      <RuntimeScreenRenderer screen={screen} />
    </AnActModeProvider>
  );
}

function AnActCard({ props }) {
  const { mode } = useAnActTheme();
  return (
    <div style={{
      background: resolveColor(mode, "surface.elevated"),
      color: resolveColor(mode, "text.primary"),
    }}>
      {props.title}
    </div>
  );
}
```

### CSS-in-JS alternative

Inject `tokens.need.css` / `tokens.action.css` and toggle `data-an-act-mode` on `<html>` — **Recommended** for performance.

### Storybook

One story per mode × component, importing `@an-act/tokens` only — **Recommended**.

### Shared types

React app imports `SemanticColorTokenPath` from `@an-act/tokens` — same types as backend if package publishes `.d.ts` — **Recommended**.

---

## 6. React Native Export Strategy

**Classification:** **Recommended**

### Approach

1. Bundle `tokens.json` as asset
2. `AnActThemeContext` holds resolved Need/Action color objects
3. StyleSheet uses numeric spacing/radius from JSON

```typescript
import tokens from "@an-act/tokens/assets/tokens.json";
import { resolveColor } from "@an-act/tokens";

const styles = StyleSheet.create({
  card: {
    backgroundColor: resolveColor("need", "surface.elevated"),
    padding: tokens.spacing["space-16"],
    borderRadius: tokens.radius.large,
  },
});
```

### Platform notes

| Concern | Strategy |
|---------|----------|
| Shadows | Map elevation to RN `shadowOffset`, `shadowOpacity`, `shadowRadius` |
| Fonts | Load Inter + fallback; terminal uses system monospace |
| Mode switch | Context update on navigation transition |
| Safe area | Not in tokens — layout concern |

Expo asset linking for `tokens.json` — **Recommended**.

---

## 7. Flutter Export Strategy

**Classification:** **Recommended**

### Package layout

```
packages/an_act_tokens/
├── lib/
│   ├── an_act_tokens.dart
│   ├── theme_extension.dart
│   └── token_loader.dart
└── assets/
    └── tokens.json
```

### ThemeExtension

```dart
class AnActColors extends ThemeExtension<AnActColors> {
  final Color backgroundPrimary;
  final Color textPrimary;
  // ... generated from tokens.json

  static AnActColors need() => AnActTokenLoader.loadMode('need');
  static AnActColors action() => AnActTokenLoader.loadMode('action');
}
```

### Usage

```dart
MaterialApp(
  theme: ThemeData(extensions: [AnActColors.need()]),
  darkTheme: ThemeData(extensions: [AnActColors.action()]), // optional mapping
);
```

Generate Dart classes from `tokens.json` via build_runner script — **Recommended** to prevent manual drift.

---

## 8. SwiftUI Export Strategy

**Classification:** **Recommended**

### Asset bundle

Add `tokens.json` to app bundle; load at startup.

### Color extension

```swift
enum AnActMode { case need, action }

struct AnActColors {
    let backgroundPrimary: Color
    // ...

    static func load(mode: AnActMode) -> AnActColors {
        // Parse tokens.json themes[mode]
    }
}

extension EnvironmentValues {
    @Entry var anActColors: AnActColors = .load(mode: .need)
}
```

### Typography

Map `TypographyToken` to SwiftUI `Font` with `Font.custom("Inter", size: 16)`.

### SF Symbols

Map `ICON_NAMES` to SF Symbol equivalents where possible — icon assets **Missing** today.

---

## 9. Bubble Export Strategy

**Classification:** **Recommended** (prototype tier)

Bubble cannot run TypeScript resolvers natively. Strategy:

### Step 1 — Static JSON upload

1. Export `tokens.json` and flat `tokens.need.flat.json`
2. Upload to Bubble file storage or external CDN
3. On app init, fetch JSON into Bubble custom states

### Step 2 — Color mapping

Create Bubble **Option Set** `AN ACT Semantic Color` mirroring 32 paths.

Populate option attributes with hex from `themes.need` for MVP (Need Mode only).

### Step 3 — Component mapping

| core-ui-* | Bubble element |
|-----------|----------------|
| core-ui-button | Reusable Button |
| core-ui-card | Reusable Group |
| core-ui-live-frame | Reusable Group + border |

Use Option Set lookup: `Get color from AN ACT Semantic Color's value` — **Recommended**.

### Step 4 — Mode limitation

Bubble MVP: **Need Mode only**. Action Mode and 640ms transition are poor fits — aligns with `noBubbleIntegration: true` on executive modules — **Implemented**.

### Step 5 — API + tokens

Runtime JSON from API; colors from pre-synced token JSON — never hex from API payloads — per [Runtime JSON Contract](./AN-ACT-Runtime-JSON-Contract.md).

---

## 10. Export Pipeline

**Classification:** **Recommended**

```
src/design-system/          (source of truth — Implemented)
        │
        ▼
  npm run tokens:export       (Concept only — script to add)
        │
        ├── packages/tokens/assets/tokens.json
        ├── packages/tokens/assets/tokens.need.css
        ├── packages/tokens/assets/tokens.action.css
        ├── packages/tokens/dist/index.js
        └── validate: tokens.schema.json + verify:ch3-x1
        │
        ▼
  npm publish @an-act/tokens
```

### CI gates

| Gate | Command |
|------|---------|
| Token integrity | `npm run verify:ch3-x1` |
| JSON schema valid | `ajv validate -s tokens.schema.json -d tokens.json` |
| No drift | diff exported JSON vs committed artifact |
| Build | `npm run build` |

---

## 11. Migration Phases

| Phase | Work | Effort | Status |
|-------|------|--------|--------|
| 0 | This specification + export plan | — | ✅ Complete |
| 1 | `tokens:export` script + `tokens.json` | 2–3 days | **Concept only** |
| 2 | `@an-act/tokens` package + resolvers | 2–3 days | **Concept only** |
| 3 | CSS variable files | 1 day | **Concept only** |
| 4 | React `AnActModeProvider` in `@an-act/runtime-ui` | 3–5 days | **Concept only** |
| 5 | Storybook + Need Home pixel verification | 3–5 days | **Concept only** |
| 6 | Flutter/SwiftUI codegen | 3–5 days each | **Deferred** |
| 7 | Bubble flat JSON + option sets | 2–3 days | **Deferred** |

**Total to React MVP tokens:** ~8–12 engineering days (parallel with Runtime JSON Phase 1).

---

## 12. Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Platform/package drift | High | CI sync script; single source in `src/design-system/` |
| Bubble manual option sets stale | Medium | Document re-import on major version |
| Trust/Live Frame parallel hex systems | High | Package exports only CH3 X2 tier → semantic map |
| Missing icon SVGs | Medium | Ship name registry; assets in v1.1 |
| Action Mode shadow formula only in TS | Low | Port `elevationToShadow` to all platforms |

---

## 13. Verification Checklist

Before publishing `@an-act/tokens@1.0.0`:

- [ ] `tokens.json` validates against JSON Schema
- [ ] All 32 semantic paths resolve for need and action themes
- [ ] All 10 spacing tokens match `SPACING_SCALE`
- [ ] `resolveColor("need", "background.primary") === "#FFFFFF"`
- [ ] `resolveColor("action", "background.primary") === "#000000"`
- [ ] Transition `durationMs === 640`
- [ ] Live Frame tier accents resolve correctly per mode
- [ ] `npm run verify:ch3-x1` passes after sync
- [ ] React Storybook renders button/card/live-frame in both modes
- [ ] README documents `AnActMode` vs OS dark mode distinction
- [ ] CHANGELOG documents initial release from `an-act-design-system-v1`

---

## Final Recommendation

**Proceed with Phase 1–3 immediately** before Render Layer pixels — these are P0 items in the [Transition To MVP Plan](./AN-ACT-Transition-To-MVP-Plan.md).

**Primary consumer order:**

1. `@an-act/tokens` JSON + TypeScript → React / React Native
2. CSS variables → Web static/CSS modules
3. Codegen → Flutter / SwiftUI (when native MVP selected)
4. Flat JSON + Option Sets → Bubble prototype only

The specification in [AN-ACT-Design-Tokens-Specification.md](./AN-ACT-Design-Tokens-Specification.md) is the authoritative token catalog; this export plan defines how to ship it.

---

*Design Tokens Export Plan v1.0 — documentation only; no source code modified.*

*Specification: [AN-ACT-Design-Tokens-Specification.md](./AN-ACT-Design-Tokens-Specification.md)*

*Index: [Master Architecture Index](./AN-ACT-Master-Architecture-Index.md)*
