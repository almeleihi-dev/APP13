# P1 — Intelligent Request Experience

**Phase:** P1 (UI + API integration for intelligence workflow)  
**Status:** Implemented — read-only MVP request flow  
**Date:** 2026-06-19

---

## Summary

P1 exposes the existing workflow orchestrator to a lightweight customer request experience. The UI layer performs **no intelligence logic** — it validates form input, calls `POST /ai/workflow/analyze`, and projects the unified response into typed result cards.

---

## Architecture

```
Customer Request Page
        │
        ▼
request-analysis.ts
        │
        ▼
workflow-client.ts ──POST──▶ /ai/workflow/analyze
        │                         │
        │                         ▼
        │              Workflow Orchestrator
        │              (AI-2 → AI-5 → AI-6 → AI-7 → AI-3 → AI-4)
        ▼
request-result.ts
        │
        ▼
Workflow Result Page (response cards)
```

### Module layout

```
src/ui/workflow/
  types.ts                 UI DTOs and card view models
  workflow-payload.ts      Form → workflow request mapping + MVP providers
  workflow-client.ts       HTTP integration client
  index.ts

src/ui/pages/
  request-analysis.ts      Customer request page + submit flow
  request-result.ts        Result projection + card rendering
```

---

## Customer Request Page

| Field | Required | Maps to |
|-------|----------|---------|
| `request_text` | Yes | `requirement_text` |
| `budget` | No | `customer_budget` |
| `preferred_days` | No | `customer_days` |

Submit button: **Analyze Request**

MVP provider candidates are supplied from `MVP_DEMO_PROVIDERS` (integration fixture, not intelligence rules).

---

## Workflow Result Page

| Card | Source |
|------|--------|
| Request Summary | Customer input + requirement missing questions |
| Requirement Classification | AI-2 requirement output |
| Top Provider | AI-5 matching output |
| Trust | AI-4 trust output |
| Pricing | AI-6 pricing + summary recommended price |
| Negotiation | AI-7 negotiation output |
| Contract | AI-3 contract output (readiness, escrow, risk) |

---

## API integration

```typescript
const client = createWorkflowClient({
  baseUrl: "https://api.example.com",
  authToken: "<session-token>",
});

const result = await client.analyzeRequest({
  request_text: "...",
  budget: 15000,
  preferred_days: 14,
});
```

Or full page flow:

```typescript
const analysis = await analyzeCustomerRequest(form, {
  baseUrl: "https://api.example.com",
  authToken: "<session-token>",
});

renderWorkflowResultPage(createRequestResultPageModel(analysis.workflow, analysis.request));
```

---

## Boundaries

| Constraint | P1 compliance |
|------------|---------------|
| No new AI engines | Reuses workflow orchestrator only |
| No rule duplication | UI reads workflow response only |
| Read-only | No database writes |
| Fully typed | DTOs in `src/ui/workflow/types.ts` |
| Deterministic projection | Same workflow response → same cards |

---

## Testing

```bash
npm run test:p1
npm run verify:p1
npm run build
npm run lint:imports
```

Test files:

- `test/ui-request-analysis.test.ts` — form, payload, client, analyze flow
- `test/ui-workflow-result.test.ts` — card projection and rendering

---

## Out of scope (by design)

- Provider search / discovery UI
- Contract creation or persistence
- Authentication UI (token supplied by host app)
- New intelligence rules or engines
