# AN ACT — Master Architecture Index

**Version:** 1.0  
**Purpose:** Single entry point for all AN ACT / APP13 architecture documentation.  
**Audience:** Developers, architects, designers, AI engineers, product owners.

---

## How to Use This Index

1. **New to AN ACT?** Start with the [Product Bible](./AN-ACT-Product-Bible.md) (Sections 1–9).
2. **Building UI?** Read CH3 identity docs, then Section 45 of the Product Bible (Future Render Layer).
3. **Building intelligence features?** Read CH4 + CH5 architecture books and registries.
4. **Implementing a module?** Find your chapter registry in the appendices of the Product Bible.

**Status key (used across all linked documents):**

| Label | Meaning |
|-------|---------|
| **Implemented** | Executable TypeScript, concrete values, or verified REST APIs |
| **Documented** | Markdown specs; may lack pixel UI |
| **Concept only** | Specified or recommended; not wired to production render path |
| **Recommended** | Official guidance not yet fully implemented |

---

## Tier 0 — Start Here

| Document | Purpose | Primary audience |
|----------|---------|------------------|
| [**AN ACT — Product Bible v1.0**](./AN-ACT-Product-Bible.md) | Highest-level product specification unifying CH3, CH4, CH5 | Everyone |
| [**Platform MVP Readiness Assessment**](./AN-ACT-Platform-MVP-Readiness-Assessment.md) | Official Go / No-Go report before Render Layer | Leadership, architects |
| [**Transition To MVP Plan**](./AN-ACT-Transition-To-MVP-Plan.md) | Render Layer roadmap and build order | Frontend, product, architects |
| [**Master Architecture Index**](./AN-ACT-Master-Architecture-Index.md) | This document — navigation hub | Everyone |

---

## Tier 1 — Chapter Architecture (Completed Chapters)

### Chapter 3 — Runtime Experience & Visual Identity

| Document | Purpose | Read when |
|----------|---------|-----------|
| [CH3 Experience Identity Review](./AN-ACT-CH3-Experience-Identity-Review.md) | Full visual identity, runtime UX, navigation, components, Live Frame analysis | Designing or reviewing any user-facing screen |
| [CH3 Design System Registry](./AN-ACT-CH3-Design-System-Registry.md) | Catalog of colors, tokens, components, prototypes, gaps | Implementing design tokens or component specs |
| `docs/design-system/CH3-X1-AN-ACT-Design-System.md` | X1 design system mission and structure | Deep-diving X1 foundation |
| `docs/design-system/CH3-X2-Core-UI-Components.md` | X2 component catalog philosophy | Adding core UI components |
| `docs/design-system/CH3-X3-Navigation-Framework.md` | X3 navigation and screen anatomy | Screen layout and navigation |
| `docs/design-system/CH3-X4-Visual-Prototype-Library.md` | X4 prototype library mission | Adding visual prototypes |
| `docs/runtime/CH3-X5-*.md` … `CH3-X30-*.md` | Per-module runtime specs (26 files) | Implementing a specific runtime module |
| `docs/runtime/CH3-FINAL-Runtime-Completion-Certification.md` | CH3 terminal certification layer | CH3 completion / CH4 handoff |

### Chapter 4 — Action Intelligence

| Document | Purpose | Read when |
|----------|---------|-----------|
| [CH4 Design Identity Review](./AN-ACT-CH4-Design-Identity-Review.md) | Intelligence UX philosophy, dashboards, certification vocabulary | Understanding CH4 experience projections |
| [Design System Candidates](./AN-ACT-Design-System-Candidates.md) | Consolidation candidates from CH4 review | Planning design system unification |
| `docs/action-intelligence/CH4-C1-*.md` … `CH4-C22-*.md` | Per-module intelligence specs | Implementing C1–C22 modules |

### Chapter 5 — AI Experience

| Document | Purpose | Read when |
|----------|---------|-----------|
| [AI Experience Architecture Book](./AN-ACT-AI-Experience-Architecture-Book.md) | Complete CH5 architecture: chain, delegation, patterns, lessons | Building or extending CH5 modules |
| [CH5 AI Experience Registry](./CH5-AI-Experience-Registry.md) | Full X1–X22 registry table, namespaces, routes, bootstrap | Module lookup and collision prevention |

---

## Tier 1.5 — Live Frame (Trust Visualization Standard)

| Document | Purpose | Read when |
|----------|---------|-----------|
| [**Live Frame v1.0 Specification**](./AN-ACT-Live-Frame-v1.0-Specification.md) | Official unified Live Frame SSOT — trust formula, tiers, colors, JSON schema, render contracts | Building Render Layer, trust rings, profile cards, or any Live Frame surface |
| [**Live Frame Migration Plan**](./AN-ACT-Live-Frame-Migration-Plan.md) | Consolidation from 11+ implementations — official vs deprecated, phases, verification | Before wiring runtime demos, adapter module, or deprecating legacy classifiers |

---

## Tier 2 — Platform Core (Pre-Chapter / Foundational)

| Document | Purpose |
|----------|---------|
| [Architecture README](./README.md) | APP13 core engine overview and invariants |
| [Business Architecture](./01-business-architecture.md) | Four-engine domain model |
| [User Flows](./02-user-flows.md) | End-to-end actor flows |
| [Database Entities](./03-database-entities.md) | Logical schema |
| [Permissions Matrix](./04-permissions-matrix.md) | RBAC rules |
| [Contract Lifecycle](./05-contract-lifecycle.md) | Contract state machine |
| [Complaint Lifecycle](./06-complaint-lifecycle.md) | Complaint state machine |
| [Identity Engine](./engines/identity-engine.md) | Actor, verification, trust |
| [Action Engine](./engines/action-engine.md) | TEKRR, obligations, execution |
| [Contract Engine](./engines/contract-engine.md) | Templates, generation, acceptance |
| [Complaint Engine](./engines/complaint-engine.md) | Disputes, evidence, adjudication |
| [Financial Kernel (B6)](./B6-Financial-Kernel.md) | Financial domain architecture |

---

## Tier 3 — API, Database & Backend Reviews

| Document | Purpose |
|----------|---------|
| [Backend Architecture v1](./APP13-Backend-Architecture-v1.md) | Backend structure |
| [API Architecture v1.1](./APP13-API-Architecture-v1.1.md) | API design |
| [Database Architecture v1.1](./APP13-Database-Architecture-v1.1.md) | Database design |
| Review documents (`*-Review-v1.md`, `*-Changes.md`) | Audit findings and change logs |

---

## Tier 4 — Architectural Decisions (ADR)

| ADR | Title |
|-----|-------|
| [ADR-001](./adr/ADR-001-Action-Only.md) | Actions Are the Only Tradable Unit |
| [ADR-002](./adr/ADR-002-Complaint-Origin.md) | Complaint Origin Rules |
| [ADR-003](./adr/ADR-003-Trust-Authority.md) | Trust Authority |

---

## Tier 5 — External Constitutional Documents

Referenced by architecture docs (typically under `docs/` root):

| Document | Role |
|----------|------|
| `docs/APP13-Core-Principles-v1.md` | 25 platform laws |
| `docs/APP13-MVP-Scope-v1.md` | MVP boundaries |
| `docs/APP13-Roadmap-v1.md` | Six-phase roadmap |
| `docs/PRD.md` | Product requirements |
| `docs/APPROVAL-ADDENDUM-v1.1.md` | Approved positioning adjustments |

---

## Recommended Reading Order

### For Product Owners

1. [Platform MVP Readiness Assessment §1, §44–45](./AN-ACT-Platform-MVP-Readiness-Assessment.md) — Go/No-Go and scores  
2. [Transition To MVP Plan §8–12](./AN-ACT-Transition-To-MVP-Plan.md) — Milestones and final recommendation  
3. [Product Bible §1–4](./AN-ACT-Product-Bible.md) — Vision, philosophy, problem, principles  
4. [Product Bible §15–17](./AN-ACT-Product-Bible.md) — Marketplace, trust, Live Frame  
5. [Product Bible §41–43](./AN-ACT-Product-Bible.md) — Roadmap and MVP  
6. [ADR-001 Action Only](./adr/ADR-001-Action-Only.md)  
7. [CH4 Design Identity Review §4](./AN-ACT-CH4-Design-Identity-Review.md) — Experience philosophy  

### For Architects

1. [Product Bible §10–14](./AN-ACT-Product-Bible.md) — Platform and intelligence architecture  
2. [Product Bible §34–40](./AN-ACT-Product-Bible.md) — Registry, delegation, governance rules  
3. [AI Experience Architecture Book §3–9](./AN-ACT-AI-Experience-Architecture-Book.md) — Principles and namespace rules  
4. [Architecture README](./README.md) — Engine invariants  
5. [Product Bible Appendix D](./AN-ACT-Product-Bible.md) — Complete intelligence chain  

### For Designers

1. [CH3 Experience Identity Review](./AN-ACT-CH3-Experience-Identity-Review.md) — Full visual identity  
2. [CH3 Design System Registry](./AN-ACT-CH3-Design-System-Registry.md) — Token and component catalog  
3. [Product Bible §18–29](./AN-ACT-Product-Bible.md) — Unified Live Frame, identity, visual language, screen rules  
4. [Design System Candidates](./AN-ACT-Design-System-Candidates.md) — Consolidation gaps  
5. `docs/design-system/CH3-X4-Visual-Prototype-Library.md` — Screen blueprints  

### For Frontend / Mobile Engineers

1. [Live Frame v1.0 Specification](./AN-ACT-Live-Frame-v1.0-Specification.md) — Trust tier → UI tier mapping, render contracts (React, Flutter, SwiftUI, Bubble)
2. [Transition To MVP Plan](./AN-ACT-Transition-To-MVP-Plan.md) — Full render roadmap (React, Flutter, Bubble)  
2. [Platform MVP Readiness Assessment §33–38](./AN-ACT-Platform-MVP-Readiness-Assessment.md) — Per-platform readiness  
3. [Product Bible §30–33](./AN-ACT-Product-Bible.md) — Runtime JSON, prototypes, tokens, components  
4. [Product Bible §45](./AN-ACT-Product-Bible.md) — Future render layer consumption guide  
5. [CH3 Design System Registry §6–8](./AN-ACT-CH3-Design-System-Registry.md) — Runtime screens, tokens, prototypes  
6. Source: `src/design-system/tokens/design-tokens.ts`, `src/runtime-experience/need/presentation/screen-builder.ts`  

### For Backend Engineers

1. [Architecture README](./README.md)  
2. [Backend Architecture v1](./APP13-Backend-Architecture-v1.md)  
3. [Product Bible §12–14](./AN-ACT-Product-Bible.md) — Runtime and intelligence architecture  
4. Bootstrap: `src/bootstrap/bootstrap.ts`, `runtime.ts`, `intelligence.ts`  
5. Chapter registries in [Product Bible Appendices A–C](./AN-ACT-Product-Bible.md)  

### For AI Engineers

1. [Product Bible §7–8, §14, §46](./AN-ACT-Product-Bible.md) — Intelligence and AI philosophy  
2. [AI Experience Architecture Book](./AN-ACT-AI-Experience-Architecture-Book.md) — Full CH5 reference  
3. [CH5 AI Experience Registry](./CH5-AI-Experience-Registry.md) — Module lookup  
4. [CH4 Design Identity Review §17](./AN-ACT-CH4-Design-Identity-Review.md) — AI visualization philosophy  
5. [Product Bible Appendix D](./AN-ACT-Product-Bible.md) — 44-link intelligence chain  

### For QA / Verification Engineers

1. `package.json` scripts: `verify:ch3-x1` … `verify:ch3-final`, `verify:ch4-c1` … `verify:ch4-c22`, `verify:ch5-x1` … `verify:ch5-x22`  
2. [Product Bible §37–39](./AN-ACT-Product-Bible.md) — Deterministic and explainability rules  
3. Per-module docs in `docs/runtime/`, `docs/action-intelligence/`  
4. [Product Bible Appendix G](./AN-ACT-Product-Bible.md) — Known technical debt  

---

## Source Code Map (Quick Reference)

| Layer | Path | Chapter |
|-------|------|---------|
| Design tokens & themes | `src/design-system/` | CH3-X1 |
| Core UI specs | `src/design-system/core-ui/` | CH3-X2 |
| Navigation framework | `src/navigation-framework/` | CH3-X3 |
| Prototype library | `src/prototype-library/` | CH3-X4 |
| Runtime experiences | `src/runtime-experience/` | CH3-X5–FINAL |
| Action intelligence | `src/unified-action-intelligence/` … `src/action-intelligence-final-closure/` | CH4-C1–C22 |
| AI experience | `src/ai-experience/` … `src/ai-experience-final-closure/` | CH5-X1–X22 |
| Platform engines | `src/action/`, `src/contract/`, `src/trust/`, etc. | Core |
| Bootstrap | `src/bootstrap/` | All chapters |
| Legacy UI pages | `src/ui/pages/` | Pre-CH3 (parallel, no token import) |

---

## Document Maintenance

When adding a new architecture document:

1. Add it to the appropriate tier in this index  
2. Cross-reference from [Product Bible Appendix H](./AN-ACT-Product-Bible.md) if it represents a future opportunity  
3. Update the Product Bible if the new doc changes platform-level principles  

---

*Index version 1.0 — documentation only; no source code modified.*
