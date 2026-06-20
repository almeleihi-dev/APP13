# AI-7 — Negotiation Intelligence Implementation Notes

**Phase:** AI-7 (Negotiation Intelligence — deterministic pre-contract disagreement analysis)  
**Status:** Implemented — no external AI providers  
**Date:** 2026-06-19

---

## Summary

AI-7 analyzes disagreement between customer and provider offers before contract creation. The module is a **read-only intelligence layer** under `src/negotiation/intelligence/` and exposes `POST /ai/negotiation/analyze` for authenticated clients.

**Non-binding:** Recommendations do not modify contracts, pricing records, or escrow accounts.

---

## Deliverables

| ID | Deliverable | Location | Status |
|----|-------------|----------|--------|
| AI-7.1 | Negotiation rules | `src/negotiation/intelligence/negotiation-rule-library.ts` | ✅ |
| AI-7.2 | Compromise engine | `src/negotiation/intelligence/compromise-library.ts` | ✅ |
| AI-7.3 | Orchestration service | `src/negotiation/intelligence/negotiation-intelligence-service.ts` | ✅ |
| AI-7.4 | HTTP endpoint | `POST /ai/negotiation/analyze` in `src/api/routes/ai-negotiation.ts` | ✅ |
| AI-7.5 | Unit + integration tests | `test/ai7-*.test.ts` | ✅ |

---

## Architecture

```
src/negotiation/intelligence/
  types.ts                         Input/output contracts
  negotiation-rule-library.ts      Gap, probability, price, escrow rules
  compromise-library.ts              Deterministic compromise suggestions
  negotiation-intelligence-service.ts Validation + orchestration
  index.ts                         Public exports
```

---

## Formulas

### Price gap

```
price_gap_percent = |customer_offer - provider_offer| / max(customer_offer, provider_offer) × 100
```

### Negotiation state

| Price gap | State |
|-----------|-------|
| ≤ 10% | `likely_agreement` |
| ≤ 30% | `negotiable` |
| ≤ 60% | `difficult` |
| > 60% | `unlikely` |

### Agreement probability

```
score = 100 - price_gap_percent
if trust_score >= 90: score += 10
else if trust_score >= 75: score += 5
if risk_profile = high: score -= 15
else if risk_profile = medium: score -= 5
if customer_days and provider_days differ: score -= 5
if scope_items >= 5: score -= 5
agreement_probability = clamp(score, 0, 100) / 100
```

### Recommended price

```
recommended_price = round_to_nearest_100((customer_offer + provider_offer) / 2)
```

### Recommended days

When both `customer_days` and `provider_days` are provided:

```
recommended_days = ceil((customer_days + provider_days) / 2)
```

### Escrow recommendation (priority order)

| Condition | Escrow |
|-----------|--------|
| `trust_score >= 90` and `risk_profile = low` | `single_release` |
| `trust_score >= 75` | `two_stage` |
| `risk_profile = medium` | `four_stage` |
| `risk_profile = high` | `milestone_based` |
| default | `two_stage` |

---

## Compromise engine

Deterministic suggestions (1–5 items):

| Trigger | Suggestion |
|---------|------------|
| Price gap > 10% | Split delivery into milestones |
| Days differ | Increase timeline to reduce cost pressure |
| High risk | Use milestone escrow with acceptance checkpoints |
| Scope items ≥ 5 | Reduce initial scope and phase remaining work |
| Price gap > 30% | Move closer to midpoint price |

If no trigger applies, a default scope/acceptance confirmation suggestion is returned.

---

## API

### `POST /ai/negotiation/analyze`

**Auth:** Required (`authRequired: true`)

**Request body**

```json
{
  "customer_offer": 10000,
  "provider_offer": 13000,
  "customer_days": 14,
  "provider_days": 21,
  "scope_items": 4,
  "trust_score": 80,
  "risk_profile": "medium",
  "contract_value": 12000
}
```

**Response**

```json
{
  "negotiation_state": "negotiable",
  "agreement_probability": 0.77,
  "recommended_price": 11500,
  "recommended_escrow": "two_stage",
  "compromises": [
    "Consider splitting delivery into milestones to bridge the remaining price difference."
  ],
  "explanation": "Negotiation is negotiable with a 23.1% price gap. Recommended midpoint price is 11500 SAR with two stage escrow based on trust score 80 and medium profile."
}
```

---

## Example scenarios

| Customer | Provider | Trust | Risk | State | Probability |
|----------|----------|-------|------|-------|-------------|
| 10,000 | 10,500 | 92 | low | `likely_agreement` | 1.00 |
| 10,000 | 13,000 | 80 | medium | `negotiable` | 0.77 |
| 10,000 | 15,500 | 70 | medium | `difficult` | 0.50 |
| 10,000 | 30,000 | 40 | high | `unlikely` | 0.18 |

---

## Boundaries

| Constraint | AI-7 compliance |
|------------|-----------------|
| Read-only intelligence | No writes to contracts, pricing, escrow, or ledger |
| Deterministic | Same input always yields identical analysis |
| No LLM | Rule library only |
| Prior AI modules unchanged | AI-1 through AI-6 behavior untouched |

---

## Testing

```bash
npm run test:ai7
npm run verify:ai7
npm run build
npm run lint:imports
```

Test files:

- `test/ai7-negotiation-intelligence.test.ts` — states, probability, escrow, validation
- `test/ai7-negotiation-integration.test.ts` — HTTP + 401

---

## Out of scope (by design)

- Contract creation or amendment
- Automatic price acceptance
- External negotiation agents or LLM mediation
- Database persistence of negotiation sessions
