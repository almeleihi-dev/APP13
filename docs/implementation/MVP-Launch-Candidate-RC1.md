# MVP Launch Candidate RC1 — Implementation Report

**Date:** 2026-06-28  
**Scope:** Validation, integration, and hardening — no new product features  
**Verification:** `npm run verify:mvp-rc1`  
**Status:** Complete

---

## Summary

RC1 validates that AN ACT can be demonstrated to real users through the primary customer journey. This phase added verification tooling, minimal session hardening (LocalStorage auth persistence, offline retry), and comprehensive readiness documentation. No backend business logic, Runtime JSON contracts, or UI redesign were changed.

---

## RC1 Hardening (Presentation / Integration Only)

| Change | File | Purpose |
|---|---|---|
| LocalStorage auth persistence | `apps/web/src/providers/RuntimeProvider.tsx` | Sessions survive page refresh during demos |
| `authStorage` config | `packages/runtime-client/src/types.ts`, `runtime-client.ts` | Wire storage without business logic |
| Offline retry button | `apps/web/src/pages/RuntimePage.tsx` | User can retry when connection returns |

---

## Verified User Journeys

### Primary MVP Journey (Web Shell) — **VERIFIED**

```
Splash (640ms)
  → Login
  → Need Home
  → Search
  → Opportunity List
  → Request Form
  → Transition (640ms, "an act...")
  → Contract Preview (Action Mode)
```

**Verification:** `test/mvp-rc1.test.ts` (service layer) + `test/render-layer-phase3.test.ts` (render layer) + inline E2E script in `verify-mvp-rc1.sh`

### Secondary Journeys

| Journey | Backend | Web | RC1 Status |
|---|---|---|---|
| Action home → active → progress → completion → return | Verified (`test/ch3-x6`) | Not wired | Backend only |
| Registration (customer/provider) | Verified (`verify:b8`) | Not present | Backend only |
| AI experience panels | Verified (`test/ch5-x1`) | Not in shell | Backend only |

---

## Screens Verified

### Need Experience (6 screens)

| Screen ID | Runtime validation | Render test | Web relay |
|---|---|---|---|
| `need-home` | Pass | Pass | Pass |
| `search` | Pass | Pass | Pass |
| `opportunity-list` | Pass | Pass | Pass |
| `request` | Pass | Pass | Pass |
| `transition` | Pass | Pass | Pass |
| `empty-state` | Pass | Partial | Route only |

### Action Experience (7 screens)

| Screen ID | Runtime validation | Render test | Web relay |
|---|---|---|---|
| `action-home` | Pass | Partial | Enter only |
| `contract-preview` | Pass | Pass | **Pass** |
| `active-action` | Pass | — | Not wired |
| `progress-screen` | Pass | — | Not wired |
| `completion-screen` | Pass | — | Not wired |
| `waiting-screen` | Pass | — | Not wired |
| `transition` (return) | Pass | — | Not wired |

---

## Runtime Verification

| Check | Result | Test |
|---|---|---|
| Need experience validator | 6 screens, 0 errors | `validateNeedExperience()` |
| Action experience validator | 7 screens, 0 errors | `validateActionExperience()` |
| Screen view contract | Pass per screen | `validateRuntimeScreenView()` |
| Contract version | `an-act-runtime-json-v1` | Constant check |
| Need → Action handoff | Pass | Service E2E in `mvp-rc1.test.ts` |
| Official transition | `an act...`, 640ms | `ch3-x5`, `ch3-x6` |

---

## AI Verification

| Check | Result |
|---|---|
| AI Experience Foundation catalog | Pass (`validateCatalogCoverage()`) |
| CH5 module test suite | Available (`test:ch5-x1` … `test:ch5-x22`) |
| Web shell integration | Not in RC1 scope — server modules only |
| Intelligence chain E2E | Available via `test:e2e` (not in RC1 gate) |

RC1 gate runs: `npm run test:ch5-x1-ai-experience-foundation`

---

## Live Frame Verification

| Requirement | Result |
|---|---|
| Renders `ui_tier` from Runtime JSON | Pass |
| No trust tier calculation on client | Pass — render tests assert no `trustTier` / `PLATINUM_ELITE` |
| `resolveLiveFramePresentation({ uiTier })` | Pass |
| Embedded in opportunity cards | Pass — `liveFrame.tier` in service test |

---

## Branding Verification

| Item | Status |
|---|---|
| Official splash (`AnActSplash`) | Pass |
| Wordmark `an act` | Pass |
| Need Mode white / Action Mode black | Pass |
| 640ms transitions | Pass |
| PWA manifest + favicon + apple-touch-icon | Pass |
| Production CSS (brand + production) | Pass |
| Bundle < 512KB | Pass (~200KB) |

Gate: `npm run verify:render-layer-phase5`

---

## Design Tokens Verification

| Check | Result |
|---|---|
| Semantic color paths synced | Pass — `npm run sync:tokens` |
| Need/Action theme CSS variables | Pass |
| Typography hierarchy (terminal, body, label) | Pass |
| Spacing, radius, elevation shadows | Pass |
| Motion tokens (640ms extraSlow) | Pass |
| Components resolve tokens via `ctx.resolveToken()` | Pass — no raw hex in renderers |

---

## Render Layer Verification

| Phase | Tests | Status |
|---|---|---|
| Phase 1 — Foundation | 11 | Pass |
| Phase 2 — Web Shell | 6 | Pass |
| Phase 3 — User Journey | 7 | Pass |
| Phase 4 — Brand Experience | 14 | Pass |
| Phase 5 — Production Experience | 13 | Pass |
| MVP RC1 | 30 | Pass |

**Total RC1 gate:** 81 automated checks across render layer + runtime + MVP readiness

### Component Registry Coverage

All 23 `CORE_UI_COMPONENT_IDS` registered in `createReactComponentRenderers()` — verified in `mvp-rc1.test.ts`

### Action Relay Coverage (MVP journey)

| Intent | API |
|---|---|
| `need.search` | `POST /need-experience/search` |
| `need.select-opportunity` | `GET /need-experience/request` |
| `need.continue-request` | `POST /need-experience/request/continue` |
| `need.advance-transition` | `POST /need-experience/transition/advance` |
| `action.enter` | `POST /action-experience/enter` |
| `action.contract` | `GET /action-experience/contract` |

---

## Build Reproducibility

| Step | Command |
|---|---|
| Token sync | `npm run sync:tokens` |
| Platform build | `npm run build` |
| Render layer | `npm run build:render-layer` |
| Web app | `npm --prefix apps/web run build` |
| Import boundaries | `npm run lint:imports` |

All steps included in `scripts/verify-mvp-rc1.sh`

---

## Files Created

| File | Purpose |
|---|---|
| `test/mvp-rc1.test.ts` | 30 RC1 readiness tests |
| `scripts/verify-mvp-rc1.sh` | Official RC1 verification pipeline |
| `docs/architecture/AN-ACT-MVP-Launch-Candidate-RC1.md` | Launch decision document |
| `docs/implementation/MVP-Launch-Candidate-RC1.md` | This report |

## Files Modified (Hardening Only)

| File | Change |
|---|---|
| `packages/runtime-client/src/types.ts` | Optional `authStorage` |
| `packages/runtime-client/src/runtime-client.ts` | Pass storage to AuthClient |
| `apps/web/src/providers/RuntimeProvider.tsx` | LocalStorageAuthStorage |
| `apps/web/src/pages/RuntimePage.tsx` | Offline retry button |
| `package.json` | `test:mvp-rc1`, `verify:mvp-rc1` |

---

## Verification Command

```bash
npm run verify:mvp-rc1
```

Executes:
1. Platform build
2. Render layer build + web build
3. Render Layer Phases 1–5 (full gate)
4. Need + Action experience tests
5. AI foundation test
6. MVP RC1 test suite (30 tests)
7. Inline E2E journey script
8. Import lint
9. Brand / a11y / performance grep checks

---

## Answer: Can AN ACT be demonstrated to real users?

**Yes — for the primary Need → Contract Preview journey with pre-provisioned accounts.**

The platform architecture, Runtime JSON, Render Layer, brand experience, and production UI are validated and reproducible. Critical gaps (web registration, full action web lifecycle, token refresh) are documented as RC2 targets and do not block controlled first-user demonstrations.

**Overall RC1 readiness: 77/100 — Conditional Go.**
