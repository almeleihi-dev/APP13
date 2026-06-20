# AI-1 — Action Intelligence Implementation Notes

**Phase:** AI-1 (Action Intelligence — deterministic extraction)  
**Status:** Implemented — no external AI providers  
**Date:** 2026-06-19

---

## Summary

AI-1 converts profession labels, CV text, and experience descriptions into structured **Actions**, **Skills**, and **Deliverables** using a **deterministic mapping engine**. The module lives under the Action Engine and exposes `POST /ai/actions/extract` for authenticated clients.

**Non-binding:** Results are suggestions only. Action creation still requires an explicit `action_type_code` via `ActionService.createAction`.

---

## Deliverables

| ID | Deliverable | Location | Status |
|----|-------------|----------|--------|
| AI-1.1 | Profession → action library (EN + AR) | `src/action/intelligence/profession-action-library.ts` | ✅ |
| AI-1.2 | Deterministic extraction service | `src/action/intelligence/action-intelligence-service.ts` | ✅ |
| AI-1.3 | Shared types | `src/action/intelligence/types.ts` | ✅ |
| AI-1.4 | HTTP endpoint | `POST /ai/actions/extract` in `src/api/routes/ai-actions.ts` | ✅ |
| AI-1.5 | Unit tests | `test/ai1-action-intelligence.test.ts` | ✅ |
| AI-1.6 | Integration tests (HTTP + pipeline) | `test/ai1-action-intelligence-integration.test.ts` | ✅ |

---

## Architecture

```
src/action/intelligence/
  types.ts                         Input/output contracts
  profession-action-library.ts     Bilingual keyword → MVP action mappings
  action-intelligence-service.ts   Scoring, confidence, localization
  index.ts                         Public exports

src/api/routes/ai-actions.ts       POST /ai/actions/extract
```

### Data flow

```
Client payload
  profession | cv_text | experience_text | language
        ↓
ActionIntelligenceService.extract()
        ↓
  1. Normalize + detect language (en | ar | mixed)
  2. Score PROFESSION_ACTION_LIBRARY entries by keyword hits
  3. Boost score when explicit profession matches
  4. Compute confidence from score + separation from runner-up
  5. Map winning profile → MVP action codes, skills, deliverables
        ↓
JSON response
  profession, confidence, language_detected, actions[], skills[], deliverables[]
```

### Mapping engine rules

| Rule | Behavior |
|------|----------|
| **Deterministic** | Same input always yields identical output |
| **No LLM** | Keyword / profession library only |
| **Bilingual** | English and Arabic keywords per profession profile |
| **MVP actions** | Maps to the 15 registered `MVP_ACTION_TYPES` codes |
| **Confidence** | Normalized keyword coverage + profession hint boost + runner-up separation |

---

## API

### `POST /ai/actions/extract`

**Auth:** Required (`authRequired: true`)

**Request body**

```json
{
  "profession": "Plumber",
  "cv_text": "8 years pipe fitting and drain repair.",
  "experience_text": "Fixture installation and leak diagnosis.",
  "language": "auto"
}
```

At least one of `profession`, `cv_text`, or `experience_text` is required.

**Response**

```json
{
  "profession": "Plumber",
  "confidence": 0.812,
  "language_detected": "en",
  "actions": [
    { "action_code": "B.1.2", "action_name": "Plumbing Service", "score": 0.812 }
  ],
  "skills": ["Pipe fitting", "Drain clearing", "Leak diagnosis"],
  "deliverables": ["Leak repair", "Fixture installation", "Drain unblocking"]
}
```

---

## Profession library

Each `ProfessionMapping` entry contains:

- `profession` — localized label (`en`, `ar`)
- `keywords` — bilingual match terms
- `actionCodes` — one or more MVP action codes
- `skills` / `deliverables` — localized suggestion lists

Initial profiles: plumber, electrician, software developer, graphic designer, tutor, surface repair, consultant, event coordinator, personal care, property inspector.

---

## Constitutional boundaries

| Constraint | AI-1 compliance |
|------------|-----------------|
| Human confirms action type | Extract is read-only; no `Action` rows created |
| TEKRR completeness | Skills/deliverables are suggestions for E-dimension pre-fill only |
| No external AI in MVP kernel | No OpenAI/Anthropic SDK; library-only engine |
| Action Engine ownership | Module under `src/action/intelligence/` |

---

## Testing

```bash
npm test                                    # includes AI-1 unit tests
npm run test:ai1                            # unit + integration
npm run build
npm run lint:imports
```

---

## Future (Phase 6)

Replace or augment the deterministic scorer with a governed LLM adapter while preserving:

- Non-binding suggestions
- Explicit human confirmation before action creation
- Audit logging of model version and prompt hash
