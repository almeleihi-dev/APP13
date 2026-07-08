# AN ACT Functional Beta Sprint 3 — Project & Team Living System

## Goal

Expand AN ACT from individual contracted actions into **team-based and project-based execution** — without rebuilding brand, passport, marketplace, or contract experience shells.

## Core philosophy

A project is not one large task. A project is a **living structure of phases**, and every phase is made of **contracted actions**.

## Living loop

```
Human Professional Passport
  → Create / Join Team
  → Team Passport
  → Team Live Frame
  → Build Project
  → Project Decomposition
  → Phases
  → Actions (Micro Actions)
  → Action Contracts
  → Evidence
  → Completion
  → Trust Growth
```

## What shipped

### 1. Team System

- `TeamPassport` with team id, name, members, roles, leader, combined skills, completed actions, trust indicators, Team Live Frame tier
- Trust derived from member trust, completed contracts, evidence quality, reliability score
- `createTeam`, `joinTeam`, `listTeamsForMember`, `deriveTeamTrust`
- **My Teams** section on Personal Home with create-team flow

### 2. Build Project Experience

- Goal entry (house / app / business templates + keyword matching)
- Three execution paths: **Fast**, **Balanced**, **Step-by-Step**
- Decomposition: Project → Phases → Sub-phases → Micro Actions
- Each micro action can become individual or team contract

### 3. Pay-per-phase execution

- **Pay Phase** → phase in progress (no full funding required)
- **Complete Phase** with evidence → unlock next phase
- Progress, trust, and Live Frame health update incrementally

### 4. Project Live Frame

- Project Passport: progress %, completed phases, active contracts, team, evidence history, risk indicators
- Live Frame panel: health, completion %, trust level, execution status

### 5. Deep decomposition engine

- Templates: build-house, launch-app, open-business
- Path multipliers adjust cost/time per Fast / Balanced / Step-by-Step
- Micro actions carry owner, cost, time, contract link, evidence, completion status

### 6. AN ACT core preserved

All micro actions contract through existing **Action → Contract → Evidence → Trust** layer (`contractProjectMicroAction`).

## Verification

```bash
npm run verify:mvp-functional-beta-sprint3
```

## Remaining production gaps

- **Persistence**: localStorage only — no multi-user team sync or project collaboration server
- **Team identity**: team passport is beta-local; no org SSO or verified team registration
- **Funding**: pay-phase is recorded amount only — no payment processor integration
- **Contract completion sync**: micro-action status does not auto-sync when contracts complete in Need MVP flow (manual re-open project)
- **Marketplace matching**: micro actions do not auto-match to marketplace professionals
- **Scheduling**: no calendar, dependencies, or critical path beyond phase unlock order
- **Legal**: team and project layers are operational UX, not enforceable agreements

## Key files

| Area | Path |
|------|------|
| Types (v3) | `apps/web/src/lib/living-platform/types.ts` |
| Storage migration | `apps/web/src/lib/living-platform/living-platform-storage.ts` |
| Team store | `apps/web/src/lib/living-platform/team-passport-store.ts` |
| Decomposition | `apps/web/src/lib/living-platform/project-decomposition-engine.ts` |
| Project store | `apps/web/src/lib/living-platform/project-living-store.ts` |
| Build Project UI | `apps/web/src/components/project-living/BuildProjectExperience.tsx` |
| Team UI | `apps/web/src/components/team-living/TeamPassportCard.tsx` |
| Page | `apps/web/src/pages/BuildProjectPage.tsx` |
| Personal Home | `apps/web/src/passport/personal-home-presentation.ts` |
| Router | `apps/web/src/PlatformApp.tsx` |
| Styles | `apps/web/src/styles/an-act-functional-beta-sprint3.css` |
| Tests | `test/mvp-functional-beta-sprint3.test.ts` |
