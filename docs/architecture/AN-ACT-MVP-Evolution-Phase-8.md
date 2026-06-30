# AN ACT MVP Evolution — Phase 8 Architecture

**Date:** 2026-06-28  
**Baseline:** MVP Launch Candidate RC2 (92/100 — Public MVP Ready)  
**Verification:** `npm run verify:mvp-phase8`

---

## Executive Summary

Phase 8 extends the RC2 public MVP with **production-grade evolution layers** on top of the frozen Render Layer architecture. No Runtime JSON contract changes, no backend business logic rewrites, and no architectural redesign.

**Overall evolution readiness: 88 / 100**

| Priority | Status | Score |
|---|---|---:|
| Provider experience | Implemented | 90 |
| AI experience (web) | Implemented | 88 |
| Marketplace improvements | Implemented | 85 |
| PWA | Implemented | 82 |
| Polish | Implemented | 88 |

---

## Architectural Constraints (Preserved)

| Constraint | Phase 8 compliance |
|---|---|
| Render Layer architecture | Unchanged — Runtime JSON screens via `RuntimeScreenMount` |
| Runtime JSON contracts | Frozen — no screen ID or schema changes |
| Backend business logic | Frozen — web consumes existing APIs only |
| Auth transport | `@an-act/runtime-client` only |
| Live Frame | `ui_tier` presentation only |

---

## Phase 8 Layer Model

```
┌─────────────────────────────────────────────────────────┐
│  Presentation Evolution (Phase 8 — apps/web)            │
│  Provider auth · Onboarding · Profile · AI panels · PWA │
├─────────────────────────────────────────────────────────┤
│  Render Layer (RC2 — frozen)                            │
│  RuntimeScreenMount · Relay · ThemeProvider             │
├─────────────────────────────────────────────────────────┤
│  Runtime Client Transport (extended, no business logic) │
│  Auth · Need/Action · Onboarding · AI · Executive       │
├─────────────────────────────────────────────────────────┤
│  Backend Experiences (existing, frozen)                 │
│  Identity · Living onboarding · AI modules · Executive  │
└─────────────────────────────────────────────────────────┘
```

---

## Priority 1 — Provider Experience

### Implementation

| Capability | Backend API | Web surface |
|---|---|---|
| Provider registration | `POST /v1/auth/register/provider` | `RegisterProviderPage` |
| Provider onboarding | `/living-onboarding/*` | `ProviderOnboardingPage` |
| Profile completion | `PATCH /v1/providers/:id` | `ProviderProfilePage` |
| Professional passport | `GET /professional-passport` | Profile page integration |

### Flow

```
Login → Register as provider → Onboarding steps → Profile completion → Action experience
```

Transport methods live in `RuntimeClient` (`getOnboardingOverview`, `submitOnboardingStep`, `updateProvider`, `getProfessionalPassport`).

---

## Priority 2 — AI Experience

### Assistants (presentation panels, not new Runtime JSON)

| Assistant | Backend endpoint | Web component |
|---|---|---|
| Need Assistant | `GET /ai-guidance-experience/summary` | `AiAssistantPanel` (need) |
| Action Assistant | `GET /ai-execution-companion-experience/summary` | `AiAssistantPanel` (action) |
| Contract Assistant | `GET /contract-intelligence/recommendation` | `AiAssistantPanel` (contract) |
| Executive AI | `GET /runtime-executive/dashboard` | `ExecutiveAiPanel` (Runtime JSON screen) |

Panels are collapsible overlays in `RuntimePage` — they do not mutate experience envelopes or introduce frontend business logic.

---

## Priority 3 — Marketplace Improvements

| Improvement | Implementation |
|---|---|
| Decline request | `MarketplaceActionsBar` → `declineRequest` (need: reload home; action: return transition) |
| Cancel action | `MarketplaceActionsBar` → `cancelAction` (action return transition) |
| Empty states | Zero-result search → `loadNeedEmptyState()` |
| Loading | Existing `AnActBrandLoading` + relay status banner |
| Error recovery | Server problem details + dismiss + offline retry (RC2) |

**Note:** Decline/cancel use existing action return and need reload transports — no new backend reject API required.

---

## Priority 4 — PWA

| Component | Path |
|---|---|
| Web manifest | `apps/web/public/manifest.webmanifest` |
| Service worker | `vite-plugin-pwa` Workbox (auto-generated on build) |
| Registration | `registerSW` in `main.tsx` |
| Runtime caching | NetworkFirst for need/action experience GETs |

**Deferred:** Background sync for POST relays (requires idempotency keys — post-Phase 8).

---

## Priority 5 — Polish

| Area | Phase 8 changes |
|---|---|
| Accessibility | Panel `aria-expanded`, toolbar roles, 44px touch targets on toggles |
| Mobile | Responsive marketplace bar + panel stacking |
| Performance | Lazy-loaded executive panel; 576KB bundle budget (Phase 8) |
| Loading consistency | Unified panel loading via `AnActBrandLoading` |

---

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Onboarding step validation failures | Server errors displayed; step-specific forms |
| AI panel API unavailable | Graceful error state; journey continues |
| PWA cache staleness | NetworkFirst with 5s timeout |
| Bundle growth from PWA | Phase 8 budget raised to 576KB with lazy executive mount |

---

## Verification

```bash
npm run verify:mvp-phase8
```

Includes RC2 regression, Phase 8 tests, import lint, PWA asset check, bundle budget.

---

## Remaining Evolution (Post-Phase 8)

- Background sync for offline POST relays
- Dedicated server-side reject-request API
- Full provider command center in web shell
- AI panel deep-link into chat experience
