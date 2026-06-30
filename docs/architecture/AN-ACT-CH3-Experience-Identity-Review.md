# AN ACT — CH3 Runtime Experience & Identity Review

**Scope:** Read-only architecture and design review of the completed Chapter 3 (CH3) Runtime Experience chapter.  
**Purpose:** Extract everything that defines the visual identity, runtime experience, interaction model, navigation system, design tokens, prototype system, and user-facing architecture of AN ACT — from code and documentation only.  
**Constraint:** No source code was modified to produce this review.

**Status key used throughout:**

| Label | Meaning |
|-------|---------|
| **Implemented** | Exists as executable TypeScript with concrete values, validators, or REST JSON screen payloads |
| **Documented** | Described in `docs/design-system/` or `docs/runtime/` markdown |
| **Concept only** | Specified or implied; no rendered pixel UI consuming CH3 tokens (e.g. no React/CSS render layer) |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Complete CH3 Module Registry (X1 through FINAL)](#2-complete-ch3-module-registry-x1-through-final)
3. [Runtime Experience Philosophy](#3-runtime-experience-philosophy)
4. [User Journey Philosophy](#4-user-journey-philosophy)
5. [Navigation Framework](#5-navigation-framework)
6. [Design System](#6-design-system)
7. [Prototype Library](#7-prototype-library)
8. [Design Tokens](#8-design-tokens)
9. [Color System](#9-color-system)
10. [Typography](#10-typography)
11. [Iconography](#11-iconography)
12. [Buttons](#12-buttons)
13. [Cards](#13-cards)
14. [Forms](#14-forms)
15. [Inputs](#15-inputs)
16. [Dashboard System](#16-dashboard-system)
17. [Screen Layout System](#17-screen-layout-system)
18. [Motion / Animation](#18-motion--animation)
19. [Runtime Screen Architecture](#19-runtime-screen-architecture)
20. [Home Experience](#20-home-experience)
21. [Need / Offer Experience](#21-need--offer-experience)
22. [Live Frame Implementation](#22-live-frame-implementation)
23. [Trust Visualization](#23-trust-visualization)
24. [Marketplace Presentation](#24-marketplace-presentation)
25. [Component Library](#25-component-library)
26. [Reusable UI Patterns](#26-reusable-ui-patterns)
27. [UX Consistency Rules](#27-ux-consistency-rules)
28. [Branding Implementation](#28-branding-implementation)
29. [Implementation Inventory: design-system / navigation-framework / prototype-library](#29-implementation-inventory)
30. [Implemented vs Documented vs Concept](#30-implemented-vs-documented-vs-concept)
31. [Final Recommendations for Preserving AN ACT Identity](#31-final-recommendations-for-preserving-an-act-identity)

---

## 1. Executive Summary

Chapter 3 — **AN ACT Runtime Experience** — is the chapter where AN ACT's **visual operating system** and **runtime user journey** are defined and certified. It comprises **31 modules**:

- **CH3-X1 through CH3-X4:** Design foundation layers (tokens, core UI specs, navigation framework, visual prototype library)
- **CH3-X5 through CH3-X11:** Seven production runtime experiences (Need, Action, Contract, Chat, Timeline, Notification, Profile)
- **CH3-X12 through CH3-X30:** Nineteen orchestration, readiness, certification, and launch-authority layers
- **CH3-FINAL:** Runtime Completion & Certification — terminal hand-off to Chapter 4

CH3 delivers **specification-first, framework-independent** identity artifacts. Every screen, component, token, and transition is defined as **TypeScript specifications** and **JSON runtime screen views** returned by authenticated REST APIs. There is **no CH3-owned rendered UI layer** (no React components, no CSS bundle) that paints pixels from `DESIGN_TOKENS`. The `src/ui/` directory contains separate platform page builders that **do not import** the CH3 design system.

What CH3 **does** implement for identity:

- **Dual-mode visual language:** Need Mode (light/reflective) and Action Mode (dark/executive), with semantic token paths and concrete hex values in theme files
- **Official mode bridge:** Terminal typography, brand line `an act...`, five-stage transition ritual, 640ms duration, background interpolation
- **Eight-region screen anatomy** with Need, Action, Transition, and Modal layout patterns
- **22 core UI component specifications** plus 10 CH3-X1 component spec groups
- **18 visual prototype screens** and **9 visual flows** defining screen relationships before runtime wiring
- **Runtime screen builder pattern:** Each experience screen references a prototype ID, layout ID, design tokens, and `core-ui-*` component instances

What CH3 **does not** implement:

- Pixel rendering or a consumer UI framework
- A separate "Offer Experience" module (marketplace/opportunity browsing lives inside Need Experience)
- Unified Live Frame tier vocabulary across design-system, trust domain, and living-experience layers
- Logo asset files

---

## 2. Complete CH3 Module Registry (X1 through FINAL)

### Design Foundation (X1–X4)

| Code | Name | Path | Factory | Verify | Status |
|------|------|------|---------|--------|--------|
| **CH3-X1** | AN ACT Design System | `src/design-system/` | `createAnActDesignSystemModule()` | `npm run verify:ch3-x1` | **Implemented** |
| **CH3-X2** | Core UI Components | `src/design-system/core-ui/` | `createAnActCoreUiModule()` | `npm run verify:ch3-x2` | **Implemented** |
| **CH3-X3** | Navigation Framework | `src/navigation-framework/` | `createAnActNavigationFrameworkModule()` | `npm run verify:ch3-x3` | **Implemented** |
| **CH3-X4** | Visual Prototype Library | `src/prototype-library/` | `createAnActPrototypeLibraryModule()` | `npm run verify:ch3-x4` | **Implemented** |

Docs: `docs/design-system/CH3-X1-AN-ACT-Design-System.md` through `CH3-X4-Visual-Prototype-Library.md`.

### Runtime Experiences (X5–X11)

| Code | ID | Name | Path | Route prefix | API endpoints | Bootstrap dep key | Verify |
|------|-----|------|------|--------------|---------------|-------------------|--------|
| **CH3-X5** | `need` | Need Experience | `src/runtime-experience/need/` | `/need-experience` | 12 | `need` | `verify:ch3-x5` |
| **CH3-X6** | `action` | Action Experience | `src/runtime-experience/action/` | `/action-experience` | 16 | `action` | `verify:ch3-x6` |
| **CH3-X7** | `contract` | Contract Experience | `src/runtime-experience/contract/` | `/contract-experience` | 9 | `contract` | `verify:ch3-x7` |
| **CH3-X8** | `chat` | Chat Experience | `src/runtime-experience/chat/` | `/chat-experience` | 10 | `chat` | `verify:ch3-x8` |
| **CH3-X9** | `timeline` | Timeline Experience | `src/runtime-experience/timeline/` | `/timeline-experience` | 8 | `timeline` | `verify:ch3-x9` |
| **CH3-X10** | `notification` | Notification Experience | `src/runtime-experience/notification/` | `/notification-experience` | 8 | `notification` | `verify:ch3-x10` |
| **CH3-X11** | `profile` | Profile Experience | `src/runtime-experience/profile/` | `/profile-experience` | 10 | `profile` | `verify:ch3-x11` |

Source of truth for registry metadata: `src/runtime-experience/runtime-completion/domain/runtime-completion-report.ts` (`CH3_RUNTIME_MODULE_REGISTRY`).

### Runtime Orchestration & Certification (X12–X30)

| Code | ID | Name | Path | Route prefix | Upstream (typical) | Verify |
|------|-----|------|------|--------------|-------------------|--------|
| **CH3-X12** | `runtime-journey` | Runtime Journey | `src/runtime-experience/runtime-journey/` | `/runtime-journey` | X5–X11 experiences | `verify:ch3-x12` |
| **CH3-X13** | `runtime-state` | Runtime State Engine | `src/runtime-experience/runtime-state/` | `/runtime-state` | X12 journey | `verify:ch3-x13` |
| **CH3-X14** | `runtime-registry` | Runtime Experience Registry | `src/runtime-experience/runtime-registry/` | `/runtime-registry` | — | `verify:ch3-x14` |
| **CH3-X15** | `runtime-coordinator` | Runtime Coordinator | `src/runtime-experience/runtime-coordinator/` | `/runtime-coordinator` | X12, X13, X14 | `verify:ch3-x15` |
| **CH3-X16** | `runtime-health` | Runtime Health & Diagnostics | `src/runtime-experience/runtime-health/` | `/runtime-health` | X14 registry | `verify:ch3-x16` |
| **CH3-X17** | `runtime-demo` | Runtime Demo Mode | `src/runtime-experience/runtime-demo/` | `/runtime-demo` | X13–X16 | `verify:ch3-x17` |
| **CH3-X18** | `runtime-preview` | Runtime Preview Engine | `src/runtime-experience/runtime-preview/` | `/runtime-preview` | X5–X17 | `verify:ch3-x18` |
| **CH3-X19** | `runtime-launcher` | Runtime Launcher & MVP Readiness | `src/runtime-experience/runtime-launcher/` | `/runtime-launcher` | X5–X18 | `verify:ch3-x19` |
| **CH3-X20** | `runtime-release` | Runtime Release Candidate | `src/runtime-experience/runtime-release/` | `/runtime-release` | X5–X19 | `verify:ch3-x20` |
| **CH3-X21** | `runtime-operations` | Runtime Operations | `src/runtime-experience/runtime-operations/` | `/runtime-operations` | X5–X20 | `verify:ch3-x21` |
| **CH3-X22** | `runtime-executive` | Runtime Executive Dashboard | `src/runtime-experience/runtime-executive/` | `/runtime-executive` | X5–X21 | `verify:ch3-x22` |
| **CH3-X23** | `runtime-readiness` | Runtime Readiness Console | `src/runtime-experience/runtime-readiness/` | `/runtime-readiness` | X5–X22 | `verify:ch3-x23` |
| **CH3-X24** | `runtime-certification` | Runtime Certification Center | `src/runtime-experience/runtime-certification/` | `/runtime-certification` | X5–X23 | `verify:ch3-x24` |
| **CH3-X25** | `runtime-final-readiness` | Runtime Final Readiness Review | `src/runtime-experience/runtime-final-readiness/` | `/runtime-final-readiness` | X5–X24 | `verify:ch3-x25` |
| **CH3-X26** | `runtime-production-approval` | Production Approval Center | `src/runtime-experience/runtime-production-approval/` | `/runtime-production-approval` | X5–X25 | `verify:ch3-x26` |
| **CH3-X27** | `runtime-operations-center` | Operations Center | `src/runtime-experience/runtime-operations-center/` | `/runtime-operations-center` | X5–X26 | `verify:ch3-x27` |
| **CH3-X28** | `runtime-launch-control` | Launch Control Center | `src/runtime-experience/runtime-launch-control/` | `/runtime-launch-control` | X5–X27 | `verify:ch3-x28` |
| **CH3-X29** | `runtime-launch-readiness-authority` | Launch Readiness Authority | `src/runtime-experience/runtime-launch-readiness-authority/` | `/runtime-launch-readiness-authority` | X5–X28 | `verify:ch3-x29` |
| **CH3-X30** | `runtime-executive-launch-authority` | Executive Launch Authority | `src/runtime-experience/runtime-executive-launch-authority/` | `/runtime-executive-launch-authority` | X5–X29 | `verify:ch3-x30` |

**Documentation note:** `docs/runtime/CH3-X21-Runtime-Operations-Center.md` is titled "Operations Center" but the implemented module at X21 is **`runtime-operations`** (Runtime Operations). The Operations Center module is **CH3-X27** (`runtime-operations-center`). This is a filename/title mismatch in docs only.

Bootstrap chain: `src/bootstrap/runtime.ts` — linear factory wiring from X5 through X30, then FINAL.

### Terminal Module (FINAL)

| Code | ID | Name | Path | Route prefix | Verify |
|------|-----|------|------|--------------|--------|
| **CH3-FINAL** | `runtime-completion` | Runtime Completion & Certification | `src/runtime-experience/runtime-completion/` | `/runtime-completion` | `npm run verify:ch3-final` |

Factory: `createAnActRuntimeCompletionModule()`. Version: `an-act-runtime-completion-v1`. Delegates to X30 (Executive Launch Authority). Certifies 26 runtime modules (X5–X30). Hand-off target: **CH4**.

Certification outputs (from docs):

- `runtimeChapter3Completed` — all 26 modules validated, all checks passed
- `runtimeCertified` — chapter completed AND official executive launch approval from X30

---

## 3. Runtime Experience Philosophy

**Implemented** in module definitions and repeated across X5–X30:

- **Specification-only runtime:** Experiences return structured JSON screen views, not rendered HTML
- **Strict layering:** Domain → Application → Presentation → Infrastructure → Validation
- **No duplication:** Higher modules delegate to lower experiences (X12 journey never duplicates X5 screens)
- **Deterministic demo data:** In-memory repositories for Need/Action demo flows
- **Validator-gated compliance:** Each experience validates token, component, prototype, navigation, accessibility, and transition compliance
- **CH3-X1 through CH3-X4 consumption mandatory** for X5+ (documented in X5/X6 module docs)

**Documented** in `docs/runtime/` module docs:

- No Bubble integration in runtime layer
- No business logic duplication across orchestration modules
- Read-only aggregation for X16+ operational/certification layers

---

## 4. User Journey Philosophy

**Implemented** in `src/runtime-experience/runtime-journey/` (CH3-X12):

Official runtime flow:

```
Launch → Need Home → Search → Opportunity List → Request → an act... →
Action Home → Contract → Chat → Timeline → Notification → Profile →
Completion → Return Transition → Need Home
```

Preserved state types: navigation state, transition state, runtime session, handoff context, return context, lifecycle phase.

**Implemented** in Need Experience (X5) sub-flow:

```
App Launch → Need Home → Search → Opportunity List → Request → an act... → Transition → Action Mode
```

**Implemented** in Action Experience (X6) sub-flow:

```
Action Ready → Action Home → Contract Preview → Active Action → Progress →
Completion → Return Transition (an act...) → Need Mode
```

**Documented** prototype flows (X4): onboarding, search-to-action, request, request-to-contract, action, contract, contract-to-completion, completion, completion-to-rating.

There is **no separate user-journey module** outside X12 for end-user flows; X13–X30 add operational/certification journeys for platform operators, not consumer UX paths.

---

## 5. Navigation Framework

**Location:** `src/navigation-framework/`  
**Version:** `an-act-navigation-framework-v1`  
**Status:** **Implemented** (specifications + validators; no pixel renderer)

### Philosophy (`NAVIGATION_FRAMEWORK_PHILOSOPHY`)

- Every screen follows the official **8-region anatomy**
- Need Mode and Action Mode layouts are mandatory patterns
- Official transition screen bridges mode changes
- Navigation stack governs back, modal, sheet, and overlay behavior
- Consumes CH3-X1 tokens and CH3-X2 components only

### Eight Screen Regions (`SCREEN_REGIONS`)

| Region | Purpose | zIndex |
|--------|---------|--------|
| `safeArea` | Device safe area insets | 0 |
| `statusArea` | System status and mode indicator | 1 |
| `topNavigation` | Primary navigation (`core-ui-navigation-bar`) | 2 |
| `screenHeader` | Title, subtitle, metadata | 3 |
| `contentArea` | Primary scrollable content | 4 |
| `floatingActionArea` | FAB zone (`core-ui-floating-action-button`) | 5 |
| `bottomNavigation` | Tab bar (`core-ui-bottom-navigation`) | 6 |
| `transitionLayer` | Mode transition overlay | 7 |

### Layout Registry (`SCREEN_LAYOUT_REGISTRY`)

| Layout ID | Mode | Purpose |
|-----------|------|---------|
| `need-layout` | need | Reflective discovery layout |
| `action-layout` | action | Execution-focused layout |
| `transition-layout` | transition | Full-screen mode bridge |
| `modal-layout` | modal | Modal, sheet, dialog, overlay |

### Navigation Patterns

- Top navigation (`TOP_NAVIGATION_SPEC`) — back behavior resolution
- Bottom navigation (`BOTTOM_NAVIGATION_SPEC`) — Need Mode tabs: Home, Search, Timeline, Profile
- Side navigation (`SIDE_NAVIGATION_SPEC`) — expanded breakpoint only
- Navigation stack (`NAVIGATION_STACK_SPEC`) — push/pop, presentation modes
- Navigation state (`NAVIGATION_STATE_SPEC`) — phases, mode, transition flags
- Modal behaviors: modal, bottom sheet, dialog, overlay

### Breakpoints (`LAYOUT_BREAKPOINTS`)

| Breakpoint | minWidth | Side navigation |
|------------|----------|-----------------|
| compact | 0 | false |
| regular | 768 | false |
| expanded | 1024 | true (max content width 1200px) |

### Transition Engine

- Brand line from `OFFICIAL_TRANSITION_SCREEN.brandLine`
- Stage texts: Preparing… → Matching… → Building Contract… → Securing… → Action Ready.
- Duration: 640ms (`MOTION_DURATIONS.extraSlow`)
- Supports reverse (Action → Need)

### Accessibility (`NAVIGATION_ACCESSIBILITY_SPEC`)

- Minimum touch target: **44px**
- Keyboard navigation, screen reader landmarks, reduced motion support, focus management for overlays

---

## 6. Design System

**Location:** `src/design-system/`  
**Version:** `an-act-design-system-v1`  
**Status:** **Implemented** (token specs + validation; **Concept only** for pixel rendering)

### Philosophy (`DESIGN_SYSTEM_PHILOSOPHY`)

- Framework-independent token definitions
- Semantic colors only — no hardcoded UI colors in components
- Need Mode and Action Mode as dual operating contexts
- Deterministic transitions between modes
- Accessibility by default
- Future extensibility through token layers

### Structure

```
foundation/   colors, typography, spacing, radius, elevation, shadows, motion, transitions, icons
themes/       need-mode.ts, action-mode.ts
components/   buttons, inputs, cards, badges, progress, navigation, live-frame, avatar, chips, timeline
tokens/       design-tokens.ts (aggregated export)
documentation/ design-system.ts (validation, accessibility, philosophy)
core-ui/      CH3-X2 production component specifications
module.ts     createAnActDesignSystemModule(), createAnActCoreUiModule()
```

### Public API

- `validateDesignSystem()` — token and component completeness checks
- `getDesignTokens()` — returns `DESIGN_TOKENS` aggregate
- `getDesignSystemDocumentation()` — philosophy + validation snapshot

---

## 7. Prototype Library

**Location:** `src/prototype-library/`  
**Version:** from `PROTOTYPE_LIBRARY_VERSION` in `prototype-schema.ts`  
**Status:** **Implemented** (visual blueprints as TypeScript specs)

### Philosophy (`PROTOTYPE_LIBRARY_PHILOSOPHY`)

- Master visual blueprint before runtime implementation
- Consumes CH3-X1 tokens, CH3-X2 components, CH3-X3 navigation only
- Deterministic specifications — no business logic
- Complete visual flows define screen relationships
- Official transition screen bridges Need and Action modes

### Screen Registry (18 prototypes)

| ID | Name | Mode | Route |
|----|------|------|-------|
| `prototype-need-home` | Need Home | need | `/need/home` |
| `prototype-opportunity-list` | Opportunity List | need | `/need/opportunities` |
| `prototype-search` | Search | need | `/need/search` |
| `prototype-request` | Request | need | `/need/request/create` |
| `prototype-empty-state` | Empty State | need | — |
| `prototype-action-home` | Action Home | action | `/action/home` |
| `prototype-active-action` | Active Action | action | — |
| `prototype-contract` | Contract | action | — |
| `prototype-success` | Success | action | — |
| `prototype-completion` | Completion | action | — |
| `prototype-rating` | Rating | need | — |
| `prototype-chat` | Chat | shared | — |
| `prototype-timeline` | Timeline | shared | — |
| `prototype-analytics` | Analytics | shared | — |
| `prototype-profile` | Profile | shared | — |
| `prototype-notification` | Notification | shared | — |
| `prototype-transition` | Transition | transition | `/system/transition` |
| `prototype-loading` | Loading | transition | — |
| `prototype-error` | Error | shared | — |

### Flow Registry (9 flows)

`ONBOARDING_FLOW`, `SEARCH_TO_ACTION_FLOW`, `REQUEST_FLOW`, `REQUEST_TO_CONTRACT_FLOW`, `ACTION_FLOW`, `CONTRACT_FLOW`, `CONTRACT_TO_COMPLETION_FLOW`, `COMPLETION_FLOW`, `COMPLETION_TO_RATING_FLOW`

---

## 8. Design Tokens

**Aggregate export:** `DESIGN_TOKENS` in `src/design-system/tokens/design-tokens.ts`  
**Status:** **Implemented**

| Token group | Source | Contents |
|-------------|--------|----------|
| Colors | `foundation/colors.ts` + themes | Semantic groups, paths, need/action theme colors |
| Typography | `foundation/typography.ts` | 7 styles, font families |
| Spacing | `foundation/spacing.ts` | `space-4` through `space-64` |
| Radius | `foundation/radius.ts` | small, medium, large, extraLarge, pill, circle |
| Elevation | `foundation/elevation.ts` | none, low, medium, high, highest |
| Shadows | `foundation/shadows.ts` | Paired shadow tokens per elevation |
| Motion | `foundation/motion.ts` | fast/normal/slow/extraSlow + easing curves |
| Icons | `foundation/icons.ts` | 15 icon names, 5 sizes |
| Transitions | `foundation/transitions.ts` | Need↔Action transition specs |
| Components | `components/*.ts` | X1 component spec groups |

Semantic color groups (from `SEMANTIC_COLOR_GROUPS`): background, surface, text, accent, border, status, interactive, overlay, transition.

---

## 9. Color System

**Status:** **Implemented** (hex values in theme files; components reference semantic paths)

### Need Mode (`NEED_MODE_COLORS`)

| Token path | Value |
|------------|-------|
| background.primary | `#FFFFFF` |
| background.secondary | `#FAFAFA` |
| background.tertiary | `#F5F5F5` |
| background.inverse | `#000000` |
| surface.primary | `#FFFFFF` |
| surface.secondary | `#F3F4F6` |
| surface.elevated | `#FFFFFF` |
| surface.muted | `#E5E7EB` |
| text.primary | `#000000` |
| text.secondary | `#374151` |
| text.tertiary | `#6B7280` |
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
| overlay.scrim | `rgba(0, 0, 0, 0.4)` |
| overlay.backdrop | `rgba(255, 255, 255, 0.8)` |
| transition.start | `#FFFFFF` |
| transition.mid | `#6B7280` |
| transition.end | `#000000` |

### Action Mode (`ACTION_MODE_COLORS`)

| Token path | Value |
|------------|-------|
| background.primary | `#000000` |
| background.secondary | `#0A0A0A` |
| background.tertiary | `#111111` |
| background.inverse | `#FFFFFF` |
| surface.primary | `#111111` |
| surface.secondary | `#1A1A1A` |
| surface.elevated | `#1F1F1F` |
| surface.muted | `#262626` |
| text.primary | `#FFFFFF` |
| text.secondary | `#D1D5DB` |
| text.tertiary | `#9CA3AF` |
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
| overlay.scrim | `rgba(0, 0, 0, 0.72)` |
| overlay.backdrop | `rgba(0, 0, 0, 0.88)` |
| transition.start | `#000000` |
| transition.mid | `#6B7280` |
| transition.end | `#FFFFFF` |

---

## 10. Typography

**Status:** **Implemented**

### Font families

| Key | Stack |
|-----|-------|
| sans | `"Inter", "SF Pro Text", system-ui, -apple-system, sans-serif` |
| display | `"Inter", "SF Pro Display", system-ui, -apple-system, sans-serif` |
| terminal | `"SF Mono", "Menlo", "Consolas", monospace` |

### Styles (`TYPOGRAPHY_TOKENS`)

| Style | Size | Weight | Line height | Letter spacing | Notes |
|-------|------|--------|-------------|----------------|-------|
| display | 40 | 700 | 48 | -0.5 | Display family |
| heading | 28 | 600 | 36 | -0.25 | Display family |
| title | 20 | 600 | 28 | 0 | Sans |
| body | 16 | 400 | 24 | 0 | Sans |
| caption | 13 | 400 | 18 | 0.1 | Sans |
| label | 12 | 500 | 16 | 0.4 | Uppercase |
| terminal | 18 | 400 | 24 | 0.2 | Monospace — transition screens |

### Terminal brand usage (`TERMINAL_TYPOGRAPHY_USAGE`)

- Brand line: **`an act...`**
- Default status line: **`Preparing...`**
- Style: `terminal`

---

## 11. Iconography

**Status:** **Implemented** (name registry only — no SVG/font assets in CH3)

### Icon names (`ICON_NAMES`)

`home`, `search`, `profile`, `settings`, `timeline`, `achievement`, `analytics`, `live-frame`, `action`, `navigation`, `chevron`, `close`, `check`, `progress`, `badge`

### Sizes (`ICON_SIZES`)

xs: 12, sm: 16, md: 20, lg: 24, xl: 32 (px)

Default stroke width: **1.75**

**Concept only:** Actual icon glyphs/assets are not present in `src/design-system/`.

---

## 12. Buttons

**Status:** **Implemented** (X1 specs + X2 core-ui definition)

### CH3-X1 specs (`BUTTON_SPECS`)

| Spec ID | Name | minHeight | Notes |
|---------|------|-----------|-------|
| `button-primary` | Primary | 48px | accent fill, inverse text |
| `button-secondary` | Secondary | 48px | surface fill, accent border |
| `button-ghost` | Ghost | 44px | transparent, accent text |

### CH3-X2 component (`core-ui-button`)

Variants: **primary**, **secondary**, **ghost**, **danger**, **success**, **disabled**

Token references: `interactive.default/hover/pressed/disabled`, `border.focus`  
Spacing: paddingX `space-24`, paddingY `space-12`, minHeight 48  
Motion: `fast` (120ms)

---

## 13. Cards

**Status:** **Implemented**

### CH3-X1 card specs (`CARD_SPECS`)

- `BASE_CARD_SPEC` — standard card
- `TIMELINE_CARD_SPEC`, `ACHIEVEMENT_CARD_SPEC`, `ANALYTICS_CARD_SPEC` — specialized cards

### CH3-X2 card components

| Component ID | Purpose |
|--------------|---------|
| `core-ui-card` | Standard, Elevated variants |
| `core-ui-timeline-card` | Timeline entries |
| `core-ui-achievement-card` | Achievements |
| `core-ui-analytics-card` | Analytics metrics |
| `core-ui-contract-card` | Contract summary |
| `core-ui-recommendation-card` | Recommendations |

Opportunity list cards use `core-ui-card` variant `elevated` with nested Live Frame, rating, distance, availability, time, cost, and badge props (**Implemented** in `opportunity-list.ts`).

---

## 14. Forms

**Status:** **Implemented** (as input component specifications and request screen field composition — no standalone "Form" component)

Request screen (X5) form fields (**Implemented**):

- Location input
- Schedule input
- Notes input
- Estimated cost display (read-only)
- Continue button (`core-ui-button`)

Form behavior is composed from `core-ui-input` instances with validation visual states (`STANDARD_INPUT_STATES` in component schema). No `core-ui-form` wrapper exists.

---

## 15. Inputs

**Status:** **Implemented**

### CH3-X1 (`INPUT_SPECS`)

| Spec | minHeight | Radius | Elevation |
|------|-----------|--------|-----------|
| `input-text` | 48 | medium | none |
| `input-search` | 44 | pill | low |

### CH3-X2 (`core-ui-input`)

Types: **text**, **email**, **password**, **number**, **search**, **phone**, **multiline**

Also: `core-ui-search` — pill search field (separate component)

Spacing: paddingX `space-16`, paddingY `space-12`, minHeight 48  
Focus: `border.focus` token  
Validation states reference `status.error`, `status.success`

---

## 16. Dashboard System

CH3 defines **two dashboard categories**:

### A. Operator / certification dashboards (X16–X30, FINAL)

**Implemented** as REST JSON presentation layers — not pixel UI.

| Module | Dashboard role |
|--------|----------------|
| X16 Health | Diagnostics dashboard |
| X21 Operations | Operations home, dashboard, health, alerts, status board |
| X22 Executive | Executive command board, KPIs, insights |
| X23 Readiness | Readiness console |
| X24 Certification | Certification center |
| X25 Final Readiness | Final readiness review |
| X26 Production Approval | Approval center |
| X27 Operations Center | Unified operations center |
| X28 Launch Control | Launch control center |
| X29 Launch Readiness Authority | Authority dashboard |
| X30 Executive Launch Authority | Executive launch authority |
| FINAL Completion | Completion dashboard, certification, statistics, architecture, executive summary |

These aggregate lower modules read-only. Presentation files live under each module's `presentation/` directory.

### B. Platform home dashboard (`src/experience/`)

**Implemented** separately from CH3 runtime bootstrap (`src/bootstrap/experiences.ts`, not `runtime.ts`):

- `HomeExperienceService` — customer/provider home views
- Delegates to customer dashboard, provider dashboard, event inbox, trust score
- Routes: `/home`, `/home/customer`, `/home/provider` (via `src/api/routes/home.ts`)

This is a **pre-CH3 platform experience** that does **not** consume CH3 design tokens or runtime screen builders.

---

## 17. Screen Layout System

See [Section 5 — Navigation Framework](#5-navigation-framework).

Additional layout details (**Implemented**):

- Need layout tokens: `NEED_LAYOUT_TOKENS` — background, typography bindings
- Action layout tokens: `ACTION_LAYOUT_TOKENS`
- Transition layout: full-screen, hides bottom nav
- Modal layout: scrim, focus trap, escape dismiss (from overlay behaviors)
- Safe area: `DEFAULT_SAFE_AREA`, `SAFE_AREA_COMPLIANCE_RULES`
- Responsive: compact / regular / expanded column counts in prototypes (e.g. Need Home: 1/2/3 columns)

---

## 18. Motion / Animation

**Status:** **Implemented**

### Durations (`MOTION_DURATIONS`)

| Token | ms |
|-------|-----|
| fast | 120 |
| normal | 240 |
| slow | 400 |
| extraSlow | 640 |

### Easing (`MOTION_EASING`)

- standard: `cubic-bezier(0.4, 0, 0.2, 1)`
- decelerate: `cubic-bezier(0, 0, 0.2, 1)`
- accelerate: `cubic-bezier(0.4, 0, 1, 1)`
- emphasized: `cubic-bezier(0.2, 0, 0, 1)`

### Official transition

- Duration: **640ms** (`extraSlow`)
- Forward easing: **emphasized**
- Reverse easing: **decelerate**
- Background interpolation: `transition.start` → `transition.mid` → `transition.end`
- Progress bar: 4px height, pill radius, track `surface.muted`, fill `accent.primary` (forward) / `accent.highlight` (reverse)

### Reduced motion (`ACCESSIBILITY_SPEC.motionReduction`)

- Disable animations: true
- Preserve opacity transitions: true
- Fallback duration: 0ms

---

## 19. Runtime Screen Architecture

**Status:** **Implemented** in X5+ presentation layers

### Screen view shape (`NeedRuntimeScreenView` pattern)

Each runtime screen returns:

- `screenId`, `prototypeId`, `route`, `mode`, `layoutId`
- `designTokens[]`, `typography`, `spacing`
- `regions[]` — from navigation layout binding
- `sections[]` — labeled content blocks with `RuntimeComponentInstance[]`
- `navigation` — pattern, back, bottom nav visibility, stack depth
- `accessibility` — touch target, keyboard, screen reader, reduced motion
- `generatedAt`

### Screen builder (`buildRuntimeScreenView`)

1. Resolves layout binding from domain
2. Loads prototype from `PROTOTYPE_REGISTRY`
3. Builds navigation view and accessibility spec
4. Assembles JSON payload referencing `core-ui-*` component IDs

### Component instance shape

```typescript
{ id, componentId, variant?, props, accessibility: { label, role, tabIndex, describedBy } }
```

**Concept only:** No client renderer maps these instances to DOM.

---

## 20. Home Experience

CH3 defines **three distinct "home" concepts**:

| Home type | Location | Bootstrap | Consumes CH3? | Status |
|-----------|----------|-----------|---------------|--------|
| **Need Home** | `runtime-experience/need/presentation/need-home.ts` | `runtime.ts` | Yes — X1–X4 | **Implemented** |
| **Action Home** | `runtime-experience/action/presentation/action-home.ts` | `runtime.ts` | Yes — X1–X4 | **Implemented** |
| **Platform Home** | `src/experience/` (`HomeExperienceService`) | `experiences.ts` | No | **Implemented** (parallel) |

### Need Home (`/need/home`) — CH3 canonical landing

Sections (**Documented** in X5, **Implemented** in presentation):

- Welcome section
- Search entry (`core-ui-search`)
- Quick categories (`core-ui-chip`)
- Recommended actions (`core-ui-card`)
- Recent activity
- Suggested opportunities
- Bottom navigation (`core-ui-bottom-navigation`)

Prototype: `prototype-need-home`, layout: `need-layout`

---

## 21. Need / Offer Experience

### Need Experience (CH3-X5)

**Status:** **Implemented**

Screens: need-home, search, opportunity-list, request, empty-state, transition

Routes:

| Screen | Route |
|--------|-------|
| need-home | `/need/home` |
| search | `/need/search` |
| opportunity-list | `/need/opportunities` |
| request | `/need/request/create` |
| empty-state | `/need/empty` |
| transition | `/system/transition` |

API base: `/need-experience` (12 endpoints)

### "Offer" Experience

**No separate CH3 module named Offer exists.** Marketplace/provider-offer presentation is embedded in Need Experience as **Opportunity List** — matched professionals/services with Live Frame, rating, distance, availability, estimated time/cost (SAR), and professional badges.

The Action side represents the provider/professional execution journey (X6), not a distinct "Offer" UX module.

---

## 22. Live Frame Implementation

Three parallel tier systems exist — **not unified**:

### A. Design System / Core UI (CH3-X1/X2)

**Implemented** in `src/design-system/core-ui/components/live-frame.ts`

Tiers: **bronze**, **silver**, **gold**, **platinum**, **diamond**

Accent token mapping:

| Tier | Accent token |
|------|--------------|
| bronze | status.warning |
| silver | border.subtle |
| gold | status.warning |
| platinum | accent.highlight |
| diamond | accent.primary |

Component ID: `core-ui-live-frame`. Ring: strokeWidth 2, radius circle, glow `accent.highlight`.

Need demo data uses tiers: bronze | silver | gold | platinum (no diamond in `NeedOpportunity` type).

### B. Trust domain (`src/trust/domain/live-frame.ts`)

**Implemented** — separate from CH3 design system

Tiers: **PLATINUM_ELITE**, **EMERALD_PRO**, **TRUSTED**, **STANDARD**, **WATCHLIST**

Colors: platinum_gold, emerald, blue, gray, red

Score thresholds: ≥95, ≥85, ≥70, ≥50, <50

Used by trust scoring and `src/ui/pages/` trust displays — **does not import CH3 tokens**.

### C. X1 component spec (`src/design-system/components/live-frame.ts`)

Single default spec (`live-frame`) — ring-based elevated surface indicator.

---

## 23. Trust Visualization

| Layer | What exists | CH3 integration | Status |
|-------|-------------|-----------------|--------|
| Professional badges | `core-ui-badge` variants: verified, licensed, certified, government, elite | Used on opportunity cards | **Implemented** |
| Live Frame (UI) | `core-ui-live-frame` tier ring | Opportunity list cards | **Implemented** |
| Trust scoring | `src/trust/` Live Frame classification | Parallel system | **Implemented** (outside CH3) |
| Trust UI pages | `src/ui/pages/trust-center.ts`, `provider-trust-report.ts`, etc. | No CH3 token import | **Implemented** (legacy parallel) |
| Runtime Profile X11 | Profile experience may surface trust summaries | Via runtime JSON | **Implemented** |

Trust visualization in the **CH3 runtime path** is expressed through badge + Live Frame component instances in JSON screen payloads, not through rendered trust dashboards.

---

## 24. Marketplace Presentation

**Implemented** in Need Experience opportunity list:

Each opportunity card includes:

- Title, category
- Live Frame tier (`core-ui-live-frame`)
- Rating (numeric)
- Distance (km)
- Availability string
- Estimated minutes
- Estimated cost (SAR — `estimatedCostSar`)
- Professional badges (`core-ui-badge`, variant professional)

Demo data: `src/runtime-experience/need/infrastructure/need-repository.ts` (`DEFAULT_OPPORTUNITIES`)

Prototype: `prototype-opportunity-list`  
Empty state: routes back to search with guided copy

**Parallel legacy UI:** `src/ui/pages/marketplace-search.ts`, `marketplace-results.ts`, `provider-card.ts` — separate from CH3 runtime, no design-system imports.

---

## 25. Component Library

### CH3-X1 component spec groups (10)

buttons, inputs, cards, badges, progress, navigation, live-frame, avatar, chips, timeline

### CH3-X2 core UI registry (22 components)

| ID | Category |
|----|----------|
| core-ui-button | input |
| core-ui-input | input |
| core-ui-search | input |
| core-ui-card | display |
| core-ui-timeline-card | display |
| core-ui-achievement-card | display |
| core-ui-analytics-card | display |
| core-ui-contract-card | display |
| core-ui-recommendation-card | display |
| core-ui-live-frame | identity |
| core-ui-badge | identity |
| core-ui-chip | input |
| core-ui-avatar | identity |
| core-ui-progress | feedback |
| core-ui-navigation-bar | navigation |
| core-ui-side-navigation | navigation |
| core-ui-bottom-navigation | navigation |
| core-ui-floating-action-button | navigation |
| core-ui-modal | overlay |
| core-ui-dialog | overlay |
| core-ui-sheet | overlay |
| core-ui-toast | feedback |
| core-ui-loading | feedback |

Each defines: variants, visual states, interaction states, accessibility, design tokens, spacing, typography, radius, elevation, motion, responsive behavior.

Validator: `validateAllCoreUiComponents()` in `core-ui/validation/component-validator.ts`

---

## 26. Reusable UI Patterns

**Implemented** patterns documented across X1–X4 and used in X5+:

| Pattern | Components / layout | Used in |
|---------|---------------------|---------|
| Tab + stack navigation | bottom-nav + navigation stack | Need screens |
| Pill search entry | core-ui-search | Need Home, Search |
| Elevated opportunity card | card + live-frame + badge | Opportunity List |
| Official transition | core-ui-loading + transition-layout | Mode bridge |
| Terminal progress | core-ui-progress variant terminal | Transition |
| Empty state | prototype-empty-state + dedicated builder | Search/no results |
| Modal / sheet / dialog | overlay components + modal-layout | Framework-ready |
| FAB placement | floatingActionArea region | Action layout |
| Professional credential row | badge variants | Cards, profile |
| Category chips | core-ui-chip | Need Home |

---

## 27. UX Consistency Rules

**Implemented** in validators and accessibility specs:

| Rule | Source | Value |
|------|--------|-------|
| Minimum touch target | ACCESSIBILITY_RULES | 44px |
| Normal text contrast | ACCESSIBILITY_RULES | 4.5:1 |
| Large text contrast | ACCESSIBILITY_RULES | 3:1 |
| Focus ring | ACCESSIBILITY_SPEC | 2px, offset 2px, `border.focus` |
| Semantic colors only | DESIGN_SYSTEM_PHILOSOPHY | No raw hex in components |
| Mode-appropriate layout | NAVIGATION_FRAMEWORK_PHILOSOPHY | need-layout / action-layout mandatory |
| Transition ritual | OFFICIAL_TRANSITION_SCREEN | Fixed brand line + 5 stages + 640ms |
| Reduced motion | motionReduction spec | Disable animations, keep opacity |
| Keyboard | ACCESSIBILITY_SPEC | Logical tab order, Escape dismisses overlays, Enter activates primary |
| Bottom nav hidden during transition | Need navigation rules | Documented X5 |
| Prototype compliance | Experience validators | Runtime screens must map to registered prototypes |

---

## 28. Branding Implementation

**Implemented:**

| Element | Value | Location |
|---------|-------|----------|
| Brand line | `an act...` | TERMINAL_TYPOGRAPHY_USAGE, OFFICIAL_TRANSITION_SCREEN |
| Product name casing | AN ACT (docs), `an act...` (transition) | Throughout |
| Dual modes | Need / Action | Themes, layouts, prototypes |
| Transition stages | Preparing… / Matching… / Building Contract… / Securing… / Action Ready. | TRANSITION_STAGE_TEXTS |
| Terminal typography | SF Mono stack | typography.ts |
| Version strings | `an-act-design-system-v1`, `an-act-navigation-framework-v1`, etc. | Module exports |

**Concept only / absent:**

- Logo files or mark SVG
- Marketing color palette beyond Need/Action themes
- Rendered brand lockups in UI

---

## 29. Implementation Inventory

### `src/design-system/`

| Area | Files | Role |
|------|-------|------|
| foundation/ | colors, typography, spacing, radius, elevation, shadows, motion, transitions, icons | Token primitives |
| themes/ | need-mode.ts, action-mode.ts | Mode color themes with hex |
| components/ | 10 spec files | X1 component dimensions/colors |
| tokens/ | design-tokens.ts | Aggregated DESIGN_TOKENS |
| documentation/ | design-system.ts | Philosophy, validation, accessibility |
| core-ui/ | 22 components, registry, validator, schema | X2 production specs |
| module.ts | Public API | createAnActDesignSystemModule, createAnActCoreUiModule |

### `src/navigation-framework/`

| Area | Files | Role |
|------|-------|------|
| foundation/ | screen-schema, layout, screen-context, safe-area | 8-region anatomy, breakpoints |
| layouts/ | need, action, transition, modal | Mode layouts |
| navigation/ | top, bottom, side, stack, state | Navigation patterns |
| transitions/ | engine, progress, background | Mode bridge mechanics |
| registry/ | screen-registry.ts | Layout and pattern catalogs |
| validation/ | navigation-validator.ts | Compliance checks |
| module.ts | createAnActNavigationFrameworkModule | Public API |

### `src/prototype-library/`

| Area | Files | Role |
|------|-------|------|
| foundation/ | prototype-schema, prototype-context | Spec builders |
| screens/ | 14 screen files (18 prototypes) | Visual blueprints |
| flows/ | 5 flow files (9 flows) | Journey relationships |
| registry/ | prototype-registry.ts | PROTOTYPE_REGISTRY, FLOW_REGISTRY |
| validation/ | prototype-validator.ts | Library compliance |
| module.ts | createAnActPrototypeLibraryModule | Public API |

---

## 30. Implemented vs Documented vs Concept

| Capability | Implemented | Documented | Concept only |
|------------|:-----------:|:----------:|:------------:|
| Semantic color tokens + hex themes | ✓ | ✓ | |
| Typography scale + terminal brand | ✓ | ✓ | |
| Spacing/radius/elevation/shadow/motion | ✓ | ✓ | |
| X1 component specs | ✓ | ✓ | |
| X2 core UI registry (22) | ✓ | ✓ | |
| Navigation 8-region framework | ✓ | ✓ | |
| Prototype library (18 screens, 9 flows) | ✓ | ✓ | |
| Need/Action runtime JSON screens | ✓ | ✓ | |
| Contract/Chat/Timeline/Notification/Profile runtime | ✓ | ✓ | |
| Runtime journey orchestration (X12) | ✓ | ✓ | |
| Operational/certification layers (X16–X30) | ✓ | ✓ | |
| Runtime completion (FINAL) | ✓ | ✓ | |
| Verify scripts (x1–x30 + final) | ✓ | ✓ | |
| Pixel UI render layer from DESIGN_TOKENS | | | ✓ |
| Icon glyph assets | | | ✓ |
| Logo asset | | | ✓ |
| Unified Live Frame tier system | | | ✓ (3 parallel systems) |
| Separate Offer Experience module | | | ✓ (embedded in Need) |
| Platform home (`src/experience/`) using CH3 | | | ✓ (parallel, no CH3 import) |
| Legacy `src/ui/` pages using CH3 | | | ✓ (no imports found) |

---

## 31. Final Recommendations for Preserving AN ACT Identity

1. **Treat CH3-X1–X4 as the single source of visual truth.** Any future render layer (React Native, Web, Bubble) must consume `DESIGN_TOKENS`, `CORE_UI_COMPONENT_REGISTRY`, and `PROTOTYPE_REGISTRY` — not ad-hoc styles.

2. **Preserve the dual-mode + transition ritual.** Need (light) → `an act...` (terminal, 640ms, 5 stages) → Action (dark) is the defining brand motion. Do not shortcut or replace with generic spinners.

3. **Consolidate Live Frame tiers.** Map trust domain tiers (PLATINUM_ELITE…WATCHLIST) to design-system tiers (bronze…diamond) in one authoritative registry before any pixel implementation.

4. **Keep runtime screen builder contract stable.** `screenId` → `prototypeId` → `layoutId` → `core-ui-*` instances is the integration boundary. Client apps should implement against this JSON schema.

5. **Do not fork home experiences.** Clarify that Need Home (CH3) is the canonical consumer landing; platform `HomeExperienceService` should either migrate to CH3 screen builders or be explicitly labeled legacy.

6. **Resolve documentation drift.** Rename or retitle `CH3-X21-Runtime-Operations-Center.md` to match `runtime-operations` (X21 vs X27 distinction).

7. **Add a render reference implementation** when ready — one thin adapter that maps `RuntimeComponentInstance` + tokens to CSS/style objects, proving the spec chain end-to-end.

8. **Protect validator gates.** Every new screen must pass prototype, navigation, token, and accessibility validators before merge — this is how CH3 preserves consistency without pixels.

9. **Certify before extending.** Use CH3-FINAL (`runtimeCertified`) as the gate before CH4+ modules introduce new visual patterns.

10. **Archive or migrate `src/ui/`.** Either wire legacy pages to CH3 tokens or isolate them as pre-CH3 artifacts to prevent identity drift.

---

*Review generated from repository state. No source code was modified.*
