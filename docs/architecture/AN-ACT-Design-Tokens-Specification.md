# AN ACT — Design Tokens Specification

**Version:** 1.0  
**Package name (target):** `@an-act/tokens`  
**Source authority:** `src/design-system/tokens/design-tokens.ts` → `DESIGN_TOKENS`  
**Status:** Official specification (documentation)  
**Constraint:** Derived from repository evidence only. No source code modified.

---

## Status Classification Key

| Label | Meaning |
|-------|---------|
| **Implemented** | Exists in `src/design-system/` with concrete values |
| **Documented** | Described in CH3 markdown docs |
| **Concept only** | Recommended for package export; not yet published as NPM |
| **Missing** | Expected by philosophy but absent from token registry |
| **Recommended** | Official v1.0 guidance for package design |

---

## 1. Design Token Philosophy

**Classification:** **Implemented** — `DESIGN_SYSTEM_PHILOSOPHY` in `documentation/design-system.ts`

AN ACT design tokens are the **visual operating system** for every Render Layer surface. They encode the platform's dual-mode identity (Need vs Action) as framework-independent, semantic, validated values.

### Core principles

| Principle | Rule | Status |
|-----------|------|--------|
| Semantic only | Components reference token **paths** (`accent.primary`), never raw hex in UI code | **Implemented** |
| Dual operating modes | **Need Mode** (reflect/plan) and **Action Mode** (execute) — not generic light/dark | **Implemented** |
| Deterministic transitions | Official 640ms mode bridge with terminal typography | **Implemented** |
| Paired elevation + shadow | Every elevation level maps to a named shadow token | **Implemented** |
| Accessibility by default | 44px touch targets, focus rings, reduced-motion fallbacks | **Implemented** |
| Runtime JSON alignment | Runtime screens carry `designTokens[]` paths; clients resolve via this package | **Implemented** |
| Framework independence | Tokens are plain JSON/TS — no React/Flutter coupling | **Implemented** |

### Aggregate export

```typescript
// Implemented — src/design-system/tokens/design-tokens.ts
DESIGN_TOKENS.version === "an-act-design-system-v1"
getDesignTokens() // returns full aggregate
validateDesignSystem() // gates token integrity
```

---

## 2. Token Hierarchy

**Classification:** **Implemented**

```
Layer 0 — Meta
  └── version: "an-act-design-system-v1"

Layer 1 — Foundation tokens (mode-agnostic definitions)
  ├── colors.semanticGroups + semanticPaths
  ├── typography (styles, families)
  ├── spacing (scale + named tokens)
  ├── radius
  ├── elevation (+ shadow pairing)
  ├── motion (durations, easing, composite tokens)
  ├── icons (names, sizes, stroke)
  └── transitions (official mode-bridge spec)

Layer 2 — Theme tokens (mode-resolved color values)
  ├── themes.need   → NEED_MODE_COLORS
  └── themes.action → ACTION_MODE_COLORS

Layer 3 — Component tokens (semantic references + layout metrics)
  └── components.{buttons, inputs, cards, badges, progress, navigation,
                  liveFrame, avatar, chips, timeline}

Layer 4 — Core UI registry (CH3-X2 — references Layer 1–3)
  └── core-ui-* component definitions (variants, states, responsive)

Layer 5 — Runtime JSON (CH3-X5+ — references Layer 4 by componentId + designTokens[])
```

**Package rule (**Recommended**):** `@an-act/tokens` exports Layers 0–3. `@an-act/runtime-ui` consumes Layer 4+. Trust/Live Frame trust-layer color keys are a **Recommended** Layer 2.5 extension (see §14).

---

## 3. Color Tokens

**Classification:** **Implemented**

### 3.1 Semantic color groups

| Group | Purpose |
|-------|---------|
| `background` | Page and canvas backgrounds |
| `surface` | Cards, panels, elevated containers |
| `text` | Typography colors |
| `accent` | Brand emphasis, links, highlights |
| `border` | Dividers, outlines, focus rings |
| `status` | Success, warning, error, info |
| `interactive` | Buttons, controls, hover/pressed |
| `overlay` | Scrims, modal backdrops |
| `transition` | Mode-bridge background interpolation |

### 3.2 Complete semantic path registry (32 paths)

**Implemented** — `SEMANTIC_COLOR_TOKEN_PATHS`

| Path | Group.Key |
|------|-----------|
| `background.primary` | background.primary |
| `background.secondary` | background.secondary |
| `background.tertiary` | background.tertiary |
| `background.inverse` | background.inverse |
| `surface.primary` | surface.primary |
| `surface.secondary` | surface.secondary |
| `surface.elevated` | surface.elevated |
| `surface.muted` | surface.muted |
| `text.primary` | text.primary |
| `text.secondary` | text.secondary |
| `text.tertiary` | text.tertiary |
| `text.inverse` | text.inverse |
| `text.disabled` | text.disabled |
| `accent.primary` | accent.primary |
| `accent.secondary` | accent.secondary |
| `accent.highlight` | accent.highlight |
| `border.default` | border.default |
| `border.subtle` | border.subtle |
| `border.focus` | border.focus |
| `status.success` | status.success |
| `status.warning` | status.warning |
| `status.error` | status.error |
| `status.info` | status.info |
| `interactive.default` | interactive.default |
| `interactive.hover` | interactive.hover |
| `interactive.pressed` | interactive.pressed |
| `interactive.disabled` | interactive.disabled |
| `overlay.scrim` | overlay.scrim |
| `overlay.backdrop` | overlay.backdrop |
| `transition.start` | transition.start |
| `transition.mid` | transition.mid |
| `transition.end` | transition.end |

### 3.3 Need Mode — complete color table

**Implemented** — `src/design-system/themes/need-mode.ts`

| Path | Hex / RGBA |
|------|------------|
| `background.primary` | `#FFFFFF` |
| `background.secondary` | `#FAFAFA` |
| `background.tertiary` | `#F5F5F5` |
| `background.inverse` | `#000000` |
| `surface.primary` | `#FFFFFF` |
| `surface.secondary` | `#F3F4F6` |
| `surface.elevated` | `#FFFFFF` |
| `surface.muted` | `#E5E7EB` |
| `text.primary` | `#000000` |
| `text.secondary` | `#374151` |
| `text.tertiary` | `#6B7280` |
| `text.inverse` | `#FFFFFF` |
| `text.disabled` | `#9CA3AF` |
| `accent.primary` | `#2563EB` |
| `accent.secondary` | `#3B82F6` |
| `accent.highlight` | `#1D4ED8` |
| `border.default` | `#E5E7EB` |
| `border.subtle` | `#F3F4F6` |
| `border.focus` | `#2563EB` |
| `status.success` | `#059669` |
| `status.warning` | `#D97706` |
| `status.error` | `#DC2626` |
| `status.info` | `#2563EB` |
| `interactive.default` | `#2563EB` |
| `interactive.hover` | `#1D4ED8` |
| `interactive.pressed` | `#1E40AF` |
| `interactive.disabled` | `#93C5FD` |
| `overlay.scrim` | `rgba(0, 0, 0, 0.4)` |
| `overlay.backdrop` | `rgba(255, 255, 255, 0.8)` |
| `transition.start` | `#FFFFFF` |
| `transition.mid` | `#6B7280` |
| `transition.end` | `#000000` |

### 3.4 Action Mode — complete color table

**Implemented** — `src/design-system/themes/action-mode.ts`

| Path | Hex / RGBA |
|------|------------|
| `background.primary` | `#000000` |
| `background.secondary` | `#0A0A0A` |
| `background.tertiary` | `#111111` |
| `background.inverse` | `#FFFFFF` |
| `surface.primary` | `#111111` |
| `surface.secondary` | `#1A1A1A` |
| `surface.elevated` | `#1F1F1F` |
| `surface.muted` | `#262626` |
| `text.primary` | `#FFFFFF` |
| `text.secondary` | `#D1D5DB` |
| `text.tertiary` | `#9CA3AF` |
| `text.inverse` | `#000000` |
| `text.disabled` | `#6B7280` |
| `accent.primary` | `#3B82F6` |
| `accent.secondary` | `#60A5FA` |
| `accent.highlight` | `#2563EB` |
| `border.default` | `#262626` |
| `border.subtle` | `#1A1A1A` |
| `border.focus` | `#3B82F6` |
| `status.success` | `#34D399` |
| `status.warning` | `#FBBF24` |
| `status.error` | `#F87171` |
| `status.info` | `#60A5FA` |
| `interactive.default` | `#3B82F6` |
| `interactive.hover` | `#60A5FA` |
| `interactive.pressed` | `#2563EB` |
| `interactive.disabled` | `#1E3A5F` |
| `overlay.scrim` | `rgba(0, 0, 0, 0.72)` |
| `overlay.backdrop` | `rgba(0, 0, 0, 0.88)` |
| `transition.start` | `#000000` |
| `transition.mid` | `#6B7280` |
| `transition.end` | `#FFFFFF` |

### 3.5 Resolution API

**Implemented**

```typescript
resolveSemanticColor(tokens: SemanticColorTokens, path: SemanticColorTokenPath): string
```

---

## 4. Typography Tokens

**Classification:** **Implemented**

### 4.1 Font families

| Token key | Stack |
|-----------|-------|
| `sans` | `"Inter", "SF Pro Text", system-ui, -apple-system, sans-serif` |
| `display` | `"Inter", "SF Pro Display", system-ui, -apple-system, sans-serif` |
| `terminal` | `"SF Mono", "Menlo", "Consolas", monospace` |

### 4.2 Typography style tokens (complete table)

| Style | fontFamily | fontSize | fontWeight | lineHeight | letterSpacing | textTransform |
|-------|------------|----------|------------|------------|---------------|---------------|
| `display` | display | 40 | 700 | 48 | -0.5 | — |
| `heading` | display | 28 | 600 | 36 | -0.25 | — |
| `title` | sans | 20 | 600 | 28 | 0 | — |
| `body` | sans | 16 | 400 | 24 | 0 | — |
| `caption` | sans | 13 | 400 | 18 | 0.1 | — |
| `label` | sans | 12 | 500 | 16 | 0.4 | uppercase |
| `terminal` | terminal | 18 | 400 | 24 | 0.2 | — |

### 4.3 Brand typography usage

| Usage | Text | Style | Status |
|-------|------|-------|--------|
| Transition brand line | `an act...` | terminal | **Implemented** |
| Default transition status | `Preparing...` | terminal | **Implemented** |
| Transition stage texts | Preparing…, Matching…, Building Contract…, Securing…, Action Ready. | terminal | **Documented** |

Export constants: `TYPOGRAPHY_STYLES`, `TYPOGRAPHY_TOKENS`, `TERMINAL_TYPOGRAPHY_USAGE`.

---

## 5. Spacing Tokens

**Classification:** **Implemented**

### 5.1 Spacing scale (base values)

| Index | px |
|------:|---:|
| 0 | 4 |
| 1 | 8 |
| 2 | 12 |
| 3 | 16 |
| 4 | 20 |
| 5 | 24 |
| 6 | 32 |
| 7 | 40 |
| 8 | 48 |
| 9 | 64 |

`SPACING_SCALE` — exactly 10 values; validator enforces `[4, 8, 12, 16, 20, 24, 32, 40, 48, 64]`.

### 5.2 Named spacing tokens (complete table)

| Token | px |
|-------|---:|
| `space-4` | 4 |
| `space-8` | 8 |
| `space-12` | 12 |
| `space-16` | 16 |
| `space-20` | 20 |
| `space-24` | 24 |
| `space-32` | 32 |
| `space-40` | 40 |
| `space-48` | 48 |
| `space-64` | 64 |

### 5.3 Common layout usage

| Context | Typical tokens | Source |
|---------|----------------|--------|
| Screen content padding | `space-16` X/Y | need-layout, action-layout |
| Region gap | `space-12` | layout specs |
| Button padding | `space-24` X, `space-12` Y | button-primary |
| Badge padding | `space-8` X, `space-4` Y | badge-professional |
| Live Frame padding | `space-16` X, `space-12` Y | live-frame spec |

---

## 6. Radius Tokens

**Classification:** **Implemented**

| Token | Value |
|-------|-------|
| `small` | 4 |
| `medium` | 8 |
| `large` | 12 |
| `extraLarge` | 16 |
| `pill` | 9999 |
| `circle` | `50%` |

Common assignments: buttons → `medium`; cards → `large`; badges/chips → `pill`; Live Frame ring → `circle`; progress bar → `pill`.

---

## 7. Border Tokens

**Classification:** **Implemented** (color paths); width tokens **Recommended**

### 7.1 Border colors (semantic)

See §3.2 paths: `border.default`, `border.subtle`, `border.focus`.

Focus ring spec (**Implemented** — `ACCESSIBILITY_SPEC`):

| Property | Value |
|----------|------:|
| `ringColorToken` | `border.focus` |
| `ringWidthPx` | 2 |
| `ringOffsetPx` | 2 |

### 7.2 Border widths (**Recommended** package extension)

Not a separate foundation file today. De facto values from component specs:

| Usage | Width (px) | Source |
|-------|----------:|--------|
| Default component border | 1 | implied |
| Live Frame ring stroke | 2 | `LIVE_FRAME_SPEC.ring.strokeWidth` |
| Focus ring | 2 | `ACCESSIBILITY_RULES.focusRingWidthPx` |

**Recommended** named tokens for `@an-act/tokens`: `border-width-default: 1`, `border-width-focus: 2`, `border-width-live-frame: 2`.

---

## 8. Elevation / Shadow Tokens

**Classification:** **Implemented**

### 8.1 Elevation levels (complete table)

| Level | zIndex | shadowToken |
|-------|-------:|-------------|
| `none` | 0 | `shadow-none` |
| `low` | 1 | `shadow-low` |
| `medium` | 4 | `shadow-medium` |
| `high` | 8 | `shadow-high` |
| `highest` | 16 | `shadow-highest` |

Rule: elevation MUST pair with defined shadow token — no arbitrary shadows (**Implemented** validator intent).

### 8.2 Shadow tokens (complete table)

| Token | offsetX | offsetY | blur | spread | color |
|-------|--------:|--------:|-----:|-------:|-------|
| `shadow-none` | 0 | 0 | 0 | 0 | transparent |
| `shadow-low` | 0 | 1 | 2 | 0 | `rgba(0,0,0,0.06)` |
| `shadow-medium` | 0 | 4 | 8 | -2 | `rgba(0,0,0,0.08)` |
| `shadow-high` | 0 | 8 | 16 | -4 | `rgba(0,0,0,0.12)` |
| `shadow-highest` | 0 | 16 | 32 | -8 | `rgba(0,0,0,0.16)` |

### 8.3 Action Mode shadow adjustment

**Implemented** — `elevationToShadow(level, mode)`:

- Action mode: blur × 1.4, color `rgba(0,0,0,0.32)` for stronger contrast on dark surfaces.

Helper: `shadowTokenToCss(token)` → CSS `box-shadow` string.

---

## 9. Motion Tokens

**Classification:** **Implemented**

### 9.1 Duration tokens (complete table)

| Token | ms |
|-------|---:|
| `fast` | 120 |
| `normal` | 240 |
| `slow` | 400 |
| `extraSlow` | 640 |

### 9.2 Easing tokens (complete table)

| Token | cubic-bezier |
|-------|--------------|
| `standard` | `(0.4, 0, 0.2, 1)` |
| `decelerate` | `(0, 0, 0.2, 1)` |
| `accelerate` | `(0.4, 0, 1, 1)` |
| `emphasized` | `(0.2, 0, 0, 1)` |

### 9.3 Composite motion tokens

| Duration | durationMs | Default easing |
|----------|----------:|----------------|
| `fast` | 120 | standard |
| `normal` | 240 | standard |
| `slow` | 400 | decelerate |
| `extraSlow` | 640 | emphasized |

API: `resolveMotionToken(duration)`, `motionToCss(duration, properties?)`.

---

## 10. Animation Timing

**Classification:** **Implemented**

### Official mode transition

| Property | Need → Action | Action → Need |
|----------|---------------|---------------|
| `durationMs` | 640 | 640 |
| `easing` | emphasized | decelerate |
| `typographyStyle` | terminal | terminal |
| `brandLine` | `an act...` | `an act...` |
| `statusLine` | `Preparing...` | `Preparing...` |

### Background interpolation steps

| Progress | Color token (forward Need→Action) |
|----------|-----------------------------------|
| 0 | `transition.start` |
| 0.5 | `transition.mid` |
| 1 | `transition.end` |

Reverse transition uses same token path structure with Action Mode resolved values.

### Progress bar (transition)

| Property | Value |
|----------|-------|
| height | 4px |
| trackColorToken | `surface.muted` |
| fillColorToken (forward) | `accent.primary` |
| fillColorToken (reverse) | `accent.highlight` |
| radiusToken | `pill` |

### Reduced motion (**Implemented**)

When `prefers-reduced-motion` or `reduced_motion=true`:

- Skip transition animations
- Preserve progress value updates
- Instant background change (`fallbackDurationMs: 0`)

---

## 11. Icon Tokens

**Classification:** **Implemented** (registry); SVG assets **Missing**

### 11.1 Icon sizes (complete table)

| Token | px |
|-------|---:|
| `xs` | 12 |
| `sm` | 16 |
| `md` | 20 |
| `lg` | 24 |
| `xl` | 32 |

Default stroke width: **1.75** (`DEFAULT_ICON_STROKE`).

### 11.2 Icon names (complete registry)

| Name | Typical usage |
|------|---------------|
| `home` | Bottom nav, Need home |
| `search` | Search entry |
| `profile` | Profile nav |
| `settings` | Settings screens |
| `timeline` | Timeline nav |
| `achievement` | Achievements |
| `analytics` | Analytics cards |
| `live-frame` | Live Frame surfaces |
| `action` | Action mode |
| `navigation` | Nav chrome |
| `chevron` | Back/expand |
| `close` | Dismiss |
| `check` | Success/confirm |
| `progress` | Progress indicators |
| `badge` | Badge affordance |

**Missing:** Icon SVG/font files. Package SHOULD ship icon name → asset map when assets exist — **Recommended**.

---

## 12. Illustration Tokens

**Classification:** **Missing** (runtime placeholder only)

Runtime empty states reference `variant: "empty-illustration"` and `illustration: true` on `core-ui-card` props — **Implemented** as JSON hint only.

No illustration color palette, dimensions, or asset registry in `DESIGN_TOKENS`.

**Recommended** v1.0 extension (Concept only):

| Token | Purpose |
|-------|---------|
| `illustration.empty.background` | Empty state fill → `surface.secondary` |
| `illustration.empty.accent` | Accent shape → `accent.primary` at 20% opacity |
| `illustration.empty.maxWidth` | 240px |
| `illustration.empty.aspectRatio` | 4:3 |

Until assets exist, clients MAY omit illustration rendering and show card title/message only.

---

## 13. Logo Tokens

**Classification:** **Missing** — typographic brand only

| Element | Value | Status |
|---------|-------|--------|
| Wordmark text | `an act...` | **Implemented** (transition brand line) |
| Wordmark style | `terminal` typography | **Implemented** |
| Logo SVG/PNG | — | **Missing** |
| Favicon / app icon | — | **Missing** |
| Logo color (Need) | `text.primary` on `background.primary` | **Recommended** |
| Logo color (Action) | `text.primary` on `background.primary` | **Recommended** |

CH4 Design Identity Review: **No separate logo required** until a mark is designed; typographic brand is canonical — **Documented**.

---

## 14. Live Frame Tokens

**Classification:** **Implemented** (UI tier mapping); trust hex keys **parallel systems**

### 14.1 CH3 UI tiers (`core-ui-live-frame`)

**Implemented** — 5 tiers with semantic accent mapping:

| UI tier | border/accent token | Need resolved | Action resolved |
|---------|---------------------|---------------|-----------------|
| `bronze` | `status.warning` | `#D97706` | `#FBBF24` |
| `silver` | `border.subtle` | `#F3F4F6` | `#1A1A1A` |
| `gold` | `status.warning` | `#D97706` | `#FBBF24` |
| `platinum` | `accent.highlight` | `#1D4ED8` | `#2563EB` |
| `diamond` | `accent.primary` | `#2563EB` | `#3B82F6` |

Component metrics (**Implemented**):

| Property | Value |
|----------|-------|
| minHeight | 64 |
| padding | `space-16` × `space-12` |
| radius | `circle` |
| elevation | `medium` |
| motion | `slow` |
| ring strokeWidth | 2 |
| glowColorToken | `accent.highlight` |

### 14.2 X1 Live Frame spec (`LIVE_FRAME_SPECS`)

References: `surface.elevated`, `text.primary`, `accent.primary`, `accent.highlight`.

### 14.3 Trust-layer color keys (not in DESIGN_TOKENS)

**Implemented** in trust domain — **Recommended** package extension:

| Trust color key | Used by | Hex in CH2 living (deprecated for UI) |
|-----------------|---------|---------------------------------------|
| `platinum_gold` | S5 PLATINUM_ELITE | — |
| `emerald` | S5 EMERALD_PRO | `#10B981` (CH2 EMERALD_PRO) |
| `sapphire` | S5 SAPPHIRE_VERIFIED | — |
| `gray` | S5 STANDARD | — |
| `red` | S5 RESTRICTED | — |

Official UI mapping: see [Live Frame v1.0 Specification](./AN-ACT-Live-Frame-v1.0-Specification.md) — trust tier → `ui_tier` → semantic accent token.

---

## 15. Status Colors

**Classification:** **Implemented** — `status.*` semantic group

### Need Mode

| Token | Hex |
|-------|-----|
| `status.success` | `#059669` |
| `status.warning` | `#D97706` |
| `status.error` | `#DC2626` |
| `status.info` | `#2563EB` |

### Action Mode

| Token | Hex |
|-------|-----|
| `status.success` | `#34D399` |
| `status.warning` | `#FBBF24` |
| `status.error` | `#F87171` |
| `status.info` | `#60A5FA` |

### Button variant mapping

| Variant | Background token |
|---------|------------------|
| `danger` | `status.error` |
| `success` | `status.success` |

---

## 16. Dashboard Colors

**Classification:** **Recommended** — no separate dashboard palette

Executive, operations, and readiness dashboards (`runtime-executive`, `runtime-operations`, etc.) use **the same semantic tokens** as runtime experiences — **Implemented** pattern.

**Recommended** dashboard semantic usage:

| Surface | Token | Mode |
|---------|-------|------|
| Dashboard canvas | `background.primary` | need (operator UIs default light) |
| KPI card | `surface.elevated` + `shadow-low` | need |
| KPI value text | `text.primary` | need |
| KPI label | `text.secondary` | need |
| Readiness progress | `accent.primary` fill, `surface.muted` track | need |
| Alert chip | `status.warning` / `status.error` | need |
| Read-only badge | `surface.muted` + `text.secondary` | need |

CH4 intelligence dashboards: read-only JSON — use `status.info` for neutral metrics, `status.success`/`status.warning` for health — **Recommended**, not a separate token file.

---

## 17. Marketplace Colors

**Classification:** **Recommended** — no separate marketplace palette

Marketplace discovery (`GET /discover/providers`) and Need opportunity cards use **Need Mode** tokens — **Implemented**.

**Recommended** marketplace component mapping:

| Element | Tokens |
|---------|--------|
| Provider card background | `surface.elevated` |
| Rank score emphasis | `accent.primary` |
| Trust tier ring | Live Frame UI tier → §14.1 |
| Available now badge | `status.success` |
| Unavailable | `text.tertiary` |
| Rating stars | `status.warning` |
| Distance/metadata | `text.secondary` |

Admin marketplace intelligence views: same Need Mode semantic palette — **Recommended**.

---

## 18. AI Colors

**Classification:** **Recommended** — no dedicated AI palette in design system

CH5 AI Experience modules return read-only JSON with `read_only: true` — no AI-specific colors in `DESIGN_TOKENS` — **Implemented** (absence verified).

**Recommended** AI surface mapping (when rendering intelligence UI):

| Element | Token |
|---------|-------|
| AI panel background | `surface.secondary` |
| Confidence high | `status.success` |
| Confidence medium | `status.warning` |
| Confidence low | `status.error` |
| Chain/delegation chip | `accent.secondary` |
| Read-only indicator | `text.tertiary` + `surface.muted` |
| Foundation headline | `heading` typography + `text.primary` |

Do not invent a separate "AI purple" — use existing semantic status/accent tokens — **Recommended**.

---

## 19. Semantic Color Mapping

**Classification:** **Implemented**

### Mode selection

```
RuntimeScreenView.mode → theme key
  "need"        → themes.need
  "action"      → themes.action
  "transition"  → interpolate transition.* tokens per progress
```

### Component → token mapping (examples)

| Component | Background | Text | Border | Accent |
|-----------|------------|------|--------|--------|
| button-primary | interactive.default | text.inverse | interactive.default | — |
| button-secondary | surface.primary | text.primary | border.default | — |
| button-ghost | background.primary | accent.primary | — | — |
| card (base) | surface.primary | text.primary | border.subtle | — |
| card (elevated) | surface.elevated | text.primary | — | — |
| badge-professional | surface.muted | text.secondary | border.subtle | accent.primary |
| input-text | surface.primary | text.primary | border.default | border.focus (focus) |

Full component specs: `DESIGN_TOKENS.components.*` — **Implemented**.

---

## 20. Dark / Light Strategy

**Classification:** **Implemented** — dual-mode, not traditional light/dark toggle

AN ACT does **not** use a generic `prefers-color-scheme` light/dark pair. Instead:

| Mode | Visual identity | When active |
|------|-----------------|-------------|
| **Need Mode** | White bg, black text, light surfaces | Discovery, planning, profile browsing |
| **Action Mode** | Black bg, white text, dark surfaces | Execution, contracts, active work |
| **Transition** | Interpolated `transition.*` tokens | Official 640ms bridge |

### Implications for Render Layer

1. Theme is driven by `screen.mode` from Runtime JSON, not OS preference alone — **Implemented**
2. OS dark mode MAY map to Action Mode only when user is in action contexts — **Recommended**
3. Need Mode stays light even if OS prefers dark (brand consistency) — **Recommended**
4. `prefers-reduced-motion` is honored independently — **Implemented**

---

## 21. Accessibility Requirements

**Classification:** **Implemented** — `ACCESSIBILITY_RULES`, `ACCESSIBILITY_SPEC`

| Rule | Value |
|------|------:|
| `minimumTouchTargetPx` | 44 |
| `minimumContrastRatioNormalText` | 4.5:1 |
| `minimumContrastRatioLargeText` | 3:1 |
| `focusRingWidthPx` | 2 |
| `focusRingOffsetPx` | 2 |
| `keyboardNavigationRequired` | true |
| `reducedMotionRespected` | true |

### Focus management

- Tab order follows layout regions — **Implemented**
- Escape dismisses modal/sheet — **Implemented**
- Enter activates focused control — **Implemented**
- Focus trap in modal/sheet — **Implemented**
- Focus ring token: `border.focus` — **Implemented**

### Live Frame accessibility

- `ariaRole: "img"` — **Implemented**
- `requiresLabel: true` — **Implemented**

Package MUST export accessibility constants alongside tokens — **Recommended**.

---

## 22. Naming Conventions

**Classification:** **Implemented**

| Category | Pattern | Example |
|----------|---------|---------|
| Semantic color path | `{group}.{key}` | `accent.primary` |
| Spacing | `space-{px}` | `space-16` |
| Radius | camelCase word | `extraLarge` |
| Elevation | lowercase level | `medium` |
| Shadow | `shadow-{level}` | `shadow-medium` |
| Motion duration | lowercase word | `extraSlow` |
| Typography style | lowercase word | `heading` |
| Icon size | xs–xl | `md` |
| Theme id | `{mode}-mode` | `need-mode` |
| Design system version | `an-act-design-system-v{ n }` | `an-act-design-system-v1` |
| Core UI component | `core-ui-{name}` | `core-ui-button` |
| Package (target) | `@an-act/tokens` | — |

Rules:

- Dot notation for semantic colors only
- No hex in token **names**
- No platform-specific prefixes in foundation tokens
- Component specs use kebab-case ids in X1, `core-ui-*` in X2

---

## 23. Versioning Strategy

**Classification:** **Implemented** (design system); package semver **Recommended**

| Artifact | Current version |
|----------|-----------------|
| Design system | `an-act-design-system-v1` |
| Core UI schema | `an-act-core-ui-v1` |
| Navigation framework | `an-act-navigation-framework-v1` |
| Target NPM package | `@an-act/tokens@1.0.0` — **Concept only** |

### Semver rules (**Recommended**)

| Change | Bump |
|--------|------|
| Add optional token | MINOR |
| Change resolved hex for existing path | MAJOR |
| Rename/remove token path | MAJOR |
| Add new mode theme | MAJOR |
| Add trust/live-frame extension keys | MINOR |

Publish `tokens.json` with embedded `version` field matching design system constant.

---

## 24. Extension Rules

**Classification:** **Recommended**

1. New semantic color paths require updating `SEMANTIC_COLOR_TOKEN_PATHS` **and** both theme files
2. New spacing values require updating `SPACING_SCALE` (still 10-step) or adding named aliases
3. Component tokens MUST reference semantic paths only — validator enforces — **Implemented**
4. Domain-specific palettes (AI, dashboard) SHOULD compose from semantic tokens, not new hex groups
5. Illustration/logo assets add a new `assets` layer — do not embed in foundation
6. Trust color keys live in `extensions.trust` namespace — **Recommended**
7. Live Frame UI tiers MUST NOT add hex literals — map to semantic accent tokens — **Implemented** in CH3 X2

---

## 25. Backward Compatibility

**Classification:** **Recommended**

| Scenario | Policy |
|----------|--------|
| Runtime JSON references removed token | Server validator fails — **Implemented** |
| Client with old `@an-act/tokens` | Unknown paths throw in `resolveSemanticColor` — **Implemented** |
| Legacy `src/ui/` hardcoded colors | Out of scope — freeze legacy — **Documented** |
| CH2 living `FRAME_TIER_COLORS` hex | Deprecated for render — use §14.1 — **Documented** |
| Trust color key → ui_tier migration | Dual-emit during transition — per Live Frame Migration Plan |

Package SHOULD ship `CHANGELOG.md` and compatibility matrix per major version — **Recommended**.

---

## Appendix A — Component Token Summary

**Classification:** **Implemented** — `DESIGN_TOKENS.components`

| Group | Spec IDs |
|-------|----------|
| buttons | button-primary, button-secondary, button-ghost |
| inputs | input-text, input-search |
| cards | base, timeline, achievement, analytics |
| badges | badge-professional |
| progress | progress-terminal, progress-linear |
| navigation | bottom-nav, FAB, bar |
| liveFrame | live-frame (default) |
| avatar | avatar |
| chips | chip |
| timeline | timeline card ref |

---

## Appendix B — Validation Checklist

Run before publishing `@an-act/tokens`:

```bash
npm run verify:ch3-x1   # validateDesignSystem()
npm run build
```

Checks (**Implemented**): 32 semantic paths, 10 spacing steps, 7 typography styles, 4 motion durations, 5 elevation levels, 6 radius tokens, 2 themes, transition brand line, component semantic compliance.

---

## Final Recommendation

**Can this specification become the official Design Tokens package for all Render Layers?**

**Yes — the token definitions already exist in `DESIGN_TOKENS`.** The `@an-act/tokens` NPM package is **Concept only** until export artifacts (JSON, CSS variables, platform resolvers) are built per [Export Plan](./AN-ACT-Design-Tokens-Export-Plan.md).

All Render Layer work MUST consume semantic tokens via this package — never hardcode Need/Action hex values in client components.

---

*Design Tokens Specification v1.0 — documentation only; no source code modified.*

*Related: [Runtime JSON Contract](./AN-ACT-Runtime-JSON-Contract.md) · [CH3 Design System Registry](./AN-ACT-CH3-Design-System-Registry.md) · [Live Frame v1.0](./AN-ACT-Live-Frame-v1.0-Specification.md)*
