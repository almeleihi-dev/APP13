import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

describe("Chapter 6 Sprint 2 — Error experience", () => {
  it("provides shared PresentationError with retry and dismiss actions", () => {
    const component = readFileSync(join(ROOT, "apps/web/src/components/PresentationError.tsx"), "utf8");
    const runtime = readFileSync(join(ROOT, "apps/web/src/pages/RuntimePage.tsx"), "utf8");
    assert.match(component, /AnActError/);
    assert.match(component, /an-act-error-panel__actions/);
    assert.match(runtime, /PresentationError/);
    assert.match(runtime, /onRetry/);
    assert.match(runtime, /reloadNeedExperience/);
  });

  it("maps network failures to user-friendly copy in RuntimeProvider", () => {
    const provider = readFileSync(join(ROOT, "apps/web/src/providers/RuntimeProvider.tsx"), "utf8");
    assert.match(provider, /Connection problem/);
    assert.match(provider, /failed to fetch/i);
  });

  it("surfaces session expiry on login", () => {
    const login = readFileSync(join(ROOT, "apps/web/src/pages/LoginPage.tsx"), "utf8");
    assert.match(login, /sessionExpired/);
    assert.match(login, /Session expired/);
  });
});

describe("Chapter 6 Sprint 2 — Empty states", () => {
  it("wires Need MVP success and tracking stages after confirm", () => {
    const hook = readFileSync(join(ROOT, "apps/web/src/components/need-mvp/useNeedPresentation.ts"), "utf8");
    const flow = readFileSync(join(ROOT, "apps/web/src/components/need-mvp/NeedMvpFlow.tsx"), "utf8");
    assert.match(hook, /setStage\("success"\)/);
    assert.match(hook, /setTrackingId/);
    assert.match(flow, /RequestSuccessScreen/);
    assert.match(flow, /RequestTrackingScreen/);
  });
});

describe("Chapter 6 Sprint 2 — Offline resilience", () => {
  it("provides offline retry feedback when still disconnected", () => {
    const page = readFileSync(join(ROOT, "apps/web/src/pages/RuntimePage.tsx"), "utf8");
    assert.match(page, /offlineRetryHint/);
    assert.match(page, /navigator\.onLine/);
    assert.match(page, /Still offline/);
  });
});

describe("Chapter 6 Sprint 2 — Loading consistency", () => {
  it("uses single loading owner on auth pages", () => {
    const login = readFileSync(join(ROOT, "apps/web/src/pages/LoginPage.tsx"), "utf8");
    const register = readFileSync(join(ROOT, "apps/web/src/pages/RegisterPage.tsx"), "utf8");
    assert.doesNotMatch(login, /AnActBrandLoading/);
    assert.doesNotMatch(register, /AnActBrandLoading/);
    assert.match(login, /aria-busy=\{loading\}/);
  });

  it("deduplicates executive briefing loaders", () => {
    const page = readFileSync(join(ROOT, "apps/web/src/pages/ExecutivePresentationPage.tsx"), "utf8");
    assert.match(page, /busy \? <AnActBrandLoading/);
    assert.doesNotMatch(page, /busy \|\| loading/);
    assert.doesNotMatch(page, /Suspense fallback=\{<AnActBrandLoading/);
  });
});

describe("Chapter 6 Sprint 2 — Accessibility", () => {
  it("adds escape handling for overlays and panels", () => {
    const hook = readFileSync(join(ROOT, "apps/web/src/hooks/useEscapeKey.ts"), "utf8");
    const flow = readFileSync(join(ROOT, "apps/web/src/components/need-mvp/NeedMvpFlow.tsx"), "utf8");
    const ai = readFileSync(join(ROOT, "apps/web/src/components/AiAssistantPanel.tsx"), "utf8");
    assert.match(hook, /Escape/);
    assert.match(flow, /useEscapeKey/);
    assert.match(flow, /aria-current/);
    assert.match(ai, /useEscapeKey/);
  });
});

describe("Chapter 6 Sprint 2 — Motion polish", () => {
  it("respects reduced motion in need-mvp and search spinner styles", () => {
    const needMvp = readFileSync(join(ROOT, "apps/web/src/styles/need-mvp.css"), "utf8");
    const production = readFileSync(
      join(ROOT, "packages/runtime-ui/src/react/styles/an-act-production.css"),
      "utf8"
    );
    assert.match(needMvp, /prefers-reduced-motion[\s\S]*an-act-search-skeleton__bar/);
    assert.match(production, /prefers-reduced-motion[\s\S]*an-act-search-form__spinner/);
  });

  it("trims decorative stagger motion from Need MVP flow sections", () => {
    const flow = readFileSync(join(ROOT, "apps/web/src/components/need-mvp/NeedMvpFlow.tsx"), "utf8");
    assert.doesNotMatch(flow, /ds-stagger-1/);
    assert.doesNotMatch(flow, /ds-scale-in/);
  });
});

describe("Chapter 6 Sprint 2 — Architecture boundaries", () => {
  it("keeps sprint scope to presentation shell only", () => {
    const hook = readFileSync(join(ROOT, "apps/web/src/components/need-mvp/useNeedPresentation.ts"), "utf8");
    assert.doesNotMatch(hook, /fetch\(/);
    assert.match(hook, /need\.continue-request/);
  });
});
