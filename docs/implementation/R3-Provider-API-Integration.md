# R3 — Provider API Integration

**Phase:** R3 (Wire P2 Provider client to R1 integration layer)  
**Status:** Implemented — provider client uses R1 API mode for `POST /ai/providers/profile`  
**Date:** 2026-06-19

---

## Summary

R3 connects the P2 Provider Experience client to the R1 API Integration Layer for real HTTP calls to `POST /ai/providers/profile`, which routes to AI-8 Provider Intelligence on the server. Executor injection and existing page behavior are preserved. No AI engines, provider intelligence rules, or domain services were modified.

---

## Architecture

```
P2 ProviderClient
        │
        ├── executor (tests / demo — unchanged)
        └── API mode (default)
                │
                ▼
        provider-api-transport.ts
                │
                ▼
        R1 RequestExecutor → POST /ai/providers/profile
                │
                ▼
        AI-8 Provider Intelligence (server)
```

### Files touched

| File | Change |
|------|--------|
| `src/ui/shared/provider-api-transport.ts` | Shared R1 transport for provider profile endpoint |
| `src/ui/provider/provider-client.ts` | R1 API mode + typed `*WithApiResult` methods |
| `src/ui/provider/types.ts` | `requestExecutor`, `timeoutMs` options |

---

## API Mode Behavior

| Mode | Trigger | Behavior |
|------|---------|----------|
| Executor | `executor` option provided | In-memory/test path (unchanged) |
| API | No executor | R1 `RequestExecutor` POST `/ai/providers/profile` |

### Client methods

| Method | Returns | On failure |
|--------|---------|------------|
| `analyzeProvider()` | `ProviderProfileResult` | Throws `ProviderClientError` |
| `analyzeProviderWithApiResult()` | `ApiResult<ProviderProfileResult>` | Returns unified error envelope |
| `postProviderProfile()` | `ProviderProfileResult` | Throws `ProviderClientError` |
| `postProviderProfileWithApiResult()` | `ApiResult<ProviderProfileResult>` | Returns unified error envelope |

Errors map from R1 `ApiResult` to `ProviderClientError` preserving `status` and `code`.

---

## Endpoint

```
POST /ai/providers/profile
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
npm run test:r3
npm run verify:r3
```

Regression:

```bash
npm run test:p2
npm run test:r1
```

`verify:r3` runs:

1. `test:r3`
2. `build`
3. `lint:imports`

---

## Tests

| File | Coverage |
|------|----------|
| `test/r3-provider-client-api.test.ts` | Success, validation, unauthorized, timeout, executor, typed ApiResult, fixture compatibility |

---

## Constraints

- No AI engine changes
- No provider intelligence rule duplication
- No domain or database changes
- No UI page behavior changes
- Client wiring only
