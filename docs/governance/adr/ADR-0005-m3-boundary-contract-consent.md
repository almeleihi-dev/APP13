# ADR-0005: Cross-System Contract & Consent Design (EIP M3)

- **Status:** Accepted
- **Date:** 2026-07-07
- **Change tier:** 2 (cross-boundary design — no code, but defines the boundary that future Tier-2 changes must honor)
- **Milestone:** M3 (Cross-System Contract & Consent Design). Design only — no implementation.
- **Constitutional trace:** Manifesto Art. II (Threshold), III (reflection privacy), V (rights), VI (singular authority), VIII (recovery/firewall), IX (human owns the crossing); HSTM S4→S5 threshold, S0–S4 privacy, spiral recovery; UHAA §1, §3, §5, §6

## Context
Both systems are verified (Wegleiter ET-5.5 M2; AN ACT OC-1). Before integration, the exact boundary contract between the Reflection Realm and the Action Realm must be designed so integration is safe, explicit, and constitutionally compliant. M2 surfaced a terminology collision ("Evidence") to resolve here.

## Decision
Adopt **Boundary Contract v1** (`M3-Boundary-Contract-v1.md`): a canonical terminology map, a human-initiated Consent Gate specification, a data-boundary contract (two narrow flows, no shared DB), an integration interface defined by responsibilities only, and six validated safety scenarios. No APIs, schemas, or code.

## Consequences
- Establishes the binding design all future integration milestones (M4 identity, M5 consent, M6 integration) must implement without deviation.
- Renames Wegleiter "Evidence" (formula transparency) to avoid collision with AN ACT accountable Evidence.
- Confirms exactly two boundary flows and forbids all others.

## Boundary check
- Reflection→evidence separation: **preserved & strengthened** — the contract forbids any automatic reflection export; only a consented, minimal Intention Artifact crosses.
- Human-owned consent crossing: **preserved** — the Threshold is triggered only by an explicit human action; revocable until crossing; safe-abort creates no record.
- Independent deployability: **preserved** — no shared database; async, one-way events; graceful degradation.
- Second authority created: **No** — reflection stays authoritative in Wegleiter; accountable data stays authoritative in AN ACT; identity is the IdP; the Consent Artifact is a boundary record, not a new authority over either realm.
