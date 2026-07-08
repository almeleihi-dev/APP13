import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("AN ACT Functional Beta Sprint 4", () => {
  it("imports functional beta sprint 4 stylesheet", () => {
    assert.match(read("apps/web/src/styles/global.css"), /an-act-functional-beta-sprint4\.css/);
  });

  it("applies living-s4 class to html root", () => {
    assert.match(read("apps/web/src/main.tsx"), /an-act-living-s4/);
  });

  it("defines contract economy ledger and signals", () => {
    const types = read("apps/web/src/lib/living-platform/types.ts");
    const ledger = read("apps/web/src/lib/living-platform/economy/contract-economy-ledger.ts");
    assert.match(types, /ContractEconomySignal/);
    assert.match(types, /ContractEconomyLedger/);
    assert.match(types, /economySignals/);
    assert.match(types, /economySignals/);
    assert.match(ledger, /buildContractEconomyLedger/);
    assert.match(ledger, /recordContractEconomySignal/);
  });

  it("implements action intelligence and value guidance", () => {
    const intelligence = read("apps/web/src/lib/living-platform/economy/action-intelligence-engine.ts");
    const value = read("apps/web/src/lib/living-platform/economy/action-value-engine.ts");
    const scarcity = read("apps/web/src/lib/living-platform/economy/scarcity-signals-engine.ts");
    assert.match(intelligence, /ActionIntelligenceProfile/);
    assert.match(intelligence, /averageMarketValue/);
    assert.match(value, /ActionValueGuidance/);
    assert.match(value, /premium/);
    assert.match(scarcity, /RareActionSignal/);
    assert.match(scarcity, /detectRareActionSignals/);
  });

  it("implements revenue engine and insurance readiness", () => {
    const revenue = read("apps/web/src/lib/living-platform/economy/revenue-engine.ts");
    const insurance = read("apps/web/src/lib/living-platform/economy/insurance-readiness-engine.ts");
    assert.match(revenue, /grossContractValue/);
    assert.match(revenue, /platformRevenueEstimate/);
    assert.match(revenue, /contractsPerMinute/);
    assert.match(insurance, /InsuranceReadinessProfile/);
    assert.match(insurance, /verifiedEvidencePercent/);
  });

  it("records economy signals on contract completion", () => {
    const store = read("apps/web/src/lib/living-platform/action-contract-store.ts");
    assert.match(store, /recordContractEconomySignal/);
  });

  it("surfaces economy dashboard and personal home pulse", () => {
    const dashboard = read("apps/web/src/components/economy-living/EconomyDashboardExperience.tsx");
    const home = read("apps/web/src/passport/personal-home-presentation.ts");
    const page = read("apps/web/src/pages/PersonalHomeDashboardPage.tsx");
    const platform = read("apps/web/src/PlatformApp.tsx");
    assert.match(dashboard, /Global Contract Pulse/);
    assert.match(dashboard, /Action Economy/);
    assert.match(dashboard, /Trust Economy/);
    assert.match(dashboard, /Insurance Readiness/);
    assert.match(home, /economyPulse/);
    assert.match(page, /Contract Economy Pulse/);
    assert.match(platform, /economy-dashboard/);
  });

  it("migrates living platform state with economy signals", () => {
    const storage = read("apps/web/src/lib/living-platform/living-platform-storage.ts");
    assert.match(storage, /version === 4/);
    assert.match(storage, /migrateLivingPlatformToV6/);
    assert.match(storage, /economySignals/);
  });
});
