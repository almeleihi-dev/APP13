import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import type { AuthContext } from "../src/shared/auth/index.js";
import {
  RUNTIME_REGISTRY_VERSION,
  REGISTERED_EXPERIENCE_IDS,
  RUNTIME_CAPABILITY_IDS,
  RUNTIME_CAPABILITIES,
  buildOfficialRuntimeCatalog,
  createAnActRuntimeRegistryModule,
  createRuntimeRegistryRepository,
  createRuntimeDiscovery,
  collectExperienceValidationStatus,
  validateRuntimeRegistry,
  buildRegistrySummary,
  buildRegistryBrowser,
  buildExperienceMapPresentation,
  getRuntimeExperienceMetadata,
} from "../src/runtime-experience/runtime-registry/module.js";
import { NEED_EXPERIENCE_VERSION } from "../src/runtime-experience/need/module.js";
import { ACTION_EXPERIENCE_VERSION } from "../src/runtime-experience/action/module.js";
import { CONTRACT_EXPERIENCE_VERSION } from "../src/runtime-experience/contract/module.js";
import { CHAT_EXPERIENCE_VERSION } from "../src/runtime-experience/chat/module.js";
import { TIMELINE_EXPERIENCE_VERSION } from "../src/runtime-experience/timeline/module.js";
import { NOTIFICATION_EXPERIENCE_VERSION } from "../src/runtime-experience/notification/module.js";
import { PROFILE_EXPERIENCE_VERSION } from "../src/runtime-experience/profile/module.js";
import { RUNTIME_JOURNEY_VERSION } from "../src/runtime-experience/runtime-journey/module.js";
import { RUNTIME_STATE_VERSION } from "../src/runtime-experience/runtime-state/module.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../src/navigation-framework/validation/navigation-validator.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-runtime-registry-001",
  sessionId: "session-runtime-registry-001",
  roles: ["customer"],
  scopes: [],
  authenticated: true,
};

const FIXED_AT = "2026-06-21T12:00:00.000Z";

function createRegistryModule() {
  return createAnActRuntimeRegistryModule({ repository: createRuntimeRegistryRepository() });
}

describe("CH3-X14 AN ACT Runtime Experience Registry", () => {
  describe("domain", () => {
    it("registers all nine official runtime experiences", () => {
      assert.equal(REGISTERED_EXPERIENCE_IDS.length, 9);
      assert.ok(REGISTERED_EXPERIENCE_IDS.includes("need"));
      assert.ok(REGISTERED_EXPERIENCE_IDS.includes("runtime-journey"));
      assert.ok(REGISTERED_EXPERIENCE_IDS.includes("runtime-state"));
    });

    it("builds official catalog from experience modules", () => {
      const status = collectExperienceValidationStatus();
      const catalog = buildOfficialRuntimeCatalog(status, FIXED_AT);
      assert.equal(catalog.experienceCount, 9);
      assert.equal(catalog.version, RUNTIME_REGISTRY_VERSION);
    });

    it("defines runtime capabilities", () => {
      assert.ok(RUNTIME_CAPABILITY_IDS.length >= 10);
      assert.ok(RUNTIME_CAPABILITIES.some((c) => c.id === "discovery"));
      assert.ok(RUNTIME_CAPABILITIES.some((c) => c.id === "orchestration"));
    });

    it("includes metadata for each registered experience", () => {
      for (const id of REGISTERED_EXPERIENCE_IDS) {
        const meta = getRuntimeExperienceMetadata(id);
        assert.ok(meta.chapter.startsWith("CH3-X"));
        assert.ok(meta.apiPrefix.startsWith("/"));
        assert.equal(meta.readOnly, true);
        assert.equal(meta.persistence, false);
      }
    });
  });

  describe("discovery", () => {
    it("builds dependency graph with integrity", () => {
      const status = collectExperienceValidationStatus();
      const catalog = buildOfficialRuntimeCatalog(status, FIXED_AT);
      const discovery = createRuntimeDiscovery();
      const graph = discovery.buildDependencyGraph(catalog);
      assert.equal(graph.length, 9);
      const journey = graph.find((n) => n.id === "runtime-journey");
      assert.ok(journey?.dependencies.includes("need"));
      assert.ok(journey?.dependencies.includes("profile"));
      const state = graph.find((n) => n.id === "runtime-state");
      assert.deepEqual(state?.dependencies, ["runtime-journey"]);
    });

    it("builds experience map for discovery", () => {
      const status = collectExperienceValidationStatus();
      const catalog = buildOfficialRuntimeCatalog(status, FIXED_AT);
      const discovery = createRuntimeDiscovery();
      const map = discovery.buildExperienceMap(catalog);
      assert.equal(map.length, 9);
      assert.ok(map.every((e) => e.primaryRoute.startsWith("/")));
    });

    it("lists capability coverage across experiences", () => {
      const status = collectExperienceValidationStatus();
      const catalog = buildOfficialRuntimeCatalog(status, FIXED_AT);
      const discovery = createRuntimeDiscovery();
      const caps = discovery.listCapabilities(catalog);
      assert.ok(caps.coverage.length >= 8);
      assert.ok(caps.capabilities.length >= RUNTIME_CAPABILITY_IDS.length);
    });
  });

  describe("presentation", () => {
    it("builds registry summary and browser", () => {
      const status = collectExperienceValidationStatus();
      const catalog = buildOfficialRuntimeCatalog(status, FIXED_AT);
      const summary = buildRegistrySummary(catalog);
      const browser = buildRegistryBrowser(catalog);
      assert.ok(summary.sections.some((s) => s.id === "registry-overview"));
      assert.equal(browser.sections[0]?.components.length, 9);
    });

    it("builds experience map presentation", () => {
      const status = collectExperienceValidationStatus();
      const catalog = buildOfficialRuntimeCatalog(status, FIXED_AT);
      const discovery = createRuntimeDiscovery();
      const map = discovery.buildExperienceMap(catalog);
      const presentation = buildExperienceMapPresentation(map);
      assert.equal(presentation.sections[0]?.components.length, 9);
    });
  });

  describe("service", () => {
    it("returns authoritative registry view", () => {
      const { runtimeRegistry } = createRegistryModule();
      const view = runtimeRegistry.getRegistry(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(view.runtime_registry, true);
      assert.equal(view.authoritative, true);
      assert.equal(view.experience_count, 9);
      assert.equal(view.read_only, true);
    });

    it("lists all registered experiences", () => {
      const { runtimeRegistry } = createRegistryModule();
      const list = runtimeRegistry.getExperiences(USER_AUTH);
      assert.equal(list.count, 9);
      assert.equal(list.experiences.length, 9);
    });

    it("gets experience by id", () => {
      const { runtimeRegistry } = createRegistryModule();
      const need = runtimeRegistry.getExperience(USER_AUTH, "need") as { found: boolean; experience: { version: string } };
      assert.equal(need.found, true);
      assert.equal(need.experience.version, NEED_EXPERIENCE_VERSION);
      const missing = runtimeRegistry.getExperience(USER_AUTH, "unknown");
      assert.equal(missing.found, false);
    });

    it("returns dependency graph and capabilities", () => {
      const { runtimeRegistry } = createRegistryModule();
      const deps = runtimeRegistry.getDependencies(USER_AUTH);
      assert.equal(deps.graph.length, 9);
      const caps = runtimeRegistry.getCapabilities(USER_AUTH);
      assert.ok(caps.coverage.length >= 8);
    });

    it("returns experience map with lifecycle coverage", () => {
      const { runtimeRegistry } = createRegistryModule();
      const mapView = runtimeRegistry.getMap(USER_AUTH);
      assert.equal(mapView.map.length, 9);
      assert.ok(mapView.lifecycle_coverage.length >= 7);
    });

    it("reloads catalog deterministically", () => {
      const { runtimeRegistry } = createRegistryModule();
      const first = runtimeRegistry.getCatalog(USER_AUTH, { generated_at: FIXED_AT });
      const reloaded = runtimeRegistry.reload(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(reloaded.experience_count, 9);
      assert.equal(first.experienceCount, 9);
    });

    it("links all experience versions in catalog", () => {
      const { runtimeRegistry } = createRegistryModule();
      const catalog = runtimeRegistry.getCatalog(USER_AUTH, { generated_at: FIXED_AT });
      const versions = Object.fromEntries(catalog.experiences.map((e) => [e.id, e.version]));
      assert.equal(versions.need, NEED_EXPERIENCE_VERSION);
      assert.equal(versions.action, ACTION_EXPERIENCE_VERSION);
      assert.equal(versions.contract, CONTRACT_EXPERIENCE_VERSION);
      assert.equal(versions.chat, CHAT_EXPERIENCE_VERSION);
      assert.equal(versions.timeline, TIMELINE_EXPERIENCE_VERSION);
      assert.equal(versions.notification, NOTIFICATION_EXPERIENCE_VERSION);
      assert.equal(versions.profile, PROFILE_EXPERIENCE_VERSION);
      assert.equal(versions["runtime-journey"], RUNTIME_JOURNEY_VERSION);
      assert.equal(versions["runtime-state"], RUNTIME_STATE_VERSION);
    });
  });

  describe("validation", () => {
    it("passes full runtime registry validation", () => {
      const result = validateRuntimeRegistry();
      assert.equal(result.valid, true, result.errors.join("; "));
      assert.equal(result.errors.length, 0);
      assert.equal(result.checked.registeredExperiences, 9);
      assert.equal(result.checked.needRegistration, true);
      assert.equal(result.checked.actionRegistration, true);
      assert.equal(result.checked.contractRegistration, true);
      assert.equal(result.checked.chatRegistration, true);
      assert.equal(result.checked.timelineRegistration, true);
      assert.equal(result.checked.notificationRegistration, true);
      assert.equal(result.checked.profileRegistration, true);
      assert.equal(result.checked.journeyRegistration, true);
      assert.equal(result.checked.stateRegistration, true);
      assert.equal(result.checked.dependencyGraphIntegrity, true);
      assert.equal(result.checked.noDuplicateRegistrations, true);
      assert.equal(result.checked.discoveryCorrectness, true);
    });

    it("module factory exposes validate and service", () => {
      const mod = createRegistryModule();
      assert.equal(mod.version, RUNTIME_REGISTRY_VERSION);
      assert.equal(mod.validate().valid, true);
      assert.equal(mod.runtimeRegistry.validateRuntime().valid, true);
    });
  });

  describe("accessibility", () => {
    it("meets minimum touch target in registry view", () => {
      const { runtimeRegistry } = createRegistryModule();
      const view = runtimeRegistry.getRegistry(USER_AUTH, { generated_at: FIXED_AT });
      assert.ok(view.accessibility.minimumTouchTargetPx >= 44);
      assert.equal(NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-X14", async () => {
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");
      assert.match(packageSource, /verify:ch3-x14/);
      assert.match(packageSource, /test:ch3-x14-runtime-registry/);
    });

    it("registers runtime registry routes module", async () => {
      const routesSource = await readFile(path.join(ROOT_DIR, "src/api/routes/runtime-registry.ts"), "utf8");
      assert.match(routesSource, /\/runtime-registry/);
      assert.match(routesSource, /\/runtime-registry\/catalog/);
      assert.match(routesSource, /\/runtime-registry\/reload/);
      assert.match(routesSource, /\/runtime-registry\/validate/);
    });

    it("wires runtime registry in server and index", async () => {
      const serverSource = await readRouteWiringSource();
      const indexSource = await readModuleWiringSource();
      assert.match(serverSource, /registerRuntimeRegistryRoutes/);
      assert.match(serverSource, /runtimeRegistry/);
      assert.match(indexSource, /createAnActRuntimeRegistryModule/);
      assert.match(indexSource, /runtimeRegistry/);
    });
  });
});
