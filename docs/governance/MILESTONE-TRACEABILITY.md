# Milestone Traceability Map (EIP M0)

Living map linking each EIP milestone to its governing ADR(s) and the constitutional article(s) it must conform to. **M0 acceptance:** every subsequent milestone (M1–M8) has a linked ADR slot and a constitutional-article trace. A milestone may not be declared complete until its ADR(s) are Accepted and this row is filled.

| Milestone | Objective (short) | ADR(s) | Constitutional trace | Status |
|---|---|---|---|---|
| **M0** | Governance stood up | ADR-0001, ADR-0002 | Manifesto Art. VI, X; EIP §6 | **Complete (this milestone)** |
| M1 | AN ACT live on staging | ADR-0003, ADR-0009 (Accepted) | AN ACT OC-1 gates 1–3; UHAA §6 (AN ACT authority); Manifesto Art. IV, VI | Exec Step 1 run: build/runtime gates PASS live; DB/Redis/S3/host **BLOCKED on external provisioning**; E2E not run (not simulated) |
| M2 | AN ACT verified live | _tbc_ | OC-1 gates 4–5; Manifesto Art. IV (evidence/trust) | Pending |
| M3 | Wegleiter capability confirmed (executed as sequence "M2") | ADR-0004 (Accepted, verified) | HSTM S0–S4, S4→S5; Manifesto Art. II, III; UHAA §1, §3, §6 | **Complete** — verified vs real ET-5.5; all 10 areas Conformant; UHAA compat 92, integ-ready 60 |
| M4 | Identity federation | _tbc_ | UHAA §5 ch.1; authority matrix (identity = IdP) | Pending |
| M3-design | Cross-System Contract & Consent Design | ADR-0005 (Accepted) | Manifesto Art. II, III, V, VI, VIII, IX; HSTM S4→S5; UHAA §1,§3,§5,§6 | **Complete** — Boundary Contract v1; integ-ready 68 |
| M4-design | Consent Layer Engineering Specification | ADR-0006 (Accepted) | Manifesto Art. II, III, V, VI, VIII, IX; HSTM S4→S5; UHAA §3,§5,§6 | **Complete** — Consent Layer Spec v1; impl-ready 74 |
| M5-design | Human Action Identity & Home Layer | ADR-0007 (Accepted) | Manifesto Art. II, III, V, VI, IX, X; HSTM S0–S10 spiral; UHAA §1,§5,§6 | **Complete** — Home Model (Hybrid C); integ-ready 76 |
| M5 | Consent layer (Threshold) — implementation | _tbc (implements ADR-0005 + ADR-0006)_ | HSTM S4→S5; Manifesto Art. II, IX; UHAA consent gate | Pending |
| M6-design | Technical Integration Blueprint | ADR-0008 (Accepted) | Manifesto Art. II,III,V,VI,VIII,IX,X; HSTM; UHAA §5,§6; ADR-0005/6/7 | **Complete** — Blueprint v1; integ-ready 80 |
| M6 | Integration layer — implementation | _tbc (implements ADR-0008)_ | UHAA §5 ch.2–3, authority matrix; Manifesto Art. VI, VIII | Pending |
| M7 | Observability & security hardening | _tbc_ | Manifesto Art. III, VII; EIP R2/R7 | Pending |
| M8 | Guided pilot readiness | _tbc_ | OC-1 gates 6–9; EIP §5, §7 | Pending |

## Rule
Before starting a milestone, create its ADR (from `adr/ADR-template.md`), set the ADR reference here, and fill the constitutional trace. Before completing it, the ADR must be **Accepted** and the milestone's acceptance criteria (EIP §3) verified. Any deviation from a traced article requires a Tier-3 revision, not a silent change.
