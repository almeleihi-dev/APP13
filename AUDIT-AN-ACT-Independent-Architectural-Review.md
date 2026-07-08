# AN ACT (APP13) — Independent Architectural Audit

**Type:** Read-only architectural audit. No files modified, no code created, no refactoring.
**Basis:** Only what physically exists in the repository. Roadmap and "readiness" claims are ignored unless backed by running code.
**Date:** 2026-07-07
**Repo:** `APP13` (git HEAD `0ca3706` — "Phase 8 MVP Evolution completed")

---

## 0. Headline finding

AN ACT is **two codebases wearing one name**:

1. A **genuinely well-engineered backend core** (identity, action, contract, execution/evidence, complaint, trust, financial ledger) built on Fastify + PostgreSQL with migrations, transactions, idempotency, an outbox, and audit logging. This part is close to production-grade.
2. A very large **simulation/demo shell** around it — ~180 modules and ~150 HTTP routes named `*-intelligence`, `*-experience`, `runtime-*`, `*-readiness`, `mission-control`, `launch-simulation` — that compute deterministic, in-memory views and **never touch the database**, plus a React frontend that stores everything in browser `localStorage` and **is not wired to the backend at all**.

The README claims "specification only — no application code." That is stale and wrong. But the git history ("Phase 1…8", "CH5-X1…X22 Experience completed") reveals the real development pattern: an assembly line of AI-generated feature phases, most of which produced typed scaffolding and self-referential "readiness" surfaces rather than shipping product.

**What is real is genuinely good. What is claimed vastly exceeds what is wired together.**

---

## 1. Inventory of what actually exists

**Scale**
- `src/`: **1,965 TypeScript files, ~263,000 lines**, ~180 module folders.
- `test/`: **329 `*.test.ts` files** (70 require a live Postgres; ~19 use in-memory fakes).
- `docs/`: **402 files** (specifications, "books", "bibles", ADRs).
- Git: **145 commits**, nearly all titled "Phase X … completed" or "CHx-Xn … Experience completed".
- Repo size: 631 MB (includes `node_modules`, `dist`).

**Backend (real)**
- Runtime: **Node ≥20, Fastify** HTTP server (`src/index.ts` → `src/api/server.ts`).
- Middleware pipeline: request-id, **idempotency**, **JWT + session auth**, revalidation, service auth, structured error handling, cookie support.
- Persistence: **PostgreSQL via `pg` pool** with real `withTransaction`, plus session-scoped GUCs (`app13.contract_materialization`, `app13.trust_recompute`, etc.) used as materialization/authority gates.
- Bootstrap is modular and deliberate: `bootstrap/{modules,engines,experiences,financial,intelligence,living,platform,runtime,security,routes}.ts`.

**Database (real, well-designed)**
- **20 SQL migrations** with a proper schema-per-domain layout:
  - `identity.*` — users, providers, customers, companies, sessions, refresh_tokens, credentials, verifications, verification_documents, user_roles, audit_logs
  - `action.*` — actions, action_status_history
  - `contract.*` — contracts, contract_parties, contract_status_history
  - `execution.*` — milestones, evidence, attestations, attestation_evidence, customer_evaluations, status history
  - `complaint.*` — complaints, cases, adjudications, mediation_records, dimensions, milestones
  - `financial.*` — accounts, **journals + ledger_entries (double-entry)**, escrow_agreements, payment_intents, settlement_instructions, processor_webhook_log
  - `trust.*` — trust_score_events, trust_scores, trust_score_snapshots, trust_score_event_corrections (versioned scoring)
  - `platform.*` — domain_outbox, audit_events, operations, upload_intents, schema_migrations, idempotency
- Constraints, enums, indexes, and triggers are split into dedicated migrations — a mature pattern.
- **Only ~36 of 1,965 source files contain SQL.** Real persistence is confined to the core domains above.

**Frontend (prototype demo)**
- `apps/web`: **Vite + React** SPA, 36 page components, a design system (`packages/runtime-ui`, `packages/tokens`, `packages/runtime-core`, `packages/runtime-client`).
- State comes from **browser `localStorage`** (`usePersonalIdentity`, `personal-passport-persistence`, `living-platform`), synced via window events.
- **Effectively zero backend calls** — a grep for `fetch(`, `/api/`, `axios`, or `VITE_API` across the web app returns only config/debug files. The UI does not consume the Fastify API.

**Deployment state**
- `vercel.json` builds and deploys **only `apps/web/dist`** (static SPA, SPA-rewrite to `index.html`).
- The **Fastify + Postgres backend is not part of the deployment** and requires an external database to run.
- `docker-compose.yml` exists for local infra; no evidence of a deployed, publicly reachable API tier.
- Net effect: the "live" product is a **static, client-only demo**; the engineered backend is not in the deployed path.

---

## 2. Current product architecture

**What AN ACT is today.** A "Professional Operating System" whose thesis is an accountable chain — **Action → Contract → Execution → Trust → Complaint** — with work decomposed along a **TEKRR** model (Time, Effort, Knowledge, Risk, Responsibility/"S"). The backend models this chain faithfully in schema and domain code. Around it sits a very large speculative layer of "intelligence" and "experience" modules and a demo web app.

**Production-level (real, coherent, mostly wired):**
- Identity & auth: users/providers/customers/companies, sessions, refresh tokens, verifications, RBAC roles, audit logs.
- Action, Contract, Execution/Evidence/Attestation, Complaint domains: real tables, repositories, status-history tracking, transactional writes.
- Trust engine: event-sourced scoring with versioning, snapshots, and corrections — the most sophisticated real subsystem.
- Financial: double-entry ledger, escrow agreements, payment intents, settlement, webhook log (schema-complete; processor integration appears stubbed).
- Platform plumbing: outbox pattern, idempotency, audit events, upload intents — production-grade cross-cutting concerns.

**Prototype / deterministic (typed, in-memory, no persistence, no ML):**
- The `*-intelligence` family (trust-, contract-, matching-, pricing-, tekrr-, decision-, prediction-, strategy-, recommendation-intelligence, etc.). These are **rule/weight libraries and validators** returning computed recommendations — competent deterministic logic, but "intelligence" is a naming convention, not AI. They do not learn and do not store.
- `matching` / `discovery`: score computation only; the matching service persists nothing.

**Demo / meta-surfaces (not product features):**
- `runtime-experience/*` (launch-control, production-approval, readiness-authority, executive-launch-authority…), `mission-control`, `launch-simulation` (`/1k`, `/10k`, `/1m`, `/10m`), `investor-readiness`, `release-readiness`, `government-partnership`, `production-readiness`, dozens of `living-experience/*` surfaces. These are **self-assessment and presentation** endpoints — the platform grading its own launch-readiness — not user-facing capabilities.

**What is missing / not integrated:**
- **Frontend↔backend integration** — the single biggest gap. The React app and the API are disconnected halves.
- **Live deployment of the backend** and a provisioned database.
- **Real payment processing** (schema present; no live processor).
- **Actual ML/AI** behind the "intelligence" naming.
- Verified passing test suite in a real environment (see §3 caveat), external integrations (KYC/insurance/government/banking), native mobile, and production marketplace discovery — all still roadmap.

---

## 3. Evaluation of the requested systems

**Architecture.** The *core* is a clean modular monolith with domain/application/infrastructure separation, DDD-flavored boundaries, an outbox, idempotency, and dependency-cruiser import rules. Strong. But it is buried under ~180 modules of uneven value, and the module count creates real navigability and maintenance cost. The signal-to-noise ratio is the central architectural problem.

**User journey.** Exists convincingly in the React demo (register → passport → home → action → contract → trust surfaces), but it runs on `localStorage`, so nothing a user does reaches the accountable backend. The journey is a *storyboard*, not a transacting flow.

**Trust engine.** The strongest real asset. Event-sourced, versioned scoring with snapshots, corrections, dimension components (verification/execution/time/complaints/evaluation), confidence bands, and DB-gated recompute. Production-quality design.

**Contract system.** Real and solid: contracts, parties, status history, transactional repository, materialization gate GUC, plus templates/materialization logic. Among the more complete domains.

**Professional Passport.** Split-brained. The backend can assemble passport/credential/verification data (`experience/professional-passport`), but the *shown* passport in the web app is built from browser-local identity, not verified backend records. Presentation is polished; the trust guarantee behind it is not connected end-to-end.

**Matching system.** Deterministic rule/weight scoring only. No persistence, no learning, no feedback loop. Prototype tier.

**Scalability.** Backend foundations scale well (stateless Fastify, pooled Postgres, outbox, idempotency). But scalability is untested where it matters, and `launch-simulation/*` endpoints are *simulated* capacity claims, not load tests. The ~263k-LOC surface is itself a scaling liability for the team.

**Commercial readiness.** Not commercially ready. There is no integrated, deployed, transacting product: no live backend, no payments, no connected UI. The pieces to *become* ready exist and are unusually mature for the core; the assembly does not.

**Caveat on verification.** Tests could not be executed in this environment — `node_modules` was copied from macOS and ships the wrong native `esbuild` binary (`darwin-arm64` vs `linux-arm64`), and the sandboxed registry blocks reinstalling it. So all 329 test files' pass/fail status is **unverified here**; findings above are from static/structural evidence, not a green test run.

---

## 4. Fresh scores (0–100)

| Dimension | Score | Rationale |
|---|---:|---|
| **Architecture** | **68** | Excellent core patterns; dragged down by ~180 modules of scaffolding and a disconnected frontend. |
| **Product coherence** | **45** | Strong conceptual thesis (Action→Contract→Trust→Complaint, TEKRR), but the product is fragmented into real-core + simulation-shell + demo-UI that don't form one working whole. |
| **UX** | **55** | Polished, branded React demo with a full storyboard; undermined by `localStorage`-only state and no backend truth. |
| **Technical readiness** | **50** | Backend core is near-production; no integration, no deployed API, unverified tests, stubbed payments. |
| **Market potential** | **70** | The accountability/trust-infrastructure thesis is differentiated and valuable if executed. |
| **Innovation** | **62** | TEKRR + event-sourced trust + accountable-chain is genuinely novel; the "AI/intelligence" layer is deterministic, not innovative as labeled. |
| **Launch readiness** | **28** | Despite many "readiness"/"launch-authority" surfaces, no integrated, deployed, transacting system exists. |

---

## 5. Conceptual analysis: how Wegleiter ET-5.5 and AN ACT could connect

*Conceptual only. No implementation, no code, no integration performed. Note: Wegleiter ET-5.5's internals were not available in this repository, so this reasons from AN ACT's actual surfaces and the general role a "Wegleiter" (guide/router) system implies.*

The natural and honest connection points are AN ACT's **real** subsystems, not its simulated ones:

- **At intake (need → action).** If Wegleiter ET-5.5 acts as a guidance/routing engine, its most defensible integration is *upstream* of the accountable chain: translating a user need into a canonical **Action** (AN ACT already has an action ontology/taxonomy and TEKRR decomposition). Wegleiter would feed structured intent in; AN ACT would own classification and the contract that follows.

- **As the real "intelligence" layer AN ACT currently fakes.** AN ACT's `*-intelligence` modules are deterministic placeholders. Conceptually, Wegleiter could *replace* the recommendation/matching/decision heuristics behind stable internal interfaces — AN ACT keeps ownership of trust, contracts, and evidence (the parts that must be auditable), while Wegleiter supplies guidance/prediction. The clean boundary is: **Wegleiter advises; AN ACT records and enforces.**

- **Via the outbox/event seam, not the UI.** AN ACT already has a `platform.domain_outbox` and event inbox. Conceptually the least invasive coupling is event-driven: AN ACT emits domain events (contract materialized, milestone attested, complaint upheld, trust recomputed); Wegleiter consumes them for guidance/forecasting and returns recommendations through a narrow API — no shared database, no shared UI.

- **Trust as the shared currency.** AN ACT's event-sourced trust score is the most valuable real asset to expose to Wegleiter as a signal, and the most dangerous to let Wegleiter write to. A sound conceptual rule: Wegleiter may *read* trust and *propose*; only AN ACT's gated trust engine may *mutate* it.

**Prerequisite reality check before any such connection is worth attempting:** the highest-leverage work is *internal to AN ACT* — wiring the React frontend to the real backend, deploying the API + database, and verifying the test suite. Integrating Wegleiter into a product whose own halves are not yet connected would compound risk rather than reduce it. Wegleiter should connect to a working AN ACT, not to the current demo shell.

---

## 6. Recommendation (audit stance only)

Do not begin Wegleiter integration or new implementation yet. The prerequisite is to **consolidate what already exists**: connect the frontend to the real backend, deploy the backend + database, get the test suite verifiably green, and formally separate the production core from the simulation/demo layers so future work builds on the ~15% that is real rather than the ~85% that is scaffolding.

**Stopping here and awaiting approval, as instructed.**
