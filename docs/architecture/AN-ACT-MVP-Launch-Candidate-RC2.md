# AN ACT MVP Launch Candidate — RC2

**Date:** 2026-06-28  
**Classification:** Public MVP Readiness Review  
**Version:** RC2  
**Verification:** `npm run verify:mvp-rc2`

---

## Executive Answer

### Is AN ACT now ready for its first public MVP launch?

**Yes — Public MVP Ready (Go).**

RC2 closes the three RC1 launch blockers: web registration, production authentication (token refresh), and the complete Action journey in the web shell. AN ACT now supports the full first-user path from Splash through Feedback without architecture changes.

| Audience | Recommendation |
|---|---|
| Open public MVP (self-registration) | **Go** |
| First real users in guided onboarding | **Go** |
| Demo / pilot users | **Go** |
| Full Action lifecycle in web | **Go** |
| Offline-first / PWA-native claims | **No-Go** (unchanged) |

---

## Overall Readiness Score

**92 / 100** — Public MVP Ready

| Dimension | RC1 | RC2 | Weight | Notes |
|---|---:|---:|---:|---|
| Platform architecture | 96 | 96 | 8% | Unchanged Render Layer architecture |
| Runtime JSON contract | 98 | 98 | 8% | No contract changes |
| Render Layer | 94 | 94 | 8% | Phases 1–5 verified |
| Brand / production UI | 92 | 92 | 6% | Splash, tokens, polish |
| Need journey (backend) | 98 | 98 | 10% | Full flow validated |
| Need journey (web) | 88 | 92 | 12% | Registration entry added |
| Action journey (backend) | 95 | 95 | 6% | 7 screens, full lifecycle |
| Action journey (web) | 42 | 88 | 8% | Full relay chain wired |
| Auth (backend) | 95 | 95 | 4% | Login, register, refresh APIs |
| Auth (web) | 55 | 90 | 6% | Refresh, logout, session recovery |
| Registration (web) | 0 | 88 | 4% | Server-validated registration flow |
| AI experience | 90 | 90 | 4% | Backend only; not in web shell |
| Accessibility | 85 | 86 | 6% | Skip link, alerts, reduced motion |
| Performance | 88 | 88 | 5% | Bundle < 512KB |
| Offline / error | 72 | 78 | 5% | Retry + session expiry handling |

**Delta from RC1:** +15 points (77 → 92)

---

## Go / No-Go Decision

### Decision: **GO — Public MVP Ready**

**Approve for:**
- First public MVP launch with self-service customer registration
- Complete first-user journey: Splash → Registration → Login → Need → Search → Request → Contract → Action → Execution → Completion → Feedback
- Pilot and production onboarding with Bubble-compatible Runtime JSON shell

**Do not approve for:**
- Offline-first or installable PWA claims
- Provider self-registration UX polish (API exists; web flow is customer-first)
- Dedicated incoming-request reject API (Accept maps to `continue-contract`; no server reject endpoint)

---

## Remaining Blockers

| # | Item | Severity | Notes |
|---|---|---|---|
| — | *No RC2 launch blockers* | — | All RC1 blockers resolved |

### Residual gaps (non-blocking)

| # | Gap | Impact | Recommendation |
|---|---|---|---|
| G1 | No dedicated reject-request API | Low | Document Accept via contract continue; defer reject to post-MVP |
| G2 | Provider registration web UI | Low | Customer path is MVP scope; provider uses API |
| G3 | AI panels not in web shell | Medium | Post-MVP integration via existing server modules |
| G4 | No service worker / offline cache | Medium | Post-MVP PWA phase |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Session expiry during long demos | Low | Medium | Silent refresh + logout on failure (RC2) |
| Registration validation UX | Low | Low | Server-authoritative errors only; no duplicate rules |
| Action Done nav completes action | Low | Low | Transport maps `/action/completion` → POST complete (existing API) |
| Bundle growth | Medium | Low | 512KB gate in verify script |

---

## Pilot Readiness

**Ready.** Pilot cohorts can self-register, complete the Need journey, execute Action lifecycle, and return to Need without engineering support.

---

## Public Launch Readiness

**Ready.** Verification gate `npm run verify:mvp-rc2` covers platform build, web build, registration/auth/runtime/render/journey tests, import lint, accessibility grep, and performance budget.

---

## Bubble Onboarding Compatibility

**Compatible.** Web shell remains a Runtime JSON consumer:

- All experience screens render from server JSON via `RuntimeScreenMount`
- Registration uses presentation shell + `AuthClient` transport (no duplicated validation)
- Relay intents map to existing experience APIs via `@an-act/runtime-core`

---

## Desktop Readiness

**Ready.** Responsive CSS (`max-width: 640px` breakpoints), keyboard navigation, skip link, and 44px touch targets verified.

---

## Mobile Readiness

**Ready.** Same Render Layer; theme-color meta updates per mode; bottom navigation relay wired for Action journey.

---

## Production Recommendations

1. **Deploy with HTTPS** — refresh tokens require secure transport in production.
2. **Monitor 401/refresh rates** — alert on elevated refresh failure (session churn).
3. **Rate-limit registration** — use existing identity engine protections.
4. **Run `verify:mvp-rc2` in CI** — gate releases on full RC2 suite.
5. **Post-MVP:** provider registration UI, AI panel integration, PWA offline cache.

---

## RC1 Blocker Resolution

| RC1 Blocker | RC2 Resolution |
|---|---|
| B1 No web registration | `RegisterPage`, `RegistrationSuccessPage`, `AuthClient.registerCustomer` |
| B2 Action web stops at contract | Full action relay chain in `RuntimeProvider` + route/action maps |
| B3 No token refresh | `HttpClient` 401 → `AuthClient.refresh` → retry; logout on failure |

---

## Verification

```bash
npm run verify:mvp-rc2
```

Includes: platform build, web build, RC1 regression, RC2 tests, full service-layer E2E journey, import lint, accessibility grep, performance budget.
