# APP13 Core Principles v1

## The Constitution of the Professional Operating System

**Version:** 1.0  
**Status:** Foundational — Non-negotiable  
**Last updated:** June 19, 2026  
**Authority:** Supersedes conflicting product, architecture, and implementation decisions

---

## Preamble

APP13 exists to make professional accountability **standard, verifiable, and portable**.

This document establishes the **non-negotiable laws** of the platform — the constitutional foundation upon which all product requirements, architecture, contracts, trust scores, and complaints are built. No feature, integration, or commercial pressure may violate these laws without explicit constitutional amendment.

APP13 is a **Professional Operating System**. It is not a marketplace. It does not sell services. It governs how professional work is defined, contracted, evidenced, measured, and held accountable.

**No application code is defined herein.**

---

## Article I — Nature of the Platform

### Law 1 — Everything Is an Action

**Every professional activity on APP13 is an Action.**

Work is never listed, ranked, or sold as a service product. It is classified, decomposed, contracted, and measured as a discrete unit of professional obligation. If it cannot be expressed as an Action, it does not belong on APP13.

*Implication:* No service catalog, no browse-by-offering, no SKU-based commerce.

---

### Law 2 — Actions Are Decomposed, Not Described

**Every Action must be decomposed into TEKRR: Time, Effort, Knowledge, Risk, and Responsibility.**

No Action may proceed with vague scope. All five dimensions must be addressed — declared, measured, and bound before execution. Professional work is never a single undifferentiated promise.

*Implication:* TEKRR profile completeness is a hard gate; no dimension may be omitted.

---

### Law 3 — The Platform Does Not Perform Work

**APP13 structures, binds, and measures professional work — it never performs it.**

The platform is infrastructure for accountability, not an agent, employer, broker, or service provider. APP13 does not deliver outcomes; it governs the record of who promised what and what happened.

*Implication:* Liability for work outcomes remains with contract parties, not the platform.

---

### Law 4 — Neutrality Is Mandatory

**APP13 does not set prices, choose providers, or take sides in commercial negotiation.**

Parties supply commercial terms. The platform generates contractual framework from TEKRR inputs and enforces the record of agreement. Neutrality is structural, not aspirational.

*Implication:* No commissions on service price, no pay-for-ranking, no lead sales.

---

## Article II — Contract Supremacy

### Law 5 — No Contract, No Execution

**Every Action must have a Contract before execution begins.**

The platform recognizes no professional execution unless a Contract has been generated, accepted by all required parties, and activated. Work performed outside an Active Contract has no standing on APP13.

*Implication:* Contract state must be `Active` before milestones, evidence, or attestations are accepted.

---

### Law 6 — Contract Before Commitment

**Every Contract must pass through defined states: Draft, Proposed, Accepted, and Active.**

No party may be bound without explicit acceptance. No contract may skip from definition to execution. The lifecycle is sequential and auditable.

*Implication:* Draft → Proposed → Accepted → Active is the only valid activation path.

---

### Law 7 — Contracts Bind TEKRR Snapshots

**Every Active Contract must contain an immutable TEKRR snapshot.**

At activation, the TEKRR profile is frozen. Later changes to party verification, trust scores, or action definitions do not retroactively alter the obligations of an Active Contract.

*Implication:* Snapshots stored with document hash at activation; amendments require re-acceptance.

---

### Law 8 — Contracts Are Generated, Not Freeform

**Every Contract is generated from a versioned template bound to an Action type.**

Parties do not upload arbitrary agreements as the canonical record. The Contract Engine materializes obligations from TEKRR profiles and approved template rules. Custom terms supplement; they do not replace the platform contract.

*Implication:* Template ID and version referenced on every contract record.

---

### Law 9 — All Required Parties Must Accept

**Every Contract requires acceptance from every party with binding obligations.**

A Contract cannot activate until each required party — at minimum Customer and Provider — has digitally accepted at their required verification tier.

*Implication:* Partial acceptance leaves contract in Proposed or Accepted (pending full acceptance), never Active.

---

## Article III — Evidence and Execution

### Law 10 — Every Contract Must Have Evidence

**Every Contract must define and collect Evidence tied to Contract Milestones.**

Execution is not self-reported opinion. It is proven through typed evidence artifacts — timestamps, documents, photographs, checklists, test results, sign-offs — linked to specific milestones.

*Implication:* No milestone may reach attestation without required evidence types satisfied.

---

### Law 11 — Evidence Is Milestone-Bound

**Every piece of Evidence must attach to exactly one Contract Milestone on one Contract.**

Orphan evidence, unattached uploads, and post-hoc evidence without milestone context have no platform standing.

*Implication:* Evidence records require contract_id and milestone_id; no floating artifacts.

---

### Law 12 — Execution Is Milestone-Driven

**Every Active Contract must materialize a Milestone sequence derived from its Action type.**

Execution progress is tracked through milestone completion — not through informal status updates. Milestones are the unit of operational truth.

*Implication:* Milestone factory runs at activation; no Active Contract without milestones.

---

### Law 13 — Attestation Requires Evidence

**Every milestone attestation must be supported by submitted Evidence or an explicit dispute.**

Parties may confirm or reject fulfillment per TEKRR dimension, but attestation without evidence basis triggers audit flags and complaint pathways.

*Implication:* Attestation records reference evidence_ids or dispute status.

---

## Article IV — Trust and Reputation

### Law 14 — Every Evidence Affects Trust

**Every verified Evidence submission and milestone outcome produces Trust signals.**

Trust is not decorative. Evidence that proves fulfillment strengthens trust; evidence of failure, lateness, or dispute weakens it. Nothing material happens on a Contract without Trust consequences.

*Implication:* Trust events emitted on milestone completion, time breach, evaluation submission, and complaint resolution.

---

### Law 15 — Trust Is Evidence-Based, Not Opinion-Based

**Trust Scores derive from verified platform events — not from anonymous star ratings or unverified reviews.**

Customer Evaluation is structured, contract-linked, and dimension-mapped. There are no standalone five-star reviews disconnected from Actions and Contracts.

*Implication:* No generic review system; EVAL forms post-completion only.

---

### Law 16 — Trust Scores Are Never Manually Set

**Trust Scores are computed from events — they are never manually assigned or overridden by parties.**

Providers, customers, and commercial partners cannot edit their scores. Administrators may correct underlying *events* (with audit trail), not the algorithm output directly.

*Implication:* Identity Engine owns computation; score appeals target events, not numbers.

---

### Law 17 — Trust Travels With Verified Identity

**Trust history binds to verified identity and persists across Actions and Contracts.**

Reputation cannot be discarded by creating a new account. Contract history, complaint dispositions, and execution records accrue to the verified provider identity.

*Implication:* Deactivation anonymizes; it does not erase contract-linked audit records.

---

### Law 18 — Verification Gates Obligation

**Every party must meet minimum verification tier before binding acceptance.**

Unverified parties may draft Actions and Contracts but cannot activate them. Higher-risk Actions require higher verification tiers. Trust begins with identity assurance.

*Implication:* Tier gates enforced at acceptance; T0 cannot activate contracts.

---

## Article V — Complaints and Accountability

### Law 19 — Every Complaint Originates From a Contract

**Every Complaint must reference a specific Contract and at least one TEKRR dimension.**

There are no free-floating disputes, general reputation attacks, or complaints unrelated to a bound professional obligation. Accountability requires a contract record.

*Implication:* complaint.contract_id and complaint.tekrr_dimensions[] are mandatory.

---

### Law 20 — Complaints Are Dimension-Specific

**Every Complaint must declare the TEKRR dimension(s) in dispute.**

Time, Effort, Knowledge, Risk, and Responsibility are the vocabulary of dispute. Generic dissatisfaction without dimensional grounding is out of scope.

*Implication:* Complaint type must map to T, E, K, R, or S; cross-cutting integrity complaints excepted.

---

### Law 21 — Complaints Require Evidence

**Every Complaint must be adjudicated against the Contract evidence record.**

Both parties submit evidence within defined windows. The platform auto-attaches the contract snapshot, milestone history, and evidence package. Rulings reference the record, not memory.

*Implication:* Complaint Engine assembles evidence package at triage; MVP SLA 15 business days.

---

### Law 22 — Complaint Outcomes Modify Trust

**Every upheld Complaint produces Trust consequences proportional to severity.**

Dismissed complaints leave trust neutral (with frivolous-pattern detection). Upheld complaints apply penalties, update dimension fulfillment, and may trigger tier review at critical severity.

*Implication:* complaint.resolved event feeds Trust Complaints component before contract closes.

---

### Law 23 — Issues Escalate Through Defined Paths

**Every execution dispute follows: Active → Issue Raised → Disputed → Resolved → Closed.**

Parties may flag issues during execution, but formal Complaints activate the Complaint Engine. No informal shadow dispute process exists outside the record.

*Implication:* Issue path freezes affected dimensions until resolution.

---

## Article VI — Integrity and Governance

### Law 24 — The Record Is Immutable

**Every state transition on Actions, Contracts, Milestones, Evidence, and Complaints is append-only and auditable.**

History is not rewritten. Amendments create new versions; corrections add audit events. The platform maintains a defensible record for parties and authorized inquiry.

*Implication:* audit_events for all mutations; status_history on contracts and complaints.

---

### Law 25 — Methodology Is Versioned and Prospective

**Every scoring formula, template pack, and TEKRR framework version is published, versioned, and applied prospectively.**

Contracts reference the methodology version at activation. Changes to trust algorithms or template rules do not retroactively alter completed obligations.

*Implication:* tekrr_framework_version, trust_score_version, template_version stored on contract records.

---

## Article VII — Hierarchy and Amendment

### Supremacy order

When documents conflict, authority flows downward:

```
1. APP13 Core Principles v1 (this document)
2. Approval Addendum (approved adjustments)
3. TEKRR Framework v1
4. Action Taxonomy v1
5. Contract Engine v1
6. Architecture specifications
7. PRD and feature specifications
8. Implementation code
```

No code, feature, or commercial agreement may violate Laws 1–25.

### Amendment process

| Step | Requirement |
|------|-------------|
| 1 | Written proposal with rationale and impact analysis |
| 2 | Stakeholder review (product, legal, trust operations) |
| 3 | Version bump (e.g., Core Principles v1 → v2) |
| 4 | Prospective effective date declared |
| 5 | Existing Active Contracts remain under prior law until completion |

Core Principles should change rarely. Violations are bugs, not shortcuts.

---

## Article VIII — Explicit Exclusions (MVP)

These are **not** laws — they are deferred capabilities that must not be mistaken for platform rights:

| Deferred | Status |
|----------|--------|
| Payments and escrow | Not part of MVP; commercial terms declarative only |
| Regulator integrations | Not part of MVP |
| Insurance attestation API | Not part of MVP |
| Institutional overlays | Not part of MVP |
| Marketplace discovery | Permanently excluded by Law 1 and Law 4 |

Deferred items may be added only if they satisfy all 25 laws.

---

## Summary — The 25 Laws

| # | Law | One line |
|---|-----|----------|
| 1 | Everything Is an Action | Professional work is always an Action |
| 2 | Actions Are Decomposed | TEKRR required on every Action |
| 3 | Platform Does Not Perform Work | APP13 governs; it does not deliver |
| 4 | Neutrality Is Mandatory | No pricing, ranking, or side-taking |
| 5 | No Contract, No Execution | Active Contract required |
| 6 | Contract Before Commitment | Draft → Proposed → Accepted → Active |
| 7 | Contracts Bind Snapshots | TEKRR frozen at activation |
| 8 | Contracts Are Generated | Versioned templates, not freeform |
| 9 | All Parties Must Accept | No unilateral activation |
| 10 | Every Contract Has Evidence | Milestone-bound proof required |
| 11 | Evidence Is Milestone-Bound | No orphan artifacts |
| 12 | Execution Is Milestone-Driven | Milestones are operational truth |
| 13 | Attestation Requires Evidence | No unsupported claims |
| 14 | Every Evidence Affects Trust | Material events have trust consequences |
| 15 | Trust Is Evidence-Based | No anonymous star ratings |
| 16 | Trust Scores Are Computed | Never manually set |
| 17 | Trust Travels With Identity | Persistent verified reputation |
| 18 | Verification Gates Obligation | Tier required for acceptance |
| 19 | Complaints From Contracts | No free-floating disputes |
| 20 | Complaints Are Dimension-Specific | TEKRR vocabulary of dispute |
| 21 | Complaints Require Evidence | Adjudication against the record |
| 22 | Complaint Outcomes Modify Trust | Uphheld = consequences |
| 23 | Issues Escalate Through Paths | Issue → Disputed → Resolved → Closed |
| 24 | The Record Is Immutable | Append-only audit history |
| 25 | Methodology Is Versioned | Prospective application only |

---

## The Chain (Constitutional Expression)

All twenty-five laws express one accountable chain:

```
Action → Contract → Execution → Trust → Complaint
```

- **Action** — Laws 1, 2  
- **Contract** — Laws 5, 6, 7, 8, 9  
- **Execution** — Laws 10, 11, 12, 13  
- **Trust** — Laws 14, 15, 16, 17, 18  
- **Complaint** — Laws 19, 20, 21, 22, 23  
- **Governance** — Laws 3, 4, 24, 25  

---

## Related documents

| Document | Relationship |
|----------|--------------|
| [PRD v2.0](./PRD.md) | Product expression of these laws |
| [TEKRR Framework v1](./APP13-TEKRR-Framework-v1.md) | Law 2 implementation |
| [Action Taxonomy v1](./APP13-Action-Taxonomy-v1.md) | Law 1 classification |
| [Contract Engine v1](./contract-engine/CONTRACT-ENGINE-v1.md) | Laws 5–13 implementation |
| [Approval Addendum v1.1](./architecture/APPROVAL-ADDENDUM-v1.1.md) | Approved operational parameters |

---

**Ratified:** Pending stakeholder sign-off  
**Effective:** Upon approval; binds all subsequent design and implementation

---

*End of constitution.*
