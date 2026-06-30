# AN ACT MVP Launch Candidate — RC1

**Date:** 2026-06-28  
**Classification:** Launch Candidate Readiness Review  
**Version:** RC1  
**Verification:** `npm run verify:mvp-rc1`

---

## Executive Answer

### Can AN ACT now be demonstrated confidently to real users?

**Yes — with conditions.**

AN ACT is ready for **controlled demonstrations, pilot onboarding, and investor/stakeholder walkthroughs** of the primary customer journey (Need → Contract Preview). It is **not yet ready** for open public signup or full Action lifecycle self-service without engineering support.

| Audience | Recommendation |
|---|---|
| Demo / pilot users (pre-provisioned accounts) | **Go** |
| First real users in guided onboarding | **Conditional Go** |
| Open public MVP (self-registration) | **No-Go** |
| Full Action lifecycle (active → completion) in web | **No-Go** |

---

## Overall Readiness Score

**77 / 100** — Launch Candidate (Conditional)

| Dimension | Score | Weight | Notes |
|---|---:|---:|---|
| Platform architecture | 96 | 8% | Runtime, AI, Render Layer complete |
| Runtime JSON contract | 98 | 8% | Need + Action validators pass |
| Render Layer | 94 | 8% | Phases 1–5 verified |
| Brand / production UI | 92 | 6% | Splash, tokens, polish |
| Need journey (backend) | 98 | 10% | Full flow validated |
| Need journey (web) | 88 | 12% | Login → contract preview works |
| Action journey (backend) | 95 | 6% | 7 screens, full lifecycle |
| Action journey (web) | 42 | 8% | Contract preview only |
| Auth (backend) | 95 | 4% | Login + register APIs |
| Auth (web) | 55 | 6% | Login + LocalStorage (RC1 hardening) |
| Registration (web) | 0 | 4% | **Blocker for public launch** |
| AI experience | 90 | 4% | 22 modules; not in web shell |
| Accessibility | 85 | 6% | Skip link, focus, reduced motion |
| Performance | 88 | 5% | Bundle < 512KB |
| Offline / error | 72 | 5% | Detection + retry; no PWA cache |

---

## Go / No-Go Decision

### Decision: **CONDITIONAL GO** (RC1)

**Approve for:**
- First real-user demonstrations of the Need → Action handoff
- Pilot cohorts with pre-created accounts
- Production UI review and brand validation
- Runtime JSON architecture proof

**Do not approve for:**
- Public self-service registration
- Unsupervised full Action execution lifecycle in web
- Offline-first or PWA-native deployment claims

---

## Critical Blockers

| # | Blocker | Impact | RC2 Target |
|---|---|---|---|
| B1 | **No web registration UI** | New users cannot self-onboard | Registration page + AuthClient.register |
| B2 | **Action web shell stops at contract preview** | Users cannot complete active → progress → completion in web | Wire action relay + RuntimeProvider handlers |
| B3 | **No token refresh on 401** | Sessions expire without graceful recovery | AuthClient.refresh + silent re-auth |

---

## High Priority Improvements

| # | Item | Area |
|---|---|---|
| H1 | Registration flow in web shell (customer) | Auth / UX |
| H2 | Action lifecycle screens in web (active, progress, completion, return) | Action journey |
| H3 | Logout + session management UI | Auth |
| H4 | Browser E2E test harness (Playwright) against live API | QA |
| H5 | Token refresh and session expiry messaging | Auth |

---

## Medium Improvements

| # | Item | Area |
|---|---|---|
| M1 | Service worker for PWA offline shell | Offline |
| M2 | Global React error boundary | Resilience |
| M3 | Action route relays for `/action/progress`, `/action/completion` | Render Layer |
| M4 | Inter font self-hosting for production CDN independence | Brand |
| M5 | AI experience panels in Runtime shell (read-only) | AI UX |

---

## Nice-to-Have Improvements

| # | Item |
|---|---|
| N1 | Final logo SVG replacing typographic placeholders |
| N2 | Native iOS/Android wrapper using same PWA assets |
| N3 | Haptic feedback on mode transition |
| N4 | RTL layout pass for Arabic markets |
| N5 | Browser compatibility matrix (Safari, Firefox, Edge) formal sign-off |

---

## Technical Debt

- **Dual auth APIs** (`/v1/auth/*` and `/auth/*`) — consolidate for MVP simplicity
- **Three Live Frame tier models** in codebase — render layer correctly uses `ui_tier` only; backend consolidation recommended
- **Memory vs LocalStorage** — RC1 hardens LocalStorage; refresh flow still missing
- **181 verify scripts** — consider single MVP gate (`verify:mvp-rc1`) as canonical pre-release command
- **AI modules** — extensive server coverage; zero web integration creates perception gap in demos

---

## UX Observations

- **Strengths:** Splash → login → Need Home feels premium; 640ms transition is distinctive; mode-aware theming is coherent; opportunity cards with Live Frame communicate trust without client-side calculation
- **Gaps:** No registration path; demo credentials pre-filled on login; action journey ends abruptly at contract preview; no logout affordance
- **Mobile:** Responsive breakpoints present; bottom nav uses safe-area; needs device QA on iOS Safari
- **Desktop:** PWA manifest, favicon, apple-touch-icon ready; window title correct

---

## Performance Observations

- Web production bundle: **~200KB** (under 512KB MVP budget)
- CSS: **~17KB** gzipped brand + production styles
- Splash + transition use CSS containment; `touch-action: manipulation` on interactive elements
- No service worker — repeat visits still network-dependent
- Runtime JSON fetched per screen relay — acceptable for MVP; caching strategy deferred

---

## Accessibility Observations

- Skip-to-content link present
- `:focus-visible` rings on buttons, inputs, cards, navigation
- `prefers-reduced-motion` preserves 640ms product transitions while disabling decorative animation
- Runtime JSON declares 44px minimum touch targets and keyboard navigation support
- Splash uses `role="status"` and `aria-busy`
- **Gap:** No formal WCAG audit; color contrast assumed via semantic tokens but not independently verified

---

## Security Observations

- JWT auth on experience APIs; demo login over HTTPS in production required
- Tokens stored in `localStorage` (RC1) — acceptable for MVP pilot; consider httpOnly cookies for GA
- No secrets in web bundle
- Registration endpoints exist server-side with validation; not exposed in web reduces attack surface for RC1
- **Gap:** No CSP headers documented for web deployment; no rate-limiting verification in RC1 scope

---

## Bubble MVP Compatibility

| Requirement | Status |
|---|---|
| Runtime JSON driven UI | **Ready** — no hardcoded screens |
| Server-authoritative state | **Ready** — relay-only web shell |
| Token-driven presentation | **Ready** — Design Tokens via CSS variables |
| No frontend business logic | **Verified** — render tests enforce ui_tier-only Live Frame |
| API proxy pattern | **Ready** — Vite dev proxy; production needs reverse proxy config |

Bubble deployment requires: API base URL config, auth endpoints reachable, static web build hosting.

---

## React Production Compatibility

| Requirement | Status |
|---|---|
| Vite production build | **Passing** |
| React 18+ shell | **Ready** |
| `@an-act/runtime-ui/react` package | **Ready** |
| Tree-shakeable packages | **Ready** |
| SSR-safe render tests | **Passing** (renderToStaticMarkup on journey screens) |

Deploy `apps/web/dist` to any static host; configure API proxy or CORS for experience endpoints.

---

## Mobile Readiness

| Item | Status |
|---|---|
| Viewport meta + viewport-fit | **Ready** |
| Responsive CSS (640px) | **Ready** |
| Touch targets (44px) | **Ready** |
| Bottom navigation sticky + safe-area | **Ready** |
| PWA manifest | **Ready** (no service worker) |
| Native app wrapper | **Not started** |

**Assessment:** Mobile web demo-ready; native app store submission not RC1 scope.

---

## Desktop Readiness

| Item | Status |
|---|---|
| Favicon + PWA icons | **Ready** |
| Window title `AN ACT` | **Ready** |
| Apple touch icon (180×180) | **Ready** |
| Max-width screen layout (1040px) | **Ready** |
| Keyboard navigation | **Partial** — focus rings present; full journey keyboard QA pending |

**Assessment:** Desktop browser demo-ready.

---

## Review Checklist Summary

| Area | RC1 Status |
|---|---|
| Authentication | Partial — login works; refresh/logout UI missing |
| Registration flow | Backend only — **web missing** |
| Runtime startup | **Pass** — splash + 640ms handoff |
| Need journey | **Pass** — full web + backend |
| Action journey | Partial — backend full; web contract preview only |
| Search | **Pass** |
| Opportunity list | **Pass** |
| Request flow | **Pass** |
| Contract preview | **Pass** |
| Live Frame | **Pass** — ui_tier only |
| Runtime transitions | **Pass** — 640ms official |
| Responsive behavior | **Pass** — CSS verified |
| Accessibility | **Pass** — baseline; formal audit pending |
| Performance | **Pass** — bundle budget |
| Error handling | **Pass** — Problem Details + dismiss |
| Offline behavior | Partial — detect + retry; no cache |
| Browser compatibility | Not formally tested — manual Chrome verified |

---

## Sign-Off Recommendation

**RC1 is approved for first real-user demonstrations** of the AN ACT Need → Contract Preview journey using pre-provisioned accounts, with engineering on standby for session and action-lifecycle gaps.

**RC2 should target:** registration UI, full action web journey, token refresh, and browser E2E automation before public MVP launch.

---

*Generated as part of MVP Launch Candidate RC1 verification. Run `npm run verify:mvp-rc1` to reproduce.*
