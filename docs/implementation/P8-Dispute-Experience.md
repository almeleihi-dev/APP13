# P8 — Dispute Experience

**Phase:** P8 (UI for read-only dispute review)  
**Status:** Implemented — read-only dispute dashboard, details, and resolution timeline  
**Date:** 2026-06-19

---

## Summary

P8 exposes dispute status, resolution context, escrow impact, evidence status, risk/trust display, and lifecycle timelines through a read-only UI layer that consumes existing **Issue, Complaint, Evidence, Escrow, Contract, Execution, and Workflow** snapshots. The UI validates requests, projects pre-supplied DTOs into dashboard cards, dispute detail views, and resolution timelines, and performs no business rule evaluation, trust scoring, escrow calculations, or AI scoring.

---

## Architecture

```
Dispute Dashboard / Details / Timeline Request
        │
        ▼
dispute-client.ts
        │
        ├── dashboardExecutor / detailsExecutor / timelineExecutor (tests)
        └── MVP read fixtures (demo mode)
        │
        ▼
dispute-dashboard.ts + dispute-details.ts + resolution-timeline.ts
        │
        ▼
Dispute Dashboard / Details / Resolution Timeline Pages
```

### Module layout

```
src/ui/dispute/
  types.ts                 UI DTOs and card view models
  dispute-payload.ts       Validation, fixtures, snapshot lookup
  dispute-client.ts        getDisputeDashboard(), getDisputeDetails(), getResolutionTimeline()
  index.ts

src/ui/pages/
  dispute-dashboard.ts     Nine-card dashboard projection + render
  dispute-details.ts       Dispute detail projection + render
  resolution-timeline.ts     Resolution timeline projection + render
```

---

## Dispute Dashboard Cards

| Card | Source |
|------|--------|
| Dispute Summary | Issue/dispute summary snapshot |
| Parties | Customer, provider, owner, opened-by snapshot |
| Escrow Impact | Escrow status and freeze/unfreeze snapshot |
| Evidence Status | Evidence counts snapshot |
| Resolution Progress | Stage reached flags snapshot |
| Risk Context | Risk level and escalation snapshot |
| Trust Context | Provider trust display snapshot |
| Timeline Summary | Key milestone timestamps snapshot |

---

## Dispute Details

Each dispute displays:

| Field | Source |
|-------|--------|
| dispute id, title, description, category, severity | Dispute details snapshot |
| created by, created at, status, assigned reviewer | Dispute details snapshot |
| linked contract, milestone, escrow, evidence | Linked entity snapshot |

---

## Resolution Timeline

Supported event types (mapped from snapshot records):

- `dispute_created`
- `evidence_submitted`
- `evidence_verified`
- `escrow_frozen`
- `mediation_started`
- `recommendation_issued`
- `dispute_resolved`
- `escrow_released`
- `escrow_refunded`
- `dispute_closed`

Each event shows timestamp, event type, label, and status transition.

---

## Dependencies

| Layer | Consumed As |
|-------|-------------|
| Issue/Complaint domain | Dispute status and party snapshots |
| Evidence domain | Evidence count and linked evidence IDs |
| Escrow domain | Escrow status and freeze/unfreeze display |
| Contract/Execution | Linked contract and milestone references |
| Trust context | Pre-supplied trust display snapshot |
| Workflow | Resolution progress and timeline snapshots |

No modifications to AI engines, orchestrator, EscrowService, ExecutionService, complaint domain, or dispute rule engines.

---

## Verification

```bash
npm run test:p8
npm run verify:p8
```

`verify:p8` runs:

1. `test:p8`
2. `build`
3. `lint:imports`

---

## Tests

| File | Coverage |
|------|----------|
| `test/ui-dispute-dashboard.test.ts` | Validation, projection, freeze/unfreeze, resolved/closed, client, HTML |
| `test/ui-dispute-details.test.ts` | Details projection, resolved state, client, HTML |
| `test/ui-resolution-timeline.test.ts` | Timeline projection, resolved/closed/refund, empty state, client, HTML |

Fixtures:

| Fixture | Purpose |
|---------|---------|
| `MVP_OPEN_DISPUTE_SOURCE` | Active mediation dispute with frozen escrow |
| `MVP_RESOLVED_DISPUTE_SOURCE` | Resolved dispute with escrow released |
| `MVP_CLOSED_DISPUTE_SOURCE` | Closed dispute with escrow refunded |
| `MVP_EMPTY_TIMELINE_DISPUTE_SOURCE` | Empty timeline edge case |

---

## Constraints

- Read-only UI projection layer only
- No DB writes
- No escrow calculations
- No trust calculations
- No AI scoring
- No dispute rule duplication
