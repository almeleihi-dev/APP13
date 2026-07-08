# AN ACT Functional Beta Sprint 4 — Contract Economy Engine

## Goal

Transform AN ACT from a platform that creates contracts into a **living contract economy** — without rebuilding brand, passport, marketplace, contracts, teams, or projects.

## Philosophy

Contracts are the fuel of AN ACT. Every completed contract becomes intelligence that powers matching, pricing, trust, and future insurance readiness.

## Flow

```
Human → Action → Contract → Execution → Evidence → Completion
  → Economy Signal → Better Matching → Better Pricing → Better Trust → Insurance Readiness
```

## What shipped

### Contract Economy Ledger
- Tracks created, active, completed, cancelled contracts
- Contract value, completion rate, execution time, evidence confirmation rate
- Scope breakdown: individual, team, project micro-action contracts
- Signals recorded on contract completion

### Action Market Intelligence
- `ActionIntelligenceProfile` per category (demand, supply, avg value, delivery, reliability, shortage)
- Categories: Mobile App Design, Software Development, Underwater Welding, Construction, etc.
- Trending actions and growing market detection

### Dynamic Action Value Engine
- Guidance: **Low / Fair / Premium** (not fixed pricing)
- Factors: demand, supply, trust, completion history, evidence quality, urgency

### Scarcity & Uniqueness Signals
- Rare Action Signal when high demand + low supply
- Example: Certified Underwater Welding

### AN ACT Revenue Engine
- GCV, platform revenue estimate (8% fee), avg contract value
- Contracts per day / minute, economy growth index

### Insurance Readiness Layer
- Risk level, failure rate, verified evidence %, provider reliability
- Readiness signals only — no insurance product

### Economy Dashboard
- Global Contract Pulse, Action Economy, Trust Economy, Platform Health, Insurance Readiness
- Personal Home: Contract Economy Pulse + link to full economy view

## Verification

```bash
npm run verify:mvp-functional-beta-sprint4
```

## Remaining production gaps

- **Live data volume**: category seeds augment sparse local contract history
- **No payment rails**: GCV is estimated value, not settled funds
- **No dispute tracking**: insurance readiness uses cancellation proxy only
- **Cross-user economy**: localStorage — no global marketplace-wide ledger
- **Auto-matching**: intelligence displayed but not yet wired to marketplace search ranking
- **Insurance**: readiness scores only — no underwriting or policy products

## Key files

| Area | Path |
|------|------|
| Types (v4) | `apps/web/src/lib/living-platform/types.ts` |
| Ledger | `apps/web/src/lib/living-platform/economy/contract-economy-ledger.ts` |
| Intelligence | `economy/action-intelligence-engine.ts` |
| Value engine | `economy/action-value-engine.ts` |
| Scarcity | `economy/scarcity-signals-engine.ts` |
| Revenue | `economy/revenue-engine.ts` |
| Insurance | `economy/insurance-readiness-engine.ts` |
| Presentation | `economy/economy-presentation.ts` |
| Dashboard UI | `components/economy-living/EconomyDashboardExperience.tsx` |
| Page | `pages/EconomyDashboardPage.tsx` |
