# APP13 Architecture — Approval Addendum v1.1

**Status:** Approved  
**Date:** June 19, 2026  
**Supersedes:** Selected sections of Core Architecture v1.0

This addendum records stakeholder-approved adjustments. Where conflicts exist between v1.0 architecture docs and this addendum, **this document takes precedence**.

---

## 1. Platform positioning

**APP13 is a Professional Operating System** — not a marketplace, not a booking app, not a service catalog.

It provides the infrastructure to define, contract, execute, and measure professional actions.

---

## 2. Trust Score v1 (approved weights)

| Component | Weight | Source events |
|-----------|--------|---------------|
| **Verification** | 30% | Tier level, credential validity, renewal recency |
| **Execution Success** | 30% | Milestone completion, TEKRR fulfillment |
| **Time Commitment** | 20% | On-time start, deadline adherence, SLA compliance |
| **Complaints** | 10% | Upheld/dismissed ratio, severity, recency |
| **Customer Evaluation** | 10% | Structured post-action evaluation (not star ratings) |

Replaces prior trust score composition in Identity Engine v1.0 doc.

---

## 3. Contract state machine (approved)

### Primary path

```
Draft → Proposed → Accepted → Active → Completed
```

| State | Description |
|-------|-------------|
| **Draft** | Action/TEKRR being defined |
| **Proposed** | Contract generated; awaiting party review |
| **Accepted** | All parties accepted; ready for activation |
| **Active** | Execution permitted; milestones trackable |
| **Completed** | All milestones attested; action closed |

### Issue path

```
Active → Issue Raised → Disputed → Resolved → Closed
```

| State | Description |
|-------|-------------|
| **Issue Raised** | Party flagged issue on active action |
| **Disputed** | Formal complaint filed; Complaint Engine active |
| **Resolved** | Adjudication or mutual resolution applied |
| **Closed** | Terminal state; trust score updated |

Replaces prior contract lifecycle states in `05-contract-lifecycle.md`.

---

## 4. Complaint SLA (approved)

| Environment | SLA |
|-------------|-----|
| **MVP** | 15 business days median resolution |
| **Production** | Configurable by industry and regulator |

---

## 5. MVP core entities (approved)

| Entity | Included |
|--------|----------|
| User | Yes |
| Organization | Yes (minimal) |
| Action | Yes |
| Contract | Yes |
| Contract Milestone | Yes |
| Evidence | Yes |
| Complaint | Yes |
| Trust Score | Yes |

### Explicitly excluded from MVP

- Payments
- Escrow
- Regulators (Government Entity integrations)
- Insurance (Insurance Entity integrations)
- Institutional integrations (Company API, gov API, insurance API)

Prior architecture entities for payments, insurance attestation, government registry, and institutional subscriptions are **deferred**.

---

## 6. Related documents

| Document | Status |
|----------|--------|
| [Action Taxonomy v1](../APP13-Action-Taxonomy-v1.md) | **Current** — universal action tree |
| [PRD v2.0](../PRD.md) | Reference — some sections superseded by this addendum |
| Core Architecture v1.0 | Reference — see addendum for overrides |

---

## 7. Next pre-code deliverables (planned)

1. ADR-001: Modular monolith structure
2. ADR-002: Action entity schema aligned to taxonomy
3. ADR-003: Trust Score v1 computation spec
4. Contract template pack for MVP 15 action types
5. Customer Evaluation schema per action domain

---

*No code until next explicit approval gate.*
