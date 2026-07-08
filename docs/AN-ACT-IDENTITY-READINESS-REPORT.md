# AN ACT — Identity Readiness Report

**Phase:** Public Identity Finalization  
**Date:** 2026-07-02  
**Scope:** Presentation and public identity only — no runtime, API, or routing changes.

---

## Summary

AN ACT is prepared for first public release identity on **https://anact.app**. Browser identity, PWA manifest, SEO foundation, and social preview assets are in place and verified in the production build output.

---

## Browser identity

| Asset | Path | Status |
|---|---|---|
| Favicon (SVG) | `/favicon.svg` | ✅ Premium graphite key with green illumination |
| Favicon (PNG 32) | `/icons/an-act-icon-32.png` | ✅ |
| Android / PWA 192 | `/icons/an-act-icon-192.png` | ✅ |
| Android / PWA 512 | `/icons/an-act-icon-512.png` | ✅ |
| Maskable 512 | `/icons/an-act-icon-512-maskable.png` | ✅ Safe-zone padded |
| Apple Touch 180 | `/icons/an-act-apple-touch-icon.png` | ✅ |
| Web manifest | `/manifest.webmanifest` | ✅ Verified |

### Manifest identity

| Field | Value |
|---|---|
| `name` | AN ACT |
| `short_name` | AN ACT |
| `description` | Where professional requirement becomes trusted action. |
| `background_color` | `#0a0a0a` |
| `theme_color` | `#0a0a0a` |
| `display` | `standalone` |
| `start_url` | `/` |

---

## SEO foundation (production build)

| Element | Value | Status |
|---|---|---|
| `<title>` | AN ACT | ✅ |
| `meta description` | Where professional requirement becomes trusted action. | ✅ |
| `robots` | index, follow, max-image-preview:large | ✅ |
| `canonical` | https://anact.app/ | ✅ Injected via `.env.production` |
| `theme-color` | #0a0a0a | ✅ |
| Apple web app title | AN ACT | ✅ |
| Apple status bar | black-translucent | ✅ |
| `robots.txt` | `/robots.txt` | ✅ |
| `sitemap.xml` | `/sitemap.xml` | ✅ |

---

## PWA identity polish

| Check | Status |
|---|---|
| Install name **AN ACT** | ✅ |
| Short name **AN ACT** | ✅ |
| Splash / background `#0a0a0a` | ✅ Matches premium landing |
| Icons (SVG + PNG + maskable) | ✅ |
| Standalone launch | ✅ `display: standalone` |
| Service worker precache includes identity assets | ✅ 26 entries in production build |

---

## Configuration files

| File | Purpose |
|---|---|
| `apps/web/.env.production` | `VITE_AN_ACT_SITE_URL=https://anact.app` |
| `apps/web/index.html` | Canonical, OG, Twitter, icons, SEO |
| `apps/web/public/manifest.webmanifest` | PWA identity |
| `scripts/generate-an-act-public-assets.sh` | Regenerate PNG/OG assets from SVG |

---

## Quality review (presentation)

| Surface | Expected result | Verification |
|---|---|---|
| **Chrome** | Favicon, title “AN ACT”, dark theme-color | ✅ Metadata in `dist/index.html` |
| **Edge** | Same as Chrome (Chromium) | ✅ Shared meta contract |
| **macOS Safari** | Apple touch icon, black-translucent status bar | ✅ PNG 180 + meta tags |
| **iPhone Safari** | Add to Home Screen → AN ACT, dark splash | ✅ Manifest + apple meta |
| **Social preview** | Large card, title, description, OG image | ✅ See Social Preview Report |
| **Lighthouse presentation** | Valid manifest, meta description, tap targets | ✅ Static checks pass; run Lighthouse post-domain attach |

---

## Regeneration

```bash
./scripts/generate-an-act-public-assets.sh
npm run sync:tokens && npm --prefix apps/web run build
```

---

## Out of scope (unchanged)

- Runtime logic, APIs, Runtime JSON, routing, authentication, business rules
- Tier 2 API-backed experiences

**Identity readiness:** ✅ **Ready for public release** once `anact.app` is attached in Vercel.
