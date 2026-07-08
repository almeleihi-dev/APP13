# Technical Integration Blueprint v1 (EIP M6)

**Design only. No code, no implementation, no integration, no database merging, no automatic data transfer, no simulated completion.** This turns the approved architecture into an executable engineering map while preserving every boundary. ADR: ADR-0008. Grounded in the real systems (AN ACT OC-1: Fastify + PostgreSQL + Redis + S3, Dockerized, health/config-guard verified; Wegleiter ET-5.5: static, zero-dependency, local-only).

---

## Part 1 — System topology

```
                         ┌───────────── Identity Provider (OIDC) ─────────────┐
                         │  authoritative for the shared human subject only    │
                         └───────▲───────────────────────▲──────────────────────┘
                                 │ auth                   │ auth
             ┌───────────────────┴──────── HUMAN ACTION HOME (shell) ──────────┐
             │  static frontend · holds NO data · navigation + status only      │
             └──────┬───────────────────────┬───────────────────────┬──────────┘
                    │ link                   │ invoke                │ link
        ┌───────────▼────────┐   ┌───────────▼───────────┐   ┌───────▼────────────────┐
        │  WEGLEITER REALM   │   │   CONSENT LAYER        │   │   AN ACT REALM          │
        │  static, on-device │   │  boundary service      │   │  Fastify API            │
        │  reflection store  │──▶│  (forward crossing;    │──▶│  PostgreSQL (truth)     │
        │  (local, encrypted)│   │   verify + atomic)     │   │  Redis · S3(evidence)   │
        └────────────────────┘   └────────────────────────┘   └──────────┬──────────────┘
                    ▲                                                     │ publishes
                    └───────────── coarse advisory reputation event ◀─────┘ (async, read-only)
                              (Event System — one-way, no accountable detail)

  Observability: each component emits its own logs/metrics/health; no shared data plane.
```

**Who owns / stores / talks to whom:**
- **Home** owns nothing; stores nothing; talks to IdP (auth) and links to both realms. Removable without breaking realms.
- **Wegleiter** owns/stores reflection locally (on-device, encrypted); talks *out* only via the Consent Layer (human-initiated) and *in* only the advisory reputation event (read-only).
- **Consent Layer** owns nothing durable except the boundary crossing act; verifies consent; performs the atomic forward crossing; talks Wegleiter→AN ACT only.
- **AN ACT** owns/stores all accountable data (Postgres/Redis/S3); receives crossings; publishes reputation events.
- **IdP** owns only the shared identity subject.
- **Event System** carries the one-way advisory reputation event; no reflection events exist.

## Part 2 — Identity architecture

- **Single login:** one sign-in at the Home via the IdP (OIDC-style); email-based.
- **Federated identity:** IdP issues the shared subject; each realm maps it to its **own local identity** (AN ACT: `identity.users`; Wegleiter: a local identity binding). No shared user table.
- **User mapping:** subject → local-id, held independently by each realm; neither reads the other's profile.
- **Session boundaries:** each realm maintains its **own** session (AN ACT already uses Redis-backed sessions + JWT). The Home holds only an auth token to render links; it does not proxy realm sessions.
- **Account lifecycle:** creation, suspension, deletion are per-realm and independent; deleting the Reflection Realm account erases local reflection; deleting the Action account follows accountable retention/erasure rules. No cascade that could expose one realm's data to the other.

Rules honored: one human identity; separate system authorities; no private reflection exposure.

## Part 3 — Communication model

**Allowed paths (only two):**
1. **Forward — Reflection → Intention → Consent → Action.** Human-initiated, **synchronous** request/response through the Consent Layer; carries only the Intention Artifact + Consent Artifact; atomic.
2. **Backward — Action outcome → optional human review → reflection.** **Asynchronous**, one-way advisory reputation event AN ACT→(Event System)→Wegleiter; read-only; the human decides whether to act on it; any *new* reflection is the human's own writing.

**Forbidden paths:** Wegleiter→AN ACT of any reflection/metric/S(t)/ORL/Reflection Record; AN ACT→Wegleiter of any accountable evidence/contract/financial detail; any realm reading the other's database; any automatic (non-human) forward crossing.

**Sync vs async responsibilities:**
- Sync: the consent crossing (needs a definite accepted/rejected result; atomic).
- Async: the advisory reputation signal (fire-and-forget; consumers tolerate absence/lag).

**Failure & retry:** the crossing is all-or-nothing — on failure, nothing is created and the human retries cleanly (no dedupe ambiguity because each crossing carries fresh single-use consent). The advisory event uses at-least-once delivery with idempotent, tolerant consumption; if never delivered, readiness simply shows without it. No silent queuing of accountable actions.

## Part 4 — Data ownership map (one authority per type)

| Data type | Sole authority | Store | Notes |
|---|---|---|---|
| Shared human identity (subject) | **Identity Provider** | IdP | realms map locally |
| Local identity mapping (per realm) | **Each realm** | realm-local | not shared |
| Reflection records ("Nerves CV") | **Wegleiter** | on-device, encrypted | never crosses |
| S(t) | **Wegleiter** | on-device | never crosses |
| ORL | **Wegleiter** | on-device | never crosses |
| Intention Artifact | **Wegleiter** (pre-crossing) → **AN ACT** (post-crossing) | local → Postgres | ownership transfers at the crossing |
| Consent Artifact | **AN ACT** | Postgres | accountable metadata; contains categories, not reflection |
| Actions / Needs / Offers | **AN ACT** | Postgres | — |
| Accountable Contracts | **AN ACT** | Postgres | append-only |
| Accountable Evidence | **AN ACT** | Postgres (meta) + S3 (blobs) | durable |
| Trust | **AN ACT** | Postgres (event-sourced) | earned |
| Reputation | **AN ACT** | Postgres | published coarsely as advisory event |

## Part 5 — Deployment architecture

- **Human Action Home:** static frontend shell on a CDN; holds no data.
- **Wegleiter:** independent static deployment (Vercel today); on-device state; no backend.
- **AN ACT:** container (`Dockerfile`) running `node dist/index.js` + managed PostgreSQL + Redis + S3 bucket (per ET-2.5 host: Railway/Fly pilot, AWS later).
- **Consent Layer:** a small **boundary service** (independently deployed) or a strictly-bounded module fronting AN ACT's intake; either way it owns no realm data.
- **Identity Provider:** managed OIDC service.
- **Event System:** managed message bus for the advisory reputation event.

**Cross-cutting:**
- **Environments:** dev → staging → prod, per component.
- **Versioning:** systems SemVer independently; the two cross-realm contracts versioned, backward-compatible within a major, version-pinned per crossing (EIP versioning policy).
- **Rollback:** stateless components redeploy to prior image instantly; DB via snapshot/PITR; migrations forward-only; the Consent Layer and Home can roll back without touching realm data.
- **Monitoring:** per-component health/metrics; AN ACT `/health` (DB+Redis) + `/health/live`; Consent Layer crossing success/failure metrics; Wegleiter is client-side (no server telemetry beyond static hosting).
- **Failure isolation:** any component can be down without corrupting another; Wegleiter fully functional offline; AN ACT functional without the Home; the Home degrades to plain links if a realm is down.

## Part 6 — Security model

- **Authentication:** OIDC at the Home; each realm validates tokens/sessions itself (AN ACT: JWT + Redis sessions, verified).
- **Authorization:** per-realm, least-privilege; the Consent Layer authorizes a crossing only with fresh, human-present, single-use consent bound to the specific Intention Artifact.
- **Encryption:** Wegleiter reflection encrypted at rest on-device (WebCrypto AES-GCM-256, verified); AN ACT uses TLS in transit and provider-managed encryption at rest; secrets never in git.
- **Audit:** accountable events audited in AN ACT only (incl. the Consent Artifact: id, timestamp, categories, version). **Reflection is never audited anywhere.**
- **Secrets:** host secret manager; AN ACT's production config guard refuses dev-default secrets (verified).
- **Privacy boundaries:** default-deny at the boundary; data minimization; the advisory event carries no accountable detail; correlation between realms limited to the IdP subject.
- **Incident handling:** per-realm runbooks; a breach in one realm cannot expose the other's data (no shared store); reflection compromise is limited to a single device (local-only).
- **Special focus — protecting private reflection:** on-device, encrypted, never transmitted, never audited, never an input to trust; the strongest guarantee is architectural — reflection has no server and no egress path except the human-controlled crossing (which never carries reflection content).

## Part 7 — Implementation roadmap preview (do not execute)

Build order, each behind its own ADR + approval gate:
1. **AN ACT staging live (M1 completion)** — provision Postgres/Redis/S3, deploy, `/health`=200. *Gate:* green live E2E + 329-test suite on real Postgres.
2. **Identity Provider + federation** — SSO across both realms; local mappings; no shared user store. *Gate:* one human logs into both; no profile bleed.
3. **Consent Layer (boundary service)** — implement the M4 spec. *Gate:* proven safe-abort (no record on cancel), atomic crossing, minimality, freshness.
4. **Forward crossing wired** — Wegleiter previews Intention Artifact → Consent Layer → AN ACT candidate Need/Offer. *Gate:* only approved categories cross; reflection provably never leaves.
5. **Advisory reputation event** — AN ACT publishes; Wegleiter reads read-only. *Gate:* no accountable detail in the event; advisory-only.
6. **Human Action Home shell** — the unified entry (Model C). *Gate:* holds no data; removable; navigation routes through the Threshold.
7. **Observability + privacy attestation (M7)** — monitoring live; boundary audit passes (no reflection leakage).

**Where implementation must stop for approval:** after **each** numbered step. One step, one verification, one approval — the established protocol. Nothing proceeds automatically.

## Final deliverables
- **System topology diagram** (Part 1), **Identity model** (Part 2), **Communication model** (Part 3), **Data authority matrix** (Part 4), **Deployment model** (Part 5), **Security model** (Part 6), **Implementation sequence** (Part 7).
- **Integration readiness score: 80 / 100** (was 76 at M5). The full technical blueprint is complete and boundary-compliant; the remaining 20 is earned only by building and verifying the seven steps above. No credit taken for unbuilt code; no simulated completion.

---

**M6 complete — design only. No code, no integration, no database merging, no automatic data transfer, no simulated completion.** This is the executable engineering map; execution begins only on approval, one gated step at a time. Awaiting approval.
