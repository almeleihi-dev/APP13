export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type SecurityRiskLevel = "critical" | "high" | "medium" | "low";
export type RecommendationHorizon = "immediate" | "short_term" | "medium_term" | "long_term";

export interface SecurityReadinessSources {
  serverSource: string;
  indexSource: string;
  packageSource: string;
  envExampleSource: string;
  configSource: string;
  guardsSource: string;
  requireAuthSource: string;
  authenticateSource: string;
  loggingSource: string;
  s3StorageSource: string;
  routeSources: Record<string, string>;
  documentationSources: Record<string, string>;
  serviceSources: Record<string, string>;
  existingPaths: Set<string>;
  runtimeEnvKeys: Set<string>;
}

export interface SecurityReadinessRawSnapshot {
  sources: SecurityReadinessSources;
}

export interface ParsedSecurityRoute {
  method: HttpMethod;
  path: string;
  authRequired: boolean;
  sourceFile: string;
}

export interface SecurityOverview {
  headline: string;
  securityScore: number;
  authenticationScore: number;
  authorizationScore: number;
  apiSecurityScore: number;
  dataProtectionScore: number;
  complianceScore: number;
  riskCount: number;
  summary: string;
}

export interface AuthenticationAudit {
  jwtCoverage: number;
  authMiddlewareCoverage: number;
  protectedRouteCount: number;
  unprotectedRouteCount: number;
  adminProtectionCoverage: number;
  summary: string;
}

export interface RoleEnforcementStat {
  role: string;
  enforcementCount: number;
}

export interface AuthorizationAudit {
  platformAdmin: RoleEnforcementStat;
  customer: RoleEnforcementStat;
  provider: RoleEnforcementStat;
  system: RoleEnforcementStat;
  roleEnforcementStatistics: RoleEnforcementStat[];
  summary: string;
}

export interface SecretsAudit {
  envKeyCoverage: number;
  requiredKeys: string[];
  missingKeys: string[];
  hardcodedSecretIndicators: string[];
  summary: string;
}

export interface ApiSecurityAudit {
  publicRoutes: string[];
  authenticatedRoutes: string[];
  adminRoutes: string[];
  missingProtectionRisks: string[];
  summary: string;
}

export interface DataProtectionAudit {
  sensitiveFieldExposureIndicators: string[];
  storageProtectionIndicators: string[];
  piiProtectionIndicators: string[];
  riskAssessment: string;
  summary: string;
}

export interface AuditabilityReview {
  loggingReadiness: number;
  eventTrackingReadiness: number;
  auditReadiness: number;
  summary: string;
}

export interface ComplianceReadiness {
  privacyReadiness: number;
  consentReadiness: number;
  contractReadiness: number;
  evidenceReadiness: number;
  termsReadiness: number;
  summary: string;
}

export interface SecurityRisk {
  severity: SecurityRiskLevel;
  category: string;
  message: string;
  mitigation: string;
}

export interface SecurityRiskRegister {
  critical: SecurityRisk[];
  high: SecurityRisk[];
  medium: SecurityRisk[];
  low: SecurityRisk[];
  summary: string;
}

export interface SecurityRecommendation {
  horizon: RecommendationHorizon;
  title: string;
  reason: string;
  action: string;
}

export interface SecurityRecommendations {
  immediate: SecurityRecommendation[];
  shortTerm: SecurityRecommendation[];
  mediumTerm: SecurityRecommendation[];
  longTerm: SecurityRecommendation[];
  summary: string;
}

export interface SecurityReadinessScore {
  securityReadinessScore: number;
  authenticationWeight: number;
  authorizationWeight: number;
  apiSecurityWeight: number;
  secretsManagementWeight: number;
  dataProtectionWeight: number;
  auditabilityWeight: number;
  complianceWeight: number;
  summary: string;
}

export interface SecurityReadinessSnapshot {
  overview: SecurityOverview;
  authentication: AuthenticationAudit;
  authorization: AuthorizationAudit;
  secrets: SecretsAudit;
  apiSecurity: ApiSecurityAudit;
  dataProtection: DataProtectionAudit;
  auditability: AuditabilityReview;
  compliance: ComplianceReadiness;
  riskRegister: SecurityRiskRegister;
  recommendations: SecurityRecommendations;
  readinessScore: SecurityReadinessScore;
  generatedAt: Date;
}

export interface SecurityReadinessCenter {
  overview: SecurityOverview;
  authentication: AuthenticationAudit;
  authorization: AuthorizationAudit;
  secrets: SecretsAudit;
  apiSecurity: ApiSecurityAudit;
  dataProtection: DataProtectionAudit;
  auditability: AuditabilityReview;
  compliance: ComplianceReadiness;
  riskRegister: SecurityRiskRegister;
  recommendations: SecurityRecommendations;
  readinessScore: SecurityReadinessScore;
  generatedAt: Date;
}

export const SECURITY_READINESS_ROUTES = [
  "/security-readiness",
  "/security-readiness/overview",
  "/security-readiness/authentication",
  "/security-readiness/authorization",
  "/security-readiness/secrets",
  "/security-readiness/api",
  "/security-readiness/data-protection",
  "/security-readiness/auditability",
  "/security-readiness/compliance",
  "/security-readiness/risks",
  "/security-readiness/recommendations",
];

export const PUBLIC_ROUTE_PREFIXES = ["/health", "/v1/auth"];

export const ADMIN_ROUTE_PREFIXES = [
  "/admin",
  "/analytics",
  "/platform-control-tower",
  "/marketplace-intelligence",
  "/release-readiness",
  "/executive-command-center",
  "/launch-simulation",
  "/investor-readiness",
  "/government-partnership",
  "/strategic-operating-system",
  "/mission-control",
  "/executive-experience",
  "/architecture-review",
  "/api-audit",
  "/production-readiness",
  "/security-readiness",
];

export const SENSITIVE_ROUTE_PREFIXES = [
  "/contracts",
  "/escrow",
  "/evidence",
  "/issues",
  "/internal",
  "/admin",
  "/analytics",
];

export const REQUIRED_SECRET_KEYS = [
  "JWT_SECRET",
  "S3_SECRET_KEY",
  "KYC_WEBHOOK_SECRET",
  "DATABASE_URL",
  "REDIS_URL",
];

export const SECURITY_ARTIFACT_PATHS = [
  ".env.example",
  "package.json",
  "src/index.ts",
  "src/api/server.ts",
  "src/shared/config/index.ts",
  "src/security/guards.ts",
  "src/api/middleware/require-auth.ts",
  "src/api/middleware/authenticate.ts",
  "src/shared/logging/index.ts",
  "src/platform/storage/s3-storage.ts",
  "database/migrations/006_audit.sql",
  "database/migrations/015_security_kernel.sql",
  "database/migrations/020_event_inbox.sql",
  "docs/experience/X26-Security-Compliance-Readiness.md",
  "src/api/routes/security-readiness.ts",
  "src/experience/security-readiness/module.ts",
  "test/x26-security-readiness.test.ts",
  "scripts/verify-x26.sh",
];

const ROUTE_METHOD_PATTERN =
  /app\.(get|post|put|patch|delete)\(\s*(?:\n\s*)?(?:\/\*[\s\S]*?\*\/\s*)?(?:\{[\s\S]*?\}\s*,\s*)?"([^"]+)"/g;

const HARDCODED_SECRET_PATTERNS = [
  /(?:secret|password|api[_-]?key)\s*[:=]\s*["'][^"'\n]{8,}["']/gi,
  /Bearer\s+[A-Za-z0-9._-]{20,}/g,
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function parseEnvExampleKeys(source: string): string[] {
  return source
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
    .map((line) => line.split("=")[0]?.trim() ?? "")
    .filter(Boolean);
}

function inferAuthRequired(routeBlock: string, path: string): boolean {
  const explicitFalse = /authRequired:\s*false/.test(routeBlock);
  const explicitTrue = /authRequired:\s*true/.test(routeBlock);
  if (explicitTrue) return true;
  if (explicitFalse) return false;
  return !PUBLIC_ROUTE_PREFIXES.some((prefix) => path.startsWith(prefix));
}

export function buildParsedSecurityRoutes(sources: SecurityReadinessSources): ParsedSecurityRoute[] {
  const routes: ParsedSecurityRoute[] = [];

  for (const [sourceFile, content] of Object.entries(sources.routeSources)) {
    for (const match of content.matchAll(ROUTE_METHOD_PATTERN)) {
      const method = match[1].toUpperCase() as HttpMethod;
      const path = match[2];
      const routeBlock = content.slice(
        Math.max(0, match.index ?? 0),
        Math.min(content.length, (match.index ?? 0) + 250)
      );

      routes.push({
        method,
        path,
        authRequired: inferAuthRequired(routeBlock, path),
        sourceFile,
      });
    }
  }

  return routes;
}

function countRoleEnforcement(sources: SecurityReadinessSources, role: string): number {
  const corpus = [
    sources.guardsSource,
    ...Object.values(sources.serviceSources),
  ].join("\n");
  const pattern = new RegExp(`requireRole\\([^,]+,\\s*"${role}"`, "g");
  return [...corpus.matchAll(pattern)].length;
}

function countSystemEnforcement(sources: SecurityReadinessSources): number {
  const corpus = [sources.serverSource, sources.requireAuthSource, ...Object.values(sources.routeSources)].join(
    "\n"
  );
  const serviceAuthCount = [...corpus.matchAll(/serviceAuth:\s*true/g)].length;
  const internalRouteCount = [...corpus.matchAll(/"\/internal/g)].length;
  return serviceAuthCount + internalRouteCount;
}

export function buildAuthenticationAudit(input: {
  sources: SecurityReadinessSources;
  routes: ParsedSecurityRoute[];
}): AuthenticationAudit {
  const jwtSignals = [
    input.sources.configSource.includes("jwt:"),
    input.sources.configSource.includes("JWT_SECRET"),
    input.sources.authenticateSource.includes("jwt"),
    input.sources.serverSource.includes("createAuthenticateMiddleware"),
  ];
  const middlewareSignals = [
    input.sources.serverSource.includes("requireAuthMiddleware"),
    input.sources.requireAuthSource.includes("authRequired"),
    input.sources.serverSource.includes("createAuthenticateMiddleware"),
  ];

  const jwtCoverage = clamp(Math.round((jwtSignals.filter(Boolean).length / jwtSignals.length) * 100), 0, 100);
  const authMiddlewareCoverage = clamp(
    Math.round((middlewareSignals.filter(Boolean).length / middlewareSignals.length) * 100),
    0,
    100
  );

  const protectedRouteCount = input.routes.filter((route) => route.authRequired).length;
  const unprotectedRouteCount = input.routes.filter((route) => !route.authRequired).length;
  const adminRoutes = input.routes.filter((route) =>
    ADMIN_ROUTE_PREFIXES.some((prefix) => route.path.startsWith(prefix))
  );
  const protectedAdminRoutes = adminRoutes.filter((route) => route.authRequired).length;
  const adminProtectionCoverage = clamp(
    Math.round((protectedAdminRoutes / Math.max(1, adminRoutes.length)) * 100),
    0,
    100
  );

  return {
    jwtCoverage,
    authMiddlewareCoverage,
    protectedRouteCount,
    unprotectedRouteCount,
    adminProtectionCoverage,
    summary: `Authentication audit covers JWT (${jwtCoverage}%), middleware (${authMiddlewareCoverage}%), ${protectedRouteCount} protected routes, and ${adminProtectionCoverage}% admin protection.`,
  };
}

export function buildAuthorizationAudit(sources: SecurityReadinessSources): AuthorizationAudit {
  const platformAdmin: RoleEnforcementStat = {
    role: "platform_admin",
    enforcementCount: countRoleEnforcement(sources, "platform_admin"),
  };
  const customer: RoleEnforcementStat = {
    role: "customer",
    enforcementCount: countRoleEnforcement(sources, "customer"),
  };
  const provider: RoleEnforcementStat = {
    role: "provider",
    enforcementCount: countRoleEnforcement(sources, "provider"),
  };
  const system: RoleEnforcementStat = {
    role: "system",
    enforcementCount: countSystemEnforcement(sources),
  };

  return {
    platformAdmin,
    customer,
    provider,
    system,
    roleEnforcementStatistics: [platformAdmin, customer, provider, system],
    summary: `Authorization audit tracked role enforcement for platform_admin (${platformAdmin.enforcementCount}), customer (${customer.enforcementCount}), provider (${provider.enforcementCount}), and system (${system.enforcementCount}).`,
  };
}

export function buildSecretsAudit(sources: SecurityReadinessSources): SecretsAudit {
  const documentedKeys = new Set(parseEnvExampleKeys(sources.envExampleSource));
  const missingKeys = REQUIRED_SECRET_KEYS.filter(
    (key) => !documentedKeys.has(key) || !sources.runtimeEnvKeys.has(key)
  );
  const envKeyCoverage = clamp(
    Math.round(
      ((REQUIRED_SECRET_KEYS.length - missingKeys.length) / Math.max(1, REQUIRED_SECRET_KEYS.length)) * 100
    ),
    0,
    100
  );

  const scanCorpus = [
    sources.indexSource,
    sources.serverSource,
    sources.configSource,
    ...Object.values(sources.routeSources),
  ].join("\n");

  const hardcodedSecretIndicators: string[] = [];
  for (const pattern of HARDCODED_SECRET_PATTERNS) {
    for (const match of scanCorpus.matchAll(pattern)) {
      const indicator = match[0].split("=")[0]?.split(":")[0]?.trim() ?? "secret_pattern";
      if (!hardcodedSecretIndicators.includes(indicator)) {
        hardcodedSecretIndicators.push(indicator);
      }
    }
  }

  return {
    envKeyCoverage,
    requiredKeys: [...REQUIRED_SECRET_KEYS],
    missingKeys,
    hardcodedSecretIndicators,
    summary: `Secrets audit reports ${envKeyCoverage}% env key coverage with ${missingKeys.length} missing keys and ${hardcodedSecretIndicators.length} hardcoded secret indicators.`,
  };
}

export function buildApiSecurityAudit(routes: ParsedSecurityRoute[]): ApiSecurityAudit {
  const publicRoutes = routes
    .filter((route) => !route.authRequired)
    .map((route) => `${route.method} ${route.path}`);
  const authenticatedRoutes = routes
    .filter((route) => route.authRequired)
    .map((route) => `${route.method} ${route.path}`);
  const adminRoutes = routes
    .filter((route) => ADMIN_ROUTE_PREFIXES.some((prefix) => route.path.startsWith(prefix)))
    .map((route) => `${route.method} ${route.path}`);
  const missingProtectionRisks = routes
    .filter(
      (route) =>
        !route.authRequired &&
        SENSITIVE_ROUTE_PREFIXES.some((prefix) => route.path.startsWith(prefix))
    )
    .map((route) => `${route.method} ${route.path}`);

  return {
    publicRoutes,
    authenticatedRoutes,
    adminRoutes,
    missingProtectionRisks,
    summary: `API security audit identified ${publicRoutes.length} public routes, ${authenticatedRoutes.length} authenticated routes, ${adminRoutes.length} admin routes, and ${missingProtectionRisks.length} missing protection risks.`,
  };
}

export function buildDataProtectionAudit(sources: SecurityReadinessSources): DataProtectionAudit {
  const sensitiveFieldExposureIndicators: string[] = [];
  if (sources.configSource.includes("password_hash")) {
    sensitiveFieldExposureIndicators.push("password_hash referenced in configuration layer");
  }
  for (const [file, content] of Object.entries(sources.routeSources)) {
    if (/password_hash|raw_password|secret_key/i.test(content) && !file.includes("auth")) {
      sensitiveFieldExposureIndicators.push(`${file} references sensitive credential fields`);
    }
  }

  const storageProtectionIndicators: string[] = [];
  if (sources.s3StorageSource.includes("createPresignedPut")) {
    storageProtectionIndicators.push("presigned upload URLs enforced");
  }
  if (sources.s3StorageSource.includes("HeadObjectCommand")) {
    storageProtectionIndicators.push("object existence checks before access");
  }
  if (sources.existingPaths.has("database/migrations/010_upload_intents.sql")) {
    storageProtectionIndicators.push("upload intent migration present");
  }

  const piiProtectionIndicators: string[] = [];
  if (sources.guardsSource.includes("requireOwnership")) {
    piiProtectionIndicators.push("ownership checks protect user-scoped resources");
  }
  if (sources.serverSource.includes("requireAuthMiddleware")) {
    piiProtectionIndicators.push("authenticated access enforced by default on protected routes");
  }
  if (sources.existingPaths.has("database/migrations/015_security_kernel.sql")) {
    piiProtectionIndicators.push("security kernel migration present");
  }

  let riskAssessment = "low";
  if (sensitiveFieldExposureIndicators.length > 2) {
    riskAssessment = "high";
  } else if (sensitiveFieldExposureIndicators.length > 0 || storageProtectionIndicators.length < 2) {
    riskAssessment = "medium";
  }

  return {
    sensitiveFieldExposureIndicators,
    storageProtectionIndicators,
    piiProtectionIndicators,
    riskAssessment,
    summary: `Data protection audit assessed ${riskAssessment} risk with ${storageProtectionIndicators.length} storage and ${piiProtectionIndicators.length} PII protection indicators.`,
  };
}

export function buildAuditabilityReview(sources: SecurityReadinessSources): AuditabilityReview {
  const loggingReadiness = clamp(
    Math.round(
      ((sources.loggingSource.includes("createLogger") ? 1 : 0) +
        (sources.indexSource.includes("createLogger") ? 1 : 0) +
        (sources.serverSource.includes("logger") ? 1 : 0)) *
        (100 / 3)
    ),
    0,
    100
  );
  const eventTrackingReadiness = clamp(
    Math.round(
      ((sources.existingPaths.has("database/migrations/020_event_inbox.sql") ? 1 : 0) +
        (sources.indexSource.includes("eventInbox") ? 1 : 0) +
        (sources.serverSource.includes("registerNotificationRoutes") ? 1 : 0)) *
        (100 / 3)
    ),
    0,
    100
  );
  const auditReadiness = clamp(
    Math.round(
      ((sources.existingPaths.has("database/migrations/006_audit.sql") ? 1 : 0) +
        (sources.indexSource.includes("securityAudit") ? 1 : 0) +
        (sources.serverSource.includes("securityAudit") ? 1 : 0)) *
        (100 / 3)
    ),
    0,
    100
  );

  return {
    loggingReadiness,
    eventTrackingReadiness,
    auditReadiness,
    summary: `Auditability review scored logging ${loggingReadiness}, event tracking ${eventTrackingReadiness}, and audit readiness ${auditReadiness}.`,
  };
}

export function buildComplianceReadiness(sources: SecurityReadinessSources): ComplianceReadiness {
  const documentationCorpus = Object.values(sources.documentationSources).join("\n");
  const privacyReadiness = clamp(
    Math.round(
      ((documentationCorpus.includes("privacy") || documentationCorpus.includes("PII") ? 1 : 0) +
        (sources.existingPaths.has("database/migrations/015_security_kernel.sql") ? 1 : 0) +
        (sources.guardsSource.includes("requireOwnership") ? 1 : 0)) *
        (100 / 3)
    ),
    0,
    100
  );
  const consentReadiness = clamp(
    Math.round(
      ((sources.existingPaths.has("database/migrations/001_initial_schema.sql") ? 1 : 0) +
        (documentationCorpus.includes("consent") ? 1 : 0) +
        (sources.configSource.includes("verification") ? 1 : 0)) *
        (100 / 3)
    ),
    0,
    100
  );
  const contractReadiness = clamp(
    Math.round(
      ((sources.existingPaths.has("database/migrations/001_initial_schema.sql") ? 1 : 0) +
        (sources.routeSources["src/api/routes/contracts.ts"]?.includes("authRequired: true") ? 1 : 0) +
        (sources.existingPaths.has("database/migrations/013_financial_escrow.sql") ? 1 : 0)) *
        (100 / 3)
    ),
    0,
    100
  );
  const evidenceReadiness = clamp(
    Math.round(
      ((sources.existingPaths.has("database/migrations/010_upload_intents.sql") ? 1 : 0) +
        (sources.routeSources["src/api/routes/evidence.ts"] ? 1 : 0) +
        (sources.s3StorageSource.includes("createPresignedPut") ? 1 : 0)) *
        (100 / 3)
    ),
    0,
    100
  );
  const termsReadiness = clamp(
    Math.round(
      ((documentationCorpus.includes("terms") || documentationCorpus.includes("contract") ? 1 : 0) +
        (sources.routeSources["src/api/routes/contracts.ts"] ? 1 : 0) +
        (sources.existingPaths.has("database/migrations/007_schema_v1_1_p0.sql") ? 1 : 0)) *
        (100 / 3)
    ),
    0,
    100
  );

  return {
    privacyReadiness,
    consentReadiness,
    contractReadiness,
    evidenceReadiness,
    termsReadiness,
    summary: `Compliance readiness evaluated privacy, consent, contract, evidence, and terms readiness indicators.`,
  };
}

function scoreAuthentication(authentication: AuthenticationAudit): number {
  return clamp(
    Math.round(
      authentication.jwtCoverage * 0.35 +
        authentication.authMiddlewareCoverage * 0.35 +
        authentication.adminProtectionCoverage * 0.3
    ),
    0,
    100
  );
}

function scoreAuthorization(authorization: AuthorizationAudit): number {
  const total =
    authorization.platformAdmin.enforcementCount +
    authorization.customer.enforcementCount +
    authorization.provider.enforcementCount +
    authorization.system.enforcementCount;
  if (total === 0) return 0;
  const balanced =
    authorization.platformAdmin.enforcementCount > 0 &&
    authorization.system.enforcementCount > 0;
  return clamp(Math.round((balanced ? 85 : 65) + Math.min(15, total)), 0, 100);
}

function scoreApiSecurity(apiSecurity: ApiSecurityAudit, routes: ParsedSecurityRoute[]): number {
  const protectedRatio = routes.filter((route) => route.authRequired).length / Math.max(1, routes.length);
  const penalty = apiSecurity.missingProtectionRisks.length * 5;
  return clamp(Math.round(protectedRatio * 100 - penalty), 0, 100);
}

function scoreSecrets(secrets: SecretsAudit): number {
  const penalty = secrets.hardcodedSecretIndicators.length * 10;
  return clamp(secrets.envKeyCoverage - penalty, 0, 100);
}

function scoreDataProtection(dataProtection: DataProtectionAudit): number {
  const base =
    dataProtection.storageProtectionIndicators.length * 25 +
    dataProtection.piiProtectionIndicators.length * 20;
  const penalty = dataProtection.sensitiveFieldExposureIndicators.length * 15;
  if (dataProtection.riskAssessment === "high") return clamp(base - penalty - 20, 0, 100);
  if (dataProtection.riskAssessment === "medium") return clamp(base - penalty - 10, 0, 100);
  return clamp(base - penalty, 0, 100);
}

function scoreAuditability(auditability: AuditabilityReview): number {
  return clamp(
    Math.round(
      auditability.loggingReadiness * 0.35 +
        auditability.eventTrackingReadiness * 0.3 +
        auditability.auditReadiness * 0.35
    ),
    0,
    100
  );
}

function scoreCompliance(compliance: ComplianceReadiness): number {
  return clamp(
    Math.round(
      (compliance.privacyReadiness +
        compliance.consentReadiness +
        compliance.contractReadiness +
        compliance.evidenceReadiness +
        compliance.termsReadiness) /
        5
    ),
    0,
    100
  );
}

export function buildSecurityRiskRegister(input: {
  authentication: AuthenticationAudit;
  secrets: SecretsAudit;
  apiSecurity: ApiSecurityAudit;
  dataProtection: DataProtectionAudit;
  auditability: AuditabilityReview;
  compliance: ComplianceReadiness;
}): SecurityRiskRegister {
  const critical: SecurityRisk[] = [];
  const high: SecurityRisk[] = [];
  const medium: SecurityRisk[] = [];
  const low: SecurityRisk[] = [];

  if (input.secrets.missingKeys.length > 0) {
    critical.push({
      severity: "critical",
      category: "secrets",
      message: `${input.secrets.missingKeys.length} required secret keys are missing from documentation or runtime.`,
      mitigation: "Configure and document all required secret keys without exposing values.",
    });
  }

  for (const route of input.apiSecurity.missingProtectionRisks.slice(0, 10)) {
    critical.push({
      severity: "critical",
      category: "api_security",
      message: `Missing auth protection on ${route}.`,
      mitigation: "Set authRequired: true and enforce role checks on sensitive routes.",
    });
  }

  if (input.authentication.jwtCoverage < 100) {
    high.push({
      severity: "high",
      category: "authentication",
      message: "JWT authentication coverage is incomplete.",
      mitigation: "Ensure JWT configuration and authenticate middleware are fully wired.",
    });
  }

  if (input.authentication.adminProtectionCoverage < 100) {
    high.push({
      severity: "high",
      category: "authorization",
      message: "Admin route protection coverage is below 100%.",
      mitigation: "Protect all admin and executive routes with authRequired and platform_admin checks.",
    });
  }

  if (input.secrets.hardcodedSecretIndicators.length > 0) {
    high.push({
      severity: "high",
      category: "secrets",
      message: `${input.secrets.hardcodedSecretIndicators.length} hardcoded secret indicators detected in source scans.`,
      mitigation: "Move secrets to environment configuration and rotate exposed credentials.",
    });
  }

  if (input.dataProtection.riskAssessment === "medium" || input.dataProtection.riskAssessment === "high") {
    medium.push({
      severity: "medium",
      category: "data_protection",
      message: `Data protection risk assessed as ${input.dataProtection.riskAssessment}.`,
      mitigation: "Review sensitive field handling, storage controls, and PII access patterns.",
    });
  }

  if (input.auditability.auditReadiness < 75) {
    medium.push({
      severity: "medium",
      category: "auditability",
      message: "Audit logging readiness requires improvement.",
      mitigation: "Ensure audit migrations, security audit service, and event tracking are production ready.",
    });
  }

  if (input.compliance.privacyReadiness < 75) {
    low.push({
      severity: "low",
      category: "compliance",
      message: "Privacy compliance documentation can be expanded.",
      mitigation: "Document privacy controls and consent handling in compliance artifacts.",
    });
  }

  return {
    critical,
    high,
    medium,
    low,
    summary: `Security risk register tracks ${critical.length} critical, ${high.length} high, ${medium.length} medium, and ${low.length} low risks.`,
  };
}

export function buildSecurityRecommendations(input: {
  riskRegister: SecurityRiskRegister;
  authentication: AuthenticationAudit;
  secrets: SecretsAudit;
  compliance: ComplianceReadiness;
}): SecurityRecommendations {
  const immediate = [...input.riskRegister.critical, ...input.riskRegister.high.slice(0, 3)].map(
    (risk) => ({
      horizon: "immediate" as const,
      title: risk.message,
      reason: risk.category,
      action: risk.mitigation,
    })
  );

  const shortTerm: SecurityRecommendation[] = [];
  if (input.authentication.adminProtectionCoverage < 100) {
    shortTerm.push({
      horizon: "short_term",
      title: "Close admin route protection gaps",
      reason: "authentication audit",
      action: "Audit admin routes and enforce authRequired plus platform_admin role checks.",
    });
  }
  if (input.secrets.missingKeys.length > 0) {
    shortTerm.push({
      horizon: "short_term",
      title: "Resolve missing secret key coverage",
      reason: "secrets audit",
      action: "Inject and document required secret keys in secure runtime configuration.",
    });
  }

  const mediumTerm = input.riskRegister.medium.slice(0, 3).map((risk) => ({
    horizon: "medium_term" as const,
    title: risk.message,
    reason: risk.category,
    action: risk.mitigation,
  }));

  const longTerm = [
    {
      horizon: "long_term" as const,
      title: "Expand compliance documentation and controls",
      reason: "compliance readiness",
      action: "Maintain privacy, consent, contract, evidence, and terms readiness as platform scales.",
    },
  ];
  if (input.compliance.evidenceReadiness >= 66) {
    longTerm.unshift({
      horizon: "long_term",
      title: "Maintain evidence and contract compliance posture",
      reason: "compliance strength",
      action: "Continue enforcing evidence retention and contract compliance checks in production.",
    });
  }

  return {
    immediate,
    shortTerm,
    mediumTerm,
    longTerm,
    summary: `Security recommendations grouped ${immediate.length} immediate, ${shortTerm.length} short term, ${mediumTerm.length} medium term, and ${longTerm.length} long term actions.`,
  };
}

export function computeSecurityReadinessScore(input: {
  authentication: AuthenticationAudit;
  authorization: AuthorizationAudit;
  apiSecurity: ApiSecurityAudit;
  secrets: SecretsAudit;
  dataProtection: DataProtectionAudit;
  auditability: AuditabilityReview;
  compliance: ComplianceReadiness;
  routes: ParsedSecurityRoute[];
}): SecurityReadinessScore {
  const authenticationWeight = 15;
  const authorizationWeight = 15;
  const apiSecurityWeight = 15;
  const secretsManagementWeight = 15;
  const dataProtectionWeight = 15;
  const auditabilityWeight = 10;
  const complianceWeight = 15;

  const authenticationScore = scoreAuthentication(input.authentication);
  const authorizationScore = scoreAuthorization(input.authorization);
  const apiSecurityScore = scoreApiSecurity(input.apiSecurity, input.routes);
  const secretsScore = scoreSecrets(input.secrets);
  const dataProtectionScore = scoreDataProtection(input.dataProtection);
  const auditabilityScore = scoreAuditability(input.auditability);
  const complianceScore = scoreCompliance(input.compliance);

  const securityReadinessScore = clamp(
    Math.round(
      authenticationScore * (authenticationWeight / 100) +
        authorizationScore * (authorizationWeight / 100) +
        apiSecurityScore * (apiSecurityWeight / 100) +
        secretsScore * (secretsManagementWeight / 100) +
        dataProtectionScore * (dataProtectionWeight / 100) +
        auditabilityScore * (auditabilityWeight / 100) +
        complianceScore * (complianceWeight / 100)
    ),
    0,
    100
  );

  return {
    securityReadinessScore,
    authenticationWeight,
    authorizationWeight,
    apiSecurityWeight,
    secretsManagementWeight,
    dataProtectionWeight,
    auditabilityWeight,
    complianceWeight,
    summary: `Security readiness score ${securityReadinessScore} weighted across authentication, authorization, API security, secrets, data protection, auditability, and compliance.`,
  };
}

export function buildSecurityOverview(input: {
  readinessScore: SecurityReadinessScore;
  authentication: AuthenticationAudit;
  authorization: AuthorizationAudit;
  apiSecurity: ApiSecurityAudit;
  dataProtection: DataProtectionAudit;
  compliance: ComplianceReadiness;
  riskRegister: SecurityRiskRegister;
  routes: ParsedSecurityRoute[];
}): SecurityOverview {
  return {
    headline: "APP13 security and compliance readiness center",
    securityScore: input.readinessScore.securityReadinessScore,
    authenticationScore: scoreAuthentication(input.authentication),
    authorizationScore: scoreAuthorization(input.authorization),
    apiSecurityScore: scoreApiSecurity(input.apiSecurity, input.routes),
    dataProtectionScore: scoreDataProtection(input.dataProtection),
    complianceScore: scoreCompliance(input.compliance),
    riskCount:
      input.riskRegister.critical.length +
      input.riskRegister.high.length +
      input.riskRegister.medium.length +
      input.riskRegister.low.length,
    summary: `Security overview: score ${input.readinessScore.securityReadinessScore} with ${input.riskRegister.critical.length + input.riskRegister.high.length} high-priority risks.`,
  };
}

export function buildSecurityReadinessSnapshot(input: {
  raw: SecurityReadinessRawSnapshot;
  generatedAt?: Date;
}): SecurityReadinessSnapshot {
  const generatedAt = input.generatedAt ?? new Date();
  const sources = input.raw.sources;
  const routes = buildParsedSecurityRoutes(sources);
  const authentication = buildAuthenticationAudit({ sources, routes });
  const authorization = buildAuthorizationAudit(sources);
  const secrets = buildSecretsAudit(sources);
  const apiSecurity = buildApiSecurityAudit(routes);
  const dataProtection = buildDataProtectionAudit(sources);
  const auditability = buildAuditabilityReview(sources);
  const compliance = buildComplianceReadiness(sources);
  const riskRegister = buildSecurityRiskRegister({
    authentication,
    secrets,
    apiSecurity,
    dataProtection,
    auditability,
    compliance,
  });
  const recommendations = buildSecurityRecommendations({
    riskRegister,
    authentication,
    secrets,
    compliance,
  });
  const readinessScore = computeSecurityReadinessScore({
    authentication,
    authorization,
    apiSecurity,
    secrets,
    dataProtection,
    auditability,
    compliance,
    routes,
  });
  const overview = buildSecurityOverview({
    readinessScore,
    authentication,
    authorization,
    apiSecurity,
    dataProtection,
    compliance,
    riskRegister,
    routes,
  });

  return {
    overview,
    authentication,
    authorization,
    secrets,
    apiSecurity,
    dataProtection,
    auditability,
    compliance,
    riskRegister,
    recommendations,
    readinessScore,
    generatedAt,
  };
}

export function buildSecurityReadinessCenter(input: {
  snapshot: SecurityReadinessSnapshot;
}): SecurityReadinessCenter {
  return {
    overview: input.snapshot.overview,
    authentication: input.snapshot.authentication,
    authorization: input.snapshot.authorization,
    secrets: input.snapshot.secrets,
    apiSecurity: input.snapshot.apiSecurity,
    dataProtection: input.snapshot.dataProtection,
    auditability: input.snapshot.auditability,
    compliance: input.snapshot.compliance,
    riskRegister: input.snapshot.riskRegister,
    recommendations: input.snapshot.recommendations,
    readinessScore: input.snapshot.readinessScore,
    generatedAt: input.snapshot.generatedAt,
  };
}

export function collectSecurityReadinessPaths(): string[] {
  return SECURITY_ARTIFACT_PATHS;
}

export interface SecurityOverviewView {
  headline: string;
  security_score: number;
  authentication_score: number;
  authorization_score: number;
  api_security_score: number;
  data_protection_score: number;
  compliance_score: number;
  risk_count: number;
  summary: string;
}

export interface AuthenticationAuditView {
  jwt_coverage: number;
  auth_middleware_coverage: number;
  protected_route_count: number;
  unprotected_route_count: number;
  admin_protection_coverage: number;
  summary: string;
}

export interface RoleEnforcementStatView {
  role: string;
  enforcement_count: number;
}

export interface AuthorizationAuditView {
  platform_admin: RoleEnforcementStatView;
  customer: RoleEnforcementStatView;
  provider: RoleEnforcementStatView;
  system: RoleEnforcementStatView;
  role_enforcement_statistics: RoleEnforcementStatView[];
  summary: string;
}

export interface SecretsAuditView {
  env_key_coverage: number;
  required_keys: string[];
  missing_keys: string[];
  hardcoded_secret_indicators: string[];
  summary: string;
}

export interface ApiSecurityAuditView {
  public_routes: string[];
  authenticated_routes: string[];
  admin_routes: string[];
  missing_protection_risks: string[];
  summary: string;
}

export interface DataProtectionAuditView {
  sensitive_field_exposure_indicators: string[];
  storage_protection_indicators: string[];
  pii_protection_indicators: string[];
  risk_assessment: string;
  summary: string;
}

export interface AuditabilityReviewView {
  logging_readiness: number;
  event_tracking_readiness: number;
  audit_readiness: number;
  summary: string;
}

export interface ComplianceReadinessView {
  privacy_readiness: number;
  consent_readiness: number;
  contract_readiness: number;
  evidence_readiness: number;
  terms_readiness: number;
  summary: string;
}

export interface SecurityRiskView {
  severity: SecurityRiskLevel;
  category: string;
  message: string;
  mitigation: string;
}

export interface SecurityRiskRegisterView {
  critical: SecurityRiskView[];
  high: SecurityRiskView[];
  medium: SecurityRiskView[];
  low: SecurityRiskView[];
  summary: string;
}

export interface SecurityRecommendationView {
  horizon: RecommendationHorizon;
  title: string;
  reason: string;
  action: string;
}

export interface SecurityRecommendationsView {
  immediate: SecurityRecommendationView[];
  short_term: SecurityRecommendationView[];
  medium_term: SecurityRecommendationView[];
  long_term: SecurityRecommendationView[];
  summary: string;
}

export interface SecurityReadinessScoreView {
  security_readiness_score: number;
  authentication_weight: number;
  authorization_weight: number;
  api_security_weight: number;
  secrets_management_weight: number;
  data_protection_weight: number;
  auditability_weight: number;
  compliance_weight: number;
  summary: string;
}

export interface SecurityReadinessCenterView {
  overview: SecurityOverviewView;
  authentication: AuthenticationAuditView;
  authorization: AuthorizationAuditView;
  secrets: SecretsAuditView;
  api_security: ApiSecurityAuditView;
  data_protection: DataProtectionAuditView;
  auditability: AuditabilityReviewView;
  compliance: ComplianceReadinessView;
  risk_register: SecurityRiskRegisterView;
  recommendations: SecurityRecommendationsView;
  readiness_score: SecurityReadinessScoreView;
  generated_at: string;
}

function toRoleEnforcementStatView(stat: RoleEnforcementStat): RoleEnforcementStatView {
  return {
    role: stat.role,
    enforcement_count: stat.enforcementCount,
  };
}

export function toSecurityOverviewView(overview: SecurityOverview): SecurityOverviewView {
  return {
    headline: overview.headline,
    security_score: overview.securityScore,
    authentication_score: overview.authenticationScore,
    authorization_score: overview.authorizationScore,
    api_security_score: overview.apiSecurityScore,
    data_protection_score: overview.dataProtectionScore,
    compliance_score: overview.complianceScore,
    risk_count: overview.riskCount,
    summary: overview.summary,
  };
}

export function toAuthenticationAuditView(audit: AuthenticationAudit): AuthenticationAuditView {
  return {
    jwt_coverage: audit.jwtCoverage,
    auth_middleware_coverage: audit.authMiddlewareCoverage,
    protected_route_count: audit.protectedRouteCount,
    unprotected_route_count: audit.unprotectedRouteCount,
    admin_protection_coverage: audit.adminProtectionCoverage,
    summary: audit.summary,
  };
}

export function toAuthorizationAuditView(audit: AuthorizationAudit): AuthorizationAuditView {
  return {
    platform_admin: toRoleEnforcementStatView(audit.platformAdmin),
    customer: toRoleEnforcementStatView(audit.customer),
    provider: toRoleEnforcementStatView(audit.provider),
    system: toRoleEnforcementStatView(audit.system),
    role_enforcement_statistics: audit.roleEnforcementStatistics.map(toRoleEnforcementStatView),
    summary: audit.summary,
  };
}

export function toSecretsAuditView(audit: SecretsAudit): SecretsAuditView {
  return {
    env_key_coverage: audit.envKeyCoverage,
    required_keys: audit.requiredKeys,
    missing_keys: audit.missingKeys,
    hardcoded_secret_indicators: audit.hardcodedSecretIndicators,
    summary: audit.summary,
  };
}

export function toApiSecurityAuditView(audit: ApiSecurityAudit): ApiSecurityAuditView {
  return {
    public_routes: audit.publicRoutes,
    authenticated_routes: audit.authenticatedRoutes,
    admin_routes: audit.adminRoutes,
    missing_protection_risks: audit.missingProtectionRisks,
    summary: audit.summary,
  };
}

export function toDataProtectionAuditView(audit: DataProtectionAudit): DataProtectionAuditView {
  return {
    sensitive_field_exposure_indicators: audit.sensitiveFieldExposureIndicators,
    storage_protection_indicators: audit.storageProtectionIndicators,
    pii_protection_indicators: audit.piiProtectionIndicators,
    risk_assessment: audit.riskAssessment,
    summary: audit.summary,
  };
}

export function toAuditabilityReviewView(review: AuditabilityReview): AuditabilityReviewView {
  return {
    logging_readiness: review.loggingReadiness,
    event_tracking_readiness: review.eventTrackingReadiness,
    audit_readiness: review.auditReadiness,
    summary: review.summary,
  };
}

export function toComplianceReadinessView(readiness: ComplianceReadiness): ComplianceReadinessView {
  return {
    privacy_readiness: readiness.privacyReadiness,
    consent_readiness: readiness.consentReadiness,
    contract_readiness: readiness.contractReadiness,
    evidence_readiness: readiness.evidenceReadiness,
    terms_readiness: readiness.termsReadiness,
    summary: readiness.summary,
  };
}

export function toSecurityRiskView(risk: SecurityRisk): SecurityRiskView {
  return {
    severity: risk.severity,
    category: risk.category,
    message: risk.message,
    mitigation: risk.mitigation,
  };
}

export function toSecurityRiskRegisterView(register: SecurityRiskRegister): SecurityRiskRegisterView {
  return {
    critical: register.critical.map(toSecurityRiskView),
    high: register.high.map(toSecurityRiskView),
    medium: register.medium.map(toSecurityRiskView),
    low: register.low.map(toSecurityRiskView),
    summary: register.summary,
  };
}

export function toSecurityRecommendationView(
  recommendation: SecurityRecommendation
): SecurityRecommendationView {
  return {
    horizon: recommendation.horizon,
    title: recommendation.title,
    reason: recommendation.reason,
    action: recommendation.action,
  };
}

export function toSecurityRecommendationsView(
  recommendations: SecurityRecommendations
): SecurityRecommendationsView {
  return {
    immediate: recommendations.immediate.map(toSecurityRecommendationView),
    short_term: recommendations.shortTerm.map(toSecurityRecommendationView),
    medium_term: recommendations.mediumTerm.map(toSecurityRecommendationView),
    long_term: recommendations.longTerm.map(toSecurityRecommendationView),
    summary: recommendations.summary,
  };
}

export function toSecurityReadinessScoreView(
  score: SecurityReadinessScore
): SecurityReadinessScoreView {
  return {
    security_readiness_score: score.securityReadinessScore,
    authentication_weight: score.authenticationWeight,
    authorization_weight: score.authorizationWeight,
    api_security_weight: score.apiSecurityWeight,
    secrets_management_weight: score.secretsManagementWeight,
    data_protection_weight: score.dataProtectionWeight,
    auditability_weight: score.auditabilityWeight,
    compliance_weight: score.complianceWeight,
    summary: score.summary,
  };
}

export function toSecurityReadinessCenterView(
  center: SecurityReadinessCenter
): SecurityReadinessCenterView {
  return {
    overview: toSecurityOverviewView(center.overview),
    authentication: toAuthenticationAuditView(center.authentication),
    authorization: toAuthorizationAuditView(center.authorization),
    secrets: toSecretsAuditView(center.secrets),
    api_security: toApiSecurityAuditView(center.apiSecurity),
    data_protection: toDataProtectionAuditView(center.dataProtection),
    auditability: toAuditabilityReviewView(center.auditability),
    compliance: toComplianceReadinessView(center.compliance),
    risk_register: toSecurityRiskRegisterView(center.riskRegister),
    recommendations: toSecurityRecommendationsView(center.recommendations),
    readiness_score: toSecurityReadinessScoreView(center.readinessScore),
    generated_at: center.generatedAt.toISOString(),
  };
}
