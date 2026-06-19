# Complaint Engine — Architecture v1

**Engine ID:** `complaint`  
**Version:** 1.0  
**Owner domain:** Disputes, evidence, mediation, adjudication

---

## 1. Purpose

The Complaint Engine is APP13's **accountability enforcement layer**. It manages formal disputes tied to specific contracts and TEKRR dimensions, orchestrates evidence collection and mediation, produces adjudication outcomes, and emits events that update execution records and trust scores.

There are no standalone reviews or generic ratings — every complaint is **evidence-based and contract-bound**.

---

## 2. Responsibilities

| In scope | Out of scope |
|----------|--------------|
| Complaint filing and validation | TEKRR definition |
| Triage and eligibility checks | Contract generation |
| Evidence package assembly | Identity verification |
| Mediation period management | Trust score formula |
| Admin adjudication workflow | Payment refunds |
| Outcome application to Action + Identity | Criminal investigation |
| External escalation logging (Phase 2 automation) | |

---

## 3. Complaint taxonomy

| Code | Type | TEKRR dimension |
|------|------|-----------------|
| `TIME_BREACH` | Time | T |
| `EFFORT_DEFICIENCY` | Effort | E |
| `KNOWLEDGE_MISREP` | Knowledge | K |
| `RISK_INCIDENT` | Risk | R |
| `RESPONSIBILITY_FAILURE` | Responsibility | S |
| `CONTRACT_INTEGRITY` | Cross-cutting | All (platform rule violations) |

Each filing must specify ≥ 1 type mapped to dimension(s).

---

## 4. Internal components

```
┌─────────────────────────────────────────────────┐
│                Complaint Engine                  │
├─────────────────────────────────────────────────┤
│  Filing Service      │  Triage Service          │
│  ──────────────      │  ───────────────         │
│  • validate window   │  • eligibility checks    │
│  • link contract     │  • duplicate detection   │
│  • assign case id    │  • priority scoring      │
├──────────────────────┼──────────────────────────┤
│  Evidence Manager    │  Adjudication Service    │
│  ────────────────    │  ────────────────────    │
│  • party submissions │  • mediation tracking    │
│  • auto-attach record│  • admin decisions       │
│  • chain of custody  │  • outcome application   │
└─────────────────────────────────────────────────┘
```

---

## 5. Eligibility rules

| Rule | Validation source |
|------|-------------------|
| Contract existed and was `active` at relevant time | Contract Engine |
| Filing within policy window (default 30 days from completion/incident) | Contract + Action |
| Dimension exists in contract TEKRR snapshot | Action Engine |
| No duplicate active complaint on same dimension | Complaint Engine |
| Filer is contract party | Contract Engine |

---

## 6. Severity model

Adjudication outcomes include severity for trust score impact:

| Severity | Description | Trust penalty multiplier |
|----------|-------------|-------------------------|
| `low` | Minor deviation, remediated | 0.5× |
| `medium` | Material unfulfillment | 1.0× |
| `high` | Safety, fraud, credential misrepresentation | 2.0× |
| `critical` | Platform integrity violation | 3.0× + tier review |

---

## 7. Outcome types

| Outcome | Provider fault | Execution impact | Trust impact |
|---------|---------------|------------------|--------------|
| `upheld_provider_fault` | Yes | Dimension → unfulfilled | Penalty applied |
| `upheld_customer_fault` | No | Provider dimension protected | Possible frivolous flag on filer |
| `dismissed` | No | Original attestation stands | None |
| `shared_fault` | Partial | Partially fulfilled | Partial penalty |
| `external_referral` | Pending | Frozen until return | Pending flag |

---

## 8. External APIs (engine-to-engine)

### 8.1 Calls to other engines

| Target | Operation | When |
|--------|-----------|------|
| Contract | `getContract`, `validateComplaintWindow` | Filing |
| Action | `getExecutionRecord`, `freezeDimension` | Filing + triage |
| Action | `applyAdjudicationOutcome` | Resolution |
| Contract | `finalizeCompletion` | Post-resolution |
| Identity | Read-only profile context | Triage prioritization |

### 8.2 Events emitted

`complaint.filed` · `complaint.triaged` · `complaint.evidence_requested` · `complaint.mediation_started` · `complaint.resolved` · `complaint.escalated_external`

### 8.3 Events consumed

| Event | Action |
|-------|--------|
| `execution.attestation_recorded` (disputed) | Suggest complaint path to parties |
| `contract.completed` | Start complaint window clock |

---

## 9. Evidence package (auto-assembled)

On triage pass, Complaint Engine automatically attaches:

| Artifact | Source |
|----------|--------|
| Contract PDF + JSON | Contract Engine |
| TEKRR snapshot | Contract Engine |
| Verification snapshot at activation | Contract Engine |
| Obligation graph + statuses | Action Engine |
| Evidence uploads | Action Engine |
| Attestation records | Action Engine |
| Party acceptance timestamps | Contract Engine |
| Amendment chain (if any) | Contract Engine |

Parties may submit additional evidence within the evidence period (5 business days MVP).

---

## 10. SLA targets

| Stage | MVP target | Production target |
|-------|------------|-------------------|
| Triage | 2 business days | 2 business days |
| Evidence period | 5 business days | 5 business days |
| Mediation | 5 business days | 5 business days |
| Admin adjudication | 5 business days | 3 business days |
| **Median total** | **≤ 15 business days** | **≤ 10 business days** |

---

## 11. MVP scope

- Manual admin adjudication only
- 2-party complaints (customer ↔ provider)
- No automated mediation recommendations
- External escalation logged manually by admin
- Email notifications via Notification context

---

## 12. Invariants

- INV-P1: No complaint exists without a valid contract_id.
- INV-P2: At least one TEKRR dimension must be specified per complaint.
- INV-P3: Adjudication outcome must be applied to Action Engine before `complaint.resolved` event emits.
- INV-P4: Frozen dimensions cannot be resolved in Action until Complaint Engine releases or resolves.
- INV-P5: Dismissed complaints with pattern (3+ frivolous in 12mo) flag filer for admin review.
