# AI-5 — Matching Intelligence Implementation Notes

**Phase:** AI-5 (Matching Intelligence — deterministic provider ranking)  
**Status:** Implemented — no external AI providers  
**Date:** 2026-06-19

---

## Summary

AI-5 ranks providers for a customer requirement using deterministic matching rules. The module is a **read-only intelligence layer** under `src/matching/intelligence/` and exposes `POST /ai/matching/rank` for authenticated clients.

**Non-binding:** Rankings are suggestions only. Provider selection and contract creation remain human-driven.

---

## Deliverables

| ID | Deliverable | Location | Status |
|----|-------------|----------|--------|
| AI-5.1 | Matching score rules | `src/matching/intelligence/matching-rule-library.ts` | ✅ |
| AI-5.2 | Weight library | `src/matching/intelligence/matching-weight-library.ts` | ✅ |
| AI-5.3 | Orchestration service | `src/matching/intelligence/matching-intelligence-service.ts` | ✅ |
| AI-5.4 | HTTP endpoint | `POST /ai/matching/rank` in `src/api/routes/ai-matching.ts` | ✅ |
| AI-5.5 | Unit + integration tests | `test/ai5-*.test.ts` | ✅ |

---

## Architecture

```
src/matching/intelligence/
  types.ts                         Input/output contracts
  matching-weight-library.ts       Weights + recommendation bands
  matching-rule-library.ts         Component scorers + reasons
  matching-intelligence-service.ts Validation + ranking
  index.ts                         Public exports
```

### Scoring weights

| Component | Weight |
|-----------|--------|
| Action fit | 25% |
| Trust score (AI-4) | 20% |
| Skill fit | 15% |
| Availability | 15% |
| Price fit | 10% |
| Distance | 10% |
| Rating | 5% |

### Component rules

| Component | Rule |
|-----------|------|
| **Action fit** | 100 when all required actions match; strong penalty when any are missing |
| **Skill fit** | Overlap with required skills; 95 when all required skills are covered |
| **Trust** | AI-4 `trust_score` used directly (0–100) |
| **Availability** | Urgent + available = 100; urgent + unavailable = 20 |
| **Price fit** | High within budget (`100 − savings_ratio × 120`); gradual penalty above budget |
| **Distance** | Haversine km penalty (`100 − km × 7.4`); neutral 75 when location missing |
| **Rating** | `(average_rating / 5) × 100` |

### Recommendations

| Match score | Recommendation |
|-------------|----------------|
| ≥ 90 | `best_match` |
| ≥ 80 | `strong_match` |
| ≥ 65 | `possible_match` |
| ≥ 50 | `weak_match` |
| < 50 | `not_recommended` |

---

## API

### `POST /ai/matching/rank`

**Auth:** Required (`authRequired: true`)

**Request body**

```json
{
  "requirement": {
    "required_action_codes": ["E.3.1"],
    "required_skills": ["frontend", "backend"],
    "budget": 12000,
    "currency": "SAR",
    "location": { "lat": 24.7136, "lng": 46.6753 },
    "urgent": true
  },
  "providers": [
    {
      "provider_id": "provider_1",
      "action_codes": ["E.3.1"],
      "skills": ["frontend", "backend", "deployment"],
      "trust_score": 92,
      "completion_rate": 0.96,
      "average_rating": 4.8,
      "price_estimate": 11000,
      "available_now": true,
      "location": { "lat": 24.7000, "lng": 46.6800 }
    }
  ]
}
```

**Response**

```json
{
  "ranked_matches": [
    {
      "provider_id": "provider_1",
      "match_score": 95,
      "component_scores": {
        "action_fit": 100,
        "skill_fit": 95,
        "trust": 92,
        "availability": 100,
        "price_fit": 90,
        "distance": 88,
        "rating": 96
      },
      "recommendation": "best_match",
      "reasons": []
    }
  ]
}
```

---

## Boundaries

| Constraint | AI-5 compliance |
|------------|-----------------|
| Read-only intelligence | No writes to contracts, escrow, ledger, issues, or evaluations |
| Deterministic | Same input always yields identical ranking |
| No LLM | Rule library only |
| AI-4 input | Uses provided `trust_score`; does not recalculate trust |
| Prior AI modules unchanged | AI-1 through AI-4 behavior untouched |

---

## Testing

```bash
npm run test:ai5
npm run verify:ai5
npm test
npm run build
npm run lint:imports
```

Test files:

- `test/ai5-matching-intelligence.test.ts` — service + ranking order
- `test/ai5-matching-rules.test.ts` — availability, price, distance, action penalties
- `test/ai5-matching-intelligence-integration.test.ts` — HTTP + 401

---

## Out of scope (by design)

- Provider discovery / database queries
- Auto-assignment of providers
- ML-based ranking or external AI providers
