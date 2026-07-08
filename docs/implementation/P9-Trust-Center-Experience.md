# P9 — Trust Center Experience

**Phase:** P9 (UI for read-only trust center aggregation)  
**Status:** Implemented — read-only trust center dashboard, provider report, and timeline  
**Date:** 2026-06-19

---

## Summary

P9 exposes unified trust, verification, performance, evidence, escrow, dispute, availability, financial, and matching information through a read-only UI layer that consumes pre-supplied snapshots from **AI-4 Trust Intelligence**, **Provider Intelligence**, **Execution**, **Evidence**, **Escrow**, **Dispute**, and **Workflow** results. The UI validates requests, projects DTOs into dashboard cards, provider trust reports, and trust timelines, and performs no trust score calculations, AI scoring, or business rule evaluation.

---

## Architecture

```
Trust Center / Provider Report / Timeline Request
        │
        ▼
trust-client.ts
        │
        ├── centerExecutor / reportExecutor / timelineExecutor (tests)
        └── MVP read fixtures (demo mode)
        │
        ▼
trust-center.ts + provider-trust-report.ts + trust-timeline.ts
        │
        ▼
Trust Center Dashboard / Provider Trust Report / Trust Timeline Pages
```

### Module layout

```
src/ui/trust/
  types.ts                 UI DTOs and card view models
  trust-payload.ts         Validation, fixtures, snapshot lookup
  trust-client.ts          getTrustCenter(), getProviderTrustReport(), getTrustTimeline()
  index.ts

src/ui/pages/
  trust-center.ts          Ten-card dashboard projection + render
  provider-trust-report.ts Provider trust report projection + render
  trust-timeline.ts        Trust lifecycle timeline projection + render
```

---

## Trust Center Dashboard Cards

| Card | Source |
|------|--------|
| Trust Summary | AI-4 trust score/tier/confidence/live frame snapshot |
| Verification Profile | Identity verification snapshot |
| Performance Profile | Execution completion snapshot |
| Evidence Profile | Evidence count and health snapshot |
| Escrow Profile | Escrow funded/released/refunded snapshot |
| Dispute Profile | Dispute count and impact snapshot |
| Availability Profile | Provider availability snapshot |
| Financial Profile | Pricing position and band snapshot |
| Matching Profile | Categories, specializations, action codes snapshot |
| Trust Timeline | Timeline summary counts snapshot |

---

## Provider Trust Report

Each report displays:

| Section | Source |
|---------|--------|
| Header | provider_id, profession, capability level, trust score, trust tier |
| Verification Profile | Verification snapshot |
| Risk Profile | Pre-supplied risk display snapshot |
| Escrow History | Escrow history snapshot |
| Dispute History | Dispute history snapshot |
| Evidence Profile | Evidence profile snapshot |
| Execution Profile | Execution profile snapshot |

---

## Trust Timeline

Supported event types (mapped from snapshot records):

- `provider_registered`
- `verification_completed`
- `license_added`
- `contract_completed`
- `evidence_verified`
- `attestation_approved`
- `dispute_opened`
- `dispute_resolved`
- `escrow_released`
- `trust_updated`

Each event shows timestamp, event type, label, and detail.

---

## Dependencies

| Layer | Consumed As |
|-------|-------------|
| AI-4 Trust Intelligence | Trust score/tier/confidence display snapshot |
| Provider Intelligence | Verification, availability, matching snapshots |
| Execution | Performance and execution profile snapshots |
| Evidence | Evidence profile snapshot |
| Escrow | Escrow profile and history snapshots |
| Dispute | Dispute profile and history snapshots |
| Workflow | Matching and financial display snapshots |

No modifications to AI engines, orchestrator, domain services, or trust calculation logic.

---

## Verification

```bash
npm run test:p9
npm run verify:p9
```

`verify:p9` runs:

1. `test:p9`
2. `build`
3. `lint:imports`

---

## Tests

| File | Coverage |
|------|----------|
| `test/ui-trust-center.test.ts` | Validation, projection, trust tiers, profiles, empty state, client, HTML |
| `test/ui-provider-trust-report.test.ts` | Report projection, restricted tier, sections, client, HTML |
| `test/ui-trust-timeline.test.ts` | Timeline projection, empty state, client, HTML |

Fixtures:

| Fixture | Purpose |
|---------|---------|
| `MVP_TRUST_CENTER_SOURCE` | Emerald-tier provider with full profiles |
| `MVP_RESTRICTED_TRUST_SOURCE` | Restricted-tier provider with elevated dispute impact |
| `MVP_EMPTY_TRUST_SOURCE` | Empty/minimal trust state |

---

## Constraints

- Read-only UI projection layer only
- No DB writes
- No trust calculations
- No AI scoring
- No duplicated trust rules
