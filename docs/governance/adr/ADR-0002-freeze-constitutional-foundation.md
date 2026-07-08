# ADR-0002: Freeze the constitutional foundation as immutable baseline

- **Status:** Accepted
- **Date:** 2026-07-07
- **Change tier:** 3 (constitutional — records an approved freeze)
- **Milestone:** EIP M0
- **Constitutional trace:** all — Manifesto v1.0, HSTM v1.0, UHAA v1.0, AN ACT OC-1, EIP v1.0, Wegleiter ET-5.5

## Context
The Foundation Phase is complete and approved. The listed documents are declared the permanent constitutional reference; no future implementation may contradict them without an explicit architectural revision request.

## Options considered
1. Freeze as immutable, revisable only by explicit request (chosen).
2. Keep documents mutable — rejected; would permit silent drift and defeat traceability.

## Decision
Freeze the six documents as the immutable baseline. Any change to them is a Tier-3 event requiring an explicit revision request and sign-off, then a superseding ADR. Engineering ADRs (Tier 1/2) must conform to, and never contradict, this baseline.

## Consequences
- The baseline is the reference against which all milestone reviews check conformance.
- Constitution versioning is tracked separately from system versioning (see VERSIONING-POLICY).
- Wegleiter ET-5.5 and AN ACT OC-1 remain independently deployable baselines.

## Boundary check
- Reflection/evidence separation preserved: **Yes** — the firewall is a frozen constitutional article (Manifesto Art. III/VIII).
- Consent crossing preserved: **Yes** — HSTM S4→S5 threshold is frozen.
- Independent deployability: **Yes** — the two systems' baselines are independent.
- Second authority created: **No** — the UHAA authority matrix is frozen.
