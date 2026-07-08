# P10 — Platform Home Experience

**Phase:** P10 (UI for read-only unified platform home)  
**Status:** Implemented — read-only platform home dashboard and overview  
**Date:** 2026-06-19

---

## Summary

P10 exposes a unified platform home experience that aggregates pre-supplied snapshots and UI outputs from **P1–P9** (workflow, provider, marketplace, contract, escrow, execution, evidence, dispute, and trust experiences) into a single read-only dashboard. The UI validates requests, projects DTOs into activity cards and overview sections, and performs no business rule evaluation, trust scoring, escrow calculations, or workflow processing.

---

## Architecture

```
Platform Home / Overview Request
        │
        ▼
platform-client.ts
        │
        ├── homeExecutor / overviewExecutor (tests)
        └── MVP read fixtures (demo mode)
        │
        ▼
platform-home.ts + platform-overview.ts
        │
        ▼
Platform Home Dashboard / Platform Overview Pages
```

### Module layout

```
src/ui/platform/
  types.ts                 UI DTOs and card view models
  platform-payload.ts      Validation, fixtures, snapshot lookup
  platform-client.ts       getPlatformHome(), getPlatformOverview()
  index.ts

src/ui/pages/
  platform-home.ts         Ten-card home dashboard projection + render
  platform-overview.ts     Eight-section overview projection + render
```

---

## Platform Home Dashboard Cards

| Card | Aggregated From |
|------|-----------------|
| Request Activity | P1 workflow/request snapshots |
| Marketplace Activity | P3 marketplace snapshots |
| Provider Activity | P2 provider snapshots |
| Contract Status | P4 contract snapshots |
| Escrow Status | P5 escrow snapshots |
| Execution Status | P6 execution snapshots |
| Evidence Status | P7 evidence snapshots |
| Dispute Status | P8 dispute snapshots |
| Trust Status | P9 trust snapshots |
| Platform Summary | Cross-phase platform summary snapshot |

---

## Platform Overview Sections

| Section | Aggregated From |
|---------|-----------------|
| Active Requests | Workflow/request snapshots |
| Active Providers | Provider/marketplace snapshots |
| Active Contracts | Contract snapshots |
| Active Escrows | Escrow snapshots |
| Active Projects | Execution snapshots |
| Evidence Overview | Evidence snapshots |
| Open Disputes | Dispute snapshots |
| Trust Snapshot | Trust center snapshots |

---

## Dependencies

| Layer | Consumed As |
|-------|-------------|
| P1 Workflow | Request activity display snapshot |
| P2 Provider | Provider activity display snapshot |
| P3 Marketplace | Marketplace activity display snapshot |
| P4 Contract | Contract status display snapshot |
| P5 Escrow | Escrow status display snapshot |
| P6 Execution | Execution status display snapshot |
| P7 Evidence | Evidence status display snapshot |
| P8 Dispute | Dispute status display snapshot |
| P9 Trust | Trust status display snapshot |

No modifications to AI engines (AI-1 through AI-8), AI-Orchestrator, or existing business logic.

---

## Verification

```bash
npm run test:p10
npm run verify:p10
```

`verify:p10` runs:

1. `test:p10`
2. `build`
3. `lint:imports`

---

## Tests

| File | Coverage |
|------|----------|
| `test/ui-platform-home.test.ts` | Validation, projection, empty state, executor, HTML, aggregated cards |
| `test/ui-platform-overview.test.ts` | Overview projection, empty state, executor, HTML, aggregated sections |

Fixtures:

| Fixture | Purpose |
|---------|---------|
| `MVP_PLATFORM_HOME_SOURCE` | Full platform home with P1–P9 snapshot references |
| `MVP_PLATFORM_EMPTY_SOURCE` | Empty/minimal platform state |

---

## Constraints

- Read-only UI projection layer only
- No DB writes
- No new AI engines
- No AI logic duplication
- No trust, escrow, execution, dispute, or workflow calculations
- Projection and rendering only
