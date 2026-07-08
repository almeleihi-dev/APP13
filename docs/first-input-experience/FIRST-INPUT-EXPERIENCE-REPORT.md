# AN ACT — First Input Experience Sprint

## Issue

First real user test: Voice and File tabs appeared available but only Write worked — users naturally tried inactive inputs.

## Solution (Option B)

Activated **beta** voice and file input on Act Builder (`/start`):

- **Voice:** Web Speech API → speech-to-text → fills goal input (editable)
- **File:** Upload `.txt` / `.md` briefs → extract goal text → evidence note for future connection
- **Write:** unchanged primary path

## First 60 seconds message

> Tell an act what you want to accomplish. an act turns it into actions.

Journey hint preserved: Describe goal → Build preview → Project breakdown → Actions → Contracts → Trust growth

## Verification

```bash
npm run verify:first-input-experience
```

## Remaining gaps

- Voice requires browser speech API + mic permission (Safari/Chrome; not all browsers)
- Non-text files use filename-based goal seed only — no PDF/DOCX extraction yet
- Launch draft is sessionStorage — not synced to living platform project flow automatically
- Voice interim transcript merging is best-effort beta UX
