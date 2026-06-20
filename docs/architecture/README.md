# APP13 Core Architecture v1

**Version:** 1.1  
**Status:** Approved (see addendum) — Pre-implementation  
**Last updated:** June 19, 2026  
**Depends on:** [Core Principles v1](../APP13-Core-Principles-v1.md) · [PRD v2.0](../PRD.md) · [Approval Addendum v1.1](./APPROVAL-ADDENDUM-v1.1.md) · [Action Taxonomy v1](../APP13-Action-Taxonomy-v1.md)

---

## Purpose

This architecture package defines the **core platform systems** for APP13 before any application code is written. It decomposes the platform into four engines that together deliver trust, accountability, and execution integrity.

## Core engines

| Engine | Responsibility |
|--------|----------------|
| [**Identity Engine**](./engines/identity-engine.md) | Actors, verification tiers, trust profiles, trust scores |
| [**Action Engine**](./engines/action-engine.md) | TEKRR decomposition, obligations, execution tracking, execution scores |
| [**Contract Engine**](./engines/contract-engine.md) | Template rules, generation, acceptance, amendments, archival |
| [**Complaint Engine**](./engines/complaint-engine.md) | Disputes, evidence, adjudication, score impact |

## Architecture documents

| Document | Contents |
|----------|----------|
| [**Core Principles v1**](../APP13-Core-Principles-v1.md) | **Constitution — 25 non-negotiable platform laws** |
| [**Entity Model v1**](../APP13-Entity-Model-v1.md) | **Core entities, relationships, ERD, schema draft** |
| [**MVP Scope v1**](../APP13-MVP-Scope-v1.md) | **Strict MVP boundaries — included vs excluded** |
| [**Roadmap v1**](../APP13-Roadmap-v1.md) | **Six-phase strategic evolution — P1 MVP through P6 AI** |
| [**Approval Addendum v1.1**](./APPROVAL-ADDENDUM-v1.1.md) | **Approved adjustments — takes precedence over v1.0 where conflicts exist** |
| [**Action Taxonomy v1**](../APP13-Action-Taxonomy-v1.md) | **Universal action tree — TEKRR, milestones, evidence** |
| [**TEKRR Framework v1**](../APP13-TEKRR-Framework-v1.md) | **Dimension measurement, weighting, contract/trust/complaint impact** |
| [**Contract Engine v1**](../contract-engine/CONTRACT-ENGINE-v1.md) | **Contract templates, lifecycle, Action→Trust chain** |
| [Business Architecture](./01-business-architecture.md) | Domain model, engine topology, boundaries, events, integrations |
| [User Flows](./02-user-flows.md) | End-to-end flows by actor and engine interaction |
| [Database Entities](./03-database-entities.md) | Logical schema, relationships, ownership by engine |
| [Permissions Matrix](./04-permissions-matrix.md) | RBAC, resource access, engine-level authorization rules |
| [Contract Lifecycle](./05-contract-lifecycle.md) | States, transitions, invariants, engine handoffs |
| [Complaint Lifecycle](./06-complaint-lifecycle.md) | States, transitions, SLAs, engine handoffs |

## Architectural invariants

1. **No execution without an Active contract** — Action Engine rejects work signals unless Contract Engine confirms `active` status.
2. **No contract activation without verified parties** — Contract Engine gates acceptance on Identity Engine tier requirements.
3. **Every action is TEKRR-decomposed** — Action Engine owns the canonical TEKRR profile; Contract Engine materializes it; Complaint Engine references dimension keys.
4. **Scores are event-sourced** — Identity Engine recomputes trust scores from immutable platform events, never manual overrides.
5. **Complaints bind to contracts and dimensions** — Complaint Engine cannot file standalone disputes.
6. **Platform neutrality** — No engine sets commercial price or brokers service discovery.

## Document conventions

- **Entity** — Logical database object (implementation-agnostic)
- **Event** — Domain event emitted on state change
- **Invariant** — Rule that must never be violated
- **MVP** / **Phase 2** — Scope markers aligned with PRD v2

---

*No code or UI specifications are included in this package.*
