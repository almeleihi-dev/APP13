# MVP Release Candidate Review Report (RC1)

**Review date:** 2026-06-28  
**Scope:** End-to-end product review — presentation to first customer, professional, enterprise partner, investor, and government stakeholder  
**Architecture status:** Frozen (no implementation in this review)  
**Method:** Code audit, automated RC1 test suite, live browser walkthrough (`127.0.0.1:5173`)

---

## Executive Summary

AN ACT has a **strong architectural foundation** — Runtime JSON contracts, backend need/action services, render layer, Phase 12/13 premium landing, and mutation-guard recovery are mature. The platform is **not yet ready for unrestricted external MVP release** because critical web-shell gaps would undermine live demonstrations.

**Overall readiness score: 71 / 100**

**Recommendation: CONDITIONAL GO**

Proceed to implementation phase only after resolving **4 RC1 blockers**. With blockers fixed, estimated readiness rises to **~85%** within one focused sprint.

---

## Readiness Score Breakdown

| Dimension | Score | Weight | Weighted |
|-----------|------:|-------:|---------:|
| Architecture & Runtime JSON (backend) | 96 | 10 | 9.6 |
| First impression & landing (Phase 13) | 88 | 8 | 7.0 |
| Authentication (web) | 62 | 6 | 3.7 |
| Need journey (web E2E) | 42 | 14 | 5.9 |
| Search & opportunity discovery | 68 | 8 | 5.4 |
| Passport & request flow | 40 | 10 | 4.0 |
| Success & tracking | 55 | 6 | 3.3 |
| Action journey (web) | 35 | 6 | 2.1 |
| Guided demo | 58 | 5 | 2.9 |
| Executive presentation | 52 | 5 | 2.6 |
| Partner package | 65 | 4 | 2.6 |
| Visual consistency | 60 | 6 | 3.6 |
| Accessibility | 72 | 6 | 4.3 |
| Enterprise presentation polish | 68 | 6 | 4.1 |
| **Total** | | **100** | **71.1** |

---

## GO / NO GO

### Recommendation: **CONDITIONAL GO**

| Audience | Ready today? | Notes |
|----------|--------------|-------|
| Investor (architecture story) | Partial | Executive page + landing strong; raw JSON undermines polish |
| Enterprise partner | Partial | Partner package informative; live platform demo risky |
| First customer | **No** | Need journey overlay may not appear; debug panel visible |
| First professional | **No** | Provider onboarding routes back to landing |
| Government stakeholder | **No** | Debug instrumentation + inconsistent mode state |

**Conditions for full GO:**
1. Remove or gate `RuntimeDebugPanel` and production console instrumentation
2. Fix Need MVP overlay visibility when server `mode !== "need"` on need screens
3. Wire request confirmation to authoritative server handoff (`need.continue-request` → Action Mode)
4. Connect guided demo to visual platform experience OR clearly label as presenter control panel only

---

## Strengths

1. **Phase 13 landing** — Clear hero statement, CTA hierarchy, live indicators, passport preview, marketplace flow, entry badges. Enterprise-ready first impression.
2. **Runtime JSON architecture** — Server-authoritative experiences validated; need/action service layer complete (RC1 tests pass).
3. **Premium identity system** — Cohesive dark P12/P13 design language on landing and customer auth.
4. **Mutation guard** — Stale transition recovery prevents OFFICIAL TRANSITION hang (verified in prior phase).
5. **Offline handling** — Detects offline state with retry affordance.
6. **Accessibility baseline** — Skip link, focus rings, reduced motion in core stylesheets, ARIA on many regions.
7. **Live Frame presentation** — Tier badges on opportunity cards without client-side trust calculation.
8. **Need MVP flow design** — Detail, confirm, success, tracking screens well-structured when reachable.

---

## Weaknesses

1. **Debug instrumentation exposed** in all runtime states
2. **Web need journey broken** when server reports `mode: action` on need screens
3. **Client-only success/tracking** decoupled from server Action Mode handoff
4. **Visual discontinuity** — dark premium landing/auth vs white Need Mode runtime shell
5. **Demo presenter isolated** from live platform UI
6. **Executive presentation** includes raw JSON developer panels
7. **Auth routing gaps** — registration/provider flows return to landing, not into experiences
8. **Duplicate opportunity CTAs** — Preview passport and View Details trigger identical relay

---

## Screen-by-Screen Findings

### 1. First Impression (Splash)

| Finding | Severity |
|---------|----------|
| Splash uses premium logo key with 640ms transition — polished, on-brand | Strength |
| Matte black splash → dark landing is cohesive | Strength |
| No skip-splash for returning users | Low |

**Verdict:** Ready for RC1 audiences.

---

### 2. Landing Clarity (`PartnerLandingPage`)

| Finding | Severity |
|---------|----------|
| Phase 13 hero statement explains what/who/why within ~3 seconds | Strength |
| Primary CTA "Enter live platform" visually dominant | Strength |
| Live verification indicator and runtime status strip add "alive" feel | Strength |
| Marketing stats (99.2%, 4.9★) are hardcoded — acceptable for MVP if labeled | Low |
| No direct path to manual login/register from landing | Medium |
| Returning authenticated users always start at landing | Medium |

**Verdict:** Ready for partner/investor first meetings.

---

### 3. Authentication (`LoginPage`, `RegisterPage`, provider flows)

| Finding | Severity |
|---------|----------|
| Premium P12 dark glass auth for customer login/register | Strength |
| Pre-filled demo credentials visible on login form | Medium |
| "Remember me" checkbox not wired to storage | Medium |
| Social providers disabled without `aria-disabled` explanation | Low |
| Login lacks `<h1>` — accessibility gap | High |
| No "Back to landing" when auth shown after failed demo login | High |
| `RegisterProviderPage` uses legacy light shell — visual inconsistency | Medium |
| Post-registration `finishRegistration()` returns user to landing, not platform | High |
| Provider profile completion returns to landing, not Action Mode | High |
| Auth unreachable from landing unless demo login fails | Medium |

**Verdict:** Presentation-ready for demo login path; not ready for real first-time customer/professional onboarding E2E.

---

### 4. Need Journey (`RuntimePage` + `NeedMvpFlow`)

| Finding | Severity |
|---------|----------|
| **`RuntimeDebugPanel` always rendered** — exposes screenId, mode, mutation caller, build stamp | **RC1 Blocker** |
| **`showMvpFlow` requires `mode === "need"`** — browser verified `mode: action` on `opportunity-list`; MVP overlay never appears | **RC1 Blocker** |
| Verbose unguarded `console.log` in RuntimeProvider and RuntimePage | High |
| `confirmRequest()` calls `need.select-opportunity` then shows client success — never calls `need.continue-request` | **RC1 Blocker** |
| AI Assistant + Executive AI panels visible on live platform (not presenter-gated by default) | Medium |
| Dark P12 runtime shell classes on white Need Mode background — cards appear washed out | High |
| Navigation label "Need mode navigation" while debug shows `mode: action` | High |
| Home nav click did not change screen during review (stale state) | Medium |

**Verdict:** **Not ready** for customer demonstration without blocker fixes.

---

### 5. Search Experience

| Finding | Severity |
|---------|----------|
| Search relay wired to server `need.search` | Strength |
| Live search injection via `injectNeedPresentationProps` | Strength |
| Triple loading feedback: status banner + search spinner + skeleton overlay | Medium |
| "Search live — results update as you type" shown when keyword empty | Low |
| `NeedEmptySearchHint` / `NeedNoResultsHint` defined but never used | Medium |
| Empty state relies on server `empty-state` screen only | Medium |

**Verdict:** Functional; polish gaps acceptable post-blocker fix.

---

### 6. Opportunity Discovery

| Finding | Severity |
|---------|----------|
| Opportunity cards show provider, service, Live Frame badge, price block | Strength |
| P12 card styling low contrast on white Need background | High |
| "Preview passport" and "View Details" both call `need.view-opportunity` — no distinct behavior | Medium |
| List uses `role="list"` with `role="article"` children — invalid semantics | Medium |
| Only opp-1..4 have rich detail copy; others get generic fallbacks | Medium |

**Verdict:** Discoverable but MVP overlay unreachable (blocker).

---

### 7. Passport Experience

| Finding | Severity |
|---------|----------|
| Landing miniature passport preview (Phase 13) — excellent storytelling | Strength |
| Runtime detail screen has Professional Passport section with trust/reviews | Strength |
| **Cannot reach detail screen when `mode !== "need"`** | **RC1 Blocker** |
| Card-level passport preview is generic text, not provider-specific | Medium |

**Verdict:** Blocked in live platform path.

---

### 8. Request Flow

| Finding | Severity |
|---------|----------|
| Confirm screen well-designed with summary, cost, Live Frame notice | Strength |
| Submitting state on confirm button | Strength |
| **Flow stops at client success — no server transition to Action Mode** | **RC1 Blocker** |
| Server moves to `request` screen while UI shows parallel client overlay | High |

**Verdict:** Not authoritative — violates server-first architecture story.

---

### 9. Success State

| Finding | Severity |
|---------|----------|
| Success ring, tracking ID, clear CTAs | Strength |
| Tracking ID generated client-side (`createTrackingId()`) — not server authoritative | High |
| Success unreachable when MVP overlay blocked | **RC1 Blocker** (dependency) |

**Verdict:** Presentation good; data contract wrong.

---

### 10. Tracking

| Finding | Severity |
|---------|----------|
| Timeline with complete/active/upcoming states — polished | Strength |
| Live Frame pulse on tracking screen | Strength |
| Timeline content is static/hardcoded — no server updates | Medium |
| "Contract preparation" step implies backend progress not reflected in UI | Medium |
| Reduced motion not applied to `need-mvp.css` shimmer/enter animations | Medium |

**Verdict:** Demo-quality only.

---

### 11. Guided Demo (`DemoPresenterPage`)

| Finding | Severity |
|---------|----------|
| Scenario selection, playback controls, presenter mode toggle | Strength |
| **No embedded visual platform walkthrough** — API control panel only | **RC1 Blocker** |
| Presenter mode persists if user switches to platform | Medium |
| Empty scenario list fails silently | Medium |
| Uses legacy wordmark styling vs Phase 13 logo key | Low |

**Verdict:** Useful for internal operators; misleading for external "guided demo" expectation.

---

### 12. Executive Presentation (`ExecutivePresentationPage`)

| Finding | Severity |
|---------|----------|
| Architecture highlight cards — investor-appropriate | Strength |
| Runtime JSON dashboard via `RuntimeScreenMount` | Strength |
| **Raw JSON `<pre>` blocks** for Knowledge Bank and executive summary | High |
| Uses legacy wordmark, not Phase 13 identity | Medium |
| Optional panels fail silently | Low |
| No link to live product journey | Medium |

**Verdict:** Suitable for technical investors with JSON caveat; not government/board ready.

---

### 13. Partner Package (`PartnerOverviewPage`)

| Finding | Severity |
|---------|----------|
| Five structured sections with accurate summaries | Strength |
| Enter live platform CTA works | Strength |
| Doc references shown as `<code>` — not clickable/downloadable | Medium |
| Visual language predates Phase 13 premium landing | Medium |
| Fully static — no loading states needed | N/A |

**Verdict:** Adequate for technical partner first meeting.

---

## Remaining RC1 Blockers (Must fix before MVP release)

| # | Blocker | Location | Impact |
|---|---------|----------|--------|
| B1 | Runtime debug panel always visible | `RuntimePage.tsx` L212–283 | All live demos |
| B2 | Need MVP overlay gated on `mode === "need"` while server returns `mode: action` on need screens | `RuntimePage.tsx` L190; server session state | Passport, request, success, tracking unreachable |
| B3 | Request flow ends client-side; no `need.continue-request` → Action Mode handoff | `useNeedPresentation.ts` L87–101 | Breaks authoritative architecture narrative |
| B4 | Guided demo disconnected from visual platform | `DemoPresenterPage.tsx` | External demo expectation mismatch |

---

## Recommended Fixes (Post-approval implementation order)

### Sprint 0 — Blockers (required for GO)

1. **Gate debug panel** — `import.meta.env.DEV` or explicit `VITE_RUNTIME_DEBUG` flag; strip/guard console instrumentation
2. **Fix MVP overlay gate** — Show NeedMvpFlow when `experienceKind === "need"` OR `screenId` is in need set, regardless of stale `mode`; normalize mode on hydration
3. **Wire confirm → continue-request** — After confirm, relay `need.continue-request`, run transition overlay, enter Action Mode contract preview
4. **Demo integration** — Embed `RuntimePage` in demo presenter OR rename entry to "Presenter control panel" and add side-by-side platform view

### Sprint 1 — High priority

5. Unify runtime shell theme (dark premium Need shell OR retune P12 cards for light tokens)
6. Remove raw JSON from executive page — render summary cards from JSON
7. Add `<h1>` and back-to-landing on auth pages
8. Fix post-registration routing into platform/action experiences
9. Differentiate Preview passport vs View Details actions

### Sprint 2 — Medium polish

10. Consolidate search loading states
11. Wire or remove unused empty-state components
12. Apply reduced motion to `need-mvp.css`
13. Align provider auth with P12 styling
14. Make partner doc refs downloadable links

---

## Verification Performed

| Check | Result |
|-------|--------|
| `npm run build` | Pass |
| `test/mvp-rc1.test.ts` (architecture) | Pass — backend journey validated |
| `test/mvp-phase13.test.ts` | Pass |
| Live browser: landing → Enter live platform | Pass — loads opportunity list |
| Live browser: View Details / Preview passport | **Fail** — MVP overlay blocked (`mode: action`) |
| Live browser: debug panel | **Visible** — confirms B1 |
| Accessibility static checks | Partial — skip link present; auth h1 missing |
| Responsive CSS breakpoints | Present in stylesheets |

---

## Estimated MVP Readiness Timeline

| Milestone | Readiness | ETA (implementation phase) |
|-----------|----------:|------------------------------|
| Today (RC1 review) | **71%** | — |
| After blocker fixes (Sprint 0) | **~85%** | 3–5 days |
| After High fixes (Sprint 1) | **~92%** | +5–7 days |
| Full external MVP release | **~95%** | +3–5 days polish |

---

## Final Recommendation

**CONDITIONAL GO** — Approve implementation phase targeting Sprint 0 blockers only.

The platform's **architecture, backend contracts, and landing experience** are strong enough to begin RC1 remediation. Do **not** present the live Need journey to external customers, professionals, or government stakeholders until **B1–B3** are resolved and verified in browser.

---

*Review conducted without code changes. Implementation phase begins only after RC1 approval.*
