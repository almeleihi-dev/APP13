export type Rc1Status = "ready" | "ready_with_notes" | "blocked";

export type ReadinessCheckStatus = "pass" | "warn" | "fail";

export interface ReadinessCheck {
  id: string;
  category: string;
  name: string;
  status: ReadinessCheckStatus;
  message: string;
  notes?: string;
}

export interface ArchitectureSummary {
  moduleCount: number;
  routeBundleCount: number;
  registeredSlices: string[];
  missingSlices: string[];
  migrationCount: number;
  summary: string;
}

export interface ProductionReadinessSummary {
  buildConfigured: boolean;
  testSuitesPresent: number;
  testSuitesExpected: number;
  dependencyBoundaryConfigured: boolean;
  summary: string;
}

export interface OperationalReadinessSummary {
  dashboardsVerified: boolean;
  analyticsVerified: boolean;
  notificationsVerified: boolean;
  discoveryVerified: boolean;
  eventFlowVerified: boolean;
  summary: string;
}

export interface SecurityReadinessSummary {
  securityKernelPresent: boolean;
  authMiddlewareRegistered: boolean;
  adminRoutesProtected: boolean;
  summary: string;
}

export interface DeploymentReadinessSummary {
  migrateScriptPresent: boolean;
  dockerComposePresent: boolean;
  environmentVariablesAudited: number;
  requiredConfigurationAudited: number;
  summary: string;
}

export interface DocumentationReadinessSummary {
  implementationDocsFound: number;
  implementationDocsExpected: number;
  releaseDocsPresent: boolean;
  missingDocs: string[];
  summary: string;
}

export interface ReleaseReadinessReport {
  version: "RC-1";
  status: Rc1Status;
  readinessScore: number;
  generatedAt: Date;
  architecture: ArchitectureSummary;
  production: ProductionReadinessSummary;
  operational: OperationalReadinessSummary;
  security: SecurityReadinessSummary;
  deployment: DeploymentReadinessSummary;
  documentation: DocumentationReadinessSummary;
  checks: ReadinessCheck[];
  blockers: string[];
  notes: string[];
}

export interface ReleaseReadinessReportView {
  version: "RC-1";
  status: Rc1Status;
  readiness_score: number;
  generated_at: string;
  architecture: ArchitectureSummary;
  production: ProductionReadinessSummary;
  operational: OperationalReadinessSummary;
  security: SecurityReadinessSummary;
  deployment: DeploymentReadinessSummary;
  documentation: DocumentationReadinessSummary;
  checks: ReadinessCheck[];
  blockers: string[];
  notes: string[];
}

export const RC1_EXPECTED_SLICES = [
  "S3",
  "S4",
  "S5",
  "S6",
  "S7",
  "S8",
  "S9",
  "S10",
  "S11",
  "S12",
  "S13",
  "S14",
] as const;

export const RC1_MODULE_REGISTRATIONS: Record<
  string,
  { factory: string; bootstrapFile: string; dep?: string }
> = {
  S3: { factory: "createTrustModule", bootstrapFile: "src/index.ts" },
  S5: { factory: "createTrustModule", bootstrapFile: "src/index.ts" },
  S6: { factory: "createProviderExperienceModule", bootstrapFile: "src/index.ts" },
  S7: { factory: "createRequestExperienceModule", bootstrapFile: "src/index.ts" },
  S8: { factory: "createConversionModule", bootstrapFile: "src/index.ts" },
  S9: { factory: "createCustomerExperienceModule", bootstrapFile: "src/index.ts" },
  S10: { factory: "createProviderWorkspaceModule", bootstrapFile: "src/index.ts" },
  S11: { factory: "createOperationsModule", bootstrapFile: "src/index.ts" },
  S12: { factory: "createNotificationsModule", bootstrapFile: "src/index.ts" },
  S13: { factory: "createDiscoveryModule", bootstrapFile: "src/index.ts" },
  S14: { factory: "createAnalyticsModule", bootstrapFile: "src/index.ts" },
};

export const RC1_ROUTE_REGISTRATIONS: Record<
  string,
  { registrar: string; serverFile: string }
> = {
  S6: { registrar: "registerProviderRoutes", serverFile: "src/api/server.ts" },
  S7: { registrar: "registerRequestRoutes", serverFile: "src/api/server.ts" },
  S8: { registrar: "registerConversionRoutes", serverFile: "src/api/server.ts" },
  S9: { registrar: "registerCustomerDashboardRoutes", serverFile: "src/api/server.ts" },
  S10: { registrar: "registerProviderDashboardRoutes", serverFile: "src/api/server.ts" },
  S11: { registrar: "registerAdminConsoleRoutes", serverFile: "src/api/server.ts" },
  S12: { registrar: "registerNotificationRoutes", serverFile: "src/api/server.ts" },
  S13: { registrar: "registerDiscoveryRoutes", serverFile: "src/api/server.ts" },
  S14: { registrar: "registerAnalyticsRoutes", serverFile: "src/api/server.ts" },
};

export const RC1_IMPLEMENTATION_DOCS: Record<string, string> = {
  S3: "docs/implementation/S3-Foundation-Report.md",
  S4: "docs/implementation/S4-Marketplace-Experience-Report.md",
  S5: "docs/implementation/S5-Trust-Reputation.md",
  S6: "docs/implementation/S6-Provider-Public-Profile.md",
  S7: "docs/implementation/S7-Customer-Request-Experience.md",
  S8: "docs/implementation/S8-Match-to-Contract-Conversion.md",
  S9: "docs/implementation/S9-Customer-Order-Dashboard.md",
  S10: "docs/implementation/S10-Provider-Work-Dashboard.md",
  S11: "docs/implementation/S11-Operations-Admin-Console.md",
  S12: "docs/implementation/S12-Notification-Event-Inbox.md",
  S13: "docs/implementation/S13-Platform-Search-And-Discovery.md",
  S14: "docs/implementation/S14-Platform-Metrics-And-Analytics.md",
};

export const RC1_TEST_SCRIPTS: Record<string, string> = {
  S3: "verify:s3",
  S4: "verify:s4-marketplace",
  S5: "verify:s5",
  S6: "verify:s6",
  S7: "verify:s7",
  S8: "verify:s8",
  S9: "verify:s9",
  S10: "verify:s10",
  S11: "verify:s11",
  S12: "verify:s12",
  S13: "verify:s13",
  S14: "verify:s14",
};

export const RC1_REQUIRED_ENV_VARS = [
  "DATABASE_URL",
  "REDIS_URL",
  "JWT_SECRET",
] as const;

export const RC1_OPTIONAL_ENV_VARS = [
  "APP13_ENV",
  "APP13_SERVICE_ID",
  "APP13_HOST",
  "APP13_PORT",
  "APP13_LOG_LEVEL",
  "APP13_LOG_PRETTY",
  "S3_ENDPOINT",
  "S3_BUCKET",
  "S3_ACCESS_KEY",
  "S3_SECRET_KEY",
  "S3_REGION",
  "IDEMPOTENCY_TTL_SECONDS",
  "JWT_EXPIRES_IN",
  "JWT_ACCESS_TTL_SECONDS",
  "JWT_ISSUER",
  "SESSION_COOKIE_NAME",
  "SESSION_TTL_SECONDS",
  "REFRESH_EXPIRES_IN",
  "REFRESH_TTL_SECONDS",
  "KYC_WEBHOOK_SECRET",
  "KYC_SANDBOX_BASE_URL",
] as const;

const CHECK_WEIGHTS: Record<ReadinessCheckStatus, number> = {
  pass: 1,
  warn: 0.75,
  fail: 0,
};

const BLOCKING_CHECK_IDS = new Set([
  "module-registration",
  "route-registration",
  "migration-files",
  "build-config",
  "dependency-boundary",
]);

export function scoreChecks(checks: ReadinessCheck[]): number {
  if (checks.length === 0) return 0;
  const total = checks.reduce((sum, check) => sum + CHECK_WEIGHTS[check.status], 0);
  return Math.round((total / checks.length) * 100);
}

export function deriveRc1Status(checks: ReadinessCheck[]): Rc1Status {
  const hasBlockingFail = checks.some(
    (check) => check.status === "fail" && BLOCKING_CHECK_IDS.has(check.id)
  );
  if (hasBlockingFail) return "blocked";

  const hasFail = checks.some((check) => check.status === "fail");
  if (hasFail) return "ready_with_notes";

  const hasWarn = checks.some((check) => check.status === "warn");
  if (hasWarn) return "ready_with_notes";

  return "ready";
}

export function buildReleaseReadinessReport(input: {
  checks: ReadinessCheck[];
  architecture: ArchitectureSummary;
  production: ProductionReadinessSummary;
  operational: OperationalReadinessSummary;
  security: SecurityReadinessSummary;
  deployment: DeploymentReadinessSummary;
  documentation: DocumentationReadinessSummary;
  generatedAt?: Date;
}): ReleaseReadinessReport {
  const blockers = input.checks
    .filter((check) => check.status === "fail" && BLOCKING_CHECK_IDS.has(check.id))
    .map((check) => `${check.name}: ${check.message}`);

  const notes = input.checks
    .filter((check) => check.status === "warn" || (check.status === "fail" && check.notes))
    .map((check) => check.notes ?? `${check.name}: ${check.message}`);

  return {
    version: "RC-1",
    status: deriveRc1Status(input.checks),
    readinessScore: scoreChecks(input.checks),
    generatedAt: input.generatedAt ?? new Date(),
    architecture: input.architecture,
    production: input.production,
    operational: input.operational,
    security: input.security,
    deployment: input.deployment,
    documentation: input.documentation,
    checks: input.checks,
    blockers,
    notes,
  };
}

export function toReleaseReadinessReportView(
  report: ReleaseReadinessReport
): ReleaseReadinessReportView {
  return {
    version: report.version,
    status: report.status,
    readiness_score: report.readinessScore,
    generated_at: report.generatedAt.toISOString(),
    architecture: report.architecture,
    production: report.production,
    operational: report.operational,
    security: report.security,
    deployment: report.deployment,
    documentation: report.documentation,
    checks: report.checks,
    blockers: report.blockers,
    notes: report.notes,
  };
}

function statusEmoji(status: ReadinessCheckStatus): string {
  if (status === "pass") return "PASS";
  if (status === "warn") return "WARN";
  return "FAIL";
}

export function renderReadinessReportMarkdown(report: ReleaseReadinessReport): string {
  const lines = [
    "# APP13 RC-1 Readiness Report",
    "",
    `**Version:** ${report.version}`,
    `**Status:** ${report.status}`,
    `**Readiness score:** ${report.readinessScore}/100`,
    `**Generated:** ${report.generatedAt.toISOString()}`,
    "",
    "## Executive summary",
    "",
    report.architecture.summary,
    "",
    report.production.summary,
    "",
    report.operational.summary,
    "",
    "## Blockers",
    "",
  ];

  if (report.blockers.length === 0) {
    lines.push("- None");
  } else {
    for (const blocker of report.blockers) {
      lines.push(`- ${blocker}`);
    }
  }

  lines.push("", "## Notes", "");
  if (report.notes.length === 0) {
    lines.push("- None");
  } else {
    for (const note of report.notes) {
      lines.push(`- ${note}`);
    }
  }

  lines.push("", "## Check matrix", "", "| Check | Category | Status | Message |", "|---|---|---|---|");
  for (const check of report.checks) {
    lines.push(
      `| ${check.name} | ${check.category} | ${statusEmoji(check.status)} | ${check.message.replace(/\|/g, "\\|")} |`
    );
  }

  lines.push(
    "",
    "## Category summaries",
    "",
    "### Architecture",
    `- Registered slices: ${report.architecture.registeredSlices.join(", ") || "none"}`,
    `- Missing slices: ${report.architecture.missingSlices.join(", ") || "none"}`,
    `- Migrations: ${report.architecture.migrationCount}`,
    "",
    "### Production",
    `- ${report.production.summary}`,
    "",
    "### Operational",
    `- ${report.operational.summary}`,
    "",
    "### Security",
    `- ${report.security.summary}`,
    "",
    "### Deployment",
    `- ${report.deployment.summary}`,
    "",
    "### Documentation",
    `- ${report.documentation.summary}`,
    ""
  );

  return lines.join("\n");
}

export function renderArchitectureSummaryMarkdown(report: ReleaseReadinessReport): string {
  return [
    "# APP13 RC-1 Architecture Summary",
    "",
    `**Generated:** ${report.generatedAt.toISOString()}`,
    "",
    "## Marketplace Operating System slices",
    "",
    "APP13 RC-1 is a modular monolith spanning identity, contract, execution, financial, trust, and experience layers.",
    "",
    "### Registered experience modules (S3–S14)",
    "",
    ...report.architecture.registeredSlices.map((slice) => `- ${slice}`),
    "",
    ...(report.architecture.missingSlices.length > 0
      ? [
          "### Missing registrations",
          "",
          ...report.architecture.missingSlices.map((slice) => `- ${slice}`),
          "",
        ]
      : []),
    "## Bootstrap wiring",
    "",
    "- Application bootstrap: `src/index.ts`",
    "- HTTP server composition: `src/api/server.ts`",
    "- Database migrations: `database/migrations/`",
    "",
    "## Layer map",
    "",
    "| Layer | Modules |",
    "|---|---|",
    "| Trust & reputation | S3, S5 (`createTrustModule`) |",
    "| Provider & request experience | S6, S7 |",
    "| Conversion & contracts | S4, S8 |",
    "| Dashboards | S9 customer, S10 provider |",
    "| Operations & analytics | S11 admin console, S14 analytics |",
    "| Notifications & discovery | S12 event inbox, S13 discovery |",
    "",
    "## Dependency boundaries",
    "",
    report.production.dependencyBoundaryConfigured
      ? "Dependency-cruiser configuration is present (`.dependency-cruiser.cjs`)."
      : "Dependency-cruiser configuration is missing.",
    "",
    report.architecture.summary,
    "",
  ].join("\n");
}

export function renderOperationalChecklistMarkdown(report: ReleaseReadinessReport): string {
  const checklist = report.checks.map(
    (check) => `- [${check.status === "pass" ? "x" : " "}] **${check.name}** — ${check.message}`
  );

  return [
    "# APP13 RC-1 Operational Checklist",
    "",
    `**RC-1 status:** ${report.status}`,
    `**Readiness score:** ${report.readinessScore}/100`,
    `**Generated:** ${report.generatedAt.toISOString()}`,
    "",
    "## Pre-release verification",
    "",
    ...checklist,
    "",
    "## Environment configuration",
    "",
    "### Required variables",
    "",
    ...RC1_REQUIRED_ENV_VARS.map((name) => `- \`${name}\``),
    "",
    "### Optional variables (defaults in `src/shared/config/index.ts`)",
    "",
    ...RC1_OPTIONAL_ENV_VARS.slice(0, 12).map((name) => `- \`${name}\``),
    "- ...",
    "",
    "## Release commands",
    "",
    "```bash",
    "npm run migrate",
    "npm run verify:rc1",
    "npm run report:rc1",
    "```",
    "",
    "## Operational surfaces",
    "",
    `- Dashboards verified: ${report.operational.dashboardsVerified ? "yes" : "no"}`,
    `- Analytics verified: ${report.operational.analyticsVerified ? "yes" : "no"}`,
    `- Notifications verified: ${report.operational.notificationsVerified ? "yes" : "no"}`,
    `- Discovery verified: ${report.operational.discoveryVerified ? "yes" : "no"}`,
    `- Event flow verified: ${report.operational.eventFlowVerified ? "yes" : "no"}`,
    "",
    report.operational.summary,
    "",
  ].join("\n");
}
