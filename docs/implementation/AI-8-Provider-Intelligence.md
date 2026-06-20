# AI-8 — Provider Intelligence Implementation Notes

**Phase:** AI-8 (Provider Intelligence — deterministic provider profile synthesis)  
**Status:** Implemented — no external AI providers  
**Date:** 2026-06-19

---

## Summary

AI-8 synthesizes a structured provider profile from onboarding and performance signals. The module is a **read-only intelligence layer** under `src/provider/intelligence/` and exposes `POST /ai/providers/profile` for authenticated clients.

**Non-binding:** Profiles are advisory inputs for matching, pricing, trust, and workflow engines. No provider records are written.

---

## Deliverables

| ID | Deliverable | Location | Status |
|----|-------------|----------|--------|
| AI-8.1 | Provider rules | `src/provider/intelligence/provider-rule-library.ts` | ✅ |
| AI-8.2 | Capability rules | `src/provider/intelligence/capability-rule-library.ts` | ✅ |
| AI-8.3 | Risk rules | `src/provider/intelligence/risk-profile-library.ts` | ✅ |
| AI-8.4 | Orchestration service | `src/provider/intelligence/provider-intelligence-service.ts` | ✅ |
| AI-8.5 | HTTP endpoint | `POST /ai/providers/profile` in `src/api/routes/ai-providers.ts` | ✅ |
| AI-8.6 | Unit + integration tests | `test/ai8-*.test.ts` | ✅ |

---

## Architecture

```
src/provider/intelligence/
  types.ts                         Input/output contracts
  capability-rule-library.ts       Experience → capability level/score
  risk-profile-library.ts          Performance → risk level
  provider-rule-library.ts         Identity, pricing, availability, matching
  provider-intelligence-service.ts Validation + orchestration
  index.ts                         Public exports
```

### Engine reuse

| Section | Source |
|---------|--------|
| **Action profile** | AI-1 `ActionIntelligenceService.extract()` when `profile_text` exists |
| **Trust inputs** | AI-4 `buildComponentScores()` / `scoreVerification()` |
| **Pricing position** | AI-6 benchmark bands via `resolveBenchmarkBand()` |

AI-8 does not duplicate AI-1, AI-4, or AI-6 business rules.

---

## Profile sections

### Identity profile

| Field | Rule |
|-------|------|
| `profession` | Input profession or AI-1 extracted profession |
| `specializations` | Certifications + top skills (max 5) |
| `experience_years` | Input `years_experience` (default 0) |
| `verification_level` | Derived from certifications/licenses count |

### Capability profile

| Years | Level | Base score |
|-------|-------|------------|
| 0–2 | `junior` | 45 |
| 3–5 | `professional` | 62 |
| 6–10 | `senior` | 78 |
| 11+ | `expert` | 90 |

`capability_score = base + min(years, 5)` (clamped 0–100)

### Trust inputs

AI-4-compatible component scores:

- `verification_score`
- `completion_score`
- `rating_score`
- `issue_score`
- `refund_score`
- `evidence_score`

### Pricing profile

| Field | Rule |
|-------|------|
| `average_price` | Input or benchmark midpoint |
| `pricing_position` | `budget` / `market` / `premium` vs AI-6 benchmark band |

### Availability profile

| Field | Rule |
|-------|------|
| `available_now` | `hours >= 10` and `active_contracts < 5` |
| `estimated_start_days` | `active_contracts * 3` if available, else `max(7, active * 7)` |

### Matching profile

| Field | Rule |
|-------|------|
| `matching_tags` | Profession, capability, pricing, location, skills |
| `preferred_contract_size` | `small` / `medium` / `large` by average price |
| `preferred_categories` | Action code domain categories |

### Risk profile

| Level | Conditions |
|-------|------------|
| `low` | completion ≥ 90%, issue ≤ 5%, refund ≤ 2%, experience ≥ 3y |
| `high` | completion < 80% OR issue > 10% OR refund > 5% |
| `medium` | otherwise |

---

## API

### `POST /ai/providers/profile`

**Auth:** Required (`authRequired: true`)

**Request body**

```json
{
  "provider_id": "550e8400-e29b-41d4-a716-446655440000",
  "profession": "software_developer",
  "profile_text": "Full-stack TypeScript developer building APIs, React websites, and backend integrations.",
  "years_experience": 8,
  "certifications": ["AWS Certified", "Scrum Master"],
  "licenses": ["Commercial Registration"],
  "completed_contracts": 52,
  "completion_rate": 0.96,
  "issue_rate": 0.03,
  "refund_rate": 0.01,
  "rating": 4.8,
  "availability_hours_per_week": 30,
  "active_contracts": 1,
  "average_price": 12000,
  "location_tier": "metro"
}
```

**Response (excerpt)**

```json
{
  "identity_profile": {
    "profession": "software_developer",
    "specializations": ["AWS Certified", "Scrum Master", "API design"],
    "experience_years": 8,
    "verification_level": "iron"
  },
  "action_profile": {
    "action_codes": ["E.3.1", "B.3.3"],
    "skills": ["API design", "TypeScript development", "System troubleshooting"],
    "deliverables": ["Custom application module", "Integration service"]
  },
  "capability_profile": { "level": "senior", "capability_score": 83 },
  "trust_inputs": {
    "verification_score": 100,
    "completion_score": 95,
    "rating_score": 96,
    "issue_score": 90,
    "refund_score": 98,
    "evidence_score": 100
  },
  "pricing_profile": { "average_price": 12000, "pricing_position": "market" },
  "availability_profile": {
    "available_now": true,
    "availability_hours_per_week": 30,
    "active_contracts": 1,
    "estimated_start_days": 3
  },
  "matching_profile": {
    "matching_tags": ["software_developer", "senior", "market", "metro"],
    "preferred_contract_size": "medium",
    "preferred_categories": ["software", "construction"]
  },
  "risk_profile": "low"
}
```

---

## Boundaries

| Constraint | AI-8 compliance |
|------------|-----------------|
| Read-only intelligence | No database writes |
| Deterministic | Same input → same output |
| No LLM | Rule libraries + existing engines only |
| Prior AI modules unchanged | AI-1 through AI-7 and orchestrator untouched |

---

## Testing

```bash
npm run test:ai8
npm run verify:ai8
npm run build
npm run lint:imports
```

Test files:

- `test/ai8-provider-intelligence.test.ts` — full profile + validation
- `test/ai8-provider-capability.test.ts` — capability tiers
- `test/ai8-provider-risk.test.ts` — risk classification
- `test/ai8-provider-intelligence-integration.test.ts` — HTTP + 401

---

## Out of scope (by design)

- Provider database persistence
- Identity verification execution
- External credential APIs
- LLM profile parsing
