import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("AN ACT Marketplace Intelligence Cycle 01", () => {
  it("imports marketplace intelligence stylesheet", () => {
    assert.match(read("apps/web/src/styles/global.css"), /an-act-marketplace-intelligence-c01\.css/);
  });

  it("applies mkt-c01 class to html root", () => {
    assert.match(read("apps/web/src/main.tsx"), /an-act-mkt-c01/);
  });

  it("defines marketplace storytelling and passport profile enrichment", () => {
    const presentation = read("apps/web/src/components/need-mvp/opportunity-presentation.ts");
    assert.match(presentation, /OpportunityStory/);
    assert.match(presentation, /passportProfile/);
    assert.match(presentation, /whoNeedsThis/);
    assert.match(presentation, /MARKETPLACE_FEATURED_PROVIDERS/);
    assert.match(presentation, /responseTime/);
    assert.match(presentation, /professionalLevel/);
  });

  it("shows marketplace identity and featured provider cards on browse", () => {
    const hints = read("apps/web/src/components/need-mvp/NeedSearchPresentation.tsx");
    assert.match(hints, /an-act-marketplace-identity/);
    assert.match(hints, /an-act-marketplace-provider-card/);
    assert.match(hints, /Featured in beta catalog/);
    assert.match(hints, /Public beta · verified catalog/);
  });

  it("renders provider passport preview and story on detail screen", () => {
    const flow = read("apps/web/src/components/need-mvp/NeedMvpFlow.tsx");
    assert.match(flow, /ProfessionalPassportMiniPreview/);
    assert.match(flow, /ds-flow__story-grid/);
    assert.match(flow, /ds-flow__confidence-row/);
    assert.match(flow, /Who needs this/);
    assert.match(flow, /Request Service →/);
  });

  it("communicates trust and next actions across request flow", () => {
    const flow = read("apps/web/src/components/need-mvp/NeedMvpFlow.tsx");
    assert.match(flow, /ds-flow__verified-badge/);
    assert.match(flow, /ds-flow__next-action/);
    assert.match(flow, /Provider response/);
    assert.match(flow, /Request confirmed · Public beta/);
  });

  it("styles marketplace ecosystem presentation layer", () => {
    const css = read("apps/web/src/styles/an-act-marketplace-intelligence-c01.css");
    assert.match(css, /an-act-marketplace-identity/);
    assert.match(css, /an-act-marketplace-provider-card/);
    assert.match(css, /ds-flow__story-card/);
    assert.match(css, /ds-flow__confidence-item/);
  });
});
