# AI-4 — Trust Intelligence Implementation Notes

**Phase:** AI-4 (Trust Intelligence — deterministic scoring)  
**Status:** Implemented — no external AI providers  
**Date:** 2026-06-19

---

## Summary

AI-4 calculates deterministic **trust scores** and **trust tiers** from provider behavior metrics. The module is a **read-only intelligence layer** under `src/trust/intelligence/` and exposes `POST /ai/trust/calculate` for authenticated clients.

**Non-binding:** Results are advisory. Trust projection persistence and enforcement remain owned by the Trust Engine.

---

## Deliverables

| ID | Deliverable | Location | Status |
|----|-------------|----------|--------|
| AI-4.1 | Trust scoring rules | `src/trust/intelligence/trust-rule-library.ts` | ✅ |
| AI-4.2 | Trust tier library | `src/trust/intelligence/trust-tier-library.ts` | ✅ |
| AI-4.3 | Orchestration service | `src/trust/intelligence/trust-intelligence-service.ts` | ✅ |
| AI-4.4 | HTTP endpoint | `POST /ai/trust/calculate` in `src/api/routes/ai-trust.ts` | ✅ |
| AI-4.5 | Unit + integration tests | `test/ai4-*.test.ts` | ✅ |

---

## Architecture

```
src/trust/intelligence/
  types.ts                       Input/output contracts
  trust-rule-library.ts          Component scores + weighted formula
  trust-tier-library.ts          Tier bands, live frame, restrictions
  trust-intelligence-service.ts  Validation + orchestration
  index.ts                       Public exports
```

### Trust formula

| Component | Weight | Scoring rule |
|-----------|--------|--------------|
| Identity verification | 40% | `iron` → 100, `unknown` → 0 (tiered bronze/silver/gold between) |
| Completion rate | 20% | `completion_rate × 100` (slight adjustment below 100%) |
| Average rating | 15% | `(average_rating / 5) × 100` |
| Issue history | 10% | `100 − issue_rate × 333.33` |
| Refund history | 10% | `100 − refund_rate × 200` |
| Evidence quality | 5% | `evidence_quality_score × 100` |

Final score:

1. Weighted sum of component scores (rounded)
2. Behavior penalties for elevated issue/refund rates and incomplete completion
3. Clamped to `0–100`

High **refund** and **issue** rates reduce trust through both component scores and final penalties.

---

## Tier library

| Score | Tier | Live frame | Recommendation |
|-------|------|------------|----------------|
| 95–100 | platinum | platinum | trusted |
| 85–94 | emerald | emerald | trusted |
| 70–84 | gold | gold | trusted |
| 50–69 | silver | silver | conditional |
| 0–49 | restricted | gray | restricted |

Restricted and silver tiers include deterministic `restrictions[]` suggestions (e.g. manual approval, enhanced monitoring).

---

## API

### `POST /ai/trust/calculate`

**Auth:** Required (`authRequired: true`)

**Request body**

```json
{
  "provider_id": "550e8400-e29b-41d4-a716-446655440000",
  "metrics": {
    "completed_contracts": 52,
    "completion_rate": 0.96,
    "average_rating": 4.8,
    "refund_rate": 0.01,
    "issue_rate": 0.03,
    "evidence_quality_score": 0.90,
    "identity_verification_level": "iron"
  }
}
```

**Response**

```json
{
  "trust_score": 92,
  "trust_tier": "emerald",
  "live_frame_color": "emerald",
  "component_scores": {
    "verification": 100,
    "rating": 96,
    "completion": 95,
    "issues": 90,
    "refunds": 98,
    "evidence": 90
  },
  "recommendation": "trusted",
  "restrictions": []
}
```

---

## Boundaries

| Constraint | AI-4 compliance |
|------------|-----------------|
| Read-only intelligence | No writes to contracts, escrow, ledger, issues, or evaluations |
| Deterministic | Same metrics always yield identical output |
| No LLM | Rule library only |
| Trust Engine ownership | Module under `src/trust/intelligence/` |

---

## Testing

```bash
npm run test:ai4
npm run verify:ai4
npm test
npm run build
npm run lint:imports
```

Test files:

- `test/ai4-trust-intelligence.test.ts` — service + score calculation
- `test/ai4-trust-tier.test.ts` — tier bands and live frame mapping
- `test/ai4-trust-penalty.test.ts` — issue/refund penalties
- `test/ai4-trust-intelligence-integration.test.ts` — HTTP + 401

---

## Out of scope (by design)

- Persisting trust scores to projection tables
- Modifying contract/escrow/ledger/issue/evaluation state
- ML-based scoring or external AI providers
