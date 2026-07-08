# ADR-0006: Consent Layer Engineering Specification (EIP M4)

- **Status:** Accepted
- **Date:** 2026-07-07
- **Change tier:** 2 (cross-boundary design; no code)
- **Milestone:** M4 (Consent Layer Engineering Specification). Design only.
- **Constitutional trace:** Manifesto Art. II (Threshold), III (reflection privacy), V (rights: consent, transparency, recovery), VI (singular authority), VIII (recovery), IX (human owns the crossing); HSTM S4→S5 (threshold, safe-abort), spiral recovery; UHAA §3 (data boundaries), §5 (Model F consent gate), §6 (authority)
- **Depends on:** ADR-0005 (Boundary Contract v1)

## Context
Boundary Contract v1 established *that* only a consented Intention Artifact may cross. M4 specifies *how the Consent Layer protects that crossing* — its lifecycle, the Consent Artifact, UX principles, failure/recovery, and the security/privacy model — as an engineering design, not an implementation.

## Decision
Adopt **Consent Layer Specification v1** (`M4-Consent-Layer-Specification-v1.md`). The Consent Layer is the sole bridge between realms; it exists to **protect human choice, not automate it**. It introduces no shared database, no automatic synchronization, no reflection scoring, and no hidden transfer.

## Consequences
- Defines the binding design that a future M5 implementation must follow.
- Confirms the Consent Artifact carries no reflection-derived data.
- Establishes anti-dark-pattern UX principles and atomic, no-partial-accountability failure handling.

## Boundary compliance check
- **Reflection never becomes evidence:** the Consent Artifact and the crossing carry only the user-assembled Intention Artifact; reflection/metrics/S(t)/ORL/Reflection Record are structurally excluded. ✅
- **Evidence never rewrites reflection:** nothing flows back through the Consent Layer into the Private Realm; the advisory reputation signal is a separate, read-only channel. ✅
- **Human owns the crossing:** every crossing requires a fresh, explicit human confirmation; revocable until the moment of crossing; safe-abort leaves no record. ✅
- **Independently deployable:** the Consent Layer is a boundary responsibility, not a shared component; both systems run and degrade independently. ✅
- **Second authority created:** No — consent is the human's; the artifact is a boundary record, not an authority over either realm.
