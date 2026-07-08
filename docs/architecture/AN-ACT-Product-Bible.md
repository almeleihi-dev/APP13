# AN ACT — Product Bible

**Version 1.0**  
**Status:** Official master product specification  
**Scope:** Unified specification for the AN ACT platform across CH3 Runtime Experience, CH4 Action Intelligence, and CH5 AI Experience  
**Constraint:** Extracted from implemented code and existing documentation only. No source code was modified to produce this document.

---

## Status Classification Key

Every statement in this document is classified as one of:

| Label | Meaning |
|-------|---------|
| **Implemented** | Exists in executable TypeScript, verified tests, or concrete REST APIs |
| **Documented** | Described in markdown specs; may not have pixel UI |
| **Concept only** | Specified or implied; not fully wired (e.g. render layer) |
| **Recommended** | Official Product Bible guidance for future work |

---

## Table of Contents

**Part I — Vision & Philosophy (1–9)**  
**Part II — Architecture (10–14)**  
**Part III — Domain Philosophy (15–18)**  
**Part IV — Identity & Design (19–33)**  
**Part V — Engineering Rules (34–40)**  
**Part VI — Roadmap & Future (41–50)**  
**Appendices A–H**

---

# Part I — Vision & Philosophy

## 1. Executive Vision

**Classification:** **Documented** (vision); **Implemented** (platform modules)

AN ACT is a **Professional Operating System** — infrastructure to define, contract, execute, measure, and intelligently guide professional work. The platform treats **Actions** as the only tradable unit (ADR-001), binds them through **Contracts**, executes with **evidence-backed milestones**, scores **Trust** from platform events, and resolves disputes through dimensional **Complaints**.

Three completed product chapters define the modern AN ACT stack:

| Chapter | Name | Modules | Terminal artifact |
|---------|------|---------|-------------------|
| **CH3** | Runtime Experience | X1–X4 (design) + X5–X30 (runtime) + FINAL | `runtimeCertified` via CH3-FINAL |
| **CH4** | Action Intelligence | C1–C22 + B0 bootstrap | `action_intelligence_final_closure` |
| **CH5** | AI Experience | X1–X22 | `ai_experience_final_closure` |

The intelligence chain spans **44 links** from core intent through CH4 closure and all CH5 AI experience modules (see Appendix D).

AN ACT's user-facing identity is **dual-mode** (Need / Action), **terminal-bridge** (`an act...`), and **token-driven** — defined in CH3 and consumed conceptually by CH4/CH5 experience projections.

---

## 2. The Philosophy of AN ACT

**Classification:** **Implemented** (design system philosophy); **Documented** (product positioning)

Core beliefs encoded across the codebase:

1. **Everything is an Action** — work is classified, decomposed (TEKRR), contracted, and measured; never sold as an undifferentiated service listing (ADR-001).
2. **Reflect before execute** — Need Mode is planning-oriented; Action Mode is execution-oriented; an official transition bridges them.
3. **Specification before pixels** — CH3 defines tokens, components, navigation, prototypes, and runtime JSON before any render framework.
4. **Intelligence observes; it does not mutate** — CH4 and CH5 modules are read-only projection layers over upstream intelligence.
5. **Explainability is mandatory** — every intelligence and AI experience module exposes confidence and explanation endpoints.
6. **Determinism enables trust in the system** — fixed timestamps, stable builders, validator-gated outputs.
7. **Linear delegation prevents coupling** — each module knows exactly one upstream neighbor.
8. **Registry-first prevents collisions** — namespaces are approved before implementation (CH5 pattern; CH4 equivalent).

From `DESIGN_SYSTEM_PHILOSOPHY`: *"Framework-independent token definitions; semantic colors only; Need Mode and Action Mode as dual operating contexts; deterministic transitions; accessibility by default."*

---

## 3. The Problem AN ACT Solves

**Classification:** **Documented**

Traditional marketplace and gig platforms optimize for **discovery volume** and **transaction speed**. They treat work as listings, SKUs, or gigs — underspecified, rankable, and reviewable before obligations are defined.

AN ACT solves the **accountability gap**:

| Problem | AN ACT response | Status |
|---------|-----------------|--------|
| Underspecified scope | TEKRR decomposition per Action | **Implemented** (Action Engine) |
| Pre-contract reviews | Trust from contract events, not listing stars | **Documented** (Trust Engine) |
| Scope negotiated after acceptance | Contract before execution (Law 5) | **Implemented** |
| Generic disputes | Complaints bind to TEKRR dimensions on Contracts | **Documented** |
| Opaque pricing | Party-declared commercial terms; intelligence assists (C4) | **Implemented** (CH4 C4) |
| Mode confusion (plan vs do) | Need/Action dual modes with official transition | **Implemented** (CH3) |
| AI without accountability | CH5 read-only, explainable, chain-traceable projections | **Implemented** (CH5) |

---

## 4. Product Principles

**Classification:** **Implemented** (enforced in module guarantees)

| # | Principle | Enforcement |
|---|-----------|-------------|
| P1 | Actions only — no service listings as tradable units | ADR-001, Action Engine |
| P2 | Contract gates execution | Contract + Action Engine invariants |
| P3 | Trust is event-sourced | Identity / Trust Engine |
| P4 | Semantic design tokens only in UI specs | CH3 validators |
| P5 | One upstream per intelligence module | Repository pattern C2–C22, CH5-X1–X22 |
| P6 | Read-only experience layers | CH4 C18–C22, CH5 all modules |
| P7 | Authentication required on experience APIs | Route registration across chapters |
| P8 | Verify scripts gate chapter completion | `npm run verify:ch3-*`, `verify:ch4-*`, `verify:ch5-*` |
| P9 | Import-lint as architecture guard | Verify pipeline |
| P10 | Chapter handoff is explicit | C22 → CH5, CH3-FINAL → CH4 |

---

## 5. User Philosophy

**Classification:** **Implemented** (CH3 runtime + CH4/CH5 experience projections)

### Consumer journey (Need side)

**Implemented** in CH3-X5 and CH3-X12:

```
Launch → Need Home → Search → Opportunity List → Request → an act... → Action Mode
```

User intent: discover, compare professionals (Live Frame, badges, rating, distance, cost), compose a request, cross the brand transition into execution.

### Professional journey (Action side)

**Implemented** in CH3-X6:

```
Action Ready → Action Home → Contract Preview → Active Action → Progress → Completion → Return Transition → Need Mode
```

### Platform home (parallel)

**Implemented** in `src/experience/` — customer/provider home views from dashboards and trust scores. **Does not consume CH3 tokens** — **Recommended** to migrate to CH3 screen builders.

### Intelligence user (CH4 C18–C22)

**Implemented** — authenticated JSON journeys, dashboards, executive centers, certification, closure. No pixel UI.

### AI-assisted user (CH5 X1–X22)

**Implemented** — conversation, guidance, decision support, planning, execution companion, coaching, insights, recommendations, predictions, executive views, governance, accountability, conformance, oversight, closure.

---

## 6. Action Philosophy

**Classification:** **Implemented** (Action Engine + CH4 C1–C3)

An **Action** is a classified instance of professional work:

- Identified by taxonomy code (e.g. `B.2.1`)
- Decomposed via **TEKRR** (Time, Effort, Knowledge, Risk, Responsibility)
- Bound to exactly one Contract (MVP)
- Executed through milestones and evidence

CH4 intelligence ladder (**Documented** in C1, **Implemented** in chain):

```
Goal → Actions → Resources → Skills → Time → Risk → Price → Contract → Execution → Trust
```

Five canonical scenarios unify testing: `moving_a_room`, `cleaning_an_apartment`, `delivering_a_document`, `fixing_small_home_issue`, `preparing_professional_service_request` — **Implemented** across C1–C22.

---

## 7. Intelligence Philosophy

**Classification:** **Implemented** (CH4 C1–C22)

CH4 Action Intelligence transforms user goals into structured, explainable intelligence projections:

| Phase | Modules | Focus |
|-------|---------|-------|
| Core engines | C1–C17 | Ontology, planning, pricing, contract, execution, outcome, trust, decision, recommendation, insight, prediction, strategy, learning, optimization, evolution, orchestration |
| Experience | C18 | Unified journey across 16 intelligence layers |
| Dashboard | C19 | Health, confidence, readiness, timeline |
| Executive | C20 | Platform command view |
| Certification | C21 | Platform, architecture, delegation, determinism, explainability |
| Closure | C22 | Chapter completion; handoff to CH5 |

Guarantees on every module: **read-only**, **delegates-only**, **deterministic**, **explainable**.

---

## 8. AI Philosophy

**Classification:** **Implemented** (CH5 X1–X22)

CH5 treats AI experiences as **projection layers**, not execution engines:

- **Observes** upstream intelligence without modifying it
- **Transforms** upstream output into domain views (dashboards, matrices, confidence scores)
- **Explains** projections in human-readable narratives traceable to the full 44-link chain
- **Validates** completeness and traceability before surfacing results

CH5 introduces **no runtime mutations**, **no payment or contract side effects**, and **no duplicated business logic**.

Design goals from CH5 Architecture Book: Safety, Traceability, Determinism, Explainability, Maintainability, Registry integrity — all **Implemented**.

---

## 9. Runtime Philosophy

**Classification:** **Implemented** (CH3 X5–FINAL)

CH3 Runtime Experience philosophy:

1. **Specification-first** — tokens, components, navigation, prototypes before runtime screens
2. **JSON screen views** — REST APIs return structured screen payloads, not HTML
3. **Prototype compliance** — every runtime screen maps to a registered prototype ID
4. **Layout compliance** — every screen binds to need-layout, action-layout, transition-layout, or modal-layout
5. **Component compliance** — instances reference `core-ui-*` component IDs
6. **No duplication** — X12+ orchestration delegates to X5–X11; never reimplements screens
7. **Certification chain** — X16–X30 + FINAL validate readiness before CH4 handoff

From `PROTOTYPE_LIBRARY_PHILOSOPHY`: *"Master visual blueprint before runtime implementation."*

---

# Part II — Architecture

## 10. Complete Platform Architecture

**Classification:** **Implemented**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PLATFORM CORE (Engines)                                                │
│  Identity · Action · Contract · Complaint · Trust · Billing · Notify   │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────────┐
│  CH3 — RUNTIME EXPERIENCE                                               │
│  X1 Design System → X2 Core UI → X3 Navigation → X4 Prototypes         │
│  X5–X11 User Experiences → X12 Journey → X13–X30 Ops/Cert → FINAL      │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ handoff (CH3-FINAL → CH4)
┌───────────────────────────────▼─────────────────────────────────────────┐
│  CH4 — ACTION INTELLIGENCE                                              │
│  C1–C17 Engines → C18 Experience → C19 Dashboard → C20 Executive       │
│  → C21 Certification → C22 Closure                                       │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ handoff (C22 → CH5-X1)
┌───────────────────────────────▼─────────────────────────────────────────┐
│  CH5 — AI EXPERIENCE                                                    │
│  X1 Foundation → X2 Conversation → … → X21 Oversight → X22 Closure      │
└─────────────────────────────────────────────────────────────────────────┘
```

Bootstrap entry: `src/bootstrap/bootstrap.ts` wires platform, engines, experiences, intelligence, living, runtime, financial, security.

Parallel tracks (not in linear chain):

- **Living Professional OS** — `src/bootstrap/living.ts`, `src/living-experience/` — **Implemented**, separate chapter context
- **Legacy UI** — `src/ui/pages/` — **Implemented**, does not consume CH3 tokens
- **Platform home** — `src/experience/` — **Implemented**, separate from CH3 runtime bootstrap

---

## 11. Complete Intelligence Architecture

**Classification:** **Implemented**

44-link chain (Appendix D). Structural layers:

| Layer | Links | Tokens (terminal per module) |
|-------|-------|------------------------------|
| Core intelligence | 1–17 | `intent` … `orchestration_intelligence` |
| CH4 experience & closure | 18–22 | `action_intelligence_experience` … `action_intelligence_final_closure` |
| CH5 AI experience | 23–44 | `ai_experience_foundation` … `ai_experience_final_closure` |

Each link appends one terminal token. Module chain length = position in full chain.

Query parameters (recurring): `scenario_id`, `canonical_action_id`, `urgency`, `distance_band`, `intent` — **Implemented** on CH4/CH5 routes.

Standard endpoints (recurring): home, confidence (where applicable), explanation, summary, validate — **Implemented**.

---

## 12. Runtime Architecture

**Classification:** **Implemented**

### Layer pattern (X5–X11)

```
domain/          — screen IDs, state, actions, layout bindings
application/     — service, navigation, transition engine
presentation/    — screen builders → JSON views
infrastructure/  — demo repositories
validation/      — compliance validators
module.ts        — public factory
```

### Screen builder contract

**Implemented** in `buildRuntimeScreenView`:

```
screenId + prototypeId + route + mode + layoutId
+ designTokens + typography + spacing + regions
+ sections[{ components: RuntimeComponentInstance[] }]
+ navigation + accessibility + generatedAt
```

### Orchestration layers (X12–FINAL)

| Module | Role |
|--------|------|
| X12 Journey | Connects X5–X11 into one deterministic flow |
| X13 State | Session and lifecycle state engine |
| X14 Registry | Experience catalog |
| X15 Coordinator | Cross-experience coordination |
| X16 Health | Diagnostics |
| X17 Demo | Demo mode |
| X18 Preview | Preview engine |
| X19 Launcher | MVP readiness, launch modes |
| X20–X30 | Release, operations, executive, readiness, certification, approval, launch authority |
| FINAL | Chapter 3 completion certification |

---

## 13. Action Intelligence Architecture

**Classification:** **Implemented**

Clean Architecture per module:

```
domain/          — schema, context, screen builders
application/     — bridge, builders, validator, service
infrastructure/  — repository (sole upstream call: buildOutputForValidation())
module.ts
```

C1 entry: `/action-intelligence` — no upstream.  
C22 terminal: `/action-intelligence-final-closure` — upstream C21, handoff to CH5-X1.

Intellectual model (**Documented** C1): Goal → Actions → Resources → Skills → Time → Risk → Price → Contract → Execution → Trust.

Experience projection (C18): 16 journey steps, per-layer screens, `/journey`, `/explanation` — **Implemented**.

---

## 14. AI Experience Architecture

**Classification:** **Implemented**

CH5 extends CH4 closure with 22 sequential AI experience modules. Each module:

- Bootstrap key in `IntelligenceDependencies` (`src/bootstrap/dependencies.ts`)
- Route file in `src/api/routes/`
- Fixed timestamp constant for deterministic `generatedAt`
- Chain token and chain length metadata
- Sole upstream via repository `buildOutputForValidation()`

Phases (**Documented** in CH5 Architecture Book):

| Phase | Modules | Focus |
|-------|---------|-------|
| Foundation | X1–X2 | Handoff, conversation |
| Guidance & Planning | X3–X5 | Guidance, decision support, planning |
| Execution & Progress | X6–X8 | Companion, progress, coaching |
| Intelligence Generation | X9–X11 | Insights, recommendations, predictions |
| Executive & Orchestration | X12–X14 | Executive, orchestration, decision |
| Strategic & Forecast | X15–X17 | Strategy, forecast, advisory |
| Governance & Assurance | X18–X21 | Governance, accountability, conformance, oversight |
| Closure | X22 | Final certification |

Full registry: Appendix C and [CH5 AI Experience Registry](./CH5-AI-Experience-Registry.md).

---

# Part III — Domain Philosophy

## 15. Marketplace Philosophy

**Classification:** **Documented** (constitutional); **Implemented** (CH3 Need opportunity list as discovery UX)

### Constitutional position (ADR-001)

- **No service listings, gigs, or SKUs** as tradable units — **Documented**
- Customers initiate **Actions**, not shopping-cart checkouts — **Documented**
- Platform neutrality — no engine sets commercial price — **Documented**

### CH3 marketplace presentation

**Implemented** — Need Experience "Opportunity List" (`/need/opportunities`):

- Not a SKU catalog — matched professionals for a Need context
- Cards show: Live Frame tier, rating, distance, availability, estimated time, estimated cost (SAR), professional badges
- Demo data in `need-repository.ts`

**Parallel legacy UI:** `src/ui/pages/marketplace-search.ts`, `marketplace-results.ts` — **Implemented** but **does not import CH3 design system**. **Recommended:** retire or migrate.

There is **no separate "Offer Experience" module** — provider-side presentation flows through Action Experience (X6).

---

## 16. Trust Philosophy

**Classification:** **Implemented** (Trust Engine + CH4 C8 + badges)

- Trust scores derive from **verified platform events** on bound obligations — **Documented** (Trust Engine, ADR-003)
- No anonymous listing reviews — **Documented** (Law 15)
- Structured post-Action evaluation — **Documented**
- Trust intelligence layer (C8) projects trust signals into the intelligence chain — **Implemented**
- UI trust expression in CH3: `core-ui-badge` (verified, licensed, certified, government, elite) + `core-ui-live-frame` — **Implemented**
- Trust domain Live Frame (`src/trust/domain/live-frame.ts`) classifies providers by score — **Implemented**, parallel to CH3 UI tiers

Complaints bind to contracts and TEKRR dimensions — **Documented** (ADR-002, Complaint Engine).

---

## 17. Live Frame Philosophy

**Classification:** **Implemented** (multiple parallel systems — see §18)

Live Frame is AN ACT's **professional identity ring** — a visual trust and presence indicator surrounding a provider avatar or card.

Design intent (**Documented** CH3-X2):

- Tier-based accent ring on elevated surface
- Requires accessible label (`ariaRole: img`, `requiresLabel: true`)
- Appears on opportunity cards, profile contexts, avatar overlay

Philosophical role: communicate **professional standing at a glance** without star-rating marketplace semantics.

---

## 18. Unified Live Frame Specification

**Classification:** Analysis of **Implemented** systems; **Recommended** unified spec

### 18.1 Current implementations

#### A. CH3 Design System / Core UI

**Path:** `src/design-system/core-ui/components/live-frame.ts`  
**Status:** **Implemented**

| Tier | Accent token |
|------|--------------|
| bronze | status.warning |
| silver | border.subtle |
| gold | status.warning |
| platinum | accent.highlight |
| diamond | accent.primary |

Component ID: `core-ui-live-frame`. Ring: strokeWidth 2, radius circle, elevation medium.

#### B. CH3-X1 component spec

**Path:** `src/design-system/components/live-frame.ts`  
**Status:** **Implemented**

Single default spec (`live-frame`) — ring glow `accent.highlight`. No tier variants at X1 level.

#### C. Trust domain classification

**Path:** `src/trust/domain/live-frame.ts`  
**Status:** **Implemented**

| Tier | Score threshold | Color key | Label | Risk level |
|------|-----------------|-----------|-------|------------|
| PLATINUM_ELITE | ≥95 | platinum_gold | Platinum Elite | minimal |
| EMERALD_PRO | ≥85 | emerald | Emerald Pro | low |
| TRUSTED | ≥70 | blue | Trusted | moderate |
| STANDARD | ≥50 | gray | Standard | elevated |
| WATCHLIST | <50 | red | Watchlist | high |

Used by trust scoring API and legacy UI pages.

#### D. Need Experience demo data

**Path:** `src/runtime-experience/need/infrastructure/need-repository.ts`  
**Status:** **Implemented**

`NeedOpportunity.liveFrameTier`: `bronze | silver | gold | platinum` — no `diamond` in demo type.

### 18.2 Differences

| Dimension | CH3 UI tiers | Trust domain tiers | Demo data |
|-----------|--------------|---------------------|-----------|
| Count | 5 | 5 | 4 |
| Naming | lowercase metals | SCREAMING_SNAKE | lowercase metals |
| Score mapping | none | 0–100 thresholds | static assignment |
| Color model | semantic tokens | named colors (platinum_gold, emerald…) | inherits CH3 UI |
| Risk level | not modeled | minimal → high | not modeled |
| Used by runtime JSON | yes | no (direct) | yes |

### 18.3 Recommended official implementation

**Classification:** **Recommended**

Establish **`AN_ACT_LIVE_FRAME_REGISTRY`** as single source of truth:

```
trustScore (0–100)
    ↓ classify
TrustTier (PLATINUM_ELITE … WATCHLIST)     ← authoritative for business logic
    ↓ map
UiTier (diamond … bronze)                  ← authoritative for CH3 rendering
    ↓ resolve
SemanticTokens (accent.primary, etc.)      ← authoritative for pixels
```

**Proposed mapping (Recommended — not yet Implemented):**

| Trust tier | Score | UI tier | Accent token | Badge hint |
|------------|-------|---------|--------------|------------|
| PLATINUM_ELITE | ≥95 | diamond | accent.primary | elite |
| EMERALD_PRO | ≥85 | platinum | accent.highlight | certified |
| TRUSTED | ≥70 | gold | status.warning | verified |
| STANDARD | ≥50 | silver | border.subtle | licensed |
| WATCHLIST | <50 | bronze | status.error | — |

**Implementation rules (Recommended):**

1. Trust Engine remains authoritative for score → trust tier
2. CH3 `core-ui-live-frame` remains authoritative for UI rendering
3. New adapter: `resolveLiveFramePresentation(trustScore) → { uiTier, tokens, label, riskLevel }`
4. Runtime JSON uses UI tier in component props; trust metadata in parallel field
5. Deprecate direct demo tier assignment — derive from score in repositories

Until adapter exists, treat **CH3 UI tiers for presentation** and **Trust domain tiers for business logic** as parallel — **Implemented** current state.

---

# Part IV — Identity & Design

## 19. Product Identity

**Classification:** **Implemented** (typographic + dual-mode); **Concept only** (logo asset)

| Element | Expression | Status |
|---------|------------|--------|
| Product name | AN ACT | **Documented** |
| Brand moment | `an act...` (lowercase, ellipsis) | **Implemented** |
| Operating modes | Need Mode / Action Mode | **Implemented** |
| Primary accent | Blue (#2563EB Need / #3B82F6 Action) | **Implemented** |
| Transition ritual | Terminal screen, 640ms, 5 stages | **Implemented** |
| Component prefix | `core-ui-*` | **Implemented** |
| Schema versions | `*-v1` suffix pattern | **Implemented** |
| Logo / wordmark file | — | **Concept only** |

---

## 20. Brand Identity

**Classification:** **Implemented** (specs); **Concept only** (marketing assets)

- **Voice:** Understated, terminal-influenced at transition moments; professional elsewhere
- **Brand line:** `an act...` — never "AN ACT" on transition screens
- **Mode naming:** "Need Mode" (reflective), "Action Mode" (executive)
- **No emoji or playful microcopy** in official transition stages — **Implemented** stage texts are procedural
- **APP13 platform favicon** (`#1f4fd6`, white "13") — platform identifier, **not** AN ACT brand mark — **Implemented**

---

## 21. Visual Language

**Classification:** **Implemented**

| Principle | Need Mode | Action Mode |
|-----------|-----------|-------------|
| Background | White (#FFFFFF) | Black (#000000) |
| Typography | Black on light | White on dark |
| Surfaces | Subtle gray elevation | Dark gray elevation |
| Accent | Blue interactive | Blue highlight |
| Mood | Reflective, planning | Executive, execution |
| Transition | White → gray → black (forward) | Black → gray → white (reverse) |

Semantic tokens only in component specs — **Implemented** (`DESIGN_SYSTEM_PHILOSOPHY`).

---

## 22. Official Color System

**Classification:** **Implemented** — full tables in [CH3 Design System Registry §2](./AN-ACT-CH3-Design-System-Registry.md)

Summary:

- **Need Mode primary accent:** `#2563EB`
- **Action Mode primary accent:** `#3B82F6`
- **Status success:** `#059669` (Need) / `#34D399` (Action)
- **Status error:** `#DC2626` (Need) / `#F87171` (Action)
- **Transition mid:** `#6B7280` (both modes)

Resolve via `resolveSemanticColor(tokens, path)` — **Implemented**.

---

## 23. Typography System

**Classification:** **Implemented**

| Style | Size | Weight | Use |
|-------|------|--------|-----|
| display | 40 | 700 | Hero |
| heading | 28 | 600 | Screen headers |
| title | 20 | 600 | Section titles |
| body | 16 | 400 | Primary text |
| caption | 13 | 400 | Secondary text |
| label | 12 | 500 uppercase | Badges, metadata |
| terminal | 18 | 400 monospace | `an act...` transition |

Fonts: Inter (sans/display), SF Mono (terminal) — **Implemented**.

---

## 24. Button System

**Classification:** **Implemented**

| Variant | Background | Text | minHeight |
|---------|------------|------|-----------|
| primary | interactive.default | text.inverse | 48px |
| secondary | surface.primary | text.primary | 48px |
| ghost | background.primary | accent.primary | 44px |
| danger | status.error | text.inverse | 48px |
| success | status.success | text.inverse | 48px |
| disabled | interactive.disabled | text.disabled | 48px |

Component ID: `core-ui-button`. Motion: fast (120ms). Radius: medium — **Implemented**.

---

## 25. Card System

**Classification:** **Implemented**

| Component | Variants | Use |
|-----------|----------|-----|
| core-ui-card | standard, elevated | General content, opportunity cards |
| core-ui-timeline-card | — | Timeline entries |
| core-ui-achievement-card | — | Achievements |
| core-ui-analytics-card | — | Metrics |
| core-ui-contract-card | — | Contract summary |
| core-ui-recommendation-card | — | Recommendations |

Opportunity cards nest Live Frame + badges — **Implemented** in `opportunity-list.ts`.

---

## 26. Navigation System

**Classification:** **Implemented**

- **8-region screen anatomy** — safeArea through transitionLayer
- **Layouts:** need-layout, action-layout, transition-layout, modal-layout
- **Patterns:** top nav, bottom nav (Need tabs: Home, Search, Timeline, Profile), side nav (expanded ≥1024px), stack, modal/sheet/dialog
- **Breakpoints:** compact 0, regular 768, expanded 1024 (max content 1200px)
- **Transition:** hides bottom nav, blocks interaction — **Implemented**

Version: `an-act-navigation-framework-v1`.

---

## 27. Motion System

**Classification:** **Implemented**

| Token | Duration | Typical use |
|-------|----------|-------------|
| fast | 120ms | Buttons, inputs |
| normal | 240ms | Standard transitions |
| slow | 400ms | Live Frame hover |
| extraSlow | 640ms | Official mode transition |

Easing: standard, decelerate, accelerate, emphasized (cubic-bezier) — **Implemented**.

Reduced motion: disable animations, preserve opacity, 0ms fallback — **Implemented** (`ACCESSIBILITY_SPEC`).

---

## 28. Dashboard System

**Classification:** **Implemented** (JSON projections)

Three dashboard families:

| Family | Chapter | Examples |
|--------|---------|----------|
| User runtime ops | CH3 X16–X30, FINAL | Health, operations, executive, readiness, certification, completion |
| Intelligence | CH4 C19–C20 | Intelligence dashboard, executive intelligence center |
| AI experience | CH5 X12, X17, X21 | Executive intelligence, advisory, operational oversight |

All return authenticated REST JSON — no shared pixel dashboard framework — **Implemented** pattern, **Concept only** unified dashboard UI.

Platform home dashboard (`HomeExperienceService`) — separate track — **Implemented**.

---

## 29. Screen Composition Rules

**Classification:** **Implemented**

1. Every screen selects a **layoutId** from navigation framework
2. Every screen maps to a **prototypeId** from prototype registry
3. Content is organized in **sections** with labeled purposes
4. Each section contains **RuntimeComponentInstance** entries referencing `core-ui-*` IDs
5. **designTokens** array on screen must match prototype token list
6. **accessibility** block required: touch target, keyboard, screen reader, reduced motion
7. **navigation** block required: pattern, back availability, bottom nav visibility
8. Transition screens use **transition-layout** and **core-ui-loading** only
9. Modal content uses **modal-layout** with focus trap rules
10. Validators reject screens missing prototype or token compliance — **Implemented**

---

## 30. Runtime JSON Philosophy

**Classification:** **Implemented**

Runtime JSON is the **contract between backend experience modules and future client renderers**:

- **Server authoritative** — screen structure defined by presentation builders
- **Component instances, not HTML** — clients map `componentId` + `variant` + `props` to native widgets
- **Token paths, not hex in payloads** — clients resolve tokens via `DESIGN_TOKENS` or cached theme
- **Prototype linkage** — `prototypeId` enables design QA against X4 specs
- **Deterministic demo** — in-memory repositories; `generatedAt` timestamps on views
- **No inline styles in JSON** — spacing/typography referenced by token names

Example flow: `GET /need-experience` → service → `buildRuntimeScreenView` → JSON — **Implemented**.

---

## 31. Prototype Library

**Classification:** **Implemented**

- **18 screen prototypes**, **9 visual flows**
- Categories: need, action, shared, transition
- Each prototype specifies: layoutId, route, mode, componentsUsed, typography, spacing, motion, responsive columns
- Registry API: `getPrototypeCatalog()`, `getFlowCatalog()`, `getNavigationMap()` — **Implemented**

See [CH3 Design System Registry §8](./AN-ACT-CH3-Design-System-Registry.md).

---

## 32. Design Tokens

**Classification:** **Implemented**

Aggregate: `DESIGN_TOKENS` in `src/design-system/tokens/design-tokens.ts`

Groups: colors (semantic + themes), typography, spacing, radius, elevation, shadows, motion, icons, transitions, components.

Version: `an-act-design-system-v1`.

Access: `getDesignTokens()`, `validateDesignSystem()` — **Implemented**.

---

## 33. Component Architecture

**Classification:** **Implemented**

Two-tier model:

| Tier | Module | Count | Role |
|------|--------|-------|------|
| X1 specs | `src/design-system/components/` | 10 groups | Dimensional specs (height, padding, token refs) |
| X2 registry | `src/design-system/core-ui/` | 22 components | Full definitions: variants, states, a11y, responsive |

Every X2 component defines: id, name, purpose, category, variants, visualStates, interactionStates, accessibility, designTokens, spacing, typography, radius, elevation, motion, responsive.

Validator: `validateAllCoreUiComponents()` — **Implemented**.

Naming: `core-ui-{name}` for runtime references; X1 specs use `{category}-{variant}` pattern.

---

# Part V — Engineering Rules

## 34. Registry Philosophy

**Classification:** **Implemented** (CH5 formalized; CH3/CH4 equivalent patterns)

- Every module occupies an approved **namespace** before implementation
- Namespace dimensions: path, bootstrap key, service name, schema version, route base, chain token
- Registries are **collision-free** — verified by tests and import-lint
- CH3 runtime registry (X14): catalogs X5–X11 experiences — **Implemented**
- CH3 completion registry: 26 modules X5–X30 — **Implemented**
- CH5 registry: 22 modules with full namespace table — **Implemented** ([CH5 Registry](./CH5-AI-Experience-Registry.md))

---

## 35. Namespace Rules

**Classification:** **Implemented**

| Dimension | Convention | Example |
|-----------|------------|---------|
| Path | kebab-case directory | `ai-conversation-experience` |
| Bootstrap key | camelCase | `aiConversationExperience` |
| Schema | kebab-case + `-v1` | `ai-conversation-experience-v1` |
| Route base | kebab-case prefix | `/ai-conversation-experience` |
| Chain token | snake_case | `ai_conversation_experience` |
| Core UI component | `core-ui-{name}` | `core-ui-button` |
| Prototype | `prototype-{name}` | `prototype-need-home` |
| Screen ID | kebab-case | `need-home` |

No two modules may share any namespace dimension — **Implemented** (CH5 verification).

---

## 36. Delegation Rules

**Classification:** **Implemented**

1. Each module has **exactly one upstream** (except chain entrypoints)
2. Repositories call only `buildOutputForValidation()` on upstream — no service bypass
3. No importing non-adjacent modules in infrastructure layer
4. Business logic lives upstream; experience modules **project** only
5. CH3 orchestration delegates to experience services — never duplicates screen builders
6. Violation = architecture failure in verify scripts — **Implemented**

---

## 37. Clean Architecture Rules

**Classification:** **Implemented**

```
domain/          — pure types, schemas, builders; no outward deps
application/     — services, orchestration; depends on domain
infrastructure/  — repositories, external calls; depends on application + domain
presentation/    — screen builders (CH3/CH4/CH5 experience modules)
module.ts        — composition root
```

Dependencies flow **inward**. Domain never imports application or infrastructure — **Implemented** across chapters.

---

## 38. Explainability Rules

**Classification:** **Implemented**

- Every CH4/CH5 module exposes `/explanation` (or equivalent narrative endpoint)
- Confidence levels: `low`, `medium`, `high` — recurring enum
- Explanations must trace to upstream `outputId` and chain position
- CH5 modules re-score confidence from upstream — never copy blindly
- Delegation checks document sole-upstream compliance — **Implemented**
- AI outputs labeled read-only — **Implemented**

---

## 39. Deterministic Rules

**Classification:** **Implemented**

- Every module defines `FIXED_TIMESTAMP` for `generatedAt` fields
- Identical inputs → identical outputs across invocations
- Five canonical scenarios for intelligence testing — **Implemented**
- Validators produce stable pass/fail — **Implemented**
- No random IDs in certification outputs — **Implemented**
- Demo repositories use fixed seed data — **Implemented** (Need/Action)

---

## 40. Extension Rules

**Classification:** **Documented** (CH5 guidelines); **Recommended** (platform-wide)

1. **Register before implement** — namespace collision analysis first
2. **Append chain token** — never insert mid-chain without migration plan
3. **One upstream only** — no fan-in at experience layer
4. **Add verify script** — `npm run verify:ch{N}-x{M}` required
5. **Preserve read-only** — experience layers do not mutate engines
6. **Consume CH3 for UI** — new screens must use tokens, core-ui, navigation, prototypes
7. **Handoff explicit** — terminal modules declare next chapter number
8. **Import-lint clean** — verify pipeline includes dependency cruiser

---

# Part VI — Roadmap & Future

## 41. Product Roadmap

**Classification:** **Documented** (`docs/APP13-Roadmap-v1.md`); chapter completion **Implemented**

| Phase | Focus | Status in repo |
|-------|-------|----------------|
| Platform core | Identity, Action, Contract, Complaint engines | **Implemented** |
| CH3 | Runtime experience + design system + certification | **Implemented** (X1–FINAL) |
| CH4 | Action intelligence chain + closure | **Implemented** (C1–C22) |
| CH5 | AI experience chain + closure | **Implemented** (X1–X22) |
| Render layer | Client frameworks consuming Runtime JSON | **Concept only** |
| Living Professional OS | `living-experience/` modules | **Implemented** (parallel track) |

Strategic roadmap reference: six phases P1 MVP through P6 AI in `APP13-Roadmap-v1.md` — **Documented**.

---

## 42. MVP Definition

**Classification:** **Implemented** (CH3-X19 launcher); **Documented** (`APP13-MVP-Scope-v1.md`)

### CH3 MVP readiness (Runtime Launcher X19)

**Implemented** — launch modes: Development, Preview, Demo, MVP Readiness, Handoff, Production Candidate.

Launcher verifies: X5–X18 experiences, health, demo, preview, coordinator, registry, state, journey. Produces readiness percentage, checklist, blockers — **Implemented**.

### Platform MVP (constitutional)

From ADR-001 and MVP Scope — **Documented**:

- Action-initiated flows only
- 1:1 Action–Contract
- TEKRR gate before contract generation
- No service listings / gigs / SKUs
- Provider profiles show trust summary, not service menu
- Party-declared pricing only

### CH3 consumer MVP path

**Implemented** demo flow:

```
Need Home → Search → Opportunities → Request → Transition → Action Home → … → Profile → Return
```

---

## 43. Phase 2 Vision

**Classification:** **Documented** (Roadmap, MVP Scope); **Recommended** (Product Bible synthesis)

- **Render layer MVP** — one reference client (React or React Native) consuming Runtime JSON + DESIGN_TOKENS
- **Unified Live Frame adapter** — trust score → UI tier mapping (§18.3)
- **Platform home migration** — `HomeExperienceService` → CH3 screen builders
- **Legacy UI retirement** — migrate or isolate `src/ui/pages/`
- **Provider discovery without listings** — Action-type browse, not SKU catalog (ADR-001 compliant)
- **Client trust score** — deferred in Trust Engine reviews — **Documented** as Phase 2
- **Collusion detection baseline** — **Documented** in trust reviews

---

## 44. Phase 3 Vision

**Classification:** **Documented** / **Recommended**

- **Multi-client parity** — Flutter, SwiftUI, Android Jetpack Compose adapters sharing token package
- **Living Professional OS integration** — unify living-experience modules with CH3 runtime journey
- **Real persistence** — replace in-memory Need/Action repositories with engine-backed data
- **Bubble or no-code handoff** — CH3 docs explicitly defer Bubble; Phase 3 evaluates render strategy
- **Advanced AI execution** — CH5 remains read-only; execution stays in Action/Contract engines
- **Internationalization** — SAR costs in demo data suggest locale expansion — **Concept only**

---

## 45. Future Render Layer

**Classification:** **Concept only** (no render adapter exists); **Recommended** consumption pattern

### Architecture

```
DESIGN_TOKENS (JSON export)
       +
Runtime JSON (GET /need-experience, etc.)
       ↓
Client Token Resolver  →  resolved colors, spacing, typography
       +
Client Component Registry  →  maps core-ui-* to native widgets
       ↓
Native Screen Renderer
```

### Shared consumption steps (all platforms)

1. **Fetch or bundle tokens** — `getDesignTokens()` exported as JSON at build time
2. **Resolve semantic paths** — `background.primary` → `#FFFFFF` (Need) or `#000000` (Action) based on current mode
3. **Fetch runtime screen** — authenticated GET to experience endpoint
4. **Validate shape** — screenId, prototypeId, layoutId, sections[], navigation, accessibility
5. **Render regions** — map 8-region layout to platform layout containers
6. **Render sections** — iterate `RuntimeComponentInstance[]`
7. **Dispatch by componentId** — lookup in platform component registry
8. **Apply variant + props** — e.g. `core-ui-button` variant `primary`
9. **Honor accessibility** — labels, roles, minimum 44px touch targets
10. **Handle transitions** — `core-ui-loading` with stage text animation; respect `reducedMotion`

### React / React Native

**Recommended:**

- Package: `@an-act/tokens` — JSON + `resolveSemanticColor(mode, path)` TypeScript port
- Package: `@an-act/runtime-ui` — component registry mapping `core-ui-*` to React components
- Hook: `useRuntimeScreen(endpoint)` — fetch + cache
- Mode context: `AnActModeProvider` — Need/Action/Transition
- Transition: CSS/React Native Animated interpolating `transition.start/mid/end` over 640ms

### Flutter

**Recommended:**

- `an_act_tokens` dart package — const maps from exported JSON
- `AnActThemeExtension` — ThemeExtension with semantic color resolver
- Widget registry: `Map<String, Widget Function(ComponentInstance)>` 
- `RuntimeScreenWidget` — Column/CustomScrollView driven by sections
- Transition: `AnimationController(duration: 640ms)` + `OFFICIAL_TRANSITION_SCREEN.stageTexts`

### SwiftUI (iOS)

**Recommended:**

- Token struct code-generated from JSON
- `@Environment(\.anActMode)` for Need/Action
- `RuntimeScreenView` — LazyVStack of section views
- Component factory: `func view(for instance: RuntimeComponentInstance) -> AnyView`
- Transition: `TimelineView` or phased `withAnimation(.easeInOut(duration: 0.64))`
- SF Mono for terminal brand line (matches spec)

### Android (Jetpack Compose)

**Recommended:**

- Token object from JSON assets in `res/raw/design_tokens.json`
- `AnActTheme` Composable with semantic color lambda
- `RuntimeScreen()` — LazyColumn of sections
- Component registry: `coreUiComponents: Map<String, @Composable (Props) -> Unit>`
- Transition: `Animatable` for background interpolation; `LinearProgressIndicator` 4dp pill

### Cross-platform rules

- **Never hardcode hex** in clients — always resolve from tokens + mode
- **Prototype ID** displayed in dev builds for design QA
- **Layout breakpoints** match CH3: 768, 1024
- **Single transition engine** — same 5 stage texts, same 640ms duration on all platforms

---

## 46. Future AI Evolution

**Classification:** **Documented** (CH5 closure); **Recommended** (forward path)

**Implemented today:**

- 44-link traceable AI experience chain
- Governance (X18), accountability ledger (X19), conformance (X20), oversight (X21), closure (X22)

**Recommended evolution:**

1. **Live inference integration** — wire CH5 projection builders to LLM outputs while preserving read-only boundary
2. **Streaming explanation endpoints** — SSE for `/explanation` narratives
3. **Human-in-the-loop gates** — AI suggests; Action/Contract engines execute
4. **Feedback loop to C14 Learning** — structured outcome signals, not raw chat logs
5. **On-device models** — companion features (X6, X8) for offline coaching — **Concept only**
6. **Regulatory audit pack** — export X19 ledger + X20 conformance for compliance — **Recommended**

CH5 terminal token `ai_experience_final_closure` marks experience-layer completion — not AI model completion — **Implemented**.

---

## 47. Product Governance

**Classification:** **Documented** / **Recommended**

| Mechanism | Role | Status |
|-----------|------|--------|
| Core Principles v1 (25 laws) | Constitutional product rules | **Documented** |
| ADR process | Architectural decisions | **Implemented** (3 ADRs) |
| Approval Addendum v1.1 | Positioning authority | **Documented** |
| Chapter verify scripts | Module quality gates | **Implemented** |
| CH3-FINAL certification | Runtime chapter sign-off | **Implemented** |
| C21 certification | Intelligence platform sign-off | **Implemented** |
| CH5 X18–X21 | AI governance, accountability, conformance | **Implemented** |
| Product Bible v1.0 | Master spec (this document) | **Documented** |

**Recommended:** Product Council checklist before any chapter N+1 — verify handoff token, registry collision scan, identity compliance review.

---

## 48. Architectural Governance

**Classification:** **Implemented**

| Guard | Tool / artifact |
|-------|-----------------|
| Module verification | `npm run verify:ch3-*`, `verify:ch4-*`, `verify:ch5-*` |
| Import boundaries | dependency-cruiser in verify pipelines |
| Type safety | TypeScript strict build |
| Namespace registry | CH5 registry; CH3 completion registry; CH4 module docs |
| Bootstrap composition | `src/bootstrap/bootstrap.ts` — single wiring point |
| Test concurrency | `--test-concurrency=1` on chapter tests |
| Read-only enforcement | Service layer patterns + validators |

**Recommended:** Pre-commit hook running import-lint on touched modules — **Concept only** (not verified as hook).

---

## 49. Final Product Principles

1. **Actions, not listings** — constitutional
2. **Need before Action** — dual-mode UX
3. **Specification before pixels** — CH3 first
4. **Intelligence observes** — CH4/CH5 read-only
5. **Explain everything** — confidence + explanation on all experience modules
6. **Deterministic by default** — fixed timestamps, stable builders
7. **One upstream** — linear delegation chains
8. **Tokens are law** — semantic design system for all UI
9. **Certify chapters** — explicit handoffs (CH3-FINAL, C22, X22)
10. **Registry before code** — namespace collision prevention

---

## 50. Final Conclusion

AN ACT is a **three-chapter product stack** built on a **four-engine platform core**:

- **CH3** defines *how the product looks, navigates, and presents runtime screens* — specification-first, JSON-driven, dual-mode, terminal-bridge identity
- **CH4** defines *how action intelligence is computed, journeyed, dashboarded, certified, and closed*
- **CH5** defines *how AI experiences project that intelligence explainably to users and operators*

The platform's constitutional center is the **Action** — decomposed, contracted, executed, trusted, and intelligently guided. Visual identity lives in CH3. Intellectual identity lives in CH4. AI presentation identity lives in CH5.

What remains for full product delivery is not more specification — it is **consumption**: render adapters, Live Frame unification, legacy UI migration, and engine-backed persistence. The Product Bible v1.0 records what exists today and recommends how to preserve AN ACT identity through that delivery.

---

# Appendices

## Appendix A — Complete CH3 Registry

**Classification:** **Implemented** — source: `CH3_RUNTIME_MODULE_REGISTRY`, design modules X1–X4

### Design foundation

| Code | Name | Path | Verify |
|------|------|------|--------|
| X1 | Design System | `src/design-system/` | verify:ch3-x1 |
| X2 | Core UI Components | `src/design-system/core-ui/` | verify:ch3-x2 |
| X3 | Navigation Framework | `src/navigation-framework/` | verify:ch3-x3 |
| X4 | Visual Prototype Library | `src/prototype-library/` | verify:ch3-x4 |

### Runtime modules (X5–X30)

| Code | ID | Route prefix | Endpoints |
|------|-----|--------------|-----------|
| X5 | need | /need-experience | 12 |
| X6 | action | /action-experience | 16 |
| X7 | contract | /contract-experience | 9 |
| X8 | chat | /chat-experience | 10 |
| X9 | timeline | /timeline-experience | 8 |
| X10 | notification | /notification-experience | 8 |
| X11 | profile | /profile-experience | 10 |
| X12 | runtime-journey | /runtime-journey | 11 |
| X13 | runtime-state | /runtime-state | 11 |
| X14 | runtime-registry | /runtime-registry | 9 |
| X15 | runtime-coordinator | /runtime-coordinator | 10 |
| X16 | runtime-health | /runtime-health | 6 |
| X17 | runtime-demo | /runtime-demo | 13 |
| X18 | runtime-preview | /runtime-preview | 7 |
| X19 | runtime-launcher | /runtime-launcher | 9 |
| X20 | runtime-release | /runtime-release | 9 |
| X21 | runtime-operations | /runtime-operations | 8 |
| X22 | runtime-executive | /runtime-executive | 8 |
| X23 | runtime-readiness | /runtime-readiness | 8 |
| X24 | runtime-certification | /runtime-certification | 8 |
| X25 | runtime-final-readiness | /runtime-final-readiness | 8 |
| X26 | runtime-production-approval | /runtime-production-approval | 8 |
| X27 | runtime-operations-center | /runtime-operations-center | 8 |
| X28 | runtime-launch-control | /runtime-launch-control | 8 |
| X29 | runtime-launch-readiness-authority | /runtime-launch-readiness-authority | 8 |
| X30 | runtime-executive-launch-authority | /runtime-executive-launch-authority | 8 |

### Terminal

| Code | ID | Route prefix |
|------|-----|--------------|
| FINAL | runtime-completion | /runtime-completion |

Full detail: [CH3 Experience Identity Review §2](./AN-ACT-CH3-Experience-Identity-Review.md), [CH3 Design System Registry](./AN-ACT-CH3-Design-System-Registry.md).

---

## Appendix B — Complete CH4 Registry

**Classification:** **Implemented**

| ID | Name | Route base | Upstream | Terminal token |
|----|------|------------|----------|----------------|
| B0 | Architecture Stabilization | — (bootstrap) | — | — |
| C1 | Unified Action Intelligence Engine | /action-intelligence | — | trust |
| C2 | Action Ontology Engine | /action-ontology | C1 | trust_signals |
| C3 | Action Planning Engine | /action-planning | C2 | completion_criteria |
| C4 | Dynamic Action Pricing Intelligence | /dynamic-pricing | C3 | execution |
| C5 | Contract Intelligence Engine | /contract-intelligence | C4 | execution |
| C6 | Execution Intelligence Engine | /execution-intelligence | C5 | execution_intelligence |
| C7 | Outcome Intelligence Engine | /outcome-intelligence | C6 | outcome_intelligence |
| C8 | Trust Intelligence Engine | /trust-intelligence | C7 | trust_intelligence |
| C9 | Decision Intelligence Engine | /decision-intelligence | C8 | decision_intelligence |
| C10 | Recommendation Intelligence Engine | /recommendation-intelligence | C9 | recommendation_intelligence |
| C11 | Insight Intelligence Engine | /insight-intelligence | C10 | insight_intelligence |
| C12 | Prediction Intelligence Engine | /prediction-intelligence | C11 | prediction_intelligence |
| C13 | Strategy Intelligence Engine | /strategy-intelligence | C12 | strategy_intelligence |
| C14 | Learning Intelligence Engine | /learning-intelligence | C13 | learning_intelligence |
| C15 | Optimization Intelligence Engine | /optimization-intelligence | C14 | optimization_intelligence |
| C16 | Evolution Intelligence Engine | /evolution-intelligence | C15 | evolution_intelligence |
| C17 | Orchestration Intelligence Engine | /orchestration-intelligence | C16 | orchestration_intelligence |
| C18 | Unified Action Intelligence Experience | /action-intelligence-experience | C17 | action_intelligence_experience |
| C19 | Intelligence Dashboard | /intelligence-dashboard | C18 | intelligence_dashboard |
| C20 | Executive Intelligence Center | /executive-intelligence-center | C19 | executive_intelligence_center |
| C21 | Action Intelligence Final Certification | /action-intelligence-certification | C20 | action_intelligence_certification |
| C22 | Action Intelligence Final Closure | /action-intelligence-final-closure | C21 | action_intelligence_final_closure |

Full detail: [CH4 Design Identity Review §2](./AN-ACT-CH4-Design-Identity-Review.md).

---

## Appendix C — Complete CH5 Registry

**Classification:** **Implemented** — 22 modules, terminal `ai_experience_final_closure`

| ID | Name | Route base | Upstream |
|----|------|------------|----------|
| X1 | AI Experience Foundation | /ai-experience | C22 |
| X2 | AI Conversation Experience | /ai-conversation-experience | X1 |
| X3 | AI Guidance Experience | /ai-guidance-experience | X2 |
| X4 | AI Decision Support Experience | /ai-decision-support-experience | X3 |
| X5 | AI Action Planning Experience | /ai-action-planning-experience | X4 |
| X6 | AI Execution Companion Experience | /ai-execution-companion-experience | X5 |
| X7 | AI Progress Intelligence Experience | /ai-progress-intelligence-experience | X6 |
| X8 | AI Adaptive Coaching Experience | /ai-adaptive-coaching-experience | X7 |
| X9 | AI Insight Generation Experience | /ai-insight-generation-experience | X8 |
| X10 | AI Recommendation Intelligence Experience | /ai-recommendation-intelligence-experience | X9 |
| X11 | AI Predictive Intelligence Experience | /ai-predictive-intelligence-experience | X10 |
| X12 | AI Executive Intelligence Experience | /ai-executive-intelligence-experience | X11 |
| X13 | AI Orchestration Experience | /ai-orchestration-experience | X12 |
| X14 | AI Decision Intelligence Experience | /ai-decision-intelligence-experience | X13 |
| X15 | AI Strategic Intelligence Experience | /ai-strategic-intelligence-experience | X14 |
| X16 | AI Predictive Forecast Experience | /ai-predictive-forecast-experience | X15 |
| X17 | AI Executive Advisory Experience | /ai-executive-advisory-experience | X16 |
| X18 | AI Governance Assurance Experience | /ai-governance-assurance-experience | X17 |
| X19 | AI Accountability Ledger Experience | /ai-accountability-ledger-experience | X18 |
| X20 | AI Conformance Validation Experience | /ai-conformance-validation-experience | X19 |
| X21 | AI Operational Oversight Experience | /ai-operational-oversight-experience | X20 |
| X22 | AI Experience Final Closure | /ai-experience-final-closure | X21 |

Full table with bootstrap keys, schemas, chain lengths: [CH5 AI Experience Registry](./CH5-AI-Experience-Registry.md).

---

## Appendix D — Complete Intelligence Chain

**Classification:** **Implemented** — 44 links

| # | Token | Layer |
|---|-------|-------|
| 1 | intent | core (C1) |
| 2 | canonical_action | core |
| 3 | action_plan | core |
| 4 | dynamic_pricing | core |
| 5 | contract_intelligence | core |
| 6 | execution_intelligence | core |
| 7 | outcome_intelligence | core |
| 8 | trust_intelligence | core |
| 9 | decision_intelligence | core |
| 10 | recommendation_intelligence | core |
| 11 | insight_intelligence | core |
| 12 | prediction_intelligence | core |
| 13 | strategy_intelligence | core |
| 14 | learning_intelligence | core |
| 15 | optimization_intelligence | core |
| 16 | evolution_intelligence | core |
| 17 | orchestration_intelligence | core (C17) |
| 18 | action_intelligence_experience | CH4 (C18) |
| 19 | intelligence_dashboard | CH4 |
| 20 | executive_intelligence_center | CH4 |
| 21 | action_intelligence_certification | CH4 |
| 22 | action_intelligence_final_closure | CH4 (C22) |
| 23 | ai_experience_foundation | CH5 (X1) |
| 24–42 | ai_* (19 modules) | CH5 |
| 43 | ai_operational_oversight_experience | CH5 (X21) |
| 44 | ai_experience_final_closure | CH5 (X22) **terminal** |

Source: [AI Experience Architecture Book §4](./AN-ACT-AI-Experience-Architecture-Book.md).

---

## Appendix E — Glossary

| Term | Definition |
|------|------------|
| **Action** | Classified unit of professional work; only tradable unit (ADR-001) |
| **AN ACT** | Product name; Professional Operating System |
| **Need Mode** | Reflective planning UI context — light surfaces |
| **Action Mode** | Execution UI context — dark surfaces |
| **Live Frame** | Tier-based professional identity ring around avatar/card |
| **Runtime JSON** | Structured screen payload from CH3 experience APIs |
| **TEKRR** | Time, Effort, Knowledge, Risk, Responsibility decomposition |
| **Core UI** | CH3-X2 component registry (`core-ui-*`) |
| **Prototype** | CH3-X4 visual blueprint (`prototype-*`) |
| **Chain token** | Snake_case identifier appended to intelligence chain |
| **Delegation** | Single-upstream read-only projection pattern |
| **Terminal token** | Final chain identifier for a module or chapter |
| **Semantic token** | Dot-notation color/spacing reference (e.g. `accent.primary`) |
| **Scenario** | One of five canonical test intents (C1–C22) |
| **Handoff** | Explicit chapter completion pointing to next chapter |

---

## Appendix F — Architectural Decisions (ADR)

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-001](./adr/ADR-001-Action-Only.md) | Actions Are the Only Tradable Unit | Accepted |
| [ADR-002](./adr/ADR-002-Complaint-Origin.md) | Complaint Origin Rules | Accepted |
| [ADR-003](./adr/ADR-003-Trust-Authority.md) | Trust Authority | Accepted |

---

## Appendix G — Known Technical Debt

**Classification:** **Implemented** (debt exists); remediation **Recommended**

| Item | Location | Impact |
|------|----------|--------|
| No render layer consuming DESIGN_TOKENS | Platform-wide | **Concept only** UI |
| Three parallel Live Frame tier systems | design-system, trust, demo | Identity inconsistency |
| Legacy `src/ui/pages/` without CH3 imports | src/ui/ | Visual drift |
| Platform home separate from CH3 runtime | src/experience/ | Dual home experiences |
| CH3-X21 doc title mismatch | docs/runtime/CH3-X21-* | Documentation confusion |
| No icon glyph assets | design-system/icons.ts | Names only |
| No logo asset | — | Typographic brand only |
| In-memory Need/Action repositories | runtime-experience | Demo-only persistence |
| Diamond tier missing in NeedOpportunity type | need-repository.ts | Incomplete tier demo |
| X1 vs X2 duplicate button/input specs | design-system | Maintenance overhead |

Full consolidation list: [CH3 Design System Registry §13](./AN-ACT-CH3-Design-System-Registry.md).

---

## Appendix H — Future Opportunities

**Classification:** **Recommended**

1. `@an-act/tokens` npm package — export DESIGN_TOKENS as JSON + resolver
2. `@an-act/runtime-ui` reference React implementation
3. Live Frame unified registry adapter (§18.3)
4. OpenAPI spec generation from route registries
5. Design token Figma plugin sync
6. Runtime JSON JSON Schema publication for client codegen
7. Living Professional OS ↔ CH3 runtime journey merge
8. Streaming AI explanation endpoints (CH5)
9. Product analytics on prototype compliance in production clients
10. Chapter 6+ planning with registry-first namespace reservation

---

*AN ACT — Product Bible v1.0. Documentation only; no source code modified.*

*Entry point: [Master Architecture Index](./AN-ACT-Master-Architecture-Index.md)*
