# R1 — API Integration Layer

**Phase:** R1 (HTTP integration infrastructure for P1–P10 clients)  
**Status:** Implemented — reusable API client, response/error mapping, request executor  
**Date:** 2026-06-19

---

## Summary

R1 introduces a read-only HTTP integration infrastructure layer under `src/integration/` that P1–P10 UI clients can adopt to replace demo fixture execution paths with real API calls. The layer provides typed HTTP verbs, unified response envelopes, HTTP status error mapping, timeout enforcement, bearer token support, and a centralized request executor. No AI engines, domain services, workflow logic, or UI modules were modified in this phase.

---

## Architecture

```
UI Client (P1–P10, future wiring)
        │
        ▼
request-executor.ts
        │
        ├── map responses (api-response.ts)
        ├── map errors (api-errors.ts)
        └── enforce timeout
        │
        ▼
api-client.ts
        │
        ├── GET / POST / PUT / PATCH / DELETE
        ├── JSON serialization + parsing
        ├── bearer token headers
        └── AbortController timeout
        │
        ▼
Remote API (local / test config)
```

### Module layout

```
src/integration/
  api-config.ts        Environment config (local, test)
  api-response.ts      Unified success/error/validation response shape
  api-errors.ts        Typed HTTP error mapping
  api-client.ts        Reusable HTTP client (no external deps)
  request-executor.ts  Centralized execution pipeline
  index.ts
```

---

## Unified Response Shape

```typescript
{
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
```

Successful executor calls also return request metadata:

```typescript
{
  response: ApiResponse<T>;
  meta: {
    status: number;
    method: string;
    path: string;
    durationMs: number;
    requestId?: string;
  };
}
```

---

## Error Mapping

| HTTP Status | Typed Error |
|-------------|-------------|
| 400, 422 | `ValidationError` |
| 401 | `UnauthorizedError` |
| 403 | `ForbiddenError` |
| 404 | `NotFoundError` |
| 408 | `TimeoutError` |
| 409 | `ConflictError` |
| Other | `ApiError` |

When `throwOnError: true`, the request executor throws mapped typed errors. By default, failed responses are returned in the unified envelope without throwing.

---

## API Config

| Environment | Default Base URL | Timeout |
|-------------|------------------|---------|
| `local` | `http://localhost:3000` | 30s |
| `test` | `http://127.0.0.1:0` | 5s |

Config also exposes `retryCount` for future adoption. R1 does not implement retry execution.

---

## Integration Rules

- P1–P10 clients are **not refactored** in R1
- Infrastructure only — future phases can inject `RequestExecutor` or `ApiClient`
- No external HTTP dependencies (uses native `fetch`)
- No business logic in the integration layer

---

## Verification

```bash
npm run test:r1
npm run verify:r1
```

`verify:r1` runs:

1. `test:r1`
2. `build`
3. `lint:imports`

---

## Tests

| File | Coverage |
|------|----------|
| `test/api-client.test.ts` | GET/POST/PUT/PATCH/DELETE, auth, query, timeout, typed responses |
| `test/api-errors.test.ts` | Validation, unauthorized, forbidden, not found, conflict, response mapping |
| `test/request-executor.test.ts` | Success, validation failure, unauthorized, not found, timeout, error mapping |

---

## Constraints

- No AI engine changes
- No workflow, trust, escrow, execution, or dispute logic changes
- No database changes
- No UI changes
- Infrastructure only
