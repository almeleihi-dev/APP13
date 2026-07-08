# AN ACT Functional Beta Sprint 2 — Contracted Living Actions

## Goal

Move AN ACT from completed actions into **trusted contracted actions** without rebuilding existing UI shells.

## Living loop

```
Professional Passport
  → Create Action
  → Publish
  → Request
  → Generate Action Contract
  → Accept
  → Execute
  → Evidence
  → Complete
  → Trust Growth
  → Passport History
```

## What shipped

### Action Contract layer (`living-platform` v2)

- `ActionContract` with contract id, parties, action details, agreement state, execution state, timestamps, evidence
- Shared storage with v1 → v2 migration (`contracts[]`, `passportHistory`)
- Contract store: create, accept, advance execution, attach/confirm evidence, complete

### Request → Contract connection

- `createServiceRequest` generates a contract record alongside the service request
- Catalog/sample providers (no published action id) auto-accept on requester side
- Published actions require owner acceptance, evidence, and confirmation before completion

### Contract Experience UI

- `ActionContractExperience` — parties, action details, status, progress timeline, evidence attach/confirm, accept/advance/complete
- Need MVP flow routes success → **View Action Contract** → contract stage

### Passport integration

- Completed contracts append to `passportHistory` for both parties
- Trust indicators gain **Contract-backed delivery**
- Personal Home surfaces **Active Contracts** and **Contract History**

## Verification

```bash
npm run verify:mvp-functional-beta-sprint2
```

## Remaining production gaps

- **Persistence**: localStorage only — no server-side contract ledger or dispute resolution
- **Identity**: passport keys derived from display name — not cryptographically bound
- **Evidence**: beta attachment labels/descriptions only — no file upload, hash, or third-party attestation
- **Multi-party**: two-party contracts only — no escrow, amendments, or partial completion
- **Notifications**: no push/email when contract state changes
- **Marketplace owner inbox**: action owners cannot yet browse incoming contract requests from Personal Home deep links
- **Legal**: contract layer is operational UX, not enforceable legal agreement

## Key files

| Area | Path |
|------|------|
| Types | `apps/web/src/lib/living-platform/types.ts` |
| Storage | `apps/web/src/lib/living-platform/living-platform-storage.ts` |
| Contract store | `apps/web/src/lib/living-platform/action-contract-store.ts` |
| Request integration | `apps/web/src/lib/living-platform/professional-action-store.ts` |
| Contract UI | `apps/web/src/components/need-mvp/ActionContractExperience.tsx` |
| Need flow wiring | `apps/web/src/components/need-mvp/NeedMvpFlow.tsx`, `useNeedPresentation.ts` |
| Personal Home | `apps/web/src/passport/personal-home-presentation.ts` |
| Styles | `apps/web/src/styles/an-act-functional-beta-sprint2.css` |
| Tests | `test/mvp-functional-beta-sprint2.test.ts` |
