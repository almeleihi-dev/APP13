# AN ACT — Module Boundary Manifest (Reality Bridge ET-1)

**Purpose:** Draw one clear, evidence-based boundary across the ~180 `src/` modules so future work builds on what is real. **Nothing is deleted.** Every module keeps its place; this manifest only assigns each to one of three layers and states the rule used.

## Classification rule (objective)

- **A — Core Engine:** contains real persistence (SQL against the PostgreSQL schema) OR is required cross-cutting infrastructure (auth, platform, shared, api, bootstrap). This is the source of truth.
- **B — Experience Layer:** exposes HTTP routes/views that are *composed from Core Engine services* (reads real data, adds presentation/journey shaping). Legitimate product surface, but holds no authority of its own.
- **C — Simulation Layer:** computes deterministic, in-memory output with no persistence and no dependency the product needs at runtime — self-assessment, readiness scoring, demos, investor/executive presentation, and the deterministic `*-intelligence` heuristics. Valuable as scaffolding/demo; must never be mistaken for capability.

---

## A — Core Engine (source of truth)

Modules with real SQL persistence or mandatory infrastructure:

`identity`, `action`, `contract`, `execution`, `complaint`, `financial`, `trust`, `platform`, `security`, `shared`, `api`, `bootstrap`, plus the DB-backed service modules `provider-experience`, `provider-workspace`, `request-experience`, `conversion`, `discovery`, `notifications`, `operations`, `analytics`, and `customer-experience`.

Evidence: these are the ~36 files in the repo containing `INSERT INTO` / `FROM` / `UPDATE`. Database schema: `identity.*`, `action.*`, `contract.*`, `execution.*`, `complaint.*`, `financial.*` (double-entry ledger + escrow), `trust.*` (event-sourced scoring), `platform.*` (outbox, audit, idempotency).

**Rule going forward:** all authoritative reads/writes for identity, actions, contracts, evidence, trust, and money go through this layer only.

---

## B — Experience Layer (real data, presentation only)

Routes/services that compose Core Engine data into journeys and views. Representative members:

- `experience/professional-passport` — composes provider profile + trust profile + trust history (all Core) into the passport view. **This is the authoritative passport surface the Reality Bridge now connects the frontend to.**
- `experience/trust-reputation`, `experience/request-match`, `experience/contract-journey`, `experience/action-economy`, `experience/discovery-matching`, `experience/escrow-payment` — read Core services.
- Runtime journey transport consumed by the web app: `runtime-experience/{need,action,contract,profile}`, `home`, `live-frame`, `living-onboarding`.

**Rule going forward:** Experience modules may read Core services and shape output. They must not become a second source of truth (no parallel persistence, no localStorage authority on the client).

---

## C — Simulation Layer (deterministic / demo / self-assessment)

Keep, but quarantine behind the developer-surface flag (`SHOW_DEVELOPER_SURFACES`) — never on the public production path.

- **Readiness / self-grading:** `experience/{production-readiness, release-readiness, security-readiness, executive-ux-readiness, operator-onboarding-readiness, operator-experience-integrity, post-launch-monitoring, launch-control, launch-simulation, mission-control, platform-control-tower, investor-readiness, government-partnership}`, and the `runtime-experience/runtime-*readiness/*authority/*approval` family.
- **Executive / investor presentation:** `executive-intelligence-center`, `ai-executive-advisory-experience`, `ai-executive-intelligence-experience`, `runtime-executive*`, `runtime-demo`.
- **Deterministic `*-intelligence` (28 modules):** `trust-intelligence`, `contract-intelligence`, `tekrr-intelligence`, `decision-intelligence`, `prediction-intelligence`, `recommendation-intelligence`, `strategy-intelligence`, `optimization-intelligence`, `orchestration-intelligence`, `learning-intelligence`, `insight-intelligence`, `evolution-intelligence`, `outcome-intelligence`, `intelligent-pricing`, `intelligent-commission`, `dynamic-pricing`, etc. These are rule/weight libraries and validators — competent deterministic logic, **not AI/ML, no persistence.**
- **`living-experience/*` motivational surfaces** not backing the core loop (achievements, community, coach, simulator, timeline, goals, impact) — presentation candy over the localStorage identity; safe to keep as demo, not as authority.

**Rule going forward:** Simulation output is never presented as a real capability, guarantee, or metric to end users or external parties. It stays developer/demo-gated.

---

## One-line boundary

> **Core Engine owns truth. Experience Layer shows truth. Simulation Layer imagines truth — and must be labeled as such.**
