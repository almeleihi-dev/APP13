# Human State Transition Model (HSTM v1.0)

**The human journey, independent of software.** This document defines the *person's* movement from uncertainty to professional reputation. Wegleiter and AN ACT appear only as **instruments** that support different transitions — never as the subject. This is the philosophical and architectural foundation beneath every future implementation.

> Principle: software serves a human process that exists with or without it. We model the process first; instruments come second and must conform to it, not the reverse.

---

## 1. Human states (from uncertainty to reputation)

Eleven states, in two realms separated by a single membrane — the **Threshold of Accountability**.

**Inner realm — private, reversible, forgettable:**
- **S0 Uncertainty** — "I don't yet know what I want or should do."
- **S1 Awareness** — "I see my situation and my options clearly."
- **S2 Decision** — "I have chosen a direction."
- **S3 Readiness** — "I am capable and prepared to act on it."
- **S4 Intention** — "I commit, inwardly, to act." *(the last private state)*

**— Threshold of Accountability (the membrane; crossed by consent) —**

**Outer realm — public, accountable, durable:**
- **S5 Declared Action** — "I have made my intention actionable (a Need or an Offer)."
- **S6 Agreement** — "I am bound, with another, by a contract."
- **S7 Execution** — "I am doing the work."
- **S8 Evidence** — "I have produced proof of what I did."
- **S9 Trust** — "My proof has been weighed by others."
- **S10 Professional Reputation** — "I am durably known and vouched for."

## 2. Transition conditions (what allows movement)

| Transition | What must be true to move |
|---|---|
| S0→S1 Uncertainty→Awareness | Honest attention; the person stops avoiding and observes their situation. |
| S1→S2 Awareness→Decision | Options evaluated against values; a direction is chosen. |
| S2→S3 Decision→Readiness | Capability, resources, and confidence assessed as sufficient. |
| S3→S4 Readiness→Intention | An internal act of will — commitment, not yet exposed. |
| **S4→S5 Intention→Declared Action** | **Explicit human consent to become accountable.** The membrane. |
| S5→S6 Declared→Agreement | Mutual assent with a counterparty; terms accepted by both. |
| S6→S7 Agreement→Execution | Activation; obligations begin. |
| S7→S8 Execution→Evidence | Production of artifacts/attestations that demonstrate the work. |
| S8→S9 Evidence→Trust | Verification/evaluation by others; proof is weighed. |
| S9→S10 Trust→Reputation | Repetition and accumulation over time; standing becomes durable. |

## 3. Ownership — which instrument supports each transition

| Transition | Supporting instrument | Nature |
|---|---|---|
| S0→S1, S1→S2, S2→S3, S3→S4 | **Wegleiter** | Supports reflection, decision, readiness — never records for accountability. |
| **S4→S5 (the membrane)** | **The human alone** | Neither instrument owns this; consent is an act of the person. |
| S5→S6 … S9→S10 | **AN ACT** | Records accountable action, agreement, execution, evidence, trust, reputation. |
| Advisory backflow (S10 → informs S3) | AN ACT publishes a coarse standing signal; **Wegleiter may read it** to inform readiness. | Advisory only; never authority over readiness. |

The instruments touch at exactly one point, and even there the *owner of the transition is the human*, not software.

## 4. Boundaries — private vs. accountable

- **S0–S4 are private.** Reversible, forgettable, owned solely by the person. They may never be recorded as evidence, scored, or exposed. This privacy is what makes honest reflection possible.
- **S5–S10 are accountable.** Public (to relevant parties), durable, auditable. Once created, the record persists — it is the basis of trust.
- **The membrane (S4→S5) is a one-way privacy boundary.** Inner data does not cross with the intention; only what the person deliberately declares crosses. **Reflection must never become evidence; evidence must never become reflection.**

## 5. Consent — where explicit human consent must exist

1. **Primary — S4→S5 (Threshold of Accountability):** mandatory, explicit, revocable-until-crossed. Becoming accountable is a choice, never a default or an automatic consequence of reflecting.
2. **Mutual — S5→S6 (Agreement):** both parties consent to be bound; a contract requires two willing wills.
3. **Disclosure — S8 (Evidence):** the person consents to *what* proof is shared and *with whom*.
4. **Publication — S9→S10 (Reputation):** consent to how standing is surfaced (and any advisory backflow into readiness).

Everywhere else in the inner realm, movement is internal and needs no consent — the person is sovereign over their own reflection.

## 6. Failure paths — interruption and reversal

**Inner realm (S0–S4): failure is free and expected.**
- *Interrupted:* pause; resume anytime; nothing is lost or held against the person.
- *Reversed:* "I changed my mind" is a healthy outcome, not a failure. No residue, no penalty, forgettable. Regression S4→S3→S1 is normal.

**The membrane (S4→S5): the safe abort.**
- Consent withheld or withdrawn *before* crossing → the person returns to Intention/Readiness. **No accountable record is created.** This is the system's most important safety property: you can always decline to become accountable, without cost.

**Outer realm (S5–S10): failure has consequences, handled by due process — never silent erasure.**
- *S5→S6 fails to form:* no obligation existed; the declared Need/Offer lapses or is withdrawn; **no trust penalty.**
- *S7 Execution interrupted:* the agreement enters a paused/disputed condition; a complaint may open; any trust impact follows due process, not reflex.
- *S8 Evidence disputed:* adjudication weighs it; trust adjusts up or down per outcome.
- *Reversal in the outer realm does not erase history.* The accountable record is durable by design. The person may re-enter the **inner realm** to process the experience (Wegleiter), but the accountable facts persist (AN ACT). Recovery is re-reflection, not deletion.

**Cross-realm recovery loop:** a hard accountable outcome (a failed contract, an upheld complaint) can send a person back to S0/S1 to reflect and grow — then forward again with better readiness. The lifecycle is a spiral, not a one-way line.

## 7. The complete Human Action Lifecycle

### Human State Map

```
        INNER REALM (private · reversible · forgettable)          ║   OUTER REALM (public · accountable · durable)
  ┌──────────────────────────────────────────────────────────┐   ║   ┌──────────────────────────────────────────────────────┐
  │ S0 Uncertainty → S1 Awareness → S2 Decision →              │   ║   │ S5 Declared Action → S6 Agreement → S7 Execution →     │
  │ S3 Readiness → S4 Intention                                │   ║   │ S8 Evidence → S9 Trust → S10 Professional Reputation   │
  └──────────────────────────────────────────────────────────┘   ║   └──────────────────────────────────────────────────────┘
                 supported by  WEGLEITER                          ║              supported by  AN ACT
                                                    ▲             ║
                                        THRESHOLD OF ACCOUNTABILITY (S4→S5)
                                        crossed only by EXPLICIT HUMAN CONSENT
```

### Transition Diagram (with consent ✋, privacy 🔒, durability 📜, recovery ↩)

```
🔒 S0 ──attention──► S1 ──evaluation──► S2 ──capability──► S3 ──commitment──► S4
        (free reversal anywhere in S0–S4; forgettable)                        │
                                                             ✋ CONSENT (safe abort → back to S4/S3, no record)
                                                                              ▼
📜 S5 ──mutual assent✋──► S6 ──activation──► S7 ──proof──► S8 ──verification✋──► S9 ──accumulation✋──► S10
        (failures handled by due process; record durable)                                              │
        ↩ hard outcome can return the person to 🔒 S0/S1 to reflect, then forward again (spiral)  ◄────┘
   (advisory: S10 standing may inform 🔒 S3 readiness — advisory only, never authority)
```

### State Definitions (essence · realm · reversibility · what it is *not*)

- **S0 Uncertainty** — unformed direction. Private, fully reversible. *Not* failure; the honest starting point.
- **S1 Awareness** — clear sight of situation/options. Private, reversible. *Not* commitment.
- **S2 Decision** — a chosen direction. Private, reversible. *Not* obligation.
- **S3 Readiness** — prepared and capable. Private, reversible. *Not* a promise to anyone.
- **S4 Intention** — inward commitment. Private, reversible until the membrane. *Not yet* accountable.
- **S5 Declared Action** — intention made actionable to others. Accountable, durable. *Not* a binding agreement yet.
- **S6 Agreement** — bound with a counterparty. Accountable, durable, mutual. *Not* yet performed.
- **S7 Execution** — the work in progress. Accountable. *Not* self-asserted completion.
- **S8 Evidence** — proof produced. Accountable, durable. *Not* self-declared trust.
- **S9 Trust** — proof weighed by others. Accountable, earned. *Not* self-awarded.
- **S10 Professional Reputation** — durable, accumulated standing. Accountable, public. *Not* a claim — a record.

### Responsibility Matrix

| State / Transition | Realm | Owner of the move | Instrument | Consent | Reversibility |
|---|---|---|---|---|---|
| S0–S4 and their transitions | Inner | The person | Wegleiter (support) | none needed | free, forgettable |
| S4→S5 (Threshold) | Membrane | **The person alone** | neither | **explicit, mandatory** | reversible until crossed; safe abort |
| S5→S6 | Outer | Person + counterparty | AN ACT | mutual | lapses without penalty pre-agreement |
| S6→S7→S8 | Outer | Person (+ parties) | AN ACT | disclosure at S8 | durable; due process on failure |
| S8→S9→S10 | Outer | Others weigh; person accrues | AN ACT | verification/publication | durable; adjustable by adjudication |
| S10 → informs S3 | Cross | The person | AN ACT publishes; Wegleiter reads | opt-in | advisory only |

### Unified Narrative

A human life of work moves through two realms. In the **inner realm**, a person emerges from uncertainty into awareness, chooses, prepares, and commits — privately, reversibly, safely. Nothing here should ever be measured or held against them; the freedom to be uncertain and to change one's mind is precisely what makes genuine readiness possible. In the **outer realm**, the same person declares an action, binds with another, does the work, shows proof, has that proof weighed, and — over time — becomes durably known. Here nothing should be erasable at will; the permanence of the record is precisely what makes trust worth anything.

Between these realms lies a single membrane: the **Threshold of Accountability**. It is crossed exactly once per action, in one direction, and — this is the heart of the model — **only by the person's explicit consent.** No instrument may drag a human across it; no reflection may leak across it as evidence; no evidence may leak back across it as surveillance. The dignity of the whole system rests on the fact that becoming accountable is a chosen act, and declining to is always safe and free.

Wegleiter and AN ACT are not the journey. They are instruments held at different stages of one human process: Wegleiter tends the inner realm and helps a person arrive at good, owned intentions; AN ACT tends the outer realm and turns declared intentions into evidenced, trusted, reputational reality. Their separation is not a technical convenience — it is a faithful reflection of a real boundary in human life between *deciding who to be* and *proving what you did*. Any future implementation must serve this lifecycle, protect its membrane, honor its consent points, and treat its failure paths — including the spiral back to reflection — as first-class, dignified parts of being human.

---

*Conceptual study only. No code, APIs, implementation, redesign, or new features. This model is the foundation to which future architecture and implementation must conform. Awaiting approval.*
