# AN ACT Design System Candidates

> Catalog of every design language element discovered during the CH4 Action Intelligence architecture review.  
> Extracted from codebase and documentation only — nothing invented.

**Status key:**

| Label | Meaning |
|-------|---------|
| **Implemented** | Executable TypeScript with concrete values or behavior |
| **Documented** | Described in markdown; may lack pixel rendering |
| **Concept only (not implemented)** | Specified or implied; not fully wired |

**Primary sources:**

- `src/design-system/` (CH3-X1, CH3-X2)
- `src/navigation-framework/` (CH3-X3)
- `src/prototype-library/` (CH3-X4)
- `src/action-intelligence-experience/` through `action-intelligence-final-closure/` (CH4 C18–C22)
- `src/trust/`, `src/living-experience/live-frame/`
- `docs/design-system/`, `docs/action-intelligence/`

---

## Colors

### Semantic Token Groups — **Implemented**

`src/design-system/foundation/colors.ts`

Groups: `background`, `surface`, `text`, `accent`, `border`, `status`, `interactive`, `overlay`, `transition` (32 token paths).

Rule: components reference token paths — **no raw hex in component specs**.

### Need Mode Theme — **Implemented**

`src/design-system/themes/need-mode.ts`

| Token | Hex |
|-------|-----|
| background.primary | `#FFFFFF` |
| background.secondary | `#FAFAFA` |
| background.tertiary | `#F5F5F5` |
| background.inverse | `#000000` |
| surface.primary | `#FFFFFF` |
| surface.secondary | `#F3F4F6` |
| surface.muted | `#FFFFFF` |
| surface.border | `#E5E7EB` |
| text.primary | `#000000` |
| text.secondary | `#374151` |
| text.muted | `#6B7280` |
| text.inverse | `#FFFFFF` |
| text.disabled | `#9CA3AF` |
| accent.primary | `#2563EB` |
| accent.secondary | `#3B82F6` |
| accent.highlight | `#1D4ED8` |
| border.default | `#E5E7EB` |
| border.subtle | `#F3F4F6` |
| border.focus | `#2563EB` |
| status.success | `#059669` |
| status.warning | `#D97706` |
| status.error | `#DC2626` |
| status.info | `#2563EB` |
| interactive.default | `#2563EB` |
| interactive.hover | `#1D4ED8` |
| interactive.pressed | `#1E40AF` |
| interactive.disabled | `#93C5FD` |
| overlay.scrim | `rgba(0,0,0,0.4)` |
| overlay.backdrop | `rgba(255,255,255,0.8)` |
| transition.start | `#FFFFFF` |
| transition.mid | `#6B7280` |
| transition.end | `#000000` |

### Action Mode Theme — **Implemented**

`src/design-system/themes/action-mode.ts`

| Token | Hex |
|-------|-----|
| background.primary | `#000000` |
| background.secondary | `#0A0A0A` |
| background.tertiary | `#111111` |
| background.inverse | `#FFFFFF` |
| surface.primary | `#111111` |
| surface.secondary | `#1A1A1A` |
| surface.muted | `#1F1F1F` |
| surface.border | `#262626` |
| text.primary | `#FFFFFF` |
| text.secondary | `#D1D5DB` |
| text.muted | `#9CA3AF` |
| text.inverse | `#000000` |
| text.disabled | `#6B7280` |
| accent.primary | `#3B82F6` |
| accent.secondary | `#60A5FA` |
| accent.highlight | `#2563EB` |
| border.default | `#262626` |
| border.subtle | `#1A1A1A` |
| border.focus | `#3B82F6` |
| status.success | `#34D399` |
| status.warning | `#FBBF24` |
| status.error | `#F87171` |
| status.info | `#60A5FA` |
| interactive.default | `#3B82F6` |
| interactive.hover | `#60A5FA` |
| interactive.pressed | `#2563EB` |
| interactive.disabled | `#1E3A5F` |
| overlay.scrim | `rgba(0,0,0,0.72)` |
| overlay.backdrop | `rgba(0,0,0,0.88)` |
| transition.start | `#000000` |
| transition.mid | `#6B7280` |
| transition.end | `#FFFFFF` |

### Shadow Colors — **Implemented**

`src/design-system/foundation/shadows.ts`

- Need: `rgba(0,0,0,0.06)` → `0.16` by elevation level
- Action: blur ×1.4, `rgba(0,0,0,0.32)`

### Live Frame Tier Colors (Design System) — **Implemented**

`src/design-system/core-ui/components/live-frame.ts`

| Tier | Semantic Mapping |
|------|------------------|
| bronze | `status.warning` |
| silver | `border.subtle` |
| gold | `accent.highlight` |
| platinum | `accent.primary` |
| diamond | `accent.primary` |

### Live Frame Tier Colors (Trust Domain) — **Implemented**

`src/trust/domain/live-frame.ts`

| Tier | Color Name |
|------|------------|
| PLATINUM_ELITE | platinum_gold |
| EMERALD_PRO | emerald |
| TRUSTED | blue |
| STANDARD | gray |
| WATCHLIST | red |

### Live Frame Tier Colors (Living Experience) — **Implemented**

`src/living-experience/live-frame/domain/live-frame-schema.ts`

| Tier | Hex |
|------|-----|
| WATCHLIST | `#9CA3AF` |
| STANDARD | `#60A5FA` |
| TRUSTED | `#34D399` |
| EMERALD_PRO | `#10B981` |
| PLATINUM_ELITE | `#A78BFA` |

**Note:** Three parallel Live Frame color systems — consolidation candidate.

### Platform Favicon (APP13, not AN ACT) — **Implemented**

`public/browser/favicon.svg` — `#1f4fd6` background, white `"13"`.

---

## Typography

### Font Families — **Implemented**

`src/design-system/foundation/typography.ts`

| Role | Stack |
|------|-------|
| sans | `"Inter", "SF Pro Text", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` |
| display | `"Inter", "SF Pro Display", system-ui, …` |
| terminal | `"SF Mono", "Menlo", "Consolas", "Liberation Mono", monospace` |

### Type Scale — **Implemented**

| Style | Size | Weight | Line Height | Letter Spacing |
|-------|------|--------|-------------|----------------|
| display | 40px | 700 | 48 | -0.5 |
| heading | 28px | 600 | 36 | -0.25 |
| title | 20px | 600 | 28 | — |
| body | 16px | 400 | 24 | — |
| caption | 13px | 400 | 18 | 0.1 |
| label | 12px | 500 | 16 | 0.4 (uppercase) |
| terminal | 18px | 400 | 24 | 0.2 |

### Brand Typography Usage — **Implemented**

`TERMINAL_TYPOGRAPHY_USAGE`:

- `transitionBrandLine`: `"an act..."`
- `transitionStatusLine`: `"Preparing..."`

### Documentation — **Documented**

`docs/design-system/CH3-X1-AN-ACT-Design-System.md` — lists Display through Terminal styles without numeric values.

---

## Icons

### Icon Size Tokens — **Implemented**

`src/design-system/foundation/icons.ts`

| Size | px |
|------|-----|
| xs | 12 |
| sm | 16 |
| md | 20 |
| lg | 24 |
| xl | 32 |

Default stroke: **1.75**

### Icon Names — **Implemented**

home, search, profile, settings, timeline, achievement, analytics, live-frame, action, navigation, chevron, close, check, progress, badge

### Bottom Navigation Default Icons — **Implemented**

`src/navigation-framework/navigation/bottom-navigation.ts`

home, search, timeline, profile (string references only)

### SVG/Font Assets — **Concept only (not implemented)**

No icon SVG or font files found in design system.

---

## Buttons

### CH3-X1 Base Specs — **Implemented**

`src/design-system/components/buttons.ts`

| Variant | minH | Padding | Background | Text | Border | Elevation |
|---------|------|---------|------------|------|--------|-----------|
| primary | 48 | 24×12 | interactive.default | text.inverse | — | low |
| secondary | 48 | 24×12 | surface.primary | text.primary | border.default | none |
| ghost | 44 | 16×8 | background.primary | accent.primary | border.subtle | none |

Typography: body. Radius: medium.

### CH3-X2 Extended Specs — **Implemented**

`src/design-system/core-ui/components/button.ts`

Additional variants: **danger** (`status.error`), **success** (`status.success`), **disabled** (`interactive.disabled` / `text.disabled`).

States: default, hover, pressed, focused, loading, disabled.

Motion: fast on background/border/shadow.

---

## Cards

### CH3-X1 Base Cards — **Implemented**

`src/design-system/components/cards.ts`

| Card | Pad | Radius | Elevation | Background |
|------|-----|--------|-----------|------------|
| base | 16 | large | medium | surface.primary |

Specialized: timeline, achievement, analytics (referenced).

### CH3-X2 Core UI Cards — **Implemented**

| Component | File | minH | Accent Token |
|-----------|------|------|--------------|
| card (standard/elevated) | `core-ui/components/card.ts` | — | hover elevation high |
| timeline-card | `timeline-card.ts` | 72 | accent.primary |
| achievement-card | `achievement-card.ts` | 88 | status.success |
| analytics-card | `analytics-card.ts` | 96 | accent.highlight |
| contract-card | `contract-card.ts` | 96 | accent.secondary |
| recommendation (in contract-card.ts) | — | 80 | accent.primary |

### CH4 Intelligence “Cards” — **Implemented** (JSON projections, not pixel cards)

C18–C22 expose structured view objects (dashboards, reports, summaries) via REST — semantic parallel to UI cards but not bound to `card.ts` specs.

---

## Terminal Style

### Transition Spec — **Implemented**

`src/design-system/foundation/transitions.ts`

| Property | Value |
|----------|-------|
| brandLine | `an act...` |
| statusLine | `Preparing...` |
| typographyStyle | terminal |
| durationMs | 640 |
| forward easing | emphasized |
| reverse easing | decelerate |
| progressBar.height | 4 |
| progressBar.radiusToken | pill |
| backgroundSteps | transition.start → mid → end |

### Stage Texts — **Implemented**

`src/design-system/core-ui/components/loading.ts`

1. Preparing...
2. Matching...
3. Building Contract...
4. Securing...
5. Action Ready.

### Official Transition Screen Component — **Implemented**

`core-ui/components/loading.ts` — id: `core-ui-loading`, category: feedback, aria role: status.

### Transition Layout — **Implemented**

`src/navigation-framework/layouts/transition-layout.ts` — uses OFFICIAL_TRANSITION_SCREEN, terminal typography for header/body.

### Validation Rules — **Implemented**

`validateDesignSystem()` requires terminal typography style, brand line `"an act..."`, status line `"Preparing..."`, ≥3 background steps.

---

## Dashboard Style

### CH4 Intelligence Dashboard (C19) — **Implemented** (API)

`src/intelligence-dashboard/`

Panels: overview, health, journey, confidence, readiness, trust/decision/recommendation/prediction/strategy/learning/optimization/evolution overviews, timeline (16 steps), executive-summary.

Philosophy: aggregate C18 journey — read-only, delegated.

### CH4 Executive Intelligence Center (C20) — **Implemented** (API)

`src/executive-intelligence-center/`

Views: platform-health, strategic-status, operational-status, intelligence, readiness, orchestration, reports.

### CH3 Analytics Prototype — **Implemented** (spec)

`src/prototype-library/screens/analytics.ts`

- Layout: need-layout
- Tokens: background.primary, text.primary, surface.secondary, accent.highlight
- Components: analytics-card, progress, bottom-nav
- Responsive: 1/2/3 columns

### CH3 Action Home Prototype — **Implemented** (spec)

`src/prototype-library/screens/action-home.ts`

- Layout: action-layout
- Components: FAB, contract-card
- Motion: fast

### MVP Dashboard Pages — **Concept only (not implemented)**

`src/ui/pages/platform-home.ts`, `provider-dashboard.ts` — data models without design tokens.

---

## Live Frame

### Design System Component — **Implemented**

`src/design-system/components/live-frame.ts`

minH 64, pad 16×12, radius large, ring stroke 2, glow accent.highlight.

### Core UI Tiers — **Implemented**

`src/design-system/core-ui/components/live-frame.ts` — bronze, silver, gold, platinum, diamond.

### Trust Classification — **Implemented**

`src/trust/domain/live-frame.ts`

Score thresholds: ≥95 PLATINUM_ELITE, ≥85 EMERALD_PRO, ≥70 TRUSTED, ≥50 STANDARD, else WATCHLIST.

Risk levels: minimal, low, moderate, elevated, high.

### Living Experience Sections — **Implemented**

`src/living-experience/live-frame/domain/live-frame-schema.ts`

Sections: current_live_frame, frame_meaning, trust_score, frame_history, progress, positive_drivers, negative_drivers, professional_growth, recommendations, timeline, achievements, verified_evidence, future_projection.

### Profile Prototype — **Implemented** (spec)

`src/prototype-library/screens/profile.ts` — core-ui-live-frame + avatar + badge.

### C18 Trust Experience Screen — **Implemented** (API)

`/action-intelligence-experience/trust`

### C19 Trust Overview — **Implemented** (API)

`/intelligence-dashboard/trust`

---

## Navigation

### Screen Regions (8) — **Implemented**

`src/navigation-framework/foundation/screen-schema.ts`

safeArea, statusArea, topNavigation, screenHeader, contentArea, floatingActionArea, bottomNavigation, transitionLayer.

### Layouts — **Implemented**

| Layout | File | Key Properties |
|--------|------|----------------|
| Need | `layouts/need-layout.ts` | bg background.primary, pad 16, gap 12, motion normal |
| Action | `layouts/action-layout.ts` | FAB required, pad 20×16, gap 16, motion fast |
| Transition | `layouts/transition-layout.ts` | terminal typography |
| Modal | `layouts/modal-layout.ts` | overlay.scrim, elevation highest, sheet snap half/full |

### Navigation Components — **Implemented**

| Component | minH / Size | Notes |
|-----------|-------------|-------|
| Top nav | 56 | typography title |
| Bottom nav | 64 | elevation high, max 5 items, hidden in transition/modal |
| Side nav | 240 width | expanded breakpoint |
| FAB | 56×56 circle | elevation highest |

### Breakpoints — **Implemented**

`foundation/layout.ts` — compact 0, regular 768, expanded 1024; max content width 1200.

### Safe Area — **Implemented**

`foundation/safe-area.ts` — top inset 44, bottom inset 34, padding space-16.

### Transition Engine — **Implemented**

`transitions/transition-engine.ts` — brandLine, duration 640ms, 5 stage texts.

### Background Transition — **Implemented**

`transitions/background-transition.ts` — forwards/reverse token arrays.

---

## Motion

### Durations — **Implemented**

`src/design-system/foundation/motion.ts`

| Name | ms |
|------|-----|
| fast | 120 |
| normal | 240 |
| slow | 400 |
| extraSlow | 640 |

### Easing — **Implemented**

| Name | Value |
|------|-------|
| standard | cubic-bezier(0.4, 0, 0.2, 1) |
| decelerate | cubic-bezier(0, 0, 0.2, 1) |
| accelerate | cubic-bezier(0.4, 0, 1, 1) |
| emphasized | cubic-bezier(0.2, 0, 0, 1) |

### Spacing Scale — **Implemented**

`src/design-system/foundation/spacing.ts` — 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 px.

### Radius Scale — **Implemented**

`src/design-system/foundation/radius.ts` — small 4, medium 8, large 12, extraLarge 16, pill 9999, circle 50%.

### Elevation — **Implemented**

`src/design-system/foundation/elevation.ts` — z-index 0, 1, 4, 8, 16.

### Reduced Motion — **Implemented**

`src/design-system/documentation/design-system.ts`

disableAnimations: true, preserveOpacityTransitions: true, fallbackDurationMs: 0.

---

## Branding

### Product Name — **Documented**

**AN ACT** — uppercase in module headlines, docs, certification reports.

### Brand Line — **Implemented**

**`an act...`** — lowercase with ellipsis; canonical transition brand moment.

### Design System Identity — **Implemented**

`DESIGN_SYSTEM_PHILOSOPHY`:

- name: "AN ACT Design System"
- version: from DESIGN_TOKENS (`an-act-design-system-v1`)

### Dual-Mode Taglines — **Implemented**

- Need: "Reflective planning — white surfaces, black typography, blue accents"
- Action: "Execution focus — black surfaces, white typography, blue highlights"

### Logo Asset — **Concept only (not implemented)**

No AN ACT logo SVG/PNG in repository.

### APP13 Favicon — **Implemented**

Platform favicon only — not AN ACT brand mark.

### CH4 Certification Brand Language — **Documented**

C21 certifies: platform, architecture, delegation, determinism, explainability — vocabulary for quality brand.

### CH4 Closure Handoff — **Implemented**

C22 `CHAPTER_NUMBER=4`, `NEXT_CHAPTER_NUMBER=5` — official chapter transition ritual.

---

## Interaction

### Accessibility — **Implemented**

`src/design-system/documentation/design-system.ts`

| Rule | Value |
|------|-------|
| minimumTouchTargetPx | 44 |
| minimumContrastRatioNormalText | 4.5 |
| minimumContrastRatioLargeText | 3 |
| focusRingWidthPx | 2 |
| focusRingOffsetPx | 2 |
| focus ring color | border.focus |

Keyboard: tab order logical, Escape dismisses overlays, Enter activates primary.

### Component Visual States — **Implemented**

`core-ui/foundation/component-schema.ts`

default, hover, pressed, focused, loading, disabled.

### Input States — **Implemented**

empty, typing, valid, invalid, disabled, readonly.

### Modal Behavior — **Implemented**

Focus trap, Escape dismiss, scrim tap disabled — `modal-layout.ts`.

### CH4 REST Interaction — **Implemented**

- All routes auth-required
- Query: scenario_id, canonical_action_id, urgency, distance_band, intent
- Standard envelope: schema_version, output_id, view, read_only
- validate endpoint for catalog or scenario coverage

### Overlay Scrim Opacity — **Implemented**

Need: 0.4, Action: 0.72.

---

## Screen Composition

### Prototype Library Screens (19) — **Implemented** (specs)

`src/prototype-library/` per `docs/design-system/CH3-X4-Visual-Prototype-Library.md`

**Need side:** need-home, search, request, opportunity list (via flows), empty-state

**Action side:** action-home, contract, active, completion, success, rating (via flows)

**Shared:** chat, timeline, analytics, profile, notification

**System:** loading, error, transition

### Visual Flows (5) — **Implemented** (specs)

`src/prototype-library/flows/`

1. First User Journey
2. Search to Action (includes official transition)
3. Request to Contract
4. Action Flow
5. Contract to Completion / Completion to Rating

### CH4 Experience Screens (C18) — **Implemented** (API)

21 routes: intent, planning, pricing, contract, execution, outcome, trust, decision, recommendation, insights, predictions, strategy, learning, optimization, evolution, orchestration, journey, explanation, summary, validate.

16 journey steps in output.

### CH4 Dashboard Screens (C19) — **Implemented** (API)

18 routes including per-layer overviews and 16-step timeline.

### CH4 Executive Screens (C20) — **Implemented** (API)

12 routes: overview, platform-health, strategic/operational status, intelligence, readiness, orchestration, reports, etc.

### CH4 Certification Screens (C21) — **Implemented** (API)

14 routes across certification domains.

### CH4 Closure Screens (C22) — **Implemented** (API)

13 routes: chapter-status, architecture, ecosystem, certification, implementation, dependency, readiness, executive-closure, handoff, etc.

### MVP UI Pages — **Concept only (not implemented)**

`src/ui/pages/` — marketplace, trust, platform pages without token binding.

### Rendered Pixel Layer — **Concept only (not implemented)**

No CSS/React components consuming DESIGN_TOKENS found.

---

## Cross-Cutting: CH4 Intelligence Model (Identity Logic)

### C1 Principle — **Documented**

Goal → Actions → Resources → Skills → Time → Risk → Price → Contract → Execution → Trust

### Five Canonical Scenarios — **Implemented**

moving_a_room, cleaning_an_apartment, delivering_a_document, fixing_small_home_issue, preparing_professional_service_request

### Confidence Levels — **Implemented**

low, medium, high (recurring across C18–C22 and CH5)

### Architectural Guarantees — **Implemented**

Read-only, delegates-only, deterministic, explainable, import-lint clean.

---

## Consolidation Candidates (Gaps to Resolve)

| Gap | Current State | Recommendation |
|-----|---------------|----------------|
| Live Frame tiers | 3 parallel systems | Unify to one canonical tier + hex palette |
| Design tokens → pixels | Specs only | Build render layer when UI implementation begins |
| AN ACT logo | Typographic only | Design mark or formally adopt typographic-only brand |
| CH4 REST views → components | Unbound | Map C18–C19 panels to analytics-card, timeline-card, etc. |
| Trust center UI | Data only | Wire to Need/Action layouts and trust colors |

---

*Catalog extracted from completed CH4 review. No source code was modified.*  
*Full review: [AN-ACT-CH4-Design-Identity-Review.md](./AN-ACT-CH4-Design-Identity-Review.md)*
