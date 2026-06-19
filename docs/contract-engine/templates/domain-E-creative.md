# Contract Templates — Domain E: Creative & Intellectual Production

**Templates:** CT-E.1.1@v1 · CT-E.3.1@v1

---

## CT-E.1.1@v1 — Graphic Design

### 1. Contract Template

| Field | Value |
|-------|-------|
| template_id | `CT-E.1.1@v1` |
| action_code | E.1.1 |
| action_name | Graphic Design |
| domain | E — Creative & Intellectual Production |
| min_customer_tier | T1 |
| min_provider_tier | T1 |
| default_risk_level | 1 |
| tekrr_emphasis | K, E, S |
| clause_modules | CL-CORE-001, CL-CORE-002, CL-CORE-003, CL-TIME-001, CL-EFFORT-001, CL-IP-001, CL-RESP-001 |
| contract_term_type | fixed |

### 2. Inputs

**Party inputs:** design brief, brand assets (if supplied), format/dimensions, revision rounds allowed, commercial terms note.

**TEKRR inputs:**

| Dimension | Field | Required | Party |
|-----------|-------|----------|-------|
| T | scheduled_start | Yes | Customer |
| T | completion_deadline | Yes | Customer |
| T | revision_rounds | Yes | Both |
| E | deliverables[] (files, formats, variants) | Yes | Both |
| E | location_type (remote) | Yes | Customer |
| E | excluded_scope | Optional | Both |
| K | standard_of_care (professional design) | Yes | Provider |
| R | risk_level | Yes | Both |
| R | liability_allocation | Yes | Both |
| S | acceptance_criteria | Yes | Customer |
| S | ip_allocation (customer owns / license) | Yes | Both |
| S | acceptance_party | Yes | Customer |

### 3. Outputs

Contract artifacts, 5 milestones, design files, revision history, IP allocation record, trust events, EVAL-CREATIVE-v1.

### 4. Evidence Requirements

| Milestone | Required | Submitted by |
|-----------|----------|--------------|
| M-SCOPE | EV-SIGN (brief confirmed) | Both |
| M-WIP | EV-TS (concept phase) | Provider |
| M-DELIVER | EV-DOC (design files in agreed formats) | Provider |
| M-ACCEPT | EV-SIGN | Customer |
| M-COMPLETE | EV-TS | System |

### 5. Milestones

| Seq | Code | Name | Responsible | Due rule | Blocking |
|-----|------|------|-------------|----------|----------|
| 1 | M-SCOPE | Design Brief Confirmed | Both | scheduled_start | Yes |
| 2 | M-WIP | Concept Phase Started | Provider | scheduled_start + 2d | Yes |
| 3 | M-DELIVER | Final Files Delivered | Provider | completion_deadline | Yes |
| 4 | M-ACCEPT | Customer Acceptance | Customer | completion_deadline + 7d | Yes |
| 5 | M-COMPLETE | Complete | System | Auto | Yes |

### 6. Acceptance Rules

- revision_rounds tracked in M-WIP notes; exceeding rounds = Issue Raised (not auto complaint).
- M-DELIVER files must match deliverables[] formats.
- IP allocation per CL-IP-001 binding at acceptance.
- Customer 7-day review window.

### 7. Trust Score Impact

| Component | Impact |
|-----------|--------|
| Execution Success (30%) | Deliverable spec match; revision count within agreed rounds |
| Time Commitment (20%) | M-DELIVER by deadline |
| Complaints (10%) | Risk factor 0.6 (level 1) |
| Customer Evaluation (10%) | EVAL-CREATIVE-v1: creative quality, brief adherence, file quality |

### 8. Complaint Triggers

| Trigger | Type | Dimension |
|---------|------|-----------|
| Files wrong format or missing variants | EFFORT_DEFICIENCY | E |
| Missed deadline | TIME_BREACH | T |
| IP terms violated (reuse without license) | RESPONSIBILITY_FAILURE | S |
| Plagiarized or unlicensed assets used | RISK_INCIDENT | R |
| Exceeded revision rounds without agreement | CONTRACT_INTEGRITY | — |

**Filing window:** 30 days.

---

## CT-E.3.1@v1 — Custom Software Development

### 1. Contract Template

| Field | Value |
|-------|-------|
| template_id | `CT-E.3.1@v1` |
| action_code | E.3.1 |
| action_name | Custom Software Development |
| domain | E — Creative & Intellectual Production |
| min_customer_tier | T1 |
| min_provider_tier | T1 |
| default_risk_level | 3 |
| tekrr_emphasis | K, E, S |
| clause_modules | CL-CORE-001, CL-CORE-002, CL-CORE-003, CL-TIME-001, CL-EFFORT-001, CL-KNOW-001, CL-IP-001, CL-DATA-001, CL-RESP-001 |
| contract_term_type | fixed |

### 2. Inputs

**Party inputs:** requirements document, tech stack preferences, repository access, data sensitivity, commercial terms note.

**TEKRR inputs:**

| Dimension | Field | Required | Party |
|-----------|-------|----------|-------|
| T | scheduled_start | Yes | Customer |
| T | completion_deadline | Yes | Customer |
| T | phase_dates[] (sprint milestones) | Yes | Both |
| E | deliverables[] (features, modules, documentation) | Yes | Both |
| E | location_type (remote) | Yes | Customer |
| K | standard_of_care (industry dev practices) | Yes | Provider |
| K | required_credentials[] | Optional | Provider |
| R | risk_level | Yes | Both |
| R | hazard_declarations[] (data, security) | If sensitive | Both |
| S | acceptance_criteria (per feature) | Yes | Customer |
| S | ip_allocation | Yes | Both |
| S | warranty_period (bug fix window) | Yes | Provider |

### 3. Outputs

Contract artifacts, phased milestones, code/repo delivery evidence, test results, documentation, trust events, EVAL-CREATIVE-v1.

### 4. Evidence Requirements

| Milestone | Required | Submitted by |
|-----------|----------|--------------|
| M-SCOPE | EV-SIGN, EV-DOC (requirements baseline) | Both |
| M-WIP (per phase) | EV-TS, EV-NOTE (sprint summary) | Provider |
| M-DELIVER | EV-DOC (release notes), repo/tag ref or EV-DOC (deployment proof) | Provider |
| M-VERIFY | EV-TEST (test results), EV-CHECK (acceptance criteria) | Provider |
| M-ACCEPT | EV-SIGN | Customer |
| M-COMPLETE | EV-TS | System |

### 5. Milestones

| Seq | Code | Name | Responsible | Due rule | Blocking |
|-----|------|------|-------------|----------|----------|
| 1 | M-SCOPE | Requirements Baseline | Both | scheduled_start | Yes |
| 2 | M-WIP | Development Phase(s) | Provider | phase_dates[] | Yes |
| 3 | M-DELIVER | Release Delivered | Provider | completion_deadline | Yes |
| 4 | M-VERIFY | QA Verified | Provider | M-DELIVER + 3d | Yes |
| 5 | M-ACCEPT | Customer Acceptance | Customer | M-VERIFY + 7d | Yes |
| 6 | M-COMPLETE | Complete | System | Auto | Yes |

### 6. Acceptance Rules

- Requirements baseline locked at M-SCOPE; changes = Issue Raised.
- M-VERIFY requires passing tests against acceptance_criteria.
- Security-sensitive projects: hazard_declarations mandatory.
- Bug fix warranty_period tracked for complaint window extension on EFFORT_DEFICIENCY.

### 7. Trust Score Impact

| Component | Impact |
|-----------|--------|
| Execution Success (30%) | Acceptance criteria pass rate; test coverage declared |
| Time Commitment (20%) | Phase dates + final deadline |
| Complaints (10%) | Risk factor 1.0; ×1.3 if data sensitivity |
| Customer Evaluation (10%) | EVAL-CREATIVE-v1: code quality, requirements fit, maintainability |

### 8. Complaint Triggers

| Trigger | Type | Dimension |
|---------|------|-----------|
| Feature missing from baseline | EFFORT_DEFICIENCY | E |
| Phase deadline missed | TIME_BREACH | T |
| Critical bug in warranty window | EFFORT_DEFICIENCY | E |
| Security vulnerability introduced | RISK_INCIDENT | R |
| IP ownership dispute | RESPONSIBILITY_FAILURE | S |
| Data handled outside CL-DATA-001 | RISK_INCIDENT | R |
| Scope changed without baseline update | CONTRACT_INTEGRITY | — |

**Filing window:** 30 days; warranty extension to warranty_period for bugs.
