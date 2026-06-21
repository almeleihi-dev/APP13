# R2 — Connect UI To Real APIs

**Phase:** R2 (Wire P1/P3/P4 UI clients to R1 integration layer)  
**Status:** Implemented — workflow, marketplace, and contract clients use R1 API mode  
**Date:** 2026-06-19

---

## Summary

R2 connects the P1 Customer Request, P3 Marketplace, and P4 Contract UI clients to the R1 API Integration Layer for real HTTP calls to `POST /ai/workflow/analyze`. Executor injection and existing page behavior are preserved. No AI engines, orchestrator logic, or domain services were modified.

---

## Architecture

```
P1 WorkflowClient / P3 MarketplaceClient / P4 ContractClient
        │
        ├── executor (tests / demo — unchanged)
        └── API mode (default)
                │
                ▼
        workflow-api-transport.ts
                │
                ▼
        R1 RequestExecutor → POST /ai/workflow/analyze
```

### Files touched

| File | Change |
|------|--------|
| `src/ui/shared/workflow-api-transport.ts` | Shared R1 transport for workflow analyze endpoint |
| `src/ui/workflow/workflow-client.ts` | R1 API mode + typed `*WithApiResult` methods |
| `src/ui/marketplace/marketplace-client.ts` | R1 API mode + typed `*WithApiResult` methods |
| `src/ui/contract/contract-client.ts` | R1 API mode + typed `*WithApiResult` methods |
| `src/ui/workflow/types.ts` | `requestExecutor`, `timeoutMs` options |
| `src/ui/marketplace/types.ts` | `requestExecutor`, `timeoutMs` options |
| `src/ui/contract/types.ts` | `requestExecutor`, `timeoutMs` options |

---

## API Mode Behavior

| Mode | Trigger | Behavior |
|------|---------|----------|
| Executor | `executor` option provided | In-memory/test path (unchanged) |
| API | No executor | R1 `RequestExecutor` POST `/ai/workflow/analyze` |

### Typed results

Each client exposes:

- `postWorkflowAnalyze()` — returns `WorkflowAnalyzeResult`, throws client error on failure
- `postWorkflowAnalyzeWithApiResult()` — returns `ApiResult<WorkflowAnalyzeResult>`
- Client-specific wrappers: `analyzeRequestWithApiResult`, `analyzeAndFindProvidersWithApiResult`, `analyzeContractReviewWithApiResult`

Errors map from R1 `ApiResult` to existing `*ClientError` classes preserving `status` and `code`.

---

## Endpoint

All three clients call:

```
POST /ai/workflow/analyze
```

Using R1 modules:

- `api-config.ts` — base URL and timeout
- `api-client.ts` — HTTP transport
- `request-executor.ts` — execution pipeline
- `api-response.ts` — unified response envelope
- `api-errors.ts` — timeout and HTTP error mapping

---

## Verification

```bash
npm run test:r2
npm run verify:r2
```

Also confirm existing UI tests still pass:

```bash
npm run test:p1
npm run test:p3
npm run test:p4
```

`verify:r2` runs:

1. `test:r2`
2. `build`
3. `lint:imports`

---

## Tests

| File | Coverage |
|------|----------|
| `test/r2-workflow-client-api.test.ts` | Success, validation, unauthorized, timeout, executor |
| `test/r2-marketplace-client-api.test.ts` | Success, validation, unauthorized, timeout, executor |
| `test/r2-contract-client-api.test.ts` | Success, validation, unauthorized, timeout, executor, review projection |

---

## Constraints

- No AI engine changes
- No orchestrator or domain logic changes
- No duplicated intelligence rules
- No DB writes
- No UI page behavior changes (clients only)
- Infrastructure wiring only
