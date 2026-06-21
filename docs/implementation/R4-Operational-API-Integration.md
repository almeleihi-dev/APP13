# R4 — Operational API Integration

**Phase:** R4 (Wire P5/P6/P7 operational clients to R1 integration layer)  
**Status:** Implemented — escrow, execution, and evidence clients use R1 API mode  
**Date:** 2026-06-19

---

## Summary

R4 connects the P5 Escrow, P6 Execution, and P7 Evidence UI clients to the R1 API Integration Layer for real HTTP calls to operational read endpoints. Executor injection and MVP fixture/demo mode are preserved. No AI engines, domain services, EscrowService, ExecutionService, or evidence domain logic were modified.

---

## Architecture

```
P5 EscrowClient / P6 ExecutionClient / P7 EvidenceClient
        │
        ├── executor (tests / demo — unchanged)
        ├── fixture mode (no baseUrl — unchanged)
        └── API mode (baseUrl configured)
                │
                ▼
        escrow-api-transport.ts
        execution-api-transport.ts
        evidence-api-transport.ts
                │
                ▼
        R1 RequestExecutor → operational GET endpoints
```

### Resolution order

| Priority | Mode | Trigger |
|----------|------|---------|
| 1 | Executor | Matching executor provided |
| 2 | API | `baseUrl` configured |
| 3 | Fixture | No executor, no baseUrl (demo default) |

---

## API Endpoints

### Escrow (P5)

| Method | Endpoint | Client method |
|--------|----------|---------------|
| GET | `/escrow/:id` | `getEscrowOverviewWithApiResult()` |
| GET | `/escrow/:id/history` | `getEscrowHistoryWithApiResult()` |

### Execution (P6)

| Method | Endpoint | Client method |
|--------|----------|---------------|
| GET | `/execution/:id/dashboard` | `getExecutionDashboardWithApiResult()` |
| GET | `/execution/milestone/:id` | `getMilestoneDetailsWithApiResult()` |

### Evidence (P7)

| Method | Endpoint | Client method |
|--------|----------|---------------|
| GET | `/evidence/:id` | `getEvidenceOverviewWithApiResult()` |
| GET | `/evidence/item/:id` | `getEvidenceDetailsWithApiResult()` |
| GET | `/evidence/:id/timeline` | `getAttestationTimelineWithApiResult()` |

---

## Files touched

| File | Change |
|------|--------|
| `src/ui/shared/escrow-api-transport.ts` | Escrow R1 transport |
| `src/ui/shared/execution-api-transport.ts` | Execution R1 transport |
| `src/ui/shared/evidence-api-transport.ts` | Evidence R1 transport |
| `src/ui/escrow/escrow-client.ts` | R1 API mode + typed ApiResult methods |
| `src/ui/execution/execution-client.ts` | R1 API mode + typed ApiResult methods |
| `src/ui/evidence/evidence-client.ts` | R1 API mode + typed ApiResult methods |
| `src/ui/escrow/types.ts` | `requestExecutor`, `timeoutMs` |
| `src/ui/execution/types.ts` | `requestExecutor`, `timeoutMs` |
| `src/ui/evidence/types.ts` | `requestExecutor`, `timeoutMs` |

---

## Verification

```bash
npm run test:r4
npm run verify:r4
```

Regression:

```bash
npm run test:p5
npm run test:p6
npm run test:p7
npm run test:r1
```

`verify:r4` runs:

1. `test:r4`
2. `build`
3. `lint:imports`

---

## Tests

| File | Coverage |
|------|----------|
| `test/r4-escrow-client-api.test.ts` | Success, not found, unauthorized, timeout, executor, fixture |
| `test/r4-execution-client-api.test.ts` | Success, validation, unauthorized, timeout, executor, fixture |
| `test/r4-evidence-client-api.test.ts` | Success, validation, unauthorized, timeout, executor, fixture |

---

## Constraints

- No AI engine changes
- No domain service changes
- No trust, escrow, execution, or evidence calculations in UI
- No duplicated business rules
- No DB writes
- Client wiring only
