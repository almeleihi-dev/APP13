import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

describe("MVP Phase 13 — Enterprise presentation stylesheet", () => {
  it("defines Phase 13 enterprise refinement classes", () => {
    const css = readFileSync(
      join(ROOT, "packages/runtime-ui/src/react/styles/an-act-identity-premium.css"),
      "utf8"
    );
    assert.match(css, /\.p13-hero__statement/);
    assert.match(css, /\.p13-cta-primary/);
    assert.match(css, /\.p13-live-status/);
    assert.match(css, /\.p13-passport-preview/);
    assert.match(css, /\.p13-marketplace-flow/);
    assert.match(css, /\.p13-entry-badge--live/);
    assert.match(css, /prefers-reduced-motion/);
  });
});

describe("MVP Phase 13 — Enterprise presentation components", () => {
  it("exports Phase 13 enterprise components", () => {
    const index = readFileSync(join(ROOT, "packages/runtime-ui/src/react/index.ts"), "utf8");
    assert.match(index, /PremiumEntryBadge/);
    assert.match(index, /PremiumLiveIndicator/);
    assert.match(index, /PremiumMarketplaceFlow/);
    assert.match(index, /ProfessionalPassportMiniPreview/);
  });

  it("uses existing runtime passport copy in preview", () => {
    const preview = readFileSync(
      join(ROOT, "packages/runtime-ui/src/react/components/premium/EnterprisePresentation.tsx"),
      "utf8"
    );
    assert.match(preview, /Gold Live Frame tier/);
    assert.match(preview, /Licensed/);
    assert.match(preview, /248 completed actions/);
  });
});

describe("MVP Phase 13 — Landing enterprise refinement", () => {
  it("adds hero clarity and CTA hierarchy", () => {
    const landing = readFileSync(join(ROOT, "apps/web/src/pages/PartnerLandingPage.tsx"), "utf8");
    assert.match(landing, /p13-hero__statement/);
    assert.match(landing, /Where professional requirement becomes trusted action/);
    assert.match(landing, /p13-cta-primary/);
    assert.match(landing, /Enter live platform/);
    assert.match(landing, /p13-cta-secondary/);
  });

  it("adds live indicators and entry badges", () => {
    const landing = readFileSync(join(ROOT, "apps/web/src/pages/PartnerLandingPage.tsx"), "utf8");
    assert.match(landing, /PremiumLiveIndicator/);
    assert.match(landing, /PremiumEntryBadge/);
    assert.match(landing, /badge: "live"/);
    assert.match(landing, /badge: "demo"/);
    assert.match(landing, /badge: "executive"/);
    assert.match(landing, /badge: "partner"/);
  });

  it("adds passport preview and marketplace flow", () => {
    const landing = readFileSync(join(ROOT, "apps/web/src/pages/PartnerLandingPage.tsx"), "utf8");
    assert.match(landing, /ProfessionalPassportMiniPreview/);
    assert.match(landing, /PremiumMarketplaceFlow/);
    assert.match(landing, /live={stat\.live}/);
  });
});

describe("MVP Phase 13 — Architecture boundaries", () => {
  it("keeps changes presentation-only", () => {
    const landing = readFileSync(join(ROOT, "apps/web/src/pages/PartnerLandingPage.tsx"), "utf8");
    const enterprise = readFileSync(
      join(ROOT, "packages/runtime-ui/src/react/components/premium/EnterprisePresentation.tsx"),
      "utf8"
    );
    assert.doesNotMatch(landing, /fetch\(/);
    assert.doesNotMatch(landing, /loadNeedExperience/);
    assert.doesNotMatch(enterprise, /need-experience/);
    assert.doesNotMatch(enterprise, /RuntimeProvider/);
  });
});
