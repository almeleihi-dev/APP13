# Architecture Decision Records (ADR) — process & review cadence

This is the decision memory and change-control machinery for the Engineering & Integration Program (EIP v1.0). It exists to satisfy EIP milestone **M0**. It adds **no** new architecture or philosophy; it records and governs decisions against the frozen constitution.

## Frozen constitutional reference (immutable unless explicitly revised)
- Human Action Manifesto v1.0 — `../reality-bridge/Human-Action-Manifesto-v1.0.md`
- HSTM v1.0 — `../reality-bridge/HSTM-v1.0-Human-State-Transition-Model.md`
- UHAA v1.0 — `../reality-bridge/UHAA-v1.0-Architecture-Study.md`
- AN ACT OC-1 — `../../OC1-CERTIFICATION-REPORT.md`
- EIP v1.0 — `../reality-bridge/EIP-v1.0-Engineering-Master-Plan.md`
- Wegleiter ET-5.5 — external system (frozen baseline)

## What requires an ADR
Per EIP §6, three change tiers:
1. **Tier 1 — internal to one system.** Standard PR review; ADR optional.
2. **Tier 2 — cross-boundary contract or authority change** (identity, consent, the reflection/evidence firewall, the authority matrix, evidence durability, cross-system events). **ADR required** + architecture review.
3. **Tier 3 — constitutional change.** Requires an explicit *architectural revision request* and sign-off, then an ADR recording it. Not permitted otherwise.

Any Tier-2/Tier-3 change **must not ship without an accepted ADR**.

## ADR lifecycle
`Proposed → Accepted → (Superseded | Deprecated)`. Superseding ADRs link the ADR they replace. ADRs are append-only; decisions are revised by new ADRs, never by silent edits — mirroring the ecosystem's own "evidence is durable, corrected by process" principle.

## Naming & location
`ADR-NNNN-short-title.md` in this directory, zero-padded sequential. Every ADR uses `ADR-template.md`.

## Architecture-review cadence
- **Per milestone:** a review gate before a milestone is declared complete; the milestone's ADR(s) must be Accepted and its constitutional-article trace filled.
- **Per Tier-2/3 change:** review at proposal time.
- **Standing:** a lightweight boundary audit at each milestone that touches identity, consent, or the firewall (see EIP M7 / Manifesto Art. III, VI).

## Traceability requirement (M0 acceptance)
Every milestone M1–M8 must link to at least one ADR, and every ADR must name the **constitutional article(s)** it conforms to (or, for Tier 3, the article it revises). The living map is `../MILESTONE-TRACEABILITY.md`.
