# Identity Engine — Architecture v1

**Engine ID:** `identity`  
**Version:** 1.0  
**Owner domain:** Actors, verification, trust profiles, scores

---

## 1. Purpose

The Identity Engine is APP13's **trust foundation**. It registers all platform actors, manages verification tiers, maintains persistent trust profiles for service providers, and computes Trust Score and Execution Score from platform events.

No other engine may assign or override scores directly.

---

## 2. Responsibilities

| In scope | Out of scope |
|----------|--------------|
| Actor registration and authentication binding | Contract generation |
| Verification workflow (T0–T4) | TEKRR decomposition |
| Trust Profile persistence | Complaint adjudication |
| Trust Score computation (v1) | Service discovery |
| Execution Score aggregation (v1) | Payment processing |
| Tier gating API for other engines | Legal document rendering |
| Institutional actor onboarding (Phase 2) | |

---

## 3. Internal components

```
┌─────────────────────────────────────────────────┐
│                 Identity Engine                  │
├─────────────────────────────────────────────────┤
│  Actor Registry    │  Verification Service      │
│  ─────────────     │  ────────────────────      │
│  • actor CRUD      │  • tier progression        │
│  • role bindings   │  • KYC/KYB orchestration   │
│  • org membership  │  • credential review queue │
├────────────────────┼────────────────────────────┤
│  Trust Profile     │  Scoring Service           │
│  Service           │  ───────────────           │
│  ─────────────     │  • trust_score_v1          │
│  • profile read    │  • execution_score_v1      │
│  • history agg     │  • recency decay           │
│  • public view     │  • event-triggered recompute│
└─────────────────────────────────────────────────┘
```

---

## 4. Verification tiers

| Tier | Code | Requirements | Renewal |
|------|------|--------------|---------|
| Unverified | T0 | Email + phone OTP | N/A |
| Basic identity | T1 | Gov ID + liveness + name match | 24 months |
| Professional | T2 | T1 + ≥1 verified credential | Credential expiry |
| Enterprise | T3 | T2 + KYB (business entity) | 12 months |
| Regulated | T4 | T3 + gov license sync + insurance min | License + 12mo insurance |

### Tier states

`not_started` · `pending` · `approved` · `rejected` · `expired` · `suspended`

---

## 5. Trust Profile schema (logical)

| Field | Type | Mutable | Source |
|-------|------|---------|--------|
| actor_id | UUID | No | Registry |
| current_tier | enum T0–T4 | System | Verification |
| tier_expires_at | timestamp | System | Verification |
| trust_score | int 0–1000 | Computed | Scoring |
| trust_score_version | string | System | Scoring |
| execution_score | int 0–1000 | Computed | Scoring |
| execution_score_version | string | System | Scoring |
| dimension_scores | JSON | Computed | Scoring (T/E/K/R/R breakdown) |
| contract_count | int | Computed | Contract events |
| completed_contract_count | int | Computed | Contract events |
| complaint_upheld_count | int | Computed | Complaint events |
| repeat_customer_rate | decimal | Computed | Contract events |
| confidence_band | enum | Computed | Based on sample size |
| public_summary | JSON | Computed | Aggregated, privacy-safe |

---

## 6. Trust Score v1 formula

**Question answered:** *Can this party be relied upon to enter and honor commitments?*

| Component | Weight | Event inputs |
|-----------|--------|--------------|
| Identity assurance | 25% | Current tier, expiry proximity, rejection history |
| Contract integrity | 30% | Completion rate, faulted cancellations, amendment rate |
| Complaint record | 25% | Upheld/dismissed ratio, severity, recency decay |
| Third-party attestation | 15% | Phase 2; zero-weight neutral in MVP |
| Tenure & volume | 5% | Account age, contract count (confidence modifier) |

**Recency decay:** Events older than 24 months contribute at 50% weight; older than 36 months excluded.

**Minimum sample:** Execution score displays confidence band `"low"` until ≥ 3 completed contracts.

---

## 7. Execution Score v1 formula

**Question answered:** *How reliably does this party fulfill TEKRR obligations?*

Per completed contract, each TEKRR dimension receives:
`fulfilled` (1.0) · `partially_fulfilled` (0.5) · `unfulfilled` (0.0) · `not_applicable` (excluded)

Rolling aggregate over last 20 contracts (or all if fewer):
- Overall execution score = weighted average × 1000
- Per-dimension scores published separately on trust profile

**Pending complaints** exclude affected contract from aggregate until resolved.

---

## 8. External APIs (engine-to-engine)

### 8.1 Queries (other engines call Identity)

| Method | Input | Output | Used by |
|--------|-------|--------|---------|
| `getActorTier(actor_id)` | actor_id | tier, status, expires_at | Contract |
| `checkTierRequirement(actor_id, min_tier)` | actor_id, min_tier | pass/fail, reason | Contract |
| `getTrustProfile(actor_id, viewer_context)` | actor_id, viewer | profile (scoped) | Contract, Company |
| `getVerificationSnapshot(actor_id)` | actor_id | tier + credential ids at point in time | Contract (activation) |

### 8.2 Events consumed (Identity subscribes)

| Event | Scoring impact |
|-------|----------------|
| `contract.completed` | Contract integrity + execution inputs |
| `contract.cancelled` | Contract integrity (fault attribution) |
| `complaint.resolved` | Complaint record + execution dimension override |
| `execution.attestation_recorded` | Execution score inputs |
| `verification.approved` / `expired` | Identity assurance |

---

## 9. MVP scope

- Actor types: Customer, Service Provider, Platform Admin
- Tiers: T0–T2 operational; T3–T4 defined but manual/admin-only stub
- KYC: Third-party automated (T1)
- Credentials: Upload + manual admin review (T2)
- Trust + execution score v1 with published breakdown
- Public trust profile (aggregated, privacy-safe)

---

## 10. Invariants

- INV-I1: Trust score is never manually set; only recomputed from events.
- INV-I2: Verification documents accessible only to Verification Analyst role.
- INV-I3: Tier downgrade on expiry blocks new contract acceptance, not retroactive contract validity.
- INV-I4: Deactivated actors retain anonymized contract-linked verification snapshots.
