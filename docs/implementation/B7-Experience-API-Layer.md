# B7 — Experience API Layer

**Phase:** B7 (Backend-for-Frontend read API for P5–P10 / R4–R5)  
**Status:** Implemented  
**Date:** 2026-06-19

---

## Summary

B7 implements the missing Experience Read API layer identified in S1. A BFF projection layer under `src/experience/` assembles `*ExperienceSource` DTOs expected by P5–P10 UI clients from existing application services and repositories. No new business rules, AI changes, or database migrations were introduced.

---

## Architecture

```
P5–P10 UI Clients (R4/R5 transports)
        │ GET /escrow/* /execution/* /evidence/* /disputes/* /trust/* /platform/*
        ▼
src/api/routes/*.ts (thin HTTP handlers)
        ▼
src/experience/*-experience-service.ts (read orchestration)
        ▼
src/experience/assemblers/*.ts (presentation mapping only)
        ▼
Existing services & repositories
  - EscrowService / EscrowRepository
  - ContractEngineService
  - ExecutionService / ExecutionRepository
  - EvaluationService
  - IssueService
  - ProfileService
  - TrustIntelligenceService
  - ProviderIntelligenceService
```

---

## Endpoints

| Method | Path | Service | UI client |
|--------|------|---------|-----------|
| GET | `/escrow/:id` | EscrowExperienceService | P5 |
| GET | `/escrow/:id/history` | EscrowExperienceService | P5 |
| GET | `/execution/:id/dashboard` | ExecutionExperienceService | P6 |
| GET | `/execution/milestone/:id` | ExecutionExperienceService | P6 |
| GET | `/evidence/:id` | EvidenceExperienceService | P7 |
| GET | `/evidence/item/:id` | EvidenceExperienceService | P7 |
| GET | `/evidence/:id/timeline` | EvidenceExperienceService | P7 |
| GET | `/disputes/:id` | DisputeExperienceService | P8 |
| GET | `/disputes/:id/details` | DisputeExperienceService | P8 |
| GET | `/disputes/:id/timeline` | DisputeExperienceService | P8 |
| GET | `/trust/:id` | TrustExperienceService | P9 |
| GET | `/trust/provider/:id` | TrustExperienceService | P9 |
| GET | `/trust/:id/timeline` | TrustExperienceService | P9 |
| GET | `/platform/home` | PlatformExperienceService | P10 |
| GET | `/platform/overview` | PlatformExperienceService | P10 |

Routes use the **exact paths** expected by R4/R5 UI transports (no `/v1` prefix) for compatibility.

All routes require authentication (`authRequired: true`).

---

## Files created

| Path | Purpose |
|------|---------|
| `src/experience/experience-dependencies.ts` | Dependency interface |
| `src/experience/format.ts` | Presentation format helpers |
| `src/experience/assemblers/*.ts` | Domain → ExperienceSource mapping |
| `src/experience/*-experience-service.ts` | Read orchestration services |
| `src/experience/index.ts` | Factory `createExperienceServices()` |
| `src/api/routes/escrow.ts` | Escrow experience routes |
| `src/api/routes/execution.ts` | Execution experience routes |
| `src/api/routes/evidence-read.ts` | Evidence experience routes |
| `src/api/routes/disputes-read.ts` | Dispute experience routes |
| `src/api/routes/trust.ts` | Trust experience routes |
| `src/api/routes/platform.ts` | Platform experience routes |
| `test/helpers/experience-server-integration.ts` | Fastify test harness |
| `test/b7-*.test.ts` | Route and integration tests |

---

## Files modified

| Path | Change |
|------|--------|
| `src/api/server.ts` | Register experience routes; add `experience` to `AppDependencies` |
| `src/index.ts` | Wire `EscrowService` + `createExperienceServices()` |
| `test/s1-system-verification.test.ts` | Expect 15 experience routes implemented |
| `package.json` | `test:b7`, `verify:b7` |

---

## Design constraints honored

- **No AI engine changes**
- **No domain logic changes**
- **No database schema changes**
- **No duplicated trust/escrow/execution/evidence/dispute/workflow rules** — trust scores via `TrustIntelligenceService.calculate()`, escrow state from `EscrowRepository`, disputes from `IssueService`
- **Presentation-only assemblers** map existing reads into UI DTO shapes

---

## Verification

```bash
npm run verify:b7
npm run test:r4
npm run test:r5
npm run verify:s1
```

---

## Notes

- Dispute routes map `IssueService` records to `DisputeExperienceSource` (issue ID = dispute ID)
- Trust routes use `ProviderIntelligenceService.profile()` + `TrustIntelligenceService.calculate()` — no custom trust scoring in the BFF
- Platform routes aggregate contract/escrow counts via `ContractEngineService` and `EscrowService`
