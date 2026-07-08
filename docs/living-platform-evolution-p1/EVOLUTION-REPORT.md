# AN ACT — Living Platform Evolution Phase One Report

**Date:** 2026-07-03  
**Scope:** User-first presentation refinements (observe, simplify, strengthen identity, marketplace readiness, trust evolution)  
**Baseline:** Public Beta RC1 + Emotional Design Sprint 3

---

## Evolution summary

Phase One shifts AN ACT from feature-complete to **user-first**. Every change is incremental, presentation-only, and production-ready — no architectural rewrites.

**Observe** — Reviewed the full first-user journey (Launch → Final Act → Passport → Personal Home → Marketplace). Identified friction: mock data presented as real, dense Personal Home before first action, duplicate marketplace CTAs, internal demo copy, and false affordances on voice/file input.

**Simplify** — New users see a focused Personal Home with one primary CTA. Passport setup clarifies that only name + title are required. Act Builder defaults to Write; voice/file marked "Soon."

**Strengthen identity** — Consistent "Professional Passport" labeling. Live Frame tier legend on passport dashboard. Plain-language Live Frame explanation on Personal Home.

**Marketplace readiness** — Search hints updated for verified professionals and real opportunities. User-facing "Opening your Action Marketplace…" entry state.

**Trust evolution** — Act Preview mock stats labeled "Preview · example data." Trust score source explained on Personal Home. Tier legend communicates growth path.

---

## User experience improvements

| Area | Before | After |
|------|--------|-------|
| Act Preview | Mock stats looked real | "Preview · example data" badge + Example labels |
| Passport setup | Full form felt mandatory | Quick-start note: name + title only required |
| Personal Home (new) | 4 sections, 4 duplicate CTAs | Hero CTA + Get started card; workspace hidden |
| Marketplace entry | "Preparing demonstration environment…" | "Opening your Action Marketplace…" |
| Act Builder | Voice/file tabs looked functional | Disabled with "Soon" badge |
| Passport dashboard | Live Frame unexplained | Silver / Gold / Platinum tier legend |
| Search | Generic marketplace copy | Verified professionals & opportunities |

---

## Public Beta observations

1. **Launch ceremony is memorable but long** — Four screens before passport; consider optional skip path in Phase Two.
2. **Mock preview data caused hesitation** — Users may wonder why stats change after passport creation; now labeled honestly.
3. **Personal Home density blocked first action** — New users scrolled past empty workspace panels; simplified path puts marketplace first.
4. **Trust signals need provenance** — Derived trust score now explains its source; marketplace detail trust remains curated for sample opportunities.
5. **Voice/file tabs created false expectations** — Disabled until functional reduces support confusion.

---

## Files changed

| File | Change |
|------|--------|
| `apps/web/src/styles/an-act-living-platform-evolution-p1.css` | **New** — living design system layer |
| `apps/web/src/styles/global.css` | Import living P1 stylesheet |
| `apps/web/src/main.tsx` | `an-act-living-p1` on `<html>` |
| `apps/web/src/passport/personal-home-presentation.ts` | `isNewUser`, simplified suggested actions |
| `apps/web/src/pages/PersonalHomeDashboardPage.tsx` | New-user simplified home, unified CTAs |
| `apps/web/src/pages/ProfileStartPage.tsx` | Quick-start note, optional field labels |
| `apps/web/src/pages/PersonalPassportDashboardPage.tsx` | Live Frame tier legend |
| `apps/web/src/launch/ActPreviewPage.tsx` | Preview honesty labels |
| `apps/web/src/launch/ActBuilderPage.tsx` | Voice/file "Soon" |
| `apps/web/src/PlatformApp.tsx` | User-facing marketplace entry copy |
| `apps/web/src/components/need-mvp/NeedSearchPresentation.tsx` | Marketplace search copy |
| `test/mvp-living-platform-evolution-p1.test.ts` | **New** — 9 certification tests |
| `scripts/verify-mvp-living-platform-evolution-p1.sh` | **New** — verify runner |
| `package.json` | test + verify scripts |

---

## Verification report

```bash
npm run verify:mvp-living-platform-evolution-p1
```

| Check | Result |
|-------|--------|
| Living Platform P1 tests | **9/9 pass** |
| Stylesheet wired | **OK** |
| Emotional Design S3 regression | **7/7 pass** |
| Production build | **OK** |
| Evolution report | **OK** |

**Status: PASS** — presentation-only; no backend, API, or architectural changes.

---

## Recommendations for the next evolution cycle

### Phase Two — Reduce journey length
- Optional "Skip to passport" after Launch splash for returning users
- Shorten Act Builder analysis animation for repeat visitors
- Remember launch draft in passport pre-fill (partially done)

### Phase Three — Trust from activity
- Visual distinction between derived trust (passport) and verified trust (completed actions)
- Populate Personal Home workspace from real marketplace activity when available
- Empty-state illustrations for drafts and saved opportunities

### Phase Four — Marketplace depth
- Provider card visual polish aligned with passport credential styling
- Request flow confirmation copy aligned with Live Frame tier language
- Category browse when search is empty

### Phase Five — Living design system
- Extract reusable `an-act-trust-signal` component for verified vs derived badges
- Document tier legend pattern for reuse across Runtime and Need MVP
- Mobile-first audit of Personal Home hero CTA stack

---

Deploy when ready:

```bash
bash scripts/deploy-vercel-tier1.sh
```
