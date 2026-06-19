# Contract Templates — Domain H: Inspection & Assurance

**Template:** CT-H.1.1@v1

---

## CT-H.1.1@v1 — Property Condition Assessment

### 1. Contract Template

| Field | Value |
|-------|-------|
| template_id | `CT-H.1.1@v1` |
| action_code | H.1.1 |
| action_name | Property Condition Assessment |
| domain | H — Inspection & Assurance |
| min_customer_tier | T1 |
| min_provider_tier | T2 |
| default_risk_level | 3 |
| tekrr_emphasis | K, S, R |
| clause_modules | CL-CORE-001, CL-CORE-002, CL-CORE-003, CL-TIME-001, CL-KNOW-001, CL-RISK-001, CL-RESP-001 |
| contract_term_type | fixed |

### 2. Inputs

**Party inputs:** property address, property type, assessment purpose (purchase/rent/insurance/general), access arrangements, commercial terms note.

**TEKRR inputs:**

| Dimension | Field | Required | Party |
|-----------|-------|----------|-------|
| T | scheduled_start (inspection date) | Yes | Customer |
| T | estimated_duration | Yes | Provider |
| T | completion_deadline (report delivery) | Yes | Customer |
| E | deliverables[] (inspection report, photo documentation, severity ratings) | Yes | Both |
| E | location_type (on-site) | Yes | Customer |
| K | required_credentials[] (inspector cert, engineering license if structural) | Yes | Provider |
| K | standard_of_care (inspection standard reference) | Yes | Provider |
| R | risk_level | Yes | Both |
| R | hazard_declarations[] (structural, environmental, access) | Yes | Both |
| R | liability_allocation (assessment not guarantee) | Yes | Both |
| S | acceptance_criteria | Yes | Customer |
| S | acceptance_party | Yes | Customer |
| S | compliance_notes (scope limits of assessment) | Yes | Both |

### 3. Outputs

Contract artifacts, 5 milestones, inspection report, photo evidence set, credential verification, scope limitation attestation, trust events, EVAL-INSPECTION-v1.

### 4. Evidence Requirements

| Milestone | Required | Submitted by |
|-----------|----------|--------------|
| M-ACCESS | EV-TS, EV-NOTE (property access confirmed) | Provider |
| M-WIP | EV-TS, EV-PHOTO (inspection in progress) | Provider |
| M-DELIVER | EV-DOC (inspection report), EV-PHOTO (documented areas) | Provider |
| M-VERIFY | EV-CRED (credential at inspection time), EV-CHECK (report completeness checklist) | Provider |
| M-ACCEPT | EV-SIGN | Customer |
| M-COMPLETE | EV-TS | System |

### 5. Milestones

| Seq | Code | Name | Responsible | Due rule | Blocking |
|-----|------|------|-------------|----------|----------|
| 1 | M-ACCESS | Property Access Confirmed | Provider | scheduled_start | Yes |
| 2 | M-WIP | Inspection Underway | Provider | scheduled_start + 1h | Yes |
| 3 | M-DELIVER | Report Delivered | Provider | completion_deadline | Yes |
| 4 | M-VERIFY | Report Verified Complete | Provider | M-DELIVER + 24h | Yes |
| 5 | M-ACCEPT | Customer Acceptance | Customer | completion_deadline + 7d | Yes |
| 6 | M-COMPLETE | Complete | System | Auto | Yes |

### 6. Acceptance Rules

- Provider T2 + inspector credential required.
- Report must cover all areas declared in deliverables[] / scope.
- M-VERIFY checklist: all standard sections present (roof, structure, systems, etc. as scoped).
- Assessment scope limits (not structural engineer unless credentialed) in S.compliance_notes.
- Customer 7-day review for report acceptance.

### 7. Trust Score Impact

| Component | Impact |
|-----------|--------|
| Verification (30%) | T2 + inspector credential match |
| Execution Success (30%) | Report checklist completeness; photo coverage of flagged items |
| Time Commitment (20%) | Inspection on scheduled_start; report by completion_deadline |
| Complaints (10%) | Risk factor 1.0 (level 3) |
| Customer Evaluation (10%) | EVAL-INSPECTION-v1: thoroughness, clarity, professionalism |

### 8. Complaint Triggers

| Trigger | Type | Dimension |
|---------|------|-----------|
| Report delivered late | TIME_BREACH | T |
| Known defect not documented | EFFORT_DEFICIENCY | E |
| Inspector lacked required credential | KNOWLEDGE_MISREP | K |
| Structural opinion without license | KNOWLEDGE_MISREP | K |
| Injury during inspection | RISK_INCIDENT | R |
| Report misstates scope of assessment | RESPONSIBILITY_FAILURE | S |
| Inspection performed without access confirmation | CONTRACT_INTEGRITY | — |

**Filing window:** 30 days post-completion.

---

## Chain summary — Property Condition Assessment

```
Action (H.1.1) → Contract (CT-H.1.1@v1) → Execution (inspect + report)
    → Trust (verification + execution + time + evaluation) → Complaint (if triggered)
```

---

## Inspection domain notes

- Output is **assessment conclusion**, not physical repair — disputes typically KNOWLEDGE_MISREP or EFFORT_DEFICIENCY (incomplete report).
- Provider must not perform repair on same property under separate contract within 30 days without disclosure (CONTRACT_INTEGRITY flag — Phase 1.1).
