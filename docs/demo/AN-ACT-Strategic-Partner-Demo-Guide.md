# AN ACT — Strategic Partner Demo Guide

**Version:** Phase 9  
**Verification:** `npm run verify:mvp-phase9`

---

## Before the presentation

1. Start API server: `npm start` (port 3000)
2. Start web shell: `npm --prefix apps/web run dev` (port 5173)
3. Run verification: `npm run verify:mvp-phase9`
4. Open `http://localhost:5173` in Chrome (desktop or mobile)

**Demo credentials (auto-used by landing entry):**

- Email: `customer.demo@anact.local`
- Password: `demo-password-123`

---

## Recommended demo flow (45 minutes)

### 1. Landing (5 min)

After splash, the **Partner Landing** presents:

- Vision — Runtime JSON platform narrative
- Knowledge Bank — compiled intelligence asset
- Professional ecosystem — onboarding, passport, full journey

**Presenter tip:** Use this section without logging in — no backend required.

### 2. Executive presentation (10 min)

Click **Executive presentation**.

Shows:

- Product highlights (Marketplace, Trust, Contract, AI architecture)
- Knowledge Bank summary (live API)
- Executive dashboard (Runtime JSON)
- Runtime summary screen

**Presenter tip:** Partial load warnings are normal if optional APIs require elevated roles — core dashboard still renders.

### 3. Guided demonstration (10 min)

Click **Guided demonstration**.

1. Select scenario: **First User Journey** (recommended)
2. Click **Start**
3. Use **Next** / **Previous** to walk through steps
4. Enable **Presenter mode** to hide scenario picker and enlarge notes
5. Use **Reset demo** between audiences

**Available scenarios:** 10 total including need, action, contract, full runtime, return journeys.

### 4. Live platform experience (15 min)

Click **Live platform experience**.

Walk through:

1. Need Home → Search "electrician"
2. Select opportunity → Request form
3. Continue → Transition ("an act...")
4. Action Home → Contract preview
5. **Continue** (accept) → Active action → Progress → Done
6. Completion (achievement feedback) → Return to Need

**Optional:** Expand AI panels (Need/Action/Contract assistants) and Executive AI panel.

**Decline flow:** Use **Decline request** on contract preview to show marketplace exit.

### 5. Partner package (5 min)

Click **Partner package** for technical, security, deployment, architecture, and business summaries.

Full documents in `docs/partner/`.

---

## Presenter mode

- **Guided demo:** Toggle in demo presenter header
- **Live platform:** AI and executive panels hidden when presenter mode enabled from demo (set before entering platform from demo page, or use panels collapsed by default)

---

## Troubleshooting

| Issue | Resolution |
|---|---|
| Login fails | Ensure API server running; check demo credentials |
| Offline banner | Check network; click Try again |
| AI panel error | Journey continues — panel shows graceful error |
| Executive partial load | Dashboard section still available |
| Session expired | Return to landing; re-enter experience |

---

## Reset between demos

1. **Guided demo:** Click **Reset demo** (stop + restart)
2. **Live platform:** Sign out → return to landing
3. **Full reset:** Clear localStorage key `an-act-auth-tokens` and refresh

---

## Success criteria

A first-time visitor should:

1. Understand the platform vision from landing alone
2. Experience guided demo without developer explanation
3. Complete live customer journey independently
4. Review executive and partner materials in-session
