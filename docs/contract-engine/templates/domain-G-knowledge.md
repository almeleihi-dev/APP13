# Contract Templates — Domain G: Knowledge Transfer

**Template:** CT-G.1.1@v1

---

## CT-G.1.1@v1 — One-to-One Tutoring

### 1. Contract Template

| Field | Value |
|-------|-------|
| template_id | `CT-G.1.1@v1` |
| action_code | G.1.1 |
| action_name | One-to-One Tutoring |
| domain | G — Knowledge Transfer |
| min_customer_tier | T1 |
| min_provider_tier | T1 |
| default_risk_level | 1 |
| tekrr_emphasis | K, T, S |
| clause_modules | CL-CORE-001, CL-CORE-002, CL-CORE-003, CL-TIME-001, CL-EFFORT-001, CL-KNOW-001, CL-RESP-001 |
| contract_term_type | period |

### 2. Inputs

**Party inputs:** subject/topic, learner level, session format (in-person/remote), materials responsibility, commercial terms note.

**TEKRR inputs:**

| Dimension | Field | Required | Party |
|-----------|-------|----------|-------|
| T | scheduled_start | Yes | Customer |
| T | session_duration | Yes | Both |
| T | period_end | Yes | Customer |
| T | session_schedule[] | Yes | Both |
| E | deliverables[] (topics per session, homework review, progress notes) | Yes | Both |
| E | location_type | Yes | Customer |
| K | required_credentials[] (subject expertise) | Yes | Provider |
| K | standard_of_care (appropriate instruction level) | Yes | Provider |
| R | risk_level | Yes | Both |
| R | hazard_declarations[] (minor learner safeguarding) | If learner under 18 | Both |
| S | acceptance_criteria (per session / period) | Yes | Customer |
| S | acceptance_party | Yes | Customer |
| S | compliance_notes (safeguarding if minor) | If applicable | Both |

### 3. Outputs

Contract artifacts, recurring session milestones, session logs, progress notes, optional assessment records, trust events, EVAL-KNOWLEDGE-v1.

### 4. Evidence Requirements

| Milestone | Required | Submitted by |
|-----------|----------|--------------|
| M-SCOPE | EV-SIGN (learning plan) | Both |
| M-WIP (per session) | EV-TS (start/end), EV-NOTE (session summary) | Provider |
| M-COMPLETE | EV-SIGN, EV-DOC (progress summary optional) | Customer |

### 5. Milestones

| Seq | Code | Name | Responsible | Due rule | Blocking |
|-----|------|------|-------------|----------|----------|
| 1 | M-SCOPE | Learning Plan Agreed | Both | scheduled_start | Yes |
| 2 | M-WIP | Session Delivered (recurring) | Provider | session_schedule | Yes |
| 3 | M-COMPLETE | Tutoring Period Complete | Customer | period_end + 48h | Yes |

### 6. Acceptance Rules

- Provider must declare subject expertise in K; validated against profile (T1 minimum).
- Minor learner: safeguarding note mandatory; provider T2 recommended (MVP: T1 + declaration).
- Session no-show by provider without 24h notice = TIME_BREACH.
- Session log EV-NOTE required within 24h of each session end.
- Period complete requires ≥85% scheduled sessions delivered.

### 7. Trust Score Impact

| Component | Impact |
|-----------|--------|
| Verification (30%) | Subject expertise declaration on profile |
| Execution Success (30%) | Session delivery rate + log completeness |
| Time Commitment (20%) | Session punctuality; schedule adherence |
| Complaints (10%) | Risk factor 0.6; ×2.0 if minor safeguarding declared |
| Customer Evaluation (10%) | EVAL-KNOWLEDGE-v1: clarity, progress, engagement |

### 8. Complaint Triggers

| Trigger | Type | Dimension |
|---------|------|-----------|
| Provider missed session without notice | TIME_BREACH | T |
| Session logs not provided | EFFORT_DEFICIENCY | E |
| Instruction materially below declared expertise | KNOWLEDGE_MISREP | K |
| Safeguarding concern (minor learner) | RISK_INCIDENT | R |
| Topics consistently off learning plan | EFFORT_DEFICIENCY | E |
| Instruction outside agreed subject | RESPONSIBILITY_FAILURE | S |

**Filing window:** 30 days from period_end.

---

## Chain summary — One-to-One Tutoring

```
Action (G.1.1) → Contract (CT-G.1.1@v1) → Execution (recurring sessions)
    → Trust (time + execution + evaluation) → Complaint (if triggered)
```
