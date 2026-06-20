# P5 — Escrow Experience

**Phase:** P5 (UI for read-only escrow review)  
**Status:** Implemented — read-only escrow overview and history flow  
**Date:** 2026-06-19

---

## Summary

P5 exposes escrow state through a read-only UI layer that consumes existing **EscrowService** snapshots, **LedgerService** financial snapshots, **AI-3 Contract Intelligence** escrow plans, and **Workflow Orchestrator** trust/contract context. The UI validates requests, projects pre-supplied read DTOs into overview cards and history timelines, and performs no escrow or ledger calculations.

---

## Architecture

```
Escrow Overview / History Request
        │
        ▼
escrow-client.ts
        │
        ├── overviewExecutor / historyExecutor (tests & integrations)
        └── MVP read fixtures (demo mode)
        │
        ▼
escrow-overview.ts + escrow-history.ts
        │
        ▼
Escrow Overview Page / Escrow History Page
```

### Module layout

```
src/ui/escrow/
  types.ts              UI DTOs, card models, timeline views
  escrow-payload.ts     Validation, fixtures, workflow context mappers
  escrow-client.ts      getEscrowOverview(), getEscrowHistory()
  index.ts

src/ui/pages/
  escrow-overview.ts    Seven-card overview projection + render
  escrow-history.ts     Timeline projection + render
```

---

## Page Flow

1. Caller supplies `escrow_id` (and optional `contract_id`) or injects an executor returning `EscrowExperienceSource`.
2. Payload layer validates UUID input only — no business rules or amount calculations.
3. Overview page projects cards A–G from the source snapshot.
4. History page projects lifecycle events from status history snapshots.

---

## Escrow Overview Cards

| Card | Source |
|------|--------|
| A. Escrow Summary | Escrow agreement snapshot |
| B. Financial Status | Ledger/financial snapshot (pre-computed amounts) |
| C. Escrow State | Status history reach flags (presentation only) |
| D. Release Strategy | AI-3 escrow plan / fixture strategy |
| E. Milestones | Contract milestone snapshot |
| F. Trust Context | Workflow AI-4 trust + AI-3 risk |
| G. Contract Context | Workflow contract readiness + category/duration |

---

## Escrow History Timeline

Each history snapshot maps to a timeline event with:

| Field | Source |
|-------|--------|
| Timestamp | Status history `timestamp` |
| Event type | Mapped from `fromStatus` → `toStatus` |
| Amount | Optional snapshot `amountMinor` |
| Status transition | History record statuses |

Supported event types: `escrow_created`, `funded`, `held`, `release`, `refund`, `freeze`, `unfreeze`.

---

## Dependencies

| Layer | Consumed As |
|-------|-------------|
| EscrowService | `EscrowAgreementSnapshot` + status history (via integration executor) |
| LedgerService | `EscrowFinancialSnapshot` (via integration executor) |
| AI-3 Contract Intelligence | Escrow plan, milestones, risk (via workflow result) |
| Workflow Orchestrator | Trust tier/score, contract readiness (via workflow result) |

No modifications to financial kernel, EscrowService, LedgerService, AI engines, or orchestrator.

---

## Verification

```bash
npm run test:p5
npm run verify:p5
```

`verify:p5` runs:

1. `test:p5`
2. `build`
3. `lint:imports`

---

## Tests

| File | Coverage |
|------|----------|
| `test/ui-escrow-overview.test.ts` | Validation, projection, client, workflow mapping, render |
| `test/ui-escrow-history.test.ts` | Timeline, empty history, refund/freeze, render |

Fixtures:

- `MVP_MILESTONE_ESCROW_SOURCE` — milestone-based held escrow
- `MVP_SINGLE_RELEASE_ESCROW_SOURCE` — single release completed
- `MVP_REFUND_ESCROW_SOURCE` — refund with freeze/unfreeze
- `MVP_EMPTY_HISTORY_ESCROW_SOURCE` — empty timeline edge case

---

## Constraints

- Read-only UI — no database writes
- Deterministic projection from supplied snapshots
- No escrow logic duplication
- No ledger logic duplication
- No AI engine modifications
