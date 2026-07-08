# Chapter 6 — Sprint 4: Pilot Validation Report

**Status:** Complete  
**Date:** 2026-06-28  
**Baseline:** Pilot Intelligence RC (88/100)  
**Sprint type:** Validation only — no feature changes

---

## Executive Summary

Controlled pilot validation exercised four end-to-end journey archetypes against the frozen AN ACT platform. Automated service-layer journeys, web-shell routing, Sprint 3 instrumentation, and full regression all pass.

**Final recommendation: CONDITIONAL GO**

The platform is ready for a **controlled pilot** with facilitator guidance, prioritizing **First Customer (Need)** and **Enterprise/Investor** walkthroughs. Professional onboarding and cross-user metric aggregation remain the primary conditions before broad unguided rollout.

---

## Validation Method

| Method | Scope |
|--------|-------|
| Service-layer journey tests | Need search → request → transition; Action contract → completion |
| Web-shell routing audit | Landing, auth, platform, executive, partner, provider flows |
| Sprint 3 instrumentation simulation | Customer funnel milestone completion |
| Full regression chain | Sprints 1–3, RC1/RC2, Need experience, build |
| Prior sprint RC findings | Friction, a11y, error recovery (Sprints 1–2) |

No architecture, Runtime JSON, API, or business-logic changes were made during this sprint.

```bash
npm run verify:mvp-ch6-sprint4
```

---

## Scenario Results

### 1. First Customer

**Path:** Landing → Authentication → Need → Search → Opportunity → Request → Success → Tracking

| Criterion | Result | Evidence |
|-----------|--------|----------|
| Task completion | **Pass** | Need service: home → search → request → transition (100%) |
| Web shell wiring | **Pass** | `App.tsx` platform entry, MVP success/tracking stages (Sprint 2 fix) |
| Instrumentation | **Pass** | Full milestone chain; simulated funnel shows 1 completed journey |
| Time to complete | **Acceptable** | Service-layer steps instant; demo login adds ~2–4s perceived auth |
| Navigation confusion | **Low** | Featured “Live platform” CTA; back-to-landing on auth |
| Error recovery | **Pass** | `PresentationError`, offline retry, session expiry (Sprint 2) |
| Retry frequency | **Low** | HttpClient 401 refresh; pilot retry metrics wired |
| Accessibility | **Good** | Auth `<h1>`, MVP step list `aria-current`, list semantics |
| Overall confidence | **High** | Primary pilot persona ready |

**Journey success rate (automated):** 100%  
**Instrumentation coverage:** 8/8 milestones

---

### 2. First Professional

**Path:** Authentication → Professional Passport → Opportunity → Action workflow

| Criterion | Result | Evidence |
|-----------|--------|----------|
| Task completion | **Pass** | Action service: action-home → contract → progress → completion |
| Registration/onboarding | **Pass (wired)** | Register Provider → Onboarding → Profile → `finishProviderSetup` → Action |
| Passport presentation | **Pass** | Landing passport section + `ProviderProfilePage` |
| Instrumentation | **Gap** | No professional-specific milestones (Sprint 3 scope was Need-first) |
| Navigation confusion | **Moderate** | Multi-step onboarding; legacy light auth shell vs P12 landing |
| Error recovery | **Pass** | Shared `PresentationError` on provider pages |
| Accessibility | **Adequate** | Provider register has `<h1>`; onboarding forms need facilitator context |
| Overall confidence | **Medium** | Works with guidance; not ideal for fully unguided first use |

**Journey success rate (automated):** 100% (service layer)  
**Instrumentation coverage:** 0/4 professional-specific stages

---

### 3. Enterprise Partner

**Path:** Landing → Executive Presentation → Partner Package → Live Platform

| Criterion | Result | Evidence |
|-----------|--------|----------|
| Task completion | **Pass** | Partner overview sections + CTA to live platform |
| Executive presentation | **Pass** | Structured cards; no raw JSON (Sprint 1) |
| Partner materials | **Pass** | Technical, security, deployment, architecture summaries |
| Instrumentation | **Partial** | Landing milestone only |
| Navigation confusion | **Low** | Clear entry cards with badges (live/demo/executive/partner) |
| Error recovery | **Pass** | Executive briefing retry via `PresentationError` |
| Overall confidence | **High** | Suitable for partner evaluation sessions |

**Journey success rate (automated):** 100% (routing + content)  
**Facilitator required:** Optional (self-serve viable)

---

### 4. Investor

**Path:** Landing → Executive Experience → Marketplace Story → Professional Passport → Need Journey

| Criterion | Result | Evidence |
|-----------|--------|----------|
| Task completion | **Pass** | Landing sections + executive entry + platform Need path |
| Marketplace story | **Pass** | `PremiumMarketplaceFlow`, trust/Live Frame sections |
| Passport preview | **Pass** | `ProfessionalPassportMiniPreview` on landing |
| Need journey handoff | **Pass** | Hero CTA and entry card → platform |
| Instrumentation | **Partial** | Landing + Need path when entering platform |
| Navigation confusion | **Low–Moderate** | Rich landing; investor may need narrative guide for section order |
| Overall confidence | **High** | Strong demo narrative; executive API panels degrade gracefully if unavailable |

**Journey success rate (automated):** 100% (content + routing)  
**Facilitator required:** Recommended for optimal story arc

---

## Journey Success Rates (Summary)

| Scenario | Routing | Service Layer | Instrumented | Pilot Ready |
|----------|---------|---------------|--------------|-------------|
| First Customer | 100% | 100% | 100% | Yes |
| First Professional | 100% | 100% | 0% | With guidance |
| Enterprise Partner | 100% | N/A | 25% | Yes |
| Investor | 100% | N/A | 50% | With guide |
| **Overall** | **100%** | **100%** | **44%** | **Conditional** |

---

## Friction Points

| # | Friction | Severity | Affected scenarios |
|---|----------|----------|-------------------|
| F1 | Dark premium landing → white Need runtime mode shift | Low | Customer, Investor |
| F2 | Server-side search loading section may flash briefly after relay (Runtime JSON frozen) | Low | Customer |
| F3 | Provider auth/onboarding uses legacy light shell vs P12 landing | Low | Professional |
| F4 | No guided investor narrative — user chooses entry points manually | Medium | Investor |
| F5 | Professional onboarding is multi-step without progress export to operators | Medium | Professional |
| F6 | Instrumentation is per-browser localStorage — no central aggregation | Medium | All (operations) |
| F7 | Presenter/demo mode pauses instrumentation by design | Low | Demo sessions |
| F8 | Action Mode milestones not instrumented in web shell | Medium | Professional |

---

## Screens Requiring Refinement (Post-Pilot — Not Sprint 4)

These are **documented for a future polish sprint**, not implemented now:

1. **Provider onboarding pages** — visual continuity with P12 landing
2. **Need runtime entry** — further soften mode transition (cosmetic)
3. **Investor landing** — optional guided scroll/tour for walkthrough order
4. **Search results** — monitor server-side loading flash in live pilot sessions

---

## Critical Observations

1. **Need MVP path is production-viable.** Success and tracking screens work after Sprint 2 fix; instrumentation confirms full funnel.
2. **Action workflow is authoritative at service layer.** Web shell delegates correctly via `RuntimeProvider` relays.
3. **Executive and partner experiences are investor-ready.** Structured summaries replaced developer artifacts in Sprint 1.
4. **Error and offline paths are recoverable.** Sprint 2 hardening holds under regression.
5. **Real human pilot sessions were not conducted in this automated validation.** Success rates reflect technical readiness, not UX research with external users.
6. **Privacy constraints held.** Instrumentation captures operational metrics only; no search text or PII.

---

## Instrumentation Snapshot (Simulated Customer Funnel)

From Sprint 3 module simulation during validation:

| Metric | Value |
|--------|-------|
| Completed journeys | 1 |
| Abandoned journeys | 0 |
| Milestones recorded | 15 events (full funnel) |
| Search avg duration | 680 ms (simulated) |
| Error totals | 0 |
| Offline recoveries | 0 |

Live pilot operators should export JSON from **Pilot instrumentation** dashboard after sessions.

---

## Recommended Improvements (Future — Not Sprint 4)

| Priority | Improvement | Rationale |
|----------|-------------|-----------|
| P1 | Extend instrumentation to professional + action milestones | Close F8 blind spot |
| P2 | Operator metric merge script (export JSON aggregation) | Close F6 for multi-user pilots |
| P3 | Provider onboarding visual alignment with P12 | Close F3 |
| P4 | Optional investor guided tour on landing | Close F4 |
| P5 | Monitor search loading flash in live sessions | Validate F2 impact |

---

## Pilot Readiness Score

| Dimension | Sprint 3 | Sprint 4 Validation |
|-----------|----------|---------------------|
| Customer journey readiness | 90 | 94 |
| Professional journey readiness | 70 | 78 |
| Enterprise/investor demo readiness | 85 | 92 |
| Error/offline resilience | 87 | 87 |
| Operational visibility | 88 | 82 (aggregation gap) |
| Accessibility | 87 | 87 |
| **Controlled pilot readiness** | **84** | **86** |

---

## Final Recommendation

### CONDITIONAL GO

**Proceed with controlled pilot** under these conditions:

1. **Primary pilot persona:** First Customer (Need journey) — fully instrumented and validated
2. **Facilitator present** for First Professional onboarding and Investor narrative walkthroughs
3. **Operators export** instrumentation JSON after each pilot session for manual aggregation
4. **Scope limit:** No unguided professional signup at scale until P1 instrumentation is added
5. **Monitor:** F2 search flash, session expiry, offline retry in first 10 live sessions

**Not recommended:** EXTENDED PILOT — technical blockers are minor; conditions are operational, not architectural.

**Not recommended:** Unconditional GO — professional instrumentation gap and lack of live human UX validation warrant conditions.

---

## Chapter 6 Completion Path

| Sprint | Deliverable | Status |
|--------|-------------|--------|
| Sprint 1 | Pilot Experience RC (83) | Complete |
| Sprint 2 | Production Readiness RC (87) | Complete |
| Sprint 3 | Pilot Intelligence RC (88) | Complete |
| Sprint 4 | Pilot Validation Report | **Complete** |

Next: **Chapter 6 Completion Report** synthesizing stability, pilot, and production scores across all four sprints.
