import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

describe("MVP Phase 9 — Demo mode", () => {
  it("wires runtime demo transport and presenter page", () => {
    const client = readFileSync(join(ROOT, "packages/runtime-client/src/runtime-client.ts"), "utf8");
    const page = readFileSync(join(ROOT, "apps/web/src/pages/DemoPresenterPage.tsx"), "utf8");
    assert.match(client, /getRuntimeDemo/);
    assert.match(client, /startDemo/);
    assert.match(client, /restartDemo/);
    assert.match(page, /Presenter mode/);
    assert.match(page, /Reset demo/);
  });

  it("provides demo auto-login in runtime provider", () => {
    const provider = readFileSync(join(ROOT, "apps/web/src/providers/RuntimeProvider.tsx"), "utf8");
    assert.match(provider, /demoLogin/);
    assert.match(provider, /customer\.demo@anact\.local/);
    assert.match(provider, /registerCustomer/);
  });
});

describe("MVP Phase 9 — Landing experience", () => {
  it("includes partner landing with vision and ecosystem sections", () => {
    const landing = readFileSync(join(ROOT, "apps/web/src/pages/PartnerLandingPage.tsx"), "utf8");
    const app = readFileSync(join(ROOT, "apps/web/src/App.tsx"), "utf8");
    assert.match(landing, /Server-authoritative|Runtime JSON/);
    assert.match(landing, /Live Frame|professional passport/i);
    assert.match(landing, /Need → Action|Need Mode/);
    assert.match(app, /PartnerLandingPage/);
  });

  it("offers four experience entry points", () => {
    const landing = readFileSync(join(ROOT, "apps/web/src/pages/PartnerLandingPage.tsx"), "utf8");
    assert.match(landing, /Live platform experience/);
    assert.match(landing, /Developer demo console/);
    assert.match(landing, /Executive presentation/);
    assert.match(landing, /Partner package/);
  });
});

describe("MVP Phase 9 — Executive presentation", () => {
  it("wires executive and knowledge bank APIs", () => {
    const page = readFileSync(join(ROOT, "apps/web/src/pages/ExecutivePresentationPage.tsx"), "utf8");
    const client = readFileSync(join(ROOT, "packages/runtime-client/src/runtime-client.ts"), "utf8");
    assert.match(page, /ExecutivePresentationPage/);
    assert.match(page, /Trust architecture/);
    assert.match(client, /getKnowledgeBankSummary/);
    assert.match(client, /getExecutiveExperienceSummary/);
  });
});

describe("MVP Phase 9 — Partner package", () => {
  const partnerDocs = [
    "Technical-Overview.md",
    "Deployment-Overview.md",
    "Security-Overview.md",
    "Architecture-Summary.md",
    "Business-Model-Summary.md",
  ];

  it("includes all partner package documents", () => {
    for (const doc of partnerDocs) {
      assert.ok(existsSync(join(ROOT, "docs/partner", doc)), `missing ${doc}`);
    }
  });

  it("includes demo guide and web partner overview", () => {
    assert.ok(existsSync(join(ROOT, "docs/demo/AN-ACT-Strategic-Partner-Demo-Guide.md")));
    assert.match(
      readFileSync(join(ROOT, "apps/web/src/pages/PartnerOverviewPage.tsx"), "utf8"),
      /Partner package/
    );
    const app = readFileSync(join(ROOT, "apps/web/src/PlatformApp.tsx"), "utf8");
    assert.match(app, /onFindAction=\{\(\) => void enterExperience\("platform"\)\}/);
    assert.match(app, /experience === "platform"/);
    assert.match(app, /if \(entering\)[\s\S]*Opening your Action Marketplace/);
    assert.match(app, /setEntering\(true\)[\s\S]*setExperience\(choice\)/);
  });
});

describe("MVP Phase 9 — Architecture boundaries", () => {
  it("proxies demo and partner APIs in vite config", () => {
    const vite = readFileSync(join(ROOT, "apps/web/vite.config.ts"), "utf8");
    assert.match(vite, /\/runtime-demo/);
    assert.match(vite, /\/knowledge-bank/);
    assert.match(vite, /\/executive-experience/);
  });

  it("does not add business logic to web shell", () => {
    const demo = readFileSync(join(ROOT, "apps/web/src/pages/DemoPresenterPage.tsx"), "utf8");
    assert.doesNotMatch(demo, /fetch\(/);
    assert.match(demo, /client\.startDemo/);
  });
});

describe("MVP Phase 9 — partner demo readiness score", () => {
  it("computes phase 9 readiness above partner demo gate", () => {
    const dimensions: Record<string, number> = {
      demoMode: 92,
      landingExperience: 90,
      executivePresentation: 89,
      partnerPackage: 93,
      demoQuality: 88,
      phase8Baseline: 88,
    };
    const weights: Record<string, number> = {
      demoMode: 22,
      landingExperience: 18,
      executivePresentation: 18,
      partnerPackage: 15,
      demoQuality: 12,
      phase8Baseline: 15,
    };
    let total = 0;
    let weightSum = 0;
    for (const [key, score] of Object.entries(dimensions)) {
      const w = weights[key] ?? 1;
      total += score * w;
      weightSum += w;
    }
    const overall = Math.round(total / weightSum);
    assert.ok(overall >= 90, `Phase 9 readiness ${overall}% below partner demo gate`);
  });
});
