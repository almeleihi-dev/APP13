# AN ACT — CH4 Design & Identity Review

**Scope:** Read-only architecture review of the completed Chapter 4 (CH4) Action Intelligence chapter.  
**Purpose:** Extract every discoverable AN ACT identity, design language, visual philosophy, UX, interaction, naming, and architectural decision — from code and documentation only.  
**Status:** CH4 complete — 22 intelligence modules (C1–C22) + bootstrap stabilization (B0). Terminal chain token: `action_intelligence_final_closure`.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Complete CH4 Module Registry](#2-complete-ch4-module-registry)
3. [Design Philosophy Discovered in CH4](#3-design-philosophy-discovered-in-ch4)
4. [User Experience Philosophy](#4-user-experience-philosophy)
5. [Visual Identity Decisions](#5-visual-identity-decisions)
6. [UI Architecture Decisions](#6-ui-architecture-decisions)
7. [Color System](#7-color-system)
8. [Typography Decisions](#8-typography-decisions)
9. [Terminal-Inspired Decisions](#9-terminal-inspired-decisions)
10. [Logo-Related Decisions](#10-logo-related-decisions)
11. [Button System](#11-button-system)
12. [Card System](#12-card-system)
13. [Screen Layout Philosophy](#13-screen-layout-philosophy)
14. [Navigation Philosophy](#14-navigation-philosophy)
15. [Motion / Animation Decisions](#15-motion--animation-decisions)
16. [Dashboard Philosophy](#16-dashboard-philosophy)
17. [AI Visualization Philosophy](#17-ai-visualization-philosophy)
18. [Live Frame System](#18-live-frame-system)
19. [Trust Visualization](#19-trust-visualization)
20. [Marketplace Identity](#20-marketplace-identity)
21. [Interaction Patterns](#21-interaction-patterns)
22. [Component Naming Conventions](#22-component-naming-conventions)
23. [UX Consistency Rules](#23-ux-consistency-rules)
24. [Reusable Design Patterns](#24-reusable-design-patterns)
25. [Screens That Define the AN ACT Identity](#25-screens-that-define-the-an-act-identity)
26. [Architectural Principles Discovered in CH4](#26-architectural-principles-discovered-in-ch4)
27. [Everything That Should Become Part of the Official AN ACT Design System](#27-everything-that-should-become-part-of-the-official-an-act-design-system)
28. [Recommended Official Design System](#28-recommended-official-design-system)

**Status key used throughout:**

| Label | Meaning |
|-------|---------|
| **Implemented** | Exists as executable TypeScript with concrete values or behavior |
| **Documented** | Described in markdown docs; may or may not have runtime pixels |
| **Concept only (not implemented)** | Specified or implied; no rendered UI or incomplete wiring |

---

## 1. Executive Summary

Chapter 4 — **AN ACT Action Intelligence** — is a **read-only, linear delegation chain** of 22 modules (C1–C22) that interpret, plan, price, contract, execute, trust-score, decide, recommend, predict, strategize, learn, optimize, evolve, orchestrate, and finally **present, dashboard, certify, and close** the complete intelligence platform.

CH4 does **not** implement rendered UI pixels. Its user-facing layers (C18–C22) are **authenticated REST experience projections** — structured JSON screens with headlines, summaries, confidence scores, and explainability narratives. Visual identity for AN ACT lives primarily in **Chapter 3** (`src/design-system/`, `src/navigation-framework/`, `src/prototype-library/`), which CH4 experience modules reference conceptually but do not consume at runtime.

What CH4 **does** define for identity:

- The **intellectual model**: `Goal → Actions → Resources → Skills → Time → Risk → Price → Contract → Execution → Trust` (C1)
- The **journey information architecture**: 16 intelligence layers surfaced as sequential experience screens (C18)
- The **executive dashboard model**: health, confidence, readiness, per-layer overviews, timeline (C19)
- The **certification vocabulary**: platform, architecture, delegation, determinism, explainability (C21)
- The **chapter closure ritual**: architecture completion, ecosystem completion, handoff to Chapter 5 (C22)
- **Architectural guarantees** repeated across all modules: read-only, delegates-only, deterministic, explainable, import-lint clean

The AN ACT brand expression in code is **typographic** (`an act...` / `AN ACT`), dual-mode (Need/Action), and terminal-bridge transitions — all **Implemented** in the design system, **Documented** in CH3 specs, and **referenced** by CH4 closure/certification language but not re-implemented in CH4 modules.

---

## 2. Complete CH4 Module Registry

### CH4-B0 — Architecture Stabilization

| Property | Value |
|----------|-------|
| **ID** | CH4-B0 |
| **Name** | Architecture Stabilization |
| **Path** | `src/bootstrap/` (modular bootstrap layout) |
| **Type** | Platform wiring — no dedicated feature module |
| **Test** | `test/ch4-b0-architecture-stabilization.test.ts` |
| **Verify** | `npm run verify:ch4-b0` |
| **Purpose** | Validates grouped bootstrap modules, minimal `index.ts`/`server.ts`, `IntelligenceDependencies` interface |
| **Status** | **Implemented** |

Bootstrap files: `engines.ts`, `financial.ts`, `runtime.ts`, `experiences.ts`, `living.ts`, `intelligence.ts`, `platform.ts`, `security.ts`, `routes.ts`, `bootstrap.ts`, `dependencies.ts`.

---

### CH4 Intelligence Chain

```
C1 → C2 → C3 → C4 → C5 → C6 → C7 → C8 → C9 → C10 → C11 → C12 → C13 → C14 → C15 → C16 → C17
  → C18 → C19 → C20 → C21 → C22 → CH5-X1
```

**Shared scenario catalog (all C1–C22):** `moving_a_room`, `cleaning_an_apartment`, `delivering_a_document`, `fixing_small_home_issue`, `preparing_professional_service_request`

---

### C1–C22 Registry

| ID | Module Name | Path | Factory | Bootstrap Key | Service | Schema | Route Base | Upstream | Chain Constant | Chain Len | Terminal Token |
|----|-------------|------|---------|---------------|---------|--------|------------|----------|----------------|-----------|----------------|
| **C1** | Unified Action Intelligence Engine | `src/unified-action-intelligence/` | `createUnifiedActionIntelligenceModule()` | `unifiedActionIntelligence` | `UnifiedActionIntelligenceService` | `unified-action-intelligence-v1` | `/action-intelligence` | — (entry) | `INTELLIGENCE_CHAIN` | 10 | `trust` |
| **C2** | Action Ontology Engine | `src/action-ontology/` | `createActionOntologyModule()` | `actionOntology` | `ActionOntologyService` | `action-ontology-v1` | `/action-ontology` | C1 | `ONTOLOGY_CHAIN` | 12 | `trust_signals` |
| **C3** | Action Planning Engine | `src/action-planning/` | `createActionPlanningModule()` | `actionPlanning` | `ActionPlanningService` | `action-planning-v1` | `/action-planning` | C2 | `PLANNING_CHAIN` | 9 | `completion_criteria` |
| **C4** | Dynamic Action Pricing Intelligence | `src/dynamic-pricing/` | `createDynamicPricingModule()` | `dynamicPricing` | `DynamicPricingService` | `dynamic-pricing-v1` | `/dynamic-pricing` | C3 | `PRICING_CHAIN` | 6 | `execution` |
| **C5** | Contract Intelligence Engine | `src/contract-intelligence/` | `createContractIntelligenceEngineModule()` | `contractIntelligenceEngine` | `ContractIntelligenceEngineService` | `contract-intelligence-v1` | `/contract-intelligence` | C4 | `CONTRACT_CHAIN` | — | `execution` |
| **C6** | Execution Intelligence Engine | `src/execution-intelligence/` | `createExecutionIntelligenceEngineModule()` | `executionIntelligenceEngine` | `ExecutionIntelligenceEngineService` | `execution-intelligence-v1` | `/execution-intelligence` | C5 | `EXECUTION_CHAIN` | — | `execution_intelligence` |
| **C7** | Outcome Intelligence Engine | `src/outcome-intelligence/` | `createOutcomeIntelligenceEngineModule()` | `outcomeIntelligenceEngine` | `OutcomeIntelligenceEngineService` | `outcome-intelligence-v1` | `/outcome-intelligence` | C6 | `OUTCOME_CHAIN` | — | `outcome_intelligence` |
| **C8** | Trust Intelligence Engine | `src/trust-intelligence/` | `createTrustIntelligenceEngineModule()` | `trustIntelligenceEngine` | `TrustIntelligenceEngineService` | `trust-intelligence-v1` | `/trust-intelligence` | C7 | `TRUST_CHAIN` | — | `trust_intelligence` |
| **C9** | Decision Intelligence Engine | `src/decision-intelligence/` | `createDecisionIntelligenceEngineModule()` | `decisionIntelligenceEngine` | `DecisionIntelligenceEngineService` | `decision-intelligence-v1` | `/decision-intelligence` | C8 | `DECISION_CHAIN` | — | `decision_intelligence` |
| **C10** | Recommendation Intelligence Engine | `src/recommendation-intelligence/` | `createRecommendationIntelligenceEngineModule()` | `recommendationIntelligenceEngine` | `RecommendationIntelligenceEngineService` | `recommendation-intelligence-v1` | `/recommendation-intelligence` | C9 | `RECOMMENDATION_CHAIN` | — | `recommendation_intelligence` |
| **C11** | Insight Intelligence Engine | `src/insight-intelligence/` | `createInsightIntelligenceEngineModule()` | `insightIntelligenceEngine` | `InsightIntelligenceEngineService` | `insight-intelligence-v1` | `/insight-intelligence` | C10 | `INSIGHT_CHAIN` | — | `insight_intelligence` |
| **C12** | Prediction Intelligence Engine | `src/prediction-intelligence/` | `createPredictionIntelligenceEngineModule()` | `predictionIntelligenceEngine` | `PredictionIntelligenceEngineService` | `prediction-intelligence-v1` | `/prediction-intelligence` | C11 | `PREDICTION_CHAIN` | — | `prediction_intelligence` |
| **C13** | Strategy Intelligence Engine | `src/strategy-intelligence/` | `createStrategyIntelligenceEngineModule()` | `strategyIntelligenceEngine` | `StrategyIntelligenceEngineService` | `strategy-intelligence-v1` | `/strategy-intelligence` | C12 | `STRATEGY_CHAIN` | — | `strategy_intelligence` |
| **C14** | Learning Intelligence Engine | `src/learning-intelligence/` | `createLearningIntelligenceEngineModule()` | `learningIntelligenceEngine` | `LearningIntelligenceEngineService` | `learning-intelligence-v1` | `/learning-intelligence` | C13 | `LEARNING_CHAIN` | — | `learning_intelligence` |
| **C15** | Optimization Intelligence Engine | `src/optimization-intelligence/` | `createOptimizationIntelligenceEngineModule()` | `optimizationIntelligenceEngine` | `OptimizationIntelligenceEngineService` | `optimization-intelligence-v1` | `/optimization-intelligence` | C14 | `OPTIMIZATION_CHAIN` | — | `optimization_intelligence` |
| **C16** | Evolution Intelligence Engine | `src/evolution-intelligence/` | `createEvolutionIntelligenceEngineModule()` | `evolutionIntelligenceEngine` | `EvolutionIntelligenceEngineService` | `evolution-intelligence-v1` | `/evolution-intelligence` | C15 | `EVOLUTION_CHAIN` | — | `evolution_intelligence` |
| **C17** | Orchestration Intelligence Engine | `src/orchestration-intelligence/` | `createOrchestrationIntelligenceEngineModule()` | `orchestrationIntelligenceEngine` | `OrchestrationIntelligenceEngineService` | `orchestration-intelligence-v1` | `/orchestration-intelligence` | C16 | `ORCHESTRATION_CHAIN` | 17 | `orchestration_intelligence` |
| **C18** | Unified Action Intelligence Experience | `src/action-intelligence-experience/` | `createActionIntelligenceExperienceModule()` | `actionIntelligenceExperience` | `ActionIntelligenceExperienceService` | `action-intelligence-experience-v1` | `/action-intelligence-experience` | C17 | `EXPERIENCE_JOURNEY_CHAIN` | 18 | `action_intelligence_experience` |
| **C19** | Intelligence Dashboard | `src/intelligence-dashboard/` | `createIntelligenceDashboardModule()` | `intelligenceDashboard` | `IntelligenceDashboardService` | `intelligence-dashboard-v1` | `/intelligence-dashboard` | C18 | `INTELLIGENCE_DASHBOARD_CHAIN` | 19 | `intelligence_dashboard` |
| **C20** | Executive Intelligence Center | `src/executive-intelligence-center/` | `createExecutiveIntelligenceCenterModule()` | `executiveIntelligenceCenter` | `ExecutiveIntelligenceCenterService` | `executive-intelligence-center-v1` | `/executive-intelligence-center` | C19 | `EXECUTIVE_INTELLIGENCE_CHAIN` | 20 | `executive_intelligence_center` |
| **C21** | Action Intelligence Final Certification | `src/action-intelligence-certification/` | `createActionIntelligenceCertificationModule()` | `actionIntelligenceCertification` | `ActionIntelligenceCertificationService` | `action-intelligence-certification-v1` | `/action-intelligence-certification` | C20 | `CERTIFICATION_CHAIN` | 21 | `action_intelligence_certification` |
| **C22** | Action Intelligence Final Closure | `src/action-intelligence-final-closure/` | `createActionIntelligenceFinalClosureModule()` | `actionIntelligenceFinalClosure` | `ActionIntelligenceFinalClosureService` | `action-intelligence-final-closure-v1` | `/action-intelligence-final-closure` | C21 | `CLOSURE_CHAIN` | 22 | `action_intelligence_final_closure` |

**Note:** C4–C16 progressive engine chains share prefix `intent → canonical_action → action_plan → dynamic_pricing → …` with each module appending its terminal intelligence token. Exact array lengths for C5–C16 follow the progressive pattern (verified in tests for C17 = 17 links through `orchestration_intelligence`).

**Documentation:** 22 module specs at `docs/action-intelligence/CH4-C1-*.md` through `CH4-C22-*.md`.  
**Verification:** `npm run verify:ch4-c1` … `verify:ch4-c22` (13 tests per module).

---

## 3. Design Philosophy Discovered in CH4

| Principle | Source | Status |
|-----------|--------|--------|
| Every user goal decomposes through a fixed intelligence ladder | C1 doc: Goal → Actions → … → Trust | **Documented** |
| Intelligence engines are **read-only** — no execution, payment, trust mutation | All CH4-C*.md guarantees | **Implemented** (enforced in services) |
| **Linear delegation** — each module has exactly one upstream | Repository pattern across C2–C22 | **Implemented** |
| **Deterministic outputs** — fixed timestamps, stable builders | Schema `FIXED_TIMESTAMP` constants | **Implemented** |
| **Explainability** — every module exposes `/explanation` | Route tables C1–C22 | **Implemented** |
| **Five canonical scenarios** unify testing and UX consistency | Shared `*_SCENARIO_IDS` arrays | **Implemented** |
| Experience layers (C18+) **project** upstream data; never duplicate business logic | C18–C22 delegation docs | **Implemented** |
| Chapter closes with explicit **handoff** to next chapter (CH5) | C22 `CHAPTER_NUMBER=4`, `NEXT_CHAPTER_NUMBER=5` | **Implemented** |
| Clean Architecture: domain / application / infrastructure | All module folder structures | **Implemented** |
| Import-lint as architecture guard | Verify scripts run `lint:imports` | **Implemented** |

CH4 does **not** define its own color palette or typography. Visual design philosophy is inherited from CH3 (`DESIGN_SYSTEM_PHILOSOPHY` in `src/design-system/documentation/design-system.ts`).

---

## 4. User Experience Philosophy

### CH4 Experience Model (C18–C22) — **Implemented** (API projections, not pixels)

| Layer | UX Intent |
|-------|-----------|
| **C18 Experience** | Present C1–C17 as one **unified journey** — 16 journey steps, per-layer screens (intent through orchestration), end-to-end `/journey`, human `/explanation` |
| **C19 Dashboard** | **Executive overview** — health, confidence, readiness, per-intelligence overviews, 16-step timeline, executive summary |
| **C20 Executive Center** | **Platform command view** — platform health, strategic/operational status, orchestration, reports |
| **C21 Certification** | **Trust in the system** — certify platform, architecture, delegation, determinism, explainability, API, ecosystem |
| **C22 Closure** | **Chapter completion ritual** — architecture/ecosystem completion, implementation statistics, executive closure, **handoff to CH5** |

### Cross-Cutting UX Rules (CH4) — **Implemented**

- All routes require authentication
- Query parameters: `scenario_id`, `canonical_action_id`, `urgency`, `distance_band`, `intent`
- Every module returns `read_only: true` on API responses
- Standard endpoints on all modules: home, confidence (where applicable), explanation, summary, validate
- Confidence levels: `low`, `medium`, `high` (recurring enum pattern)

### CH3 Visual UX Philosophy (referenced by AN ACT identity) — **Implemented** (specs)

From `docs/design-system/CH3-X1-AN-ACT-Design-System.md`:

- **Dual operating contexts:** Need Mode (reflect/plan) vs Action Mode (execute)
- **Official transition** bridges modes — terminal typography, brand line, progress
- **Semantic tokens only** — no raw hex in component specs
- **Accessibility by default**

---

## 5. Visual Identity Decisions

| Decision | Detail | Status |
|----------|--------|--------|
| Product name | **AN ACT** (uppercase) in module headlines and docs | **Documented** |
| Brand moment | **`an act...`** (lowercase, ellipsis) on transition screens | **Implemented** (`transitions.ts`, `typography.ts`) |
| Dual-mode identity | White/black Need ↔ Black/white Action | **Implemented** (need-mode.ts, action-mode.ts) |
| Blue as action accent | Primary interactive and accent color in both modes | **Implemented** |
| Terminal as brand bridge | SF Mono stack, 18px terminal style for transitions | **Implemented** |
| No logo asset | Brand is typographic; no AN ACT logo SVG/PNG in design system | **Implemented** (absence verified) |
| APP13 favicon | `#1f4fd6` rounded rect, white "13" — platform favicon, not AN ACT mark | **Implemented** (`public/browser/favicon.svg`) |
| Framework-independent specs | TypeScript token definitions, no CSS/React render layer | **Implemented** |
| Visual prototypes before runtime | CH3-X4 prototype library defines screens before pixels | **Documented** |

---

## 6. UI Architecture Decisions

### CH4 UI Architecture — **Concept only (not implemented)** for pixels

CH4 modules expose **screen builders** (`*-screens.ts`) producing JSON view models. No React/Vue/CSS consumption layer exists in CH4.

### CH3 UI Architecture — **Implemented** (spec layer)

| Layer | Path | Role |
|-------|------|------|
| Design tokens | `src/design-system/foundation/` | Colors, type, spacing, motion |
| Themes | `src/design-system/themes/` | Need Mode, Action Mode |
| Components (X1) | `src/design-system/components/` | Base button, card, nav specs |
| Core UI (X2) | `src/design-system/core-ui/components/` | Extended variants + states |
| Navigation (X3) | `src/navigation-framework/` | 8-region screen anatomy, layouts |
| Prototypes (X4) | `src/prototype-library/` | 19 screen specs, 5 flows |

### MVP UI Pages — **Concept only (not implemented)**

`src/ui/pages/` — data/view models (platform-home, provider-dashboard, marketplace-search) without design token binding.

---

## 7. Color System

> Primary source: `src/design-system/themes/need-mode.ts`, `action-mode.ts`, `foundation/colors.ts` — **Implemented**

### Primary Colors

| Token Path | Need Mode | Action Mode |
|------------|-----------|-------------|
| `background.primary` | `#FFFFFF` | `#000000` |
| `text.primary` | `#000000` | `#FFFFFF` |
| `accent.primary` | `#2563EB` | `#3B82F6` |
| `interactive.default` | `#2563EB` | `#3B82F6` |

### Secondary Colors

| Token Path | Need Mode | Action Mode |
|------------|-----------|-------------|
| `background.secondary` | `#FAFAFA` | `#0A0A0A` |
| `surface.primary` | `#FFFFFF` | `#111111` |
| `surface.secondary` | `#F3F4F6` | `#1A1A1A` |
| `text.secondary` | `#374151` | `#D1D5DB` |
| `accent.secondary` | `#3B82F6` | `#60A5FA` |

### Semantic Colors

| Token Path | Need Mode | Action Mode |
|------------|-----------|-------------|
| `status.success` | `#059669` | `#34D399` |
| `status.warning` | `#D97706` | `#FBBF24` |
| `status.error` | `#DC2626` | `#F87171` |
| `status.info` | `#2563EB` | `#60A5FA` |

### Trust Colors

**Design system Live Frame tiers** (`src/design-system/core-ui/components/live-frame.ts`) — **Implemented** (semantic mapping):

| Tier | Maps To |
|------|---------|
| bronze | `status.warning` |
| silver | `border.subtle` |
| gold | `accent.highlight` |
| platinum | `accent.primary` |
| diamond | `accent.primary` |

**Trust domain tiers** (`src/trust/domain/live-frame.ts`) — **Implemented** (logic, named colors):

| Tier | Color Name | Threshold |
|------|------------|-----------|
| PLATINUM_ELITE | `platinum_gold` | ≥95 |
| EMERALD_PRO | `emerald` | ≥85 |
| TRUSTED | `blue` | ≥70 |
| STANDARD | `gray` | ≥50 |
| WATCHLIST | `red` | <50 |

**Living experience hex colors** (`src/living-experience/live-frame/domain/live-frame-schema.ts`) — **Implemented**:

| Tier | Hex |
|------|-----|
| WATCHLIST | `#9CA3AF` |
| STANDARD | `#60A5FA` |
| TRUSTED | `#34D399` |
| EMERALD_PRO | `#10B981` |
| PLATINUM_ELITE | `#A78BFA` |

**Note:** Three parallel Live Frame color models exist — not unified.

### Live Frame Colors

See Trust Colors above. Design-system spec: minH 64, pad 16×12, radius large, ring stroke 2, glow `accent.highlight` — **Implemented** (`components/live-frame.ts`).

### Backgrounds

| Context | Token / Value |
|---------|---------------|
| Need primary | `#FFFFFF` |
| Need inverse | `#000000` |
| Action primary | `#000000` |
| Action inverse | `#FFFFFF` |
| Transition start (Need→Action) | `transition.start` = `#FFFFFF` |
| Transition mid | `transition.mid` = `#6B7280` |
| Transition end | `transition.end` = `#000000` |
| Overlay scrim (Need) | `rgba(0,0,0,0.4)` |
| Overlay scrim (Action) | `rgba(0,0,0,0.72)` |

### Shadows — **Implemented** (`foundation/shadows.ts`)

Need mode: rgba black 0.06–0.16 opacity. Action mode: ×1.4 blur, rgba(0,0,0,0.32).

---

## 8. Typography Decisions

**Source:** `src/design-system/foundation/typography.ts` — **Implemented**

| Style | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| display | 40px | 700 | 48 | -0.5 | Hero |
| heading | 28px | 600 | 36 | -0.25 | Section headers |
| title | 20px | 600 | 28 | — | Screen titles, nav bar |
| body | 16px | 400 | 24 | — | Default text |
| caption | 13px | 400 | 18 | 0.1 | Secondary text |
| label | 12px | 500 | 16 | 0.4 | Uppercase labels |
| terminal | 18px | 400 | 24 | 0.2 | Transitions, brand line |

**Font stacks:**

- Sans: `"Inter", "SF Pro Text", system-ui, …`
- Display: `"Inter", "SF Pro Display", …`
- Terminal: `"SF Mono", "Menlo", "Consolas", monospace`

---

## 9. Terminal-Inspired Decisions

**Source:** `foundation/transitions.ts`, `core-ui/components/loading.ts` — **Implemented**

| Element | Value |
|---------|-------|
| Brand line | `"an act..."` |
| Default status line | `"Preparing..."` |
| Stage progression | Preparing… → Matching… → Building Contract… → Securing… → Action Ready. |
| Typography on transition | `terminal` style |
| Duration | 640ms (`extraSlow`) |
| Easing (forward) | `cubic-bezier(0.2, 0, 0, 1)` emphasized |
| Easing (reverse) | decelerate |
| Progress bar height | 4px, pill radius |
| Background interpolation | white → gray → black via semantic tokens |
| ARIA role on transition | `status` |

Validation enforces: brand line must be `"an act..."`, status line must be `"Preparing..."`, ≥3 background steps — **Implemented** (`validateDesignSystem()`).

---

## 10. Logo-Related Decisions

| Item | Status |
|------|--------|
| AN ACT wordmark as typographic `"an act..."` | **Implemented** |
| AN ACT product name `"AN ACT"` uppercase | **Documented** |
| Logo SVG/PNG asset | **Concept only (not implemented)** — not found in design system |
| APP13 favicon (blue `#1f4fd6`, "13") | **Implemented** — platform identity, distinct from AN ACT brand mark |

---

## 11. Button System

**Sources:** `design-system/components/buttons.ts`, `core-ui/components/button.ts` — **Implemented**

| Variant | Min Height | Padding | Background Token | Text Token | Elevation |
|---------|------------|---------|------------------|------------|-----------|
| Primary | 48px | 24×12 | `interactive.default` | `text.inverse` | low |
| Secondary | 48px | 24×12 | `surface.primary` | `text.primary` | none |
| Ghost | 44px | 16×8 | `background.primary` | `accent.primary` | none |
| Danger (core-ui) | — | — | `status.error` | `text.inverse` | — |
| Success (core-ui) | — | — | `status.success` | `text.inverse` | — |

**States (core-ui):** default, hover, pressed, focused, loading, disabled — **Implemented**

**Resolved Need Mode primary:** bg `#2563EB`, text `#FFFFFF`

---

## 12. Card System

**Sources:** `design-system/components/cards.ts`, `core-ui/components/*.ts` — **Implemented**

| Card | Min Height | Padding | Radius | Elevation | Accent Token |
|------|------------|---------|--------|-----------|--------------|
| Base | — | 16 | large | medium | — |
| Timeline | 72 | — | medium | low | `accent.primary` |
| Achievement | 88 | 20×16 | — | — | `status.success` |
| Analytics | 96 | — | — | — | `accent.highlight` |
| Contract | 96 | — | — | — | `accent.secondary` |
| Recommendation | 80 | — | — | low | `accent.primary` |
| Standard/Elevated (core-ui) | — | — | — | hover→high, pressed→low | — |

---

## 13. Screen Layout Philosophy

### CH3 Eight-Region Anatomy — **Implemented** (`navigation-framework/foundation/screen-schema.ts`)

1. Safe Area  
2. Status Area  
3. Top Navigation  
4. Screen Header  
5. Content Area  
6. Floating Action Area  
7. Bottom Navigation  
8. Transition Layer  

### Layout Types — **Implemented**

| Layout | Background | Padding | Gap | Motion | Special |
|--------|------------|---------|-----|--------|---------|
| Need | `background.primary` | 16 | 12 | normal | Reading, search |
| Action | `background.primary` (dark) | 20×16 | 16 | fast | FAB required |
| Transition | terminal tokens | 24×32 | — | extraSlow | Brand line |
| Modal | `overlay.scrim` | — | — | — | Focus trap, Escape dismiss |

**Breakpoints:** compact 0, regular 768, expanded 1024; max content width 1200 — **Implemented** (`foundation/layout.ts`).

**Safe area insets:** top 44, bottom 34 — **Implemented** (`foundation/safe-area.ts`).

---

## 14. Navigation Philosophy

**Source:** `docs/design-system/CH3-X3-Navigation-Framework.md`, `navigation-framework/` — **Implemented** (specs)

| Element | Spec |
|---------|------|
| Top navigation | minH 56, typography title |
| Bottom navigation | minH 64, elevation high, max 5 items, hidden during transition/modal |
| Side navigation | minWidth 240 (expanded breakpoint) |
| FAB | 56×56 circle, elevation highest, `interactive.default` |
| Default tab icons | home, search, timeline, profile (string refs, no SVG assets) |
| Stack navigation | Documented in navigation module |
| Bottom nav active state | `accent` token |

Mode-aware: Need layout for discovery; Action layout for execution with mandatory FAB.

---

## 15. Motion / Animation Decisions

**Source:** `foundation/motion.ts`, `foundation/transitions.ts` — **Implemented**

| Duration | ms |
|----------|-----|
| fast | 120 |
| normal | 240 |
| slow | 400 |
| extraSlow | 640 |

| Easing | Value |
|--------|-------|
| standard | `cubic-bezier(0.4, 0, 0.2, 1)` |
| decelerate | `(0, 0, 0.2, 1)` |
| accelerate | `(0.4, 0, 1, 1)` |
| emphasized | `(0.2, 0, 0, 1)` |

**Reduced motion:** disable animations, preserve opacity, fallback 0ms — **Implemented** (`ACCESSIBILITY_SPEC`).

**Spacing scale:** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 px — **Implemented**

**Radius:** small 4, medium 8, large 12, extraLarge 16, pill 9999, circle 50% — **Implemented**

---

## 16. Dashboard Philosophy

### CH4 Intelligence Dashboard (C19) — **Implemented** (data model)

Executive panels:

- Overview, Health, Journey Progress, Confidence, Readiness  
- Per-layer overviews: Trust, Decision, Recommendation, Prediction, Strategy, Learning, Optimization, Evolution  
- End-to-end timeline (16 steps)  
- Executive summary  

**Philosophy:** Dashboards **aggregate and explain** upstream journey data — never mutate. Delegates exclusively to C18.

### CH3 Analytics Prototype — **Implemented** (visual spec)

`prototype-library/screens/analytics.ts` — need-layout, analytics-card, progress, bottom-nav; responsive 1/2/3 columns.

### CH3 Action Home Dashboard — **Implemented** (visual spec)

`prototype-library/screens/action-home.ts` — action-layout, FAB, contract-card, fast motion.

---

## 17. AI Visualization Philosophy

### CH4 Approach — **Implemented** (API narratives, not charts)

| Pattern | Description |
|---------|-------------|
| **Journey steps** | 16 sequential intelligence layers with titles, details, sequence numbers (C18) |
| **Confidence scoring** | Re-scored at each layer; levels low/medium/high with rationale strings |
| **Explanation endpoints** | Human-readable summaries combining dashboard + matrix + monitor summaries |
| **Timeline projection** | 16-link chronological trace (C19) |
| **Certification domains** | Pass/fail checks with scores (C21) |
| **Chain trace** | Explicit token arrays documenting intelligence lineage (C17, C22) |

**No chart/graph rendering library** in CH4 — visualization is **structured text + scores + collections**.

### CH3 Analytics Card — **Implemented** (spec)

Visual spec for metric display using `analytics-card`, `progress` components — intended for future pixel rendering.

---

## 18. Live Frame System

| Layer | Path | Status |
|-------|------|--------|
| Design system component | `design-system/components/live-frame.ts` | **Implemented** — bronze–diamond tiers, semantic tokens |
| Core UI tiers | `core-ui/components/live-frame.ts` | **Implemented** |
| Trust classification | `trust/domain/live-frame.ts` | **Implemented** — score thresholds, tier labels |
| Living experience | `living-experience/live-frame/` | **Implemented** — hex colors, 13 sections (current frame, trust score, drivers, timeline, etc.) |
| Profile prototype | `prototype-library/screens/profile.ts` | **Implemented** — live-frame + avatar + badge |

**Live Frame meaning (living experience sections):** Current frame, frame meaning, trust score, history, progress, positive/negative drivers, professional growth, recommendations, timeline, achievements, verified evidence, future projection — **Implemented** (section IDs in `live-frame-schema.ts`).

---

## 19. Trust Visualization

| Element | Source | Status |
|---------|--------|--------|
| Trust score 0–100 normalization | `trust/domain/live-frame.ts` | **Implemented** |
| Five-tier classification | PLATINUM_ELITE → WATCHLIST | **Implemented** |
| Risk levels | minimal, low, moderate, elevated, high | **Implemented** |
| Trust intelligence engine (C8) | `/trust-intelligence/score`, `/reputation`, etc. | **Implemented** (API) |
| C18 trust experience screen | `/action-intelligence-experience/trust` | **Implemented** (projection) |
| C19 trust overview | `/intelligence-dashboard/trust` | **Implemented** (projection) |
| Trust center UI page | `src/ui/pages/trust-center.ts` | **Concept only (not implemented)** — data fields only |

---

## 20. Marketplace Identity

| Element | Source | Status |
|---------|--------|--------|
| Contract card component | `core-ui/components/contract-card.ts` | **Implemented** — minH 96, marketplace flows |
| Recommendation card | same file | **Implemented** |
| Search prototype | `prototype-library/screens/search.ts` | **Implemented** — need-layout, search + chip + card |
| Need home prototype | `prototype-library/screens/need-home.ts` | **Implemented** |
| Request prototype | `prototype-library/screens/request.ts` | **Implemented** |
| Marketplace MVP pages | `src/ui/pages/marketplace-*.ts` | **Concept only (not implemented)** |
| S3 action catalog | `src/action-intelligence/` | **Implemented** — separate from CH4 chain; marketplace catalog layer |
| Five canonical scenarios | Shared across CH4/CH5 | **Implemented** — moving, cleaning, delivery, home fix, professional service |

**Marketplace visual identity:** Need Mode (white, search-first) for discovery; Action Mode (black, contract-card, FAB) for execution — **Documented** in CH3-X4 flows.

---

## 21. Interaction Patterns

| Pattern | Source | Status |
|---------|--------|--------|
| Auth-required REST GET | All CH4 routes | **Implemented** |
| Scenario query driving deterministic output | `?scenario_id=` | **Implemented** |
| Catalog validation without scenario | `/validate` no query | **Implemented** |
| Standard screen envelope | `schema_version`, `output_id`, `view`, `read_only` | **Implemented** |
| Min touch target 44px | `ACCESSIBILITY_RULES` | **Implemented** |
| Focus ring 2px offset 2px, `border.focus` | `ACCESSIBILITY_SPEC` | **Implemented** |
| Keyboard: Tab order, Escape dismiss, Enter primary | `ACCESSIBILITY_SPEC` | **Implemented** |
| Modal focus trap | `modal-layout.ts` | **Implemented** |
| Bottom nav hidden during transition | `bottom-navigation.ts` | **Implemented** |
| FAB on Action layout | `action-layout.ts` | **Implemented** |
| Reduced motion support | `motionReduction` spec | **Implemented** |

---

## 22. Component Naming Conventions

### CH4 Module Naming — **Implemented**

| Element | Pattern | Example |
|---------|---------|---------|
| Path | `{domain}-intelligence/` or `action-intelligence-{role}/` | `trust-intelligence/` |
| Factory | `create{PascalCase}Module()` | `createTrustIntelligenceEngineModule()` |
| Bootstrap key | `{camelCase}` | `trustIntelligenceEngine` |
| Service | `{PascalCase}Service` | `TrustIntelligenceEngineService` |
| Schema | `{kebab-case}-v1` | `trust-intelligence-v1` |
| Route base | `/{kebab-case}` | `/trust-intelligence` |
| Chain token | `snake_case` | `trust_intelligence` |
| Bridge file | `c{N-1}-{name}-bridge.ts` | `c7-trust-bridge.ts` |
| Verify script | `verify:ch4-c{N}` | `verify:ch4-c8` |

### CH3 Design System Naming — **Implemented**

| Element | Pattern | Example |
|---------|---------|---------|
| Component id | `core-ui-{name}` or `{name}` | `core-ui-button` |
| Token path | `{group}.{variant}` | `accent.primary` |
| Theme mode | `need`, `action` | Need Mode |
| Prototype screen id | kebab in `screens/` | `need-home.ts` |

---

## 23. UX Consistency Rules

### CH4 Consistency — **Implemented**

1. All modules read-only (`readOnly: true` / `read_only: true`)
2. Five shared scenarios across entire chapter
3. Every module exposes explanation + summary + validate
4. Confidence re-scored at each layer (not blindly copied)
5. Output IDs propagate upstream: `{prefix}-{upstream.outputId}`
6. Fixed timestamps for all `generatedAt` fields
7. Sole upstream delegation documented in `UPSTREAM_MODULE_ID`
8. 13 tests per module (domain 5, service 6, wiring 1, route smoke 1)

### CH3 Visual Consistency — **Implemented**

1. Semantic color tokens only in component specs
2. Need/Action mode dictates background and text polarity
3. Terminal typography only on transition screens
4. Spacing scale adherence (4–64)
5. Component validator rejects non-semantic color refs

---

## 24. Reusable Design Patterns

| Pattern | Where Used | Status |
|---------|------------|--------|
| Clean Architecture (domain/app/infra) | All CH4 modules | **Implemented** |
| Repository sole upstream call | C2–C22 | **Implemented** |
| Builder transforms upstream output | All modules | **Implemented** |
| Bridge re-exports scenario resolution | `cN-*-bridge.ts` | **Implemented** |
| Screen builders wrap views | `*-screens.ts` | **Implemented** |
| Dual-mode operating system | CH3 design system | **Implemented** |
| Official transition ritual | CH3 transitions + prototypes | **Implemented** |
| 8-region screen anatomy | CH3 navigation | **Implemented** |
| Experience → Dashboard → Executive → Certify → Close | C18–C22 | **Implemented** |
| Registry-first namespace approval | CH4/CH5 docs | **Documented** |

---

## 25. Screens That Define the AN ACT Identity

### Visual Identity Screens (CH3-X4) — **Implemented** (specs)

| Screen | Mode | Identity Role |
|--------|------|---------------|
| **Transition** | System | **Primary brand moment** — `an act...`, terminal type, mode bridge |
| Need Home | Need | Discovery entry — white, reflective |
| Search | Need | Marketplace discovery |
| Request | Need | Intent capture |
| Action Home | Action | Execution entry — black, FAB |
| Contract | Action | Commitment surface |
| Active Action | Action | In-progress execution |
| Completion / Success / Rating | Action | Closure loop back to Need |
| Profile | Shared | Live Frame + avatar identity |
| Timeline | Shared | Professional journey |
| Analytics | Shared | Progress metrics |
| Chat | Shared | Conversation |
| Loading / Error | System | Feedback states |

### Intelligence Presentation Screens (CH4 C18–C22) — **Implemented** (API)

| Screen Set | Identity Role |
|------------|---------------|
| C18 journey (16 steps) | **Intellectual identity** — how AN ACT thinks |
| C19 dashboard panels | **Operational identity** — health, confidence, readiness |
| C20 executive center | **Platform identity** — strategic command |
| C21 certification | **Quality identity** — determinism, explainability, delegation |
| C22 closure + handoff | **Chapter identity** — completion ritual, ecosystem proof |

---

## 26. Architectural Principles Discovered in CH4

1. **Action-only interpretation** — Every request maps to Goal → Actions → … → Trust (C1)
2. **Read-only intelligence** — Engines observe; they do not execute
3. **Linear delegation chain** — One upstream per module; no skip-level imports
4. **Deterministic by contract** — Fixed timestamps, stable builders, repeatable tests
5. **Explainability as first-class endpoint** — Not an afterthought
6. **Scenario-driven universality** — Five scenarios prove all modules
7. **Experience as projection layer** — C18+ formats; C1–C17 compute
8. **Certification before closure** — C21 certifies; C22 closes and hands off
9. **Bootstrap modularization** — B0 separates wiring from feature code
10. **Import-lint as enforcement** — Architecture rules are machine-checked
11. **Verify script per module** — Test + build + lint gate
12. **Chain token monotonicity** — Each module adds exactly one terminal token

---

## 27. Everything That Should Become Part of the Official AN ACT Design System

| Category | Items to Preserve | Current Status |
|----------|-------------------|----------------|
| **Brand** | `an act...` brand line, `AN ACT` product name, terminal transition ritual | **Implemented** |
| **Modes** | Need Mode + Action Mode dual operating system | **Implemented** |
| **Colors** | Full semantic token tree + both theme resolutions | **Implemented** |
| **Typography** | 7-style scale including terminal | **Implemented** |
| **Motion** | 4 durations, 4 easings, reduced-motion rules | **Implemented** |
| **Components** | Buttons, inputs, cards, badges, progress, nav, live-frame, avatar, chips, timeline | **Implemented** |
| **Layouts** | 8-region anatomy, need/action/transition/modal | **Implemented** |
| **Prototypes** | 19 screen specs, 5 visual flows | **Implemented** |
| **Accessibility** | 44px touch, contrast ratios, focus ring, keyboard rules | **Implemented** |
| **Live Frame** | Unify three tier systems into one canonical model | **Partially implemented** — needs consolidation |
| **Intelligence UX** | Journey step, confidence, explanation, timeline patterns from C18–C19 | **Implemented** (API); needs pixel binding |
| **Scenario catalog** | Five canonical scenarios | **Implemented** |
| **Naming conventions** | Module/registry patterns from CH4 | **Implemented** |
| **Logo** | Not yet defined | **Concept only (not implemented)** |
| **Rendered UI layer** | CSS/React consuming DESIGN_TOKENS | **Concept only (not implemented)** |

---

## 28. Recommended Official Design System

The following decisions should be **preserved permanently** as the AN ACT Design System v1 baseline:

### Brand & Identity

- **Product name:** AN ACT (uppercase) for headlines and module naming — **Documented**
- **Brand moment:** `an act...` (lowercase, ellipsis) on every mode transition — **Implemented**
- **No separate logo required** until a mark is designed; typographic brand is canonical — **Implemented**
- **Dual-mode OS:** Need (reflect) ↔ Action (execute) — **Implemented**

### Color

- **Need Mode:** white `#FFFFFF` bg, black `#000000` text, blue `#2563EB` accent — **Implemented**
- **Action Mode:** black `#000000` bg, white `#FFFFFF` text, blue `#3B82F6` accent — **Implemented**
- **Semantic status colors** for success/warning/error/info in both modes — **Implemented**
- **Transition interpolation:** `#FFFFFF` → `#6B7280` → `#000000` — **Implemented**
- **Semantic tokens only** in components — never raw hex in specs — **Implemented**
- **Consolidate Live Frame tiers** to one canonical five-tier system with hex values — **Recommended** (currently three parallel models)

### Typography

- Inter-first stack with SF Mono for terminal — **Implemented**
- Seven-style scale: display, heading, title, body, caption, label, terminal — **Implemented**
- Terminal style reserved for transitions and brand line — **Implemented**

### Terminal & Transition

- 640ms extraSlow transition with emphasized easing — **Implemented**
- Progress bar: 4px height, pill radius, `accent.primary` fill — **Implemented**
- Five stage texts: Preparing… through Action Ready. — **Implemented**
- Reverse transition (Action → Need) defined — **Implemented**

### Components

- Button variants: primary, secondary, ghost (+ danger/success in core-ui) — **Implemented**
- Card family: base, timeline, achievement, analytics, contract, recommendation — **Implemented**
- Live Frame ring + glow spec — **Implemented**
- FAB 56×56 on Action layout — **Implemented**
- Bottom nav max 5 items, hidden during transition — **Implemented**

### Layout & Navigation

- Eight-region screen anatomy — **Implemented**
- Breakpoints: 768 regular, 1024 expanded — **Implemented**
- Max content width 1200 — **Implemented**
- Safe area insets top 44 / bottom 34 — **Implemented**

### Motion & Accessibility

- Spacing scale 4–64 — **Implemented**
- Radius scale small through circle — **Implemented**
- 44px minimum touch target — **Implemented**
- 4.5:1 contrast normal, 3:1 large — **Implemented**
- Reduced motion: disable animations, preserve opacity — **Implemented**

### Intelligence UX (from CH4)

- **Journey presentation:** 16 intelligence layers as sequential steps — **Implemented** (API)
- **Confidence pattern:** low/medium/high with rationale — **Implemented**
- **Explanation pattern:** dashboard + domain summaries — **Implemented**
- **Dashboard pattern:** health, confidence, readiness, timeline — **Implemented**
- **Certification vocabulary:** delegation, determinism, explainability — **Implemented**
- **Five scenario catalog** for all demos and tests — **Implemented**

### Architectural Identity (from CH4)

- Read-only experience layers — **Implemented**
- Linear delegation with traceable output IDs — **Implemented**
- Registry-first namespace approval — **Documented**
- Verify pipeline: test + build + import-lint — **Implemented**

### Not Yet Official (Do Not Promote Until Implemented)

- Rendered UI consuming design tokens — **Concept only (not implemented)**
- AN ACT logo asset — **Concept only (not implemented)**
- Unified Live Frame color/tier model — **Partially implemented**
- CH4 REST screens bound to pixel components — **Concept only (not implemented)**

---

*Review completed from codebase and documentation state. No source code was modified.*  
*Companion catalog: [AN-ACT-Design-System-Candidates.md](./AN-ACT-Design-System-Candidates.md)*
