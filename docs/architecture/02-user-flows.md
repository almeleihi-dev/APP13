# APP13 — User Flows v1

**Version:** 1.0  
**Status:** Draft  
**Scope:** Flows across Identity, Action, Contract, Complaint engines

---

## 1. Flow conventions

| Symbol | Meaning |
|--------|---------|
| `[Gate]` | Hard block — flow cannot proceed |
| `{Optional}` | May be skipped |
| `→ Engine` | Primary engine handling step |
| **MVP** | Included in MVP |
| **P2** | Phase 2 |

Each flow lists **actors**, **preconditions**, **steps**, **postconditions**, and **engine touchpoints**.

---

## 2. Flow index

| ID | Flow | Actors | MVP |
|----|------|--------|-----|
| UF-01 | Platform registration | All | Yes |
| UF-02 | Customer identity verification (T1) | Customer | Yes |
| UF-03 | Provider verification (T1 → T2) | Provider | Yes |
| UF-04 | Initiate engagement | Customer | Yes |
| UF-05 | Provider invitation & onboarding | Customer, Provider | Yes |
| UF-06 | TEKRR decomposition | Customer, Provider | Yes |
| UF-07 | Contract generation & acceptance | Customer, Provider | Yes |
| UF-08 | Execution & attestation | Customer, Provider | Yes |
| UF-09 | Contract completion | Customer, Provider | Yes |
| UF-10 | File complaint | Customer or Provider | Yes |
| UF-11 | Complaint resolution | Parties, Admin | Yes |
| UF-12 | View trust profile | Any authorized viewer | Yes |
| UF-13 | Contract amendment | Customer, Provider | Yes |
| UF-14 | Company provider lookup | Company | Stub |
| UF-15 | Institutional verification | Company, Gov, Insurance | P2 |

---

## 3. UF-01 — Platform registration

**Actors:** Any new user  
**Preconditions:** None  
**Postconditions:** Actor exists at T0; contact verified

```mermaid
flowchart TD
    A[Visit platform] --> B[Select actor type]
    B --> C{Customer or Provider?}
    C -->|Customer| D[Create customer actor]
    C -->|Provider| E[Create provider actor]
    D --> F[Verify email + phone]
    E --> F
    F --> G[T0 achieved]
    G --> H[Identity Engine: actor.registered]
```

| Step | Action | Engine |
|------|--------|--------|
| 1 | User selects actor type | Identity |
| 2 | User submits email, phone, password | Identity |
| 3 | System sends OTP / verification link | Identity → Notification |
| 4 | User confirms contact | Identity |
| 5 | Actor record created at T0 | Identity |

---

## 4. UF-02 — Customer identity verification (T1)

**Actors:** Customer  
**Preconditions:** T0, email/phone verified  
**Postconditions:** Customer at T1; may accept contracts

```mermaid
flowchart TD
    A[T0 Customer] --> B[Initiate T1 verification]
    B --> C[Submit gov ID]
    C --> D[Liveness check]
    D --> E{Automated pass?}
    E -->|Yes| F[T1 approved]
    E -->|Review| G[Manual queue]
    G --> F
    G --> H[Rejected — resubmit]
    F --> I[verification.approved event]
```

| Step | Action | Engine |
|------|--------|--------|
| 1 | Customer starts T1 flow | Identity |
| 2 | ID scan + liveness via KYC provider | Identity (external) |
| 3 | `[Gate]` Name match validation | Identity |
| 4 | T1 approved or rejected | Identity |
| 5 | `{Optional}` Verification fee charged | Billing |

**Gate:** Customer cannot accept contracts below T1.

---

## 5. UF-03 — Provider verification (T1 → T2)

**Actors:** Service Provider  
**Preconditions:** T0  
**Postconditions:** Provider at T1 minimum; T2 if credentials approved

```mermaid
flowchart TD
    A[T0 Provider] --> B[Complete T1 — same as UF-02]
    B --> C[T1 approved]
    C --> D[Submit trade credentials]
    D --> E[Upload cert/license docs]
    E --> F[Admin review queue]
    F --> G{Approved?}
    G -->|Yes| H[T2 approved]
    G -->|No| I[Rejected with reason]
    H --> J[Trust profile initialized]
```

| Step | Action | Engine |
|------|--------|--------|
| 1–4 | T1 flow (UF-02) | Identity |
| 5 | Provider declares trade category + credentials | Identity |
| 6 | Document upload | Identity → Storage |
| 7 | Admin reviews credential | Identity (Admin) |
| 8 | T2 approved → provider eligible for professional categories | Identity |

**Gate:** Category-specific contracts may require T2 (e.g., knowledge dimension credentials).

---

## 6. UF-04 — Initiate engagement

**Actors:** Customer (T1+)  
**Preconditions:** Customer ≥ T1  
**Postconditions:** Engagement created; TEKRR draft initialized

```mermaid
flowchart TD
    A[T1+ Customer] --> B[Create new engagement]
    B --> C[Select contract category]
    C --> D[Enter engagement title/description]
    D --> E[Engagement created]
    E --> F[Action: TEKRR draft initialized]
    E --> G[Contract: engagement.created]
```

| Step | Action | Engine |
|------|--------|--------|
| 1 | Customer selects "New engagement" | Contract |
| 2 | Customer picks category (e.g., home_maintenance) | Contract |
| 3 | System creates engagement record | Contract |
| 4 | System initializes TEKRR draft for category | Action |
| 5 | Customer proceeds to TEKRR input OR invites provider first | Action / Contract |

**Note:** No marketplace browse — customer invites known provider by email.

---

## 7. UF-05 — Provider invitation & onboarding

**Actors:** Customer, Provider (new or existing)  
**Preconditions:** Engagement in `draft`  
**Postconditions:** Provider linked to engagement

```mermaid
flowchart TD
    A[Customer on engagement] --> B[Enter provider email]
    B --> C{Provider exists?}
    C -->|No| D[Send invite link]
    D --> E[Provider registers UF-01/03]
    C -->|Yes| F[Send engagement invite]
    E --> F
    F --> G[Provider views engagement]
    G --> H[Provider linked to engagement]
```

| Step | Action | Engine |
|------|--------|--------|
| 1 | Customer enters provider email | Contract |
| 2 | `[Gate]` If new provider: must complete T1 before acceptance | Identity |
| 3 | Provider receives invitation | Notification |
| 4 | Provider opens engagement | Contract |
| 5 | Provider linked as `provider` party | Contract |

---

## 8. UF-06 — TEKRR decomposition

**Actors:** Customer, Provider  
**Preconditions:** Engagement with linked provider  
**Postconditions:** TEKRR profile `complete`

```mermaid
flowchart TD
    A[Engagement active] --> B[Customer completes TEKRR sections]
    B --> C[Provider completes provider sections]
    C --> D[Enter commercial terms]
    D --> E{All required fields valid?}
    E -->|No| B
    E -->|Yes| F[TEKRR status: complete]
    F --> G[tekrr.completed event]
    G --> H[Ready for contract generation]
```

| Step | Action | Engine |
|------|--------|--------|
| 1 | Customer fills Time, Effort, Responsibility inputs | Action |
| 2 | Customer declares Risk level + hazards | Action |
| 3 | Provider fills Knowledge credentials + confirmations | Action |
| 4 | Provider confirms/adjusts Effort deliverables | Action |
| 5 | Customer enters commercial terms (price, payment schedule) | Contract |
| 6 | `[Gate]` Action validates completeness per category schema | Action |
| 7 | TEKRR marked complete | Action → Contract |

### TEKRR input split (typical)

| Dimension | Primary input party |
|-----------|---------------------|
| Time | Customer |
| Effort | Customer + Provider |
| Knowledge | Provider |
| Risk | Customer + Provider |
| Responsibility | Customer + Provider |

---

## 9. UF-07 — Contract generation & acceptance

**Actors:** Customer, Provider  
**Preconditions:** TEKRR complete; parties meet tier requirements  
**Postconditions:** Contract `active`; obligations materialized

```mermaid
flowchart TD
    A[TEKRR complete] --> B[Generate contract]
    B --> C[Present PDF + summary to parties]
    C --> D[Customer reviews]
    D --> E{Customer accepts?}
    E -->|No| F[Decline — void or renegotiate]
    E -->|Yes| G[Provider reviews]
    G --> H{Provider accepts?}
    H -->|No| F
    H -->|Yes| I[Capture verification snapshots]
    I --> J[Contract ACTIVE]
    J --> K[Materialize obligations]
    J --> L[contract.activated event]
```

| Step | Action | Engine |
|------|--------|--------|
| 1 | Contract Engine loads template + TEKRR snapshot | Contract |
| 2 | `[Gate]` Identity tier check per party | Identity → Contract |
| 3 | Generate PDF + JSON + hash | Contract |
| 4 | Notify parties to review | Notification |
| 5 | Customer digital acceptance | Contract |
| 6 | Provider digital acceptance | Contract |
| 7 | Store verification snapshots | Contract + Identity |
| 8 | Transition to `active` | Contract |
| 9 | Materialize obligation graph | Action |
| 10 | Trigger contract lifecycle fee | Billing |

**Gate:** Both acceptances required. Either decline → contract `voided` or returns to TEKRR edit.

---

## 10. UF-08 — Execution & attestation

**Actors:** Provider (primary), Customer  
**Preconditions:** Contract `active`  
**Postconditions:** All obligations addressed; attestations recorded

```mermaid
flowchart TD
    A[Contract active] --> B[Provider starts execution]
    B --> C[execution.started]
    C --> D[Provider submits evidence per obligation]
    D --> E[Milestones + deliverables uploaded]
    E --> F[Provider marks ready for attestation]
    F --> G[Customer reviews per TEKRR dimension]
    G --> H{Agreement?}
    H -->|Yes| I[Record fulfilled attestation]
    H -->|Partial/Unfulfilled| J[Record disputed attestation]
    J --> K{File complaint?}
    K -->|Yes| UF-10
    K -->|No| L[Await provider response]
```

| Step | Action | Engine |
|------|--------|--------|
| 1 | `[Gate]` Contract status = active | Contract → Action |
| 2 | Provider opens execution | Action |
| 3 | Provider time check-in (if on-site) | Action |
| 4 | Provider uploads deliverables / checklists | Action → Storage |
| 5 | Provider submits completion | Action |
| 6 | Customer attests each dimension T/E/K/R/S | Action |
| 7 | Conflict → dimension `disputed` | Action |
| 8 | All dimensions resolved → ready for completion | Action → Contract |

---

## 11. UF-09 — Contract completion

**Actors:** System, Customer, Provider  
**Preconditions:** All dimensions attested or policy timeout  
**Postconditions:** Contract `completed`; scores updated

```mermaid
flowchart TD
    A[All dimensions attested] --> B[Contract completion request]
    B --> C[Contract status: completed]
    C --> D[contract.completed event]
    D --> E[Identity: recompute scores]
    E --> F[Complaint window opens 30 days]
```

| Step | Action | Engine |
|------|--------|--------|
| 1 | Action signals completion eligibility | Action → Contract |
| 2 | Contract transitions to `completed` | Contract |
| 3 | Emit completion event | Contract |
| 4 | Identity recomputes trust + execution scores | Identity |
| 5 | Start complaint filing window | Complaint |

**Auto-complete policy (MVP):** If customer silent 7 days after provider completion request, provider attestation stands with audit flag.

---

## 12. UF-10 — File complaint

**Actors:** Customer or Provider  
**Preconditions:** Contract completed or incident during execution; within filing window  
**Postconditions:** Complaint case open; dimension frozen

```mermaid
flowchart TD
    A[Party disputes outcome] --> B[File complaint]
    B --> C[Select contract + dimension + type]
    C --> D[Submit description + evidence]
    D --> E{Eligibility pass?}
    E -->|No| F[Rejected with reason]
    E -->|Yes| G[Complaint filed]
    G --> H[Freeze dimension in Action]
    G --> I[Notify all parties]
    G --> J[Admin triage queue]
```

| Step | Action | Engine |
|------|--------|--------|
| 1 | Party selects contract and TEKRR dimension(s) | Complaint |
| 2 | Party selects complaint type | Complaint |
| 3 | Party submits narrative + attachments | Complaint |
| 4 | `[Gate]` Validate window, party, dimension | Contract + Action → Complaint |
| 5 | Create case; freeze dimension | Complaint → Action |
| 6 | Auto-assemble evidence package | Complaint |
| 7 | Queue for triage | Complaint |

---

## 13. UF-11 — Complaint resolution

**Actors:** Parties, Admin  
**Preconditions:** Complaint filed and triaged valid  
**Postconditions:** Outcome applied; scores updated; contract finalized

```mermaid
flowchart TD
    A[Valid complaint] --> B[Triage complete]
    B --> C[Evidence period 5 days]
    C --> D[Mediation period 5 days]
    D --> E{Mutual agreement?}
    E -->|Yes| F[Record agreed outcome]
    E -->|No| G[Admin adjudication]
    G --> H[Upheld / Dismissed / Shared / External]
    F --> I[Apply to Action Engine]
    H --> I
    I --> J[complaint.resolved event]
    J --> K[Identity: update scores]
    J --> L[Contract: finalize if pending]
```

| Step | Action | Engine |
|------|--------|--------|
| 1 | Admin validates complaint (2 days) | Complaint |
| 2 | Both parties submit evidence (5 days) | Complaint |
| 3 | Mediation period (5 days) | Complaint |
| 4 | Admin adjudicates if no agreement | Complaint (Admin) |
| 5 | Apply outcome to execution record | Complaint → Action |
| 6 | Emit resolved event with severity | Complaint |
| 7 | Recompute trust score | Identity |
| 8 | Release dimension freeze | Action |

---

## 14. UF-12 — View trust profile

**Actors:** Customer, Company (stub), Provider (self)  
**Preconditions:** Provider has identity record  
**Postconditions:** None (read-only)

| Viewer | Visible data |
|--------|--------------|
| **Public / Customer** | Tier badge, trust score, execution score, dimension breakdown, contract count, complaint disposition summary (aggregated) |
| **Provider (self)** | Full breakdown + contributing events |
| **Company (P2)** | Extended history for due diligence |
| **Admin** | Full record including verification status detail |

**Engine:** Identity (all reads)

---

## 15. UF-13 — Contract amendment

**Actors:** Customer, Provider  
**Preconditions:** Contract `active`  
**Postconditions:** Amendment `active`; obligation graph updated

| Step | Action | Engine |
|------|--------|--------|
| 1 | Party requests amendment (TEKRR and/or commercial delta) | Contract |
| 2 | Action validates and versions TEKRR profile | Action |
| 3 | Contract generates amendment document | Contract |
| 4 | Both parties re-accept | Contract |
| 5 | Action updates obligation graph | Action |
| 6 | Emit `contract.amended` | Contract |

---

## 16. UF-14 — Company provider lookup (MVP stub)

**Actors:** Company (verified stub account)  
**Preconditions:** Company org registered (minimal)  
**Postconditions:** None

| Step | Action | Engine |
|------|--------|--------|
| 1 | Company user searches provider by ID or email | Identity |
| 2 | View public trust profile | Identity |
| 3 | `{P2}` Initiate company-mediated contract | Contract |

---

## 17. Cross-flow dependency map

```mermaid
flowchart LR
    UF01[UF-01 Register] --> UF02[UF-02/03 Verify]
    UF02 --> UF04[UF-04 Engage]
    UF04 --> UF05[UF-05 Invite]
    UF05 --> UF06[UF-06 TEKRR]
    UF06 --> UF07[UF-07 Contract]
    UF07 --> UF08[UF-08 Execute]
    UF08 --> UF09[UF-09 Complete]
    UF08 --> UF10[UF-10 Complain]
    UF09 --> UF10
    UF10 --> UF11[UF-11 Resolve]
    UF07 --> UF13[UF-13 Amend]
    UF02 --> UF12[UF-12 Trust Profile]
```

---

## 18. MVP flow coverage summary

| Engine | Flows |
|--------|-------|
| Identity | UF-01, UF-02, UF-03, UF-12 |
| Action | UF-06, UF-08 |
| Contract | UF-04, UF-05, UF-07, UF-09, UF-13 |
| Complaint | UF-10, UF-11 |

All MVP flows must be completable on responsive web without native apps.
