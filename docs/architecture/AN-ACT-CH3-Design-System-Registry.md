# AN ACT — CH3 Design System Registry

**Scope:** Catalog of every CH3 design-system artifact — colors, typography, components, navigation, runtime screens, tokens, prototypes, Live Frame, branding, and UI architecture.  
**Source:** Extracted from `src/design-system/`, `src/navigation-framework/`, `src/prototype-library/`, and CH3 runtime experience modules only.  
**Constraint:** Nothing invented; gaps labeled explicitly.

**Status key:**

| Label | Meaning |
|-------|---------|
| **Implemented** | TypeScript spec with concrete values or registry entry |
| **Documented** | Described in CH3 markdown docs |
| **Missing** | Expected by philosophy but not present in codebase |
| **Consolidation candidate** | Multiple parallel definitions that should merge |

---

## 1. Registry Overview

| Layer | Module | Version constant | Path |
|-------|--------|------------------|------|
| Design tokens & themes | CH3-X1 | `an-act-design-system-v1` | `src/design-system/` |
| Core UI components | CH3-X2 | `CORE_UI_SCHEMA_VERSION` in core-ui | `src/design-system/core-ui/` |
| Navigation framework | CH3-X3 | `an-act-navigation-framework-v1` | `src/navigation-framework/` |
| Visual prototypes | CH3-X4 | `PROTOTYPE_LIBRARY_VERSION` | `src/prototype-library/` |

Aggregate token export: `DESIGN_TOKENS` → `src/design-system/tokens/design-tokens.ts`

---

## 2. Colors

### 2.1 Semantic groups

**Implemented** — `SEMANTIC_COLOR_GROUPS` in `src/design-system/foundation/colors.ts`:

`background`, `surface`, `text`, `accent`, `border`, `status`, `interactive`, `overlay`, `transition`

### 2.2 Semantic token paths

**Implemented** — `SEMANTIC_COLOR_TOKEN_PATHS` (dot-notation paths used by all components)

Examples: `background.primary`, `surface.elevated`, `text.primary`, `accent.primary`, `border.focus`, `status.error`, `interactive.hover`, `overlay.scrim`, `transition.mid`

### 2.3 Need Mode theme

**Implemented** — `src/design-system/themes/need-mode.ts`

| Group | Keys | Primary values |
|-------|------|----------------|
| background | primary, secondary, tertiary, inverse | `#FFFFFF`, `#FAFAFA`, `#F5F5F5`, `#000000` |
| surface | primary, secondary, elevated, muted | `#FFFFFF`, `#F3F4F6`, `#FFFFFF`, `#E5E7EB` |
| text | primary, secondary, tertiary, inverse, disabled | `#000000`, `#374151`, `#6B7280`, `#FFFFFF`, `#9CA3AF` |
| accent | primary, secondary, highlight | `#2563EB`, `#3B82F6`, `#1D4ED8` |
| border | default, subtle, focus | `#E5E7EB`, `#F3F4F6`, `#2563EB` |
| status | success, warning, error, info | `#059669`, `#D97706`, `#DC2626`, `#2563EB` |
| interactive | default, hover, pressed, disabled | `#2563EB`, `#1D4ED8`, `#1E40AF`, `#93C5FD` |
| overlay | scrim, backdrop | `rgba(0,0,0,0.4)`, `rgba(255,255,255,0.8)` |
| transition | start, mid, end | `#FFFFFF`, `#6B7280`, `#000000` |

### 2.4 Action Mode theme

**Implemented** — `src/design-system/themes/action-mode.ts`

| Group | Keys | Primary values |
|-------|------|----------------|
| background | primary, secondary, tertiary, inverse | `#000000`, `#0A0A0A`, `#111111`, `#FFFFFF` |
| surface | primary, secondary, elevated, muted | `#111111`, `#1A1A1A`, `#1F1F1F`, `#262626` |
| text | primary, secondary, tertiary, inverse, disabled | `#FFFFFF`, `#D1D5DB`, `#9CA3AF`, `#000000`, `#6B7280` |
| accent | primary, secondary, highlight | `#3B82F6`, `#60A5FA`, `#2563EB` |
| border | default, subtle, focus | `#262626`, `#1A1A1A`, `#3B82F6` |
| status | success, warning, error, info | `#34D399`, `#FBBF24`, `#F87171`, `#60A5FA` |
| interactive | default, hover, pressed, disabled | `#3B82F6`, `#60A5FA`, `#2563EB`, `#1E3A5F` |
| overlay | scrim, backdrop | `rgba(0,0,0,0.72)`, `rgba(0,0,0,0.88)` |
| transition | start, mid, end | `#000000`, `#6B7280`, `#FFFFFF` |

### 2.5 Color resolution

**Implemented** — `resolveSemanticColor(tokens, path)` in `foundation/colors.ts`

---

## 3. Typography

**Implemented** — `src/design-system/foundation/typography.ts`

### Font families

| Key | Stack |
|-----|-------|
| sans | Inter, SF Pro Text, system-ui |
| display | Inter, SF Pro Display, system-ui |
| terminal | SF Mono, Menlo, Consolas |

### Style tokens

| Style | Size | Weight | Line | Tracking | Transform |
|-------|------|--------|------|----------|-----------|
| display | 40 | 700 | 48 | -0.5 | — |
| heading | 28 | 600 | 36 | -0.25 | — |
| title | 20 | 600 | 28 | 0 | — |
| body | 16 | 400 | 24 | 0 | — |
| caption | 13 | 400 | 18 | 0.1 | — |
| label | 12 | 500 | 16 | 0.4 | uppercase |
| terminal | 18 | 400 | 24 | 0.2 | — |

### Brand typography

| Usage | Text | Style |
|-------|------|-------|
| Transition brand line | `an act...` | terminal |
| Default status line | `Preparing...` | terminal |

Export: `TYPOGRAPHY_TOKENS`, `TYPOGRAPHY_STYLES`, `TERMINAL_TYPOGRAPHY_USAGE`

---

## 4. Components

### 4.1 CH3-X1 component specs (`DESIGN_TOKENS.components`)

**Implemented** — `src/design-system/components/`

| Group | Spec IDs | File |
|-------|----------|------|
| Buttons | button-primary, button-secondary, button-ghost | buttons.ts |
| Inputs | input-text, input-search | inputs.ts |
| Cards | base, timeline, achievement, analytics | cards.ts |
| Badges | badge-professional | badges.ts |
| Progress | terminal, linear | progress.ts |
| Navigation | bottom-nav, FAB, bar | navigation.ts |
| Live Frame | live-frame (default) | live-frame.ts |
| Avatar | avatar | avatar.ts |
| Chips | chip | chips.ts |
| Timeline | timeline card ref | timeline.ts |

### 4.2 CH3-X2 core UI registry

**Implemented** — `CORE_UI_COMPONENT_REGISTRY` in `src/design-system/core-ui/registry/component-registry.ts`

| ID | Name | Category | Variants (count) |
|----|------|----------|------------------|
| core-ui-button | Button | input | 6 |
| core-ui-input | Input | input | 7 types |
| core-ui-search | Search | input | 1 |
| core-ui-card | Card | display | 2 (standard, elevated) |
| core-ui-timeline-card | Timeline Card | display | — |
| core-ui-achievement-card | Achievement Card | display | — |
| core-ui-analytics-card | Analytics Card | display | — |
| core-ui-contract-card | Contract Card | display | — |
| core-ui-recommendation-card | Recommendation Card | display | — |
| core-ui-live-frame | Live Frame | identity | 5 tiers |
| core-ui-badge | Professional Badge | identity | 5 |
| core-ui-chip | Chip | input | — |
| core-ui-avatar | Avatar | identity | — |
| core-ui-progress | Progress | feedback | linear, circular, terminal |
| core-ui-navigation-bar | Navigation Bar | navigation | top |
| core-ui-side-navigation | Side Navigation | navigation | — |
| core-ui-bottom-navigation | Bottom Navigation | navigation | — |
| core-ui-floating-action-button | FAB | navigation | — |
| core-ui-modal | Modal | overlay | — |
| core-ui-dialog | Dialog | overlay | — |
| core-ui-sheet | Sheet | overlay | — |
| core-ui-toast | Toast | feedback | — |
| core-ui-loading | Official Transition Screen | feedback | 2 (need-to-action, action-to-need) |

**Total: 22 components**

### 4.3 Button variant detail

| Variant | Background token | Text token |
|---------|------------------|------------|
| primary | interactive.default | text.inverse |
| secondary | surface.primary | text.primary |
| ghost | background.primary | accent.primary |
| danger | status.error | text.inverse |
| success | status.success | text.inverse |
| disabled | interactive.disabled | text.disabled |

### 4.4 Badge variant detail

`verified`, `licensed`, `certified`, `government`, `elite`

### 4.5 Input type detail

`text`, `email`, `password`, `number`, `search`, `phone`, `multiline`

---

## 5. Navigation

**Implemented** — `src/navigation-framework/`

### Layouts

| ID | Mode | File |
|----|------|------|
| need-layout | need | layouts/need-layout.ts |
| action-layout | action | layouts/action-layout.ts |
| transition-layout | transition | layouts/transition-layout.ts |
| modal-layout | modal | layouts/modal-layout.ts |

### Screen regions (8)

`safeArea`, `statusArea`, `topNavigation`, `screenHeader`, `contentArea`, `floatingActionArea`, `bottomNavigation`, `transitionLayer`

### Navigation patterns

| Pattern | Spec location |
|---------|---------------|
| Top navigation | navigation/top-navigation.ts |
| Bottom navigation | navigation/bottom-navigation.ts |
| Side navigation | navigation/side-navigation.ts |
| Navigation stack | navigation/navigation-stack.ts |
| Navigation state | navigation/navigation-state.ts |
| Modal / sheet / dialog / overlay | layouts/modal-layout.ts |

### Breakpoints

| Name | minWidth | Side nav |
|------|----------|----------|
| compact | 0 | false |
| regular | 768 | false |
| expanded | 1024 | true |

Max content width (expanded): **1200px**

### Transition patterns

| Engine | File |
|--------|------|
| Transition engine | transitions/transition-engine.ts |
| Progress engine | transitions/progress-engine.ts |
| Background transition | transitions/background-transition.ts |

Stage texts: `Preparing...`, `Matching...`, `Building Contract...`, `Securing...`, `Action Ready.`

---

## 6. Runtime Screens

Runtime screens are **JSON payloads** built by CH3-X5+ presentation layers. Each maps to a prototype and layout.

### 6.1 Need Experience screens (X5)

| screenId | prototypeId | route | layout |
|----------|-------------|-------|--------|
| need-home | prototype-need-home | /need/home | need-layout |
| search | prototype-search | /need/search | need-layout |
| opportunity-list | prototype-opportunity-list | /need/opportunities | need-layout |
| request | prototype-request | /need/request/create | need-layout |
| empty-state | prototype-empty-state | /need/empty | need-layout |
| transition | prototype-transition | /system/transition | transition-layout |

### 6.2 Action Experience screens (X6)

| screenId | Route (from docs) |
|----------|-------------------|
| action-home | /action/home |
| contract-preview | (contract preview) |
| active-action | (active action) |
| progress | (progress) |
| completion | (completion) |
| waiting | (waiting) |
| transition | (return transition) |

Prototypes: `prototype-action-home`, `prototype-active-action`, `prototype-contract`, `prototype-success`, `prototype-completion`, `prototype-transition`

### 6.3 Shared experience screens (X7–X11)

| Module | Prototype refs |
|--------|----------------|
| Contract (X7) | prototype-contract |
| Chat (X8) | prototype-chat |
| Timeline (X9) | prototype-timeline |
| Notification (X10) | prototype-notification |
| Profile (X11) | prototype-profile |

### 6.4 Runtime journey steps (X12)

Documented full path: Launch → Need Home → Search → Opportunity List → Request → transition → Action Home → Contract → Chat → Timeline → Notification → Profile → Completion → Return → Need Home

### 6.5 Operator screens (X16–X30, FINAL)

Presentation-layer JSON dashboards — not mapped to X4 consumer prototypes. Examples:

- operations-home, operations-dashboard, executive-command-board, certification-screen, completion-dashboard

---

## 7. Design Tokens (non-color)

**Implemented** — aggregated in `DESIGN_TOKENS`

### Spacing (`SPACING_TOKENS`)

| Token | px |
|-------|-----|
| space-4 | 4 |
| space-8 | 8 |
| space-12 | 12 |
| space-16 | 16 |
| space-20 | 20 |
| space-24 | 24 |
| space-32 | 32 |
| space-40 | 40 |
| space-48 | 48 |
| space-64 | 64 |

### Radius (`RADIUS_TOKENS`)

| Token | Value |
|-------|-------|
| small | 4 |
| medium | 8 |
| large | 12 |
| extraLarge | 16 |
| pill | 9999 |
| circle | 50% |

### Elevation (`ELEVATION_TOKENS`)

| Level | zIndex | Shadow token |
|-------|--------|--------------|
| none | 0 | shadow-none |
| low | 1 | shadow-low |
| medium | 4 | shadow-medium |
| high | 8 | shadow-high |
| highest | 16 | shadow-highest |

### Motion (`MOTION_TOKENS`)

| Duration | ms | Default easing |
|----------|-----|----------------|
| fast | 120 | standard |
| normal | 240 | standard |
| slow | 400 | decelerate |
| extraSlow | 640 | emphasized |

Easing curves: standard, decelerate, accelerate, emphasized (cubic-bezier values in `motion.ts`)

### Icons

Names (15): home, search, profile, settings, timeline, achievement, analytics, live-frame, action, navigation, chevron, close, check, progress, badge

Sizes: xs 12, sm 16, md 20, lg 24, xl 32

Default stroke: 1.75

### Transitions (`AN_ACT_TRANSITION_FLOW`)

| Direction | Duration | Brand line |
|-----------|----------|------------|
| need-to-action | 640ms | an act... |
| action-to-need | 640ms | an act... |

Progress bar: height 4px, radius pill, track `surface.muted`

---

## 8. Prototype Registry

**Implemented** — `PROTOTYPE_REGISTRY` (18 entries), `FLOW_REGISTRY` (9 entries)

### Screens by category

| Category | Prototypes |
|----------|------------|
| need | need-home, opportunity-list, search, request, empty-state, rating |
| action | action-home, active-action, contract, success, completion |
| shared | chat, timeline, analytics, profile, notification, error |
| transition | transition, loading |

### Flows

| Flow ID | Purpose |
|---------|---------|
| ONBOARDING_FLOW | First launch |
| SEARCH_TO_ACTION_FLOW | Need discovery to action |
| REQUEST_FLOW | Request creation |
| REQUEST_TO_CONTRACT_FLOW | Request handoff |
| ACTION_FLOW | Action execution |
| CONTRACT_FLOW | Contract review |
| CONTRACT_TO_COMPLETION_FLOW | Contract to done |
| COMPLETION_FLOW | Completion ritual |
| COMPLETION_TO_RATING_FLOW | Post-completion rating |

### Navigation map API

- `getPrototypeCatalog()` — id, name, purpose, category, mode, route, componentCount
- `getFlowCatalog()` — id, name, purpose, stepCount, screenIds
- `getNavigationMap()` — screenId, route, mode, relatedScreenIds
- `getScreenRelationships()` — from/to/via flow edges

---

## 9. Live Frame

### 9.1 Design system tiers (CH3 canonical for UI specs)

**Implemented** — `core-ui-live-frame`

| Tier | Accent token |
|------|--------------|
| bronze | status.warning |
| silver | border.subtle |
| gold | status.warning |
| platinum | accent.highlight |
| diamond | accent.primary |

Ring: strokeWidth 2, radius circle, elevation medium, motion slow

### 9.2 X1 live-frame spec

**Implemented** — single default spec with ring glow `accent.highlight`

### 9.3 Trust domain tiers (parallel — **Consolidation candidate**)

**Implemented** — `src/trust/domain/live-frame.ts` (outside design-system)

| Tier | Score | Color | Label |
|------|-------|-------|-------|
| PLATINUM_ELITE | ≥95 | platinum_gold | Platinum Elite |
| EMERALD_PRO | ≥85 | emerald | Emerald Pro |
| TRUSTED | ≥70 | blue | Trusted |
| STANDARD | ≥50 | gray | Standard |
| WATCHLIST | <50 | red | Watchlist |

### 9.4 Need demo usage

**Implemented** — `NeedOpportunity.liveFrameTier`: bronze | silver | gold | platinum (no diamond in demo type)

---

## 10. Branding

| Element | Value | Status |
|---------|-------|--------|
| Transition brand line | `an act...` | **Implemented** |
| Product chapter name | AN ACT | **Documented** |
| Mode names | Need Mode, Action Mode | **Implemented** |
| Transition duration | 640ms | **Implemented** |
| Transition stages (5) | Preparing… through Action Ready. | **Implemented** |
| Terminal font | SF Mono stack | **Implemented** |
| Design system version | an-act-design-system-v1 | **Implemented** |
| Logo / wordmark asset | — | **Missing** |
| Marketing site branding | — | **Missing** |
| Favicon / app icon | — | **Missing** |

---

## 11. UI Architecture

### Layer stack (bottom to top)

```
CH3-X1 Design Tokens (DESIGN_TOKENS)
    ↓
CH3-X2 Core UI Components (CORE_UI_COMPONENT_REGISTRY)
    ↓
CH3-X3 Navigation Framework (layouts, regions, transitions)
    ↓
CH3-X4 Visual Prototypes (PROTOTYPE_REGISTRY, FLOW_REGISTRY)
    ↓
CH3-X5+ Runtime Experiences (JSON screen views via buildRuntimeScreenView)
    ↓
[Missing] Render adapter (React/CSS/Bubble)
```

### Runtime screen instance contract

**Implemented:**

```
RuntimeComponentInstance {
  id, componentId, variant?, props,
  accessibility: { label, role, tabIndex, describedBy }
}
```

Component IDs always prefixed `core-ui-*` in runtime experiences.

### Validation chain

| Validator | Target |
|-----------|--------|
| validateDesignSystem() | X1 tokens + X1 component specs |
| validateAllCoreUiComponents() | X2 registry completeness |
| validateNavigationFramework() | X3 layouts and patterns |
| validatePrototypeLibrary() | X4 screens |
| validateAllFlows() | X4 flow integrity |
| Per-experience validators | X5+ token/component/prototype compliance |

### Parallel UI (not CH3)

| Path | Relationship to CH3 |
|------|---------------------|
| `src/ui/pages/*` | Legacy platform pages — **no design-system imports** |
| `src/experience/` (HomeExperienceService) | Platform home — **separate bootstrap**, no CH3 tokens |

---

## 12. Missing Pieces

| Item | Expected by | Actual state |
|------|-------------|--------------|
| Pixel render layer | X2 doc ("production-ready components") | **Missing** — specs only |
| Icon SVG/font assets | ICON_NAMES registry | **Missing** — names only |
| Logo / brand mark | Branding | **Missing** |
| Unified Live Frame tier map | Single identity | **Missing** — 3 parallel systems |
| `core-ui-form` wrapper | Form UX | **Missing** — composed from inputs |
| Offer Experience module | User language "offer" | **Missing** — embedded in Need |
| CH3 consumption in `src/ui/` | Identity preservation | **Missing** |
| CH3 consumption in platform home | Unified landing | **Missing** |
| Diamond tier in Need demo data | Live Frame registry | **Missing** in NeedOpportunity type |
| CSS/style export from tokens | Render adapters | **Missing** — `motionToCss`, `shadowTokenToCss` helpers exist but no full theme CSS |

---

## 13. Consolidation Candidates

| Candidate | Current state | Recommended action |
|-----------|---------------|-------------------|
| **Live Frame tiers** | bronze…diamond (design-system) vs PLATINUM_ELITE…WATCHLIST (trust) vs demo subset | Single `LiveFrameTierRegistry` mapping trust scores → UI tiers → accent tokens |
| **Home experiences** | Need Home (CH3) vs HomeExperienceService (platform) | Migrate platform home to CH3 screen builder or deprecate |
| **Marketplace UI** | CH3 opportunity-list vs `src/ui/pages/marketplace-*` | Retire legacy pages or rewire to CH3 prototypes |
| **Button specs** | X1 BUTTON_SPECS (3) vs X2 BUTTON_COMPONENT (6) | X1 specs become subset aliases of X2 registry |
| **Input specs** | X1 INPUT_SPECS (2) vs X2 INPUT_COMPONENT (7 types) | Merge into single input registry |
| **Card specs** | X1 CARD_SPECS vs X2 specialized cards | Document X1 as legacy shorthand; X2 authoritative |
| **Dashboard presentations** | X21 operations vs X27 operations-center (similar naming) | Clarify docs; distinct scopes already in code |
| **Documentation X21 filename** | Titled "Operations Center" for X21 module | Rename doc to "Runtime Operations" to match code |
| **Trust badges vs professional badges** | trust tier labels vs core-ui-badge variants | Map trust labels to badge variants explicitly |
| **Render helpers** | motionToCss, shadowTokenToCss, elevationToShadow scattered | Single `token-to-style` export for future renderer |

---

## 14. Module Verify Index

All CH3 modules have verify scripts in `package.json`:

| Script | Module |
|--------|--------|
| verify:ch3-x1 | Design System |
| verify:ch3-x2 | Core UI |
| verify:ch3-x3 | Navigation Framework |
| verify:ch3-x4 | Prototype Library |
| verify:ch3-x5 … verify:ch3-x30 | Runtime X5–X30 |
| verify:ch3-final | Runtime Completion |

---

## 15. Accessibility Registry

**Implemented** — `ACCESSIBILITY_RULES` / `ACCESSIBILITY_SPEC`

| Rule | Value |
|------|-------|
| minimumTouchTargetPx | 44 |
| minimumContrastRatioNormalText | 4.5 |
| minimumContrastRatioLargeText | 3 |
| focusRingWidthPx | 2 |
| focusRingOffsetPx | 2 |
| focus ring color | border.focus |
| keyboardNavigationRequired | true |
| reducedMotionRespected | true |
| escapeDismissesOverlays | true |
| enterActivatesPrimary | true |

Badge minimum touch (exception): 32px for non-interactive status badges.

---

*Registry generated from repository state. No source code was modified.*
