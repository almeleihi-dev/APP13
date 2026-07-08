import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("Chapter 11 — Premium operator console CSS", () => {
  it("defines unified premium console layer", () => {
    const css = read("packages/runtime-ui/src/react/styles/an-act-operator-console.css");
    assert.match(css, /\.premium-console/);
    assert.match(css, /premium-console__ambient/);
    assert.match(css, /premium-console-badge--green/);
    assert.match(css, /prefers-reduced-motion/);
  });

  it("imports operator console in production bundle", () => {
    const prod = read("packages/runtime-ui/src/react/styles/an-act-production.css");
    assert.match(prod, /an-act-operator-console\.css/);
  });
});

describe("Chapter 11 — Premium console components", () => {
  it("exports operator console primitives from runtime-ui", () => {
    const index = read("packages/runtime-ui/src/react/index.ts");
    assert.match(index, /PremiumConsoleRoot/);
    assert.match(index, /PremiumReadinessBadge/);
    assert.match(index, /PremiumScoreHero/);
  });

  it("extends PremiumButton with danger and success variants", () => {
    const btn = read("packages/runtime-ui/src/react/components/premium/PremiumComponents.tsx");
    const css = read("packages/runtime-ui/src/react/styles/an-act-identity-premium.css");
    assert.match(btn, /danger/);
    assert.match(btn, /success/);
    assert.match(css, /premium-btn--danger/);
    assert.match(css, /premium-btn--success/);
  });
});

describe("Chapter 11 — Page migration", () => {
  const operatorPages = [
    "FounderConsolePage.tsx",
    "AnActOperatingSystemV1Page.tsx",
    "AnActV1FinalExecutiveReviewPage.tsx",
    "LiveMarketplaceOperationsPage.tsx",
    "ExecutiveIntelligenceCenterPage.tsx",
  ];

  for (const page of operatorPages) {
    it(`${page} uses premium-console shell`, () => {
      const src = read(`apps/web/src/pages/${page}`);
      assert.match(src, /premium-console/);
      assert.match(src, /premium-console__ambient/);
      assert.match(src, /PremiumButton/);
      assert.match(src, /PremiumCard/);
      assert.doesNotMatch(src, /an-act-button/);
    });
  }

  it("retires orphaned premium-experience.css import", () => {
    const global = read("apps/web/src/styles/global.css");
    assert.doesNotMatch(global, /premium-experience\.css/);
  });

  it("landing and auth retain premium identity", () => {
    assert.match(read("apps/web/src/pages/PartnerLandingPage.tsx"), /PremiumHero/);
    assert.match(read("apps/web/src/pages/LoginPage.tsx"), /PremiumGlassPanel/);
  });
});

describe("Chapter 11 — Architecture boundaries", () => {
  it("keeps unification presentation-only", () => {
    const console = read("packages/runtime-ui/src/react/components/premium/PremiumConsoleComponents.tsx");
    assert.doesNotMatch(console, /fetch\(/);
    assert.doesNotMatch(console, /\/v1\//);
  });
});
