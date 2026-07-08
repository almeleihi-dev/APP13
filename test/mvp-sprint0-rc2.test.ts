import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

describe("MVP Sprint 0 — RC1 blocker B1 debug surfaces gated", () => {
  it("gates runtime debug panel behind RUNTIME_DEBUG_ENABLED", () => {
    const page = readFileSync(join(ROOT, "apps/web/src/pages/RuntimePage.tsx"), "utf8");
    const debug = readFileSync(join(ROOT, "apps/web/src/lib/runtime-debug.ts"), "utf8");
    assert.match(debug, /RUNTIME_DEBUG_ENABLED/);
    assert.match(page, /RUNTIME_DEBUG_ENABLED/);
    assert.match(page, /RUNTIME_DEBUG_ENABLED \?/);
  });

  it("routes RuntimeProvider tracing through runtime-debug helper", () => {
    const provider = readFileSync(join(ROOT, "apps/web/src/providers/RuntimeProvider.tsx"), "utf8");
    assert.match(provider, /logRuntimeTrace/);
    assert.doesNotMatch(provider, /console\.log\("\[AN ACT RuntimeProvider\]/);
  });

  it("removes RuntimeScreenMount production console logging", () => {
    const mount = readFileSync(join(ROOT, "packages/runtime-ui/src/react/RuntimeScreenMount.tsx"), "utf8");
    assert.doesNotMatch(mount, /console\.log/);
  });
});

describe("MVP Sprint 0 — RC1 blocker B2 need mode normalization", () => {
  it("normalizes stale action mode on need journey screens", () => {
    const provider = readFileSync(join(ROOT, "apps/web/src/providers/RuntimeProvider.tsx"), "utf8");
    assert.match(provider, /normalizeNeedExperienceMode/);
    assert.match(provider, /NEED_JOURNEY_SCREEN_IDS/);
    assert.match(provider, /opportunity-list/);
  });

  it("shows MVP overlay based on experienceKind not stale envelope mode", () => {
    const page = readFileSync(join(ROOT, "apps/web/src/pages/RuntimePage.tsx"), "utf8");
    assert.match(page, /experienceKind === "need"/);
    assert.doesNotMatch(page, /stage !== "browse" && mode === "need"/);
  });
});

describe("MVP Sprint 0 — RC1 blocker B3 authoritative confirm handoff", () => {
  it("wires confirmRequest through continue-request relay and success presentation", () => {
    const hook = readFileSync(join(ROOT, "apps/web/src/components/need-mvp/useNeedPresentation.ts"), "utf8");
    assert.match(hook, /need\.select-opportunity/);
    assert.match(hook, /need\.update-draft/);
    assert.match(hook, /need\.continue-request/);
    assert.match(hook, /setStage\("success"\)/);
    assert.match(hook, /setTrackingId/);
    assert.doesNotMatch(hook, /createTrackingId/);
  });
});

describe("MVP Sprint 0 — RC1 blocker B4 developer demo relabel", () => {
  it("relabels demo entry as developer console with live platform path", () => {
    const landing = readFileSync(join(ROOT, "apps/web/src/pages/PartnerLandingPage.tsx"), "utf8");
    const demo = readFileSync(join(ROOT, "apps/web/src/pages/DemoPresenterPage.tsx"), "utf8");
    const app = readFileSync(join(ROOT, "apps/web/src/App.tsx"), "utf8");
    assert.match(landing, /Developer demo console/);
    assert.match(demo, /Developer demo console/);
    assert.match(demo, /Operator tooling/);
    assert.match(demo, /onOpenLivePlatform/);
    assert.match(app, /onOpenLivePlatform/);
    assert.match(app, /setPresenterMode/);
  });
});

describe("MVP Sprint 0 — Architecture boundaries", () => {
  it("keeps sprint scope to web shell presentation and hydration only", () => {
    const provider = readFileSync(join(ROOT, "apps/web/src/providers/RuntimeProvider.tsx"), "utf8");
    const hook = readFileSync(join(ROOT, "apps/web/src/components/need-mvp/useNeedPresentation.ts"), "utf8");
    assert.doesNotMatch(hook, /fetch\(/);
    assert.match(provider, /need\.continue-request/);
    assert.doesNotMatch(provider, /NEED_EXPERIENCE_VERSION = "an-act-need-experience-v2"/);
  });
});
