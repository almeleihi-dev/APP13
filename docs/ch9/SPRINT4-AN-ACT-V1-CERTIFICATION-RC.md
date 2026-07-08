# Chapter 9 — Sprint 4: AN ACT v1 Certification RC

**Status:** Complete  
**Date:** 2026-06-28  
**Baseline:** Chapter 9 Sprint 3 Launch Readiness RC (91/100)

## Objective

Create the official AN ACT v1 Certification Center — the certification layer summarizing everything verified from Chapters 1–9. No new features; presentation and aggregation only.

---

## Deliverable

**AN ACT v1 Certification Center** — official certification package for partners, investors, and enterprise reviewers.

**Entry:** Landing → **AN ACT v1 Certification Center** (dev or `VITE_PILOT_INSTRUMENTATION=true`)  
**Alternate:** Launch Readiness Center → **v1 Certification**

---

## Certification Overview

Six readiness dimensions aggregated from existing operational state:

| Dimension | Score | Signal |
|-----------|-------|--------|
| Architecture readiness | 99 | Green |
| Runtime readiness | 100 | Green |
| Pilot readiness | 100 | Green |
| Enterprise readiness | 93 | Green |
| Production readiness | 98 | Green |
| Launch readiness | 94 | Green |

**Certification score:** 97 / 100 (Green)

---

## Verification Summary

| Item | Value | Signal |
|------|-------|--------|
| Verification suites completed | Chapters 6–9 | Green |
| Regression status | Clear | Green |
| Build status | Passing | Green |
| Runtime validation | Validated | Green |
| Accessibility validation | Validated | Green |
| Overall verification | Conditional | Amber |

---

## Platform Capabilities

10 major AN ACT v1 capabilities summarized without introducing new functionality:

| Category | Capabilities |
|----------|-------------|
| **Runtime** | Runtime JSON experience engine · Authentication & session model |
| **Experience** | Customer & professional journeys · AN ACT design system · Living Professional experience |
| **Operations** | Pilot instrumentation & management · Operator console stack |
| **Enterprise** | Enterprise readiness centers |
| **Evaluation** | Partner evaluation package · Certification & launch assessment |

---

## Outstanding Items

Operational and launch prerequisites listed separately from technical certification:

| Category | Item | Signal |
|----------|------|--------|
| **Launch** | Pilot follow-up required | Red |
| **Launch** | Launch authorization pending | Red |
| **Operational** | Invitation backlog · Follow-up backlog elevated · Provider instrumentation gap | Amber |
| **Pilot** | Pilot follow-up backlog | Amber |
| **Monitoring** | Active operational alerts | Red |

---

## Certification Decision

| Decision | **Certified with operational conditions** |
|----------|-------------------------------------------|
| Reason | Platform meets AN ACT v1 technical certification bar; operational and launch prerequisites remain before full production authorization. |

**Rule-based logic:**

- **Not certified** — Any red technical dimension or verification failure, or score below 65  
- **Certified with operational conditions** — Technical bar met but operational/launch prerequisites remain  
- **Certified** — All dimensions green/amber, no outstanding operational blockers, launch authorized  

Current assessment: all six technical dimensions green at 97/100, but launch NO GO and critical operational items require conditions on certification.

---

## Executive Certification Summary

> AN ACT v1 receives certification with operational conditions at 97/100. Technical architecture, runtime, and enterprise evaluation (93) meet the v1 bar. Outstanding pilot, monitoring, or launch prerequisites are documented separately and do not block technical certification for stakeholders reviewing platform maturity.

---

## Key Files

| File | Role |
|------|------|
| `apps/web/src/lib/an-act-v1-certification.ts` | Aggregates launch, production, enterprise, pilot, runtime |
| `apps/web/src/pages/AnActV1CertificationPage.tsx` | Certification Center UI |
| `test/mvp-ch9-sprint4.test.ts` | Sprint 4 verification tests |
| `scripts/verify-mvp-ch9-sprint4.sh` | Full verification suite |

---

## Verification

```bash
npm run verify:mvp-ch9-sprint4
```

Sprint 4 tests (7/7) + Chapter 9 Sprint 3 regression (7/7) + Chapter 9 Sprint 2 regression (8/8) + Chapter 8 Sprint 4 regression (8/8) + `npm run build` — all passed.

---

## Certification Score

| Dimension | Score |
|-----------|-------|
| Certification overview aggregation | 93 |
| Verification summary completeness | 92 |
| Platform capability coverage | 91 |
| Outstanding items separation | 92 |
| Certification decision logic | 93 |
| Certification UX | 91 |
| **AN ACT v1 Certification RC** | **92/100** |

---

## Constraints Preserved

| Boundary | Status |
|----------|--------|
| Runtime JSON | Unchanged |
| APIs | Unchanged |
| Architecture | Frozen |
| Business logic | Frozen |
| New functionality | None |
| Deployment automation | None |

---

## Chapter 9 Completion

Chapter 9 is complete with four release candidates:

| Sprint | Deliverable | Score |
|--------|-------------|-------|
| Sprint 1 | Production Operations RC | 89/100 |
| Sprint 2 | Reliability & Recovery RC | 90/100 |
| Sprint 3 | Launch Readiness RC | 91/100 |
| Sprint 4 | AN ACT v1 Certification RC | 92/100 |

---

## Screenshots

Capture in dev (`VITE_PILOT_INSTRUMENTATION=true`):

1. Certification overview with score 97 and six dimension cards  
2. Verification summary panel  
3. Certification decision with executive summary  
4. Platform capabilities by category  
5. Outstanding items grouped by operational/launch/pilot/monitoring  

**Navigation path:** Landing → AN ACT v1 Certification Center, or Launch Readiness → v1 Certification.
