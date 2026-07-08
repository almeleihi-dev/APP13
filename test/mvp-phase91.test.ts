import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

describe("MVP Phase 9.1 — Interactive Need experience", () => {
  it("enhances live search presentation in runtime UI", () => {
    const search = readFileSync(join(ROOT, "packages/runtime-ui/src/react/components/P1Components.tsx"), "utf8");
    assert.match(search, /liveSearch/);
    assert.match(search, /an-act-search-form__clear/);
    assert.match(search, /Finding the best matches|Search live/);
    assert.match(search, /debounceRef/);
  });

  it("renders rich opportunity cards with View Details CTA", () => {
    const card = readFileSync(join(ROOT, "packages/runtime-ui/src/react/components/P1Components.tsx"), "utf8");
    assert.match(card, /need\.view-opportunity/);
    assert.match(card, /View Details/);
    assert.match(card, /an-act-opportunity-card--premium|an-act-opportunity-card__metrics/);
    assert.match(card, /Live Frame/);
  });

  it("wires client-side Need MVP flow screens in RuntimePage", () => {
    const runtimePage = readFileSync(join(ROOT, "apps/web/src/pages/RuntimePage.tsx"), "utf8");
    assert.match(runtimePage, /NeedMvpFlow/);
    assert.match(runtimePage, /useNeedPresentation/);
    assert.match(runtimePage, /NeedSearchSkeleton/);
    assert.match(runtimePage, /injectNeedPresentationProps/);
  });

  it("includes opportunity details, confirmation, and success presentation", () => {
    assert.ok(existsSync(join(ROOT, "apps/web/src/components/need-mvp/NeedMvpFlow.tsx")));
    const flow = readFileSync(join(ROOT, "apps/web/src/components/need-mvp/NeedMvpFlow.tsx"), "utf8");
    assert.match(flow, /Opportunity details|Verified provider/i);
    assert.match(flow, /Request Service/);
    assert.match(flow, /Confirm your request|Confirm request/i);
    assert.match(flow, /Request created/);
    assert.match(flow, /Return home|Return Home/);
    assert.match(flow, /Professional Passport/);
    assert.match(flow, /Reviews/);
  });

  it("keeps architecture boundaries for phase 9.1 presentation work", () => {
    const hook = readFileSync(join(ROOT, "apps/web/src/components/need-mvp/useNeedPresentation.ts"), "utf8");
    assert.match(hook, /need\.view-opportunity/);
    assert.doesNotMatch(hook, /fetch\(/);
    const service = readFileSync(
      join(ROOT, "src/runtime-experience/need/application/need-experience-service.ts"),
      "utf8"
    );
    const before = service;
    assert.match(before, /performSearch/);
  });
});
