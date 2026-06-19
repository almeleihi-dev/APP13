# Action Engine — Architecture v1

**Engine ID:** `action`  
**Version:** 1.0  
**Owner domain:** TEKRR decomposition, obligations, execution, attestations

---

## 1. Purpose

The Action Engine is APP13's **execution intelligence layer**. It decomposes professional work into the five TEKRR dimensions (Time, Effort, Knowledge, Risk, Responsibility), materializes enforceable obligations from contracted TEKRR profiles, tracks execution evidence, and records attestation outcomes that feed Identity Engine scoring.

The Action Engine answers: *What work was defined, what must be done, and was it done?*

---

## 2. Responsibilities

| In scope | Out of scope |
|----------|--------------|
| TEKRR profile creation and validation | Contract PDF generation |
| Category-specific TEKRR question sets | Party acceptance / signatures |
| Obligation graph materialization | Identity verification |
| Execution session management | Complaint adjudication |
| Evidence capture and storage refs | Trust score computation |
| Dual-party attestation workflow | Pricing or commercial terms |
| TEKRR amendment deltas | |

---

## 3. TEKRR model

### 3.1 Dimensions

| Code | Dimension | Profile sections |
|------|-----------|------------------|
| T | Time | duration, schedule, milestones, SLAs, late consequences |
| E | Effort | deliverables, location, materials, exclusions |
| K | Knowledge | credentials required, standard of care, documentation |
| R | Risk | risk level 1–5, hazards, insurance reqs, liability allocation |
| S | Responsibility | responsible parties, compliance, acceptance criteria, warranty |

> **Note:** Internal code uses `S` for Responsibility to distinguish from Risk (`R`).

### 3.2 TEKRR profile lifecycle

```
draft → in_progress → complete → [amended → complete_vN] → snapshotted
```

| State | Meaning |
|-------|---------|
| `draft` | Engagement created; no inputs |
| `in_progress` | One or more parties submitting |
| `complete` | All required fields satisfied; validation passed |
| `snapshotted` | Immutable copy bound to activated contract |

---

## 4. Internal components

```
┌─────────────────────────────────────────────────┐
│                  Action Engine                   │
├─────────────────────────────────────────────────┤
│  TEKRR Composer      │  Obligation Builder      │
│  ──────────────      │  ──────────────────      │
│  • category schemas  │  • graph from TEKRR      │
│  • field validation  │  • milestone mapping     │
│  • completeness rules│  • acceptance criteria   │
├──────────────────────┼──────────────────────────┤
│  Execution Tracker   │  Attestation Service     │
│  ─────────────────   │  ───────────────────     │
│  • start/stop gates  │  • per-dimension attest  │
│  • evidence binding  │  • conflict detection    │
│  • check-in (time)   │  • freeze on complaint   │
└─────────────────────────────────────────────────┘
```

---

## 5. Category schema (logical)

Each contract category defines:

| Schema element | Description |
|----------------|-------------|
| `category_id` | Stable identifier |
| `tekrr_required_fields` | Per-dimension mandatory field list |
| `risk_thresholds` | Min provider tier by risk level |
| `validation_rules` | Cross-field rules (e.g., risk ≥ 4 → insurance required) |
| `obligation_templates` | Maps TEKRR fields → trackable obligations |
| `version` | Schema version for reproducibility |

**MVP categories:** home_maintenance, professional_consulting, personal_care, event_services, tutoring

---

## 6. Obligation graph

When Contract Engine emits `contract.activated`, Action Engine materializes an **Obligation Graph**:

| Obligation type | TEKRR source | Trackable artifact |
|-----------------|--------------|-------------------|
| `time_milestone` | Time.schedule | Timestamp check-in |
| `time_sla` | Time.sla | Response time log |
| `effort_deliverable` | Effort.deliverables[] | Upload / checklist |
| `knowledge_credential` | Knowledge.credentials[] | Identity tier re-check |
| `risk_insurance` | Risk.insurance_req | Declaration / Phase 2 attestation token |
| `risk_safety_checklist` | Risk.hazards | Completed checklist upload |
| `responsibility_signoff` | Responsibility.acceptance | Named party acceptance |
| `responsibility_compliance` | Responsibility.compliance[] | Document upload |

Each obligation has:
- `obligation_id`, `contract_id`, `dimension`, `description`, `required`, `status`, `due_at`, `evidence_refs[]`

**Obligation statuses:** `pending` · `in_progress` · `submitted` · `accepted` · `disputed` · `frozen` · `waived`

---

## 7. Execution lifecycle

```
[contract.active] → execution.ready → execution.in_progress → execution.pending_attestation
    → execution.completed | execution.disputed → [complaint path]
```

### Gating

| Action | Gate |
|--------|------|
| Open execution | Contract status = `active` |
| Submit evidence | Execution status = `in_progress` |
| Attest dimension | All required obligations for dimension submitted OR explicitly disputed |
| Complete execution | All dimensions attested OR contract completion policy timeout |
| Freeze dimension | Complaint Engine request on active complaint |

---

## 8. Attestation model

Each TEKRR dimension receives one **attestation record** per contract:

| Field | Description |
|-------|-------------|
| dimension | T / E / K / R / S |
| provider_attestation | optional self-report |
| customer_attestation | `fulfilled` / `partially_fulfilled` / `unfulfilled` |
| provider_response | if customer disputes |
| final_status | derived or admin/compliant resolved |
| attested_at | timestamp |

**Conflict rule:** Mismatch between customer and provider → dimension status `disputed` → Complaint Engine may be invoked.

**Auto-resolution (MVP):** If one party attests and other silent for 7 days post-completion request → accepting party's attestation stands with audit flag.

---

## 9. External APIs (engine-to-engine)

### 9.1 Called by Contract Engine

| Operation | Description |
|-----------|-------------|
| `initTekrrDraft(engagement_id, category)` | Create empty TEKRR profile |
| `validateTekrrComplete(profile_id)` | Returns pass/fail + missing fields |
| `getTekrrSnapshot(profile_id)` | Immutable snapshot for contract binding |
| `applyTekrrAmendmentDelta(profile_id, delta)` | Post-amendment update |

### 9.2 Called by Contract Engine (activation)

| Operation | Description |
|-----------|-------------|
| `materializeObligations(contract_id, tekrr_snapshot)` | Build obligation graph |

### 9.3 Called by Complaint Engine

| Operation | Description |
|-----------|-------------|
| `freezeDimension(contract_id, dimension, complaint_id)` | Lock attestation |
| `applyAdjudicationOutcome(contract_id, dimension, outcome)` | Set final attestation |
| `getExecutionRecord(contract_id)` | Evidence package for dispute |

### 9.4 Events emitted

`tekrr.completed` · `obligation.created` · `execution.started` · `execution.evidence_submitted` · `execution.attestation_recorded` · `execution.dimension_frozen` · `execution.completed`

---

## 10. MVP scope

- TEKRR composer for 3–5 categories
- Two-party input (customer + provider)
- Obligation graph from templates
- Evidence upload (files, timestamps)
- Time check-in (manual timestamp MVP)
- Dual attestation with dispute flag
- Risk dimension: self-declared insurance field (no Insurance Entity API)

---

## 11. Invariants

- INV-A1: No obligation graph exists for non-active contracts.
- INV-A2: TEKRR snapshot at activation is immutable; amendments create new snapshot version.
- INV-A3: Every obligation maps to exactly one TEKRR dimension.
- INV-A4: Frozen dimensions cannot change attestation until Complaint Engine releases.
