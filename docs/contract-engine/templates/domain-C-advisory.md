# Contract Templates — Domain C: Advisory & Decision

**Templates:** CT-C.1.1@v1 · CT-C.1.2@v1

---

## CT-C.1.1@v1 — Strategy Consulting

### 1. Contract Template

| Field | Value |
|-------|-------|
| template_id | `CT-C.1.1@v1` |
| action_code | C.1.1 |
| action_name | Strategy Consulting |
| domain | C — Advisory & Decision |
| min_customer_tier | T1 |
| min_provider_tier | T1 |
| default_risk_level | 2 |
| tekrr_emphasis | K, S, T |
| clause_modules | CL-CORE-001, CL-CORE-002, CL-CORE-003, CL-TIME-001, CL-KNOW-001, CL-RISK-001, CL-RESP-001 |
| contract_term_type | fixed |

### 2. Inputs

**Party inputs:** organization context, strategic question/challenge, confidentiality acknowledgment, commercial terms note.

**TEKRR inputs:**

| Dimension | Field | Required | Party |
|-----------|-------|----------|-------|
| T | scheduled_start | Yes | Customer |
| T | estimated_duration (engagement length) | Yes | Both |
| T | completion_deadline | Yes | Customer |
| T | milestone_dates[] (review sessions) | Optional | Both |
| E | deliverables[] (report, presentation, workshop) | Yes | Both |
| E | location_type (remote/on-site) | Yes | Customer |
| E | excluded_scope | Optional | Both |
| K | required_credentials[] (MBA, domain expertise) | Optional | Provider |
| K | standard_of_care (professional advisory) | Yes | Provider |
| R | risk_level | Yes | Both |
| R | liability_allocation (advice not outcome guarantee) | Yes | Both |
| S | acceptance_criteria | Yes | Customer |
| S | acceptance_party | Yes | Customer |
| S | compliance_notes (confidentiality) | Yes | Both |

### 3. Outputs

Contract artifacts, 5 milestones, advisory deliverables (report/deck), session records, trust events, EVAL-ADVISORY-v1.

### 4. Evidence Requirements

| Milestone | Required | Submitted by |
|-----------|----------|--------------|
| M-SCOPE | EV-SIGN (engagement charter) | Both |
| M-WIP | EV-TS (analysis phase start), EV-NOTE | Provider |
| M-DELIVER | EV-DOC (strategy report/presentation) | Provider |
| M-ACCEPT | EV-SIGN | Customer |
| M-COMPLETE | EV-TS | System |

### 5. Milestones

| Seq | Code | Name | Responsible | Due rule | Blocking |
|-----|------|------|-------------|----------|----------|
| 1 | M-SCOPE | Engagement Scope Agreed | Both | scheduled_start | Yes |
| 2 | M-WIP | Analysis Underway | Provider | scheduled_start + 3d | Yes |
| 3 | M-DELIVER | Recommendations Delivered | Provider | completion_deadline | Yes |
| 4 | M-ACCEPT | Customer Acceptance | Customer | completion_deadline + 7d | Yes |
| 5 | M-COMPLETE | Complete | System | Auto | Yes |

### 6. Acceptance Rules

- M-SCOPE charter must list deliverables[] explicitly.
- M-DELIVER must include all listed deliverables.
- Customer acceptance window 7 days (longer for document review).
- Confidentiality clause binding both parties (CL-RESP-001).

### 7. Trust Score Impact

| Component | Impact |
|-----------|--------|
| Execution Success (30%) | Deliverable completeness vs deliverables[] |
| Time Commitment (20%) | M-DELIVER by deadline; session dates if declared |
| Complaints (10%) | Risk factor 0.8 |
| Customer Evaluation (10%) | EVAL-ADVISORY-v1: insight quality, relevance, clarity |

### 8. Complaint Triggers

| Trigger | Type | Dimension |
|---------|------|-----------|
| Deliverable missing from scope | EFFORT_DEFICIENCY | E |
| Recommendations materially off-scope | EFFORT_DEFICIENCY | E |
| Missed delivery deadline | TIME_BREACH | T |
| Credential misrepresented | KNOWLEDGE_MISREP | K |
| Confidential info disclosed | RISK_INCIDENT | R |
| Customer expected outcome guarantee | RESPONSIBILITY_FAILURE | S (scope dispute) |

**Filing window:** 30 days post-completion.

---

## CT-C.1.2@v1 — Operations Advisory

### 1. Contract Template

| Field | Value |
|-------|-------|
| template_id | `CT-C.1.2@v1` |
| action_code | C.1.2 |
| action_name | Operations Advisory |
| domain | C — Advisory & Decision |
| min_customer_tier | T1 |
| min_provider_tier | T1 |
| default_risk_level | 2 |
| tekrr_emphasis | K, E, S |
| clause_modules | CL-CORE-001, CL-CORE-002, CL-CORE-003, CL-TIME-001, CL-EFFORT-001, CL-KNOW-001, CL-RESP-001 |
| contract_term_type | fixed |

### 2. Inputs

**Party inputs:** process/operation description, current pain points, systems access note, commercial terms note.

**TEKRR inputs:**

| Dimension | Field | Required | Party |
|-----------|-------|----------|-------|
| T | scheduled_start | Yes | Customer |
| T | estimated_duration | Yes | Both |
| T | completion_deadline | Yes | Customer |
| E | deliverables[] (process map, improvement plan, SOP drafts) | Yes | Both |
| E | location_type | Yes | Customer |
| K | standard_of_care | Yes | Provider |
| K | required_credentials[] | Optional | Provider |
| R | risk_level | Yes | Both |
| R | liability_allocation | Yes | Both |
| S | acceptance_criteria | Yes | Customer |
| S | acceptance_party | Yes | Customer |

### 3. Outputs

Contract artifacts, 5 milestones, process documentation, improvement plan, trust events, EVAL-ADVISORY-v1.

### 4. Evidence Requirements

| Milestone | Required | Submitted by |
|-----------|----------|--------------|
| M-SCOPE | EV-SIGN, EV-DOC (current state summary optional) | Both |
| M-WIP | EV-TS, EV-NOTE (assessment notes) | Provider |
| M-DELIVER | EV-DOC (improvement plan + deliverables) | Provider |
| M-ACCEPT | EV-SIGN | Customer |
| M-COMPLETE | EV-TS | System |

### 5. Milestones

| Seq | Code | Name | Responsible | Due rule | Blocking |
|-----|------|------|-------------|----------|----------|
| 1 | M-SCOPE | Operational Scope Defined | Both | scheduled_start | Yes |
| 2 | M-WIP | Assessment Started | Provider | scheduled_start + 2d | Yes |
| 3 | M-DELIVER | Plan Delivered | Provider | completion_deadline | Yes |
| 4 | M-ACCEPT | Customer Acceptance | Customer | completion_deadline + 7d | Yes |
| 5 | M-COMPLETE | Complete | System | Auto | Yes |

### 6. Acceptance Rules

- Deliverables must be actionable (acceptance_criteria defines measurability).
- Customer may request one revision cycle via Issue Raised before complaint (MVP: note only).

### 7. Trust Score Impact

| Component | Impact |
|-----------|--------|
| Execution Success (30%) | Plan includes all scoped process areas |
| Time Commitment (20%) | Assessment start + delivery deadlines |
| Customer Evaluation (10%) | EVAL-ADVISORY-v1: actionability, operational fit |

### 8. Complaint Triggers

| Trigger | Type | Dimension |
|---------|------|-----------|
| Plan excludes scoped processes | EFFORT_DEFICIENCY | E |
| Late delivery | TIME_BREACH | T |
| Recommendations unsafe to implement | RISK_INCIDENT | R |
| Provider lacked claimed operations expertise | KNOWLEDGE_MISREP | K |

**Filing window:** 30 days.
