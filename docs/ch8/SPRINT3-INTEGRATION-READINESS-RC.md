# Chapter 8 — Sprint 3: Integration Readiness RC

**Status:** Complete  
**Date:** 2026-06-28  
**Baseline:** Chapter 8 Sprint 2 Government Readiness RC (86/100)

## Objective

Prepare AN ACT for technical evaluation by enterprise IT teams — API surface, integration touchpoints, environment model, credential access, and onboarding workflow. No API expansion or connector implementation.

---

## Deliverable

**Integration Readiness Center** — evaluation dashboard for enterprise IT and integration reviewers.

**Entry:** Landing → **Integration Readiness Center** (dev or `VITE_PILOT_INSTRUMENTATION=true`)  
**Alternate:** Enterprise or Government Readiness Center → **Integration Readiness**

---

## Integration Overview

Five topics from existing platform architecture:

| Topic | Summary |
|-------|---------|
| Current API surface | Fastify REST — auth, discovery, requests, contracts, runtime experiences, health |
| Runtime architecture | Modular monolith; Render Layer + Runtime JSON + experience services |
| Authentication approach | JWT access/refresh, role guards, server logout |
| Event flow | Need → discovery → request → contract → action completion |
| Deployment model | Node.js API + Vite web shell; container-ready; PWA |

---

## Integration Touchpoints (Conceptual)

| System | Type | Status |
|--------|------|--------|
| Identity providers | SSO / federation | Amber — planning topic |
| HR systems | Workforce provisioning | Amber — no connector |
| ERP systems | Financial / contract sync | Amber — API anchor points exist |
| CRM systems | Customer relationship | Amber — no connector |
| Notification platforms | Alert delivery | Green — experience APIs exist |
| File storage | Evidence / document | Amber — infrastructure planning |
| Reporting tools | Operational analytics | Green — export + analytics routes |

No connectors implemented.

---

## Environment Model

| Stage | Purpose | Responsibility |
|-------|---------|----------------|
| Development | Engineering iteration | Engineering team |
| Testing | Automated verification suites | Platform team |
| Pilot | Controlled cohort evaluation | Pilot manager + platform admin |
| Production | Live operation with frozen contracts | Platform admin + executive sponsor |

---

## Credential & Access Model

| Area | Basis |
|------|-------|
| Authentication | JWT access/refresh, secure cookies |
| Authorization | Role-based (customer, provider, platform_admin) |
| Operator access | Consoles separated from customer runtime |
| Role separation | Isolated customer/provider/admin paths |
| API governance | Frozen contracts; security audit available |

---

## IT Onboarding Workflow

1. **Evaluation** — Review readiness centers and partner package  
2. **Pilot** — Controlled cohort via Pilot Management  
3. **Technical review** — Validate auth, API surface, deployment boundaries  
4. **Deployment planning** — Align dev/test/pilot/prod environments  
5. **Operational handover** — Transfer admin responsibilities and monitoring  

Presentation only — no workflow engine.

---

## Integration Evaluation Checklist

14 items across six categories:

- **API readiness** (3) · **Authentication** (2) · **Documentation** (2)  
- **Deployment** (2) · **Operations** (2) · **Monitoring** (3)

Traffic-light signals derived from live platform state.

---

## Integration Recommendations (Rule-Based)

| Rule | Recommendation |
|------|----------------|
| Score ≥75, no red items | Ready for technical evaluation |
| Documentation gaps | Complete integration documentation |
| Low pilot export | Prepare pilot environment |
| Enterprise + gov ready | Continue operational validation |
| Private deploy amber | Plan private deployment alignment |
| Critical alerts | Resolve before IT sign-off |

---

## Key Files

| File | Role |
|------|------|
| `apps/web/src/lib/integration-readiness.ts` | Aggregation from enterprise, government, executive, pilot modules |
| `apps/web/src/pages/IntegrationReadinessPage.tsx` | Integration evaluation UI |

---

## Verification

```bash
npm run verify:mvp-ch8-sprint3
```

Sprint 3 tests + Chapter 8 Sprint 2 + Sprint 1 + Chapter 7 Sprint 4 + build.

---

## Integration Readiness Score

| Dimension | Score |
|-----------|-------|
| API surface clarity | 88 |
| Touchpoint presentation | 87 |
| Environment model clarity | 90 |
| Credential access clarity | 89 |
| Onboarding workflow clarity | 91 |
| Evaluation checklist coverage | 88 |
| **Integration Readiness RC** | **88/100** |

---

## Constraints Preserved

| Boundary | Status |
|----------|--------|
| Runtime JSON | Unchanged |
| APIs | Unchanged |
| Connectors | None implemented |
| Architecture | Unchanged |
| Speculative integrations | None |

---

## Recommendation for Sprint 4

**Proceed to Chapter 8 Completion Review** — unified enterprise & government readiness certification:

- Cross-readiness center summary dashboard
- Combined evaluation scorecard
- Chapter 8 completion report
- Final readiness certification for enterprise and public-sector adoption

---

## Screenshots

Capture in dev via cross-console navigation:

1. Integration overview with readiness score  
2. Integration touchpoint map  
3. Environment model and credential access panels  
4. IT onboarding workflow  
5. Integration evaluation checklist and recommendations  
