# AI-2 — Requirement Intelligence Implementation Notes

**Phase:** AI-2 (Requirement Intelligence — deterministic extraction)  
**Status:** Implemented — no external AI providers  
**Date:** 2026-06-19

---

## Summary

AI-2 converts customer **requirement text** (plus optional profession hint) into structured suggestions: **actions**, **deliverables**, **milestones**, **acceptance criteria**, **missing questions**, and **contract readiness**. The module lives under the Action Engine at `src/action/intelligence/requirement/` and exposes `POST /ai/requirements/extract` for authenticated clients.

**Non-binding:** Results are suggestions only. Contract creation still requires explicit human confirmation and TEKRR completion via the Contract Engine.

---

## Deliverables

| ID | Deliverable | Location | Status |
|----|-------------|----------|--------|
| AI-2.1 | Requirement profile library (EN + AR) | `src/action/intelligence/requirement/requirement-library.ts` | ✅ |
| AI-2.2 | Deterministic extraction service | `src/action/intelligence/requirement/requirement-intelligence-service.ts` | ✅ |
| AI-2.3 | Shared types | `src/action/intelligence/requirement/types.ts` | ✅ |
| AI-2.4 | HTTP endpoint | `POST /ai/requirements/extract` in `src/api/routes/ai-requirements.ts` | ✅ |
| AI-2.5 | Unit tests | `test/ai2-requirement-intelligence.test.ts` | ✅ |
| AI-2.6 | Integration tests | `test/ai2-requirement-intelligence-integration.test.ts` | ✅ |

---

## Architecture

```
src/action/intelligence/requirement/
  types.ts                              Input/output contracts
  requirement-library.ts                Bilingual requirement → MVP action mappings
  requirement-intelligence-service.ts   Scoring, readiness, localization
  index.ts                              Public exports

src/api/routes/ai-requirements.ts       POST /ai/requirements/extract
```

### Data flow

```
Client payload
  requirement_text | profession_hint | language
        ↓
RequirementIntelligenceService.extract()
        ↓
  1. Normalize + detect language (reuses AI-1 detectLanguage)
  2. Score REQUIREMENT_PROFILE_LIBRARY entries by keyword hits
  3. Boost score when profession_hint matches profile
  4. If top score is zero → unknown response
  5. Compute confidence (heuristic match score)
  6. Map winning profile → actions, deliverables, milestones
  7. Filter missing questions by absent scope signals
  8. Set contract_readiness (ready | needs_clarification | unknown)
        ↓
JSON response
```

### Mapping engine rules

| Rule | Behavior |
|------|----------|
| **Deterministic** | Same input always yields identical output |
| **No LLM** | Keyword / requirement library only |
| **Bilingual** | English and Arabic keywords per profile |
| **MVP actions** | Maps to registered `MVP_ACTION_TYPES` codes |
| **Unknown input** | Zero score → empty arrays, `contract_readiness: "unknown"` |
| **Confidence** | Heuristic match score (0–1), not a calibrated probability |

---

## API

### `POST /ai/requirements/extract`

**Auth:** Required (`authRequired: true`)

**Request body**

```json
{
  "requirement_text": "أحتاج محاسب يراجع حساباتي ويطلع لي تقرير",
  "profession_hint": "accountant",
  "language": "auto"
}
```

`requirement_text` is required.

**Response (matched profile)**

```json
{
  "language_detected": "ar",
  "confidence": 0.87,
  "suggested_actions": [
    {
      "action_code": "C.1.2",
      "label": "Operations Advisory",
      "reason": "مراجعة السجلات المالية وإعداد التقارير ضمن الاستشارات التشغيلية."
    }
  ],
  "deliverables": [
    {
      "title": "تقرير مراجعة مالية",
      "description": "ملخص النتائج والتسويات والتعديلات الموصى بها."
    }
  ],
  "milestones": [
    {
      "title": "تأكيد النطاق",
      "acceptance_criteria": ["تحديد الفترة المالية وعدد الملفات", "تأكيد توفر السجلات المصدرية"]
    }
  ],
  "missing_questions": [
    "كم عدد الفواتير أو الملفات المطلوب مراجعتها؟",
    "ما الفترة المالية المطلوبة؟"
  ],
  "contract_readiness": "needs_clarification"
}
```

**Response (no match)**

```json
{
  "language_detected": "en",
  "confidence": 0,
  "suggested_actions": [],
  "deliverables": [],
  "milestones": [],
  "missing_questions": [],
  "contract_readiness": "unknown"
}
```

### Contract readiness

| Value | Meaning |
|-------|---------|
| `ready` | Profile matched, confidence ≥ 0.65, and all scope missing questions resolved by corpus signals |
| `needs_clarification` | Profile matched but open missing questions remain |
| `unknown` | No requirement profile matched |

---

## Requirement profiles

Initial profiles: accountant, lawyer, software_developer, graphic_designer, plumber, electrician, cleaner, tutor, consultant, event_coordinator.

Accountant and lawyer map to the closest MVP advisory action codes (`C.1.2`, `C.1.1`) until dedicated financial/legal action types are registered.

---

## Relationship to AI-1

| Module | Input | Output focus |
|--------|-------|--------------|
| AI-1 | CV / profession / experience | Provider-side profession → actions, skills, deliverables |
| AI-2 | Customer requirement text | Customer-side scope → actions, milestones, missing questions, readiness |

AI-2 reuses `detectLanguage` from AI-1 only. AI-1 files are not modified.

---

## Testing

```bash
npm run test:ai2                            # unit + integration
npm run verify:ai2                          # test:ai2 + build + lint:imports
npm test                                    # includes no AI-2 by default
npm run build
npm run lint:imports
```

---

## Constitutional boundaries

| Constraint | AI-2 compliance |
|------------|-----------------|
| Human confirms contract scope | Extract is read-only; no Contract rows created |
| TEKRR completeness | Milestones/deliverables are suggestions for pre-fill only |
| No external AI in MVP kernel | No OpenAI/Anthropic SDK; library-only engine |
| Action Engine ownership | Module under `src/action/intelligence/requirement/` |
