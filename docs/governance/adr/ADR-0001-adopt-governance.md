# ADR-0001: Adopt ADR-based engineering governance (EIP M0)

- **Status:** Accepted
- **Date:** 2026-07-07
- **Change tier:** 1 (process)
- **Milestone:** EIP M0
- **Constitutional trace:** Manifesto Art. VI (Singular Authority), Art. X (Endurance); EIP §6 (Governance)

## Context
EIP v1.0 requires that, before any build milestone, conformance and change-control are operational so every subsequent change is traceable to the frozen constitution. The foundation documents are frozen; deviations require explicit revision.

## Options considered
1. Lightweight ADRs + a milestone traceability map + a versioning policy (chosen).
2. Heavyweight process (RFCs, boards) — too slow for a small pilot.
3. No formal governance — fails M0 acceptance and risks silent drift from the constitution.

## Decision
Adopt the ADR system in this directory: a template, an append-only decision log, a per-milestone review gate, and a milestone→ADR→constitutional-article traceability map. Define the three-tier change-approval model and the versioning policy in companion documents.

## Consequences
- Every milestone M1–M8 must link ≥1 ADR with a constitutional trace before it is declared complete.
- Tier-2/3 changes cannot ship without an Accepted ADR.
- Adds minor process overhead; accepted as the cost of provable conformance.

## Boundary check
- Reflection/evidence separation preserved: N/A (process only), and the boundary check is now a mandatory template field for future ADRs. 
- Consent crossing preserved: enforced as a future-ADR check. 
- Independent deployability: unaffected. 
- Second authority created: **No**.
