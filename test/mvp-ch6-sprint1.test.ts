import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

describe("Chapter 6 Sprint 1 — Theme continuity", () => {
  it("retunes P12 opportunity cards for Need mode light surfaces", () => {
    const css = readFileSync(
      join(ROOT, "packages/runtime-ui/src/react/styles/an-act-identity-premium.css"),
      "utf8"
    );
    assert.match(css, /\[data-an-act-mode="need"\] \.an-act-opportunity-card--p12/);
    assert.match(css, /ch6NeedRuntimeFade/);
  });
});

describe("Chapter 6 Sprint 1 — Executive presentation polish", () => {
  it("replaces raw JSON dumps with structured summary cards", () => {
    const page = readFileSync(join(ROOT, "apps/web/src/pages/ExecutivePresentationPage.tsx"), "utf8");
    assert.match(page, /ExecutiveSummaryCards/);
    assert.match(page, /KnowledgeBankSummaryCards/);
    assert.doesNotMatch(page, /an-act-executive-json/);
    assert.doesNotMatch(page, /JSON\.stringify\(executiveSummary/);
    assert.doesNotMatch(page, /JSON\.stringify\(knowledgeSummary/);
  });
});

describe("Chapter 6 Sprint 1 — Authentication routing", () => {
  it("routes registration success to platform before runtime gate", () => {
    const app = readFileSync(join(ROOT, "apps/web/src/App.tsx"), "utf8");
    assert.match(app, /authView === "register-success" && hasToken/);
    assert.match(app, /setExperience\("platform"\)/);
    assert.match(app, /setAuthView\("complete"\)/);
  });

  it("keeps premium landing as canonical startup entry", () => {
    const app = readFileSync(join(ROOT, "apps/web/src/App.tsx"), "utf8");
    assert.match(app, /useState<AppExperience>\("landing"\)/);
    assert.doesNotMatch(app, /if \(hasToken && experience === "landing"/);
  });

  it("adds back-to-landing on auth pages", () => {
    const login = readFileSync(join(ROOT, "apps/web/src/pages/LoginPage.tsx"), "utf8");
    const register = readFileSync(join(ROOT, "apps/web/src/pages/RegisterPage.tsx"), "utf8");
    assert.match(login, /onBackToLanding/);
    assert.match(register, /onBackToLanding/);
    assert.match(login, /<h1[\s\S]*?>[\s\S]*Sign in[\s\S]*?<\/h1>/);
    assert.match(register, /<h1[\s\S]*?>[\s\S]*Create account[\s\S]*?<\/h1>/);
  });
});

describe("Chapter 6 Sprint 1 — Search loading consistency", () => {
  it("uses search component as single client loading owner", () => {
    const page = readFileSync(join(ROOT, "apps/web/src/pages/RuntimePage.tsx"), "utf8");
    const hook = readFileSync(join(ROOT, "apps/web/src/components/need-mvp/useNeedPresentation.ts"), "utf8");
    assert.doesNotMatch(page, /NeedSearchSkeleton/);
    assert.doesNotMatch(page, /searchLoading \? "Searching/);
    assert.match(page, /!\s*searchLoading/);
    assert.match(hook, /shouldShowSearchSkeleton[\s\S]*?return false/);
  });
});

describe("Chapter 6 Sprint 1 — Accessibility", () => {
  it("wraps list sections with ListSectionProvider and listitem roles", () => {
    const mount = readFileSync(join(ROOT, "packages/runtime-ui/src/react/RuntimeScreenMount.tsx"), "utf8");
    const ctx = readFileSync(join(ROOT, "packages/runtime-ui/src/react/list-section-context.tsx"), "utf8");
    const p1 = readFileSync(join(ROOT, "packages/runtime-ui/src/react/components/P1Components.tsx"), "utf8");
    assert.match(mount, /ListSectionProvider/);
    assert.match(mount, /sectionId\.includes\("activity"\)/);
    assert.match(ctx, /useCardRoleInList/);
    assert.match(p1, /useCardRoleInList\("article"\)/);
  });
});

describe("Chapter 6 Sprint 1 — Architecture boundaries", () => {
  it("keeps sprint scope to presentation and routing only", () => {
    const hook = readFileSync(join(ROOT, "apps/web/src/components/need-mvp/useNeedPresentation.ts"), "utf8");
    assert.doesNotMatch(hook, /fetch\(/);
    assert.doesNotMatch(
      readFileSync(join(ROOT, "apps/web/src/pages/ExecutivePresentationPage.tsx"), "utf8"),
      /\/executive-experience\//
    );
  });
});
