# AN ACT — Domain Readiness Report

**Production domain:** https://anact.app  
**Current Vercel production alias:** https://web-eight-virid-61.vercel.app  
**Date:** 2026-07-02

---

## Summary

The project is configured so that **all production metadata and canonical URLs resolve to `https://anact.app`** once the custom domain is attached in Vercel. No runtime or routing logic was modified.

---

## Canonical URL strategy

Production builds inject the site URL from:

```
apps/web/.env.production
VITE_AN_ACT_SITE_URL=https://anact.app
```

Vite replaces `%VITE_AN_ACT_SITE_URL%` in `index.html` at build time. Verified in `apps/web/dist/index.html`:

- `link rel="canonical"` → `https://anact.app/`
- `og:url` → `https://anact.app/`
- `og:image` → `https://anact.app/og/an-act-og.png`
- `twitter:image` → `https://anact.app/og/an-act-og.png`

---

## Static discovery files

| File | Production URL |
|---|---|
| `robots.txt` | https://anact.app/robots.txt |
| `sitemap.xml` | https://anact.app/sitemap.xml |

**robots.txt** allows all crawlers and references the sitemap.  
**sitemap.xml** lists the canonical landing URL (`/`).

---

## Vercel attachment checklist

When ready to go live on **anact.app**:

1. **Vercel Dashboard** → Project `an-act/web` → **Settings** → **Domains**
2. Add domain: `anact.app`
3. Add redirect (recommended): `www.anact.app` → `anact.app` (301)
4. Configure DNS at registrar per Vercel instructions (typically `A`/`CNAME` to Vercel)
5. Wait for SSL certificate provisioning (automatic)
6. Redeploy production (or promote latest) after DNS propagates
7. Verify:
   - https://anact.app/ loads premium landing
   - https://anact.app/robots.txt
   - https://anact.app/sitemap.xml
   - https://anact.app/og/an-act-og.png
   - View page source — canonical and OG URLs show `anact.app`

---

## Deployment configuration (unchanged monorepo)

| Setting | Value |
|---|---|
| Vercel root | Repository root (`vercel.json`) |
| Install | `npm ci --workspaces --include-workspace-root` |
| Build | `npm run sync:tokens && npm --prefix apps/web run build` |
| Output | `apps/web/dist` |

Redeploy after identity changes:

```bash
npx vercel deploy --prod --yes --project web
```

---

## Local development note

Local dev (`npm run dev:web`) does **not** use `.env.production`. Canonical/OG tags in dev may show unreplaced `%VITE_AN_ACT_SITE_URL%` unless `.env.development` is added — this is intentional; production identity targets `anact.app` only.

Optional local override (not required):

```
# apps/web/.env.development
VITE_AN_ACT_SITE_URL=http://127.0.0.1:5173
```

---

## Risks before domain attach

| Risk | Mitigation |
|---|---|
| Social previews on `*.vercel.app` use wrong domain in shares | Attach `anact.app` before public marketing |
| DNS propagation delay | Allow up to 48h; verify with `dig anact.app` |
| Mixed content | Site is static HTTPS-only — no issues expected |

**Domain readiness:** ✅ **Prepared** — attach `anact.app` in Vercel to complete.
