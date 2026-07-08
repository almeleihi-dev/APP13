# Boundary Contract v1 — Reflection Realm ↔ Action Realm (EIP M3)

**Design only. No implementation, no code, no API/schema, no modification to Wegleiter or AN ACT.** Defines the exact, constitutionally-compliant boundary between Wegleiter (Reflection Realm) and AN ACT (Action Realm). ADR: ADR-0005.

---

## Part 1 — Vocabulary alignment (final ecosystem terminology)

M2 found "Evidence" used with opposite meanings. More collisions exist ("Contract", "Trust"). Canonical terms below are binding for all future integration docs and UI copy.

| Concept | Wegleiter term (today) | AN ACT term (today) | **Canonical ecosystem term** | Rule |
|---|---|---|---|---|
| Explanation of a symbolic metric's formula | "Evidence / Belege" | — | **Reasoning Transparency** (a.k.a. "Show reasoning") | Never called "Evidence." It is an in-realm explanation, not proof. |
| Durable proof of executed work | — | "Evidence" | **Accountable Evidence** | Only exists in the Action Realm; append-only, auditable. |
| A symbolic self-agreement | "Self Contract / Second Contract" | — | **Reflective Pact** (Self Pact / Shared Pact) | Symbolic, private, non-binding; never called "Contract." |
| A binding agreement between parties | — | "Contract" | **Accountable Contract** | Legally significant; Action Realm only. |
| Confidence/standing | (used loosely) | "Trust" (event-sourced) | **Trust** = Action-Realm earned standing only | Wegleiter uses "confidence" (ORL/S(t)) for inner signals — never "Trust." |
| The private self-record | "Nerves CV" | — | **Reflection Record** (private) | Never leaves the device except as a user-initiated local export. |
| The thing that may cross the boundary | (n/a today) | (n/a today) | **Intention Artifact** | The only content permitted to cross Reflection→Action. |

**Outcome:** no user confusion (distinct words for distinct things), no architectural ambiguity (each term maps to one realm), no authority conflict (each realm owns its own vocabulary).

## Part 2 — Consent Gate specification (the Threshold of Accountability)

- **When it appears:** only after a person has formed an intention inside Wegleiter (HSTM S4) **and** explicitly asks to carry it toward action. Never on timers, never automatically, never as a default step of reflecting.
- **What triggers it:** a single, unambiguous human action (e.g., a "Carry this into action" control). Human-initiated only.
- **What the user sees:** a plain-language disclosure — (a) exactly the minimal fields that will cross (the Intention Artifact), shown verbatim; (b) an explicit statement that everything else (reflections, Reflection Record, S(t)/ORL, Reflective Pacts, biometrics) **stays private and does not cross**; (c) a clear notice that crossing makes them **accountable** in the Action Realm; (d) **Confirm** and **Cancel**.
- **What is allowed to cross:** only the **Intention Artifact** — a minimal, purpose-built object the user assembles/approves (e.g., action category, scope, timing, location, free-text note the user chooses to include).
- **What is forbidden to cross:** all reflection content, Reasoning Transparency, symbolic metrics, S(t)/ORL values and history, the Reflection Record ("Nerves CV"), Reflective Pacts, biometric/telemetry data.
- **How consent is withdrawn before crossing:** Cancel at any point before Confirm → **safe abort**: nothing is transmitted, **no accountable record is created**, the intention remains a private local draft (or is discarded, user's choice). This is the HSTM safe-abort guarantee.

**Two invariants (non-negotiable):**
1. **Reflection must never automatically become Accountable Evidence.** Crossing is always an explicit, minimal, human act.
2. **Action evidence must never automatically rewrite reflection.** The reputation signal flowing back is advisory and read-only to the Reflection Realm; it cannot alter reflections, pacts, or metrics.

## Part 3 — Data Boundary Contract

**Private Realm (Wegleiter)**
- *Allowed data:* reflections, Reasoning Transparency, symbolic metrics, S(t)/ORL, Reflective Pacts, simulated biometrics, the Reflection Record.
- *Forbidden exports:* any automatic or background export; any transmission of the above to the Action Realm. Permitted egress is limited to (a) the user's own **local** PDF export and (b) the consented **Intention Artifact**.
- *Retention:* local, user-controlled, reversible and forgettable; deletable by the user; encrypted at rest (verified: WebCrypto AES-GCM-256).
- *Ownership:* the person. Stored on their device; no server copy.

**Public / Accountable Realm (AN ACT)**
- *Allowed data:* identity, actions/needs/offers, Accountable Contracts, milestones, Accountable Evidence, trust events, financial ledger, complaints.
- *Immutable records:* append-only and auditable; corrected only by new records/process, never silent edits.
- *Evidence rules:* Accountable Evidence is durable, attributable, and challengeable (due process).
- *Trust rules:* earned, event-sourced, never self-declared; adjustable only by adjudicated process.

**The narrow shared boundary — exactly two flows, no shared database:**
1. **Forward (Reflection→Action):** the consented **Intention Artifact** → becomes a candidate Need/Offer in AN ACT. One-directional, human-triggered, minimal.
2. **Backward (Action→Reflection):** a **coarse advisory reputation/readiness signal** → Wegleiter may read it to inform readiness. One-directional, advisory, no accountable detail.
Everything else is forbidden. No shared DB, no hidden sync.

## Part 4 — Integration interface design (responsibilities only — no APIs, no schemas)

- **Identity relationship:** a federated identity provider owns the shared human subject; Wegleiter and AN ACT each map that subject to their own local identity. Neither reads the other's profile. *Responsibility:* IdP = authoritative for "who the human is"; each system = authoritative for its own local mapping.
- **Consent artifact:** a minimal, timestamped record that a human explicitly authorized a specific crossing (what fields, when, scope). *Responsibility:* it is a **boundary record of consent**, not a new authority; AN ACT records that an Intention arrived with valid consent; Wegleiter may keep a local note. It is not reflection data and not accountable evidence.
- **Intention handoff:** *Responsibility:* Wegleiter **produces** the Intention Artifact from user-approved fields; the **human authorizes**; AN ACT **accepts and owns** it from ingestion onward as a candidate Need/Offer. Wegleiter has no authority over it after crossing.
- **Event boundaries:** asynchronous, one-way each; the forward handoff is request/response at human initiation; the backward reputation signal is a coarse advisory event. No reflection events ever leave the Private Realm.
- **Versioning:** both boundary flows are versioned, backward-compatible within a major (tolerant reader), per the EIP versioning policy; authority ownership can never change via a contract version.
- **Failure handling:** the handoff is atomic — either an accountable Need is created **with** valid consent, or **nothing** is created (no partial/orphan accountable record). If the reputation signal is unavailable, Wegleiter degrades gracefully (readiness shown without it). Each system remains fully operational if the other is down.

## Part 5 — Safety scenarios (validated against the design)

| Scenario | Behavior under this contract | Dignity check |
|---|---|---|
| **A — Reflects, never acts** | Nothing crosses; no accountable record ever exists; fully private, local, forgettable. | ✅ Freedom to remain private (Art. III, V). |
| **B — Prepares intention, cancels** | Safe abort: no transmission, no record; intention stays a private draft or is discarded. | ✅ Freedom to change one's mind; no cost (Art. II, IX). |
| **C — Crosses into AN ACT** | Explicit consent → minimal Intention Artifact → candidate Need/Offer; reflection stays private and untouched. | ✅ Human owns the crossing; minimal disclosure. |
| **D — Action fails** | Handled by AN ACT due process; **does not** rewrite or touch reflection; person may return to reflect. | ✅ Recovery preserved; failure is not a verdict (Art. VIII, V). |
| **E — Trust decreases** | Coarse advisory signal may inform readiness; **no** accountable detail enters the Private Realm; never a score of the person's worth; reflections unchanged. | ✅ Dignity never reduced to a score (Art. VI, principle 9). |
| **F — Returns to reflection** | The spiral: accountable history persists in AN ACT; the Reflection Realm is untouched and private; the person processes freely. | ✅ Recovery + privacy (Art. VIII, III). |

Human dignity is preserved in every scenario: privacy is default, crossing is chosen, failure is recoverable, and no private reflection is ever scored or exposed.

## Part 6 — Summary artifacts

### Responsibility matrix
| Concern | Authoritative | Notes |
|---|---|---|
| Who the human is (shared subject) | Federated IdP | each system maps locally |
| Reflections / metrics / S(t) / ORL / Reflection Record | **Wegleiter** | never crosses |
| The decision to cross (consent) | **The human** | recorded in a boundary Consent Artifact |
| Intention Artifact after crossing | **AN ACT** | becomes candidate Need/Offer |
| Accountable Contract / Evidence / Trust / Financial | **AN ACT** | append-only, due process |
| Reputation/readiness signal | **AN ACT** produces; **Wegleiter** reads | advisory only |

### Consent model (one line)
*Human-initiated → minimal disclosure shown → Confirm/Cancel → Confirm emits only the Intention Artifact (atomic) → Cancel leaves no trace.* Revocable until Confirm.

### Terminology map (canonical)
Reasoning Transparency (not "Evidence") · Accountable Evidence · Reflective Pact (not "Contract") · Accountable Contract · Trust (Action Realm only) · Reflection Record · Intention Artifact.

### Integration readiness score
**68 / 100** (was 60 at M2). The boundary is now fully designed and constitutionally validated; remaining points are earned by *building* identity federation (M4), the consent gate (M5), and the event boundary (M6). No numeric credit is taken for unbuilt mechanisms.

### Remaining risks
1. **Terminology drift** in future UI/code re-introduces "Evidence"/"Contract" collisions → mitigate: canonical map is binding, checked at review.
2. **Consent-gate reduced to a formality** (dark-pattern default) → mitigate: M5 acceptance requires proven safe-abort and human-initiation; no pre-checked confirm.
3. **Scope creep of the Intention Artifact** (more fields sneak across) → mitigate: minimality is a Tier-2 change requiring ADR + boundary check.
4. **Reputation signal over-read** as authority over readiness → mitigate: advisory-only by contract; never gates inner-realm state.
5. **Identity linkage leaks correlation** between realms → mitigate: IdP maps subjects; neither system reads the other's profile; privacy attestation in M7.

---

**M3 complete — design only. No implementation, no data sharing, no shared database, no hidden synchronization, no scoring of humans by private reflection.** Not starting M4. Awaiting approval.
