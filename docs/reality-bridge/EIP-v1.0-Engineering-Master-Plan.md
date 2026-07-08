# Engineering & Integration Program (EIP v1.0)

**Chief Systems Architect's roadmap.** Planning only — no implementation. Every item conforms to the frozen foundation (Wegleiter ET-5.5, AN ACT OC-1, UHAA v1.0, HSTM v1.0, Human Action Manifesto v1.0). Nothing here revises those documents; where reality forces a choice against them, the answer is an explicit architectural revision request, not a silent deviation.

> Grounding facts (verified). AN ACT is **code-operational but infrastructure-blocked** (needs provisioned PostgreSQL + Redis + S3, a deployed backend, one green live end-to-end run, and the 329-test suite passing on real Postgres). Wegleiter's internals were **not available**; this plan treats "Wegleiter Stabilization" as verification-first work whose scope must be confirmed against its real system before estimates harden. Complexity is relative (S/M/L/XL), not a time promise.

---

## 1. Engineering Master Plan — programs

Adopting the proposed A–I with two refinements: a program **0** (Foundation Conformance) that keeps all work provably aligned to the frozen constitution, and folding "AN ACT Operational Completion" tightly to the OC-1 gate list so it stays concrete.

- **Program 0 — Foundation Conformance & Architecture Governance.** Traceability from every task to a constitutional article; the review/versioning/decision-record machinery (see §6). Runs for the life of the program.
- **Program A — Wegleiter Stabilization.** Verify Wegleiter's real architecture against the assumptions in UHAA/HSTM; confirm it can (a) hold reflection privately, (b) emit a *consented intention* at the Threshold, (c) consume a coarse reputation signal. Produce a Wegleiter capability report. **No AN ACT dependency.**
- **Program B — AN ACT Operational Completion.** Close the OC-1 infrastructure gates: provision Postgres/Redis/S3, run migrations to 020, deploy the backend, green the live E2E loop, pass the 329-test suite in CI, wire real secrets. This is the concrete critical path.
- **Program C — Identity Federation.** One human identity across both systems via a standards-based IdP (UHAA §5 channel 1). SSO only first; claims later.
- **Program D — Consent Layer.** The Threshold-of-Accountability mechanism (HSTM S4→S5): a human-initiated, minimal, revocable-until-crossed intention handoff. Governs the one forward cross-boundary flow.
- **Program E — Integration Layer.** The two narrow contracts: consented intention handoff (Wegleiter→AN ACT) and coarse `reputation.updated` event (AN ACT→Wegleiter), over a message bus; plus the composed Passport read-model. No shared database.
- **Program F — Observability & Monitoring.** Health/readiness telemetry, structured-log aggregation, metrics, alerting, and cross-boundary audit trails.
- **Program G — Security & Privacy.** The two-way firewall enforcement (reflection≠evidence), secrets management, threat modeling, privacy attestations, data-retention/erasure policy per realm.
- **Program H — Infrastructure & Deployment.** Hosting per the ET-2.5 decision brief (pilot: Railway/Fly; scale: AWS), CI/CD, backups/DR, environments (dev/staging/prod).
- **Program I — Pilot Operations.** Runbooks, guided-pilot onboarding, support/escalation, feedback capture, rollback drills.

## 2. Dependency map

```
Program 0 (governance) ───────────── spans all programs ─────────────────────────►

           ┌── B AN ACT Operational Completion ──┐
 (start)   │   (CRITICAL PATH)                   │
   ├───────┤                                     ├── E Integration ── I Pilot Ops
   │       └── H Infrastructure/Deploy ──────────┘        │
   │            (enables B)                               │
   ├── A Wegleiter Stabilization ──────────► C Identity ──┤
   │        (parallel, no AN ACT dep)          Federation │
   │                                                │     │
   └── G Security & Privacy ─────► D Consent Layer ─┘     │
                                     (needs A + C)         │
        F Observability ── parallel; must precede I ───────┘
```

- **Critical path:** H → B → E → I. AN ACT cannot integrate or pilot until it is actually deployed and green (B), which requires infrastructure (H).
- **Parallelizable now:** A (Wegleiter verification), G (security/privacy design, threat model), F (observability design), and the design portions of C/D — none block on B.
- **Convergence points:** C (Identity) needs A's capability report; D (Consent) needs A + C; E (Integration) needs B + C + D; I (Pilot) needs B + E + F + I-runbooks.
- **Hard rule:** E must not begin wiring until B has produced one green live E2E run — integrating into an unproven system compounds risk.

## 3. Milestones

Each milestone: Objective · Outcome · Acceptance · Dependencies · Complexity · Risk.

**M0 — Governance stood up (Program 0).**
Objective: make conformance and change-control operational. Outcome: ADR log, architecture-review cadence, versioning policy live. Acceptance: every subsequent milestone has a linked ADR and a constitutional-article trace. Deps: none. Complexity: S. Risk: Low.

**M1 — AN ACT live on staging (Program H+B).**
Objective: close OC-1 infra gates on staging. Outcome: Postgres/Redis/S3 provisioned; migrations at 020; backend deployed; `/health`=200 both deps up. Acceptance: OC-1 gates 1–3 met; `\dn` shows all schemas. Deps: M0. Complexity: M. Risk: Med (external provisioning).

**M2 — AN ACT verified live (Program B).**
Objective: prove the real loop and test suite. Outcome: `e2e-reality-loop.sh` green on staging; 329-test suite green against real Postgres in CI. Acceptance: OC-1 gates 4–5 met; documented run outputs. Deps: M1. Complexity: M. Risk: Med (first live run may surface latent issues).

**M3 — Wegleiter capability confirmed (Program A).**
Objective: validate Wegleiter against UHAA/HSTM assumptions. Outcome: capability report (private reflection ✓, can emit consented intention ✓, can consume reputation signal ✓) or a gap list. Acceptance: signed report; any gaps raised as ADRs. Deps: M0. Complexity: M (unknown until inspected). Risk: **High** (biggest unknown in the program).

**M4 — Identity federation (Program C).**
Objective: one human, two mapped local identities. Outcome: SSO across both systems; neither reads the other's profile. Acceptance: a user logs into both via one identity; no shared user store. Deps: M3. Complexity: M. Risk: Med.

**M5 — Consent layer (Program D).**
Objective: implement the Threshold as a human-initiated, minimal, revocable handoff. Outcome: intention → Need/Offer only on explicit consent; safe-abort proven. Acceptance: no accountable record is created when consent is withheld/withdrawn; only the minimal object crosses. Deps: M2 + M4 + G's firewall design. Complexity: M. Risk: **High** (this is the constitutional heart; correctness is non-negotiable).

**M6 — Integration layer (Program E).**
Objective: wire the two narrow contracts + composed Passport. Outcome: reputation events flow AN ACT→Wegleiter (advisory); Passport composed from two owned read-models. Acceptance: no shared DB; each half labeled/owned; degrades independently if one side is down. Deps: M5. Complexity: L. Risk: Med.

**M7 — Observability & security hardening (Programs F+G).**
Objective: production monitoring + privacy attestation. Outcome: metrics/alerts on `/health`, 5xx, shutdown-timeout, cross-boundary audit; boundary-audit passes (no reflection→evidence leakage). Acceptance: alerting live; privacy firewall attested; secrets in a manager. Deps: M2 (obs), M5 (privacy audit). Complexity: M. Risk: Med.

**M8 — Guided pilot readiness (Program I).**
Objective: everything needed to admit real pilot users. Outcome: runbooks, onboarding, rollback drills, backups + tested restore. Acceptance: OC-1 gates 6–9 met; rollback rehearsed; DoD (§7) satisfied for pilot scope. Deps: M6 + M7. Complexity: M. Risk: Med.

## 4. Risk register

| # | Risk | Domain | Likelihood | Impact | Mitigation |
|---|---|---|---|---|---|
| R1 | Wegleiter's real architecture differs from UHAA/HSTM assumptions | Identity/Integration | **High** | High | M3 verification *first*; treat gaps as ADR-driven revisions before C/D/E |
| R2 | Reflection data leaks into accountable records | Privacy | Med | **Critical** | Default-deny firewall (G); minimal consented object only; boundary audits (M7); Manifesto Art. III/VIII |
| R3 | First live E2E surfaces latent core bugs | Reliability | Med | High | Stage before pilot (M2); 329-test suite on real PG; pre-deploy snapshots |
| R4 | Conflicting authority creep (esp. Passport) | Data consistency | Med | High | UHAA authority matrix; Passport as composed read-models; ADR gate on any authority change |
| R5 | External provisioning delays/cost | Deployment | Med | Med | ET-2.5 brief pre-selected hosts; portable Docker+migrations hedge |
| R6 | Consent gate implemented as a data pipe (auto-cross) | Human factors/Ethics | Low | **Critical** | M5 acceptance requires proven safe-abort; human-initiated only; Manifesto Art. II/IX |
| R7 | Secret mismanagement (dev defaults reaching prod) | Security | Low | High | Prod config guard already refuses dev defaults (verified); secrets manager (G/H) |
| R8 | Eventual-consistency of reputation signal misread as authority | Data consistency | Med | Med | Signal is advisory-only by contract; never gates accountable decisions |
| R9 | Scaling beyond pilot host ceilings | Scalability | Low (pilot) | Med | AWS migration path is a re-point, not a rewrite (ET-2.5) |
| R10 | Over-integration (building E/F fully before B is proven) | Program | Med | High | Hard rule: E waits on M2; phased UHAA roadmap; DoD gates |

## 5. Pilot strategy

- **Scope:** the full accountable loop in AN ACT (register → passport → need/offer → match → contract → execution → evidence → trust) with **identity federation and, optionally, the consent handoff from Wegleiter**. Payments **out of scope** for the first pilot (financial ledger internal only). Reputation backflow advisory only.
- **Size:** small and guided — ~**5–15 providers, 20–50 customers**, single region, one backend instance, concurrency-capped (per OC-1 recommendation).
- **Success criteria:** ≥1 complete real loop per participant type end-to-end; `/health` 200 sustained; zero privacy-boundary violations; zero conflicting-authority incidents; all adverse outcomes handled by due process; qualitative: participants understood and controlled the consent crossing.
- **Operational metrics:** loop completion rate, p95 API latency, 5xx rate, DB/Redis health uptime, evidence upload success, trust-event correctness, incident count + MTTR.
- **Rollback strategy:** stateless backend → redeploy previous image instantly; DB → restore pre-deploy `pg_dump`/PITR; migrations forward-only (new migration to fix, never edit applied); Redis loss → users re-auth (no data loss); feature-flag the consent handoff so integration can be disabled without taking AN ACT down.

## 6. Engineering governance

- **Architecture review:** any change touching a boundary (identity, consent, the firewall, authority matrix, evidence durability) requires an architecture review against the frozen documents before merge. Reviews reference the specific constitutional article affected.
- **Versioning policy:** semantic versioning per system; the constitution (UHAA/HSTM/Manifesto) is versioned separately and changed **only** via an explicit "architectural revision request." Cross-boundary contracts (intention handoff, reputation event) are versioned and backward-compatible within a major.
- **Change approval:** three tiers — (1) internal to one system, standard PR review; (2) cross-boundary contract change, architecture review + ADR; (3) constitutional change, explicit revision request + sign-off. No tier-2/3 change ships without an ADR.
- **Technical Decision Records (ADRs):** every significant/boundary decision recorded (context, options, decision, consequences, article traced). ADR log is the project's memory.
- **Release strategy:** trunk-based with staging→prod promotion; migrations gated behind pre-deploy snapshot; blue/green or rolling for the stateless backend; the consent/integration features behind flags; no prod release without green CI (incl. the 329 tests) and `/health`=200.

## 7. Definition of Done — "Production Ready v1.0"

Objective gates; all must hold before public (beyond-guided-pilot) launch.

1. **Infra:** Postgres + Redis + S3 provisioned in prod; real secrets set; production config guard passes.
2. **Migrations:** `020` applied in prod; schema verification (`\dn`) clean; documented rollback.
3. **Backend live:** `GET /health`=200 with DB+Redis `up`; `/health/live` wired to orchestrator; graceful shutdown verified.
4. **Verified loop:** `e2e-reality-loop.sh` green on prod-like staging with real data.
5. **Tests:** 329-test suite green against real Postgres in CI; CI blocks merge on failure.
6. **Frontend:** built with prod `VITE_API_BASE_URL`, `VITE_SHOW_DEVELOPER_SURFACES=false`; CORS confirmed for the SPA origin.
7. **Identity:** federated SSO working across both systems; no shared user store.
8. **Consent:** Threshold handoff human-initiated, minimal, revocable; **safe-abort proven** (no record on withheld consent).
9. **Privacy firewall:** boundary audit passes — no reflection→evidence or evidence→reflection leakage; privacy attestation signed.
10. **Authority:** UHAA authority matrix holds; no concern has two owners; Passport is composed read-models.
11. **Observability:** metrics + alerting live on health, 5xx, latency, shutdown; cross-boundary audit trail retained.
12. **Backups/DR:** automated DB backups + a **tested restore**; S3 versioning on; rollback rehearsed.
13. **Governance:** every boundary decision has an ADR; constitution unmodified (or revisions explicitly approved).
14. **Payments:** explicit decision recorded — processor integrated **or** scope formally excludes money movement.
15. **Constitutional conformance:** each of the 10 Constitutional Articles has a passing conformance check.

When all fifteen hold, the ecosystem is **Production Ready v1.0**. Until then, operation is limited to the guided pilot at the scope in §5.

---

*Engineering plan only — no implementation code, no architecture redesign, no new products, no change to the philosophical foundation. Awaiting approval before any implementation begins.*
