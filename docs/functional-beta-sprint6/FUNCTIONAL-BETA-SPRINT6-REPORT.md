# Functional Beta Sprint 6 — Guest Entry Experience

## Summary

Visitors can explore an act before registration via Guest mode — goals, professions, and labeled demo surfaces — with conversion to Professional Passport when they want to save progress.

## Verification

```bash
npm run verify:guest-entry-experience
```

## Remaining gaps

- Guest session is browser sessionStorage only
- Demo surfaces use static sample data, not live marketplace feeds
- Full marketplace publish/contract guards rely on passport journey gating; server-side auth not enforced in beta
