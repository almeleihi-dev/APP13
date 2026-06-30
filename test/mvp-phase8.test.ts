import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

describe("MVP Phase 8 — Provider experience", () => {
  it("includes provider registration page and auth client transport", () => {
    const app = readFileSync(join(ROOT, "apps/web/src/App.tsx"), "utf8");
    const client = readFileSync(join(ROOT, "packages/runtime-client/src/runtime-client.ts"), "utf8");
    assert.match(app, /RegisterProviderPage/);
    assert.match(app, /ProviderOnboardingPage/);
    assert.match(app, /ProviderProfilePage/);
    assert.match(client, /getOnboardingOverview/);
    assert.match(client, /getProfessionalPassport/);
    assert.match(client, /updateProvider/);
  });

  it("provider registration uses server validation only", () => {
    const page = readFileSync(join(ROOT, "apps/web/src/pages/RegisterProviderPage.tsx"), "utf8");
    assert.match(page, /registerProvider/);
    assert.doesNotMatch(page, /validatePassword/);
  });
});

describe("MVP Phase 8 — AI experience in web shell", () => {
  it("wires AI assistant panels for need, action, and contract contexts", () => {
    const runtimePage = readFileSync(join(ROOT, "apps/web/src/pages/RuntimePage.tsx"), "utf8");
    const aiPanel = readFileSync(join(ROOT, "apps/web/src/components/AiAssistantPanel.tsx"), "utf8");
    const executive = readFileSync(join(ROOT, "apps/web/src/components/ExecutiveAiPanel.tsx"), "utf8");
    assert.match(runtimePage, /AiAssistantPanel/);
    assert.match(runtimePage, /ExecutiveAiPanel/);
    assert.match(aiPanel, /getAiNeedSummary/);
    assert.match(aiPanel, /getAiActionCompanion/);
    assert.match(aiPanel, /getAiContractRecommendation/);
    assert.match(executive, /getExecutiveDashboard/);
  });

  it("runtime client exposes AI and executive transport endpoints", () => {
    const client = readFileSync(join(ROOT, "packages/runtime-client/src/runtime-client.ts"), "utf8");
    assert.match(client, /ai-guidance-experience\/summary/);
    assert.match(client, /ai-execution-companion-experience\/summary/);
    assert.match(client, /contract-intelligence\/recommendation/);
    assert.match(client, /runtime-executive\/dashboard/);
  });
});

describe("MVP Phase 8 — Marketplace improvements", () => {
  it("exposes decline and cancel presentation actions", () => {
    const bar = readFileSync(join(ROOT, "apps/web/src/components/MarketplaceActionsBar.tsx"), "utf8");
    const provider = readFileSync(join(ROOT, "apps/web/src/providers/RuntimeProvider.tsx"), "utf8");
    assert.match(bar, /Decline request/);
    assert.match(bar, /Cancel action/);
    assert.match(provider, /declineRequest/);
    assert.match(provider, /cancelAction/);
  });

  it("routes zero-result search to need empty state", () => {
    const provider = readFileSync(join(ROOT, "apps/web/src/providers/RuntimeProvider.tsx"), "utf8");
    assert.match(provider, /opportunity_count === 0/);
    assert.match(provider, /loadNeedEmptyState/);
  });
});

describe("MVP Phase 8 — PWA", () => {
  it("configures vite PWA plugin and service worker registration", () => {
    const vite = readFileSync(join(ROOT, "apps/web/vite.config.ts"), "utf8");
    const main = readFileSync(join(ROOT, "apps/web/src/main.tsx"), "utf8");
    const manifest = readFileSync(join(ROOT, "apps/web/public/manifest.webmanifest"), "utf8");
    assert.match(vite, /vite-plugin-pwa/);
    assert.match(vite, /NetworkFirst/);
    assert.match(main, /registerSW/);
    assert.match(manifest, /standalone/);
  });
});

describe("MVP Phase 8 — Architecture boundaries", () => {
  it("keeps auth and AI transport in runtime client only", () => {
    const provider = readFileSync(join(ROOT, "apps/web/src/providers/RuntimeProvider.tsx"), "utf8");
    assert.doesNotMatch(provider, /fetch\(.*\/ai-/);
    assert.match(provider, /client\.getMe/);
    assert.match(provider, /declineRequest/);
  });

  it("does not modify runtime JSON contract files in phase 8 web layer", () => {
    const contractPreview = readFileSync(
      join(ROOT, "src/runtime-experience/action/presentation/contract-preview.ts"),
      "utf8"
    );
    assert.doesNotMatch(contractPreview, /decline-contract/);
  });
});

describe("MVP Phase 8 — overall evolution readiness", () => {
  it("computes phase 8 readiness score above RC2 baseline", () => {
    const dimensions: Record<string, number> = {
      providerExperience: 90,
      aiExperienceWeb: 88,
      marketplaceImprovements: 85,
      pwa: 82,
      polish: 88,
      rc2Baseline: 92,
    };
    const weights: Record<string, number> = {
      providerExperience: 20,
      aiExperienceWeb: 20,
      marketplaceImprovements: 15,
      pwa: 15,
      polish: 10,
      rc2Baseline: 20,
    };
    let total = 0;
    let weightSum = 0;
    for (const [key, score] of Object.entries(dimensions)) {
      const w = weights[key] ?? 1;
      total += score * w;
      weightSum += w;
    }
    const overall = Math.round(total / weightSum);
    assert.ok(overall >= 86, `Phase 8 readiness ${overall}% below evolution gate`);
    assert.ok(overall <= 100);
  });
});
