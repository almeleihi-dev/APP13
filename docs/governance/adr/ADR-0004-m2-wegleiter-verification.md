# ADR-0004: Wegleiter ET-5.5 verification (EIP M2 / Program A)

- **Status:** Accepted — **verification executed & completed 2026-07-07** against the real ET-5.5 source (`~/Desktop/Human-Action-Ecosystem/Wegleiter/`)
- **Date:** 2026-07-07
- **Change tier:** 1 (verification only — no change to either system)
- **Milestone:** Executed as M2 in the current sequence; corresponds to EIP Program A ("Wegleiter Stabilization"), originally milestone M3 "Wegleiter capability confirmed." Pulled forward as the next **parallel** milestone, which the EIP dependency map explicitly permits (Program A has no AN ACT dependency).
- **Constitutional trace:** HSTM S0–S4 (inner realm) + S4→S5 threshold; Manifesto Art. II (Threshold), Art. III (reflection privacy), Art. VIII (recovery — n/a here); UHAA §1 (system identity), §3 (data boundaries), §6 (authority: reflection = Wegleiter)

## Context
Before any integration, the second independent system must be verified against the frozen assumptions in UHAA/HSTM: that Wegleiter operates only in S0–S4, creates no accountable evidence, requires a consent handoff before action, and is independently deployable.

## Constraint discovered
The Wegleiter ET-5.5 source, specification, and ET-5.5 architecture documents (defining the Observer model, S(t), ORL, hardware/software model, etc.) are **not accessible in this environment.** A filesystem search of all reachable locations (workspace, uploads, outputs) found zero Wegleiter artifacts; the only occurrences of "Wegleiter" are in our own governance/architecture documents. Throughout the Foundation Phase, Wegleiter was consistently treated as an assumed role to be confirmed against its real system — this milestone is where that confirmation must happen, and it cannot proceed without the source.

## Options considered
1. **Produce a verification protocol grounded in UHAA/HSTM, then STOP at the access boundary and request the Wegleiter source/spec** (chosen). Honest; mirrors the M1 infra-gate pattern.
2. Assert verification findings from assumption — **rejected**: would fabricate results about a system not inspected, violating "do not simulate success" and intellectual honesty.

## Decision
Deliver the M2 **verification protocol** (checkable criteria for every scope item, grounded in the constitution) and classify each actual-state item as "Cannot verify — source not accessible." Halt at the access boundary and list exactly what is required to complete M2.

## Consequences
- M2 is prepared but **not completed**; completion requires Wegleiter ET-5.5 source or spec access.
- No number is assigned to UHAA-compatibility or integration-readiness that cannot be evidenced; both are reported as "unverifiable pending access."
- No changes made to AN ACT or Wegleiter.

## Boundary check
- Reflection/evidence separation preserved: **Yes** — verification only; nothing recorded as evidence.
- Consent crossing preserved: **Yes** — no cross-boundary flow created.
- Independent deployability: **Yes** — no coupling introduced.
- Second authority created: **No**.

## Update — M2 executed against real ET-5.5 (2026-07-07)
Source became available (workspace consolidation). The verification protocol was run against real files. **Result: all 10 areas Conformant; 0 blockers; 2 non-blocking adjustments** (see `M2-WEGLEITER-VERIFICATION-REPORT.md`). Key evidence: no network/exfiltration calls in `script.js`; local-only WebCrypto AES-GCM-256 (PBKDF2 150k) at rest; explicit "no account, no server, no upload" (script.js:869, 983–984); ET-5.5 badge (`buildId: 'Nervous Witness · ET-5.5'`, script.js:403/902). UHAA compatibility **92/100**; integration readiness **60/100** (safe preconditions met; integration hooks not yet built — future M4–M6). Terminology note: Wegleiter's "Evidence/Belege" = formula transparency, **not** accountable evidence — align vocabulary before integration.
