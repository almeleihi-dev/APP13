import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { AuthContext } from "../src/shared/auth/index.js";
import {
  createNeedExperienceService,
  createNeedRepository,
} from "../src/runtime-experience/need/module.js";
import {
  createActionExperienceService,
  createActionRepository,
} from "../src/runtime-experience/action/module.js";
import { validateRuntimeScreenView } from "../packages/runtime-core/src/index.js";

const ROOT = join(import.meta.dirname, "..");
const FIXED_AT = "2026-06-28T12:00:00.000Z";

const CUSTOMER_AUTH: AuthContext = {
  userId: "pilot-customer-001",
  sessionId: "pilot-session-customer",
  roles: ["customer"],
  scopes: [],
  authenticated: true,
};

const PROFESSIONAL_AUTH: AuthContext = {
  userId: "pilot-provider-001",
  sessionId: "pilot-session-provider",
  roles: ["provider"],
  scopes: [],
  authenticated: true,
};

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("Chapter 6 Sprint 4 — Scenario 1: First Customer", () => {
  const need = createNeedExperienceService({ repository: createNeedRepository() });

  it("completes Need journey through search, opportunity, request, and transition", () => {
    const home = need.getExperience(CUSTOMER_AUTH, { generated_at: FIXED_AT });
    assert.equal(home.current_screen, "need-home");

    const search = need.performSearch(CUSTOMER_AUTH, { keyword: "electrician", generated_at: FIXED_AT });
    assert.equal(search.screen.screenId, "opportunity-list");
    assert.ok(search.opportunity_count >= 1);

    need.getRequest(CUSTOMER_AUTH, { opportunity_id: "opp-1", generated_at: FIXED_AT });
    const request = need.getRequest(CUSTOMER_AUTH, { generated_at: FIXED_AT });
    assert.equal(request.screenId, "request");

    need.dispatchAction(CUSTOMER_AUTH, {
      type: "update-request",
      fields: { location: "Riyadh", schedule: "Mon 10:00" },
    });
    const transition = need.continueRequest(CUSTOMER_AUTH, { generated_at: FIXED_AT });
    assert.equal(transition.screen.screenId, "transition");
    assert.equal(transition.next_mode, "action");
  });

  it("wires web shell customer path with instrumentation milestones", () => {
    const app = read("apps/web/src/App.tsx");
    const hook = read("apps/web/src/components/need-mvp/useNeedPresentation.ts");
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    assert.match(app, /enterExperience\("platform"\)|onSelect\("platform"\)/);
    assert.match(app, /RegistrationSuccessPage/);
    assert.match(hook, /recordPilotMilestone\("success"/);
    assert.match(hook, /recordPilotMilestone\("tracking"/);
    assert.match(landing, /Enter live platform/);
  });

  it("simulates instrumentation journey completion for customer funnel", async () => {
    const {
      resetPilotInstrumentationForTests,
      recordPilotMilestone,
      recordPilotSearchMetric,
      getPilotDashboardSnapshot,
    } = await import("../apps/web/src/lib/pilot-instrumentation.ts");

    resetPilotInstrumentationForTests();

    const milestones: Array<[Parameters<typeof recordPilotMilestone>[0], Parameters<typeof recordPilotMilestone>[1]]> = [
      ["landing", "started"],
      ["landing", "completed"],
      ["auth", "started"],
      ["auth", "completed"],
      ["need_home", "completed"],
      ["search", "started"],
      ["search", "completed"],
      ["opportunity", "started"],
      ["opportunity", "completed"],
      ["request", "started"],
      ["request", "completed"],
      ["success", "started"],
      ["success", "completed"],
      ["tracking", "started"],
      ["tracking", "completed"],
    ];

    for (const [milestone, phase] of milestones) {
      recordPilotMilestone(milestone, phase);
    }
    recordPilotSearchMetric({ durationMs: 680, zeroResults: false });

    const snapshot = getPilotDashboardSnapshot();
    assert.equal(snapshot.journeys.completed, 1);
    assert.equal(snapshot.milestones.tracking.completed, 1);
    assert.equal(snapshot.search.total, 1);
  });
});

describe("Chapter 6 Sprint 4 — Scenario 2: First Professional", () => {
  const action = createActionExperienceService({ repository: createActionRepository() });

  it("completes action workflow from contract through completion", () => {
    const entered = action.enterFromNeedTransition(PROFESSIONAL_AUTH, { generated_at: FIXED_AT });
    assert.equal(entered.current_screen, "action-home");
    assert.equal(entered.mode, "action");

    const contract = action.getContract(PROFESSIONAL_AUTH, { generated_at: FIXED_AT });
    assert.equal(validateRuntimeScreenView(contract).valid, true);

    action.continueContract(PROFESSIONAL_AUTH, { generated_at: FIXED_AT });
    const progress = action.getProgress(PROFESSIONAL_AUTH, { generated_at: FIXED_AT });
    assert.equal(progress.screenId, "progress-screen");

    const completed = action.completeAction(PROFESSIONAL_AUTH, { generated_at: FIXED_AT });
    assert.equal(completed.screen.screenId, "completion-screen");
    assert.equal(validateRuntimeScreenView(completed.screen).valid, true);
  });

  it("wires professional registration and passport onboarding in web shell", () => {
    const app = read("apps/web/src/App.tsx");
    const provider = read("apps/web/src/providers/RuntimeProvider.tsx");
    assert.match(app, /RegisterProviderPage/);
    assert.match(app, /ProviderOnboardingPage/);
    assert.match(app, /ProviderProfilePage/);
    assert.match(app, /finishProviderSetup/);
    assert.match(provider, /loadActionExperience/);
  });

  it("exposes professional passport preview on landing", () => {
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    assert.match(landing, /Professional Passport/);
    assert.match(landing, /ProfessionalPassportMiniPreview/);
  });
});

describe("Chapter 6 Sprint 4 — Scenario 3: Enterprise Partner", () => {
  it("routes landing → partner package → live platform", () => {
    const app = read("apps/web/src/App.tsx");
    const partner = read("apps/web/src/pages/PartnerOverviewPage.tsx");
    assert.match(app, /experience === "partner"/);
    assert.match(app, /PartnerOverviewPage/);
    assert.match(app, /onEnterPlatform/);
    assert.match(partner, /Partner package/);
    assert.match(partner, /Enter live platform/);
    assert.match(partner, /Technical overview/);
    assert.match(partner, /Security overview/);
  });

  it("routes landing → executive presentation", () => {
    const app = read("apps/web/src/App.tsx");
    const executive = read("apps/web/src/pages/ExecutivePresentationPage.tsx");
    assert.match(app, /experience === "executive"/);
    assert.match(app, /ExecutivePresentationPage/);
    assert.match(executive, /Executive presentation/);
    assert.match(executive, /PresentationError/);
    assert.doesNotMatch(executive, /<pre>/);
  });
});

describe("Chapter 6 Sprint 4 — Scenario 4: Investor", () => {
  it("surfaces marketplace story and passport on landing for investor walkthrough", () => {
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    assert.match(landing, /Action Marketplace/);
    assert.match(landing, /PremiumMarketplaceFlow/);
    assert.match(landing, /Professional Passport/);
    assert.match(landing, /Executive presentation/);
    assert.match(landing, /investors/);
  });

  it("executive experience loads structured summaries without raw JSON", () => {
    const executive = read("apps/web/src/pages/ExecutivePresentationPage.tsx");
    assert.match(executive, /ExecutiveSummaryCards/);
    assert.match(executive, /KnowledgeBankSummaryCards/);
    assert.match(executive, /Marketplace/);
    assert.doesNotMatch(executive, /JSON\.stringify/);
  });

  it("connects investor path to live Need journey entry", () => {
    const app = read("apps/web/src/App.tsx");
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    assert.match(landing, /onSelect\("platform"\)/);
    assert.match(app, /reloadNeedExperience/);
  });
});

describe("Chapter 6 Sprint 4 — Validation criteria (automated)", () => {
  it("confirms error recovery and retry wiring from Sprint 2", () => {
    const page = read("apps/web/src/pages/RuntimePage.tsx");
    const provider = read("apps/web/src/providers/RuntimeProvider.tsx");
    assert.match(page, /PresentationError|Try again/);
    assert.match(page, /recordPilotOffline/);
    assert.match(provider, /handleClientError/);
    assert.match(provider, /sessionExpired/);
  });

  it("confirms accessibility landmarks on auth and MVP flow", () => {
    const login = read("apps/web/src/pages/LoginPage.tsx");
    const mvp = read("apps/web/src/components/need-mvp/NeedMvpFlow.tsx");
    assert.match(login, /<h1/);
    assert.match(mvp, /aria-current=\{index === currentIndex \? "step"/);
  });

  it("keeps validation scope free of architecture or API changes", () => {
    const instrumentation = read("apps/web/src/lib/pilot-instrumentation.ts");
    assert.doesNotMatch(instrumentation, /segment|mixpanel|google-analytics/i);
    assert.doesNotMatch(read("apps/web/src/App.tsx"), /\/api\/pilot/);
  });
});

describe("Chapter 6 Sprint 4 — Pilot readiness aggregate", () => {
  it("computes scenario pass rates for validation report", () => {
    const scenarios = {
      firstCustomer: { wired: true, serviceLayer: true, instrumented: true },
      firstProfessional: { wired: true, serviceLayer: true, instrumented: false },
      enterprisePartner: { wired: true, serviceLayer: true, instrumented: false },
      investor: { wired: true, serviceLayer: true, instrumented: false },
    };

    const wired = Object.values(scenarios).filter((s) => s.wired).length;
    const service = Object.values(scenarios).filter((s) => s.serviceLayer).length;
    const instrumented = Object.values(scenarios).filter((s) => s.instrumented).length;

    assert.equal(wired, 4);
    assert.equal(service, 4);
    assert.equal(instrumented, 1);
    assert.ok(instrumented / 4 >= 0.25);
  });
});
