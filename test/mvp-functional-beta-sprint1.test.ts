import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("AN ACT Functional Beta Sprint 1", () => {
  it("imports functional beta sprint stylesheet", () => {
    assert.match(read("apps/web/src/styles/global.css"), /an-act-functional-beta-sprint1\.css/);
  });

  it("applies living-s1 class to html root", () => {
    assert.match(read("apps/web/src/main.tsx"), /an-act-living-s1/);
  });

  it("defines living platform store with publish and lifecycle", () => {
    const store = read("apps/web/src/lib/living-platform/professional-action-store.ts");
    assert.match(store, /publishProfessionalAction/);
    assert.match(store, /createServiceRequest/);
    assert.match(store, /advanceServiceRequest/);
    assert.match(store, /completeServiceRequest/);
    assert.match(store, /recordPassportCompletionGrowth/);
    const storage = read("apps/web/src/lib/living-platform/living-platform-storage.ts");
    assert.match(storage, /LIVING_PLATFORM_STORAGE_KEY/);
  });

  it("wires Action Creator publish to living platform", () => {
    const hook = read("apps/web/src/components/action-creator/useActionCreatorPresentation.ts");
    const flow = read("apps/web/src/components/action-creator/ActionCreatorFlow.tsx");
    assert.match(hook, /publishProfessionalAction/);
    assert.match(flow, /Publish to marketplace/);
    assert.match(flow, /Published to marketplace/);
  });

  it("activates Personal Home with living action data", () => {
    const home = read("apps/web/src/passport/personal-home-presentation.ts");
    const page = read("apps/web/src/pages/PersonalHomeDashboardPage.tsx");
    assert.match(home, /myPublishedActions/);
    assert.match(home, /activeRequests/);
    assert.match(home, /completedActions/);
    assert.match(page, /Living Action Workspace/);
    assert.match(page, /useLivingPlatformState/);
  });

  it("connects marketplace discover and request lifecycle", () => {
    const hints = read("apps/web/src/components/need-mvp/NeedSearchPresentation.tsx");
    const need = read("apps/web/src/components/need-mvp/useNeedPresentation.ts");
    const flow = read("apps/web/src/components/need-mvp/NeedMvpFlow.tsx");
    const contract = read("apps/web/src/components/need-mvp/ActionContractExperience.tsx");
    assert.match(hints, /listPublishedActions/);
    assert.match(hints, /Published by professionals/);
    assert.match(need, /createServiceRequest/);
    assert.match(contract, /Advance execution/);
    assert.match(contract, /Complete contracted action/);
    assert.match(flow, /ActionContractExperience/);
  });

  it("enriches published actions with passport ownership", () => {
    const presentation = read("apps/web/src/components/need-mvp/opportunity-presentation.ts");
    assert.match(presentation, /getPublishedAction/);
    assert.match(presentation, /Creator passport attached/);
    assert.match(presentation, /photoUrl/);
  });
});
