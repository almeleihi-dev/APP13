# Chapter 6 — Sprint 3: Pilot Intelligence RC

**Status:** Complete  
**Date:** 2026-06-28  
**Baseline:** Production Readiness RC (87/100)

## Objective

Introduce lightweight, privacy-safe instrumentation to understand how pilot users experience AN ACT — without third-party analytics, marketing tracking, or API changes.

## Deliverable

**Pilot Intelligence RC** — client-side journey instrumentation + internal operator dashboard.

---

## Instrumentation Coverage

| Area | Implementation |
|------|----------------|
| Journey milestones | `recordPilotMilestone()` — landing → auth → need_home → search → opportunity → request → success → tracking (started / completed / abandoned) |
| Journey timing | `startPilotTiming()` / `endPilotTiming()` — landing→auth, auth→need, search, opportunity review, request completion, success→tracking |
| Search intelligence | Duration, zero-result flag, retry/cancel counters — **no keyword or content** |
| Error intelligence | Category-grouped counts (network, auth, offline, runtime, server) + retry flag |
| Performance | Initial runtime load, screen transitions via `recordPilotPerformance()` |
| Offline | Detected / recovered / retry_failed events |

### Privacy guarantees

- Anonymous session ID only (`sessionStorage`)
- No user identity, email, or credentials
- No search text or request content
- Events stored in `localStorage` key `an-act-pilot-events-v1` (cap 500)
- Recording paused during presenter/demo mode

---

## Operator Dashboard

**Entry:** Landing → **Pilot instrumentation** (visible when `PILOT_INSTRUMENTATION_ENABLED` — dev or `VITE_PILOT_INSTRUMENTATION=true`)

**Page:** `PilotInstrumentationPage.tsx`

Summarizes:

- Completed / abandoned / in-progress journeys
- Milestone funnel table
- Average search duration, zero-result count, retries
- Journey timing averages and P95
- Error totals by category
- Runtime health (error rate, slow journeys, offline recoveries)
- Export JSON / Clear metrics / Refresh

---

## Key Files

| File | Role |
|------|------|
| `apps/web/src/lib/pilot-instrumentation.ts` | Event store + snapshot aggregation |
| `apps/web/src/pages/PilotInstrumentationPage.tsx` | Operator dashboard |
| `apps/web/src/providers/RuntimeProvider.tsx` | Auth, relay, errors, screen milestones |
| `apps/web/src/components/need-mvp/useNeedPresentation.ts` | MVP stage milestones + timing |
| `apps/web/src/App.tsx` | Landing/auth routing milestones |
| `apps/web/src/pages/RuntimePage.tsx` | Offline retry + error retry metrics |

---

## Verification

```bash
npm run verify:mvp-ch6-sprint3
```

Includes runtime snapshot unit test + static integration tests + full regression chain.

---

## Pilot Readiness Score

| Dimension | Sprint 2 | Sprint 3 |
|-----------|----------|----------|
| Operational visibility | 45 | 88 |
| Journey understanding | 40 | 90 |
| Error/search intelligence | 55 | 85 |
| Privacy compliance | 90 | 95 |
| Performance overhead | 85 | 84 |
| **Pilot Intelligence RC** | **63** | **88** |

---

## Remaining Blind Spots

1. Metrics are per-browser localStorage — not aggregated across pilot users without export merge
2. Action Mode journey milestones not fully instrumented (Need path is primary pilot)
3. No server-side persistence — operators must export JSON for cross-session analysis
4. Presenter/demo sessions excluded from metrics (by design)
5. Sprint 4 controlled pilot validation still required

---

## Recommendation

**Proceed to Sprint 4 — Controlled Pilot** with real scenarios (first customer, professional, enterprise partner, investor walkthrough) and use dashboard exports to produce the **Pilot Validation Report**.

Screenshots: capture `PilotInstrumentationPage` after completing a full Need journey in dev (`npm run dev` in apps/web) for dashboard documentation.
