# Versioning Policy (EIP M0)

Governs how the ecosystem's parts are versioned. Implements EIP §6. Adds no architecture.

## Three version streams, kept separate
1. **Constitution** (Manifesto, HSTM, UHAA, EIP): versioned as `vMAJOR.MINOR` (currently v1.0). Changes **only** via an explicit architectural revision request + sign-off, recorded by a Tier-3 ADR. Frozen otherwise.
2. **Systems** (AN ACT, Wegleiter): independent Semantic Versioning (`MAJOR.MINOR.PATCH`). AN ACT baseline = OC-1. Wegleiter baseline = ET-5.5. The two version independently and remain independently deployable.
3. **Cross-boundary contracts** (consent/intention handoff; `reputation.updated` event; federated-identity claims): versioned `MAJOR.MINOR`, **backward-compatible within a MAJOR**. A breaking contract change is Tier-2 (ADR + architecture review) and must be rolled out with both versions supported during transition.

## Rules
- No system release without green CI (including AN ACT's 329-test suite on real Postgres) and `/health`=200.
- Migrations are forward-only; a mistake is corrected by a new migration, never by editing an applied one (mirrors "evidence is durable, corrected by process").
- A cross-boundary contract may not change authority ownership; authority changes are Tier-2/3 and checked against the UHAA authority matrix.
- Compatibility: consumers of a contract must tolerate unknown/optional fields (tolerant reader) so producers can evolve within a MAJOR.

## Change → tier → artifact
| Change | Tier | Required artifact |
|---|---|---|
| Internal refactor, bugfix | 1 | PR review |
| New cross-boundary contract field (compatible) | 1–2 | ADR if it touches a boundary |
| Breaking contract change / authority touch | 2 | ADR + architecture review |
| Constitution change | 3 | Revision request + sign-off + Tier-3 ADR |
