# X10 Live Trust Frame Experience

**Date:** 2026-06-19  
**Scope:** Read-only live trust frame projection (X10)  
**Status:** Complete

## Summary

X10 composes a unified Live Trust Frame from X7 trust overview, X9 professional passport level, and X9.5 verification economy/seals. It computes a weighted frame score, applies deterministic dispute downgrade rules, exposes frame signals, and maps to Bronze–Elite frame levels without schema changes or AI dependencies.

## Architecture

```
Provider user
  → live trust frame repository snapshot
      X9.5 seals snapshot (S6 + S5 + credentials)
      X7 trust overview
      X9 passport level assessment
      X9.5 verification economy
  → weighted frame score + dispute downgrade + signals
  → LiveTrustFrameExperienceView
```

## Frame Score Weights

| Component | Weight | Source |
|---|---:|---|
| Trust | 40% | X7 trust overview / S5 trust score |
| Passport | 25% | X9 passport level score mapping |
| Economy | 15% | X9.5 verification economy tier score |
| Completion | 10% | S6 completion rate |
| Rating | 10% | S6 average customer rating |

## Frame Levels

| Level | Raw score threshold |
|---|---:|
| Bronze | 0–49 |
| Silver | 50–64 |
| Gold | 65–79 |
| Platinum | 80–89 |
| Elite | 90+ |

Dispute downgrade rules may reduce level and score after raw calculation.

## Dispute Downgrade Rules

| Condition | Effect |
|---|---|
| 1 active dispute | −1 frame level, −10 score |
| 2+ active disputes | −2 frame levels, −20 score |
| Unresolved disputes | −5 score each (max −15), may downgrade level |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/live-trust-frame` | Full live trust frame experience |
| `GET` | `/live-trust-frame/score` | Frame score breakdown |
| `GET` | `/live-trust-frame/level` | Frame level assessment |
| `GET` | `/live-trust-frame/signals` | Frame signals |
| `GET` | `/live-trust-frame/public` | Safe public frame card (`?user_id=` optional) |

Provider-only endpoints return 404 for non-provider accounts.

## Verification

```bash
npm run test:x10-live-trust-frame
npm run verify:x10
```

`verify:x10` runs the X9.5 regression suite, X10 tests, build, and import lint.

## Constraints

- Read-only projections only
- No schema changes
- No business rule changes in X7/X9/X9.5 engines
- Deterministic calculations only
- No AI dependencies
