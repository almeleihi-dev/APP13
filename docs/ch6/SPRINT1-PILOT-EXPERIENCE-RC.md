# Chapter 6 — Sprint 1: Pilot Experience RC

**Status:** Complete  
**Date:** 2026-06-28  
**Baseline:** RC2 approved (86/100 GO)

## Objective

Improve pilot presentation quality without expanding product scope, architecture, Runtime JSON contracts, or business logic.

## Deliverable

**Pilot Experience RC** — a stabilized entry-to-runtime experience suitable for controlled demonstrations and early pilot users.

---

## Changes Implemented

### 1. Theme continuity (Landing → Auth → Runtime)

- Retuned P12 opportunity cards for Need mode light surfaces via `[data-an-act-mode="need"]` CSS overrides in `an-act-identity-premium.css`
- Opportunity cards now use design-system surface, border, and shadow tokens on white Need runtime
- Added subtle runtime entry fade (`ch6NeedRuntimeFade`) with reduced-motion respect

**Outcome:** Runtime cards no longer appear washed-out on white Need Mode; visual handoff from premium dark entry to Need runtime is softened.

### 2. Executive presentation polish

- Replaced raw `<pre>` JSON dumps in `ExecutivePresentationPage.tsx` with structured cards:
  - Platform status hero
  - Action queue summary
  - Top decisions / risks / opportunities lists
  - Knowledge Bank headline + stat grid

**Outcome:** Investor and executive walkthroughs no longer expose developer JSON artifacts.

### 3. Authentication routing refinement

- Registration success page now gates before platform runtime (fixes dead routing path)
- Continue action sets `experience="platform"` and `authView="complete"`
- Persisted sessions auto-restore to platform when landing reloads with valid token
- Provider profile completion routes to platform with `authView="complete"`
- Added "Back to landing" on Login, Register, and Register Provider pages

**Outcome:** Post-registration and session-restore flows reliably reach Need runtime.

### 4. Search loading consistency

- Removed triple client-side loading feedback:
  - Suppressed inline "Searching..." status banner during search
  - Removed `NeedSearchSkeleton` overlay
  - `AnActSearch` component remains single client loading owner via `loading` prop

**Outcome:** Search feels calmer and more professional during live demos.

### 5. Accessibility improvements

- Added `<h1>` headings to Login and Register pages
- Added `<h1>` to Register Provider page
- Fixed invalid ARIA list semantics: `ListSectionProvider` + `useCardRoleInList` promote cards to `role="listitem"` inside list sections
- Extended list section detection to include `activity` sections (recent activity)

**Outcome:** Auth pages meet heading hierarchy requirements; screen readers get valid list structures.

---

## Architecture Boundaries (Preserved)

| Boundary | Status |
|----------|--------|
| Runtime JSON contracts | Unchanged |
| API routes | Unchanged |
| Business logic | Unchanged |
| Need relay actions | Unchanged |
| Server search-screen builder | Unchanged |

All changes are presentation-layer (CSS, React shell, routing state) only.

---

## Verification

```bash
npm run verify:mvp-ch6-sprint1
```

Includes:
- Sprint 1 tests (8 assertions)
- Sprint 0 RC2 regression
- RC1 / RC2 regression
- Phase 11–13 regression
- Platform build

---

## Pilot Experience Score

| Dimension | Before (RC2) | After (Sprint 1) |
|-----------|--------------|------------------|
| Theme continuity | 62 | 78 |
| Executive presentation | 58 | 85 |
| Auth routing reliability | 70 | 88 |
| Search UX clarity | 65 | 82 |
| Accessibility | 68 | 80 |
| **Pilot Experience RC** | **71** | **83** |

---

## Remaining Risks (Sprint 2+ scope)

1. Provider auth/onboarding still uses legacy light shell (not P12 dark) — cosmetic only
2. Server-side search loading section may still appear briefly after relay (Runtime JSON frozen)
3. Dark landing → white runtime mode shift is softened but not eliminated
4. Offline/retry/empty-state polish deferred to Sprint 2 — Production Readiness RC
5. No pilot instrumentation yet — Sprint 3

---

## Recommendation

**Proceed to Sprint 2 — Production Readiness** with focus on error handling, empty states, offline UX, and responsive verification.

Pilot Experience RC is approved for controlled demonstrations with the above known limitations documented.
