import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("AN ACT Functional Beta Sprint 2", () => {
  it("imports functional beta sprint 2 stylesheet", () => {
    assert.match(read("apps/web/src/styles/global.css"), /an-act-functional-beta-sprint2\.css/);
  });

  it("applies living-s2 class to html root", () => {
    assert.match(read("apps/web/src/main.tsx"), /an-act-living-s2/);
  });

  it("defines action contract layer with lifecycle fields", () => {
    const types = read("apps/web/src/lib/living-platform/types.ts");
    const store = read("apps/web/src/lib/living-platform/action-contract-store.ts");
    assert.match(types, /ActionContract/);
    assert.match(types, /agreementState/);
    assert.match(types, /executionState/);
    assert.match(types, /ContractEvidence/);
    assert.match(types, /PassportContractHistoryEntry/);
    assert.match(store, /createActionContract/);
    assert.match(store, /acceptActionContract/);
    assert.match(store, /attachContractEvidence/);
    assert.match(store, /confirmContractEvidence/);
    assert.match(store, /completeActionContract/);
  });

  it("connects request flow to contract generation", () => {
    const actionStore = read("apps/web/src/lib/living-platform/professional-action-store.ts");
    const need = read("apps/web/src/components/need-mvp/useNeedPresentation.ts");
    assert.match(actionStore, /createActionContract/);
    assert.match(need, /getActionContractByTrackingId/);
    assert.match(need, /acceptActionContract/);
    assert.match(need, /attachContractEvidence/);
  });

  it("renders contract experience with parties evidence and completion", () => {
    const contract = read("apps/web/src/components/need-mvp/ActionContractExperience.tsx");
    const flow = read("apps/web/src/components/need-mvp/NeedMvpFlow.tsx");
    assert.match(contract, /Parties/);
    assert.match(contract, /Accept contract/);
    assert.match(contract, /Advance execution/);
    assert.match(contract, /Attach evidence/);
    assert.match(flow, /ActionContractExperience/);
    assert.match(flow, /View Action Contract/);
    assert.match(flow, /"contract"/);
  });

  it("surfaces passport contract history on personal home", () => {
    const home = read("apps/web/src/passport/personal-home-presentation.ts");
    const page = read("apps/web/src/pages/PersonalHomeDashboardPage.tsx");
    assert.match(home, /listPassportContractHistory/);
    assert.match(home, /contractHistory/);
    assert.match(home, /activeContracts/);
    assert.match(page, /Contract History/);
    assert.match(page, /Active Contracts/);
  });

  it("migrates living platform state to version 2 with contracts", () => {
    const storage = read("apps/web/src/lib/living-platform/living-platform-storage.ts");
    assert.match(storage, /parsed.version === 4/);
    assert.match(storage, /version: 5/);
    assert.match(storage, /contracts/);
    assert.match(storage, /passportHistory/);
  });
});
