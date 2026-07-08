export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiAuditSources {
  serverSource: string;
  packageSource: string;
  routeSources: Record<string, string>;
  documentationSources: Record<string, string>;
  existingPaths: Set<string>;
}

export interface ApiAuditRawSnapshot {
  sources: ApiAuditSources;
}

export interface ParsedRoute {
  method: HttpMethod;
  path: string;
  authRequired: boolean;
  sourceFile: string;
  registerFunction: string;
  registeredInServer: boolean;
}

export type ApiProductionStatus = "production_ready" | "developing" | "attention_required";
export type ApiSurfaceStatus = "surface_ready" | "developing" | "attention_required";
export type RecommendationHorizon = "immediate" | "next_phase" | "production";

export interface ApiOverview {
  headline: string;
  apiScore: number;
  routeCount: number;
  endpointCount: number;
  registeredModules: number;
  documentationCoverage: number;
  productionReadiness: string;
  summary: string;
}

export interface RouteRegistryAudit {
  registeredRoutes: string[];
  missingRoutes: string[];
  duplicateRoutes: string[];
  routeConsistencyScore: number;
  summary: string;
}

export interface EndpointCoverageAudit {
  getCount: number;
  postCount: number;
  putCount: number;
  patchCount: number;
  deleteCount: number;
  totalEndpoints: number;
  coverageScore: number;
  summary: string;
}

export interface AuthenticationAudit {
  protectedRoutes: string[];
  publicRoutes: string[];
  roleProtectedRoutes: string[];
  missingProtectionWarnings: string[];
  summary: string;
}

export interface ApiDocumentationAudit {
  documentedEndpoints: string[];
  undocumentedEndpoints: string[];
  coverageScore: number;
  summary: string;
}

export interface ModuleExposureEntry {
  module: string;
  registerFunction: string;
  exposedRoutes: number;
  hiddenRoutes: number;
  registered: boolean;
}

export interface ModuleExposureAudit {
  moduleCount: number;
  entries: ModuleExposureEntry[];
  consistencyScore: number;
  summary: string;
}

export interface ApiProductionReadiness {
  readinessScore: number;
  blockers: string[];
  warnings: string[];
  strengths: string[];
  summary: string;
}

export interface ApiRisk {
  category: "route" | "auth" | "exposure" | "documentation";
  severity: "critical" | "high" | "medium" | "low";
  message: string;
  mitigation: string;
}

export interface ApiRiskRegister {
  risks: ApiRisk[];
  summary: string;
}

export interface ApiRecommendation {
  horizon: RecommendationHorizon;
  title: string;
  reason: string;
  action: string;
}

export interface ApiRecommendations {
  immediate: ApiRecommendation[];
  nextPhase: ApiRecommendation[];
  production: ApiRecommendation[];
  summary: string;
}

export interface ApiSurfaceScore {
  score: number;
  status: ApiSurfaceStatus;
  routeCoverageWeight: number;
  endpointCoverageWeight: number;
  authCoverageWeight: number;
  documentationCoverageWeight: number;
  readinessWeight: number;
  summary: string;
}

export interface ApiAuditSnapshot {
  overview: ApiOverview;
  routeRegistry: RouteRegistryAudit;
  endpointCoverage: EndpointCoverageAudit;
  authentication: AuthenticationAudit;
  documentation: ApiDocumentationAudit;
  moduleExposure: ModuleExposureAudit;
  productionReadiness: ApiProductionReadiness;
  riskRegister: ApiRiskRegister;
  recommendations: ApiRecommendations;
  surfaceScore: ApiSurfaceScore;
  generatedAt: Date;
}

export interface ApiAuditCenter {
  overview: ApiOverview;
  routeRegistry: RouteRegistryAudit;
  endpointCoverage: EndpointCoverageAudit;
  authentication: AuthenticationAudit;
  documentation: ApiDocumentationAudit;
  moduleExposure: ModuleExposureAudit;
  productionReadiness: ApiProductionReadiness;
  riskRegister: ApiRiskRegister;
  recommendations: ApiRecommendations;
  surfaceScore: ApiSurfaceScore;
  generatedAt: Date;
}

export const API_AUDIT_ROUTES = [
  "/api-audit",
  "/api-audit/overview",
  "/api-audit/routes",
  "/api-audit/endpoints",
  "/api-audit/auth",
  "/api-audit/documentation",
  "/api-audit/modules",
  "/api-audit/readiness",
  "/api-audit/risks",
  "/api-audit/recommendations",
];

export const PUBLIC_ROUTE_PREFIXES = ["/health", "/v1/auth"];

export const SENSITIVE_ROUTE_PREFIXES = [
  "/contracts",
  "/escrow",
  "/admin",
  "/internal",
  "/evidence",
  "/issues",
  "/analytics",
  "/platform-control-tower",
];

export const ROLE_PROTECTED_PREFIXES = [
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
];

const ROUTE_METHOD_PATTERN =
  /app\.(get|post|put|patch|delete)\(\s*(?:\n\s*)?(?:\/\*[\s\S]*?\*\/\s*)?(?:\{[\s\S]*?\}\s*,\s*)?"([^"]+)"/g;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function registerFunctionFromFile(routeFile: string): string {
  const base = routeFile.replace("src/api/routes/", "").replace(".ts", "");
  const camel = base
    .split(/[-/]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  return `register${camel}Routes`;
}

function extractRegisteredFunctions(serverSource: string): string[] {
  const matches = serverSource.matchAll(/await (register\w+Routes)\(/g);
  return [...matches].map((match) => match[1]);
}

function routeFileFromRegisterFunction(registerFunction: string): string {
  const core = registerFunction.replace(/^register/, "").replace(/Routes$/, "");
  const kebab = core.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  if (registerFunction === "registerInternalContractRoutes") {
    return "src/api/routes/internal/contracts.ts";
  }
  if (registerFunction === "registerContractActionRoutes") {
    return "src/api/routes/actions.ts";
  }
  if (registerFunction === "registerTrustReputationRoutes") {
    return "src/api/routes/trust.ts";
  }
  if (registerFunction === "registerTrustExperienceRoutes") {
    return "src/api/routes/trust.ts";
  }
  if (registerFunction === "registerEscrowExperienceRoutes") {
    return "src/api/routes/escrow.ts";
  }
  if (registerFunction === "registerExecutionExperienceRoutes") {
    return "src/api/routes/execution.ts";
  }
  if (registerFunction === "registerPlatformExperienceRoutes") {
    return "src/api/routes/platform.ts";
  }
  if (registerFunction === "registerStrategicOperatingRoutes") {
    return "src/api/routes/strategic-operating-system.ts";
  }
  return `src/api/routes/${kebab}.ts`;
}

function inferAuthRequired(routeBlock: string, path: string): boolean {
  const explicitFalse = /authRequired:\s*false/.test(routeBlock);
  const explicitTrue = /authRequired:\s*true/.test(routeBlock);
  if (explicitTrue) return true;
  if (explicitFalse) return false;
  return !PUBLIC_ROUTE_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function parseRoutesFromSource(input: {
  sourceFile: string;
  content: string;
  registeredFunctions: Set<string>;
}): ParsedRoute[] {
  const registerFunction =
    [...input.content.matchAll(/export async function (register\w+Routes)/g)][0]?.[1] ??
    registerFunctionFromFile(input.sourceFile);
  const routes: ParsedRoute[] = [];

  for (const match of input.content.matchAll(ROUTE_METHOD_PATTERN)) {
    const method = match[1].toUpperCase() as HttpMethod;
    const path = match[2];
    const routeBlock = input.content.slice(
      Math.max(0, match.index ?? 0),
      Math.min(input.content.length, (match.index ?? 0) + 250)
    );

    routes.push({
      method,
      path,
      authRequired: inferAuthRequired(routeBlock, path),
      sourceFile: input.sourceFile,
      registerFunction,
      registeredInServer: input.registeredFunctions.has(registerFunction),
    });
  }

  return routes;
}

export function buildParsedRouteRegistry(sources: ApiAuditSources): ParsedRoute[] {
  const registeredFunctions = new Set(extractRegisteredFunctions(sources.serverSource));
  const routes: ParsedRoute[] = [];

  for (const [sourceFile, content] of Object.entries(sources.routeSources)) {
    routes.push(
      ...parseRoutesFromSource({
        sourceFile,
        content,
        registeredFunctions,
      })
    );
  }

  return routes;
}

export function buildRouteRegistryAudit(
  routes: ParsedRoute[],
  sources: ApiAuditSources
): RouteRegistryAudit {
  const registeredRoutes = routes
    .filter((route) => route.registeredInServer)
    .map((route) => `${route.method} ${route.path}`);

  const duplicateRoutes = registeredRoutes.filter(
    (entry, index) => registeredRoutes.indexOf(entry) !== index
  );

  const missingRoutes: string[] = [];
  for (const expected of API_AUDIT_ROUTES) {
    const routeSource = sources.routeSources["src/api/routes/api-audit.ts"] ?? "";
    if (!routeSource.includes(expected)) {
      missingRoutes.push(`GET ${expected}`);
    }
  }

  for (const registerFunction of extractRegisteredFunctions(sources.serverSource)) {
    const routeFile = routeFileFromRegisterFunction(registerFunction);
    if (!sources.existingPaths.has(routeFile)) {
      missingRoutes.push(`${registerFunction} -> ${routeFile}`);
    }
  }

  const uniqueRegistered = [...new Set(registeredRoutes)];
  const routeConsistencyScore = clamp(
    Math.round(
      ((uniqueRegistered.length - duplicateRoutes.length) /
        Math.max(1, uniqueRegistered.length + missingRoutes.length)) *
        100
    ),
    0,
    100
  );

  return {
    registeredRoutes: uniqueRegistered,
    missingRoutes,
    duplicateRoutes: [...new Set(duplicateRoutes)],
    routeConsistencyScore,
    summary: `Route registry audit registered ${uniqueRegistered.length} routes with consistency score ${routeConsistencyScore}.`,
  };
}

export function buildEndpointCoverageAudit(routes: ParsedRoute[]): EndpointCoverageAudit {
  const getCount = routes.filter((route) => route.method === "GET").length;
  const postCount = routes.filter((route) => route.method === "POST").length;
  const putCount = routes.filter((route) => route.method === "PUT").length;
  const patchCount = routes.filter((route) => route.method === "PATCH").length;
  const deleteCount = routes.filter((route) => route.method === "DELETE").length;
  const totalEndpoints = routes.length;
  const methodVariety = [getCount, postCount, putCount, patchCount, deleteCount].filter(
    (count) => count > 0
  ).length;
  const coverageScore = clamp(Math.round((methodVariety / 5) * 100), 0, 100);

  return {
    getCount,
    postCount,
    putCount,
    patchCount,
    deleteCount,
    totalEndpoints,
    coverageScore,
    summary: `Endpoint coverage audit tracked ${totalEndpoints} endpoints across ${methodVariety} HTTP methods.`,
  };
}

export function buildAuthenticationAudit(routes: ParsedRoute[]): AuthenticationAudit {
  const protectedRoutes = routes
    .filter((route) => route.authRequired)
    .map((route) => `${route.method} ${route.path}`);
  const publicRoutes = routes
    .filter((route) => !route.authRequired)
    .map((route) => `${route.method} ${route.path}`);
  const roleProtectedRoutes = routes
    .filter(
      (route) =>
        route.authRequired &&
        ROLE_PROTECTED_PREFIXES.some((prefix) => route.path.startsWith(prefix))
    )
    .map((route) => `${route.method} ${route.path}`);
  const missingProtectionWarnings = routes
    .filter(
      (route) =>
        !route.authRequired &&
        SENSITIVE_ROUTE_PREFIXES.some((prefix) => route.path.startsWith(prefix))
    )
    .map((route) => `${route.method} ${route.path}`);

  return {
    protectedRoutes,
    publicRoutes,
    roleProtectedRoutes,
    missingProtectionWarnings,
    summary: `Authentication audit identified ${protectedRoutes.length} protected routes, ${publicRoutes.length} public routes, and ${missingProtectionWarnings.length} missing protection warnings.`,
  };
}

export function buildApiDocumentationAudit(input: {
  routes: ParsedRoute[];
  sources: ApiAuditSources;
}): ApiDocumentationAudit {
  const documentationCorpus = Object.values(input.sources.documentationSources).join("\n");
  const documentedEndpoints: string[] = [];
  const undocumentedEndpoints: string[] = [];

  for (const route of input.routes) {
    const endpoint = `${route.method} ${route.path}`;
    if (documentationCorpus.includes(route.path) || route.path.startsWith("/health")) {
      documentedEndpoints.push(endpoint);
    } else {
      undocumentedEndpoints.push(endpoint);
    }
  }

  const coverageScore = clamp(
    Math.round((documentedEndpoints.length / Math.max(1, input.routes.length)) * 100),
    0,
    100
  );

  return {
    documentedEndpoints,
    undocumentedEndpoints,
    coverageScore,
    summary: `API documentation audit covers ${documentedEndpoints.length}/${input.routes.length} endpoints with ${coverageScore}% coverage.`,
  };
}

export function buildModuleExposureAudit(input: {
  routes: ParsedRoute[];
  sources: ApiAuditSources;
}): ModuleExposureAudit {
  const registeredFunctions = extractRegisteredFunctions(input.sources.serverSource);
  const entries: ModuleExposureEntry[] = registeredFunctions.map((registerFunction) => {
    const moduleRoutes = input.routes.filter((route) => route.registerFunction === registerFunction);
    const exposedRoutes = moduleRoutes.filter((route) => route.registeredInServer).length;
    const hiddenRoutes = moduleRoutes.filter((route) => !route.registeredInServer).length;
    return {
      module: registerFunction.replace(/^register/, "").replace(/Routes$/, ""),
      registerFunction,
      exposedRoutes,
      hiddenRoutes,
      registered: exposedRoutes > 0,
    };
  });

  const consistencyScore = clamp(
    Math.round(
      (entries.filter((entry) => entry.registered && entry.hiddenRoutes === 0).length /
        Math.max(1, entries.length)) *
        100
    ),
    0,
    100
  );

  return {
    moduleCount: entries.length,
    entries,
    consistencyScore,
    summary: `Module exposure audit reviewed ${entries.length} route modules with consistency score ${consistencyScore}.`,
  };
}

export function buildApiProductionReadiness(input: {
  routeRegistry: RouteRegistryAudit;
  authentication: AuthenticationAudit;
  documentation: ApiDocumentationAudit;
  moduleExposure: ModuleExposureAudit;
}): ApiProductionReadiness {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const strengths: string[] = [];

  if (input.routeRegistry.duplicateRoutes.length > 0) {
    blockers.push(`${input.routeRegistry.duplicateRoutes.length} duplicate routes detected.`);
  }
  if (input.authentication.missingProtectionWarnings.length > 0) {
    blockers.push(
      `${input.authentication.missingProtectionWarnings.length} sensitive routes missing auth protection.`
    );
  }
  if (input.routeRegistry.missingRoutes.length > 0) {
    warnings.push(`${input.routeRegistry.missingRoutes.length} expected routes or modules missing.`);
  }
  if (input.documentation.coverageScore < 75) {
    warnings.push(`Documentation coverage at ${input.documentation.coverageScore}%.`);
  }
  if (input.moduleExposure.consistencyScore >= 90) {
    strengths.push(`Module exposure consistency at ${input.moduleExposure.consistencyScore}%.`);
  }
  if (input.authentication.protectedRoutes.length > 0) {
    strengths.push(`${input.authentication.protectedRoutes.length} protected routes enforced.`);
  }
  if (input.routeRegistry.registeredRoutes.length > 100) {
    strengths.push(`${input.routeRegistry.registeredRoutes.length} registered API routes.`);
  }

  const readinessScore = clamp(
    100 -
      blockers.length * 20 -
      warnings.length * 10 +
      strengths.length * 5,
    0,
    100
  );

  return {
    readinessScore,
    blockers,
    warnings,
    strengths,
    summary: `Production readiness score ${readinessScore} with ${blockers.length} blockers and ${warnings.length} warnings.`,
  };
}

export function buildApiRiskRegister(input: {
  routeRegistry: RouteRegistryAudit;
  authentication: AuthenticationAudit;
  moduleExposure: ModuleExposureAudit;
  documentation: ApiDocumentationAudit;
}): ApiRiskRegister {
  const risks: ApiRisk[] = [];

  for (const duplicate of input.routeRegistry.duplicateRoutes) {
    risks.push({
      category: "route",
      severity: "high",
      message: `Duplicate route registration: ${duplicate}.`,
      mitigation: "Remove duplicate route handlers across modules.",
    });
  }

  for (const warning of input.authentication.missingProtectionWarnings.slice(0, 10)) {
    risks.push({
      category: "auth",
      severity: "critical",
      message: `Missing auth protection on ${warning}.`,
      mitigation: "Set authRequired: true and enforce role checks where needed.",
    });
  }

  for (const entry of input.moduleExposure.entries.filter((item) => item.hiddenRoutes > 0)) {
    risks.push({
      category: "exposure",
      severity: "medium",
      message: `${entry.registerFunction} exposes ${entry.hiddenRoutes} hidden routes.`,
      mitigation: "Register hidden routes in server.ts or remove unused handlers.",
    });
  }

  if (input.documentation.undocumentedEndpoints.length > 0) {
    risks.push({
      category: "documentation",
      severity: "low",
      message: `${input.documentation.undocumentedEndpoints.length} endpoints lack documentation references.`,
      mitigation: "Document endpoints in experience docs and API references.",
    });
  }

  return {
    risks,
    summary: `API risk register tracks ${risks.length} route, auth, exposure, and documentation risks.`,
  };
}

export function buildApiRecommendations(input: {
  risks: ApiRiskRegister;
  productionReadiness: ApiProductionReadiness;
}): ApiRecommendations {
  const immediate = input.risks.risks
    .filter((risk) => risk.severity === "critical" || risk.severity === "high")
    .slice(0, 5)
    .map((risk) => ({
      horizon: "immediate" as const,
      title: risk.message,
      reason: risk.category,
      action: risk.mitigation,
    }));

  const nextPhase = input.productionReadiness.warnings.slice(0, 5).map((warning) => ({
    horizon: "next_phase" as const,
    title: warning,
    reason: "production readiness warning",
    action: "Resolve warning before expanding API surface.",
  }));

  const production = input.productionReadiness.strengths.slice(0, 3).map((strength) => ({
    horizon: "production" as const,
    title: strength,
    reason: "production strength",
    action: "Maintain and monitor in production operations.",
  }));

  return {
    immediate,
    nextPhase,
    production,
    summary: `API recommendations grouped ${immediate.length} immediate, ${nextPhase.length} next phase, and ${production.length} production actions.`,
  };
}

export function computeApiSurfaceScore(input: {
  routeRegistry: RouteRegistryAudit;
  endpointCoverage: EndpointCoverageAudit;
  authentication: AuthenticationAudit;
  documentation: ApiDocumentationAudit;
  productionReadiness: ApiProductionReadiness;
}): ApiSurfaceScore {
  const routeCoverageWeight = 20;
  const endpointCoverageWeight = 20;
  const authCoverageWeight = 20;
  const documentationCoverageWeight = 20;
  const readinessWeight = 20;

  const authCoverageScore = clamp(
    Math.round(
      (input.authentication.protectedRoutes.length /
        Math.max(1, input.authentication.protectedRoutes.length + input.authentication.missingProtectionWarnings.length)) *
        100
    ),
    0,
    100
  );

  const score = Math.round(
    input.routeRegistry.routeConsistencyScore * (routeCoverageWeight / 100) +
      input.endpointCoverage.coverageScore * (endpointCoverageWeight / 100) +
      authCoverageScore * (authCoverageWeight / 100) +
      input.documentation.coverageScore * (documentationCoverageWeight / 100) +
      input.productionReadiness.readinessScore * (readinessWeight / 100)
  );

  let status: ApiSurfaceStatus = "attention_required";
  if (score >= 75) status = "surface_ready";
  else if (score >= 55) status = "developing";

  return {
    score,
    status,
    routeCoverageWeight,
    endpointCoverageWeight,
    authCoverageWeight,
    documentationCoverageWeight,
    readinessWeight,
    summary: `API surface score ${score} (${status.replace("_", " ")}) across route, endpoint, auth, documentation, and readiness dimensions.`,
  };
}

export function buildApiOverview(input: {
  surfaceScore: ApiSurfaceScore;
  routeRegistry: RouteRegistryAudit;
  endpointCoverage: EndpointCoverageAudit;
  moduleExposure: ModuleExposureAudit;
  documentation: ApiDocumentationAudit;
  productionReadiness: ApiProductionReadiness;
}): ApiOverview {
  let productionReadiness = "attention_required";
  if (input.productionReadiness.readinessScore >= 75) productionReadiness = "production_ready";
  else if (input.productionReadiness.readinessScore >= 55) productionReadiness = "developing";

  return {
    headline: "APP13 API surface audit center",
    apiScore: input.surfaceScore.score,
    routeCount: input.routeRegistry.registeredRoutes.length,
    endpointCount: input.endpointCoverage.totalEndpoints,
    registeredModules: input.moduleExposure.moduleCount,
    documentationCoverage: input.documentation.coverageScore,
    productionReadiness,
    summary: `API overview: score ${input.surfaceScore.score}, ${input.routeRegistry.registeredRoutes.length} routes, ${input.moduleExposure.moduleCount} modules, documentation ${input.documentation.coverageScore}%.`,
  };
}

export function buildApiAuditSnapshot(input: {
  raw: ApiAuditRawSnapshot;
  generatedAt?: Date;
}): ApiAuditSnapshot {
  const generatedAt = input.generatedAt ?? new Date();
  const routes = buildParsedRouteRegistry(input.raw.sources);
  const routeRegistry = buildRouteRegistryAudit(routes, input.raw.sources);
  const endpointCoverage = buildEndpointCoverageAudit(routes);
  const authentication = buildAuthenticationAudit(routes);
  const documentation = buildApiDocumentationAudit({ routes, sources: input.raw.sources });
  const moduleExposure = buildModuleExposureAudit({ routes, sources: input.raw.sources });
  const productionReadiness = buildApiProductionReadiness({
    routeRegistry,
    authentication,
    documentation,
    moduleExposure,
  });
  const riskRegister = buildApiRiskRegister({
    routeRegistry,
    authentication,
    moduleExposure,
    documentation,
  });
  const recommendations = buildApiRecommendations({ risks: riskRegister, productionReadiness });
  const surfaceScore = computeApiSurfaceScore({
    routeRegistry,
    endpointCoverage,
    authentication,
    documentation,
    productionReadiness,
  });
  const overview = buildApiOverview({
    surfaceScore,
    routeRegistry,
    endpointCoverage,
    moduleExposure,
    documentation,
    productionReadiness,
  });

  return {
    overview,
    routeRegistry,
    endpointCoverage,
    authentication,
    documentation,
    moduleExposure,
    productionReadiness,
    riskRegister,
    recommendations,
    surfaceScore,
    generatedAt,
  };
}

export function buildApiAuditCenter(input: { snapshot: ApiAuditSnapshot }): ApiAuditCenter {
  return {
    overview: input.snapshot.overview,
    routeRegistry: input.snapshot.routeRegistry,
    endpointCoverage: input.snapshot.endpointCoverage,
    authentication: input.snapshot.authentication,
    documentation: input.snapshot.documentation,
    moduleExposure: input.snapshot.moduleExposure,
    productionReadiness: input.snapshot.productionReadiness,
    riskRegister: input.snapshot.riskRegister,
    recommendations: input.snapshot.recommendations,
    surfaceScore: input.snapshot.surfaceScore,
    generatedAt: input.snapshot.generatedAt,
  };
}

export function collectApiAuditPaths(): string[] {
  return [
    "docs/experience/X24-API-Surface-Audit-Center.md",
    "src/api/routes/api-audit.ts",
    "src/experience/api-audit/module.ts",
    "test/x24-api-audit.test.ts",
    "scripts/verify-x24.sh",
    ".dependency-cruiser.cjs",
  ];
}

export interface ApiOverviewView {
  headline: string;
  api_score: number;
  route_count: number;
  endpoint_count: number;
  registered_modules: number;
  documentation_coverage: number;
  production_readiness: string;
  summary: string;
}

export interface RouteRegistryAuditView {
  registered_routes: string[];
  missing_routes: string[];
  duplicate_routes: string[];
  route_consistency_score: number;
  summary: string;
}

export interface EndpointCoverageAuditView {
  get_count: number;
  post_count: number;
  put_count: number;
  patch_count: number;
  delete_count: number;
  total_endpoints: number;
  coverage_score: number;
  summary: string;
}

export interface AuthenticationAuditView {
  protected_routes: string[];
  public_routes: string[];
  role_protected_routes: string[];
  missing_protection_warnings: string[];
  summary: string;
}

export interface ApiDocumentationAuditView {
  documented_endpoints: string[];
  undocumented_endpoints: string[];
  coverage_score: number;
  summary: string;
}

export interface ModuleExposureEntryView {
  module: string;
  register_function: string;
  exposed_routes: number;
  hidden_routes: number;
  registered: boolean;
}

export interface ModuleExposureAuditView {
  module_count: number;
  entries: ModuleExposureEntryView[];
  consistency_score: number;
  summary: string;
}

export interface ApiProductionReadinessView {
  readiness_score: number;
  blockers: string[];
  warnings: string[];
  strengths: string[];
  summary: string;
}

export interface ApiRiskView {
  category: ApiRisk["category"];
  severity: ApiRisk["severity"];
  message: string;
  mitigation: string;
}

export interface ApiRiskRegisterView {
  risks: ApiRiskView[];
  summary: string;
}

export interface ApiRecommendationView {
  horizon: RecommendationHorizon;
  title: string;
  reason: string;
  action: string;
}

export interface ApiRecommendationsView {
  immediate: ApiRecommendationView[];
  next_phase: ApiRecommendationView[];
  production: ApiRecommendationView[];
  summary: string;
}

export interface ApiSurfaceScoreView {
  score: number;
  status: ApiSurfaceStatus;
  route_coverage_weight: number;
  endpoint_coverage_weight: number;
  auth_coverage_weight: number;
  documentation_coverage_weight: number;
  readiness_weight: number;
  summary: string;
}

export interface ApiAuditCenterView {
  overview: ApiOverviewView;
  route_registry: RouteRegistryAuditView;
  endpoint_coverage: EndpointCoverageAuditView;
  authentication: AuthenticationAuditView;
  documentation: ApiDocumentationAuditView;
  module_exposure: ModuleExposureAuditView;
  production_readiness: ApiProductionReadinessView;
  risk_register: ApiRiskRegisterView;
  recommendations: ApiRecommendationsView;
  surface_score: ApiSurfaceScoreView;
  generated_at: string;
}

export function toApiOverviewView(overview: ApiOverview): ApiOverviewView {
  return {
    headline: overview.headline,
    api_score: overview.apiScore,
    route_count: overview.routeCount,
    endpoint_count: overview.endpointCount,
    registered_modules: overview.registeredModules,
    documentation_coverage: overview.documentationCoverage,
    production_readiness: overview.productionReadiness,
    summary: overview.summary,
  };
}

export function toRouteRegistryAuditView(audit: RouteRegistryAudit): RouteRegistryAuditView {
  return {
    registered_routes: audit.registeredRoutes,
    missing_routes: audit.missingRoutes,
    duplicate_routes: audit.duplicateRoutes,
    route_consistency_score: audit.routeConsistencyScore,
    summary: audit.summary,
  };
}

export function toEndpointCoverageAuditView(
  audit: EndpointCoverageAudit
): EndpointCoverageAuditView {
  return {
    get_count: audit.getCount,
    post_count: audit.postCount,
    put_count: audit.putCount,
    patch_count: audit.patchCount,
    delete_count: audit.deleteCount,
    total_endpoints: audit.totalEndpoints,
    coverage_score: audit.coverageScore,
    summary: audit.summary,
  };
}

export function toAuthenticationAuditView(audit: AuthenticationAudit): AuthenticationAuditView {
  return {
    protected_routes: audit.protectedRoutes,
    public_routes: audit.publicRoutes,
    role_protected_routes: audit.roleProtectedRoutes,
    missing_protection_warnings: audit.missingProtectionWarnings,
    summary: audit.summary,
  };
}

export function toApiDocumentationAuditView(
  audit: ApiDocumentationAudit
): ApiDocumentationAuditView {
  return {
    documented_endpoints: audit.documentedEndpoints,
    undocumented_endpoints: audit.undocumentedEndpoints,
    coverage_score: audit.coverageScore,
    summary: audit.summary,
  };
}

export function toModuleExposureEntryView(entry: ModuleExposureEntry): ModuleExposureEntryView {
  return {
    module: entry.module,
    register_function: entry.registerFunction,
    exposed_routes: entry.exposedRoutes,
    hidden_routes: entry.hiddenRoutes,
    registered: entry.registered,
  };
}

export function toModuleExposureAuditView(audit: ModuleExposureAudit): ModuleExposureAuditView {
  return {
    module_count: audit.moduleCount,
    entries: audit.entries.map(toModuleExposureEntryView),
    consistency_score: audit.consistencyScore,
    summary: audit.summary,
  };
}

export function toApiProductionReadinessView(
  readiness: ApiProductionReadiness
): ApiProductionReadinessView {
  return {
    readiness_score: readiness.readinessScore,
    blockers: readiness.blockers,
    warnings: readiness.warnings,
    strengths: readiness.strengths,
    summary: readiness.summary,
  };
}

export function toApiRiskView(risk: ApiRisk): ApiRiskView {
  return {
    category: risk.category,
    severity: risk.severity,
    message: risk.message,
    mitigation: risk.mitigation,
  };
}

export function toApiRiskRegisterView(register: ApiRiskRegister): ApiRiskRegisterView {
  return {
    risks: register.risks.map(toApiRiskView),
    summary: register.summary,
  };
}

export function toApiRecommendationView(recommendation: ApiRecommendation): ApiRecommendationView {
  return {
    horizon: recommendation.horizon,
    title: recommendation.title,
    reason: recommendation.reason,
    action: recommendation.action,
  };
}

export function toApiRecommendationsView(
  recommendations: ApiRecommendations
): ApiRecommendationsView {
  return {
    immediate: recommendations.immediate.map(toApiRecommendationView),
    next_phase: recommendations.nextPhase.map(toApiRecommendationView),
    production: recommendations.production.map(toApiRecommendationView),
    summary: recommendations.summary,
  };
}

export function toApiSurfaceScoreView(score: ApiSurfaceScore): ApiSurfaceScoreView {
  return {
    score: score.score,
    status: score.status,
    route_coverage_weight: score.routeCoverageWeight,
    endpoint_coverage_weight: score.endpointCoverageWeight,
    auth_coverage_weight: score.authCoverageWeight,
    documentation_coverage_weight: score.documentationCoverageWeight,
    readiness_weight: score.readinessWeight,
    summary: score.summary,
  };
}

export function toApiAuditCenterView(center: ApiAuditCenter): ApiAuditCenterView {
  return {
    overview: toApiOverviewView(center.overview),
    route_registry: toRouteRegistryAuditView(center.routeRegistry),
    endpoint_coverage: toEndpointCoverageAuditView(center.endpointCoverage),
    authentication: toAuthenticationAuditView(center.authentication),
    documentation: toApiDocumentationAuditView(center.documentation),
    module_exposure: toModuleExposureAuditView(center.moduleExposure),
    production_readiness: toApiProductionReadinessView(center.productionReadiness),
    risk_register: toApiRiskRegisterView(center.riskRegister),
    recommendations: toApiRecommendationsView(center.recommendations),
    surface_score: toApiSurfaceScoreView(center.surfaceScore),
    generated_at: center.generatedAt.toISOString(),
  };
}
