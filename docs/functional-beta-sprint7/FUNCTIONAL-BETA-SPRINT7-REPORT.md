# Functional Beta Sprint 7 — Global Language & Location Foundation

## Flow summary

1. **Language selector** on splash, guest entry, act builder, and passport — English 🇬🇧, Deutsch 🇩🇪, العربية 🇸🇦 (RTL).
2. **Multilingual input** normalizes professions and goals to English canonical forms before Action Intelligence matching.
3. **Professional Passport** stores geo profile: country, city, region, time zone, service radius, availability (remote/local/hybrid), languages.
4. **Action Inventory** items include `executionLocation` (remote / local / hybrid).
5. **Projects** include `projectLocation` with remote vs local team needs per template.
6. **Team Passport** includes `globalCapability` (locations, languages, coverage).
7. **Marketplace** exposes location scope filters: near me, same city, same country, worldwide + language + remote-only.
8. **Guest mode** supports language switch and multilingual goal/profession input without registration.

## Language support

| Locale | UI | RTL | Input normalization |
|--------|----|-----|---------------------|
| `en` | ✅ | — | baseline |
| `de` | ✅ | — | Bauingenieur, Steuerberater, Ich möchte eine App erstellen |
| `ar` | ✅ | ✅ | مهندس إنشاءات, محاسب قانوني, أريد بناء تطبيق |

Brand **an act** is never translated.

## Multilingual examples

| Input | Canonical | Result |
|-------|-----------|--------|
| Bauingenieur | civil engineer | Same profession profile & Action Inventory |
| Steuerberater | certified accountant | Accountant profile |
| Ich möchte eine App erstellen | I want to build a mobile app | `launch-app` template → phases → actions |
| أريد بناء تطبيق | I want to build a mobile app | Same decomposition |

## Location system

- **Passport:** `GeoLocationProfile` on `PersonalProfessionalPassport`
- **Actions:** `executionLocation` on `ActionInventoryItem`
- **Projects:** `projectLocation` on `LivingProject`
- **Teams:** `globalCapability` on `TeamPassport`
- **Storage:** Living platform migrated to **version 6**
- **Map-ready:** optional lat/lng; city/country required for filters

## Marketplace filters

- Scope: `near_me` | `same_city` | `same_country` | `worldwide`
- Language filter (en/de/ar)
- Remote availability toggle

## Verification

```bash
npm run verify:global-language-location
```

## Remaining gaps

- Full UI string coverage (many platform pages still English-only)
- Map view, distance matching, local demand heatmap (future)
- Automatic timezone/locale detection from browser only at init
- Marketplace language filter uses keyword/certification heuristics, not structured provider languages yet
