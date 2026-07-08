# Phase A — File-Level Execution Plan: Make AN ACT Publicly Testable

**Author:** System architect (collaborator)
**Date:** 2026-07-08
**Type:** Execution *plan* only — **no code written, no files modified, no branches merged, nothing deployed.** Awaiting your approval before any step runs.
**Goal of Phase A:** Get AN ACT to a state where a real user can open a URL and complete Entry → Registration/Login → Profile → Passport → Actions → Contracts.

> **Headline finding that shapes this plan:** The local branch `b6-financil-kernel` is **strictly ahead of and safer than** deployed `main`. It already contains proper equivalents of all three production recovery fixes: the correct Fastify v5 logger helper (`resolveFastifyLogger`), a bounded `/health` **plus** a real `/health/live` route, `"off"` in the log-level enum, and **async** request-id + CORS hooks. So the reconciliation direction is **"promote `b6` to production," not "merge patches into old `main`."**

---

## 1. Exact current branches & commits

| Ref | Commit | Meaning |
|---|---|---|
| **Local `b6-financil-kernel`** (checked out, HEAD) | `0ca3706` — *Phase 8 MVP Evolution completed* | The **intended latest** build. Tracks `origin/b6-financil-kernel` (its committed history is already backed up on GitHub). |
| **Local `main`** | `6809c00` — *B5 complete* | **Stale local ref.** Real GitHub `main` is ahead of this (see below). |
| **Real GitHub `main`** (deployed by Railway) | `6809c00` **+** `fe4b31e` (logger), `44bcec6` (health timeout), `5d6a793` (async hook) | The **currently deployed backend** = old B5 + 3 emergency recovery patches. (These commits aren't in the local clone because git fetch is blocked in this environment.) |
| **Remote** | `origin` → `https://github.com/almeleihi-dev/APP13.git` | Push target. |

**Divergence:** `b6` and `main` share the `6809c00` base but diverged across many phases (Render Layer 1–5, Design Tokens, RC1/RC2, Phase 8) on `b6`, and 3 recovery commits on `main`. **`b6`'s file content already supersedes all 3 recovery patches** — so promoting `b6` loses no functionality or stability.

---

## 2. Exact uncommitted-change categories (the "323")

The earlier "323" was the collapsed `git status` count. Precisely, the working tree carries **46 tracked-modified + 466 untracked = the uncommitted risk surface** (0 staged). **No artifacts or secrets are among them** — `.gitignore` already excludes `node_modules/`, `dist/`, `build/`, `.env*` (except `.env.example`), `coverage/`, `*.tsbuildinfo`, logs. Verified: the artifact/secret scan returned empty.

**46 modified (tracked):**
- Frontend `apps/web/*` (19): `index.html`, `App.tsx`, `main.tsx`, Login/Register/Provider/Registration/Runtime pages, `RuntimeProvider.tsx`, `AiAssistantPanel`, `ExecutiveAiPanel`, `global.css`, `vite.config.ts`, `vite-env.d.ts`, `package.json`, manifest/favicon.
- Packages (12): `runtime-client` (auth-client, http-client, runtime-client), `runtime-ui` (shell, splash, P0/P1 components, index, production css), `tokens` (assets + data).
- Backend `src/*` (8): `api/routes/browser-surface.ts`, `api/routes/health.ts`, `api/routes/home.ts`, `api/server.ts`, `bootstrap/routes.ts`, `identity/infrastructure/session-store.ts`, `index.ts`, `platform/idempotency/index.ts`, `shared/config/index.ts`.
- Root: `package.json`, `package-lock.json`. Tests (4).

**466 untracked (buckets):** `apps/web` (173 — new components/pages/assets), `docs/*` (~120 across governance, reality-bridge, ch6–ch10, beta/experience specs), `packages/runtime-ui` (12), `packages/runtime-client` (2), `scripts/desktop-shortcut` (2), new tests (~15), and **`vercel.json`** (frontend deploy config) at repo root.

---

## 3. Files that must be committed first (protect the work)

**All of them.** Because `.gitignore` is already correct, the safe, complete protection step is a single **snapshot commit of the entire working tree** (46 modified + 466 untracked). Highest-value files inside that set — the ones the public experience depends on:

- **Frontend app:** everything under `apps/web/src/**` (pages, `providers/RuntimeProvider.tsx`, `passport/useBackendPassport.ts`, `PersonalPassportDashboardPage.tsx`), `apps/web/index.html`, `vite.config.ts`.
- **Deploy config:** `vercel.json` (frontend → Vercel).
- **Backend deltas:** `src/api/middleware/cors.ts`, `src/api/server.ts` (CORS + logger helper + async hooks), `src/api/routes/health.ts` (bounded `/health` + `/health/live`), `src/shared/config/index.ts`.
- **Shared UI/client packages:** `packages/runtime-ui/**`, `packages/runtime-client/**`, `packages/tokens/**`.
- **Lockfiles:** `package.json`, `package-lock.json` (needed for reproducible Vercel/Railway builds).

Docs/tests are safe to commit too (no risk); they just aren't on the journey's critical path.

---

## 4. Recommended branch / PR strategy

**Principle:** zero-risk backup first, then promote `b6` to production, resolving the 3 known conflicts in favor of `b6`.

**Step 4.1 — Snapshot backup (zero risk, do first).**
Create a throwaway snapshot branch off current HEAD and commit the entire working tree to it, then push. This preserves the exact 512-file working state on GitHub without touching `b6`'s clean HEAD.
`b6-financil-kernel` → new branch `snapshot/phase-a-YYYYMMDD` → `git add -A` → commit "WIP snapshot" → push. *(Nothing else depends on curation; the work is now safe.)*

**Step 4.2 — Curated commit onto `b6`.**
Commit the working tree onto `b6-financil-kernel` (one or a few logical commits: "frontend build", "backend CORS/health", "docs/tests") → push `b6`.

**Step 4.3 — Reconcile via PR `b6 → main` (reviewed, not force).**
Open a pull request from `b6-financil-kernel` into `main`. Expect merge conflicts on exactly three backend files where `main`'s recovery patches diverge from `b6`:
- `src/api/server.ts` (logger line), `src/api/routes/health.ts`, `src/api/middleware/request.ts`.

**Conflict resolution rule: take `b6`'s version for all three** — they are the superior, complete implementations (verified: async hooks, `resolveFastifyLogger`, bounded health + `/health/live`, `"off"` enum). After resolution, confirm the merged `main` still contains: async `requestIdMiddleware`, async `corsHook`, `/health` with a DB timeout, and `/health/live`.

**Why PR, not force-push:** auditable, reversible, and preserves `main`'s history. (Alternative: reset `main` to `b6` if you prefer a linear history and accept dropping the 3 patch commits from the log — content is identical. My recommendation is the PR.)

**Result:** `main` = `b6` content. Railway auto-redeploys the new backend from `main`.

---

## 5. Deployment split & targets

| Tier | Target | Source | Build | Output |
|---|---|---|---|---|
| **Backend API** | **Railway** (existing service) | GitHub `main` (after reconciliation) | Dockerfile (`node dist/index.js`) | Fastify API on `APP13_PORT` |
| **Frontend web app** | **Vercel** (new project, per `vercel.json`) | GitHub `main` (or the chosen production branch) | `npm run sync:tokens && npm --prefix apps/web run build` | `apps/web/dist` (static SPA) |

**Notes:**
- The Dockerfile explicitly declares "backend API tier only" — do **not** try to serve the SPA from Railway.
- `vercel.json` is already written: Vite framework, `outputDirectory: apps/web/dist`, SPA rewrites for `/start`, `/preview`, `/home`, and catch-all → `index.html`.
- The Vercel project must be **connected to the GitHub repo** and set to build from the production branch (`main`) after reconciliation.

---

## 6. Environment variables needed

**Frontend (Vercel — build-time, must be set before build):**
| Var | Value | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `https://app13-production.up.railway.app` | `RuntimeProvider.tsx` reads `import.meta.env.VITE_API_BASE_URL`; empty = same-origin (wrong for split deploy). **Must point at the Railway API.** |

**Backend (Railway — mostly already set; the one new/critical addition for public use):**
| Var | Value | Status |
|---|---|---|
| `APP13_CORS_ORIGINS` | the Vercel frontend origin(s), comma-separated (e.g. `https://<project>.vercel.app`) | **NEW — required** so the browser SPA can call the API. `server.ts` reads `process.env.APP13_CORS_ORIGINS`; unset = same-origin-only (blocks the SPA). |
| `APP13_ENV` | `staging` (or `production`) | set |
| `APP13_PORT` | `8080` | set |
| `APP13_HOST` | `0.0.0.0` | set/default |
| `APP13_LOG_LEVEL` | `info` | set |
| `DATABASE_URL`, `REDIS_URL` | Railway references | set |
| `JWT_SECRET` (≥32 chars, real), `KYC_WEBHOOK_SECRET` (real) | secrets | **verify real values, not dev defaults** |
| `S3_ENDPOINT/BUCKET/ACCESS_KEY/SECRET_KEY/REGION` | evidence storage (R2/S3) | **needed for Actions/Contracts evidence** — confirm provisioned |
| `IDEMPOTENCY_TTL_SECONDS`, `JWT_*`, `SESSION_*`, `REFRESH_TTL_SECONDS`, `KYC_*` | per `.env.example` | verify |

**Chicken-and-egg note:** `VITE_API_BASE_URL` needs the API URL (known) and `APP13_CORS_ORIGINS` needs the Vercel URL (known only after the first Vercel deploy). Sequence: deploy Vercel once to obtain its URL → set `APP13_CORS_ORIGINS` on Railway → redeploy backend → rebuild frontend if needed.

---

## 7. Verification checklist (public journey)

**Pre-flight (before user testing):**
- [ ] Reconciled `main` boots on Railway; deploy logs show `app13-api listening` and `request completed` (no hang).
- [ ] `GET /health` → 200 fast; `GET /health/live` → 200 (no longer 404).
- [ ] Migrations run against the production DB (schema present).
- [ ] `APP13_CORS_ORIGINS` includes the exact Vercel origin; preflight `OPTIONS` returns 204 with correct `access-control-allow-*` headers.
- [ ] Vercel build succeeds; SPA loads at its URL; `VITE_API_BASE_URL` baked to the Railway API.

**Public journey (end-to-end, in a browser, on the live URLs):**
- [ ] **Entry** — SPA front door loads (glass entry / start screen), no console/CORS errors.
- [ ] **Registration** — new email/password account creates successfully (`/auth` register) and returns a session.
- [ ] **Login** — existing account authenticates; session cookie/JWT persists across reload.
- [ ] **Profile** — authenticated profile loads and can be edited/saved (`/identity`).
- [ ] **Passport** — Personal/Professional Passport dashboard renders **live backend data** via `useBackendPassport` (not a mock).
- [ ] **Actions** — an action can be created/listed against the backend (`/actions`).
- [ ] **Contracts** — a contract/action-contract can be created and evaluated (`/contracts`, evidence write if applicable).
- [ ] **Simulation audit** — confirm each step reads real API data; flag any screen still showing simulated/fallback content.

---

## 8. Risks before implementation

**Reconciliation risks**
- **The 3-file conflict (`server.ts`, `health.ts`, `request.ts`).** If resolved in favor of `main` (the patches) instead of `b6`, you could regress to the older, thinner implementations. **Rule: take `b6` for all three.** (Verified `b6` is the superior, hang-free version.)
- **History choice.** A PR keeps `main`'s 3 patch commits in history (harmless); a reset drops them (content identical in `b6`). Either is fine — pick one deliberately.

**Deployment risks**
- **CORS misconfiguration** is the most likely first-deploy failure: a missing/incorrect `APP13_CORS_ORIGINS` will make every SPA→API call fail in the browser while `curl` works. Set it to the exact Vercel origin (scheme + host, no trailing slash).
- **`VITE_API_BASE_URL` is build-time.** If unset or wrong at Vercel build, the SPA calls the wrong origin and no runtime env change will fix it — it must be rebuilt.
- **Secrets posture.** Dev-default `JWT_SECRET`/`KYC_WEBHOOK_SECRET` will be rejected by the production config guard (or are unsafe). Confirm real values before user testing.
- **Evidence storage (S3/R2).** Actions/Contracts that write evidence will fail if `S3_*` isn't provisioned — verify before testing those steps.
- **Migrations.** If the production DB isn't migrated to the `b6` schema, Passport/Actions/Contracts reads/writes will error.

**Do-not-do (guardrails)**
- Do **not** force-push over `b6` or `main` without the snapshot backup (4.1) in place first.
- Do **not** resolve the 3-file conflict toward `main`'s patches.
- Do **not** serve the SPA from Railway or the API from Vercel — keep the split.
- Do **not** widen CORS to `*` with credentials as a shortcut — scope to the Vercel origin(s).
- Do **not** begin Wegleiter integration or Unified-Entry work until this checklist passes (your standing directive).

---

## Approval gate

This is planning only — nothing has been committed, merged, or deployed. **On your approval**, the first action I recommend is **Step 4.1 (zero-risk snapshot backup)**, after which we proceed through 4.2 → 4.3 → deploy → verify. I will pause for confirmation at each irreversible point (push, PR merge, production redeploy, first public exposure).
