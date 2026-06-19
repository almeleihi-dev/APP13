# Contract Template — Universal Schema v1

**Version:** 1.0  
**Applies to:** All `CT-{action_code}@v1` templates

Every contract template in APP13 Contract Engine v1 defines **exactly eight sections**. This document specifies the schema for each section.

---

## Section 1 — Contract Template

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `template_id` | string | Yes | e.g., `CT-B.2.1@v1` |
| `action_code` | string | Yes | Taxonomy code |
| `action_name` | string | Yes | Human name |
| `domain` | enum | Yes | A–H |
| `version` | semver | Yes | Template version |
| `min_customer_tier` | enum | Yes | Default T1 |
| `min_provider_tier` | enum | Yes | T1 or T2 |
| `default_risk_level` | int 1–5 | Yes | Default if not overridden |
| `tekrr_emphasis` | object | Yes | Primary dimensions |
| `clause_modules` | string[] | Yes | Clause library refs |
| `jurisdiction_pack` | string | Yes | MVP: `US-GENERIC-v1` |
| `contract_term_type` | enum | Yes | `fixed`, `session`, `period`, `ongoing_until_complete` |

---

## Section 2 — Inputs

### 2.1 Party inputs

| Input | Submitted by | Phase |
|-------|--------------|-------|
| Customer identity ref | Customer | Draft |
| Provider identity ref | Customer (invite) | Draft |
| Work location / context | Customer | Draft |
| Commercial terms note | Customer | Draft (declarative; no payment processing) |

### 2.2 TEKRR inputs (structure)

Each template declares required fields per dimension:

| Dimension | Common fields |
|-----------|---------------|
| **T — Time** | `scheduled_start`, `estimated_duration`, `completion_deadline`, `response_sla` |
| **E — Effort** | `deliverables[]`, `location_type`, `materials_party`, `excluded_scope` |
| **K — Knowledge** | `required_credentials[]`, `standard_of_care`, `supervision_required` |
| **R — Risk** | `risk_level`, `hazard_declarations[]`, `liability_allocation` |
| **S — Responsibility** | `acceptance_criteria`, `acceptance_party`, `warranty_period`, `compliance_notes` |

Each field marked: `required` | `optional` | `provider_only` | `customer_only`

---

## Section 3 — Outputs

| Output | Produced when | Consumer |
|--------|---------------|----------|
| Contract PDF | Proposed | Parties |
| Contract JSON | Proposed | Engines |
| Milestone set | Active | Execution |
| Evidence records | Active → Completed | Execution, Complaint |
| Attestation record | Per milestone / final | Trust |
| Trust events | Completed / Closed | Identity |
| Complaint case ref | Disputed | Complaint Engine |

---

## Section 4 — Evidence Requirements

Per milestone, specify:

| Field | Description |
|-------|-------------|
| `milestone_code` | M-ACCESS, M-WIP, etc. |
| `required_evidence[]` | EV-TS, EV-PHOTO, etc. |
| `submitted_by` | provider / customer / either |
| `optional_evidence[]` | Additional allowed types |

---

## Section 5 — Milestones

| Field | Description |
|-------|-------------|
| `sequence` | Order integer |
| `code` | Milestone archetype code |
| `name` | Human label |
| `responsible_party` | provider / customer / both |
| `due_rule` | How due_at computed from TEKRR Time |
| `blocking` | Must complete before next milestone |

---

## Section 6 — Acceptance Rules

| Rule type | Description |
|-----------|-------------|
| **Contract acceptance** | Both parties must accept at Proposed → Accepted |
| **Tier gates** | Min tiers at acceptance |
| **Milestone acceptance** | Who signs off each milestone |
| **Final acceptance** | Customer attestation required unless auto-policy |
| **Auto-accept policy** | Silence period (MVP default: 7 days) |
| **Completion criteria** | All blocking milestones attested |

---

## Section 7 — Trust Score Impact

Map contract outcomes to trust components:

| Component | Weight | Template specifies |
|-----------|--------|-------------------|
| Verification | 30% | Tier requirement contribution (static) |
| Execution Success | 30% | Milestone completion scoring rules |
| Time Commitment | 20% | On-time rules per time-bound milestone |
| Complaints | 10% | Normalization factor by risk level |
| Customer Evaluation | 10% | Evaluation form ref + required fields |

**Event signals emitted:**

| Signal | When |
|--------|------|
| `trust.execution.milestone_completed` | Each milestone attested |
| `trust.execution.milestone_failed` | Milestone rejected / rework |
| `trust.time.on_time` | Milestone within due window |
| `trust.time.late` | Milestone past due |
| `trust.evaluation.received` | Customer evaluation submitted |
| `trust.complaint.resolved` | From Complaint Engine (not Contract Engine) |

---

## Section 8 — Complaint Triggers

| Field | Description |
|-------|-------------|
| `auto_suggest_triggers[]` | System conditions suggesting complaint |
| `eligible_complaint_types[]` | TIME_BREACH, EFFORT_DEFICIENCY, etc. |
| `eligible_dimensions[]` | T, E, K, R, S |
| `filing_window_days` | Default 30 post-completion |
| `severity_hints` | Default severity by complaint type |
| `issue_to_dispute_conditions` | When Issue Raised must become Disputed |

---

## Complaint type codes (reference)

| Code | Dimension |
|------|-----------|
| `TIME_BREACH` | T |
| `EFFORT_DEFICIENCY` | E |
| `KNOWLEDGE_MISREP` | K |
| `RISK_INCIDENT` | R |
| `RESPONSIBILITY_FAILURE` | S |
| `CONTRACT_INTEGRITY` | Cross-cutting |

---

## Evidence type codes (reference)

| Code | Name |
|------|------|
| `EV-TS` | Timestamp |
| `EV-PHOTO` | Photograph |
| `EV-DOC` | Document |
| `EV-CHECK` | Checklist |
| `EV-TEST` | Test Result |
| `EV-SIGN` | Digital Sign-off |
| `EV-CRED` | Credential Verification |
| `EV-NOTE` | Structured Note |

---

## Milestone archetype codes (reference)

| Code | Name |
|------|------|
| `M-ACCESS` | Access Confirmed |
| `M-SCOPE` | Scope Confirmed |
| `M-WIP` | Work In Progress |
| `M-DELIVER` | Deliverable Submitted |
| `M-VERIFY` | Verification Complete |
| `M-ACCEPT` | Customer Acceptance |
| `M-COMPLETE` | Completion |
