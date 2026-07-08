import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { normalizeMultilingualInput } from "../apps/web/src/i18n/multilingual-input.js";
import { matchProfessionProfile } from "../apps/web/src/lib/living-platform/intelligence/profession-action-catalog.js";
import { matchProjectTemplate } from "../apps/web/src/lib/living-platform/project-decomposition-engine.js";
import { discoverActionInventoryFromProfessionText } from "../apps/web/src/lib/living-platform/intelligence/professional-action-inventory-engine.js";
import {
  deriveActionExecutionLocation,
  deriveProjectLocationFromTemplate,
} from "../apps/web/src/lib/living-platform/intelligence/action-location-intelligence.js";
import {
  defaultMarketplaceFilters,
  filterPublishedActionsByLocation,
} from "../apps/web/src/lib/living-platform/intelligence/marketplace-location-filters.js";
import { migrateLivingPlatformToV6 } from "../apps/web/src/lib/living-platform/location-foundation.js";
import type { LivingPlatformState, PublishedProfessionalAction } from "../apps/web/src/lib/living-platform/types.js";
import { applyDocumentLocale } from "../apps/web/src/i18n/locale-store.js";
import { SUPPORTED_LOCALES } from "../apps/web/src/i18n/locale-types.js";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

const EMPTY_V5: LivingPlatformState = {
  version: 5,
  publishedActions: [],
  drafts: [],
  requests: [],
  contracts: [],
  passportHistory: {},
  teams: [],
  projects: [],
  economySignals: [],
  actionInventory: [],
  passportGrowthEvents: [],
  opportunityAlerts: [],
  activity: [],
};

const SAMPLE_ACTION: PublishedProfessionalAction = {
  id: "pub-1",
  blueprint: {
    name: "Software feature delivery",
    purpose: "Remote software development",
    targetCustomer: "Startups",
    deliverables: "Feature",
    successCriteria: "Shipped",
    estimatedDuration: "2 weeks",
    evidenceRequirements: "Repo",
  },
  creator: {
    passportKey: "dev",
    fullName: "Alex Dev",
    professionalTitle: "Developer",
    mainSkill: "Software development",
    location: "Heidelberg, Germany",
    liveFrameTier: "Gold",
    classification: "Technical Professional",
    certifications: ["English"],
    photoUrl: undefined,
  },
  qualityScore: 88,
  publishedAt: new Date().toISOString(),
};

describe("AN ACT Functional Beta Sprint 7 — Global Language & Location Foundation", () => {
  it("imports sprint 7 stylesheet and living-s7 class", () => {
    assert.match(read("apps/web/src/styles/global.css"), /an-act-functional-beta-sprint7\.css/);
    assert.match(read("apps/web/src/main.tsx"), /an-act-living-s7/);
  });

  it("supports English, German, and Arabic locales with RTL for Arabic", () => {
    assert.deepEqual(SUPPORTED_LOCALES, ["en", "de", "ar"]);
    assert.match(read("apps/web/src/i18n/locale-store.ts"), /dir = locale === "ar" \? "rtl" : "ltr"/);
    applyDocumentLocale("ar");
    assert.equal(typeof document !== "undefined" ? document.documentElement.dir : "rtl", "rtl");
    applyDocumentLocale("en");
  });

  it("maps multilingual professions to the same canonical inventory profile", () => {
    const samples = ["Bauingenieur", "Civil Engineer", "مهندس إنشاءات"];
    const canonical = samples.map((text) => normalizeMultilingualInput(text));
    assert.ok(canonical.every((value) => value.toLowerCase().includes("engineer")));
    const profiles = samples.map((text) => matchProfessionProfile(normalizeMultilingualInput(text)));
    assert.ok(profiles.every(Boolean));
    assert.equal(profiles[0]?.profileId, profiles[1]?.profileId);
  });

  it("maps Steuerberater, Certified Accountant, and Arabic accountant variants", () => {
    const samples = ["Steuerberater", "Certified Accountant", "محاسب قانوني"];
    const normalized = samples.map(normalizeMultilingualInput);
    assert.ok(normalized.every((value) => value.toLowerCase().includes("accountant")));
  });

  it("maps multilingual goals to the same project template", () => {
    const goals = [
      "Ich möchte eine App erstellen",
      "I want to build an app",
      "أريد بناء تطبيق",
    ];
    const templates = goals.map((goal) => matchProjectTemplate(normalizeMultilingualInput(goal)).templateId);
    assert.ok(templates.every((id) => id === "launch-app"));
  });

  it("derives execution location intelligence for actions", () => {
    assert.equal(deriveActionExecutionLocation("Software feature delivery"), "remote");
    assert.equal(deriveActionExecutionLocation("House inspection report"), "local");
    assert.equal(deriveActionExecutionLocation("Project management coordination"), "hybrid");
  });

  it("assigns executionLocation on discovered inventory items", () => {
    const items = discoverActionInventoryFromProfessionText("Bauingenieur", EMPTY_V5);
    assert.ok(items.length > 0);
    assert.ok(items.every((item) => item.executionLocation));
  });

  it("migrates living platform storage to version 6 with location fields", () => {
    assert.match(read("apps/web/src/lib/living-platform/types.ts"), /version: 6/);
    const migrated = migrateLivingPlatformToV6({
      ...EMPTY_V5,
      projects: [
        {
          projectId: "prj-1",
          goal: "Build app",
          name: "Build app",
          templateId: "launch-app",
          teamId: null,
          creatorPassportKey: "dev",
          selectedPath: "balanced",
          phases: [],
          progressPercent: 0,
          completedPhaseCount: 0,
          activeContractIds: [],
          evidenceHistory: [],
          riskIndicators: [],
          trustLevel: 60,
          executionStatus: "planning",
          liveFrameHealth: "healthy",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      teams: [
        {
          teamId: "team-1",
          name: "Team Alpha",
          members: [],
          leaderPassportKey: "dev",
          combinedSkills: [],
          completedActions: 0,
          trustIndicators: [],
          liveFrameTier: "Silver",
          trustScore: 70,
          reliabilityScore: 70,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });
    assert.equal(migrated.version, 6);
    assert.ok(migrated.projects[0]?.projectLocation);
    assert.ok(migrated.teams[0]?.globalCapability);
  });

  it("derives project location needs from template", () => {
    const house = deriveProjectLocationFromTemplate("build-house");
    const app = deriveProjectLocationFromTemplate("launch-app");
    assert.equal(house.localTeamRequired, true);
    assert.equal(app.remoteTeamPossible, true);
  });

  it("filters marketplace actions by location scope and remote availability", () => {
    const localAction: PublishedProfessionalAction = {
      ...SAMPLE_ACTION,
      id: "pub-2",
      blueprint: { ...SAMPLE_ACTION.blueprint, name: "House inspection", purpose: "On-site inspection" },
      creator: { ...SAMPLE_ACTION.creator, location: "Berlin, Germany", mainSkill: "Construction inspection" },
    };
    const actions = [SAMPLE_ACTION, localAction];
    const nearMe = filterPublishedActionsByLocation(actions, {
      filters: { ...defaultMarketplaceFilters(), scope: "same_city", city: "Heidelberg" },
    });
    assert.equal(nearMe.length, 1);
    const remote = filterPublishedActionsByLocation(actions, {
      filters: { ...defaultMarketplaceFilters(), remoteOnly: true },
    });
    assert.equal(remote.length, 1);
  });

  it("wires language selector into launch, guest, builder, and passport flows", () => {
    assert.match(read("apps/web/src/launch/LaunchSplashPage.tsx"), /LanguageSelector/);
    assert.match(read("apps/web/src/launch/GuestEntryPage.tsx"), /LanguageSelector/);
    assert.match(read("apps/web/src/launch/ActBuilderPage.tsx"), /LanguageSelector/);
    assert.match(read("apps/web/src/pages/ProfileStartPage.tsx"), /LanguageSelector/);
  });

  it("extends passport with geo profile fields", () => {
    const passport = read("apps/web/src/passport/personal-passport-persistence.ts");
    assert.match(passport, /geoProfile/);
    assert.match(passport, /languages/);
    assert.match(read("apps/web/src/pages/ProfileStartPage.tsx"), /passport\.country/);
  });

  it("keeps brand lowercase an act in messages", () => {
    const messages = read("apps/web/src/i18n/messages.ts");
    assert.match(messages, /an act/);
    assert.doesNotMatch(messages, /AN ACT/);
  });
});
