# CH3-X2 — AN ACT Core UI Components

## Mission

Transform the CH3-X1 Design System into production-ready, framework-independent component specifications. Every future AN ACT screen must consume this library.

**No runtime rendering. No Bubble. Specifications only.**

## Architecture

```
src/design-system/core-ui/
  foundation/
    component-schema.ts
    component-context.ts
  components/
    button.ts, input.ts, search.ts, card.ts, ...
  validation/
    component-validator.ts
  registry/
    component-registry.ts
  module.ts
```

## Component Philosophy

- Every component defines id, name, purpose, variants, states, accessibility, tokens, spacing, typography, elevation, motion, and responsive behavior
- All colors reference CH3-X1 semantic tokens
- Validators enforce completeness and token compliance

## Component Catalog (22)

| Component | Variants / Notes |
|-----------|-------------------|
| Button | Primary, Secondary, Ghost, Danger, Success, Disabled |
| Input | Text, Email, Password, Number, Search, Phone, Multiline |
| Search | Pill search field |
| Card | Standard, Elevated |
| Timeline / Achievement / Analytics / Contract / Recommendation Cards | Specialized card specs |
| Live Frame | Bronze, Silver, Gold, Platinum, Diamond |
| Professional Badge | Verified, Licensed, Certified, Government, Elite |
| Avatar | Image, Initials, Status, Live Frame Overlay |
| Progress | Linear, Circular, Terminal |
| Navigation | Top, Side, Bottom, FAB |
| Modal / Dialog / Sheet / Toast | Overlay patterns |
| Loading | Official transition screen |

## Official Transition Screen

- Brand line: `an act...`
- Dynamic stages: Preparing..., Matching..., Building Contract..., Securing..., Action Ready.
- Background: Need Mode → Transition → Action Mode (reverse supported)
- Progress bar with semantic tokens

## Verification

```bash
npm run verify:ch3-x2
```
