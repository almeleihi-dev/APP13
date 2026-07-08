import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("AN ACT Action Creation Intelligence Cycle 01", () => {
  it("imports action creation intelligence stylesheet", () => {
    assert.match(read("apps/web/src/styles/global.css"), /an-act-action-creation-intelligence-c01\.css/);
  });

  it("applies action-c01 class to html root", () => {
    assert.match(read("apps/web/src/main.tsx"), /an-act-action-c01/);
  });

  it("routes Offer a service to action creator experience", () => {
    const platform = read("apps/web/src/PlatformApp.tsx");
    assert.match(platform, /"action-creator"/);
    assert.match(platform, /onOfferAction=\{\(\) => setExperience\("action-creator"\)\}/);
    assert.match(platform, /ActionCreatorPage/);
  });

  it("defines action blueprint presentation and quality scoring", () => {
    const presentation = read("apps/web/src/components/action-creator/action-blueprint-presentation.ts");
    assert.match(presentation, /computeActionQualityReport/);
    assert.match(presentation, /buildTrustPreviewView/);
    assert.match(presentation, /buildMarketplacePreviewView/);
    assert.match(presentation, /buildBlueprintSections/);
    assert.match(presentation, /ActionQualityReport/);
  });

  it("guides identity and structure creation in ActionCreatorFlow", () => {
    const flow = read("apps/web/src/components/action-creator/ActionCreatorFlow.tsx");
    assert.match(flow, /Define your Action Identity/);
    assert.match(flow, /Action name/);
    assert.match(flow, /Professional purpose/);
    assert.match(flow, /Target customer/);
    assert.match(flow, /Expected outcome/);
    assert.match(flow, /Structure the professional action/);
    assert.match(flow, /Requirements/);
    assert.match(flow, /Deliverables/);
    assert.match(flow, /Success criteria/);
  });

  it("renders blueprint, trust, marketplace preview, and quality guidance", () => {
    const flow = read("apps/web/src/components/action-creator/ActionCreatorFlow.tsx");
    assert.match(flow, /an-act-action-blueprint/);
    assert.match(flow, /Trust Preview/);
    assert.match(flow, /Live Frame impact/);
    assert.match(flow, /an-act-action-marketplace-card/);
    assert.match(flow, /Action quality score/);
    assert.match(flow, /Recommendations/);
  });

  it("persists blueprint draft locally in session storage", () => {
    const persistence = read("apps/web/src/components/action-creator/action-creator-persistence.ts");
    assert.match(persistence, /ACTION_BLUEPRINT_DRAFT_KEY/);
    assert.match(persistence, /saveActionBlueprintDraft/);
    assert.match(persistence, /sessionStorage/);
  });

  it("styles action creator presentation layer", () => {
    const css = read("apps/web/src/styles/an-act-action-creation-intelligence-c01.css");
    assert.match(css, /an-act-action-creator/);
    assert.match(css, /an-act-action-blueprint/);
    assert.match(css, /an-act-action-trust/);
    assert.match(css, /an-act-action-marketplace-card/);
    assert.match(css, /an-act-action-quality/);
  });
});
