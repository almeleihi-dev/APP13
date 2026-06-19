# Contract Templates — Domain F: Operational & Coordination

**Template:** CT-F.1.2@v1

---

## CT-F.1.2@v1 — Event Coordination

### 1. Contract Template

| Field | Value |
|-------|-------|
| template_id | `CT-F.1.2@v1` |
| action_code | F.1.2 |
| action_name | Event Coordination |
| domain | F — Operational & Coordination |
| min_customer_tier | T1 |
| min_provider_tier | T1 |
| default_risk_level | 2 |
| tekrr_emphasis | T, E, S |
| clause_modules | CL-CORE-001, CL-CORE-002, CL-CORE-003, CL-TIME-001, CL-EFFORT-001, CL-RISK-001, CL-RESP-001 |
| contract_term_type | fixed |

### 2. Inputs

**Party inputs:** event type, date/time, venue/location, guest count estimate, vendor list (if known), commercial terms note.

**TEKRR inputs:**

| Dimension | Field | Required | Party |
|-----------|-------|----------|-------|
| T | scheduled_start (planning kickoff) | Yes | Customer |
| T | event_date | Yes | Customer |
| T | completion_deadline (post-event report) | Yes | Both |
| T | milestone_dates[] (planning checkpoints) | Yes | Both |
| E | deliverables[] (run sheet, vendor confirmations, day-of coordination, report) | Yes | Both |
| E | location_type (venue address) | Yes | Customer |
| E | excluded_scope (what coordinator does NOT do) | Yes | Both |
| K | standard_of_care (professional event coordination) | Yes | Provider |
| R | risk_level | Yes | Both |
| R | hazard_declarations[] (crowd size, outdoor, alcohol) | If applicable | Both |
| R | liability_allocation | Yes | Both |
| S | acceptance_criteria | Yes | Customer |
| S | acceptance_party | Yes | Customer |
| S | compliance_notes (permits if applicable) | Optional | Both |

### 3. Outputs

Contract artifacts, 6 milestones, run sheet, vendor confirmation log, post-event report, trust events, EVAL-OPERATIONAL-v1.

### 4. Evidence Requirements

| Milestone | Required | Submitted by |
|-----------|----------|--------------|
| M-SCOPE | EV-SIGN (event scope doc) | Both |
| M-WIP | EV-TS, EV-DOC (planning checkpoint updates) | Provider |
| M-DELIVER (pre-event) | EV-DOC (final run sheet), EV-CHECK (vendor confirmations) | Provider |
| M-WIP (event day) | EV-TS (day-of check-in/out) | Provider |
| M-DELIVER (post-event) | EV-DOC (post-event report) | Provider |
| M-ACCEPT | EV-SIGN | Customer |
| M-COMPLETE | EV-TS | System |

### 5. Milestones

| Seq | Code | Name | Responsible | Due rule | Blocking |
|-----|------|------|-------------|----------|----------|
| 1 | M-SCOPE | Event Scope Defined | Both | scheduled_start | Yes |
| 2 | M-WIP | Planning Underway | Provider | milestone_dates[0] | Yes |
| 3 | M-DELIVER | Pre-Event Package Ready | Provider | event_date - 7d | Yes |
| 4 | M-WIP | Day-of Coordination | Provider | event_date | Yes |
| 5 | M-DELIVER | Post-Event Report | Provider | completion_deadline | Yes |
| 6 | M-ACCEPT | Customer Acceptance | Customer | completion_deadline + 7d | Yes |
| 7 | M-COMPLETE | Complete | System | Auto | Yes |

### 6. Acceptance Rules

- Pre-event package due 7 days before event_date (blocking for day-of).
- Day-of M-WIP requires check-in EV-TS within 2h of event start.
- Vendor confirmations must match deliverables[] vendor count if specified.
- Customer acceptance after post-event report review (7 days).

### 7. Trust Score Impact

| Component | Impact |
|-----------|--------|
| Execution Success (30%) | All deliverables present; vendor confirmation rate |
| Time Commitment (20%) | Pre-event deadline; day-of punctuality; report deadline |
| Complaints (10%) | Risk factor 0.8; ×1.3 if crowd/alcohol hazards declared |
| Customer Evaluation (10%) | EVAL-OPERATIONAL-v1: organization, vendor management, day-of execution |

### 8. Complaint Triggers

| Trigger | Type | Dimension |
|---------|------|-----------|
| Pre-event package late (<7d before event) | TIME_BREACH | T |
| Missing vendor confirmations | EFFORT_DEFICIENCY | E |
| Coordinator no-show day-of | TIME_BREACH | T |
| Safety incident due to poor coordination | RISK_INCIDENT | R |
| Scope items dropped without notice | EFFORT_DEFICIENCY | E |
| Post-event report not delivered | EFFORT_DEFICIENCY | E |
| Coordinator exceeded excluded_scope | RESPONSIBILITY_FAILURE | S |

**Filing window:** 30 days post-completion.

---

## Chain summary — Event Coordination

```
Action (F.1.2) → Contract (CT-F.1.2@v1) → Execution (7 milestones)
    → Trust (execution + time + evaluation) → Complaint (if triggered)
```
