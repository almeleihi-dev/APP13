import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

describe("MVP Phase 11 — Runtime premium layout", () => {
  it("includes runtime premium stylesheet", () => {
    assert.ok(
      existsSync(join(ROOT, "packages/runtime-ui/src/react/styles/an-act-runtime-premium.css"))
    );
    const css = readFileSync(
      join(ROOT, "packages/runtime-ui/src/react/styles/an-act-runtime-premium.css"),
      "utf8"
    );
    assert.match(css, /an-act-screen--premium/);
    assert.match(css, /an-act-runtime-shell/);
    assert.match(css, /ds-page-float/);
  });

  it("applies premium layout in RuntimeScreenMount", () => {
    const mount = readFileSync(join(ROOT, "packages/runtime-ui/src/react/RuntimeScreenMount.tsx"), "utf8");
    assert.match(mount, /an-act-screen--premium/);
    assert.match(mount, /an-act-section--stagger/);
  });

  it("wraps runtime content in premium shell", () => {
    const page = readFileSync(join(ROOT, "apps/web/src/pages/RuntimePage.tsx"), "utf8");
    assert.match(page, /an-act-runtime-shell/);
  });
});

describe("MVP Phase 11 — Premium cards & motion", () => {
  it("upgrades generic cards with premium class", () => {
    const card = readFileSync(join(ROOT, "packages/runtime-ui/src/react/components/P0Components.tsx"), "utf8");
    assert.match(card, /an-act-card--premium/);
  });

  it("adds motion system utilities", () => {
    const css = readFileSync(
      join(ROOT, "packages/runtime-ui/src/react/styles/an-act-runtime-premium.css"),
      "utf8"
    );
    assert.match(css, /ds-btn--ripple/);
    assert.match(css, /ds-scale-in/);
    assert.match(css, /ds-progress/);
  });

  it("enhances opportunity cards with live frame accent", () => {
    const opp = readFileSync(join(ROOT, "packages/runtime-ui/src/react/components/P1Components.tsx"), "utf8");
    assert.match(opp, /an-act-card--live-frame-accent/);
    assert.match(opp, /ds-btn--ripple/);
  });
});

describe("MVP Phase 11 — Need journey & timeline", () => {
  it("adds progress indicator to need flow", () => {
    const flow = readFileSync(join(ROOT, "apps/web/src/components/need-mvp/NeedMvpFlow.tsx"), "utf8");
    assert.match(flow, /FlowProgress/);
    assert.match(flow, /ds-progress/);
  });

  it("uses visual sections for provider presentation", () => {
    const flow = readFileSync(join(ROOT, "apps/web/src/components/need-mvp/NeedMvpFlow.tsx"), "utf8");
    assert.match(flow, /VisualSection/);
    assert.match(flow, /Professional Passport/);
    assert.match(flow, /Reviews & experience/);
  });

  it("redesigns tracking timeline with status states", () => {
    const flow = readFileSync(join(ROOT, "apps/web/src/components/need-mvp/NeedMvpFlow.tsx"), "utf8");
    assert.match(flow, /ds-timeline--animated/);
    assert.match(flow, /ds-timeline__status/);
    assert.match(flow, /Live Frame monitoring/);
    assert.match(flow, /Contract preparation/);
    assert.match(flow, /upcoming/);
  });
});

describe("MVP Phase 11 — Architecture boundaries", () => {
  it("keeps changes presentation-only", () => {
    const flow = readFileSync(join(ROOT, "apps/web/src/components/need-mvp/NeedMvpFlow.tsx"), "utf8");
    assert.doesNotMatch(flow, /fetch\(/);
    assert.doesNotMatch(flow, /need-experience-service/);
  });
});
