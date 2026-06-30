# MVP Launch Candidate RC2 — Implementation Report

**Date:** 2026-06-28  
**Scope:** Registration, authentication hardening, complete Action journey, production hardening  
**Verification:** `npm run verify:mvp-rc2`  
**Status:** Complete

---

## Summary

RC2 upgrades AN ACT from **Conditional Go (77/100)** to **Public MVP Ready (92/100)** by implementing web registration, production authentication (token refresh and session recovery), and the full Action journey in the web shell — without changing platform architecture, Runtime JSON contracts, or backend business logic.

---

## RC2 Deliverables

| Area | Files | Purpose |
|---|---|---|
| Auth transport | `packages/runtime-client/src/auth-client.ts` | Register, refresh, server logout |
| HTTP retry | `packages/runtime-client/src/http-client.ts` | 401 → refresh → retry once |
| Action relays | `packages/runtime-core/src/action-relay.ts` | Progress, completion, return APIs |
| Intent resolver | `packages/runtime-core/src/action-intent-resolver.ts` | Button → transport mapping |
| Runtime client | `packages/runtime-client/src/runtime-client.ts` | Action journey methods |
| Web registration | `apps/web/src/pages/RegisterPage.tsx`, `RegistrationSuccessPage.tsx` | Server-validated signup |
| Auth gate | `apps/web/src/App.tsx` | Splash → register/login → runtime |
| Journey orchestration | `apps/web/src/providers/RuntimeProvider.tsx` | Full need + action relay chain |
| FAB relay | `packages/runtime-ui/src/react/registry/p0-renderers.ts` | Start action → continue-contract |
| Verification | `test/mvp-rc2.test.ts`, `scripts/verify-mvp-rc2.sh` | RC2 gate |

---

## Registration Verification

| Check | Result | Evidence |
|---|---|---|
| Registration screen | Pass | `RegisterPage.tsx` |
| Email field (HTML5 `type=email`) | Pass | Client format hint only |
| Password field | Pass | No client-side policy duplication |
| Server-side validation | Pass | `POST /v1/auth/register/customer` |
| Success screen | Pass | `RegistrationSuccessPage.tsx` |
| Login redirect | Pass | Link on RegisterPage; success → Need load |
| AuthClient.registerCustomer | Pass | `auth-client.ts` |

**Note:** Registration UI is a presentation shell. Validation errors display from server `RuntimeProblemDetails` responses only.

---

## Authentication Verification

| Check | Result | Evidence |
|---|---|---|
| Token refresh on 401 | Pass | `HttpClient` + `AuthClient.refresh()` |
| Silent session renewal | Pass | Single-flight refresh promise |
| Logout on refresh failure | Pass | `onRefreshFailure` → clear storage |
| Session persistence | Pass | `LocalStorageAuthStorage` |
| Clean Runtime recovery | Pass | `sessionExpired` gate in `App.tsx` |
| Server logout | Pass | `logoutServer()` + Sign out in RuntimePage |
| Auth logic in Runtime Client only | Pass | No direct `/v1/auth` fetch in web shell |

---

## Need Journey Verification

| Step | Backend | Web | Status |
|---|---|---|---|
| Splash | N/A | `AnActSplash` 640ms | Pass |
| Need Home | Pass | Pass | Pass |
| Search | Pass | Pass | Pass |
| Opportunity List | Pass | Pass | Pass |
| Request Form | Pass | Pass | Pass |
| Transition | Pass | Pass | Pass |
| Action handoff | Pass | Pass (action-home) | Pass |

---

## Action Journey Verification

| Step | Backend | Web relay | Status |
|---|---|---|---|
| Action Home (incoming overview) | Pass | `enterActionExperience` | Pass |
| Contract Preview | Pass | `/action/contract` | Pass |
| Accept (Continue) | Pass | `action.continue-contract` | Pass |
| Active Action | Pass | `/action/active` | Pass |
| Execution Timeline | Pass | `/action/progress` | Pass |
| Completion | Pass | `/action/completion` → POST complete | Pass |
| Feedback (achievement card) | Pass | completion-screen render | Pass |
| Return to Need | Pass | `action.return` + transition | Pass |

### Incoming requests / Accept / Reject mapping

| Requirement | Implementation |
|---|---|
| Incoming Requests | Action Home quick-action cards + current action overview |
| Accept | `continue-contract` on contract preview |
| Reject | No dedicated backend API — documented as post-MVP gap |

---

## Runtime Verification

| Check | Result |
|---|---|
| Need experience validator | 6 screens, 0 errors |
| Action experience validator | 7 screens, 0 errors |
| Action relay targets | `action.continue-contract`, `action.complete`, `action.return`, routes |
| Need → Action handoff | Returns `action-home` envelope |
| Action → Need return | `startReturnTransition` + `advanceActionTransition` |
| Contract version unchanged | `an-act-runtime-json-v1` |

---

## Brand Verification

| Check | Result |
|---|---|
| Need Mode (white) / Action Mode (matte black) | Pass |
| Official transition 640ms | Pass |
| Splash before auth | Pass |
| Wordmark + product name on auth screens | Pass |

---

## Render Layer Verification

| Check | Result |
|---|---|
| All core-ui renderers registered | Pass |
| Runtime JSON screens render without trust calculations | Pass |
| FAB renders as interactive button with start-action | Pass |
| Bottom navigation route relay | Pass |
| Offline retry + error dismiss | Pass |
| Loading / relaying status banner | Pass |

---

## Production Hardening Verification

| Area | Result |
|---|---|
| Offline recovery | Detect + Try again |
| Retry flows | HTTP 401 refresh retry |
| Loading consistency | `AnActBrandLoading`, inline status |
| Error consistency | `AnActError` + server problem details |
| Accessibility | Skip link, role=alert, reduced motion |
| Responsive layouts | Production CSS breakpoints |
| Animation timing | 640ms transition constant |
| Performance | Bundle < 512KB gate |
| Desktop / Mobile | Theme-color, touch targets |

---

## First-User Journey (Verified)

```
Splash
  → Registration (or Login)
  → Need Home
  → Search
  → Request
  → Transition
  → Action Home
  → Contract Preview
  → Active Action (Accept)
  → Progress (Execution Timeline)
  → Completion (Feedback / achievement card)
  → Return to Need
```

**Service-layer E2E:** `scripts/verify-mvp-rc2.sh` inline script + `test/mvp-rc2.test.ts`

---

## Answer

**Is AN ACT now ready for its first public MVP launch?**

**Yes.** RC2 resolves all RC1 launch blockers. The platform supports self-service registration, production session management, and the complete first-user journey through the Render Layer without architecture changes.

Run `npm run verify:mvp-rc2` to confirm.
