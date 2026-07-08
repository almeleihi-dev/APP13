# P2 — Provider Experience

**Phase:** P2 (UI + API integration for provider intelligence)  
**Status:** Implemented — read-only MVP provider flow  
**Date:** 2026-06-19

---

## Summary

P2 exposes the existing AI-8 Provider Intelligence engine to a lightweight provider-facing experience. The UI layer performs **no intelligence logic** — it validates form input, calls `POST /ai/providers/profile`, and projects the response into typed dashboard cards.

---

## Architecture

```
Provider Profile Page
        │
        ▼
provider-profile.ts
        │
        ▼
provider-client.ts ──POST──▶ /ai/providers/profile
        │                         │
        │                         ▼
        │              AI-8 Provider Intelligence
        ▼
provider-dashboard.ts
        │
        ▼
Provider Dashboard Page (response cards)
```

### Module layout

```
src/ui/provider/
  types.ts                 UI DTOs and card view models
  provider-payload.ts      Form → provider request mapping + MVP demo profile
  provider-client.ts       HTTP integration client
  index.ts

src/ui/pages/
  provider-profile.ts      Provider profile page + submit flow
  provider-dashboard.ts    Dashboard projection + card rendering
```

---

## Provider Profile Page

| Field | Required | Maps to |
|-------|----------|---------|
| `provider_id` | Yes | `provider_id` (UUID) |
| `profession` | No | `profession` |
| `profile_text` | No | `profile_text` |
| `years_experience` | No | `years_experience` |
| `certifications` | No | `certifications[]` (comma-separated) |
| `licenses` | No | `licenses[]` (comma-separated) |
| `completed_contracts` | No | `completed_contracts` |
| `completion_rate` | No | `completion_rate` (0–1) |
| `issue_rate` | No | `issue_rate` (0–1) |
| `refund_rate` | No | `refund_rate` (0–1) |
| `rating` | No | `rating` (0–5) |
| `availability_hours_per_week` | No | `availability_hours_per_week` |
| `active_contracts` | No | `active_contracts` |
| `average_price` | No | `average_price` |
| `location_tier` | No | `location_tier` (`metro`, `city`, `rural`) |

Submit button: **Analyze Provider**

MVP demo profile data is supplied from `MVP_DEMO_PROVIDER_PROFILE` (integration fixture, not intelligence rules).

---

## Provider Dashboard Page

| Card | Source |
|------|--------|
| Identity | `identity_profile` |
| Capability | `capability_profile` |
| Risk | `risk_profile` + UI display projection from availability/trust fields |
| Trust Inputs | `trust_inputs` |
| Pricing | `pricing_profile` |
| Availability | `availability_profile` |
| Matching | `matching_profile` |

### Risk card projection

AI-8 returns a single `risk_profile` enum. The dashboard adds read-only display labels for sub-risk fields using values already present in the AI-8 response:

| Display field | Projection source |
|---------------|-------------------|
| `risk_level` | `risk_profile` |
| `late_delivery_risk` | `availability_profile.available_now`, `estimated_start_days` |
| `dispute_risk` | `trust_inputs.issue_score` (display bucket) |
| `quality_risk` | `trust_inputs.rating_score`, `refund_score` (display bucket) |

No new intelligence rules are introduced — only presentation bucketing for provider-facing labels.

---

## API integration

```typescript
import { createProviderClient } from "./ui/provider/index.js";

const client = createProviderClient({
  baseUrl: "https://api.example.com",
  authToken: process.env.API_TOKEN,
});

const profile = await client.analyzeProvider({
  provider_id: "550e8400-e29b-41d4-a716-446655440000",
  profession: "software_developer",
});
```

For in-process tests or local wiring, pass an `executor` that delegates to `ProviderIntelligenceService.profile()`.

---

## Constraints

- Read-only UI — no database writes
- No LLM or external AI
- AI-1 through AI-8 engines unchanged
- Orchestrator unchanged
- Fully typed DTOs in `src/ui/provider/types.ts`

---

## Verification

```bash
npm run test:p2
npm run verify:p2
```

`verify:p2` runs:

1. `test:p2`
2. `build`
3. `lint:imports`

---

## Tests

| File | Coverage |
|------|----------|
| `test/ui-provider-profile.test.ts` | Form model, validation, payload mapping, client, analyze flow, HTTP errors |
| `test/ui-provider-dashboard.test.ts` | Card projection, risk display, edge cases, HTML render |
