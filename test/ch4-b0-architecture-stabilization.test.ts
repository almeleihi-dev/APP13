import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const BOOTSTRAP_FILES = [
  "engines.ts",
  "financial.ts",
  "runtime.ts",
  "experiences.ts",
  "living.ts",
  "intelligence.ts",
  "platform.ts",
  "security.ts",
  "routes.ts",
  "bootstrap.ts",
  "dependencies.ts",
];

describe("CH4-B0 architecture stabilization", () => {
  describe("bootstrap layout", () => {
    it("provides dedicated bootstrap modules", async () => {
      for (const file of BOOTSTRAP_FILES) {
        await access(path.join(ROOT_DIR, "src/bootstrap", file));
      }
    });

    it("keeps index.ts as a minimal entry point", async () => {
      const index = await readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8");
      assert.match(index, /bootstrapApp/);
      assert.match(index, /buildServer/);
      assert.doesNotMatch(index, /createTrustModule/);
      assert.doesNotMatch(index, /registerRuntimeCompletionRoutes/);
    });

    it("keeps server.ts as orchestration only", async () => {
      const server = await readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8");
      assert.match(server, /registerAppRoutes/);
      assert.match(server, /createAuthenticateMiddleware/);
      assert.doesNotMatch(server, /registerRuntimeCompletionRoutes/);
      assert.doesNotMatch(server, /export interface AppDependencies/);
    });
  });

  describe("dependency grouping", () => {
    it("defines grouped dependency interfaces", async () => {
      const deps = await readFile(path.join(ROOT_DIR, "src/bootstrap/dependencies.ts"), "utf8");
      for (const iface of [
        "EngineDependencies",
        "RuntimeDependencies",
        "ExperienceDependencies",
        "PlatformDependencies",
        "SecurityDependencies",
        "FinancialDependencies",
        "IntelligenceDependencies",
        "LivingDependencies",
        "AppDependencies",
      ]) {
        assert.match(deps, new RegExp(`export interface ${iface}`));
      }
    });

    it("composes AppDependencies in bootstrap.ts", async () => {
      const bootstrap = await readFile(path.join(ROOT_DIR, "src/bootstrap/bootstrap.ts"), "utf8");
      assert.match(bootstrap, /export function bootstrapApp/);
      assert.match(bootstrap, /bootstrapPlatform/);
      assert.match(bootstrap, /bootstrapEngines/);
      assert.match(bootstrap, /bootstrapRuntime/);
      assert.match(bootstrap, /bootstrapFinancial/);
      assert.match(bootstrap, /bootstrapSecurity/);
      assert.match(bootstrap, /AppDependencies/);
    });
  });

  describe("registration boundaries", () => {
    it("registers runtime modules in bootstrap/runtime.ts", async () => {
      const source = await readFile(path.join(ROOT_DIR, "src/bootstrap/runtime.ts"), "utf8");
      assert.match(source, /createAnActRuntimeCompletionModule/);
      assert.match(source, /runtimeCompletion/);
    });

    it("registers living modules in bootstrap/living.ts", async () => {
      const source = await readFile(path.join(ROOT_DIR, "src/bootstrap/living.ts"), "utf8");
      assert.match(source, /createLivingOnboardingModule/);
      assert.match(source, /livingOnboarding/);
    });

    it("registers platform experiences in bootstrap/experiences.ts", async () => {
      const source = await readFile(path.join(ROOT_DIR, "src/bootstrap/experiences.ts"), "utf8");
      assert.match(source, /createHomeExperienceModule/);
      assert.match(source, /createBrowserSurfaceModule/);
    });

    it("registers intelligence in bootstrap/intelligence.ts", async () => {
      const source = await readFile(path.join(ROOT_DIR, "src/bootstrap/intelligence.ts"), "utf8");
      assert.match(source, /createActionIntelligenceService/);
      assert.match(source, /createIntelligenceOrchestrationModule/);
    });

    it("registers security in bootstrap/security.ts", async () => {
      const source = await readFile(path.join(ROOT_DIR, "src/bootstrap/security.ts"), "utf8");
      assert.match(source, /createSecurityAuthKernelService/);
      assert.match(source, /securityAuth/);
    });

    it("registers routes in bootstrap/routes.ts", async () => {
      const source = await readRouteWiringSource();
      assert.match(source, /registerRuntimeCompletionRoutes/);
      assert.match(source, /registerLivingOnboardingRoutes/);
      assert.match(source, /registerAppRoutes/);
    });

    it("preserves module wiring across bootstrap composition", async () => {
      const wiring = await readModuleWiringSource();
      assert.match(wiring, /createAnActRuntimeCompletionModule/);
      assert.match(wiring, /createContractEngineService/);
      assert.match(wiring, /createSecurityAuthKernelService/);
    });
  });

  describe("verification scripts", () => {
    it("loads workspace wiring for CH4-B0", async () => {
      const pkg = JSON.parse(await readFile(path.join(ROOT_DIR, "package.json"), "utf8"));
      assert.ok(pkg.scripts["verify:ch4-b0"]);
      assert.ok(pkg.scripts["test:ch4-b0-architecture-stabilization"]);
    });
  });
});
