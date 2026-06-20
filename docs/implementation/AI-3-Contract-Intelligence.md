# AI-3 — Contract Intelligence Implementation Notes

**Phase:** AI-3 (Contract Intelligence — deterministic proposal generation)  
**Status:** Implemented — no external AI providers  
**Date:** 2026-06-19

---

## Summary

AI-3 converts **AI-1** (provider extraction) and **AI-2** (requirement extraction) outputs into a deterministic **contract proposal**: scope of work, milestones, escrow plan, acceptance criteria, risk profile, and draft contract structure. The module lives under the Contract Engine at `src/contract/intelligence/` and exposes `POST /ai/contracts/generate` for authenticated clients.

**Non-binding:** Proposals are suggestions only. Contract materialization still requires explicit human confirmation via the Contract Engine.

---

## Deliverables

| ID | Deliverable | Location | Status |
|----|-------------|----------|--------|
| AI-3.1 | Escrow rule library | `src/contract/intelligence/escrow-rule-library.ts` | ✅ |
| AI-3.2 | Risk rule library | `src/contract/intelligence/risk-rule-library.ts` | ✅ |
| AI-3.3 | Scope/milestone/draft generators | `src/contract/intelligence/contract-template-library.ts` | ✅ |
| AI-3.4 | Orchestration service | `src/contract/intelligence/contract-intelligence-service.ts` | ✅ |
| AI-3.5 | HTTP endpoint | `POST /ai/contracts/generate` in `src/api/routes/ai-contracts.ts` | ✅ |
| AI-3.6 | Unit + integration tests | `test/ai3-*.test.ts` | ✅ |

---

## Architecture

```
src/contract/intelligence/
  types.ts                          Input/output contracts
  escrow-rule-library.ts            Milestone-based escrow templates
  risk-rule-library.ts              Deterministic risk scoring
  contract-template-library.ts      Scope, milestones, draft sections
  contract-intelligence-service.ts    Orchestration (AI-1/AI-2 resolution)
  index.ts                          Public exports
```

### Data flow

```
Client payload
  profession | requirement_text | contract_value | currency | ai1_result | ai2_result
        ↓
ContractIntelligenceService.generate()
        ↓
  1. Resolve AI-1/AI-2 (use provided results or invoke existing services)
  2. If both unknown → empty proposal
  3. Resolve profession category
  4. Generate scope from AI-2 actions/deliverables + AI-1 actions/deliverables
  5. Select escrow rule (cleaning 100%, design 50/50, software 25×4, etc.)
  6. Build milestones with percentages and acceptance criteria
  7. Assess risk (profession, value, complexity, open questions)
  8. Compose draft contract sections (no legal boilerplate)
        ↓
JSON response
```

---

## API

### `POST /ai/contracts/generate`

**Auth:** Required (`authRequired: true`)

**Request body**

```json
{
  "profession": "software_developer",
  "requirement_text": "Build a restaurant website with admin dashboard",
  "contract_value": 12000,
  "currency": "SAR",
  "ai1_result": {},
  "ai2_result": {}
}
```

At least one of `profession`, `requirement_text`, `ai1_result`, or `ai2_result` is required. Empty `{}` AI results trigger on-demand AI-1/AI-2 extraction using the other fields.

**Response (excerpt)**

```json
{
  "contract_readiness": "needs_clarification",
  "risk_profile": {
    "risk_level": "medium",
    "reason": "software engagements carry elevated delivery variance; ...",
    "recommended_milestones": 4
  },
  "scope_of_work": [{ "title": "...", "description": "...", "action_code": "E.3.1" }],
  "milestones": [
    {
      "title": "Discovery",
      "description": "...",
      "percentage": 25,
      "acceptance_criteria": ["..."]
    }
  ],
  "acceptance_criteria": ["..."],
  "escrow_plan": {
    "recommended_structure": [
      { "label": "Discovery", "percentage": 25, "trigger": "Requirements and wireframes approved" }
    ],
    "release_strategy": "milestone_based"
  },
  "draft_contract": {
    "title": "software_developer Service Agreement",
    "summary": "...",
    "sections": [{ "heading": "Scope of Work", "content": "..." }]
  }
}
```

---

## Escrow rules (deterministic)

| Profile / action signal | Structure | Strategy |
|-------------------------|-----------|----------|
| Cleaning (`A.4.2`) | 100% | `single_release` |
| Logo / design (`E.1.1`) | 50% / 50% | `milestone_based` |
| Software / website (`E.3.1`) | 25% × 4 | `milestone_based` |
| Construction trades | 30% / 40% / 30% | `multi_stage` |
| Consulting / events / education | Category-specific phased splits | `milestone_based` |

---

## Risk engine

Composite score from:

- Profession category baseline
- Contract value bands
- Complexity signals in requirement text (e.g. `dashboard`, `integration`, `admin`)
- Open AI-2 missing questions
- Milestone count (phased escrow reduces single-release exposure)

Mapped to `low`, `medium`, or `high`.

---

## Contract readiness

Propagates AI-2 `contract_readiness` when available. Returns `unknown` when both AI-1 and AI-2 signals are empty.

---

## Relationship to AI-1 / AI-2

| Module | Role in AI-3 |
|--------|----------------|
| AI-1 | Provider-side actions, skills, deliverables |
| AI-2 | Customer-side actions, deliverables, milestones, missing questions, readiness |
| AI-3 | Combines both into contract proposal structure |

AI-1 and AI-2 behavior is unchanged; AI-3 only consumes their outputs (or calls their services when results are empty).

---

## Testing

```bash
npm run test:ai3
npm run verify:ai3
npm test
npm run build
npm run lint:imports
```

Test files:

- `test/ai3-contract-intelligence.test.ts` — service orchestration
- `test/ai3-risk-engine.test.ts` — risk scoring
- `test/ai3-escrow-engine.test.ts` — escrow recommendations
- `test/ai3-contract-intelligence-integration.test.ts` — HTTP + auth

---

## Out of scope (by design)

- Legal clause generation
- PDF / document rendering
- Contract Engine persistence (proposal only)
