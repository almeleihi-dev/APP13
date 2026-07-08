# R5 — Governance API Integration

**Phase:** R5 (Wire P8/P9/P10 governance clients to R1 integration layer)  
**Status:** Implemented — dispute, trust, and platform clients use R1 API mode  
**Date:** 2026-06-19

---

## Summary

R5 connects the P8 Dispute, P9 Trust Center, and P10 Platform Home UI clients to the R1 API Integration Layer for real HTTP calls to governance read endpoints. Executor injection and MVP fixture/demo mode are preserved. No AI engines, domain services, orchestrator, trust engine, dispute domain logic, or database logic were modified.

---

## Architecture

```
P8 DisputeClient / P9 TrustClient / P10 PlatformClient
        │
        ├── executor (tests / demo — unchanged)
        ├── fixture mode (no baseUrl — unchanged)
        └── API mode (baseUrl configured)
                │
                ▼
        dispute-api-transport.ts
        trust-api-transport.ts
        platform-api-transport.ts
                │
                ▼
        R1 RequestExecutor → governance GET endpoints
```

### Resolution order

| Priority | Mode | Trigger |
|----------|------|---------|
| 1 | Executor | Matching executor provided |
| 2 | API | `baseUrl` configured |
| 3 | Fixture | No executor, no baseUrl (demo default) |

For P8 details/timeline and P9 report/timeline, when a specific executor is absent the client falls back to the dashboard/center executor before API or fixture resolution — preserving pre-R5 demo behavior.

---

## API Endpoints

### Dispute (P8)

| Method | Endpoint | Client method |
|--------|----------|---------------|
| GET | `/disputes/:id` | `getDisputeDashboardWithApiResult()` |
| GET | `/disputes/:id/details` | `getDisputeDetailsWithApiResult()` |
| GET | `/disputes/:id/timeline` | `getResolutionTimelineWithApiResult()` |

### Trust (P9)

| Method | Endpoint | Client method |
|--------|----------|---------------|
| GET | `/trust/:id` | `getTrustCenterWithApiResult()` |
| GET | `/trust/provider/:id` | `getProviderTrustReportWithApiResult()` |
| GET | `/trust/:id/timeline` | `getTrustTimelineWithApiResult()` |

### Platform (P10)

| Method | Endpoint | Client method |
|--------|----------|---------------|
| GET | `/platform/home` | `getPlatformHomeWithApiResult()` |
| GET | `/platform/overview` | `getPlatformOverviewWithApiResult()` |

---

## Files touched

| File | Change |
|------|--------|
| `src/ui/shared/dispute-api-transport.ts` | Dispute R1 transport |
| `src/ui/shared/trust-api-transport.ts` | Trust R1 transport |
| `src/ui/shared/platform-api-transport.ts` | Platform R1 transport |
| `src/ui/dispute/dispute-client.ts` | R1 API mode + typed ApiResult methods |
| `src/ui/trust/trust-client.ts` | R1 API mode + typed ApiResult methods |
| `src/ui/platform/platform-client.ts` | R1 API mode + typed ApiResult methods |
| `src/ui/dispute/types.ts` | `requestExecutor`, `timeoutMs` |
| `src/ui/trust/types.ts` | `requestExecutor`, `timeoutMs` |
| `src/ui/platform/types.ts` | `requestExecutor`, `timeoutMs` |
| `test/r5-dispute-client-api.test.ts` | Dispute API integration tests |
| `test/r5-trust-client-api.test.ts` | Trust API integration tests |
| `test/r5-platform-client-api.test.ts` | Platform API integration tests |
| `package.json` | `test:r5`, `verify:r5` scripts |

---

## Verification

```bash
npm run verify:r5
npm run test:p8
npm run test:p9
npm run test:p10
npm run test:r1
```

---

## Constraints honored

- No AI-1 through AI-8 modifications
- No AI-Orchestrator modifications
- No trust engine, dispute domain, escrow, execution, evidence, workflow, or database logic changes
- No duplicated business rules — clients only transport and project existing snapshots
- Existing throwing methods preserved; new `*WithApiResult()` methods return typed `ApiResult`
- No DB writes
