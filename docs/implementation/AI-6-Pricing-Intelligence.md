# AI-6 — Pricing Intelligence Implementation Notes

**Phase:** AI-6 (Pricing Intelligence — deterministic fair-price recommendations)  
**Status:** Implemented — no external AI providers  
**Date:** 2026-06-19

---

## Summary

AI-6 generates deterministic fair-price recommendations for contracts and actions. The module is a **read-only intelligence layer** under `src/pricing/intelligence/` and exposes `POST /ai/pricing/calculate` for authenticated clients.

**Non-binding:** Price recommendations are guidance only. Contract pricing remains human-driven.

---

## Deliverables

| ID | Deliverable | Location | Status |
|----|-------------|----------|--------|
| AI-6.1 | Benchmark library | `src/pricing/intelligence/pricing-benchmark-library.ts` | ✅ |
| AI-6.2 | Adjustment library | `src/pricing/intelligence/pricing-adjustment-library.ts` | ✅ |
| AI-6.3 | Pricing rules | `src/pricing/intelligence/pricing-rule-library.ts` | ✅ |
| AI-6.4 | Orchestration service | `src/pricing/intelligence/pricing-intelligence-service.ts` | ✅ |
| AI-6.5 | HTTP endpoint | `POST /ai/pricing/calculate` in `src/api/routes/ai-pricing.ts` | ✅ |
| AI-6.6 | Unit + integration tests | `test/ai6-*.test.ts` | ✅ |

---

## Architecture

```
src/pricing/intelligence/
  types.ts                         Input/output contracts
  pricing-benchmark-library.ts     Profession/action benchmark bands
  pricing-adjustment-library.ts    Trust, complexity, urgency, location rules
  pricing-rule-library.ts          Base price + range calculation
  pricing-intelligence-service.ts  Validation + orchestration
  index.ts                         Public exports
```

### Benchmark bands (SAR)

| Category | Range | Reference days |
|----------|-------|----------------|
| Cleaning | 100 – 500 | 1 |
| Logo Design | 500 – 3,000 | 7 |
| Software Development | 5,000 – 50,000 | 22 |
| Consulting | 500 – 5,000 | 5 |
| Construction Supervision | 2,000 – 30,000 | 30 |

Base price: `round_to_500(√(min × max) × estimated_days / reference_days)`

### Adjustment rules

| Factor | Rule |
|--------|------|
| **Trust** | 95+ → +15%; 85+ → +10%; 70+ → +5%; below 50 → −10% |
| **Complexity** | low → 0%; medium → +10%; high → +25% |
| **Urgent** | false → 0%; true → +20% |
| **Location** | rural → −5%; standard → 0%; metro → +5%; premium → +15% |

### Price range tiers

| Tier | Formula |
|------|---------|
| **minimum** (budget) | `base × 0.8` |
| **recommended** | `base × (1 + total_adjustments / 100)` |
| **premium** | `base × 1.5` |

`pricing_tier` defaults to `recommended` (fair-price suggestion).  
`confidence` = `trust_score / 100` (0–1).

---

## API

### `POST /ai/pricing/calculate`

**Auth:** Required (`authRequired: true`)

**Request body**

```json
{
  "profession": "software_developer",
  "action_codes": ["E.3.1"],
  "trust_score": 92,
  "complexity": "medium",
  "estimated_days": 14,
  "urgent": false,
  "location_tier": "metro"
}
```

**Response**

```json
{
  "currency": "SAR",
  "price_range": {
    "minimum": 8000,
    "recommended": 12500,
    "premium": 15000
  },
  "price_components": {
    "base_price": 10000,
    "trust_adjustment": 10,
    "complexity_adjustment": 10,
    "urgency_adjustment": 0,
    "location_adjustment": 5
  },
  "pricing_tier": "recommended",
  "confidence": 0.92
}
```

---

## Boundaries

| Constraint | AI-6 compliance |
|------------|-----------------|
| Read-only intelligence | No writes to contracts, escrow, ledger, or pricing tables |
| Deterministic | Same input always yields identical pricing |
| No LLM | Benchmark + rule libraries only |
| AI-4 input | Uses provided `trust_score`; does not recalculate trust |
| Prior AI modules unchanged | AI-1 through AI-5 behavior untouched |

---

## Testing

```bash
npm run test:ai6
npm run verify:ai6
npm test
npm run build
npm run lint:imports
```

Test files:

- `test/ai6-pricing-intelligence.test.ts` — service + benchmark + range
- `test/ai6-pricing-adjustments.test.ts` — trust, complexity, urgency, location rules
- `test/ai6-pricing-intelligence-integration.test.ts` — HTTP + 401

---

## Out of scope (by design)

- Dynamic marketplace pricing
- External rate APIs or ML models
- Auto-setting contract prices
- Currency conversion beyond SAR output
