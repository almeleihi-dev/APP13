# P3 — Marketplace Experience

**Phase:** P3 (UI + API integration for marketplace search and results)  
**Status:** Implemented — read-only MVP marketplace flow  
**Date:** 2026-06-19

---

## Summary

P3 connects the customer request flow (P1), provider catalog (P2 fixtures), workflow orchestrator, AI-5 matching, and AI-4 trust into a marketplace-facing experience. The UI performs **no intelligence logic** — it validates search input, calls `POST /ai/workflow/analyze`, and projects the unified response into marketplace cards and reusable provider cards.

---

## Architecture

```
Marketplace Search Page
        │
        ▼
marketplace-search.ts
        │
        ▼
marketplace-client.ts ──POST──▶ /ai/workflow/analyze
        │                              │
        │                              ▼
        │                   Workflow Orchestrator
        │                   (AI-2 → AI-5 → AI-6 → AI-7 → AI-3 → AI-4)
        ▼
marketplace-results.ts + provider-card.ts
        │
        ▼
Marketplace Results Page (cards + provider list)
```

### Module layout

```
src/ui/marketplace/
  types.ts                   UI DTOs and card view models
  marketplace-payload.ts     Form → workflow request mapping + MVP fixtures
  marketplace-client.ts      HTTP integration client
  index.ts

src/ui/pages/
  marketplace-search.ts      Search page + submit flow
  marketplace-results.ts     Result projection + response card rendering
  provider-card.ts           Reusable provider card builder + renderer
```

---

## Marketplace Search Page

| Field | Required | Maps to |
|-------|----------|---------|
| `request_text` | Yes | `requirement_text` |
| `budget` | No | `customer_budget` |
| `preferred_days` | No | `customer_days` |
| `category` | No | `profession` (requirement hint) |

Submit button: **Analyze & Find Providers**

MVP provider candidates reuse `MVP_DEMO_PROVIDERS` from the workflow integration fixture.

---

## Marketplace Results Page

| Card | Source |
|------|--------|
| Request Summary | Category hint / requirement actions, readiness, summary price, contract risk |
| Top Provider | Selected provider, profession hint, AI-4 trust, AI-5 availability component |
| Pricing | AI-6 price range (minimum, recommended, premium) |
| Negotiation | AI-7 negotiation output |
| Contract | AI-3 contract readiness, escrow strategy, milestone count |
| Marketplace Match | AI-5 top match recommendation, score, ranking position |
| Provider Cards | AI-5 ranked matches + candidate catalog + AI-4 trust for selected provider |

### Provider card projection

Each ranked provider card displays:

| Field | Source |
|-------|--------|
| Provider ID / display name | Candidate catalog skills + provider ID |
| Trust score | AI-4 trust (selected) or candidate trust score / AI-5 trust component |
| Trust tier / live frame | AI-4 trust (selected provider only) |
| Availability | AI-5 availability component or candidate estimated days |
| Price position | Display bucket from candidate price vs AI-6 price range |

No additional trust or matching calculations are performed in the UI layer.

---

## API integration

```typescript
import { createMarketplaceClient } from "./ui/marketplace/index.js";

const client = createMarketplaceClient({
  baseUrl: "https://api.example.com",
  authToken: process.env.API_TOKEN,
});

const workflow = await client.analyzeAndFindProviders({
  request_text: "Build a React dashboard",
  budget: 15000,
  category: "software_developer",
});
```

For in-process tests, pass an `executor` that delegates to `WorkflowIntelligenceService.analyze()`.

---

## Constraints

- Read-only UI — no database writes
- No LLM or external AI
- AI-1 through AI-8 engines unchanged
- Orchestrator unchanged
- No duplicated scoring logic
- Fully typed DTOs in `src/ui/marketplace/types.ts`

---

## Verification

```bash
npm run test:p3
npm run verify:p3
```

`verify:p3` runs:

1. `test:p3`
2. `build`
3. `lint:imports`

---

## Tests

| File | Coverage |
|------|----------|
| `test/ui-marketplace-search.test.ts` | Form model, validation, payload mapping, client, analyze flow, HTTP errors |
| `test/ui-marketplace-results.test.ts` | Card projection, provider list, edge cases, HTML render |
| `test/ui-provider-card.test.ts` | Provider card builder, multi-provider rendering, empty state |
