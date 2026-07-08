# AN ACT ↔ Wegleiter — Architectural Transition Report

**Author:** System architect (collaborator)
**Date:** 2026-07-08
**Type:** Strategic architecture & transition report — **no code, no implementation.** Review and approval required before any build.
**Status of the ask:** This report documents current reality, summarizes approved decisions, proposes the next construction phase, and — per your explicit priority — front-loads a verified check of the **public AN ACT deployment** (Section 6) because it changes what must happen first.

---

## Executive summary (read this first)

The production **hang is fixed** and the backend is healthy, but there is a large, decision-shaping gap between **what is deployed** and **what you consider the "latest intended build."**

- The public URL `app13-production.up.railway.app` runs the **backend API only**, built from GitHub **`main`**, which is an **old commit** (`B5 complete`) plus the three recent recovery fixes. Its root path returns `404` — there is **no user interface at that URL**.
- The "latest intended AN ACT" work lives **only on the local branch** `b6-financil-kernel` (`Phase 8 MVP Evolution completed`), which is **many phases ahead** of `main` and additionally carries **323 uncommitted working-tree changes** (the entire web app, styling, tests, tokens, and a `vercel.json`). **None of it is pushed or deployed.**
- Therefore: **real users cannot currently test any journey.** There is no live front door. This must be resolved *before* Unified Entry design or any Wegleiter integration.

**Recommended sequencing:** (1) make AN ACT publicly visible and testable end-to-end (commit → push → deploy backend + frontend → wire them together), (2) *then* design Unified Entry and the shared User Room, (3) *then* integrate Wegleiter. Do not invert this order.

---

## 1. APP13 (AN ACT) — Current State

### 1.1 Deployment & source of truth (verified)

| Dimension | Reality (verified 2026-07-08) |
|---|---|
| **Production status** | Backend service **Active / Online** on Railway (project *endearing-ambition* / *production*). Region US West, Node 20, 1 replica. |
| **Public URL** | `https://app13-production.up.railway.app` — **backend API only**. `GET /` → `404 Not Found` (no route, no UI). |
| **GitHub source of truth** | Branch **`main`**. Deployed commit lineage = old `main` (`6809c00 "B5 complete"`) **plus** three recovery commits: logger fix, `/health` timeout, and the hook fix `5d6a793`. |
| **Railway status** | Healthy. `/health` → `200` in <1 ms; unknown routes → fast `404` (~4 ms). Deploy logs now show `request completed` — the prior infinite hang is resolved. |
| **Datastores** | Postgres reachable from the container ~50 ms; Redis ~42 ms (both internal networking). `APP13_ENV=staging`, `APP13_PORT=8080`. |
| **Backend readiness** | **Runs and serves.** Route surface present on `main`: `health`, `auth` (register/login), `identity`, `verification`, `actions`, `contracts`, `evidence`, `issues`, `internal/contracts`. |
| **Frontend readiness** | **Not deployed at the public URL.** The Vite SPA (`apps/web`) is designed to deploy **separately** (Dockerfile states "backend API tier only"; `vercel.json` targets Vercel with SPA routes `/start`, `/preview`, `/home`). No evidence a frontend is currently live. |
| **Authentication status** | Backend endpoints exist (`/auth`), JWT + session-store + cookie plumbing present. Email/password path is the implemented mechanism. Not exercisable by end users today because there is no live UI. |
| **User journey status** | **Not publicly testable.** Entry → Registration/Login → Profile → Passport → Actions → Contracts cannot be completed through a browser because no front-end is served. |
| **Professional Passport status** | Backend identity/profile/verification routes exist on `main`. The **richer Passport UI and `useBackendPassport` binding live only in the local uncommitted tree** (`apps/web/src/passport/…`, `PersonalPassportDashboardPage.tsx`) — undeployed. |
| **Contract / Action engine status** | Backend `actions`, `contracts`, `evaluation`, `execution`, `evidence`, `issues` services are wired into the server and boot. This is the real "accountability engine" surface. Live end-to-end behavior against production data is **not yet user-verified through a UI**. |

### 1.2 What is implemented vs simulated vs needs hardening

**Implemented (real, on the deployed backend):**
Fastify API boot, config validation, structured logging, request-id + auth + idempotency + revalidation + service-auth middleware chain, Postgres/Redis connectivity, health endpoint, and the domain route surface (identity, actions, contracts, evidence, issues). Migrations runner exists.

**Implemented locally but NOT deployed (the big gap):**
The entire **web experience** — brand shell, splash, login/register pages, provider onboarding, runtime page, Passport dashboard, the `useBackendPassport` client binding, CORS middleware, design tokens, and `vercel.json`. This is Phases 6–8 of the product and is currently **uncommitted on `b6-financil-kernel`**.

**Simulated / demo (to confirm during hardening):**
Any front-end flow that renders passport/contract state without a confirmed live backend call is, until wired and deployed, effectively a **mock**. The exact simulated-vs-live boundary in the web app must be audited once it is committed (there was prior work distinguishing `VITE_API_BASE_URL`-driven real calls from simulated fallbacks).

**Needs production hardening (once deployed):**
- Reconcile `main` with `b6-financil-kernel` (large delta; do not blind-merge — see Section 5).
- Liveness route: the container `HEALTHCHECK` calls `/health/live`, but `main` **only has `/health`** (`/health/live` → `404`). Align the healthcheck and the route.
- CORS + `VITE_API_BASE_URL` wiring between the deployed SPA origin and the API.
- Secrets posture for real users (`JWT_SECRET`, `KYC_WEBHOOK_SECRET`), evidence storage (R2/S3), migration run against the production DB, and backup/restore verification.

---

## 2. Wegleiter — Current State

> **Confidence note (honesty):** In this engagement I verified Wegleiter only as a **consolidated ET-5.5 "golden source"** (recovered from `Wegleiter-Final`, archived alongside AN ACT in the `Human-Action-Ecosystem` workspace). I did **not** perform a fresh, engine-by-engine *runtime* audit of the systems below. The statuses are drawn from the ET-series review and the UHAA/HSTM conceptual model, and are marked accordingly. A dedicated Wegleiter code audit should precede any integration commitment.

| Engine | Role (as understood) | Status (needs re-verification) |
|---|---|---|
| **Current ET version** | Frozen baseline | **ET-5.5** — treated as the golden, independently-deployable reflection system. |
| **Consilium** | Deliberation / council layer | Prototype-to-functional in the ET-5.5 build; reflection-only. |
| **Truth Regulator** | Consistency / integrity check on statements | Prototype/demo; core concept implemented, not user-hardened. |
| **Original Pattern / Evolving Pattern** | Baseline-vs-drift model of the person | Conceptually central (mirrors HSTM); functional as a model, demo-grade in UX. |
| **ORL** | Observation/Reflection loop | Present as loop scaffolding; needs real-user validation. |
| **S(t)** | State-over-time signal | Model exists; not productionized for live users. |
| **Self Contract** | The person's commitment to themselves | The reflective analogue of AN ACT's contract; prototype. |
| **Behavioral Paths** | Trajectories through states | Demo/visualization stage. |
| **Waiting Architecture** | "Threshold of accountability" holding pattern | Conceptual/prototype; the crossing point where reflection → action. |
| **Potential / Alignment systems** | Where the person could go vs is aligned to | Prototype; the bridge concept toward AN ACT. |

**What is functional:** The ET-5.5 baseline exists as a coherent, standalone reflection experience and is preserved as the source of truth.

**What is prototype/demo:** Most named engines are model/demo-grade — strong as concepts and internal logic, not yet hardened for external users or for cross-system contracts.

**What is needed for real users:** A Wegleiter code audit (functional vs simulated), a stable public deployment of its own, and a defined, consent-gated boundary before it is allowed to hand anything to AN ACT.

---

## 3. Previously Approved Decisions — Summary

These are the architecture agreements already reached; the proposal in Section 4 is built to honor them.

1. **One unified entry experience** — a single front door for the ecosystem.
2. **Email-first authentication** — email/password is the initial mechanism.
3. **Future Apple / Google login** — social/SSO to be added later, behind the same entry.
4. **Transparent "glass" entry screen** — a calm, minimal, translucent entry surface.
5. **Separate identity for Wegleiter and A·ct** — the two systems keep distinct identities/authority; no shared second source of truth.
6. **Shared user room / dashboard** — after entry, one place the person lands.
7. **Progressive user boxes / cards** — the room is composed of cards the user completes over time.
8. **Profile evolves as boxes are completed** — identity/passport richens progressively, not via one long form.
9. **R·act feedback / reflection cycle** — a reflection step that closes the loop (Wegleiter → A·ct → R·act).

**Interpretation for the build:** Unified **entry and room** (shared shell), but **separate system identities and data authority** underneath. The shell is shared; the engines are not merged.

---

## 4. Proposed Next Architecture (recommendation)

### 4.1 Guiding principle
**Shared shell, separate engines.** Users experience one calm entry and one room; internally, Wegleiter (reflection) and AN ACT (action) remain independently deployable with their own data authority. The room is a *composition* layer, not a merger.

### 4.2 Unified Entry
- A single translucent "glass" entry screen served from **one front-end origin**.
- **Email-first** now; structure the auth client so **Apple/Google** can be added as additional providers without changing the screen.
- Entry issues a session that the room reads; it does **not** dissolve the two systems' identities — it federates access to them.

### 4.3 User Room (shared dashboard)
- After entry, the person lands in **one room** composed of **progressive cards/boxes**.
- Cards are **capability tiles**: some belong to AN ACT (Passport, Actions, Contracts), some to Wegleiter (reflection), each fetching from its own backend.
- **Profile/Passport evolves** as boxes complete — the room reads a composite "completion state," but each box writes to its owning system.

### 4.4 Data boundaries (non-negotiable)
- **Two systems, two data authorities.** Postgres remains AN ACT's single source of truth for action/contract/passport data; Wegleiter owns its reflection data.
- **No shared write-through.** Cross-system communication is **event/consent-gated**, one-directional at first (Wegleiter → AN ACT), never a shared mutable store.
- The **room** holds only *composition/session state* (which boxes exist, completion flags), not domain data.

### 4.5 Identity model
- **One entry identity** (the person's login) that **maps to** a Wegleiter identity and an AN ACT identity — a federation, not a fusion.
- Consent is explicit and per-direction: the person authorizes what reflection may hand to action.

### 4.6 Wegleiter → A·ct → R·act interaction
- **Wegleiter (reflect)** produces a *readiness/potential signal* at the "Threshold of Accountability."
- **A·ct (do)** consumes that signal, **with consent**, to seed a contract/action.
- **R·act (reflect on the act)** closes the loop: outcomes/evidence flow back as a reflection input.
- Implement this as a **contract at the boundary** (a defined event schema + consent gate), not as direct database coupling.

### 4.7 Build order — what first, what waits

**Build first (Phase A — "Make AN ACT real for users"):**
1. Commit and push the local `b6-financil-kernel` work (see Section 6) — nothing else can proceed on quicksand.
2. Deploy the **AN ACT frontend** (Vercel per `vercel.json`) and confirm it talks to the Railway backend (CORS + `VITE_API_BASE_URL`).
3. Verify the full public journey: Entry → Registration/Login → Profile → Passport → Actions → Contracts.
4. Harden: liveness route, secrets, migrations, evidence storage.

**Build next (Phase B — "Unified shell"):**
5. Unified Entry (glass screen) and the **User Room** with progressive cards — *for AN ACT only at first*.
6. Introduce the **federated identity** model and the composition layer.

**Wait (Phase C — "Bring in Wegleiter"):**
7. Audit Wegleiter engines (functional vs prototype).
8. Define the **boundary contract** (event schema + consent gate) for Wegleiter → A·ct.
9. Add Wegleiter cards into the room; then add **R·act** to close the loop.

---

## 5. Risks & Warnings

**What could break / go wrong**
- **The 323 uncommitted changes.** Until committed, a workspace loss = losing the entire web app and Phase 6–8 work. This is the highest-probability catastrophic risk. Commit first, on a branch, before anything else.
- **Blind `b6 → main` merge.** `main` and `b6-financil-kernel` have diverged by many phases; a naive merge/force could regress the deployed backend or overwrite the recovery fixes. Merge deliberately, in a PR, with the backend booting verified.
- **Healthcheck mismatch.** `main` lacks `/health/live` while the Dockerfile healthcheck targets it. If Railway (or any orchestrator) is ever set to gate on the container healthcheck, deploys could be marked unhealthy. Align route and check.
- **CORS/identity coupling.** Wiring the SPA to the API can leak into over-broad CORS or shared cookies across systems — resist collapsing the two identities to "make it work."
- **Simulated flows shipping as real.** The web app has simulated fallbacks; deploying without auditing the simulated-vs-live boundary risks showing users mock data as if it were real.

**What must NOT be merged**
- Do **not** merge Wegleiter and AN ACT into a single service, database, or identity.
- Do **not** merge `b6` into `main` without a reviewed PR and a booting-backend check.
- Do **not** introduce a second source of truth or a shared mutable store between the two systems.

**Architecture decisions to protect**
- **Separate identities + separate data authority** for Wegleiter and A·ct (approved decision #5).
- **Independent deployability** of each system.
- **Consent-gated, event-based, one-directional** cross-system flow (Wegleiter → A·ct → R·act) — never direct DB coupling.
- The recovered **Wegleiter ET-5.5 golden source** stays the untouched baseline.
- The just-fixed **Fastify hook contract** (async hooks) — don't reintroduce synchronous 2-arg hooks.

---

## 6. Public User Experience Status (verified — priority section)

**Direct answers to your questions:**

**Is the public URL running the latest intended AN ACT version?**
**No.** `app13-production.up.railway.app` runs the **backend API only**, built from **`main`** = old `B5 complete` **plus** the three recovery commits. The "latest intended" product (Phase 8 + the whole web app) is **not there**.

**Which local features are not yet deployed?**
Effectively **all of Phases 6–8 and the entire front-end**, because they live on `b6-financil-kernel` and in **323 uncommitted files**, none pushed:
- The **web app** (`apps/web`): brand shell, glass/splash, Login/Register, Provider onboarding/profile, Runtime page, **Passport dashboard**, `useBackendPassport` binding, design-token styling.
- Backend deltas: `src/api/middleware/cors.ts`, config/idempotency/session refinements, additional routes.
- Deploy config: **`vercel.json`** (frontend → Vercel), and a `/health/live` liveness route (not on `main`).

**What needs to be pushed/released before user testing?**
1. **Commit** the local work (protect against loss) on a branch.
2. **Reconcile with `main`** via a reviewed PR; keep the recovery fixes; verify the backend still boots.
3. **Deploy the frontend** (Vercel per `vercel.json`) and set `VITE_API_BASE_URL` to the Railway API.
4. **Enable CORS** for the SPA origin on the API.
5. **Run migrations** against the production DB; set real secrets; add `/health/live`.
6. **Smoke-test** the full journey on the public URLs.

**Confirm the public user journey — Entry → Registration/Login → Profile → Passport → Actions → Contracts:**
**Cannot be confirmed today.** There is **no live UI** (`/` → `404`). The backend endpoints that would power each step exist, but no user can reach them through a browser until the front-end is deployed and wired.

### Priority directive (agreed): **make AN ACT visible and testable first**
Per your instruction — **do not begin Wegleiter integration until the public AN ACT experience matches the latest build.** The immediate, blocking objective is Phase A in Section 4.7: commit → reconcile → deploy frontend → wire to backend → verify the journey. Unified Entry, the User Room, and Wegleiter all wait behind that gate.

---

## Recommended immediate next step (for your approval)

Approve **Phase A only**: safely **commit the 323 local changes on a branch and open a PR to reconcile `b6-financil-kernel` with `main`**, then deploy the AN ACT frontend and verify the public journey. No Unified-Entry or Wegleiter work until AN ACT is publicly testable. On your approval I will produce a precise, file-level execution plan for Phase A (still no code until you say go).
