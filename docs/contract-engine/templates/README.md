# MVP Contract Templates — Index

**Version:** 1.0  
**Total templates:** 15  
**Format:** 8 sections per [Universal Schema](./00-universal-schema.md)

---

## Action → Contract → Execution → Trust → Complaint

Each template is a complete specification for one action type. When a user initiates an Action, Contract Engine loads the matching template and executes the full chain.

---

## Template registry

| Template ID | Action | Domain | Risk | Min Tier | File |
|-------------|--------|--------|------|----------|------|
| `CT-A.2.1@v1` | Surface Repair | Physical | 3 | T1 | [domain-A-physical.md](./domain-A-physical.md) |
| `CT-A.4.1@v1` | Routine Maintenance | Physical | 2 | T1 | [domain-A-physical.md](./domain-A-physical.md) |
| `CT-A.4.2@v1` | Cleaning & Sanitization | Physical | 2 | T1 | [domain-A-physical.md](./domain-A-physical.md) |
| `CT-B.1.2@v1` | Plumbing Service | Technical | 4 | T2 | [domain-B-technical.md](./domain-B-technical.md) |
| `CT-B.2.1@v1` | Electrical Installation | Technical | 5 | T2 | [domain-B-technical.md](./domain-B-technical.md) |
| `CT-B.3.3@v1` | Technical Troubleshooting | Technical | 3 | T1 | [domain-B-technical.md](./domain-B-technical.md) |
| `CT-C.1.1@v1` | Strategy Consulting | Advisory | 2 | T1 | [domain-C-advisory.md](./domain-C-advisory.md) |
| `CT-C.1.2@v1` | Operations Advisory | Advisory | 2 | T1 | [domain-C-advisory.md](./domain-C-advisory.md) |
| `CT-D.1.1@v1` | Personal Care Assistance | Care | 4 | T2 | [domain-D-care.md](./domain-D-care.md) |
| `CT-D.3.1@v1` | Household Management Aid | Care | 2 | T1 | [domain-D-care.md](./domain-D-care.md) |
| `CT-E.1.1@v1` | Graphic Design | Creative | 1 | T1 | [domain-E-creative.md](./domain-E-creative.md) |
| `CT-E.3.1@v1` | Custom Software Development | Creative | 3 | T1 | [domain-E-creative.md](./domain-E-creative.md) |
| `CT-F.1.2@v1` | Event Coordination | Operational | 2 | T1 | [domain-F-operational.md](./domain-F-operational.md) |
| `CT-G.1.1@v1` | One-to-One Tutoring | Knowledge | 1 | T1 | [domain-G-knowledge.md](./domain-G-knowledge.md) |
| `CT-H.1.1@v1` | Property Condition Assessment | Inspection | 3 | T2 | [domain-H-inspection.md](./domain-H-inspection.md) |

---

## Quick reference — milestone patterns

| Pattern | Actions |
|---------|---------|
| ACCESS → WIP → VERIFY → ACCEPT → COMPLETE | A.2.1, A.4.1, A.4.2, B.1.2, B.2.1 |
| SCOPE → WIP → DELIVER → ACCEPT → COMPLETE | B.3.3, C.1.1, C.1.2, E.1.1, E.3.1, F.1.2 |
| SCOPE → WIP (recurring) → COMPLETE | D.1.1, D.3.1, G.1.1 |
| ACCESS → WIP → DELIVER → COMPLETE | H.1.1 |

---

## Quick reference — evaluation forms

| Form ID | Actions |
|---------|---------|
| `EVAL-PHYSICAL-v1` | A.* |
| `EVAL-TECHNICAL-v1` | B.* |
| `EVAL-ADVISORY-v1` | C.* |
| `EVAL-CARE-v1` | D.* |
| `EVAL-CREATIVE-v1` | E.* |
| `EVAL-OPERATIONAL-v1` | F.* |
| `EVAL-KNOWLEDGE-v1` | G.* |
| `EVAL-INSPECTION-v1` | H.* |

---

## Master spec

[Contract Engine v1](../CONTRACT-ENGINE-v1.md)
