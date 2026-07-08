# ADR-0007: Human Action Identity & Home Layer (EIP M5)

- **Status:** Accepted
- **Date:** 2026-07-07
- **Change tier:** 2 (cross-boundary design; no code)
- **Milestone:** M5 (Human Action Identity & Home Layer). Architecture/design only.
- **Constitutional trace:** Manifesto Art. II, III, V, VI, IX, X; HSTM (state progression S0→S10, spiral); UHAA §1 (identity), §5 (Model F: shared identity), §6 (authority)
- **Depends on:** ADR-0005 (Boundary Contract v1), ADR-0006 (Consent Layer Spec v1)

## Context
Both realms are verified and the consent bridge is specified. M5 designs the unified human *entry experience* — a single Home and identity — **without** merging the systems. Principle: **One Human. One Home. Two Independent Realms.**

## Decision
Adopt the **Human Action Home Model** (`M5-Human-Action-Home-Design.md`): a thin unified Home shell over two independently-deployed realms joined only by federated identity and the (already-specified) Consent Layer; progressive spaces that mirror real HSTM transitions (not gamification); and the study-only R.ACT loop. No database merge, no automatic synchronization, no hidden data sharing.

## Consequences
- Establishes the entry/navigation design future implementation must follow.
- Confirms shared identity ≠ shared database; shared home ≠ shared private data.
- Defines progression as genuine human transitions, gated by real progress, transparently explained.

## Boundary compliance check
- **One identity ≠ one database:** federated identity maps one human to two local identities; no shared user store. ✅
- **Shared home ≠ shared private data:** the Home renders links/status, never Private-Realm content; reflection stays on-device. ✅
- **Navigation never bypasses consent:** moving from Reflection toward Action always routes through the Consent Layer (ADR-0006); no navigation path crosses data without it. ✅
- **Reflection and Action remain separate:** two independent deployments; the Home is a shell, not a merge. ✅
- **Second authority created:** No — realms keep their authorities; identity is the IdP; the Home holds no authoritative data.
