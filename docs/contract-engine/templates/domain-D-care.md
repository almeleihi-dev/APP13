# Contract Templates — Domain D: Care & Support

**Templates:** CT-D.1.1@v1 · CT-D.3.1@v1

---

## CT-D.1.1@v1 — Personal Care Assistance

### 1. Contract Template

| Field | Value |
|-------|-------|
| template_id | `CT-D.1.1@v1` |
| action_code | D.1.1 |
| action_name | Personal Care Assistance |
| domain | D — Care & Support |
| min_customer_tier | T1 |
| min_provider_tier | T2 |
| default_risk_level | 4 |
| tekrr_emphasis | S, K, T |
| clause_modules | CL-CORE-001, CL-CORE-002, CL-CORE-003, CL-TIME-001, CL-EFFORT-001, CL-KNOW-001, CL-RISK-001, CL-RISK-002, CL-CARE-001, CL-RESP-001 |
| contract_term_type | period |

### 2. Inputs

**Party inputs:** care recipient profile, care location, emergency contact, vulnerability acknowledgment, commercial terms note.

**TEKRR inputs:**

| Dimension | Field | Required | Party |
|-----------|-------|----------|-------|
| T | scheduled_start | Yes | Customer |
| T | session_duration | Yes | Both |
| T | period_end (last session date) | Yes | Customer |
| T | session_schedule[] | Yes | Both |
| E | deliverables[] (care tasks per session) | Yes | Customer |
| E | location_type (recipient home) | Yes | Customer |
| K | required_credentials[] (care aide cert, first aid) | Yes | Provider |
| K | standard_of_care (non-medical care boundary) | Yes | Both |
| R | risk_level | Yes | Both |
| R | hazard_declarations[] (mobility, cognitive) | Yes | Both |
| R | liability_allocation | Yes | Both |
| S | acceptance_criteria (per session) | Yes | Customer |
| S | acceptance_party | Yes | Customer |
| S | compliance_notes (non-medical boundary) | Yes | Both |

### 3. Outputs

Contract artifacts, recurring session milestones, per-session checklists, care boundary attestation, trust events, EVAL-CARE-v1.

### 4. Evidence Requirements

| Milestone | Required | Submitted by |
|-----------|----------|--------------|
| M-SCOPE | EV-SIGN (care plan), EV-DOC (care plan summary) | Both |
| M-WIP (per session) | EV-TS (session start/end), EV-CHECK (tasks completed) | Provider |
| M-COMPLETE | EV-SIGN (period end review) | Customer |

**Note:** No M-VERIFY archetype — recurring M-WIP per session; final M-COMPLETE at period_end.

### 5. Milestones

| Seq | Code | Name | Responsible | Due rule | Blocking |
|-----|------|------|-------------|----------|----------|
| 1 | M-SCOPE | Care Plan Agreed | Both | scheduled_start | Yes |
| 2 | M-WIP | Session Execution (recurring) | Provider | Each session_schedule entry | Yes (per session) |
| 3 | M-COMPLETE | Care Period Complete | Customer | period_end + 48h | Yes |

### 6. Acceptance Rules

- Provider T2 + care credential required.
- Non-medical boundary explicitly acknowledged in M-SCOPE.
- Each session: checklist must cover all deliverables[] for that session type.
- Missed session without 24h notice = time breach trigger.
- Period completion requires ≥90% sessions completed or documented cancellation.

### 7. Trust Score Impact

| Component | Impact |
|-----------|--------|
| Verification (30%) | T2 + care cert weighted high |
| Execution Success (30%) | Session completion rate × checklist fidelity |
| Time Commitment (20%) | Session punctuality (start within 15m of schedule) |
| Complaints (10%) | Risk factor 1.2 (level 4) |
| Customer Evaluation (10%) | EVAL-CARE-v1: dignity, reliability, task quality |

### 8. Complaint Triggers

| Trigger | Type | Dimension |
|---------|------|-----------|
| Missed session without notice | TIME_BREACH | T |
| Care tasks skipped on checklist | EFFORT_DEFICIENCY | E |
| Medical act performed (boundary breach) | KNOWLEDGE_MISREP | K |
| Recipient injury during care | RISK_INCIDENT | R |
| Non-medical boundary violated | RESPONSIBILITY_FAILURE | S |
| Unverified provider performed care | CONTRACT_INTEGRITY | — |

**Filing window:** 30 days from period_end; RISK_INCIDENT immediate.

---

## CT-D.3.1@v1 — Household Management Aid

### 1. Contract Template

| Field | Value |
|-------|-------|
| template_id | `CT-D.3.1@v1` |
| action_code | D.3.1 |
| action_name | Household Management Aid |
| domain | D — Care & Support |
| min_customer_tier | T1 |
| min_provider_tier | T1 |
| default_risk_level | 2 |
| tekrr_emphasis | E, T, S |
| clause_modules | CL-CORE-001, CL-CORE-002, CL-CORE-003, CL-TIME-001, CL-EFFORT-001, CL-CARE-001, CL-RESP-001 |
| contract_term_type | period |

### 2. Inputs

**Party inputs:** household location, task list, access instructions, presence requirements, commercial terms note.

**TEKRR inputs:**

| Dimension | Field | Required | Party |
|-----------|-------|----------|-------|
| T | scheduled_start | Yes | Customer |
| T | session_duration | Yes | Both |
| T | period_end | Yes | Customer |
| T | session_schedule[] | Yes | Both |
| E | deliverables[] (tasks per visit) | Yes | Customer |
| E | location_type | Yes | Customer |
| K | standard_of_care | Optional | Provider |
| R | risk_level | Yes | Both |
| R | hazard_declarations[] (access to valuables) | Optional | Both |
| S | acceptance_criteria | Yes | Customer |
| S | acceptance_party | Yes | Customer |

### 3. Outputs

Contract artifacts, recurring visit milestones, task checklists, trust events, EVAL-CARE-v1.

### 4. Evidence Requirements

| Milestone | Required | Submitted by |
|-----------|----------|--------------|
| M-SCOPE | EV-SIGN (task list agreed) | Both |
| M-WIP (per visit) | EV-TS, EV-CHECK | Provider |
| M-COMPLETE | EV-SIGN | Customer |

### 5. Milestones

| Seq | Code | Name | Responsible | Due rule | Blocking |
|-----|------|------|-------------|----------|----------|
| 1 | M-SCOPE | Task Scope Agreed | Both | scheduled_start | Yes |
| 2 | M-WIP | Visit Completed (recurring) | Provider | session_schedule | Yes |
| 3 | M-COMPLETE | Period Complete | Customer | period_end + 48h | Yes |

### 6. Acceptance Rules

- T1 / T1 tier gates.
- Task checklist per visit; customer may spot-check via Issue Raised.
- Valuables access must be declared in R if applicable.

### 7. Trust Score Impact

| Component | Impact |
|-----------|--------|
| Execution Success (30%) | Visit completion rate + task completion |
| Time Commitment (20%) | Visit punctuality |
| Complaints (10%) | Risk factor 0.8; ×1.5 if valuables access declared |
| Customer Evaluation (10%) | EVAL-CARE-v1: reliability, thoroughness |

### 8. Complaint Triggers

| Trigger | Type | Dimension |
|---------|------|-----------|
| Tasks consistently incomplete | EFFORT_DEFICIENCY | E |
| Missed visits | TIME_BREACH | T |
| Property loss or damage | RISK_INCIDENT | R |
| Unauthorized access to undeclared areas | RESPONSIBILITY_FAILURE | S |

**Filing window:** 30 days from period_end.
