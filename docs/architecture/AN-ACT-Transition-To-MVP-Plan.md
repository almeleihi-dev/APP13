# AN ACT — Transition To MVP Plan

**Version:** 1.0  
**Type:** Implementation roadmap from architecture to Render Layer MVP  
**Prerequisite:** [Platform MVP Readiness Assessment](./AN-ACT-Platform-MVP-Readiness-Assessment.md) — **GO WITH REQUIRED FIXES**  
**Constraint:** Planning document only. No source code modified.

---

## Status Classification Key

| Label | Meaning |
|-------|---------|
| **Implemented** | Already exists in repository |
| **Documented** | Specified in docs; not built |
| **Concept only** | Not present |
| **Recommended** | Official plan guidance |

---

## Executive Summary

AN ACT transitions to MVP by building a **Render Layer** that consumes existing **CH3 Runtime JSON** and **DESIGN_TOKENS**, while keeping **platform engines** (CH1 core) as backend services. CH4 and CH5 remain **read-only API layers** surfaced progressively in the client — not blockers for first pixels.

**Recommended primary path:** React (web) or React Native (mobile + web)  
**Alternative paths:** Flutter (cross-mobile), SwiftUI (iOS-first), Bubble (API prototype only)  
**Not recommended:** Extending legacy `src/ui/pages/` as the MVP foundation

---

## 1. Remaining Work Before MVP

### Required (P0)

| # | Work item | Classification | Owner |
|---|-----------|----------------|-------|
| 1 | Export `DESIGN_TOKENS` as `@an-act/tokens` (JSON + TS resolver) | **Concept only** → build | Platform / Frontend |
| 2 | Publish JSON Schema for Runtime JSON screen views | **Concept only** → build | Platform |
| 3 | Live Frame unified adapter (trust score → UI tier → tokens) | **Recommended** → build | Platform + Design |
| 4 | Wire Need Experience opportunities to `DiscoveryService` | **Recommended** → build | Backend |
| 5 | React reference `RuntimeScreenRenderer` | **Concept only** → build | Frontend |
| 6 | Implement 5 core components: button, input, card, badge, live-frame | **Concept only** → build | Frontend |
| 7 | Need Home → Search → Opportunities → Request screens | **Implemented** API; **Concept only** UI | Frontend |
| 8 | Official transition screen (640ms, 5 stages, `an act...`) | **Implemented** spec; **Concept only** UI | Frontend |
| 9 | Client auth flow (Bearer or session) | **Implemented** API; **Concept only** client | Frontend |
| 10 | Declare CH3 as canonical UI; freeze legacy `src/ui/` | **Recommended** governance | Product |

### Recommended (P1)

| # | Work item |
|---|-----------|
| 11 | OpenAPI supplement for CH3 experience routes |
| 12 | Action Home + Contract preview screens |
| 13 | Bottom navigation component matching CH3 spec |
| 14 | Icon asset pipeline (15 named icons) |
| 15 | E2E test: auth → need flow → transition |
| 16 | Deprecate or migrate `HomeExperienceService` to CH3 Need Home |

### Deferred (P2 — post-MVP)

| # | Work item |
|---|-----------|
| 17 | Full CH2 Living Experience in client |
| 18 | CH4/CH5 intelligence dashboards in client |
| 19 | Escrow UI screens |
| 20 | Flutter/SwiftUI native adapters (if React Native not chosen) |
| 21 | Logo / marketing brand assets |
| 22 | Performance load testing |

---

## 2. Immediate Priorities (Next 4 Weeks)

**Week 1 — Foundation packages (no UI pixels yet)**

1. Extract `DESIGN_TOKENS` to `@an-act/tokens` package — export JSON + `resolveSemanticColor(mode, path)` — **Recommended**
2. Draft JSON Schema from `NeedRuntimeScreenView` TypeScript types — **Recommended**
3. Document Live Frame mapping table (Product Bible §18.3) as `live-frame-registry.ts` spec — **Recommended** (spec only, implementation week 2)
4. Add CH3 route catalog markdown/OpenAPI fragment — **Recommended**

**Week 2 — Reference renderer core**

5. Create `@an-act/runtime-ui` React package with component registry skeleton — **Concept only**
6. Implement `RuntimeScreenRenderer` — sections → components loop — **Concept only**
7. Implement `core-ui-button`, `core-ui-card`, `core-ui-input` — **Concept only**
8. Render Need Home from `GET /need-experience/home` — **Concept only**

**Week 3 — Core journey**

9. Search + Opportunity List + Request screens — **Concept only**
10. Wire opportunities endpoint to discovery engine (backend) — **Recommended**
11. Implement `core-ui-live-frame`, `core-ui-badge` with unified adapter — **Recommended**
12. Bottom navigation — **Concept only**

**Week 4 — Transition + auth**

13. Client login/register against existing auth API — **Implemented** API
14. Official transition screen — **Concept only** UI from **Implemented** spec
15. Action Home first pixel — **Concept only**
16. Internal MVP demo: full Need → Transition → Action Home — **Recommended** milestone

---

## 3. Render Layer Roadmap

```
Phase R0  Token + Schema export          (1 week)
    ↓
Phase R1  Live Frame adapter             (1 week)
    ↓
Phase R2  React core registry (5 components) (2 weeks)
    ↓
Phase R3  RuntimeScreenRenderer          (1 week)
    ↓
Phase R4  Need journey screens             (2 weeks)
    ↓
Phase R5  Transition + Action Home         (1 week)
    ↓
Phase R6  Shared screens (Profile, Timeline) (2 weeks)
    ↓
Phase R7  Engine-backed flows (Contract)   (3+ weeks)
    ↓
Phase R8  Mobile parity (RN / Flutter)   (parallel if needed)
```

**Total estimated:** 10–14 weeks to MVP demo; 16–20 weeks to engine-backed contract flow.

---

## 4. Bubble Implementation Strategy

**Classification:** **Recommended** as rapid prototype path only — not primary production strategy

### What Bubble can do immediately

| Task | Backend status |
|------|----------------|
| API Connector → `GET /need-experience/home` | **Implemented** |
| Bearer token auth | **Implemented** |
| Display JSON fields in text elements | Bubble native |
| Need Mode static theme (white bg, #2563EB accent) | Token hex **Implemented** |
| Repeating group for opportunity cards | Manual mapping **Recommended** |

### Bubble architecture

```
Bubble App
  ├── API Connector (Auth: Bearer)
  │     ├── GET /auth/login → store token
  │     ├── GET /need-experience/home
  │     ├── GET /need-experience/search
  │     ├── GET /need-experience/opportunities
  │     └── POST /need-experience/actions/*
  ├── Page: Need Home (static theme)
  ├── Page: Search
  ├── Page: Opportunities (repeating group)
  ├── Page: Request (form → API)
  ├── HTML Element: Transition (custom CSS, 640ms)
  └── Page: Action Home (dark theme)
```

### Custom plugins / HTML required

- Transition screen with stage text animation — **HTML/CSS element**
- Live Frame ring — **HTML/CSS** or image sprites
- Dynamic component type switching — **Bubble workflows** (conditional per `componentId`)

### Must stay on backend

- All engines (Action, Contract, Trust, Escrow)
- CH4/CH5 intelligence
- Discovery matching logic
- Session/JWT validation

### Bubble MVP scope recommendation

**In scope:** Need Home, Search, Opportunities, Request, Transition, Action Home (static demo)  
**Out of scope:** Full CH3 component registry, CH4 dashboards, escrow UI, native performance

**Estimated Bubble effort:** 3–4 weeks for demo-quality; 6+ weeks for production-quality (likely exceeds React cost at that point).

---

## 5. React Implementation Strategy

**Classification:** **Recommended** primary Render Layer path

### Package structure (Recommended)

```
packages/
  tokens/          @an-act/tokens — DESIGN_TOKENS JSON + resolver
  runtime-ui/      @an-act/runtime-ui — component registry + RuntimeScreenRenderer
  runtime-client/  API hooks (useRuntimeScreen, useNeedExperience)
apps/
  web/             Next.js or Vite — MVP app
```

### Implementation steps

1. **Token provider** — `AnActModeProvider` (need | action | transition) + theme from tokens — **Concept only**
2. **Component registry** — `Map<componentId, ReactComponent>` — **Concept only**
3. **RuntimeScreenRenderer** — maps regions, sections, navigation visibility — **Concept only**
4. **API client** — authenticated fetch to `/need-experience/*` — **Implemented** routes exist
5. **Transition engine** — port `TRANSITION_STAGE_TEXTS`, 640ms, background interpolation — **Implemented** spec
6. **Storybook** — one story per `core-ui-*` component against tokens — **Recommended**

### Advantages

- TypeScript types shared with backend — **Implemented**
- Largest hiring pool — **Recommended**
- Web-first MVP; React Native reuse path — **Recommended**

### First React milestone

Single page rendering Need Home from live API with correct Need Mode colors — end of Week 2 target.

---

## 6. Flutter Implementation Strategy

**Classification:** **Recommended** if mobile-native is MVP primary; secondary if web-first

### Package structure (Recommended)

```
packages/
  an_act_tokens/       — JSON assets + ThemeExtension
  an_act_runtime_ui/   — Widget registry
lib/
  main.dart
  screens/
    runtime_screen.dart
```

### Key Flutter mappings

| CH3 spec | Flutter |
|----------|---------|
| `core-ui-button` | `AnActButton` widget |
| Need Mode `#FFFFFF` bg | `ThemeData.light` + custom extension |
| Action Mode `#000000` bg | `ThemeData.dark` + custom extension |
| terminal typography | `TextStyle(fontFamily: 'SF Mono')` |
| 8-region layout | `CustomScrollView` + `SliverAppBar` + `BottomNavigationBar` |
| Transition 640ms | `AnimationController` |

### When to choose Flutter

- MVP is **iOS + Android** with no web requirement
- Team has Dart expertise
- Willing to maintain separate codebase from React web

### Estimated effort

+4–6 weeks vs React if starting from zero (no shared TS types).

---

## 7. Recommended First Screens

Ordered by CH3 prototype + runtime journey dependency:

| Order | Screen | Prototype ID | Route | API |
|-------|--------|--------------|-------|-----|
| 1 | Need Home | `prototype-need-home` | `/need/home` | `GET /need-experience/home` |
| 2 | Search | `prototype-search` | `/need/search` | `GET /need-experience/search` |
| 3 | Opportunity List | `prototype-opportunity-list` | `/need/opportunities` | `GET /need-experience/opportunities` |
| 4 | Request | `prototype-request` | `/need/request/create` | `GET /need-experience/request` |
| 5 | Transition | `prototype-transition` | `/system/transition` | Transition actions on experience API |
| 6 | Action Home | `prototype-action-home` | `/action/home` | `GET /action-experience/home` |
| 7 | Profile | `prototype-profile` | — | `GET /profile-experience` |
| 8 | Timeline | `prototype-timeline` | — | `GET /timeline-experience` |

**MVP critical path:** Screens 1–6 only.

---

## 8. MVP Milestones

| Milestone | Definition of done | Classification |
|-----------|-------------------|----------------|
| **M0 — Spec export** | Tokens JSON + JSON Schema published | **Recommended** |
| **M1 — First pixel** | Need Home renders from API with correct tokens | **Concept only** |
| **M2 — Need journey** | Home → Search → Opportunities → Request navigable | **Concept only** |
| **M3 — Brand transition** | `an act...` transition at 640ms with 5 stages | **Implemented** spec |
| **M4 — Mode switch** | Action Home renders in Action Mode theme | **Concept only** |
| **M5 — Auth integrated** | Login → Need Home with real session | **Implemented** API |
| **M6 — Live data** | Opportunities from DiscoveryService, not demo repo | **Recommended** |
| **M7 — Internal demo** | Stakeholder walkthrough of M0–M6 | **Recommended** |
| **M8 — MVP beta** | M0–M6 + Profile + error/empty states + basic contract preview | **Recommended** |

CH3-X19 launcher criteria (reference): `readyForMvp: mvpReadinessPercentage >= 90 && blockers.length === 0` — **Implemented** for architecture checks; render milestones are **additional**.

---

## 9. Estimated Implementation Phases

| Phase | Duration | Output | Team |
|-------|----------|--------|------|
| **Phase 0 — Governance** | 1 week | Canonical UI decision, freeze legacy UI, Live Frame spec signed off | Product + Arch |
| **Phase 1 — Token + Schema** | 1–2 weeks | `@an-act/tokens`, JSON Schema, OpenAPI supplement | Platform |
| **Phase 2 — React core** | 2–3 weeks | 5 components + RuntimeScreenRenderer | Frontend |
| **Phase 3 — Need MVP** | 2–3 weeks | Screens 1–4 + auth | Frontend + Backend |
| **Phase 4 — Transition + Action** | 1–2 weeks | Screens 5–6 | Frontend |
| **Phase 5 — Data wiring** | 1–2 weeks | Discovery → opportunities | Backend |
| **Phase 6 — Beta hardening** | 2–3 weeks | Empty/error states, Profile, E2E tests | Full stack |
| **Phase 7 — Mobile (optional)** | 4–6 weeks | React Native or Flutter adapter | Mobile |

**Total (web MVP):** 10–16 weeks  
**Total (web + native):** 14–22 weeks

*Estimates are planning guidance — **Recommended**, not measured from repo.*

---

## 10. Platform Track Parallel Work

Render Layer does **not** block these **Implemented** backend tracks continuing:

| Track | Status | MVP relevance |
|-------|--------|---------------|
| CH4/CH5 APIs | **Implemented** | Surface in client Phase 2+ |
| CH2 Living Experience | **Implemented** | Optional MVP scope |
| Escrow / financial | **Implemented** | Post-MVP UI |
| OpenAPI v1.1 handlers | **Implemented** | Client uses as needed |
| Security kernel | **Implemented** | Required for auth |

---

## 11. Decision Matrix — Which Render Path?

| Criterion | React | React Native | Flutter | SwiftUI | Bubble |
|-----------|-------|--------------|---------|---------|--------|
| Shares TS types with backend | ✅ | ✅ | ❌ | ❌ | ❌ |
| Time to first pixel | Fast | Fast | Medium | Medium | Fast (limited) |
| CH3 component registry fit | Excellent | Excellent | Good | Good | Poor |
| Transition animation fidelity | Excellent | Excellent | Excellent | Excellent | Manual |
| Production scalability | Excellent | Excellent | Excellent | iOS only | Limited |
| Team learning curve | Low | Low | Medium | Medium (iOS) | Low |
| **Recommendation** | **Primary web** | **Primary mobile** | Alt mobile | iOS premium | Prototype only |

---

## 12. Final Recommendation

### Start Render Layer: **YES** (GO WITH REQUIRED FIXES)

### Recommended approach

1. **Primary:** React web app + `@an-act/tokens` + `@an-act/runtime-ui`
2. **Mobile (if needed):** React Native sharing packages above
3. **Bubble:** Optional 2-week stakeholder demo only — not production path
4. **Backend priority:** Wire Need opportunities to DiscoveryService during Phase 5
5. **Governance:** CH3 Runtime JSON is the only approved UI contract; retire legacy UI path
6. **Do not block on:** CH4/CH5 client surfaces, CH2 Living modules, escrow UI, logo assets

### Success criteria for Render Layer kickoff

- [ ] Product sign-off on React as primary path — **Recommended**
- [ ] Token export package scoped — **Concept only**
- [ ] JSON Schema owner assigned — **Recommended**
- [ ] Live Frame mapping approved (Product Bible §18.3) — **Recommended**
- [ ] First screen target: Need Home — **Implemented** API ready

### Success criteria for MVP launch

- [ ] M0–M8 milestones complete
- [ ] Live Frame adapter **Implemented**
- [ ] Discovery-backed opportunities **Implemented**
- [ ] E2E auth → need → transition → action path passing
- [ ] Security review complete — **Recommended**
- [ ] ADR-001 compliance verified in UI copy (Action not Service/Listing)

---

*Transition Plan v1.0 — documentation only; no source code modified.*

*Prerequisite: [Platform MVP Readiness Assessment](./AN-ACT-Platform-MVP-Readiness-Assessment.md)*

*Master spec: [Product Bible](./AN-ACT-Product-Bible.md)*

*Navigation: [Master Architecture Index](./AN-ACT-Master-Architecture-Index.md)*
