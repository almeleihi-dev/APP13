# ADR-001: Actions Are the Only Tradable Unit on APP13

**Status:** Accepted  
**Date:** June 19, 2026  
**Deciders:** APP13 architecture (constitutional)  
**Supersedes:** Marketplace, service-catalog, and gig-listing product patterns

---

## Context

APP13 is positioned as a **Professional Operating System** — infrastructure to define, contract, execute, and measure professional work. Stakeholders explicitly rejected marketplace, booking-app, and service-catalog models in [Approval Addendum v1.1](../APPROVAL-ADDENDUM-v1.1.md).

Most consumer and B2B platforms treat **services, listings, or gigs** as the primary commercial object:

| Common model | Primary unit | Typical flow |
|--------------|--------------|--------------|
| Marketplace | Service listing / SKU | Browse → book → pay → review |
| Gig platform | Gig or job post | Post → bid → accept → deliver |
| Booking app | Time slot / offering | Select provider offering → schedule |

These models optimize for **discovery and transaction volume**. They treat work as a product to be sold, ranked, and priced before obligations are defined.

APP13 optimizes for **accountability and verifiable execution**. That requires a different primary unit — one that can be decomposed, contracted, evidenced, scored, and disputed with constitutional precision.

[Core Principles v1](../../APP13-Core-Principles-v1.md) establishes **Law 1 — Everything Is an Action**:

> Work is never listed, ranked, or sold as a service product. It is classified, decomposed, contracted, and measured as a discrete unit of professional obligation.

**Why APP13 does not sell services, listings, or gigs:**

1. **Services are underspecified.** A "plumbing service" or "consulting package" does not declare Time, Effort, Knowledge, Risk, and Responsibility (TEKRR). Without TEKRR, contracts cannot be generated, milestones cannot be materialized, and trust cannot be computed fairly.

2. **Listings invite ranking manipulation.** Browse-by-offering models require discovery algorithms, pay-for-placement, and star ratings — all excluded by Law 4 (neutrality) and Law 15 (evidence-based trust).

3. **Gigs decouple obligation from evidence.** Gig acceptance often precedes binding scope. APP13 requires **Contract before execution** (Law 5) with immutable TEKRR snapshots (Law 7).

4. **Disputes need dimensional vocabulary.** Complaints bind to TEKRR dimensions (Law 20). Generic "bad service" reviews cannot be adjudicated against a contract record (Law 21).

5. **Trust must trace to contracts.** Trust scores derive from verified platform events on bound obligations (Laws 14–16), not from anonymous reviews of listed offerings.

If APP13 allowed services or listings as tradable units, the platform would inherit marketplace semantics that conflict with the constitutional chain:

```
Action → Contract → Execution → Trust → Complaint
```

---

## Decision

**Only Actions may be contracted on APP13.**

An **Action** is a classified instance of professional work — identified by a taxonomy code (e.g. `B.2.1`), decomposed via TEKRR, bound to exactly one Contract (MVP), and executed through milestones and evidence.

| Unit | Role on APP13 |
|------|---------------|
| **Action** | **Tradable / contractable unit** — the only entity that may generate a Contract |
| **Contract** | Legal binding of one Action — not independently "purchased" |
| **Service listing** | **Forbidden** as a platform entity |
| **Gig / job post** | **Forbidden** as a contractable unit |
| **Provider profile** | Identity + trust summary — not a catalog of offerings |
| **SKU / package** | **Forbidden** — no SKU-based commerce (Law 1) |

**Corollaries:**

- Customers initiate **Actions**, not shopping-cart checkouts on services.
- Providers are **assigned or invited to Actions**, not discovered via ranked service listings (MVP).
- Commercial terms are **declarative notes on the Contract**, not platform-set prices (Law 4).
- Every Complaint references a **Contract** derived from an **Action** (Law 19).

This decision is **constitutional**. Changing it requires Core Principles amendment, not a feature flag.

---

## Consequences

### Contracts

| Impact | Detail |
|--------|--------|
| **1:1 Action–Contract (MVP)** | Every contract row references `action_id`. No orphan contracts, no multi-action bundles. |
| **Template binding** | Contracts generate from `CT-{action_code}@v1`, not from service SKUs. |
| **TEKRR gate** | Contract generation blocked until Action TEKRR is 100% complete. |
| **No service-level T&Cs** | Terms come from template + TEKRR snapshot, not from a provider's generic "service page." |
| **Amendments** | Scope changes require new Action/Contract (MVP cancel+recreate) — not a listing update. |

**Rejected pattern:** "Buy Provider X's Premium Cleaning Package" → **Required pattern:** "Create Action A.4.2 with TEKRR profile → Contract CT-A.4.2@v1."

### Trust

| Impact | Detail |
|--------|--------|
| **Event provenance** | Trust signals attach to **contract completion** on a specific Action type — not to a listing or provider generically. |
| **No listing reviews** | Law 15 — structured post-Action evaluation only; no stars on service offerings. |
| **Action-type context** | Risk normalization, evidence rigor, and domain emphasis vary by `action_code` — impossible with generic service ratings. |
| **Provider profile** | Shows aggregate trust summary — not a menu of scored services. |

**Rejected pattern:** "4.8 stars on Electrical Services" → **Required pattern:** "Trust score 768 from 7 completed B.2.1 contracts."

### Disputes

| Impact | Detail |
|--------|--------|
| **Issue path on Active contract** | Disputes anchor to execution of a bound Action — `issue_raised` on milestone/dimension. |
| **TEKRR freeze scope** | Frozen dimensions map to Action's TEKRR snapshot — not to vague "service quality." |
| **No pre-contract disputes** | Without Action + Contract, there is no dispute record. |

**Rejected pattern:** "Dispute with seller about their listing description" → **Required pattern:** "Issue on M-VERIFY for Contract bound to Action B.2.1."

### Complaints

| Impact | Detail |
|--------|--------|
| **Contract required** | Every complaint has `contract_id` → Action (Law 19). |
| **Dimension required** | Complaint types map to TEKRR dimensions declared on the Action (Law 20). |
| **Template eligibility** | `eligible_complaint_types[]` defined per Action template — not per service category. |
| **No free-floating complaints** | Complaints against "a provider" without a contract are rejected at EL-1. |

**Rejected pattern:** "Report this provider's service listing" → **Required pattern:** "File TIME_BREACH on dimension T for Contract X."

### Pricing

| Impact | Detail |
|--------|--------|
| **Party-declared only** | `commercial_terms` on Contract — price description, payment arrangement note (Law 4). |
| **No platform price setting** | APP13 does not commission, markup, or recommend prices. |
| **No listing price as entity** | No `service.price`, `gig.budget`, or `listing.rate` tables. |
| **Action context for risk** | TEKRR Risk level informs liability clauses — not dynamic marketplace pricing. |
| **Payment readiness stub** | Phase 4 may bind payments to **Contract milestones on Actions** — not to service SKUs. |

**Rejected pattern:** Platform takes 15% of each "service sale" → **Required pattern:** Parties declare terms; platform records agreement.

### Execution

| Impact | Detail |
|--------|--------|
| **Milestone factory per Action type** | Milestones materialized from template at Contract activation — derived from Action code. |
| **Evidence rules per Action** | Required evidence types (EV-TEST, EV-CRED, etc.) come from Action template — not generic service delivery. |
| **No execution without Active contract** | Action Engine blocks milestones unless Contract = `active` (Law 5). |
| **Recurring sessions** | Session-based Actions (D.1.1, G.1.1) use recurring milestones — not "book another slot" on a listing. |
| **Attestation per dimension** | Fulfillment ratings (FUL/SUF/PAR/UNF) derive from Action's TEKRR obligations. |

**Rejected pattern:** "Mark gig complete" button → **Required pattern:** Milestone sequence M-ACCESS → … → M-COMPLETE with evidence gates.

---

## Alternatives considered

| Alternative | Why rejected |
|-------------|--------------|
| **Hybrid: Actions + optional service listings** | Listings reintroduce discovery ranking, underspecified scope, and pre-contract reviews — violates Laws 1, 4, 15. |
| **Gig posts as contractable units** | Gigs accept before TEKRR binding; scope negotiated post-acceptance — violates Laws 2, 5, 7. |
| **Provider service packages (SKUs)** | Packages are product catalog semantics — violates Law 1; breaks template-per-action-code model. |
| **Job board (employer posts jobs)** | Shifts platform toward recruitment marketplace; Action model keeps customer as initiator with TEKRR decomposition. |
| **Browse-by-domain only (no listings)** | Discovery without listings is Phase 2+ provider profiles linking to Action types — still Action-initiated, not service purchase. |

---

## Compliance checklist (implementation)

Engineering and product must verify:

- [ ] No `services`, `listings`, `gigs`, or `skus` tables in domain schema
- [ ] No API endpoint that "purchases a service" or "books a listing"
- [ ] All Contract records require `action_id` + `action_code`
- [ ] All Complaint records require `contract_id`
- [ ] All Evidence records require `contract_id` + `milestone_id`
- [ ] Trust events trace to contract events on Actions
- [ ] UI copy uses "Action" / "Contract" — not "service" / "gig" / "listing"
- [ ] Provider profiles show trust summary — not a service menu (MVP)

---

## Related documents

| Document | Relationship |
|----------|--------------|
| [Core Principles v1](../../APP13-Core-Principles-v1.md) | Law 1, 4, 5 — constitutional authority |
| [Approval Addendum v1.1](../APPROVAL-ADDENDUM-v1.1.md) | Platform positioning |
| [Action Taxonomy v1](../../APP13-Action-Taxonomy-v1.md) | Action classification tree |
| [Contract Engine v1](../../APP13-Contract-Engine-v1.md) | Action → Contract binding |
| [Trust Engine v1.1](../../APP13-Trust-Engine-v1.1.md) | Contract-event-sourced trust |
| [MVP Scope v1](../../APP13-MVP-Scope-v1.md) | Explicit marketplace exclusions |

---

## Summary

APP13 does not sell services, listings, or gigs because accountability requires **specified obligations** (TEKRR), **binding contracts**, **milestone evidence**, and **dimensional disputes** — none of which attach cleanly to marketplace product units.

**Actions are the only tradable unit.** Everything else — contracts, trust, complaints, pricing notes, and execution — exists to bind, measure, and enforce professional work expressed as Actions.

---

*ADR-001 accepted. No existing files were modified.*
