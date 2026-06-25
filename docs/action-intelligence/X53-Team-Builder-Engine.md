# X53 Team Builder Engine

**Date:** 2026-06-20  
**Scope:** Action Intelligence Layer — team builder (X53)  
**Status:** Complete

## Summary

X53 intelligently builds professional teams for marketplace actions by analyzing skills, trust, compatibility, availability, experience, and project requirements. The engine recommends balanced teams with explainable scores — it does not execute contracts, assign providers automatically, process payments, or replace customer decisions.

## Philosophy

The engine continuously answers: **"What is the best team for this work?"**

A team is a balanced combination of skills, trust, experience, and compatibility.

## Team Roles

- Team Leader
- Technical Expert
- Field Specialist
- Quality Reviewer
- Supervisor
- Safety Officer
- Consultant
- Apprentice

Members may hold multiple compatible roles.

## Core Outputs

- Team recommendations with members, roles, and team leader
- Compatibility analysis (skills, trust, proximity, experience)
- Team readiness score (professional, coverage, trust, availability)
- Skill coverage and missing roles
- Team strengths, risks, and completion confidence

## Routes

| Method | Path | Auth |
|---|---|---|
| GET | `/team-builder` | authenticated |
| GET | `/team-builder/recommendations` | authenticated |
| GET | `/team-builder/readiness` | authenticated |
| GET | `/team-builder/compatibility` | authenticated |
| GET | `/team-builder/members` | authenticated |
| GET | `/team-builder/coverage` | authenticated |
| GET | `/team-builder/risks` | authenticated |
| GET | `/team-builder/summary` | authenticated |
| POST | `/team-builder/refresh` | authenticated |
| GET | `/team-builder/statistics` | platform_admin |

Optional query/body parameter: `listing_id`

## Architecture

```
src/team-builder/
  domain/team-builder-schema.ts
  domain/team-builder-context.ts
  domain/team-builder-profile.ts
  application/team-builder-service.ts
  infrastructure/team-builder-repository.ts
  module.ts
```

## Verification

```bash
npm run verify:x53
```

Chains: `verify:x53` → `verify:x52` → build → `lint:imports`

## Constraints

- Read-only architecture
- Deterministic, explainable team recommendations
- No contract execution, auto-assignment, or marketplace mutation
