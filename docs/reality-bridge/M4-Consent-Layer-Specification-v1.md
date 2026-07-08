# Consent Layer Specification v1 (EIP M4)

**Design only. No implementation, no code, no APIs, no schemas, no modification to either system.** The Consent Layer is the **only** approved bridge between the Private Reflection Realm (Wegleiter) and the Accountable Action Realm (AN ACT). It exists to **protect human choice, not automate it.** ADR: ADR-0006. Builds on Boundary Contract v1 (ADR-0005).

---

## Part 1 — Consent lifecycle

Six stages. At every stage: the human can stop, and nothing accountable exists until Crossing completes.

| Stage | Human control | System responsibility | Allowed | Forbidden |
|---|---|---|---|---|
| **1. Before Consent** | Human reflects freely; may form an intention | Wegleiter holds everything privately; offers (but never pushes) the option to carry an intention forward | Assemble a private draft intention | Any transmission; any prompt that nudges toward crossing |
| **2. Consent Request** | Human explicitly invokes "carry into action" | Present the Threshold; compute the exact minimal fields that would cross | Show the precise Intention Artifact preview | Pre-filling extra fields; auto-advancing; timers |
| **3. Review** | Human inspects exactly what will/won't move | Display in plain language: what moves, what stays, what becomes accountable | Human edits/reduces fields; asks to see reasoning | Adding fields the human didn't approve; hiding any field |
| **4. Confirmation** | Human gives a fresh, explicit confirm (or cancels) | Capture an unambiguous, non-default confirmation bound to this specific intention | Confirm **or** Cancel | Pre-checked confirm; "confirm" as default; bundled consent |
| **5. Crossing** | (Point of no-return begins) | Atomically emit only the Intention Artifact + Consent Artifact to AN ACT | Create the candidate Need/Offer **with** valid consent | Partial writes; sending anything beyond the approved artifact |
| **6. Post-Crossing** | Human is now accountable in the Action Realm; reflection remains private | AN ACT owns the Need/Offer; Wegleiter retains only a local note | Proceed in AN ACT; return to reflect anytime | Any write-back into the Private Realm; any reflection export |

**Invariant:** accountability begins only at successful completion of Stage 5. Everything before is private and reversible.

## Part 2 — Consent Artifact (conceptual)

A minimal boundary record proving a human authorized a specific crossing.

**MUST contain:** a consent identifier; consent timestamp; an explicit human-confirmation marker (proof it was a deliberate act, not a default); a reference/opaque handle to the **Intention Artifact** (not its reflective origin); the enumerated **categories of fields** that crossed; the destination system (AN ACT); the boundary-contract + consent-layer **version**; and a validity marker (consent is fresh and single-use for this crossing).

**MUST NOT contain:** private reflections; fears; emotional analysis; S(t); ORL; behavioral patterns; symbolic metrics; the Reflection Record ("Nerves CV"); any Wegleiter internal state; any Reasoning Transparency content. The artifact records *that* consent happened and *what categories* crossed — never *why* the human reflected as they did.

## Part 3 — User-experience principles (principles only)

**The human must understand, before crossing:**
1. **What will move** — the exact Intention Artifact fields, shown verbatim.
2. **What will not move** — reflections, metrics, S(t)/ORL, Reflection Record, pacts, biometrics stay private.
3. **What becomes accountable** — the crossing creates a real, durable, challengeable record in the Action Realm.
4. **What remains private** — the entire Reflection Realm is untouched and stays on-device.

**Required qualities:** plain, non-clinical, bilingual-capable language; symmetric, equally-weighted **Confirm** and **Cancel**; an explicit accountability acknowledgment the human actively makes.

**Forbidden (anti-dark-pattern):** pre-checked or default-Confirm; hidden or bundled consent; automatic approval or auto-advance; countdowns/urgency; confusing or coercive wording; burying "what stays private."

## Part 4 — Failure & recovery

| Case | Behavior | Guarantee |
|---|---|---|
| **A — Cancel before crossing** | Immediate safe abort; intention stays a private draft or is discarded | No record; no transfer |
| **B — Connection fails during crossing** | Treated as *not crossed*; no candidate Need/Offer created; human re-initiates cleanly | **No partial accountability**; atomic all-or-nothing |
| **C — AN ACT unavailable** | Threshold declines gracefully ("action realm unavailable, try later"); reflection unaffected | Independent degradation; nothing queued silently |
| **D — Regret before accountability starts** | Before Stage 5 completes, withdrawal is absolute and costless | Safe-abort (HSTM); no residue |
| **E — Consent record dispute** | The Consent Artifact (timestamp, confirmation marker, categories, version) is the neutral evidence of *what was authorized*; handled by AN ACT due process; reflection is never introduced | **No data ambiguity**; reflection never enters a dispute |
| **F — System/version change** | Versioned, backward-compatible within a major; a crossing uses one pinned version end-to-end; incompatible versions block the crossing rather than guess | No silent transfer; no ambiguous interpretation |

Across all: **no partial accountability, no silent transfer, no data ambiguity.**

## Part 5 — Security & privacy model

- **Consent verification:** each crossing requires a *fresh*, human-present confirmation bound (nonce/one-time) to the specific Intention Artifact; stale or replayed consent is rejected.
- **Audit requirements:** record the consent event **in the Action Realm only** (consent id, timestamp, categories, version). Never audit-log reflection content anywhere.
- **Minimum logging:** log the fact and metadata of a crossing; **never** log the intention's free-text beyond what the human approved to cross, and **never** any Private-Realm data.
- **Data minimization:** only user-approved Intention Artifact fields cross; the Consent Artifact holds categories, not content; default-deny on everything else.
- **Retention principles:** Private Realm data stays local, reversible, forgettable (user-deletable). Accountable records are durable/append-only. The Consent Artifact is retained with the accountable record (it *is* accountable metadata), not in the Private Realm.
- **User rights (Manifesto Art. V):** to remain private; to consent explicitly; to know what crosses (transparency); to withdraw before crossing; to challenge the Consent/accountable record via due process; to recover (return to reflection) after failure.
- **Compliance:** aligns with Manifesto (Art. II, III, V, VI, VIII, IX), HSTM (S4→S5, safe-abort, spiral), and UHAA Model F (consent-gated, event-driven, shared-identity; no shared DB).

## Part 6 — Future implementation blueprint (architecture only)

- **Responsibilities:** Wegleiter *assembles & previews* the Intention Artifact from user-approved fields; the *human authorizes*; the Consent Layer *verifies freshness/binding and performs the atomic crossing*; AN ACT *validates consent, then owns* the resulting candidate Need/Offer.
- **Boundaries:** one forward, human-initiated crossing; no back-channel into the Private Realm; the advisory reputation signal is a separate read-only channel outside the Consent Layer.
- **Required interfaces (as responsibilities, not APIs):** a "present Threshold / preview artifact" responsibility (Wegleiter side); a "capture explicit confirmation" responsibility (Consent Layer); an "accept-with-valid-consent or reject" responsibility (AN ACT side).
- **Validation rules:** minimality (only approved categories), freshness (single-use consent), atomicity (all-or-nothing), version-pinning (one version end-to-end), default-deny (anything unspecified does not cross).

## Final report

### Lifecycle diagram
```
[Before Consent]  private, reversible ─ nothing leaves
      │ human invokes "carry into action"
[Consent Request] ─ minimal Intention Artifact computed & shown
      │
[Review] ─ what moves / what stays / what becomes accountable   ◄─ human may edit-down or Cancel
      │
[Confirmation] ─ fresh, explicit, non-default  ── Cancel ─► SAFE ABORT (no record)
      │ Confirm
[Crossing] ─ ATOMIC: emit Intention + Consent Artifact only ── fail ─► NOT CROSSED (no partial record)
      │ success
[Post-Crossing] ─ AN ACT owns Need/Offer · reflection untouched · human may return to reflect (spiral)
```

### Responsibility matrix
| Concern | Owner |
|---|---|
| Deciding to cross | **The human** (fresh explicit confirm) |
| Assembling/previewing the Intention Artifact | **Wegleiter** |
| Verifying freshness/binding & atomic crossing | **Consent Layer** (boundary) |
| Accepting with valid consent, owning the Need/Offer | **AN ACT** |
| Storing the Consent Artifact (accountable metadata) | **AN ACT** |
| Keeping the Private Realm private | **Wegleiter** |

### Risk analysis
1. Consent reduced to a formality (dark pattern) → symmetric Confirm/Cancel, no defaults; M5 acceptance requires proven safe-abort.
2. Intention-Artifact scope creep → minimality is Tier-2 (ADR + boundary check).
3. Replay/stale consent → freshness nonce, single-use binding.
4. Partial crossing on failure → atomic all-or-nothing; failure = not crossed.
5. Version mismatch → version-pin per crossing; block rather than guess.
6. Reflection leaking into audit/dispute → audit stores categories only; reflection never enters a dispute.

### Implementation readiness score
**74 / 100** (was 68 at M3). The consent layer is now fully specified — lifecycle, artifact, UX principles, failure/recovery, security/privacy, and validation rules. Remaining points are earned only by *building* it (M5) and the surrounding identity/event work (M4-federation/M6). No credit taken for unbuilt code.

---

**M4 complete — design only. No implementation, no shared database, no automatic synchronization, no reflection scoring, no hidden transfer. The Consent Layer protects human choice; it does not automate it.** Not starting M5. Awaiting approval.
