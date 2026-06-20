# P4 — Contract Experience

**Phase:** P4 (UI for read-only contract review)  
**Status:** Implemented — read-only contract review flow  
**Date:** 2026-06-19

---

## Summary

P4 exposes AI-3 Contract Intelligence and AI-Orchestrator workflow outputs through a read-only contract review experience. The UI validates workflow input, projects orchestrator responses into nine summary cards, and renders review pages without duplicating intelligence logic or writing to the database.

---

## Architecture

```
Contract Workflow Input
        │
        ▼
contract-client.ts ──POST──▶ /ai/workflow/analyze
        │                              │
        │                              ▼
        │                   Workflow Orchestrator
        │                   (AI-2 → AI-5 → AI-6 → AI-7 → AI-3 → AI-4)
        ▼
contract-review.ts + contract-summary.ts
        │
        ▼
Contract Review / Summary Pages
```

### Module layout

```
src/ui/contract/
  types.ts                 UI DTOs and card view models
  contract-payload.ts      Workflow payload + review context + validation
  contract-client.ts       Workflow integration client
  index.ts

src/ui/pages/
  contract-review.ts       Review page + preview + full summary embed
  contract-summary.ts      Nine-card projection + rendering helpers
```

---

## Contract Review Page

Accepts a workflow orchestrator result plus optional review context:

| Context field | Purpose |
|---------------|---------|
| `customer_id` | Customer identifier display |
| `customer_label` | Customer display name |
| `provider_id` | Override provider ID |
| `category` | Project category hint |
| `duration_days` | Contract duration display |
| `requirement_text` | Requirement summary display |

Validation ensures workflow status and requirement output are present. No intelligence rules are applied in the UI layer.

---

## Contract Summary Cards

| Card | Source |
|------|--------|
| A. Contract Summary | AI-3 readiness/risk + context category/duration |
| B. Parties | Context customer + workflow provider/trust |
| C. Scope | AI-2 actions/requirements + AI-3 scope of work |
| D. Milestones | AI-3 milestones + escrow release structure |
| E. Pricing | AI-6 price range + AI-7 negotiated price |
| F. Negotiation | AI-7 negotiation output |
| G. Trust | AI-4 trust output |
| H. Escrow | AI-3 escrow plan |
| I. Risk | AI-3 risk profile |

---

## API integration

```typescript
import { createContractClient } from "./ui/contract/index.js";

const client = createContractClient({
  baseUrl: "https://api.example.com",
  authToken: process.env.API_TOKEN,
});

const review = await client.analyzeContractReview({
  request_text: "Build a React dashboard",
  budget: 15000,
  preferred_days: 14,
  category: "software_developer",
  customer_label: "Demo Customer",
});
```

For in-process tests, pass an `executor` delegating to `WorkflowIntelligenceService.analyze()`.

Existing workflow results can also be reviewed directly:

```typescript
client.reviewWorkflow({ workflow, context });
```

---

## Constraints

- Read-only UI — no database writes
- No LLM or external AI
- AI-1 through AI-8 engines unchanged
- Orchestrator unchanged
- No duplicated intelligence logic
- Fully typed DTOs in `src/ui/contract/types.ts`

---

## Verification

```bash
npm run test:p4
npm run verify:p4
```

`verify:p4` runs:

1. `test:p4`
2. `build`
3. `lint:imports`

---

## Tests

| File | Coverage |
|------|----------|
| `test/ui-contract-review.test.ts` | Validation, payload, client, review flow, HTML, edge cases |
| `test/ui-contract-summary.test.ts` | Card projection, placeholders, HTML render |
