# AN ACT — Deployment Overview (Partner Package)

**Audience:** Strategic partners, DevOps, technology companies

---

## Build pipeline

```bash
npm run build              # Platform kernel (tsc)
npm run build:render-layer # Tokens, runtime-core, runtime-ui, runtime-client
npm --prefix apps/web run build  # Vite production + PWA service worker
```

## Verification gates

| Gate | Command |
|---|---|
| Public MVP (RC2) | `npm run verify:mvp-rc2` |
| MVP Evolution (Phase 8) | `npm run verify:mvp-phase8` |
| Partner demo (Phase 9) | `npm run verify:mvp-phase9` |

## Runtime deployment

| Component | Default | Notes |
|---|---|---|
| API server | Port 3000 | `npm start` after build |
| Web shell | Port 5173 dev | Vite dev server with API proxy |
| Web production | Static `apps/web/dist` | Serve with HTTPS for PWA |

## Environment requirements

- Node.js ≥ 20
- PostgreSQL (production)
- HTTPS (production auth + PWA)

## PWA

- Service worker via `vite-plugin-pwa`
- NetworkFirst caching for need/action experience GETs
- Manifest: `apps/web/public/manifest.webmanifest`

## Demo credentials

- Email: `customer.demo@anact.local`
- Password: `demo-password-123`

Used by partner landing quick-entry and login prefill.
