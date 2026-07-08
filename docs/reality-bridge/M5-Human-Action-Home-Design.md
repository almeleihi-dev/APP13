# Human Action Home & Identity Design (EIP M5)

**Design only. No code, no implementation, no database merge, no automatic synchronization, no hidden data sharing.** Purpose: give the human **one coherent journey** — not to combine software. Principle: **One Human. One Home. Two Independent Realms.** ADR: ADR-0007. Builds on Boundary Contract v1 (ADR-0005) and Consent Layer Spec v1 (ADR-0006).

---

## Part 1 — Human Action Home concept

The Home is a **thin shell** the human sees after login. It narrates the journey — Reflection → Choice → Action → Learning — and offers three surfaces without collapsing them:

```
┌──────────────────────── HUMAN ACTION HOME (shell only) ────────────────────────┐
│  One human · federated identity · holds NO authoritative data                   │
│                                                                                  │
│   ┌── Reflection Realm ──┐      ╎ Consent ╎      ┌── Action Realm ──┐            │
│   │  Wegleiter (private) │  →   ╎Threshold╎  →   │  AN ACT (accountable)│        │
│   │  reflect · learn     │      ╎ (M4)    ╎      │  act · evidence · trust│      │
│   └──────────────────────┘      ╎ human   ╎      └──────────────────────┘        │
│         (on-device)              ╎ owns it ╎          (server-backed)             │
└──────────────────────────────────────────────────────────────────────────────────┘
```

The Home shows *that* both realms exist and where the human currently is; it links into each; it renders the Threshold as an explicit, human-invoked step. It never displays Private-Realm content and never moves data — it is navigation and status only.

## Part 2 — Progressive human space (transitions, not gamification)

Spaces open as the human *actually* moves through HSTM states. Each opening marks a **real human transition**, is gated by genuine progress, and is **transparently explained** ("this opens when you form an intention"), never dangled as a reward.

| Space | State | Availability | Opens because (real transition) |
|---|---|---|---|
| Reflection entry | S0–S3 | **Available at first login** | The journey begins inward |
| Identity basics | — | **Available at first login** | Every human has a name/identity |
| Intention creation | S4 | Opens after meaningful reflection | A formed intention exists to carry |
| Consent crossing (Threshold) | S4→S5 | Opens only when an intention exists | There is something to consent to |
| Action history | S5+ | Opens after a first crossing | Accountable actions now exist to show |
| Trust evolution | S9 | Opens after completed, evidenced action | There is earned standing to reflect |
| Professional reputation | S10 | Opens after accumulated trust | Durable standing has genuinely formed |

Anti-manipulation rule: a not-yet-open space always states *why* and *what real step* opens it. Nothing is locked to drive engagement; it is simply not yet meaningful.

## Part 3 — Unified identity model

- **Single entry, email-based:** the human signs in once; a federated identity provider owns the shared subject.
- **Federation, not merger:** each realm maps that subject to its **own local identity**; neither reads the other's profile store.
- **Profile relationship:** identity *continuity* (same human across realms) without identity *fusion* (no combined profile record).

| Allowed | Forbidden |
|---|---|
| Shared authentication (one sign-in) | Automatically sharing reflections |
| User-controlled navigation between realms | Copying Wegleiter data into AN ACT |
| Identity continuity (same human) | Using private insights (S(t)/ORL/reflection) in trust scores |

## Part 4 — Navigation experience (models compared)

| Criterion | A: Two apps + launcher | B: One Home, two realms | **C: Hybrid (recommended)** |
|---|---|---|---|
| User understanding | Fragmented ("two products") | Highest (one journey) | High (one journey, honest seams) |
| Privacy clarity | High (obviously separate) | Risk of "feels like one system" | High (realms visibly distinct + labeled) |
| Technical independence | Highest | Risk of creeping coupling | High (independent deploys behind a shell) |
| Long-term scalability | Good | Depends on discipline | Best (shell evolves; realms scale alone) |

**Recommendation — Model C (Hybrid):** a unified **Home shell** (single identity, coherent journey, visible Threshold) over **two independently-deployed realms**. It gives Model B's one-journey clarity *and* Model A's independence, while the visible realm labels + Threshold preserve privacy clarity. The shell holds no data and can be removed without breaking either realm.

## Part 5 — R.ACT loop concept (study only — not a new product)

The post-action reflection cycle: **Reflect → Act → Review → Reflect** (the HSTM spiral).

- **Reflect** (Wegleiter, private) → **Act** (AN ACT, via the Consent Threshold) → **Review** (the human considers the accountable outcome inside AN ACT) → **Reflect** (the human *chooses* to return to Wegleiter to process what they learned).
- **Guardrails:** AN ACT evidence **does not** automatically enter Wegleiter. The "Review → Reflect" return is a **human-initiated** navigation; if the human wants to bring a lesson back, they do so manually and privately (they *write their own* reflection) — the systems never transfer evidence into reflection. The only machine signal that ever informs the Private Realm is the coarse advisory reputation signal, read-only, never raw evidence. The Consent Layer governs any forward re-crossing.

R.ACT is a description of a human habit the ecosystem *supports*, not a feature that *automates* learning.

## Part 6 — User journey map (who participates)

| Step | Reflection Realm (Wegleiter) | Consent Layer | Action Realm (AN ACT) |
|---|---|---|---|
| First login | identity + reflection entry available | — | (dormant until first crossing) |
| First reflection | **active, private, on-device** | — | — |
| First intention | forms intention (S4) | — | — |
| First consent crossing | previews minimal Intention Artifact | **human confirms; atomic crossing** | receives candidate Need/Offer |
| First action | untouched, private | — | **contract → execution** |
| First evidence | untouched | — | **Accountable Evidence recorded** |
| First reputation growth | may *read* coarse advisory signal | — | **trust event → reputation** |
| Return to reflection | **human returns by choice; writes own reflection** | (re-cross only via Threshold) | history persists, unchanged |

## Part 7 — Risks & mitigations

1. **Identity confusion** ("is this one system?") → visible realm labels; a one-time explainer; the Home shell always names which realm you're in.
2. **Privacy misunderstanding** ("does reflecting expose me?") → persistent "private, on-device, nothing leaves without your consent" affordance in the Reflection Realm; Threshold spells out what stays.
3. **Users thinking reflection affects reputation** → explicit statement that reputation derives **only** from accountable action; reflection is never an input to trust (enforced structurally + stated in UI copy).
4. **Over-gamification** → progression uses neutral, transition-based language; no points/streaks/rewards; openings describe real steps.
5. **Locked areas feeling like manipulation** → every not-yet-open space states *why* and *what real transition* opens it; nothing is gated for engagement.
6. **Navigation bypassing consent** → the only path from Reflection to Action is through the Threshold; no shortcut, no auto-cross.

## Final deliverables

- **Human Action Home Model:** thin shell; one identity; two realms + visible Threshold; holds no data (Part 1).
- **Progressive Space Design:** HSTM-transition-gated, transparent, non-gamified (Part 2).
- **Identity Boundary Model:** federated identity; continuity without fusion; allowed/forbidden table (Part 3).
- **Navigation Recommendation:** **Model C (Hybrid)** (Part 4).
- **R.ACT lifecycle:** human-initiated spiral; no automatic evidence→reflection transfer (Part 5).
- **Risk analysis:** six risks mitigated (Part 7).
- **Integration readiness score: 76 / 100** (was 74 at M4). Entry/identity/navigation are now designed and boundary-safe; remaining points are earned by building federated identity, the Home shell, and the consent gate (implementation milestones). No credit for unbuilt code.

---

**M5 complete — design only. No code, no database merge, no automatic synchronization, no hidden data sharing.** One human, one home, two independent realms. Not proceeding further. Awaiting approval.
