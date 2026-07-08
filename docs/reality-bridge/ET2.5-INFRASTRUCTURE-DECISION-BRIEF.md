# AN ACT — Infrastructure Decision Brief (pre-deployment)

**Purpose:** compare deployment options for AN ACT as it exists today, and recommend a path for (A) the first guided technical pilot, (B) later production scale, and (C) what to avoid. **No implementation, no provisioning** — decision input only.

**What we are placing.** A stateless **Fastify** backend (long-lived process, pooled connections, we have a `Dockerfile`), a **React/Vite** static SPA, **PostgreSQL** (the source of truth — identity, contracts, execution, evidence metadata, trust events, double-entry financial ledger), **Redis** (sessions, token store, idempotency — a hard runtime dependency), **S3-compatible** object storage (evidence blobs), DB **migrations** (001→020, needs `pgcrypto`), **health checks** (`/health` readiness + `/health/live`), and **production secrets**.

**What makes AN ACT's fit-criteria unusual.** The data is *legally significant and auditable*: contracts, trust score events, and a financial ledger. That elevates three things above raw cost — **durable backups / point-in-time recovery**, **data ownership & residency** (KYC + likely EU exposure given the Wegleiter context), and a **long-lived stateful runtime** (not serverless). Payments later push toward stronger isolation and compliance.

Prices below are current as of July 2026 and will drift; treat them as directional.

---

## Option-by-option evaluation

### 1) Vercel (frontend) + Render (backend) + Render managed Postgres/Redis
- **Setup complexity:** Low. Render deploys our Dockerfile; Postgres + Key Value (Redis) are first-party; Vercel hosts the SPA. Split origin → set `APP13_CORS_ORIGINS` + `VITE_API_BASE_URL` (both already wired).
- **Cost (pilot):** Realistically **$50–95/mo**: web service Starter $7 / Standard $25, Postgres from $7 (but **PITR needs Standard ≈$95/mo**), Key Value free/low, Vercel Hobby $0 or Pro $20. Free Postgres **expires after 30 days** — unusable for real data.
- **Reliability:** Good on paid tiers; free tiers spin down (cold starts). PITR gated behind higher DB tiers.
- **Security:** Managed TLS, private networking between Render services, env-var secrets. No VPC-level isolation like AWS.
- **Scaling path:** Vertical + horizontal web scaling; DB scales to Pro Plus ($175). Ceilings lower than a cloud provider.
- **Data ownership:** Render-hosted; exportable via `pg_dump`; US-region default (EU regions available).
- **Operational burden:** Low–medium. Two providers to manage.
- **Fit for contracts/evidence/trust:** Good, *if* on paid DB with backups. Still need external S3/R2 for evidence blobs.

### 2) Railway (full-stack)
- **Setup complexity:** **Lowest.** Backend (Dockerfile), Postgres, and Redis live in one project; usage-based, billed by the second, no per-seat fees.
- **Cost (pilot):** Hobby $5/mo or Pro $20/mo including credits; a Node app + Postgres ≈ **$15–30/mo**, + Redis/worker ≈ **$40–60/mo**.
- **Reliability:** Solid for pilots; single-project blast radius. Backup/PITR guarantees weaker than a dedicated DB provider — verify snapshot cadence before trusting it with ledger data.
- **Security:** Env secrets, private networking within project. No VPC isolation.
- **Scaling path:** Vertical scaling is easy; large-scale HA/DR is not its strength — you migrate off for serious scale.
- **Data ownership:** Railway-hosted; `pg_dump` exportable; fewer region/residency guarantees.
- **Operational burden:** **Very low** — one dashboard, one bill.
- **Fit:** Excellent for a *pilot*; needs external S3/R2 for evidence; not the destination for regulated scale.

### 3) Supabase Postgres + separate backend hosting + managed Redis
- **Setup complexity:** Medium. Supabase gives excellent managed Postgres, but you **still** host the Fastify backend elsewhere (Render/Fly/Railway) and run Redis elsewhere (Upstash) — three vendors.
- **Cost (pilot):** Free tier **pauses after 1 week idle** (disqualifying for real data). Pro **$25/mo** (8 GB storage, $10 compute credit); **PITR is a +$100/mo add-on**. Plus backend host + Redis.
- **Reliability:** Strong Postgres; but the multi-vendor seams add failure points.
- **Security:** Good; RLS available (though AN ACT enforces authorization in the Fastify layer, not PostgREST).
- **Scaling path:** Postgres scales well (up to 60 TB). But you're not using Supabase's core value (Auth, PostgREST, Realtime) because AN ACT already owns auth/trust — so you pay for a platform you half-use.
- **Data ownership:** Good export; EU regions available.
- **Operational burden:** Medium–high (three providers).
- **Fit:** Medium. Fine as *just* managed Postgres, but no simpler than alternatives and the temptation to bypass the accountable Fastify core (via PostgREST/Supabase Auth) is an architectural risk.

### 4) AWS (future production architecture)
- **Shape:** SPA on S3+CloudFront; Fastify Docker on **ECS Fargate** (or App Runner); **RDS PostgreSQL Multi-AZ** with PITR; **ElastiCache Redis**; **S3** for evidence; **Secrets Manager**; **CloudWatch**; VPC isolation.
- **Setup complexity:** **High.** IAM, VPC, task definitions, Terraform/CDK.
- **Cost (pilot):** Overkill and pricier for a pilot (RDS Multi-AZ + ElastiCache + Fargate quickly exceeds $150–300/mo).
- **Reliability:** **Best.** Multi-AZ, automated backups + PITR, mature DR.
- **Security:** **Best.** VPC, security groups, KMS, IAM least-privilege, private subnets — the right posture for payments/KYC.
- **Scaling path:** Effectively unlimited; horizontal Fargate, RDS read replicas, S3.
- **Data ownership:** Strong — full region/residency control (incl. EU), your account.
- **Operational burden:** **Highest** — needs real DevOps ownership.
- **Fit:** The correct **destination** once contracts/evidence/trust volume grows and payments go live; wrong place to *start*.

### 5) Simpler pilot option (recommended): Fly.io full-stack, Docker-native
- **Shape:** Backend as a Fly **Machine** from our existing Dockerfile; **Fly Managed Postgres** (backups + HA + pooling on all plans); **Upstash Redis** (integrated, billed on the Fly invoice); evidence on **Cloudflare R2 / Tigris** (S3-compatible).
- **Setup complexity:** Low–medium; Docker-first matches what we already built; one bill.
- **Cost (pilot):** Machine ≈ **$2–20/mo**; Managed Postgres Basic **$38/mo** (incl. backups/HA); Upstash Redis usage-based (low); R2 pennies. ≈ **$50–70/mo** with real backups included.
- **Reliability/Security/Scaling:** HA Postgres and backups included at the base tier; regional placement (EU available); scales by adding Machines. Between Railway (simplicity) and AWS (control).
- **Fit:** Strong pilot fit *because backups come standard* — good for ledger/trust data without a $100 PITR add-on, and the Docker artifact is reused verbatim.

---

## Summary matrix (pilot lens)

| Criterion | Vercel+Render | Railway | Supabase+X | AWS | Fly.io |
|---|---|---|---|---|---|
| Setup complexity | Low | **Lowest** | Medium | High | Low–Med |
| Pilot cost/mo | $50–95 | **$40–60** | $25+host+Redis | $150–300 | $50–70 |
| Backups/PITR at base | PITR $95 tier | weak | PITR +$100 | **best** | **incl.** |
| Reliability | Good | Good | Good | **Best** | Good+ |
| Security posture | Good | Good | Good | **Best** | Good |
| Scaling ceiling | Medium | Low–Med | High (DB) | **Unlimited** | High |
| Data ownership/residency | Good | Fair | Good | **Best** | Good |
| Ops burden | Low–Med | **Very low** | Med–High | Highest | Low–Med |
| Fit for contracts/trust/$ | Good* | Pilot-only | Medium | **Destination** | **Strong pilot** |

\* on paid DB tier with backups.

---

## Recommendations

### A) First guided technical pilot → **Railway full-stack** (primary) or **Fly.io** (if backups-at-base matters now)
For a small, controlled, guided pilot, **Railway** wins on the criteria that matter most at this stage: lowest setup complexity and operational burden, everything (our Docker backend + Postgres + Redis) in one project, ~$40–60/mo, deployable today. Pair it with **Cloudflare R2** for evidence blobs and keep the pre-deploy `pg_dump` snapshot step from the ET-2 plan.

Choose **Fly.io** instead if you want managed-Postgres **backups/HA included at the base tier** during the pilot (recommended if the pilot will hold real contract/trust/ledger data rather than throwaway test data) — it reuses our Dockerfile verbatim and keeps a single bill.

Either way: **no free tiers** for the database (Supabase pauses at 1 week; Render free PG expires at 30 days) — pilots still hold real, auditable records.

### B) Later production scale → **AWS**
Once volume grows and payments go live, move to AWS: ECS Fargate (our container), RDS Postgres Multi-AZ with PITR, ElastiCache Redis, S3 for evidence, Secrets Manager, KMS, CloudWatch, VPC isolation. This gives the backup/DR, security posture, data-residency control, and scaling ceiling that legally-significant contracts, trust, and money require. The Dockerfile + migration runner + `/health` endpoints we built already fit this target with no code change.

### C) What NOT to use, and why
1. **Do not host the Fastify backend on Vercel serverless.** It is a long-lived, stateful server with pooled Postgres connections, persistent Redis (sessions/idempotency), and no execution-time limits — serverless cold starts and connection churn fight the architecture. Vercel is fine for the **SPA only**.
2. **Do not run pilots on free database tiers.** Supabase Free pauses after ~1 week idle; Render Free Postgres expires after 30 days and spins down. Losing contract/trust/ledger data — even in a pilot — is unacceptable and undermines the accountability model.
3. **Do not adopt Supabase as an all-in-one backend replacement.** AN ACT already owns auth, trust, and the accountable chain in Fastify. Using Supabase Auth/PostgREST would duplicate or bypass that core (the exact "second source of truth" the Reality Bridge removed). If Supabase is used at all, use it strictly as managed Postgres — and note it isn't simpler than Railway/Fly for our shape.
4. **Do not start on AWS.** Correct destination, wrong starting line — its setup and ops burden would slow the pilot for reliability the pilot doesn't yet need.

---

## Cross-cutting notes (apply to any choice)
- **Evidence storage** always needs a separate S3-compatible bucket (Cloudflare R2 recommended for cost + S3 compatibility); none of the PaaS options store blobs well natively except Fly (Tigris/R2).
- **Data residency:** if EU/GDPR applies (KYC + Wegleiter context), select EU regions from day one — cheaper than migrating later.
- **Secrets:** generate real `JWT_SECRET` (≥32 chars) and `KYC_WEBHOOK_SECRET`; the ET-2 production guard already refuses to boot on dev defaults.
- **Portability is our hedge:** because we deploy a plain Docker image + standard Postgres migrations + Redis, moving Railway/Fly → AWS later is a re-point of `DATABASE_URL`/`REDIS_URL` and an image redeploy, not a rewrite.

**Stopping here per instruction — no implementation or provisioning. Awaiting approval.**

---

### Sources
- [Render Pricing](https://render.com/pricing) · [Render Postgres plans](https://render.com/docs/postgresql-refresh) · [Render pricing overview 2026](https://kuberns.com/blogs/render-pricing/)
- [Railway Pricing](https://railway.com/pricing) · [Railway pricing plans (docs)](https://docs.railway.com/pricing/plans) · [Railway vs Render 2026](https://northflank.com/blog/railway-vs-render)
- [Supabase Pricing](https://supabase.com/pricing) · [Supabase pricing 2026 breakdown](https://uibakery.io/blog/supabase-pricing) · [Supabase vs AWS RDS pricing](https://www.bytebase.com/blog/supabase-vs-aws-database-pricing/)
- [Fly.io Pricing](https://fly.io/pricing/) · [Fly Managed Postgres](https://fly.io/docs/mpg/) · [Fly resource pricing](https://fly.io/docs/about/pricing/)
