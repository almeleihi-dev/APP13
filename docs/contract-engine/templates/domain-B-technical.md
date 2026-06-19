# Contract Templates — Domain B: Technical Execution

**Templates:** CT-B.1.2@v1 · CT-B.2.1@v1 · CT-B.3.3@v1

---

## CT-B.1.2@v1 — Plumbing Service

### 1. Contract Template

| Field | Value |
|-------|-------|
| template_id | `CT-B.1.2@v1` |
| action_code | B.1.2 |
| action_name | Plumbing Service |
| domain | B — Technical Execution |
| min_customer_tier | T1 |
| min_provider_tier | T2 |
| default_risk_level | 4 |
| tekrr_emphasis | K, R, E |
| clause_modules | CL-CORE-001, CL-CORE-002, CL-CORE-003, CL-TIME-001, CL-EFFORT-001, CL-KNOW-001, CL-RISK-001, CL-RISK-002, CL-RESP-001, CL-RESP-002 |
| contract_term_type | fixed |

### 2. Inputs

**Party inputs:** service location, problem description, access instructions, commercial terms note.

**TEKRR inputs:**

| Dimension | Field | Required | Party |
|-----------|-------|----------|-------|
| T | scheduled_start | Yes | Customer |
| T | estimated_duration | Yes | Provider |
| T | completion_deadline | Yes | Customer |
| T | response_sla | Optional | Customer |
| E | deliverables[] (repair/install tasks) | Yes | Customer |
| E | materials_party | Yes | Both |
| E | excluded_scope | Optional | Both |
| K | required_credentials[] (plumber license) | Yes | Provider |
| K | standard_of_care (code-compliant) | Yes | Provider |
| R | risk_level | Yes | Both |
| R | hazard_declarations[] (water damage, gas adjacency) | Yes | Both |
| R | liability_allocation | Yes | Both |
| S | permit_responsibility | Yes | Both |
| S | acceptance_criteria | Yes | Customer |
| S | warranty_period | Yes | Provider |

### 3. Outputs

Contract artifacts, 6 milestones, credential verification record, test/leak check evidence, trust events, EVAL-TECHNICAL-v1.

### 4. Evidence Requirements

| Milestone | Required | Submitted by |
|-----------|----------|--------------|
| M-ACCESS | EV-TS, EV-NOTE | Provider |
| M-SCOPE | EV-SIGN (scope confirmation) | Both |
| M-WIP | EV-TS, EV-PHOTO (before) | Provider |
| M-VERIFY | EV-PHOTO (after), EV-TEST (pressure/leak), EV-CRED, EV-CHECK | Provider |
| M-ACCEPT | EV-SIGN | Customer |
| M-COMPLETE | EV-TS | System |

### 5. Milestones

| Seq | Code | Name | Responsible | Due rule | Blocking |
|-----|------|------|-------------|----------|----------|
| 1 | M-ACCESS | Site Access | Provider | scheduled_start | Yes |
| 2 | M-SCOPE | Scope Confirmed | Both | scheduled_start + 2h | Yes |
| 3 | M-WIP | Work Commenced | Provider | M-SCOPE + 1h | Yes |
| 4 | M-VERIFY | Service Verified | Provider | completion_deadline | Yes |
| 5 | M-ACCEPT | Customer Acceptance | Customer | completion_deadline + 48h | Yes |
| 6 | M-COMPLETE | Complete | System | Auto | Yes |

### 6. Acceptance Rules

- Provider must be T2 with active plumber credential matching TEKRR.
- M-VERIFY requires EV-TEST (no leak / flow test documented).
- M-SCOPE sign-off required before WIP counts for trust.
- Scope change during WIP requires Issue Raised (MVP: cancel + new contract).

### 7. Trust Score Impact

| Component | Impact |
|-----------|--------|
| Verification (30%) | T2 + credential match required |
| Execution Success (30%) | EV-TEST pass required for full M-VERIFY credit |
| Time Commitment (20%) | Response SLA if declared; completion_deadline adherence |
| Complaints (10%) | Risk factor 1.2 (level 4) |
| Customer Evaluation (10%) | EVAL-TECHNICAL-v1: code quality, communication, cleanup |

### 8. Complaint Triggers

| Trigger | Type | Dimension |
|---------|------|-----------|
| Leak/failure within warranty | EFFORT_DEFICIENCY | E |
| No valid license at execution | KNOWLEDGE_MISREP | K |
| Water damage during service | RISK_INCIDENT | R |
| Missed deadline | TIME_BREACH | T |
| Permit not obtained when S required provider | RESPONSIBILITY_FAILURE | S |
| Work without scope sign-off | CONTRACT_INTEGRITY | — |

**Filing window:** 30 days; warranty claims within warranty_period.

---

## CT-B.2.1@v1 — Electrical Installation

### 1. Contract Template

| Field | Value |
|-------|-------|
| template_id | `CT-B.2.1@v1` |
| action_code | B.2.1 |
| action_name | Electrical Installation |
| domain | B — Technical Execution |
| min_customer_tier | T1 |
| min_provider_tier | T2 |
| default_risk_level | 5 |
| tekrr_emphasis | K, R, E |
| clause_modules | CL-CORE-001, CL-CORE-002, CL-CORE-003, CL-TIME-001, CL-EFFORT-001, CL-KNOW-001, CL-RISK-001, CL-RISK-002, CL-RESP-001, CL-RESP-002 |
| contract_term_type | fixed |

### 2. Inputs

**Party inputs:** installation location, circuit/panel details, equipment list, commercial terms note.

**TEKRR inputs:**

| Dimension | Field | Required | Party |
|-----------|-------|----------|-------|
| T | scheduled_start | Yes | Customer |
| T | estimated_duration | Yes | Provider |
| T | completion_deadline | Yes | Customer |
| E | deliverables[] (outlets, circuits, devices) | Yes | Customer |
| E | materials_party | Yes | Both |
| K | required_credentials[] (electrician license) | Yes | Provider |
| K | standard_of_care (NEC/local code reference) | Yes | Provider |
| R | risk_level | Yes (default 5) | Both |
| R | hazard_declarations[] (live wiring, panel work) | Yes | Both |
| R | liability_allocation | Yes | Both |
| S | permit_responsibility | Yes | Both |
| S | acceptance_criteria | Yes | Customer |
| S | warranty_period | Yes | Provider |

### 3. Outputs

Contract artifacts, 6 milestones, electrical test results, permit doc (if applicable), credential verification, trust events, EVAL-TECHNICAL-v1.

### 4. Evidence Requirements

| Milestone | Required | Submitted by |
|-----------|----------|--------------|
| M-ACCESS | EV-TS | Provider |
| M-SCOPE | EV-SIGN, EV-DOC (scope doc optional) | Both |
| M-WIP | EV-TS, EV-PHOTO | Provider |
| M-VERIFY | EV-PHOTO, EV-TEST (circuit test), EV-CRED, EV-CHECK (safety checklist), EV-DOC (permit if required) | Provider |
| M-ACCEPT | EV-SIGN | Customer |
| M-COMPLETE | EV-TS | System |

### 5. Milestones

| Seq | Code | Name | Responsible | Due rule | Blocking |
|-----|------|------|-------------|----------|----------|
| 1 | M-ACCESS | Access Confirmed | Provider | scheduled_start | Yes |
| 2 | M-SCOPE | Installation Scope Agreed | Both | scheduled_start + 4h | Yes |
| 3 | M-WIP | Installation Started | Provider | M-SCOPE + 1h | Yes |
| 4 | M-VERIFY | Installation Tested & Verified | Provider | completion_deadline | Yes |
| 5 | M-ACCEPT | Customer Acceptance | Customer | completion_deadline + 48h | Yes |
| 6 | M-COMPLETE | Complete | System | Auto | Yes |

### 6. Acceptance Rules

- Provider T2 + electrician license required.
- Risk level 5: hazard_declarations mandatory non-empty.
- M-VERIFY requires EV-TEST (circuit/polarity/ground test documented).
- Permit EV-DOC required when S.permit_responsibility = provider.

### 7. Trust Score Impact

| Component | Impact |
|-----------|--------|
| Verification (30%) | T2 + license match; highest tier weight |
| Execution Success (30%) | Test pass + checklist = full credit; fail = -3 |
| Time Commitment (20%) | Strict deadline; late M-VERIFY = full time penalty |
| Complaints (10%) | Risk factor 1.5 (level 5) — highest normalization |
| Customer Evaluation (10%) | EVAL-TECHNICAL-v1: safety, code compliance, workmanship |

### 8. Complaint Triggers

| Trigger | Type | Dimension |
|---------|------|-----------|
| Electrical fault post-install | RISK_INCIDENT | R |
| Unlicensed work performed | KNOWLEDGE_MISREP | K |
| Missing permit when required | RESPONSIBILITY_FAILURE | S |
| Installation differs from scope | EFFORT_DEFICIENCY | E |
| Safety incident | RISK_INCIDENT | R |
| Test results not provided | CONTRACT_INTEGRITY | — |

**Filing window:** 30 days; safety incidents — immediate Issue Raised, no window wait.

---

## CT-B.3.3@v1 — Technical Troubleshooting

### 1. Contract Template

| Field | Value |
|-------|-------|
| template_id | `CT-B.3.3@v1` |
| action_code | B.3.3 |
| action_name | Technical Troubleshooting |
| domain | B — Technical Execution |
| min_customer_tier | T1 |
| min_provider_tier | T1 |
| default_risk_level | 3 |
| tekrr_emphasis | K, E, T |
| clause_modules | CL-CORE-001, CL-CORE-002, CL-CORE-003, CL-TIME-001, CL-EFFORT-001, CL-KNOW-001, CL-RISK-001, CL-DATA-001, CL-RESP-001 |
| contract_term_type | fixed |

### 2. Inputs

**Party inputs:** system description, symptoms, access method (remote/on-site), data sensitivity flag, commercial terms note.

**TEKRR inputs:**

| Dimension | Field | Required | Party |
|-----------|-------|----------|-------|
| T | scheduled_start | Yes | Customer |
| T | estimated_duration | Yes | Provider |
| T | completion_deadline | Yes | Customer |
| T | response_sla | Yes | Customer |
| E | deliverables[] (diagnosis, fix, or report) | Yes | Customer |
| E | location_type (remote/on-site/hybrid) | Yes | Customer |
| K | required_credentials[] | Optional | Provider |
| K | standard_of_care | Yes | Provider |
| R | risk_level | Yes | Both |
| R | hazard_declarations[] (data loss, system downtime) | If risk ≥ 3 | Both |
| S | acceptance_criteria | Yes | Customer |
| S | acceptance_party | Yes | Customer |

### 3. Outputs

Contract artifacts, 5 milestones, diagnosis/fix report, test confirmation, trust events, EVAL-TECHNICAL-v1.

### 4. Evidence Requirements

| Milestone | Required | Submitted by |
|-----------|----------|--------------|
| M-SCOPE | EV-SIGN (problem statement confirmed) | Both |
| M-WIP | EV-TS, EV-NOTE (diagnosis in progress) | Provider |
| M-DELIVER | EV-DOC (diagnosis report or fix summary) | Provider |
| M-VERIFY | EV-TEST (system functional) or EV-CHECK | Provider |
| M-ACCEPT | EV-SIGN | Customer |
| M-COMPLETE | EV-TS | System |

### 5. Milestones

| Seq | Code | Name | Responsible | Due rule | Blocking |
|-----|------|------|-------------|----------|----------|
| 1 | M-SCOPE | Problem Scope Confirmed | Both | scheduled_start | Yes |
| 2 | M-WIP | Troubleshooting Started | Provider | response_sla from report time | Yes |
| 3 | M-DELIVER | Findings / Fix Delivered | Provider | completion_deadline | Yes |
| 4 | M-VERIFY | Issue Resolved Verified | Provider | M-DELIVER + 24h | Yes |
| 5 | M-ACCEPT | Customer Acceptance | Customer | M-VERIFY + 48h | Yes |
| 6 | M-COMPLETE | Complete | System | Auto | Yes |

### 6. Acceptance Rules

- Response SLA measured from Active → M-WIP start.
- Remote access: customer must confirm access granted at M-SCOPE.
- M-VERIFY requires customer-confirmed system function OR provider test log.
- Data handling per CL-DATA-001 when sensitivity flagged.

### 7. Trust Score Impact

| Component | Impact |
|-----------|--------|
| Execution Success (30%) | First-call resolution = bonus; rework = -1 |
| Time Commitment (20%) | response_sla primary; completion_deadline secondary |
| Complaints (10%) | Risk factor 1.0; ×1.3 if data sensitivity flagged |
| Customer Evaluation (10%) | EVAL-TECHNICAL-v1: resolution quality, communication |

### 8. Complaint Triggers

| Trigger | Type | Dimension |
|---------|------|-----------|
| SLA missed for M-WIP start | TIME_BREACH | T |
| Issue recurs within 7 days | EFFORT_DEFICIENCY | E |
| Data breach or loss | RISK_INCIDENT | R |
| Credential claimed but not held | KNOWLEDGE_MISREP | K |
| Fix caused new failure | RISK_INCIDENT | R |
| Remote access used outside scope | CONTRACT_INTEGRITY | — |

**Filing window:** 30 days.
