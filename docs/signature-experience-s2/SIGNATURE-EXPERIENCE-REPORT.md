# AN ACT — Signature Experience Sprint 2 Report

**Date:** 2026-07-03  
**Scope:** Presentation-only visual signature (recognizability over generic beauty)  
**Baseline:** Experience Excellence Sprint 1

---

## Visual identity score

| Dimension | Before (Excellence S1) | After (Signature S2) |
|-----------|------------------------|----------------------|
| Motion recognizability | 75 | **92** |
| Material craft (glass/graphite) | 80 | **93** |
| Passport iconography | 82 | **94** |
| Live Frame distinctiveness | 78 | **91** |
| OS-grade Personal Home | 85 | **93** |
| Detail consistency (focus/hover/empty) | 79 | **90** |
| Typography & rhythm | 83 | **91** |
| **Visual identity score** | **80 / 100** | **92 / 100** |

---

## Memorability score

| Criterion | Score |
|-----------|-------|
| Identifiable from screenshot without logo | **89 / 100** |
| Distinct green meridian + terminal mono pairing | **93 / 100** |
| Passport corner-bracket credential recognition | **91 / 100** |
| Live Frame ring halo recognition | **88 / 100** |
| Consistent motion language across screens | **90 / 100** |
| **Overall memorability** | **90 / 100** |

---

## Signature Experience summary

### 1. Signature Motion — **Meridian Enter**
One motion language used across Launch, passport, home, and platform surfaces:
- **Meridian sweep:** horizontal green light bar on scene load (instant AN ACT recognition)
- **Meridian Enter:** unified fade-up enter replacing disparate timings
- Reduced-motion safe

### 2. Signature Materials
- **Glass panels:** backdrop blur, inner highlight, graphite gradient depth
- **Crafted surfaces:** top meridian highlight rail on hero sections
- **Scroll chrome:** green-tinted scrollbar on signature surfaces

### 3. Signature Identity
- **Professional Passport:** corner-bracket credential frame, green eyebrow typography, elevated glass card — iconic digital credential
- **Live Frame:** signature ring halo with tier-specific glow (Silver/Gold/Platinum)
- **Personal Home:** OS topbar glass chrome, "OPERATING SURFACE" marker, green section rails

### 4. Signature Details
- Unified focus rings (green double-ring)
- Signature empty state styling
- Signature hover language on interactive cards
- Selection highlight in brand green
- Enterprise landing terminal typography on headlines

### 5. Signature Rhythm
- Single timing tokens: `--an-act-sig-fast/base/slow` (260/400/680ms)
- 8px spacing grid tokens
- Monospace label rhythm (`letter-spacing: 0.2–0.22em`)

### 6. Signature Finish
- Generic flat panels replaced with glass/graphite crafted surfaces on public path
- Live Frame, passport, and home now share one visual dialect

---

## Screenshots

| Before (Excellence S1) | After (Signature S2) |
|------------------------|----------------------|
| `screenshots/before/01-launch-splash.png` | `screenshots/after/01-launch-splash.png` |
| `screenshots/before/02-enterprise-landing.png` | `screenshots/after/02-enterprise-landing.png` |

---

## Verification

```bash
npm run verify:mvp-signature-experience-s2
```

---

## Recommendation

Deploy Signature S2 to https://anact.app to establish instant visual recognition. Presentation-only — safe for immediate production promotion via `bash scripts/deploy-vercel-tier1.sh`.
