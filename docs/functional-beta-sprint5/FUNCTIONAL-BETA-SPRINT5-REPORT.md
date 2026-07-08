# Functional Beta Sprint 5 — Action Intelligence Engine

## Summary

Sprint 5 makes an act transform goals and human abilities into real executable actions without rebuilding brand, passport, Live Frame, contracts, teams, projects, or the Contract Economy Engine.

## Parts delivered

### Part 1 — Goal → Action Breakdown
- `buildGoalActionBreakdown()` uses Sprint 3 `matchProjectTemplate` templates (not fake preview data)
- `/preview` shows phased breakdown with Start now (first 1–3 actions), contract-ready state, evidence, value, time, scope

### Part 2 — Human Ability → Action Inventory
- `discoverActionInventory()` from skills, certificates, experience, talents, completed contracts
- Categories: Ready Now, Needs Verification, Unlockable
- User controls: Activate, Remove, Edit, Add missing ability

### Part 3 — Living Professional Growth
- `syncActionInventoryForIdentity()` on passport create/update and contract completion
- `PassportGrowthEvent` — e.g. "3 new actions unlocked"

### Part 4 — Opportunity Intelligence
- `buildOpportunityAlerts()` connects active inventory to Contract Economy demand signals
- Personal Home surfaces opportunity headlines

### Part 5 — Matching Foundation
- `matchNeedsToInventory()` links Need ↔ Action Inventory ↔ Contract creation readiness

## Verification

```bash
npm run verify:action-intelligence-engine
```

## Examples

### Goal → Actions
Goal: `"I want to build a mobile app"` → **16 acts** (launch-app template), Start now: User research sprint, Competitive analysis, Product requirements doc

### CV/Skills → Action Inventory
Software engineer passport → discovers actions like Software feature delivery, QA test cycle, DevOps production deployment

### Passport growth
New certificate added → `"3 new actions unlocked"` growth event on Personal Home

### Economy connection
Active inventory item in high-demand category → `"Demand is increasing… Technical inspection requests +28%"`

## Remaining gaps

- Server-backed inventory sync and authoritative demand data (planned Sprint 6+)
- Launch goal draft does not auto-create living project (user opens Build Project separately)
- Matching foundation is read-only preview — no auto-contract from match yet
- PDF/DOCX ability extraction not supported (First Input limitation carries over)
