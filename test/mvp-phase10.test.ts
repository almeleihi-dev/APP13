import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

describe("MVP Phase 10 — Design system", () => {
  it("includes reusable design system stylesheet", () => {
    const ds = readFileSync(
      join(ROOT, "packages/runtime-ui/src/react/styles/an-act-design-system.css"),
      "utf8"
    );
    assert.match(ds, /\.ds-btn/);
    assert.match(ds, /\.ds-card/);
    assert.match(ds, /\.ds-badge/);
    assert.match(ds, /\.ds-timeline/);
    assert.match(ds, /--ds-color-accent/);
    assert.match(ds, /@keyframes ds-slide-up/);
  });

  it("imports premium experience styles in web shell", () => {
    const global = readFileSync(join(ROOT, "apps/web/src/styles/global.css"), "utf8");
    assert.match(global, /premium-experience\.css/);
  });
});

describe("MVP Phase 10 — Premium marketplace UX", () => {
  it("redesigns partner landing with premium hero", () => {
    const landing = readFileSync(join(ROOT, "apps/web/src/pages/PartnerLandingPage.tsx"), "utf8");
    assert.match(landing, /ds-landing/);
    assert.match(landing, /Choose your experience/);
    assert.match(landing, /Enter live platform/);
  });

  it("enhances opportunity cards with premium layout", () => {
    const card = readFileSync(join(ROOT, "packages/runtime-ui/src/react/components/P1Components.tsx"), "utf8");
    assert.match(card, /an-act-opportunity-card--premium/);
    assert.match(card, /passport-preview/);
    assert.match(card, /Preview passport/);
    assert.match(card, /ds-badge--live-frame/);
  });

  it("extends request flow with tracking stage", () => {
    const flow = readFileSync(join(ROOT, "apps/web/src/components/need-mvp/NeedMvpFlow.tsx"), "utf8");
    const types = readFileSync(join(ROOT, "apps/web/src/components/need-mvp/types.ts"), "utf8");
    assert.match(types, /tracking/);
    assert.match(flow, /RequestTrackingScreen/);
    assert.match(flow, /View tracking/);
    assert.match(flow, /ds-timeline/);
  });

  it("preserves presentation-only architecture boundaries", () => {
    const hook = readFileSync(join(ROOT, "apps/web/src/components/need-mvp/useNeedPresentation.ts"), "utf8");
    assert.doesNotMatch(hook, /fetch\(/);
    const service = readFileSync(
      join(ROOT, "src/runtime-experience/need/application/need-experience-service.ts"),
      "utf8"
    );
    assert.match(service, /performSearch/);
    assert.doesNotMatch(
      readFileSync(join(ROOT, "apps/web/src/pages/RuntimePage.tsx"), "utf8"),
      /need-experience-service/
    );
  });
});
