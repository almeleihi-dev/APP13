# ADR-0008: Technical Integration Blueprint (EIP M6)

- **Status:** Accepted
- **Date:** 2026-07-07
- **Change tier:** 2 (cross-boundary design; no code)
- **Milestone:** M6 (Technical Integration Blueprint). Final technical design before implementation planning. Design only.
- **Constitutional trace:** Manifesto Art. II, III, V, VI, VIII, IX, X; HSTM S0–S10 + threshold + spiral; UHAA §5 (Model F), §6 (authority); Boundary Contract v1 (ADR-0005); Consent Layer Spec v1 (ADR-0006); Home Model (ADR-0007)
- **Depends on:** ADR-0005, ADR-0006, ADR-0007

## Context
All architecture and consent design is approved. M6 turns it into a concrete engineering map — topology, identity, communication, data authority, deployment, security, and a build sequence — **without implementing anything**.

## Decision
Adopt **Technical Integration Blueprint v1** (`M6-Technical-Integration-Blueprint-v1.md`). It preserves every boundary: no shared database, no hidden synchronization, no reflection→evidence leakage, no action→reflection overwrite, independent deployment retained.

## Consequences
- Provides the executable map future implementation milestones follow, each behind its own ADR + approval gate.
- Fixes one authority per data type and exactly two guarded cross-realm flows.

## Boundary compliance check
- **No shared database:** each realm owns its store; the boundary carries messages, never a shared schema. ✅
- **No hidden synchronization:** the only flows are the human-initiated consent crossing and a coarse advisory reputation event; both explicit and logged. ✅
- **No reflection→evidence leakage:** Private-Realm data never crosses; only the user-assembled Intention Artifact + Consent Artifact do. ✅
- **No action→reflection overwrite:** the backward channel is read-only advisory; it cannot write reflection. ✅
- **Independent deployment preserved:** Wegleiter (static), AN ACT (container+DB+Redis+S3), Home (shell), Consent Layer (boundary), IdP each deploy and fail independently. ✅
- **Second authority created:** No — the matrix in Part 4 assigns exactly one owner per data type.
