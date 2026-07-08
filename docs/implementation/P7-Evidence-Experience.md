# P7 — Evidence Experience

**Phase:** P7 (UI for read-only evidence and attestation review)  
**Status:** Implemented — read-only evidence overview, details, and timeline  
**Date:** 2026-06-19

---

## Summary

P7 exposes evidence, upload, verification, and attestation state through a read-only UI layer that consumes existing **Execution/Evidence** domain snapshots plus contract and trust context fixtures. The UI validates requests, projects pre-supplied DTOs into overview cards, evidence detail views, and attestation timelines, and performs no business rule evaluation, trust scoring, or escrow calculations.

---

## Architecture

```
Evidence Overview / Details / Timeline Request
        │
        ▼
evidence-client.ts
        │
        ├── overviewExecutor / detailsExecutor / timelineExecutor (tests)
        └── MVP read fixtures (demo mode)
        │
        ▼
evidence-overview.ts + evidence-details.ts + attestation-timeline.ts
        │
        ▼
Evidence Overview / Details / Attestation Timeline Pages
```

### Module layout

```
src/ui/evidence/
  types.ts                 UI DTOs and card view models
  evidence-payload.ts      Validation, fixtures, display filters
  evidence-client.ts       getEvidenceOverview(), getEvidenceDetails(), getAttestationTimeline()
  index.ts

src/ui/pages/
  evidence-overview.ts     Six-card overview projection + render
  evidence-details.ts      Evidence item detail projection + render
  attestation-timeline.ts    Attestation timeline projection + render
```

---

## Evidence Overview Cards

| Card | Source |
|------|--------|
| Evidence Summary | Evidence summary snapshot |
| Upload Statistics | Upload statistics snapshot |
| Verification Status | Verification status snapshot |
| Contract Context | Contract/milestone/issue/execution snapshot |
| Trust Context | Trust context snapshot (display only) |
| Evidence Health | Completeness and review readiness snapshot |

---

## Evidence Details

Each evidence item displays:

| Field | Source |
|-------|--------|
| evidence_id, type, title, description | Evidence item snapshot |
| uploaded_at, uploader_id | Evidence item snapshot |
| verification_status, attestation_status | Evidence item snapshot |
| file metadata | File metadata snapshot |
| review notes | Evidence item snapshot |

---

## Attestation Timeline

Supported event types (mapped from snapshot records):

- `evidence_created`
- `evidence_uploaded`
- `evidence_verified`
- `attestation_created`
- `attestation_approved`
- `attestation_rejected`

Each event shows timestamp, event type, evidence ID, and status transition.

---

## Dependencies

| Layer | Consumed As |
|-------|-------------|
| Execution/Evidence domain | Evidence item and upload type snapshots |
| Attestation domain | Attestation status and timeline snapshots |
| Contract context | Contract/milestone/issue display fields |
| Trust context | Pre-supplied trust display snapshot |

No modifications to AI engines, orchestrator, EscrowService, ExecutionService, or LedgerService.

---

## Verification

```bash
npm run test:p7
npm run verify:p7
```

`verify:p7` runs:

1. `test:p7`
2. `build`
3. `lint:imports`

---

## Tests

| File | Coverage |
|------|----------|
| `test/ui-evidence-overview.test.ts` | Validation, projection, empty state, milestone filter, client, HTML |
| `test/ui-evidence-details.test.ts` | Verified/unverified details, client, HTML |
| `test/ui-attestation-timeline.test.ts` | Timeline projection, rejection, empty state, filter, HTML |

Fixtures:

- `MVP_EVIDENCE_OVERVIEW_SOURCE` — mixed verified/pending evidence
- `MVP_EMPTY_EVIDENCE_SOURCE` — empty evidence state
- `MVP_REJECTED_EVIDENCE_SOURCE` — rejected attestation timeline

---

## Constraints

- Read-only UI — no database writes
- Projection layer only — no duplicated business rules
- No trust calculations or AI scoring in UI
- Fully typed DTOs in `src/ui/evidence/types.ts`
