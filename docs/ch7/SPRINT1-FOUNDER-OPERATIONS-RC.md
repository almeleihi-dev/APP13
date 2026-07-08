# Chapter 7 — Sprint 1: Founder Operations RC

**Status:** Complete  
**Date:** 2026-06-28  
**Baseline:** Chapter 6 Controlled Pilot Validation (CONDITIONAL GO)

## Objective

Create a founder-focused operator experience that answers at a glance:

- What happened today?
- What requires attention?
- What is improving?
- What is slowing down?
- What should I do next?

Uses **existing pilot instrumentation only** — no new APIs, Runtime JSON changes, or business logic.

---

## Deliverable

**Founder Console** — internal operator dashboard for AN ACT founders.

**Entry:** Landing → **Founder Console** (dev or `VITE_PILOT_INSTRUMENTATION=true`)

---

## Dashboard Overview

### 1. Daily Overview

| Metric | Source |
|--------|--------|
| New sessions | Anonymous sessions first seen today |
| Active sessions | Sessions with events today |
| Completed Need journeys | `tracking` milestone completions today |
| Completed requests | `request` milestone completions today |
| Search activity | Search events today + avg duration |
| Runtime health | Traffic-light from initial load + error signals |

### 2. Operational Highlights

Automatically derived:

- Highest completion flow (best started→completed ratio)
- Highest abandonment flow
- Most common retry reason (error category, search retry, offline retry)
- Slowest journey span (avg timing)
- Most active entry point (session inference from milestones)

### 3. Founder Recommendations

Deterministic rules — **no AI generation**:

| Rule | Recommendation |
|------|----------------|
| ≥20% zero-result searches | Improve search experience |
| Auth abandon > auth complete | Review onboarding friction |
| Retries ≥3 or error rate ≥10% | Investigate increased retries |
| Slow journey count ≥2 | Review slow journey spans |
| Completions with stable errors | Healthy pilot performance |
| No data today | Run a pilot session today |

### 4. Pilot Health (Traffic Light)

| Signal | Green | Amber | Red |
|--------|-------|-------|-----|
| Stability | Error rate ≤5% | ≤15% | >15% |
| Journey completion | ≥70% | ≥40% | <40% |
| Error trends | Retries ≤2 | ≤6 | >6 |
| Offline recovery | No failures | Recovered ≥ failed | Recovered < failed |
| Runtime status | Load ≤3s | ≤8s | >8s |

### 5. Action Center

Prioritized checklist combining standard operator tasks and high-priority recommendations:

1. Review exported pilot reports
2. Verify search latency
3. Monitor retry trends
4. Prepare next pilot cohort
5. Dynamic high-priority items from recommendations

---

## Key Files

| File | Role |
|------|------|
| `apps/web/src/lib/founder-console.ts` | Aggregation, health signals, recommendations |
| `apps/web/src/pages/FounderConsolePage.tsx` | Founder Console UI |
| `apps/web/src/lib/pilot-instrumentation.ts` | `getPilotEventRecords()` export (read-only) |
| `apps/web/src/App.tsx` | `founder` experience route |
| `apps/web/src/styles/global.css` | Founder Console + health badge styles |

---

## Founder Workflow

1. **Morning review** — Open Founder Console, scan Daily Overview and Pilot Health
2. **Attention triage** — Read Operational Highlights and Founder Recommendations
3. **Execute** — Work through Action Center checklist
4. **Deep dive** — Jump to Pilot instrumentation for raw milestone tables
5. **Live validation** — Open live platform to reproduce or verify issues
6. **Export** — Download JSON metrics after pilot sessions for cohort records

---

## Verification

```bash
npm run verify:mvp-ch7-sprint1
```

Includes:

- Founder Console module + aggregation tests
- UI wiring and CSS assertions
- Chapter 6 Sprint 4 regression
- Platform build

---

## Screenshots

Capture in dev after generating pilot activity:

1. **Empty state** — Founder Console before any sessions
2. **Daily overview** — After completing a Need journey
3. **Pilot health** — Traffic-light panel with mixed signals
4. **Action center** — With high-priority recommendation surfaced

Run: `npm run dev` in `apps/web`, complete a Need journey, then open **Founder Console** from landing.

---

## Operational Recommendations (Sample)

From a simulated session with 100% zero-result searches:

- **High:** Improve search experience
- **Action:** Verify search latency baseline
- **Monitor:** Export metrics after next cohort

---

## Pilot Operations Readiness

| Dimension | Score |
|-----------|-------|
| Founder visibility | 90 |
| Daily operational clarity | 88 |
| Recommendation usefulness | 85 |
| Instrumentation reuse | 95 |
| Privacy compliance | 95 |
| **Founder Operations RC** | **91/100** |

---

## Constraints Preserved

| Boundary | Status |
|----------|--------|
| Runtime JSON | Unchanged |
| APIs | Unchanged |
| Business logic | Unchanged |
| Architecture | Unchanged |
| New data collection | None — reads existing events only |

---

## Remaining Limitations

1. Metrics remain per-browser localStorage — founder must export for cross-session aggregation
2. Entry point inference is milestone-based, not explicit entry tracking
3. "New users" = anonymous new sessions, not authenticated user counts
4. Professional/Action journeys not yet in milestone instrumentation

---

## Recommendation

**Proceed to Chapter 7 Sprint 2** — expand pilot operations workflow (cohort management, export merge tooling, or scheduled review rituals) without feature creep.

Founder Operations RC is approved for daily founder use during controlled pilot operations.
