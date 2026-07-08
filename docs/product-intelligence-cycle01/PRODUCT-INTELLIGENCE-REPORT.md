# AN ACT — Product Intelligence Cycle 01 Report

**Date:** 2026-07-03  
**Cycle:** Observe → Analyze → Prioritize → Improve → Measure → Repeat  
**Baseline:** Living Platform Evolution Phase One

---

## Cycle summary

Product Intelligence Cycle 01 establishes the first **continuous improvement loop** for AN ACT. Every change is observation-driven, presentation-only, and tied to a measurable experience outcome.

| Phase | Outcome |
|-------|---------|
| **Observe** | Audited first-user journey post-P1; identified 12 friction points |
| **Analyze** | Grouped by hesitation, marketplace clarity, trust, consistency |
| **Prioritize** | Shipped top 10 by ROI (splash cue, builder CTA, home actions, marketplace hints) |
| **Improve** | 14 files updated; new PI CSS layer |
| **Measure** | Pilot instrumentation baselines: splash click, passport completion, marketplace entry |
| **Repeat** | Cycle 02 recommendations documented below |

---

## Observations

### First-user experience

| Moment | Observation | Hesitation signal |
|--------|-------------|-------------------|
| Launch splash | No visible cue beyond tagline | Users pause before key press |
| Act Builder | ACT button hidden until input | Empty textarea with no affordance |
| Act Preview | Final Act unclear | Users unsure what happens after ceremony |
| Passport | "Generate" sounds heavy | Drop-off on optional fields |
| Personal Home | Static get-started list | Users miss marketplace CTA |

### Professional identity

| Surface | Observation |
|---------|-------------|
| Trust score | Preview showed 98.4; passport derives ~72–88% | Abrupt visual shift |
| Live Frame | Explained in text only on home | Jargon without visual tier context |
| Passport naming | "Personal Professional Passport" vs "Professional Passport" | Label drift |

### Marketplace clarity

| Gap | Who / Why / What next |
|-----|----------------------|
| Browse empty state | No journey preview or example queries |
| Detail screen | Jumps to provider without hiring context |
| Shell label | "Need Mode" is internal jargon |
| Sample opportunities | Rich stats without beta/sample framing |

### Trust communication

- `.an-act-trust-signal` CSS existed but was unused
- Need MVP trust was text checklist, not visual chips
- No bridge between preview mock stats and derived passport trust

### Design consistency

- Action Groups overpromised at 0 completed actions
- Marketplace entry loading was single text line

---

## Prioritized improvements (shipped)

| Priority | Improvement | Measurable target |
|----------|-------------|-------------------|
| P1 | Launch onboarding cue | Splash → /start conversion |
| P1 | Builder persistent CTA + step strip | /start → analysis rate |
| P1 | Analysis step counter | Abandon during animation |
| P1 | Preview next-step copy | Final Act click-through |
| P1 | Passport "Create & continue" + status | Passport completion rate |
| P1 | Clickable get-started steps | Marketplace entry within 60s |
| P2 | Trust derived badge + preview bridge | Post-passport continuation |
| P2 | Marketplace browse hints + examples | First search within 30s |
| P2 | Shell → "Action Marketplace" | Reduced early exit |
| P2 | Sample opportunity badge + purpose banner | Detail → confirm rate |
| P3 | Trust chips on opportunity detail | Time on detail before request |
| P3 | Entry loading journey steps | Perceived wait quality |
| P3 | Passport action group empty state | Misclick reduction |
| P3 | Unified passport eyebrow label | Copy consistency |

---

## Files changed

| File | Change |
|------|--------|
| `apps/web/src/styles/an-act-product-intelligence-cycle01.css` | **New** — PI cycle styles |
| `apps/web/src/styles/global.css` | Import PI cycle CSS |
| `apps/web/src/main.tsx` | `an-act-pi-cycle01` on `<html>` |
| `apps/web/src/launch/LaunchSplashPage.tsx` | Onboarding cue |
| `apps/web/src/launch/ActBuilderPage.tsx` | Step strip, persistent CTA |
| `apps/web/src/launch/AnalysisProgress.tsx` | Step counter |
| `apps/web/src/launch/ActPreviewPage.tsx` | Next-step copy |
| `apps/web/src/pages/ProfileStartPage.tsx` | CTA + submit status |
| `apps/web/src/pages/PersonalHomeDashboardPage.tsx` | Trust visual, actionable steps |
| `apps/web/src/pages/PersonalPassportDashboardPage.tsx` | Label unify, empty action groups |
| `apps/web/src/pages/RuntimePage.tsx` | Marketplace label, browse hints |
| `apps/web/src/PlatformApp.tsx` | Entry journey steps |
| `apps/web/src/components/need-mvp/NeedSearchPresentation.tsx` | `MarketplaceBrowseHints` |
| `apps/web/src/components/need-mvp/NeedMvpFlow.tsx` | Sample badge, purpose, trust chips |
| `test/mvp-product-intelligence-cycle01.test.ts` | **New** — 9 tests |
| `scripts/verify-mvp-product-intelligence-cycle01.sh` | **New** — verify runner |
| `package.json` | test + verify scripts |

---

## Verification report

```bash
npm run verify:mvp-product-intelligence-cycle01
```

| Check | Result |
|-------|--------|
| Product Intelligence Cycle 01 tests | **9/9 pass** |
| Stylesheet wired | **OK** |
| Living Platform P1 regression | **9/9 pass** |
| Production build | **OK** |

**Status: PASS** — presentation-only; no architectural rewrites.

---

## Recommendations for Cycle 02

### Observe next
- Instrument splash cue visibility vs click timing
- Track get-started step button vs hero CTA usage
- Measure example query chip click rate

### Prioritize next
1. **Optional launch skip** for returning users with passport
2. **Verified trust badge** after first completed marketplace action
3. **Passport mini preview** in Need MVP detail (component reuse)
4. **Dark marketplace shell** continuity from Personal Home
5. **Category browse** when search returns empty

### Measure next
- Funnel: splash → passport → home → first search → first request
- New-user time-to-first-marketplace-action (target: <90s)
- Trust section dwell time on Personal Home

---

Deploy when ready:

```bash
bash scripts/deploy-vercel-tier1.sh
```
