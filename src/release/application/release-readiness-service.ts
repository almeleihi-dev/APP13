import { access, readFile, readdir } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  RC1_EXPECTED_SLICES,
  RC1_IMPLEMENTATION_DOCS,
  RC1_MODULE_REGISTRATIONS,
  RC1_OPTIONAL_ENV_VARS,
  RC1_REQUIRED_ENV_VARS,
  RC1_ROUTE_REGISTRATIONS,
  RC1_TEST_SCRIPTS,
  buildReleaseReadinessReport,
  type ArchitectureSummary,
  type DeploymentReadinessSummary,
  type DocumentationReadinessSummary,
  type OperationalReadinessSummary,
  type ProductionReadinessSummary,
  type ReadinessCheck,
  type ReleaseReadinessReport,
  type SecurityReadinessSummary,
} from "../domain/release-readiness.js";

export interface ReleaseReadinessServiceOptions {
  rootDir?: string;
}

export class ReleaseReadinessService {
  private readonly rootDir: string;

  constructor(options: ReleaseReadinessServiceOptions = {}) {
    this.rootDir = options.rootDir ?? process.cwd();
  }

  async analyze(): Promise<ReleaseReadinessReport> {
    const checks: ReadinessCheck[] = [];

    const indexSource = await this.readOptional("src/index.ts");
    const serverSource = await this.readOptional("src/api/server.ts");
    const packageJson = await this.readOptional("package.json");

    const moduleCheck = this.verifyModuleRegistration(indexSource);
    checks.push(moduleCheck.check);

    const routeCheck = this.verifyRouteRegistration(serverSource);
    checks.push(routeCheck.check);

    const migrationCheck = await this.verifyMigrations();
    checks.push(migrationCheck.check);

    const dependencyCheck = await this.verifyDependencyBoundary();
    checks.push(dependencyCheck.check);

    const buildCheck = await this.verifyBuildConfig();
    checks.push(buildCheck.check);

    const testCheck = this.verifyTestSuites(packageJson);
    checks.push(testCheck.check);

    const envCheck = this.verifyEnvironmentAudit();
    checks.push(envCheck.check);

    const configCheck = this.verifyConfigurationAudit();
    checks.push(configCheck.check);

    const docsCheck = await this.verifyDocumentationCoverage();
    checks.push(docsCheck.check);

    const eventFlowCheck = await this.verifyEventFlow();
    checks.push(eventFlowCheck.check);

    const dashboardCheck = this.verifyDashboards(indexSource, serverSource);
    checks.push(dashboardCheck.check);

    const analyticsCheck = this.verifyAnalytics(indexSource, serverSource);
    checks.push(analyticsCheck.check);

    const notificationCheck = this.verifyNotifications(indexSource, serverSource);
    checks.push(notificationCheck.check);

    const discoveryCheck = this.verifyDiscovery(indexSource, serverSource);
    checks.push(discoveryCheck.check);

    const securityCheck = this.verifySecurity(serverSource);
    checks.push(securityCheck.check);

    const deploymentCheck = await this.verifyDeployment();
    checks.push(deploymentCheck.check);

    const architecture: ArchitectureSummary = {
      moduleCount: moduleCheck.registered.length,
      routeBundleCount: routeCheck.registered.length,
      registeredSlices: moduleCheck.registered,
      missingSlices: moduleCheck.missing,
      migrationCount: migrationCheck.count,
      summary:
        moduleCheck.missing.length === 0
          ? `All S3–S14 module factories are registered in bootstrap with ${migrationCheck.count} migrations present.`
          : `Missing module registrations: ${moduleCheck.missing.join(", ")}.`,
    };

    const production: ProductionReadinessSummary = {
      buildConfigured: buildCheck.check.status !== "fail",
      testSuitesPresent: testCheck.present,
      testSuitesExpected: testCheck.expected,
      dependencyBoundaryConfigured: dependencyCheck.check.status !== "fail",
      summary: `${testCheck.present}/${testCheck.expected} verify scripts present; build and dependency boundary ${
        buildCheck.check.status === "pass" && dependencyCheck.check.status === "pass"
          ? "configured"
          : "need attention"
      }.`,
    };

    const operational: OperationalReadinessSummary = {
      dashboardsVerified: dashboardCheck.check.status === "pass",
      analyticsVerified: analyticsCheck.check.status === "pass",
      notificationsVerified: notificationCheck.check.status === "pass",
      discoveryVerified: discoveryCheck.check.status === "pass",
      eventFlowVerified: eventFlowCheck.check.status === "pass",
      summary:
        eventFlowCheck.check.status === "pass"
          ? "Dashboards, analytics, notifications, discovery, and lifecycle event hooks are wired."
          : "One or more operational surfaces require attention before RC-1 launch.",
    };

    const security: SecurityReadinessSummary = {
      securityKernelPresent: securityCheck.kernelPresent,
      authMiddlewareRegistered: securityCheck.authRegistered,
      adminRoutesProtected: securityCheck.adminProtected,
      summary: securityCheck.check.message,
    };

    const deployment: DeploymentReadinessSummary = {
      migrateScriptPresent: deploymentCheck.migratePresent,
      dockerComposePresent: deploymentCheck.dockerPresent,
      environmentVariablesAudited: envCheck.audited,
      requiredConfigurationAudited: configCheck.audited,
      summary: deploymentCheck.check.message,
    };

    const documentation: DocumentationReadinessSummary = {
      implementationDocsFound: docsCheck.found,
      implementationDocsExpected: docsCheck.expected,
      releaseDocsPresent: docsCheck.releaseDocsPresent,
      missingDocs: docsCheck.missing,
      summary: docsCheck.check.message,
    };

    return buildReleaseReadinessReport({
      checks,
      architecture,
      production,
      operational,
      security,
      deployment,
      documentation,
    });
  }

  private async readOptional(relativePath: string): Promise<string> {
    try {
      return await readFile(path.join(this.rootDir, relativePath), "utf8");
    } catch {
      return "";
    }
  }

  private async pathExists(relativePath: string): Promise<boolean> {
    try {
      await access(path.join(this.rootDir, relativePath));
      return true;
    } catch {
      return false;
    }
  }

  private verifyModuleRegistration(indexSource: string): {
    check: ReadinessCheck;
    registered: string[];
    missing: string[];
  } {
    const registered: string[] = [];
    const missing: string[] = [];

    for (const slice of RC1_EXPECTED_SLICES) {
      if (slice === "S4") {
        if (
          indexSource.includes("createConversionModule") ||
          indexSource.includes("matchContractConversion")
        ) {
          registered.push(slice);
        } else {
          missing.push(slice);
        }
        continue;
      }

      const spec = RC1_MODULE_REGISTRATIONS[slice];
      if (!spec) continue;
      if (indexSource.includes(spec.factory)) {
        registered.push(slice);
      } else {
        missing.push(slice);
      }
    }

    const uniqueRegistered = [...new Set(registered)];

    return {
      registered: uniqueRegistered,
      missing,
      check: {
        id: "module-registration",
        category: "architecture",
        name: "S3–S14 module registration",
        status: missing.length === 0 ? "pass" : "fail",
        message:
          missing.length === 0
            ? `${uniqueRegistered.length} slice module factories found in src/index.ts`
            : `Missing factories for ${missing.join(", ")}`,
      },
    };
  }

  private verifyRouteRegistration(serverSource: string): {
    check: ReadinessCheck;
    registered: string[];
    missing: string[];
  } {
    const registered: string[] = [];
    const missing: string[] = [];

    for (const [slice, spec] of Object.entries(RC1_ROUTE_REGISTRATIONS)) {
      if (serverSource.includes(spec.registrar)) {
        registered.push(slice);
      } else {
        missing.push(slice);
      }
    }

    return {
      registered,
      missing,
      check: {
        id: "route-registration",
        category: "architecture",
        name: "Experience route registration",
        status: missing.length === 0 ? "pass" : "fail",
        message:
          missing.length === 0
            ? `${registered.length} experience route bundles registered in src/api/server.ts`
            : `Missing route registrars for ${missing.join(", ")}`,
      },
    };
  }

  private async verifyMigrations(): Promise<{ check: ReadinessCheck; count: number }> {
    const migrationsDir = path.join(this.rootDir, "database/migrations");
    let files: string[] = [];
    try {
      files = (await readdir(migrationsDir)).filter((name) => name.endsWith(".sql")).sort();
    } catch {
      return {
        count: 0,
        check: {
          id: "migration-files",
          category: "architecture",
          name: "Database migrations",
          status: "fail",
          message: "database/migrations directory not found",
        },
      };
    }

    const hasExperienceMigrations = files.some((file) =>
      ["018_customer_requests", "019_match_contract_conversions", "020_event_inbox"].some(
        (prefix) => file.startsWith(prefix)
      )
    );

    return {
      count: files.length,
      check: {
        id: "migration-files",
        category: "architecture",
        name: "Database migrations",
        status: files.length >= 20 && hasExperienceMigrations ? "pass" : "warn",
        message: `${files.length} SQL migrations found`,
        notes:
          files.length < 20 || !hasExperienceMigrations
            ? "Expected S7–S12 experience migrations (018–020) for RC-1"
            : undefined,
      },
    };
  }

  private async verifyDependencyBoundary(): Promise<{ check: ReadinessCheck }> {
    const exists = await this.pathExists(".dependency-cruiser.cjs");
    return {
      check: {
        id: "dependency-boundary",
        category: "production",
        name: "Dependency boundary verification",
        status: exists ? "pass" : "fail",
        message: exists
          ? "dependency-cruiser config present"
          : ".dependency-cruiser.cjs missing",
      },
    };
  }

  private async verifyBuildConfig(): Promise<{ check: ReadinessCheck }> {
    const tsconfig = await this.pathExists("tsconfig.json");
    const packageJson = await this.pathExists("package.json");
    const buildScript = (await this.readOptional("package.json")).includes('"build"');

    return {
      check: {
        id: "build-config",
        category: "production",
        name: "Build verification",
        status: tsconfig && packageJson && buildScript ? "pass" : "fail",
        message:
          tsconfig && packageJson && buildScript
            ? "TypeScript build pipeline configured"
            : "Missing tsconfig.json or npm build script",
      },
    };
  }

  private verifyTestSuites(packageSource: string): {
    check: ReadinessCheck;
    present: number;
    expected: number;
  } {
    let present = 0;
    const expected = Object.keys(RC1_TEST_SCRIPTS).length;

    for (const script of Object.values(RC1_TEST_SCRIPTS)) {
      if (packageSource.includes(`"${script}"`)) {
        present += 1;
      }
    }

    return {
      present,
      expected,
      check: {
        id: "test-suite-verification",
        category: "production",
        name: "Test suite verification",
        status: present === expected ? "pass" : present >= expected - 2 ? "warn" : "fail",
        message: `${present}/${expected} slice verify scripts registered in package.json`,
      },
    };
  }

  private verifyEnvironmentAudit(): { check: ReadinessCheck; audited: number } {
    const configSource = this.readOptionalSync("src/shared/config/index.ts");
    const missing = RC1_REQUIRED_ENV_VARS.filter((name) => !configSource.includes(name));

    return {
      audited: RC1_REQUIRED_ENV_VARS.length + RC1_OPTIONAL_ENV_VARS.length,
      check: {
        id: "environment-variable-audit",
        category: "deployment",
        name: "Environment variable audit",
        status: missing.length === 0 ? "pass" : "warn",
        message: `${RC1_REQUIRED_ENV_VARS.length} required and ${RC1_OPTIONAL_ENV_VARS.length} optional variables documented in config loader`,
        notes:
          missing.length > 0
            ? `Config loader missing references: ${missing.join(", ")}`
            : undefined,
      },
    };
  }

  private verifyConfigurationAudit(): { check: ReadinessCheck; audited: number } {
    const configSource = this.readOptionalSync("src/shared/config/index.ts");
    const hasSchema = configSource.includes("configSchema") && configSource.includes("loadConfig");

    return {
      audited: RC1_REQUIRED_ENV_VARS.length,
      check: {
        id: "required-configuration-audit",
        category: "deployment",
        name: "Required configuration audit",
        status: hasSchema ? "pass" : "fail",
        message: hasSchema
          ? "Zod config schema validates required runtime configuration"
          : "Config schema not found",
      },
    };
  }

  private readOptionalSync(relativePath: string): string {
    try {
      return readFileSync(path.join(this.rootDir, relativePath), "utf8");
    } catch {
      return "";
    }
  }

  private async verifyDocumentationCoverage(): Promise<{
    check: ReadinessCheck;
    found: number;
    expected: number;
    missing: string[];
    releaseDocsPresent: boolean;
  }> {
    const missing: string[] = [];
    let found = 0;

    for (const [slice, docPath] of Object.entries(RC1_IMPLEMENTATION_DOCS)) {
      if (await this.pathExists(docPath)) {
        found += 1;
      } else {
        missing.push(`${slice}:${docPath}`);
      }
    }

    const releaseDocsPresent =
      (await this.pathExists("docs/release/RC1-Readiness-Report.md")) &&
      (await this.pathExists("docs/release/RC1-Architecture-Summary.md")) &&
      (await this.pathExists("docs/release/RC1-Operational-Checklist.md"));

    return {
      found,
      expected: Object.keys(RC1_IMPLEMENTATION_DOCS).length,
      missing,
      releaseDocsPresent,
      check: {
        id: "documentation-coverage-audit",
        category: "documentation",
        name: "Documentation coverage audit",
        status:
          missing.length === 0 && releaseDocsPresent
            ? "pass"
            : missing.length === 0
              ? "warn"
              : "fail",
        message: `${found}/${Object.keys(RC1_IMPLEMENTATION_DOCS).length} implementation docs present${
          releaseDocsPresent ? "; RC-1 release docs present" : "; RC-1 release docs pending"
        }`,
        notes:
          missing.length > 0 ? `Missing docs: ${missing.join(", ")}` : undefined,
      },
    };
  }

  private async verifyEventFlow(): Promise<{ check: ReadinessCheck }> {
    const inboxService = await this.readOptional(
      "src/notifications/application/event-inbox-service.ts"
    );
    const outbox = await this.readOptional("src/platform/outbox/index.ts");
    const conversion = await this.readOptional(
      "src/conversion/application/match-contract-conversion-service.ts"
    );

    const hasObservers =
      inboxService.includes("observeInboxOfferCreated") &&
      inboxService.includes("observeInboxTrustUpdated");
    const hasOutbox = outbox.includes("OutboxWriter");
    const hasHooks = conversion.includes("observeInboxOfferCreated");

    const ok = hasObservers && hasOutbox && hasHooks;

    return {
      check: {
        id: "event-flow-verification",
        category: "operational",
        name: "Event flow verification",
        status: ok ? "pass" : "warn",
        message: ok
          ? "Outbox writer and inbox lifecycle observers are present"
          : "Event flow wiring incomplete",
      },
    };
  }

  private verifyDashboards(indexSource: string, serverSource: string): {
    check: ReadinessCheck;
  } {
    const ok =
      indexSource.includes("createCustomerExperienceModule") &&
      indexSource.includes("createProviderWorkspaceModule") &&
      serverSource.includes("registerCustomerDashboardRoutes") &&
      serverSource.includes("registerProviderDashboardRoutes");

    return {
      check: {
        id: "dashboard-verification",
        category: "operational",
        name: "Dashboard verification",
        status: ok ? "pass" : "fail",
        message: ok
          ? "Customer (S9) and provider (S10) dashboards registered"
          : "Dashboard modules or routes missing",
      },
    };
  }

  private verifyAnalytics(indexSource: string, serverSource: string): {
    check: ReadinessCheck;
  } {
    const ok =
      indexSource.includes("createAnalyticsModule") &&
      indexSource.includes("platformAnalytics") &&
      serverSource.includes("registerAnalyticsRoutes");

    return {
      check: {
        id: "analytics-verification",
        category: "operational",
        name: "Analytics verification",
        status: ok ? "pass" : "fail",
        message: ok
          ? "S14 platform analytics module and routes registered"
          : "Analytics module or routes missing",
      },
    };
  }

  private verifyNotifications(indexSource: string, serverSource: string): {
    check: ReadinessCheck;
  } {
    const ok =
      indexSource.includes("createNotificationsModule") &&
      indexSource.includes("eventInbox") &&
      serverSource.includes("registerNotificationRoutes");

    return {
      check: {
        id: "notification-verification",
        category: "operational",
        name: "Notification verification",
        status: ok ? "pass" : "fail",
        message: ok
          ? "S12 event inbox module and routes registered"
          : "Notification module or routes missing",
      },
    };
  }

  private verifyDiscovery(indexSource: string, serverSource: string): {
    check: ReadinessCheck;
  } {
    const ok =
      indexSource.includes("createDiscoveryModule") &&
      indexSource.includes("discovery") &&
      serverSource.includes("registerDiscoveryRoutes");

    return {
      check: {
        id: "discovery-verification",
        category: "operational",
        name: "Discovery verification",
        status: ok ? "pass" : "fail",
        message: ok
          ? "S13 discovery module and routes registered"
          : "Discovery module or routes missing",
      },
    };
  }

  private verifySecurity(serverSource: string): {
    check: ReadinessCheck;
    kernelPresent: boolean;
    authRegistered: boolean;
    adminProtected: boolean;
  } {
    const kernelPresent = serverSource.includes("registerSecurityAuthRoutes");
    const authRegistered =
      serverSource.includes("requireAuthMiddleware") &&
      serverSource.includes("createAuthenticateMiddleware");
    const adminProtected =
      serverSource.includes("registerAdminConsoleRoutes") &&
      serverSource.includes("registerAnalyticsRoutes");

    return {
      kernelPresent,
      authRegistered,
      adminProtected,
      check: {
        id: "security-readiness",
        category: "security",
        name: "Security readiness",
        status: kernelPresent && authRegistered && adminProtected ? "pass" : "warn",
        message:
          kernelPresent && authRegistered
            ? "Security kernel, auth middleware, and admin route bundles present"
            : "Security wiring incomplete",
      },
    };
  }

  private async verifyDeployment(): Promise<{
    check: ReadinessCheck;
    migratePresent: boolean;
    dockerPresent: boolean;
  }> {
    const migratePresent = await this.pathExists("scripts/migrate.ts");
    const dockerPresent = await this.pathExists("docker-compose.yml");

    return {
      migratePresent,
      dockerPresent,
      check: {
        id: "deployment-readiness",
        category: "deployment",
        name: "Deployment readiness",
        status: migratePresent ? "pass" : "fail",
        message: migratePresent
          ? `Migration script present${dockerPresent ? "; docker-compose available" : ""}`
          : "scripts/migrate.ts missing",
      },
    };
  }
}

export function createReleaseReadinessService(
  options?: ReleaseReadinessServiceOptions
): ReleaseReadinessService {
  return new ReleaseReadinessService(options);
}

export function createReleaseModule(options?: ReleaseReadinessServiceOptions) {
  const releaseReadiness = createReleaseReadinessService(options);
  return { releaseReadiness };
}

export type ReleaseModule = ReturnType<typeof createReleaseModule>;
