# CH2-X14 — Living Professional Intelligence Center

## Mission

Build the Living Professional Intelligence Center — the reasoning layer of the Living Experience. One question. One intelligent answer.

**Experience only. Read-only. Recommendation only.**

## Philosophy

The Intelligence Center combines every living experience into one explainable recommendation. Every answer explains: Why, How, Benefit, Requirements, Alternatives, and Confidence.

## Architecture

```
src/living-experience/professional-intelligence/
  domain/
    intelligence-schema.ts
    intelligence-context.ts
    intelligence-sections.ts
    intelligence-experience.ts
  application/
    living-professional-intelligence-service.ts
    intelligence-collector.ts
  infrastructure/
    living-professional-intelligence-repository.ts
```

Routes use `/living-professional-intelligence/*`.

## Layout (13 Sections)

1. Intelligence Summary — overall understanding and main recommendation
2. Ask Anything — natural language with explainable sources
3. Today's Best Decision — exactly one recommendation
4. Professional Analysis — unified passport/journey/impact/coach/planner/identity
5. Professional Opportunities Analysis — evaluate, compare, rank
6. Professional Risks — explainable risk alerts
7. Professional Strengths Analysis — competitive advantages
8. Professional Gaps — improvement path
9. Recommended Next Steps — one primary path
10. Alternative Paths — career, learning, partner, marketplace tradeoffs
11. Decision Simulator — projected outcomes with assumptions
12. Confidence & Explanation — evidence and reasoning
13. Professional Intelligence History — accepted/ignored recommendations

## Intelligence Rules

- Never decide for the user
- Never fabricate reasoning or data
- Always explain conclusions and declare assumptions
- Ask Anything never hallucinates — always cites sources

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/living-professional-intelligence` | Full intelligence experience |
| POST | `/living-professional-intelligence/ask` | Natural language question |
| GET | `/living-professional-intelligence/best-decision` | Today's best decision |
| GET | `/living-professional-intelligence/analysis` | Unified professional analysis |
| GET | `/living-professional-intelligence/simulator` | Decision simulator |
| GET | `/living-professional-intelligence/confidence` | Confidence & explanation |
| POST | `/living-professional-intelligence/accept` | Record accepted recommendation |
| POST | `/living-professional-intelligence/ignore` | Record ignored recommendation |
| POST | `/living-professional-intelligence/refresh` | Refresh experience |

## Verification

```bash
npm run verify:ch2-x14
```
