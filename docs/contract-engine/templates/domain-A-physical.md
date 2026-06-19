# Contract Templates — Domain A: Physical Execution

**Templates:** CT-A.2.1@v1 · CT-A.4.1@v1 · CT-A.4.2@v1

---

## CT-A.2.1@v1 — Surface Repair

### 1. Contract Template

| Field | Value |
|-------|-------|
| template_id | `CT-A.2.1@v1` |
| action_code | A.2.1 |
| action_name | Surface Repair |
| domain | A — Physical Execution |
| min_customer_tier | T1 |
| min_provider_tier | T1 |
| default_risk_level | 3 |
| tekrr_emphasis | E (primary), R, T |
| clause_modules | CL-CORE-001, CL-CORE-002, CL-CORE-003, CL-TIME-001, CL-EFFORT-001, CL-RISK-001, CL-RESP-001, CL-RESP-002 |
| contract_term_type | fixed |

### 2. Inputs

**Party inputs:** work location (address), surface description, damage photos (optional pre-work), commercial terms note.

**TEKRR inputs:**

| Dimension | Field | Required | Party |
|-----------|-------|----------|-------|
| T | scheduled_start | Yes | Customer |
| T | estimated_duration | Yes | Provider |
| T | completion_deadline | Yes | Customer |
| E | deliverables[] (repair items) | Yes | Customer |
| E | location_type (on-site) | Yes | Customer |
| E | materials_party | Yes | Both |
| E | excluded_scope | Optional | Both |
| K | standard_of_care (trade-appropriate finish) | Yes | Provider |
| R | risk_level | Yes | Both |
| R | hazard_declarations[] | If risk ≥ 3 | Both |
| R | liability_allocation | Yes | Both |
| S | acceptance_criteria | Yes | Customer |
| S | warranty_period | Yes | Provider |
| S | acceptance_party | Yes | Customer |

### 3. Outputs

| Output | When |
|--------|------|
| Contract PDF + JSON | Proposed |
| 5 milestones | Active |
| Repair completion evidence pack | M-VERIFY |
| Final attestation record | M-COMPLETE |
| Trust execution + time events | Completed |
| Customer evaluation record | Post-complete |

### 4. Evidence Requirements

| Milestone | Required | Submitted by |
|-----------|----------|--------------|
| M-ACCESS | EV-TS, EV-NOTE (access confirmation) | Provider |
| M-WIP | EV-TS, EV-PHOTO (before state) | Provider |
| M-VERIFY | EV-PHOTO (after state), EV-CHECK (repair checklist) | Provider |
| M-ACCEPT | EV-SIGN | Customer |
| M-COMPLETE | EV-TS (system) | System |

### 5. Milestones

| Seq | Code | Name | Responsible | Due rule | Blocking |
|-----|------|------|-------------|----------|----------|
| 1 | M-ACCESS | Site Access Confirmed | Provider | scheduled_start | Yes |
| 2 | M-WIP | Repair Started | Provider | scheduled_start + 1h | Yes |
| 3 | M-VERIFY | Repair Verified | Provider | completion_deadline | Yes |
| 4 | M-ACCEPT | Customer Acceptance | Customer | completion_deadline + 24h | Yes |
| 5 | M-COMPLETE | Action Complete | System | M-ACCEPT + auto | Yes |

### 6. Acceptance Rules

- Both parties accept at Proposed → Accepted (T1 / T1).
- M-VERIFY: Provider submits before/at deadline.
- M-ACCEPT: Customer must EV-SIGN or auto-accept after 7 days silence with audit flag.
- Completion: all blocking milestones attested.

### 7. Trust Score Impact

| Component | Impact |
|-----------|--------|
| Verification (30%) | Provider T1+ required; no per-contract delta |
| Execution Success (30%) | +1 unit per milestone completed; -2 if M-VERIFY rejected |
| Time Commitment (20%) | M-ACCESS on scheduled_start; M-VERIFY by deadline |
| Complaints (10%) | Normalized × risk factor 1.0 (level 3) |
| Customer Evaluation (10%) | EVAL-PHYSICAL-v1: quality, professionalism, scope accuracy |

### 8. Complaint Triggers

| Trigger | Type | Dimension |
|---------|------|-----------|
| M-VERIFY past deadline | TIME_BREACH | T |
| Customer rejects repair quality | EFFORT_DEFICIENCY | E |
| Damage beyond original scope disputed | EFFORT_DEFICIENCY | E |
| Injury or property damage during repair | RISK_INCIDENT | R |
| Warranty claim within period rejected | RESPONSIBILITY_FAILURE | S |
| Work started before Active | CONTRACT_INTEGRITY | — |

**Filing window:** 30 days post-completion.

---

## CT-A.4.1@v1 — Routine Maintenance

### 1. Contract Template

| Field | Value |
|-------|-------|
| template_id | `CT-A.4.1@v1` |
| action_code | A.4.1 |
| action_name | Routine Maintenance |
| domain | A — Physical Execution |
| min_customer_tier | T1 |
| min_provider_tier | T1 |
| default_risk_level | 2 |
| tekrr_emphasis | T, E |
| clause_modules | CL-CORE-001, CL-CORE-002, CL-CORE-003, CL-TIME-001, CL-EFFORT-001, CL-RESP-001 |
| contract_term_type | fixed |

### 2. Inputs

**Party inputs:** location, maintenance checklist or equipment list, recurrence note (single visit MVP), commercial terms note.

**TEKRR inputs:**

| Dimension | Field | Required | Party |
|-----------|-------|----------|-------|
| T | scheduled_start | Yes | Customer |
| T | estimated_duration | Yes | Provider |
| T | completion_deadline | Yes | Customer |
| E | deliverables[] (maintenance tasks) | Yes | Customer |
| E | location_type | Yes | Customer |
| E | materials_party | Yes | Both |
| K | standard_of_care | Optional | Provider |
| R | risk_level | Yes | Both |
| R | hazard_declarations[] | If risk ≥ 3 | Both |
| S | acceptance_criteria | Yes | Customer |
| S | acceptance_party | Yes | Customer |

### 3. Outputs

Contract artifacts, 4 milestones, maintenance checklist evidence, attestation, trust events, EVAL-PHYSICAL-v1.

### 4. Evidence Requirements

| Milestone | Required | Submitted by |
|-----------|----------|--------------|
| M-ACCESS | EV-TS | Provider |
| M-WIP | EV-TS, EV-CHECK (task checklist in progress) | Provider |
| M-VERIFY | EV-CHECK (completed checklist), EV-PHOTO (optional) | Provider |
| M-ACCEPT | EV-SIGN | Customer |
| M-COMPLETE | EV-TS | System |

### 5. Milestones

| Seq | Code | Name | Responsible | Due rule | Blocking |
|-----|------|------|-------------|----------|----------|
| 1 | M-ACCESS | Access Confirmed | Provider | scheduled_start | Yes |
| 2 | M-WIP | Maintenance Underway | Provider | scheduled_start + 30m | Yes |
| 3 | M-VERIFY | Maintenance Complete | Provider | completion_deadline | Yes |
| 4 | M-ACCEPT | Customer Acceptance | Customer | completion_deadline + 24h | Yes |
| 5 | M-COMPLETE | Action Complete | System | Auto | Yes |

### 6. Acceptance Rules

- Tier gates: T1 / T1.
- M-VERIFY requires completed checklist matching deliverables[].
- Customer acceptance within 7 days or auto-accept with flag.

### 7. Trust Score Impact

| Component | Impact |
|-----------|--------|
| Execution Success (30%) | Checklist item match rate weights milestone score |
| Time Commitment (20%) | On-time M-VERIFY primary signal |
| Complaints (10%) | Risk factor 0.8 (level 2) |
| Customer Evaluation (10%) | EVAL-PHYSICAL-v1: thoroughness, punctuality |

### 8. Complaint Triggers

| Trigger | Type | Dimension |
|---------|------|-----------|
| Missed scheduled start | TIME_BREACH | T |
| Checklist items incomplete | EFFORT_DEFICIENCY | E |
| Equipment damage during maintenance | RISK_INCIDENT | R |
| Customer denied access but provider marked complete | CONTRACT_INTEGRITY | — |

**Filing window:** 30 days.

---

## CT-A.4.2@v1 — Cleaning & Sanitization

### 1. Contract Template

| Field | Value |
|-------|-------|
| template_id | `CT-A.4.2@v1` |
| action_code | A.4.2 |
| action_name | Cleaning & Sanitization |
| domain | A — Physical Execution |
| min_customer_tier | T1 |
| min_provider_tier | T1 |
| default_risk_level | 2 |
| tekrr_emphasis | E, T |
| clause_modules | CL-CORE-001, CL-CORE-002, CL-CORE-003, CL-TIME-001, CL-EFFORT-001, CL-RISK-001, CL-RESP-001 |
| contract_term_type | fixed |

### 2. Inputs

**Party inputs:** location, room/area list, cleaning standard (regular/deep/sanitize), supply responsibility, commercial terms note.

**TEKRR inputs:**

| Dimension | Field | Required | Party |
|-----------|-------|----------|-------|
| T | scheduled_start | Yes | Customer |
| T | estimated_duration | Yes | Provider |
| T | completion_deadline | Yes | Customer |
| E | deliverables[] (areas + standard per area) | Yes | Customer |
| E | location_type | Yes | Customer |
| E | materials_party (cleaning supplies) | Yes | Both |
| E | excluded_scope | Optional | Customer |
| R | risk_level | Yes | Both |
| R | hazard_declarations[] (biohazard, chemicals) | If applicable | Both |
| S | acceptance_criteria | Yes | Customer |
| S | acceptance_party | Yes | Customer |

### 3. Outputs

Contract artifacts, 5 milestones, area checklist evidence, optional photos, trust events, EVAL-PHYSICAL-v1.

### 4. Evidence Requirements

| Milestone | Required | Submitted by |
|-----------|----------|--------------|
| M-ACCESS | EV-TS | Provider |
| M-WIP | EV-TS | Provider |
| M-VERIFY | EV-CHECK (area checklist), EV-PHOTO (if sanitize/deep) | Provider |
| M-ACCEPT | EV-SIGN | Customer |
| M-COMPLETE | EV-TS | System |

### 5. Milestones

| Seq | Code | Name | Responsible | Due rule | Blocking |
|-----|------|------|-------------|----------|----------|
| 1 | M-ACCESS | Property Access | Provider | scheduled_start | Yes |
| 2 | M-WIP | Cleaning Started | Provider | scheduled_start + 15m | Yes |
| 3 | M-VERIFY | Cleaning Verified | Provider | completion_deadline | Yes |
| 4 | M-ACCEPT | Customer Sign-off | Customer | completion_deadline + 24h | Yes |
| 5 | M-COMPLETE | Complete | System | Auto | Yes |

### 6. Acceptance Rules

- Deep/sanitize standard requires photo evidence at M-VERIFY.
- All deliverable areas must appear on checklist.
- Customer 7-day auto-accept policy applies.

### 7. Trust Score Impact

| Component | Impact |
|-----------|--------|
| Execution Success (30%) | Area checklist 100% = full milestone credit |
| Time Commitment (20%) | Duration within estimated_duration ±20% |
| Complaints (10%) | Risk factor 0.8; ×1.5 if biohazard declared |
| Customer Evaluation (10%) | EVAL-PHYSICAL-v1: cleanliness standard met |

### 8. Complaint Triggers

| Trigger | Type | Dimension |
|---------|------|-----------|
| Areas skipped vs deliverables[] | EFFORT_DEFICIENCY | E |
| Late completion | TIME_BREACH | T |
| Chemical exposure incident | RISK_INCIDENT | R |
| Sanitize standard claimed but not evidenced | KNOWLEDGE_MISREP | K |
| Theft or property damage allegation | RISK_INCIDENT | R |

**Filing window:** 30 days.
