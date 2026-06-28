# CH2-X19 — Living Professional Timeline

## Mission

Build the Living Professional Timeline experience — organize the complete professional journey into a chronological, explainable, and continuously evolving timeline.

**Experience only. Read-only. Organizes only. Never modifies history.**

## Architecture

```
src/living-experience/professional-timeline/
  domain/
    timeline-schema.ts
    timeline-context.ts
    timeline-sections.ts
    timeline-experience.ts
  application/
    living-professional-timeline-service.ts
    timeline-collector.ts
  infrastructure/
    living-professional-timeline-repository.ts
```

Routes use `/living-professional-timeline/*`.

## Layout (13 Sections)

1. Timeline Summary — overview with timeline engine
2. Professional Beginning — origin events
3. Education & Learning Timeline — certifications and learning
4. Career Timeline — career progression
5. Skills Evolution — skill development over time
6. Achievement Timeline — achievement milestones
7. Financial Timeline — financial readiness progression
8. Leadership Timeline — leadership development
9. Major Turning Points — pivotal career moments
10. Future Timeline Projection — projected milestones
11. Timeline Insights — unified timeline insights
12. Confidence & Explanation — evidence-based confidence
13. Timeline History — accepted/ignored insight records

## Timeline Event Contract

Every event includes:

- id, title, description, category, timestamp, chronological_order
- importance_level, source, evidence, related_entities
- impact_score, confidence_score, explanation, recommendations

## Timeline Engine

Deterministic generation producing:

- chronological_professional_history, milestone_sequence, turning_points
- career/learning/achievement/financial progression
- projected_future_events, timeline_health_score, timeline_completeness_score

## Experience Rules

- `organizes_only: true`
- `never_modify_user_history: true`
- `never_reorder_real_events: true`

## Verification

```bash
npm run verify:ch2-x19
```
