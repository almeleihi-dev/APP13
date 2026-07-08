# AN ACT — Social Preview Report

**Date:** 2026-07-02  
**Production share URL (after domain attach):** https://anact.app/

---

## Summary

Premium social sharing metadata is configured for **Open Graph** and **Twitter/X (`summary_large_image`)** using the official AN ACT identity on a graphite background with green illumination.

---

## Open Graph contract

| Property | Value |
|---|---|
| `og:type` | website |
| `og:site_name` | AN ACT |
| `og:title` | AN ACT |
| `og:description` | Where professional requirement becomes trusted action. |
| `og:url` | https://anact.app/ |
| `og:locale` | en_US |
| `og:image` | https://anact.app/og/an-act-og.png |
| `og:image:width` | 1200 |
| `og:image:height` | 630 |
| `og:image:alt` | AN ACT — premium enterprise runtime identity on graphite background with green illumination |

---

## Twitter / X card

| Property | Value |
|---|---|
| `twitter:card` | summary_large_image |
| `twitter:title` | AN ACT |
| `twitter:description` | Where professional requirement becomes trusted action. |
| `twitter:image` | https://anact.app/og/an-act-og.png |
| `twitter:image:alt` | (same as OG alt) |

---

## Share image assets

| Asset | Path | Dimensions |
|---|---|---|
| Source SVG | `apps/web/public/og/an-act-og.svg` | 1200×630 |
| Production PNG | `apps/web/public/og/an-act-og.png` | 1200×630 |

### Visual design

- **Background:** Graphite gradient (`#050505` → `#1a1a1a`)
- **Illumination:** Green radial glow (`#3ecf8e`)
- **Identity:** Official “an act” keyboard-key wordmark
- **Headline:** AN ACT
- **Tagline:** Where professional requirement becomes trusted action.
- **Accent line:** ENTERPRISE RUNTIME · LIVE FRAME · TRUST ARCHITECTURE

Regenerate PNG from SVG:

```bash
./scripts/generate-an-act-public-assets.sh
```

---

## Platform validation checklist

After **anact.app** is live, validate previews:

| Platform | Tool | Expected |
|---|---|---|
| **LinkedIn** | Post Inspector | Large image, title, description |
| **Facebook** | Sharing Debugger | 1200×630 image, no scrape errors |
| **Twitter/X** | Card Validator | `summary_large_image` |
| **iMessage / Slack** | Paste URL | Rich preview with image |
| **Discord** | Paste URL | Embed with OG image |

### Pre-domain testing (Vercel alias)

Until `anact.app` is attached, OG URLs in metadata point to `anact.app` — previews will **not** resolve images until DNS is live. For interim testing on `*.vercel.app`, temporarily set `VITE_AN_ACT_SITE_URL` to the Vercel URL and rebuild (marketing should wait for custom domain).

---

## Quality review

| Check | Status |
|---|---|
| Title matches brand (**AN ACT**) | ✅ |
| Description matches landing hero narrative | ✅ |
| Image uses official identity + premium palette | ✅ |
| PNG dimensions correct for large cards | ✅ 1200×630 |
| Alt text present for accessibility | ✅ |
| No runtime/API URLs in social metadata | ✅ |

---

## Sample link preview (text)

```
AN ACT
Where professional requirement becomes trusted action.
[Premium black/graphite card with green glow and “an act” key mark]
anact.app
```

**Social preview readiness:** ✅ **Ready** for public sharing once `anact.app` is attached and redeployed.
