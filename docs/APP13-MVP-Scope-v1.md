# APP13 MVP Scope v1

**Version:** 1.0  
**Status:** Strict scope boundary — Pre-implementation  
**Last updated:** June 19, 2026  
**Authority:** Subordinate to [Core Principles v1](./APP13-Core-Principles-v1.md); operational parameters from [Approval Addendum v1.1](./architecture/APPROVAL-ADDENDUM-v1.1.md)

---

## Document purpose

This document defines **exactly** what is in and out of APP13 MVP v1. It is a **scope boundary**, not a technical specification.

**Explicitly excluded from this document:**
- Application code
- UI screens or wireframes
- Database schema or entity design
- API contracts
- Infrastructure decisions

**Purpose:** Prevent scope creep. Any capability not listed in **Included** is **Excluded** unless this document is formally amended.

---

## MVP definition

**APP13 MVP v1 proves one accountable chain:**

```
Register → Verify → Create Action → Generate Contract → Execute Milestones
  → Upload Evidence → Compute Trust Score → Resolve Complaint (if triggered)
```

**MVP validates:** APP13 works as a Professional Operating System for individual Customers and Service Providers completing professional Actions under generated Contracts with evidence-backed execution and trust consequences.

**MVP does not validate:** Marketplace liquidity, payment processing, institutional integrations, mobile reach, or AI-assisted automation.

---

## Scope decision record

| Decision | MVP value |
|----------|-----------|
| Platform type | Professional Operating System |
| Primary actors | Customer, Service Provider, Platform Admin |
| Secondary actors | Organization (minimal read context only) |
| Geography | Single jurisdiction pack |
| Language | English only |
| Action types active | 15 (per Action Taxonomy v1) |
| Contract parties | Two-party (Customer + Provider) |
| Contract states | Draft → Proposed → Accepted → Active → Completed (+ Issue path) |
| Complaint SLA | 15 business days median |
| Access surface | Responsive web only |

---

## Section 1 — INCLUDED in MVP

Each included capability defines **what MVP delivers**, **boundaries within the capability**, and **what "done" means** for MVP acceptance.

---

### 1.1 Registration

**In scope:**

| Capability | MVP boundary |
|------------|--------------|
| Customer registration | Email, phone, password; actor type = Customer |
| Provider registration | Email, phone, password; actor type = Service Provider |
| Contact verification | Email OTP and/or verification link; phone OTP |
| Login / logout | Session-based authentication |
| Password reset | Email-initiated reset flow |
| Account status | Active, suspended (admin), deactivated |

**Within boundary:**
- One user account = one actor type at registration (Customer or Provider)
- Same person may hold separate accounts or future dual-role (MVP: single role per account acceptable)
- Organization affiliation: optional field only; no org workflows

**Done when:** Customer and Provider can register, verify contact, log in, and reset password without admin intervention.

---

### 1.2 Identity verification

**In scope:**

| Capability | MVP boundary |
|------------|--------------|
| Customer verification | Tier T1: government ID + liveness (third-party KYC provider) |
| Provider verification | Tier T1 (identity) + Tier T2 (credential upload + manual admin review) |
| Verification states | not_started, pending, approved, rejected, expired |
| Tier gating | Customer ≥ T1 to accept contracts; Provider ≥ action minimum tier |
| Verification queue | Admin review for T2 credential submissions |
| Verification snapshot | Stored at contract activation |

**Within boundary:**
- T0: contact verified only — may draft Actions; cannot activate contracts
- T1: identity verified — may accept contracts
- T2: professional credential verified — required for high-credential action types (e.g., B.1.2, B.2.1, H.1.1, D.1.1)
- T3, T4: defined in framework; **not operational in MVP** (manual admin notes only if needed)

**Done when:** Customer reaches T1 and Provider reaches required tier for chosen action type; unverified users blocked at contract acceptance.

---

### 1.3 Professional profile

**In scope:**

| Capability | MVP boundary |
|------------|--------------|
| Customer profile | Display name, contact (private), verification badge |
| Provider professional profile | Display name, business name (optional), bio, primary trade, verification tier badge |
| Trust profile (provider) | Public summary: trust score, execution signals, contract count, complaint disposition (aggregated) |
| Profile visibility | Customer: private except to contract parties; Provider: public trust summary |
| Credential display | Credential type and status (not document contents) on provider profile |

**Within boundary:**
- Trust profile is **read-only** to provider — scores computed by platform
- No profile SEO, no public slug URLs, no discover/browse by profile (MVP)
- Organization profile: name field on user only; no org admin, no org verification

**Done when:** Provider has a visible professional profile with trust summary; Customer has a basic profile; verification tier visible to contract parties.

---

### 1.4 Action creation

**In scope:**

| Capability | MVP boundary |
|------------|--------------|
| Action initiation | Customer selects from 15 MVP action types |
| TEKRR decomposition | Full T/E/K/R/S input per action template |
| Provider invitation | Email invite link to specific provider (no marketplace search) |
| Action states | draft, tekrr_in_progress, ready_for_contract |
| Action–Contract link | One Action → one Contract (1:1) |
| TEKRR validation | Completeness gate before contract generation |

**Within boundary:**
- 15 action types only (Action Taxonomy v1 MVP subset)
- Customer initiates; Provider supplements TEKRR provider-side fields
- No composite/multi-action engagements
- No AI-assisted action classification
- No action templates beyond the 15 contract templates

**Done when:** Customer completes TEKRR for a selected action type, invites provider, and Action reaches ready_for_contract without admin help.

---

### 1.5 Contract generation

**In scope:**

| Capability | MVP boundary |
|------------|--------------|
| Template binding | CT-{action_code}@v1 for all 15 action types |
| Contract document | Structured record + rendered PDF + content hash |
| Contract lifecycle | Draft → Proposed → Accepted → Active → Completed |
| Party acceptance | Digital acceptance by Customer and Provider |
| TEKRR snapshot | Immutable at Active |
| Commercial terms note | Declarative text field (price, payment arrangement described — not processed) |
| Contract void | Decline or expire before Active |

**Within boundary:**
- Two-party contracts only
- Single jurisdiction template pack
- No amendments (cancel + recreate acceptable MVP workaround)
- No institutional clause overlays
- No e-signature third-party beyond platform acceptance record

**Done when:** Contract generates from Action, both parties accept, contract activates with stored snapshot and PDF.

---

### 1.6 Milestones

**In scope:**

| Capability | MVP boundary |
|------------|--------------|
| Milestone materialization | Auto-created from contract template at Active |
| Milestone tracking | Status: pending, in_progress, submitted, accepted, disputed, frozen |
| Milestone sequence | Per action template (4–7 milestones typical; recurring for D, G) |
| Due dates | Computed from TEKRR Time fields |
| Milestone attestation | Customer sign-off where template requires M-ACCEPT |
| Issue flagging | Milestone or dimension flagged → Issue Raised state |

**Within boundary:**
- Milestone archetypes: M-ACCESS, M-SCOPE, M-WIP, M-DELIVER, M-VERIFY, M-ACCEPT, M-COMPLETE
- Recurring milestones for session-based actions (D.1.1, D.3.1, G.1.1)
- No manual milestone creation by users
- No Gantt charts or external project management integrations

**Done when:** Active contract shows milestone list; provider progresses milestones; customer attests where required; completion triggers when all blocking milestones satisfied.

---

### 1.7 Evidence upload

**In scope:**

| Capability | MVP boundary |
|------------|--------------|
| Evidence types | EV-TS, EV-PHOTO, EV-DOC, EV-CHECK, EV-TEST, EV-SIGN, EV-CRED, EV-NOTE |
| Upload | File upload (photo, PDF) and structured forms (checklist, timestamp, sign-off) |
| Binding | Every evidence item linked to contract_id + milestone_id |
| Validation | Required evidence types enforced per template before milestone submission |
| Storage | Platform object storage (implementation deferred; capability in scope) |
| Complaint evidence | Party uploads + auto-attached contract record |

**Within boundary:**
- No video upload MVP (defer)
- No live camera-only capture requirement (file upload sufficient)
- No blockchain anchoring
- No third-party notarization
- Evidence visible to contract parties and assigned admin

**Done when:** Provider uploads required evidence per milestone; system blocks milestone completion until requirements met; evidence visible on contract record.

---

### 1.8 Trust score

**In scope:**

| Capability | MVP boundary |
|------------|--------------|
| Trust score (provider) | Composite 0–1000; version trust_score_v1 |
| Components | Verification 30%, Execution Success 30%, Time Commitment 20%, Complaints 10%, Customer Evaluation 10% |
| Score computation | Event-driven on contract completion, complaint resolution, evaluation submission |
| Public trust summary | Aggregated provider profile view |
| Provider self-view | Score breakdown by component (not algorithm edit) |
| Confidence band | Low until minimum contract sample |
| Score events | Immutable inputs logged for recomputation |

**Within boundary:**
- Customers do not have public trust scores MVP
- No trust score API for third parties
- No manual score override (appeal = event correction only)
- No trust score export/certification
- Customer Evaluation: structured form post-completion (EVAL-{domain}-v1); not star ratings

**Done when:** Provider trust score updates within 24h of contract completion and complaint resolution; breakdown visible to provider; public summary visible to customers pre-contract.

---

### 1.9 Complaint workflow

**In scope:**

| Capability | MVP boundary |
|------------|--------------|
| Filing | Contract party files complaint linked to contract + TEKRR dimension(s) |
| Complaint types | TIME_BREACH, EFFORT_DEFICIENCY, KNOWLEDGE_MISREP, RISK_INCIDENT, RESPONSIBILITY_FAILURE, CONTRACT_INTEGRITY |
| Lifecycle | filed → triage → evidence_gathering → mediation → adjudication → closed |
| Contract path | Active → Issue Raised → Disputed → Resolved → Closed |
| Admin adjudication | Manual review and decision |
| Evidence package | Auto-assembled from contract, milestones, evidence |
| Outcome application | Updates dimension fulfillment and trust score |
| SLA | 15 business days median resolution target |
| Filing window | 30 days post-completion (configurable per template warranty) |

**Within boundary:**
- No automated mediation recommendations
- No external escalation automation (insurance, government)
- No legal referral workflow beyond admin note
- No complaint filing without contract_id
- One active complaint per dimension per contract

**Done when:** Party files complaint on completed (or active) contract; admin adjudicates; outcome reflected in trust score and contract record; SLA trackable on admin queue.

---

## Section 2 — Platform admin (included subset)

Admin capabilities required to operate MVP — included but not a separate product surface:

| Capability | In MVP |
|------------|--------|
| Verification review queue (T2) | Yes |
| Complaint adjudication queue | Yes |
| User suspend / reinstate | Yes |
| Contract lookup (support) | Yes |
| Basic platform metrics (counts) | Yes |
| Template/content management | Read-only; changes via deployment |
| Feature flags | No |
| Bulk exports | No |

---

## Section 3 — Notifications (included subset)

| Channel | In MVP |
|---------|--------|
| Email (transactional) | Yes |
| In-app notification list | Yes (minimal) |
| SMS | No |
| Push notifications | No |

**Triggers:** registration, verification result, contract proposed/accepted/active, milestone reminders, complaint status, trust score significant change.

---

## Section 4 — EXCLUDED from MVP

Everything in this section is **out of scope for MVP v1**. Presence in architecture docs or future roadmap does not imply MVP delivery.

---

### 4.1 Payments — EXCLUDED

| Excluded capability | Notes |
|---------------------|-------|
| Payment processing | No Stripe, no card capture, no invoicing engine |
| Platform billing | No contract fees charged in MVP (may defer to post-MVP) |
| Payment milestones | No pay-on-deliverable gates |
| Pricing enforcement | Commercial terms are declarative text only |
| Refund processing | Complaint outcomes are trust/record only; no money movement |
| Revenue reporting | No GMV, no financial dashboard |

**MVP stance:** Parties handle payment off-platform. Contract may describe payment arrangement; platform does not execute it.

---

### 4.2 Escrow — EXCLUDED

| Excluded capability | Notes |
|---------------------|-------|
| Escrow accounts | No hold/release of funds |
| Milestone-triggered disbursement | No |
| Dispute-triggered refund | No |
| Escrow provider integration | No |

---

### 4.3 Insurance — EXCLUDED

| Excluded capability | Notes |
|---------------------|-------|
| Insurance Entity actor | Not operational |
| Coverage attestation API | No |
| Insurance riders in contracts | No automated injection |
| Risk-dimension insurance triggers | Risk declared in TEKRR; no coverage verification |
| Claim event integration | No |
| Insurance partner portal | No |

**MVP stance:** Risk (R) dimension captured in TEKRR; self-declared insurance note optional; no insurer involvement.

---

### 4.4 Government integrations — EXCLUDED

| Excluded capability | Notes |
|---------------------|-------|
| Government Entity actor | Not operational (admin manual proxy only if legally required) |
| License registry API sync | No; T2 credentials via upload + manual review |
| Regulatory clause injection | No |
| Authorized record query portal | No |
| Sanctions/exclusion list sync | No |
| Permit verification API | No; permit as document upload only if template requires |

---

### 4.5 Banking integrations — EXCLUDED

| Excluded capability | Notes |
|---------------------|-------|
| Bank account linking | No |
| ACH / wire / open banking | No |
| Payout to provider | No |
| KYC beyond identity provider | No beneficial ownership / KYB |
| Financial institution partnerships | No |

---

### 4.6 AI automation — EXCLUDED

| Excluded capability | Notes |
|---------------------|-------|
| AI action classification | Manual action type selection only |
| AI contract generation | Template rules only; no LLM clause drafting |
| AI complaint adjudication | Admin manual only |
| AI mediation recommendations | No |
| AI trust scoring | Formula-based only (trust_score_v1) |
| AI evidence analysis | No automated photo/document validation |
| Chatbot / copilot | No |
| NLP provider matching | No |

---

### 4.7 Mobile applications — EXCLUDED

| Excluded capability | Notes |
|---------------------|-------|
| Native iOS app | No |
| Native Android app | No |
| Mobile SDK | No |
| App store distribution | No |
| Push notifications | No |
| Offline mode | No |

**MVP stance:** Responsive web accessible on mobile browsers is sufficient.

---

## Section 5 — Additional exclusions (explicit)

Capabilities commonly assumed but **not in MVP**:

| Category | Excluded items |
|----------|----------------|
| **Discovery** | Marketplace browse, search rankings, provider listings, categories page, SEO profiles |
| **Matching** | Lead generation, provider recommendations, "find a pro" |
| **Communication** | In-app real-time chat, video calls |
| **Institutional** | Company-mediated contracts, org admin, bulk verification, API access |
| **Contracts** | Amendments, multi-party, e-notary, blockchain timestamp |
| **Actions** | Multi-action engagements, action variants (L4 taxonomy) |
| **Trust** | Trust score API, certified exports, third-party attestations |
| **Complaints** | External escalation automation, expedited paid track |
| **Platform** | Multi-language, multi-jurisdiction, white-label, franchise |
| **Integrations** | Calendar sync, CRM, accounting, Zapier, webhooks |
| **Verification** | T3 KYB, T4 regulated tier automation |
| **Analytics** | Advanced dashboards, ML fraud detection, predictive scoring |

---

## Section 6 — MVP actor matrix

| Actor | MVP role | Limitations |
|-------|----------|-------------|
| **Customer** | Full: register, verify, create action, accept contract, attest, evaluate, complain | Cannot browse providers |
| **Service Provider** | Full: register, verify, accept contract, execute, evidence, respond to complaints | Cannot receive marketplace leads |
| **Platform Admin** | Verification, complaints, user support, basic metrics | No financial ops |
| **Organization** | Name on profile only | No org workflows |
| **Government Entity** | Not in MVP | — |
| **Insurance Entity** | Not in MVP | — |
| **Company (institutional)** | Not in MVP | — |

---

## Section 7 — MVP entity boundary

Entities that **exist conceptually** in MVP (implementation deferred):

| Entity | In MVP | Notes |
|--------|--------|-------|
| User | Yes | Customer and Provider |
| Organization | Minimal | Optional label; no org entity workflows |
| Action | Yes | 15 types |
| Contract | Yes | Full lifecycle |
| Contract Milestone | Yes | Template-driven |
| Evidence | Yes | Milestone-bound |
| Complaint | Yes | Contract-bound |
| Trust Score | Yes | Provider only |

Entities **not in MVP:** Payment, EscrowAccount, InsurancePolicy, GovernmentLicense, BankAccount, Message, Conversation, Listing, Review (standalone).

---

## Section 8 — MVP success criteria

MVP is **complete** when all criteria pass without manual workarounds:

| # | Criterion |
|---|-----------|
| SC-1 | Customer registers, verifies T1, creates Action, completes TEKRR |
| SC-2 | Provider registers, verifies to required tier, accepts contract |
| SC-3 | Contract generates, activates, materializes milestones |
| SC-4 | Provider completes execution with required evidence |
| SC-5 | Customer attests; contract reaches Completed |
| SC-6 | Trust score updates within 24 hours |
| SC-7 | Customer submits structured evaluation |
| SC-8 | Complaint filed, admin adjudicates, outcome updates trust |
| SC-9 | No execution accepted without Active contract (invariant) |
| SC-10 | No complaint accepted without contract_id (invariant) |
| SC-11 | All 15 action types achievable end-to-end (at least one test each) |
| SC-12 | Responsive web usable on mobile browser for core flow |

---

## Section 9 — Scope enforcement rules

| Rule | Enforcement |
|------|-------------|
| **Default deny** | If not in Section 1 (Included), it is excluded |
| **No silent expansion** | Roadmap items require MVP Scope amendment to enter MVP |
| **Constitution override** | Core Principles cannot be violated to add excluded features |
| **Phase gate** | Post-MVP features begin only after SC-1 through SC-12 pass |
| **Change control** | Scope changes require version bump (v1 → v1.1) and stakeholder sign-off |

---

## Section 10 — Post-MVP phase hints (not in scope)

For planning only — **not commitments**:

| Phase | Likely additions |
|-------|------------------|
| **v1.1** | Contract amendments, in-app messaging, verification fee billing |
| **v2.0** | Company actor, institutional read API, payment tracking (not escrow) |
| **v2.5** | Insurance attestation, license registry |
| **v3.0** | Native mobile, AI-assisted action suggestion (not adjudication) |

---

## Section 11 — Document relationships

| Document | Role relative to MVP Scope |
|----------|---------------------------|
| [Core Principles v1](./APP13-Core-Principles-v1.md) | Laws MVP must satisfy |
| [Action Taxonomy v1](./APP13-Action-Taxonomy-v1.md) | 15 action types in MVP |
| [TEKRR Framework v1](./APP13-TEKRR-Framework-v1.md) | Decomposition rules in MVP |
| [Contract Engine v1](./contract-engine/CONTRACT-ENGINE-v1.md) | Contract rules in MVP |
| [Approval Addendum v1.1](./architecture/APPROVAL-ADDENDUM-v1.1.md) | Approved parameters |

---

## Summary table

| Capability | MVP |
|------------|:---:|
| Registration | ✅ |
| Identity verification | ✅ |
| Professional profile | ✅ |
| Action creation | ✅ |
| Contract generation | ✅ |
| Milestones | ✅ |
| Evidence upload | ✅ |
| Trust score | ✅ |
| Complaint workflow | ✅ |
| Payments | ❌ |
| Escrow | ❌ |
| Insurance | ❌ |
| Government integrations | ❌ |
| Banking integrations | ❌ |
| AI automation | ❌ |
| Mobile applications | ❌ |

---

**Status:** Strict boundary — awaiting sign-off before implementation planning

*No code. No UI. No database. MVP boundaries only.*

---

*End of document.*
