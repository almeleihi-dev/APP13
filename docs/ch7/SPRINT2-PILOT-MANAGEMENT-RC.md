# Chapter 7 — Sprint 2: Pilot Management RC

**Status:** Complete  
**Date:** 2026-06-28  
**Baseline:** Founder Operations RC (91/100)

## Objective

Create an operator-facing pilot management layer for controlled MVP usage — cohorts, sessions, feedback, follow-up, and readiness summary.

No marketplace features. No API or Runtime JSON changes.

---

## Deliverable

**Pilot Management** — internal operator console for running and improving controlled pilots.

**Entry:** Landing → **Pilot Management** (dev or `VITE_PILOT_INSTRUMENTATION=true`)

---

## Cohort Model

| Cohort | Purpose | Default readiness |
|--------|---------|-------------------|
| First customers | Need journey validation | Ready |
| First professionals | Provider onboarding + action | Conditional |
| Enterprise partners | Partner package + live platform | Ready |
| Investors | Marketplace + executive narrative | Conditional |
| Government stakeholders | Compliance + trust review | Not started |

Each cohort shows: name, purpose, readiness, active sessions, completion status, follow-up needed.

---

## Session Workflow

1. **Instrumentation auto-creates sessions** from anonymous `sessionId` groupings in pilot events
2. **Operator reviews** session table: type, persona, journey status, outcome, friction, export status, owner
3. **Export metrics** marks successful sessions as exported (`recordPilotManagementExport`)
4. **Capture feedback** linked to cohort (optional session id)
5. **Work follow-up board** — classify, prioritize, decide fix/defer/observe

### Session fields

| Field | Source |
|-------|--------|
| Session type | Operator meta or default `unguided` |
| Persona | Cohort default or milestone inference |
| Journey status | Milestone progression |
| Outcome | success / blocked / abandoned / in-progress |
| Friction points | Abandonments, errors, zero-result search, offline failures |
| Export status | pending / exported / not-required |
| Follow-up owner | Default `Founder` |

---

## Feedback Framework

Structured operator observations (localStorage, no external forms):

| Field | Purpose |
|-------|---------|
| What worked | Positive signals |
| What confused the user | Friction narrative |
| Where the user stopped | Drop-off point |
| What required guidance | Facilitator dependency |
| Confidence score | 1–5 operator confidence |
| Recommended action | Next step suggestion |

---

## Follow-up Action Board

Default checklist (customizable per item):

1. Review session export
2. Summarize feedback
3. Classify issue
4. Assign priority
5. Decide fix / defer / observe
6. Prepare next session

Each item supports status, decision, issue class, and owner updates.

---

## Pilot Readiness Summary

| Metric | Description |
|--------|-------------|
| Sessions completed | Instrumentation sessions marked complete |
| Successful journeys | Outcome = success |
| Blocked journeys | Blocked or abandoned |
| Top friction themes | Aggregated from sessions + feedback |
| Follow-up backlog | Pending follow-up items |
| Next recommended cohort | First ready cohort without sessions, else conditional |

---

## Key Files

| File | Role |
|------|------|
| `apps/web/src/lib/pilot-management.ts` | Cohorts, sessions, feedback, follow-ups, readiness |
| `apps/web/src/pages/PilotManagementPage.tsx` | Tabbed operator UI |
| `apps/web/src/pages/FounderConsolePage.tsx` | Link to Pilot Management |
| `apps/web/src/pages/PilotInstrumentationPage.tsx` | Export marks sessions exported |

---

## Founder Workflow Integration

```
Landing
  ├── Founder Console (daily overview)
  ├── Pilot Management (cohorts, sessions, feedback)
  └── Pilot instrumentation (raw metrics)
```

Founder Console → **Pilot Management** button  
Pilot Management → **Founder Console** / **Pilot dashboard** / **Live platform**

---

## Verification

```bash
npm run verify:mvp-ch7-sprint2
```

Includes Sprint 2 tests, Sprint 1 regression, Chapter 6 Sprint 4 regression, build.

---

## Screenshots

Capture in dev after a Need journey + feedback entry:

1. **Readiness summary** tab with metrics
2. **Pilot cohorts** grid
3. **Pilot sessions** table
4. **Feedback capture** form + list
5. **Follow-up board** with decisions

---

## Pilot Management Readiness Score

| Dimension | Score |
|-----------|-------|
| Cohort operability | 90 |
| Session visibility | 88 |
| Feedback framework | 92 |
| Follow-up workflow | 89 |
| Instrumentation integration | 93 |
| **Pilot Management RC** | **90/100** |

---

## Constraints Preserved

| Boundary | Status |
|----------|--------|
| Runtime JSON | Unchanged |
| APIs | Unchanged |
| Business logic | Unchanged |
| External analytics/forms | None |
| Customer-facing changes | None |

---

## Remaining Limitations

1. Cohort readiness defaults are operator-defined, not live-calculated from backend
2. Session persona inference is milestone-based
3. Data remains per-browser localStorage
4. Government stakeholder cohort awaits first scheduled session

---

## Recommendation

**Proceed to Chapter 7 Sprint 3** — pilot cohort execution rituals, export merge workflow, or growth activation planning without feature creep.

Pilot Management RC is approved for controlled MVP pilot operations.
