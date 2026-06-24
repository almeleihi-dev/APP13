import {
  buildParsedRouteRegistry,
  type ParsedRoute,
} from "../../api-audit/domain/api-audit.js";

export type UxSurfaceKind = "api_only" | "hybrid_json" | "browser_ready";
export type ReadinessTier = "api_ready" | "operator_ready" | "browser_ready";
export type BrowserUsability = "browser_serving" | "json_api" | "potential_entry" | "non_browser";
export type EntryPointStatus = "present" | "partial" | "missing";
export type RecommendationHorizon = "immediate" | "next_layer" | "production";

export interface ExecutiveUxReadinessSources {
  serverSource: string;
  packageSource: string;
  routeSources: Record<string, string>;
  browserSurfaceSources: Record<string, string>;
  uiPageSources: Record<string, string>;
  existingPaths: Set<string>;
}

export interface ExecutiveUxReadinessRawSnapshot {
  sources: ExecutiveUxReadinessSources;
}

export interface UxReadinessOverview {
  headline: string;
  readinessScore: number;
  surfaceKind: UxSurfaceKind;
  highestTier: ReadinessTier;
  apiReady: boolean;
  operatorReady: boolean;
  browserReady: boolean;
  summary: string;
}

export interface SurfaceSignal {
  signal: string;
  detected: boolean;
  detail: string;
}

export interface SurfaceDetection {
  surfaceKind: UxSurfaceKind;
  hasSpaFramework: boolean;
  hasStaticHosting: boolean;
  hasHtmlRoutes: boolean;
  uiPageModuleCount: number;
  uiPagesWiredToRoutes: boolean;
  routeImportsUiPages: string[];
  signals: SurfaceSignal[];
  summary: string;
}

export interface RouteBrowserAuditEntry {
  method: string;
  path: string;
  usability: BrowserUsability;
  authRequired: boolean;
  sourceFile: string;
  registered: boolean;
}

export interface RouteBrowserAudit {
  totalRegisteredRoutes: number;
  browserServingRoutes: string[];
  jsonApiRoutes: string[];
  potentialEntryRoutes: string[];
  nonBrowserRoutes: string[];
  entries: RouteBrowserAuditEntry[];
  usabilityScore: number;
  summary: string;
}

export interface EntryPointCandidate {
  path: string;
  label: string;
  status: EntryPointStatus;
  priority: "critical" | "high" | "medium";
  rationale: string;
}

export interface UiPageEntryPoint {
  pageModule: string;
  renderFunction: string;
  wiredToRoute: boolean;
  suggestedPath: string;
}

export interface EntryPointAudit {
  missingEntryPoints: EntryPointCandidate[];
  partialEntryPoints: EntryPointCandidate[];
  presentEntryPoints: EntryPointCandidate[];
  unwiredUiPages: UiPageEntryPoint[];
  wiredUiPages: UiPageEntryPoint[];
  summary: string;
}

export interface ReadinessTierAssessment {
  tier: ReadinessTier;
  ready: boolean;
  blockers: string[];
  strengths: string[];
  summary: string;
}

export interface ReadinessClassification {
  apiReady: ReadinessTierAssessment;
  operatorReady: ReadinessTierAssessment;
  browserReady: ReadinessTierAssessment;
  highestAchievedTier: ReadinessTier;
  summary: string;
}

export interface UxRecommendation {
  horizon: RecommendationHorizon;
  title: string;
  reason: string;
  action: string;
}

export interface UxRecommendations {
  immediate: UxRecommendation[];
  nextLayer: UxRecommendation[];
  production: UxRecommendation[];
  summary: string;
}

export interface UxReadinessScore {
  score: number;
  apiWeight: number;
  operatorWeight: number;
  browserWeight: number;
  routeUsabilityWeight: number;
  entryPointWeight: number;
  summary: string;
}

export interface ExecutiveUxReadinessSnapshot {
  overview: UxReadinessOverview;
  surfaceDetection: SurfaceDetection;
  routeAudit: RouteBrowserAudit;
  entryPoints: EntryPointAudit;
  classification: ReadinessClassification;
  recommendations: UxRecommendations;
  readinessScore: UxReadinessScore;
  generatedAt: Date;
}

export interface ExecutiveUxReadinessCenter {
  overview: UxReadinessOverview;
  surfaceDetection: SurfaceDetection;
  routeAudit: RouteBrowserAudit;
  entryPoints: EntryPointAudit;
  classification: ReadinessClassification;
  recommendations: UxRecommendations;
  readinessScore: UxReadinessScore;
  generatedAt: Date;
}

export const EXECUTIVE_UX_READINESS_ROUTES = [
  "/executive-ux-readiness",
  "/executive-ux-readiness/overview",
  "/executive-ux-readiness/surface",
  "/executive-ux-readiness/routes",
  "/executive-ux-readiness/entry-points",
  "/executive-ux-readiness/classification",
  "/executive-ux-readiness/recommendations",
  "/executive-ux-readiness/score",
];

export const EXPECTED_BROWSER_ENTRY_POINTS: Array<{
  path: string;
  label: string;
  priority: EntryPointCandidate["priority"];
  matchPrefixes?: string[];
}> = [
  { path: "/", label: "Root landing page", priority: "critical", matchPrefixes: ["/"] },
  { path: "/login", label: "Sign-in surface", priority: "critical", matchPrefixes: ["/login", "/v1/auth"] },
  { path: "/home", label: "Authenticated home hub", priority: "high", matchPrefixes: ["/home"] },
  {
    path: "/marketplace",
    label: "Marketplace discovery",
    priority: "high",
    matchPrefixes: ["/marketplace", "/discovery"],
  },
  {
    path: "/contracts",
    label: "Contract journey surface",
    priority: "high",
    matchPrefixes: ["/contracts", "/contract-journey"],
  },
  {
    path: "/provider",
    label: "Provider command center",
    priority: "medium",
    matchPrefixes: ["/provider", "/provider-command-center"],
  },
  {
    path: "/customer",
    label: "Customer command center",
    priority: "medium",
    matchPrefixes: ["/customer", "/customer-command-center"],
  },
];

export const UI_PAGE_ENTRY_CANDIDATES: Array<{
  pageModule: string;
  renderFunction: string;
  suggestedPath: string;
}> = [
  { pageModule: "platform-home.ts", renderFunction: "renderPlatformHomePage", suggestedPath: "/platform/home" },
  {
    pageModule: "marketplace-search.ts",
    renderFunction: "renderMarketplaceSearchPage",
    suggestedPath: "/marketplace/search",
  },
  {
    pageModule: "marketplace-results.ts",
    renderFunction: "renderMarketplaceResultsPage",
    suggestedPath: "/marketplace/results",
  },
  {
    pageModule: "provider-dashboard.ts",
    renderFunction: "renderProviderDashboardPage",
    suggestedPath: "/provider/dashboard",
  },
  {
    pageModule: "execution-dashboard.ts",
    renderFunction: "renderExecutionDashboardPage",
    suggestedPath: "/execution/dashboard",
  },
  {
    pageModule: "trust-center.ts",
    renderFunction: "renderTrustCenterPage",
    suggestedPath: "/trust/center",
  },
  {
    pageModule: "contract-summary.ts",
    renderFunction: "renderContractSummaryPage",
    suggestedPath: "/contracts/summary",
  },
  {
    pageModule: "dispute-dashboard.ts",
    renderFunction: "renderDisputeDashboardPage",
    suggestedPath: "/disputes/dashboard",
  },
];

const OPERATOR_EXPERIENCE_PREFIXES = [
  "/executive-experience",
  "/executive-command-center",
  "/mission-control",
  "/api-audit",
  "/business-intelligence",
  "/launch-control",
  "/post-launch-monitoring",
  "/platform-operations",
  "/production-readiness",
  "/security-readiness",
  "/executive-ux-readiness",
  "/browser-experience-completeness",
  "/operator-surface-navigation",
  "/operator-experience-integrity",
  "/operator-onboarding-readiness",
];

const POTENTIAL_ENTRY_PREFIXES = ["/home", "/marketplace", "/discovery", "/platform", "/contracts"];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function registeredRoutes(routes: ParsedRoute[]): ParsedRoute[] {
  return routes.filter((route) => route.registeredInServer);
}

function hasHealthRoute(routes: ParsedRoute[]): boolean {
  return registeredRoutes(routes).some(
    (route) => route.method === "GET" && route.path === "/health"
  );
}

function detectSpaFramework(packageSource: string): boolean {
  return /"(react|vite|next|@vitejs\/plugin-react|react-dom)"/.test(packageSource);
}

function detectStaticHosting(input: {
  packageSource: string;
  serverSource: string;
  existingPaths: Set<string>;
}): boolean {
  return (
    /@fastify\/static/.test(input.packageSource) ||
    /register\(.*static|fastify-static|sendFile\(/.test(input.serverSource) ||
    input.existingPaths.has("public/index.html") ||
    input.existingPaths.has("index.html")
  );
}

function detectHtmlRoutes(input: {
  serverSource: string;
  routeSources: Record<string, string>;
}): boolean {
  const combined = [input.serverSource, ...Object.values(input.routeSources)].join("\n");
  return (
    /text\/html/.test(combined) ||
    /reply\.type\(\s*["']text\/html["']\s*\)/.test(combined) ||
    /render\w+Page\(/.test(combined)
  );
}

function detectUiPageImports(sources: ExecutiveUxReadinessSources): string[] {
  const imports: string[] = [];
  for (const [sourceFile, content] of Object.entries(sources.routeSources)) {
    if (/from\s+["'][^"']*\/ui\/pages\//.test(content) || /render\w+Page\(/.test(content)) {
      imports.push(sourceFile);
    }
  }

  const browserSurfaceWired =
    /registerBrowserSurfaceRoutes/.test(sources.serverSource) &&
    Object.values(sources.browserSurfaceSources).some(
      (content) =>
        /from\s+["'][^"']*\/ui\/pages\//.test(content) || /render\w+Page\(/.test(content)
    );

  if (browserSurfaceWired) {
    imports.push("src/browser-surface/application/browser-surface-service.ts");
  }

  return imports;
}

function countUiPageModules(uiPageSources: Record<string, string>): number {
  return Object.values(uiPageSources).filter((content) => /export function render\w+Page/.test(content))
    .length;
}

function classifyRouteUsability(route: ParsedRoute): BrowserUsability {
  if (route.method !== "GET") return "non_browser";

  const routeBlock = route.path;
  if (POTENTIAL_ENTRY_PREFIXES.some((prefix) => routeBlock.startsWith(prefix))) {
    return "potential_entry";
  }

  if (route.path === "/" || route.path === "/health") {
    return route.path === "/" ? "potential_entry" : "json_api";
  }

  return "json_api";
}

function reclassifyWithHtmlServing(
  entries: RouteBrowserAuditEntry[],
  htmlRouteKeys: Set<string>
): RouteBrowserAuditEntry[] {
  return entries.map((entry) => {
    const key = `${entry.method} ${entry.path}`;
    if (htmlRouteKeys.has(key)) {
      return { ...entry, usability: "browser_serving" as BrowserUsability };
    }
    return entry;
  });
}

function findHtmlServingRouteKeys(routeSources: Record<string, string>): Set<string> {
  const keys = new Set<string>();
  const pattern =
    /app\.get\(\s*"([^"]+)"[\s\S]{0,400}?(text\/html|reply\.type\(\s*["']text\/html["']\s*\)|render\w+Page\()/g;

  for (const content of Object.values(routeSources)) {
    for (const match of content.matchAll(pattern)) {
      keys.add(`GET ${match[1]}`);
    }
  }

  return keys;
}

export function buildSurfaceDetection(input: {
  sources: ExecutiveUxReadinessSources;
}): SurfaceDetection {
  const hasSpaFramework = detectSpaFramework(input.sources.packageSource);
  const hasStaticHosting = detectStaticHosting({
    packageSource: input.sources.packageSource,
    serverSource: input.sources.serverSource,
    existingPaths: input.sources.existingPaths,
  });
  const hasHtmlRoutes = detectHtmlRoutes({
    serverSource: input.sources.serverSource,
    routeSources: input.sources.routeSources,
  });
  const uiPageModuleCount = countUiPageModules(input.sources.uiPageSources);
  const routeImportsUiPages = detectUiPageImports(input.sources);
  const uiPagesWiredToRoutes = routeImportsUiPages.length > 0;

  let surfaceKind: UxSurfaceKind = "api_only";
  if (hasHtmlRoutes || hasStaticHosting || (hasSpaFramework && uiPagesWiredToRoutes)) {
    surfaceKind = "browser_ready";
  } else if (uiPageModuleCount > 0 || hasSpaFramework) {
    surfaceKind = "hybrid_json";
  }

  const signals: SurfaceSignal[] = [
    {
      signal: "spa_framework",
      detected: hasSpaFramework,
      detail: hasSpaFramework
        ? "Package dependencies include a SPA framework."
        : "No React/Vite/Next dependencies detected in package.json.",
    },
    {
      signal: "static_hosting",
      detected: hasStaticHosting,
      detail: hasStaticHosting
        ? "Static hosting middleware or HTML entry files detected."
        : "No @fastify/static, public/, or root index.html wiring detected.",
    },
    {
      signal: "html_routes",
      detected: hasHtmlRoutes,
      detail: hasHtmlRoutes
        ? "At least one route serves HTML or invokes a page renderer."
        : "Routes return JSON payloads only; no text/html handlers found.",
    },
    {
      signal: "ui_page_modules",
      detected: uiPageModuleCount > 0,
      detail:
        uiPageModuleCount > 0
          ? `${uiPageModuleCount} UI page renderer modules exist under src/ui/pages.`
          : "No UI page renderer modules found.",
    },
    {
      signal: "ui_pages_wired",
      detected: uiPagesWiredToRoutes,
      detail: uiPagesWiredToRoutes
        ? `UI renderers referenced from route files: ${routeImportsUiPages.join(", ")}.`
        : "UI page renderers are not imported by HTTP route handlers.",
    },
  ];

  return {
    surfaceKind,
    hasSpaFramework,
    hasStaticHosting,
    hasHtmlRoutes,
    uiPageModuleCount,
    uiPagesWiredToRoutes,
    routeImportsUiPages,
    signals,
    summary: `Surface classification: ${surfaceKind.replace("_", " ")} with ${uiPageModuleCount} UI page modules and ${uiPagesWiredToRoutes ? "wired" : "unwired"} HTML integration.`,
  };
}

export function buildRouteBrowserAudit(input: {
  routes: ParsedRoute[];
  routeSources: Record<string, string>;
}): RouteBrowserAudit {
  const htmlRouteKeys = findHtmlServingRouteKeys(input.routeSources);
  const registered = registeredRoutes(input.routes);

  let entries: RouteBrowserAuditEntry[] = registered.map((route) => ({
    method: route.method,
    path: route.path,
    usability: classifyRouteUsability(route),
    authRequired: route.authRequired,
    sourceFile: route.sourceFile,
    registered: route.registeredInServer,
  }));

  entries = reclassifyWithHtmlServing(entries, htmlRouteKeys);

  const browserServingRoutes = entries
    .filter((entry) => entry.usability === "browser_serving")
    .map((entry) => `${entry.method} ${entry.path}`);
  const jsonApiRoutes = entries
    .filter((entry) => entry.usability === "json_api")
    .map((entry) => `${entry.method} ${entry.path}`);
  const potentialEntryRoutes = entries
    .filter((entry) => entry.usability === "potential_entry")
    .map((entry) => `${entry.method} ${entry.path}`);
  const nonBrowserRoutes = entries
    .filter((entry) => entry.usability === "non_browser")
    .map((entry) => `${entry.method} ${entry.path}`);

  const getCount = entries.filter((entry) => entry.method === "GET").length;
  const browserScore =
    getCount === 0
      ? 0
      : Math.round(
          ((browserServingRoutes.length * 100 + potentialEntryRoutes.length * 35) / getCount) * 0.65
        );

  return {
    totalRegisteredRoutes: registered.length,
    browserServingRoutes,
    jsonApiRoutes,
    potentialEntryRoutes,
    nonBrowserRoutes,
    entries,
    usabilityScore: clamp(browserScore, 0, 100),
    summary: `Route browser audit: ${registered.length} registered routes, ${browserServingRoutes.length} HTML-serving, ${jsonApiRoutes.length} JSON API, ${potentialEntryRoutes.length} potential entry GET routes.`,
  };
}

function routeMatchesPrefix(registeredPaths: string[], prefixes: string[]): boolean {
  return prefixes.some((prefix) =>
    registeredPaths.some((path) => path === prefix || path.startsWith(`${prefix}/`))
  );
}

function assessEntryPoint(
  candidate: (typeof EXPECTED_BROWSER_ENTRY_POINTS)[number],
  registeredGetPaths: string[],
  htmlRouteKeys: Set<string>
): EntryPointCandidate {
  const prefixes = candidate.matchPrefixes ?? [candidate.path];
  const jsonPresent = routeMatchesPrefix(registeredGetPaths, prefixes);
  const htmlPresent = prefixes.some((prefix) => htmlRouteKeys.has(`GET ${prefix}`));

  let status: EntryPointStatus = "missing";
  let rationale = `No registered GET route matches ${candidate.path}.`;

  if (htmlPresent) {
    status = "present";
    rationale = `HTML-serving route detected for ${candidate.label}.`;
  } else if (jsonPresent) {
    status = "partial";
    rationale = `JSON API route exists for ${candidate.label}, but no browser HTML surface is wired.`;
  }

  return {
    path: candidate.path,
    label: candidate.label,
    status,
    priority: candidate.priority,
    rationale,
  };
}

export function buildEntryPointAudit(input: {
  routes: ParsedRoute[];
  routeSources: Record<string, string>;
  browserSurfaceSources: Record<string, string>;
  uiPageSources: Record<string, string>;
}): EntryPointAudit {
  const htmlRouteKeys = findHtmlServingRouteKeys(input.routeSources);
  const registeredGetPaths = registeredRoutes(input.routes)
    .filter((route) => route.method === "GET")
    .map((route) => route.path);

  const candidates = EXPECTED_BROWSER_ENTRY_POINTS.map((candidate) =>
    assessEntryPoint(candidate, registeredGetPaths, htmlRouteKeys)
  );

  const uiPages: UiPageEntryPoint[] = UI_PAGE_ENTRY_CANDIDATES.filter((candidate) =>
    Object.keys(input.uiPageSources).some((file) => file.endsWith(candidate.pageModule))
  ).map((candidate) => {
    const wiredToRoute =
      Object.values(input.routeSources).some(
        (content) =>
          content.includes(candidate.renderFunction) ||
          content.includes(candidate.pageModule.replace(".ts", ""))
      ) ||
      Object.values(input.browserSurfaceSources).some((content) =>
        content.includes(candidate.renderFunction)
      );

    return {
      pageModule: candidate.pageModule,
      renderFunction: candidate.renderFunction,
      wiredToRoute,
      suggestedPath: candidate.suggestedPath,
    };
  });

  return {
    missingEntryPoints: candidates.filter((entry) => entry.status === "missing"),
    partialEntryPoints: candidates.filter((entry) => entry.status === "partial"),
    presentEntryPoints: candidates.filter((entry) => entry.status === "present"),
    unwiredUiPages: uiPages.filter((page) => !page.wiredToRoute),
    wiredUiPages: uiPages.filter((page) => page.wiredToRoute),
    summary: `Entry point audit: ${candidates.filter((entry) => entry.status === "present").length} present, ${candidates.filter((entry) => entry.status === "partial").length} partial JSON-only, ${candidates.filter((entry) => entry.status === "missing").length} missing; ${uiPages.filter((page) => !page.wiredToRoute).length} UI pages unwired.`,
  };
}

function countOperatorRoutes(routes: ParsedRoute[]): number {
  return registeredRoutes(routes).filter(
    (route) =>
      route.method === "GET" &&
      OPERATOR_EXPERIENCE_PREFIXES.some((prefix) => route.path.startsWith(prefix))
  ).length;
}

export function buildReadinessClassification(input: {
  routes: ParsedRoute[];
  surfaceDetection: SurfaceDetection;
  routeAudit: RouteBrowserAudit;
  entryPoints: EntryPointAudit;
}): ReadinessClassification {
  const registeredCount = registeredRoutes(input.routes).length;
  const healthPresent = hasHealthRoute(input.routes);
  const operatorRouteCount = countOperatorRoutes(input.routes);

  const apiBlockers: string[] = [];
  const apiStrengths: string[] = [];
  if (!healthPresent) apiBlockers.push("Health endpoint (/health) is not registered.");
  if (registeredCount < 20) apiBlockers.push("Registered route count is below the API-ready threshold.");
  if (healthPresent) apiStrengths.push("Health endpoint is registered for operational probing.");
  if (registeredCount >= 20) apiStrengths.push(`${registeredCount} routes are registered in server.ts.`);

  const apiReady = apiBlockers.length === 0;

  const operatorBlockers: string[] = [];
  const operatorStrengths: string[] = [];
  if (!apiReady) operatorBlockers.push("API-ready baseline is not met.");
  if (operatorRouteCount < 5) {
    operatorBlockers.push("Insufficient platform_admin JSON experience centers exposed.");
  } else {
    operatorStrengths.push(`${operatorRouteCount} operator experience GET routes are available.`);
  }
  if (input.surfaceDetection.uiPageModuleCount === 0) {
    operatorBlockers.push("No UI page renderer modules exist for future browser wiring.");
  } else {
    operatorStrengths.push(
      `${input.surfaceDetection.uiPageModuleCount} UI page renderer modules exist under src/ui/pages.`
    );
  }

  const operatorReady = operatorBlockers.length === 0;

  const browserBlockers: string[] = [];
  const browserStrengths: string[] = [];
  if (!operatorReady) browserBlockers.push("Operator-ready baseline is not met.");
  if (!input.surfaceDetection.hasHtmlRoutes && !input.surfaceDetection.hasStaticHosting) {
    browserBlockers.push("No HTML routes or static hosting middleware are wired.");
  }
  if (!input.surfaceDetection.uiPagesWiredToRoutes) {
    browserBlockers.push("UI page renderers are not connected to HTTP routes.");
  }
  if (input.entryPoints.presentEntryPoints.length === 0) {
    browserBlockers.push("No browser HTML entry points are present.");
  }
  if (input.routeAudit.browserServingRoutes.length > 0) {
    browserStrengths.push(`${input.routeAudit.browserServingRoutes.length} routes serve HTML.`);
  }
  if (input.surfaceDetection.hasStaticHosting) {
    browserStrengths.push("Static hosting or root HTML entry is configured.");
  }

  const browserReady = browserBlockers.length === 0;

  let highestAchievedTier: ReadinessTier = "api_ready";
  if (browserReady) highestAchievedTier = "browser_ready";
  else if (operatorReady) highestAchievedTier = "operator_ready";
  else if (apiReady) highestAchievedTier = "api_ready";

  return {
    apiReady: {
      tier: "api_ready",
      ready: apiReady,
      blockers: apiBlockers,
      strengths: apiStrengths,
      summary: apiReady
        ? "APP13 exposes a sufficient JSON API surface for programmatic operation."
        : "API-ready baseline is incomplete; health and route coverage need attention.",
    },
    operatorReady: {
      tier: "operator_ready",
      ready: operatorReady,
      blockers: operatorBlockers,
      strengths: operatorStrengths,
      summary: operatorReady
        ? "Platform operators can inspect APP13 through authenticated JSON experience centers."
        : "Operator JSON centers or UI page modules are insufficient for human operator workflows.",
    },
    browserReady: {
      tier: "browser_ready",
      ready: browserReady,
      blockers: browserBlockers,
      strengths: browserStrengths,
      summary: browserReady
        ? "APP13 can be experienced through real browser HTML entry points."
        : "Browser-ready status requires wired HTML routes or static hosting plus entry points.",
    },
    highestAchievedTier,
    summary: `Highest achieved tier: ${highestAchievedTier.replace("_", " ")} (api=${apiReady}, operator=${operatorReady}, browser=${browserReady}).`,
  };
}

export function buildUxRecommendations(input: {
  classification: ReadinessClassification;
  surfaceDetection: SurfaceDetection;
  entryPoints: EntryPointAudit;
}): UxRecommendations {
  const immediate: UxRecommendation[] = [];
  const nextLayer: UxRecommendation[] = [];
  const production: UxRecommendation[] = [];

  if (!input.classification.browserReady.ready) {
    nextLayer.push({
      horizon: "next_layer",
      title: "Wire UI page renderers to HTML routes",
      reason: `${input.entryPoints.unwiredUiPages.length} UI page modules exist but are not referenced by route handlers.`,
      action:
        "Add thin HTTP adapters under src/api/routes that compose existing UI page renderers and return text/html without changing domain services.",
    });
  }

  if (input.surfaceDetection.surfaceKind === "api_only" || input.surfaceDetection.surfaceKind === "hybrid_json") {
    nextLayer.push({
      horizon: "next_layer",
      title: "Introduce browser entry shell",
      reason: "APP13 currently exposes JSON APIs without a human-facing HTML landing surface.",
      action:
        "Add a root HTML landing route and static asset hosting (or a SPA build pipeline) that links to /home, /marketplace, and operator dashboards.",
    });
  }

  if (input.entryPoints.partialEntryPoints.length > 0) {
    immediate.push({
      horizon: "immediate",
      title: "Upgrade JSON-only entry routes to HTML surfaces",
      reason: `${input.entryPoints.partialEntryPoints.length} expected entry points exist as JSON APIs only.`,
      action:
        "For routes like /home and /marketplace, add companion GET HTML handlers or a frontend client that renders operator/customer workflows.",
    });
  }

  if (input.entryPoints.missingEntryPoints.some((entry) => entry.priority === "critical")) {
    immediate.push({
      horizon: "immediate",
      title: "Add critical browser entry points",
      reason: "Root landing and sign-in HTML surfaces are missing.",
      action: "Register GET / and /login HTML routes (or SPA equivalents) with auth-aware redirects.",
    });
  }

  if (!input.surfaceDetection.hasStaticHosting) {
    production.push({
      horizon: "production",
      title: "Configure static asset delivery",
      reason: "Production browser UX requires cached static assets and favicon/manifest delivery.",
      action: "Register @fastify/static for public/ assets and ensure build artifacts are published with the API gateway.",
    });
  }

  if (input.classification.operatorReady.ready && !input.classification.browserReady.ready) {
    production.push({
      horizon: "production",
      title: "Preserve JSON operator centers during frontend rollout",
      reason: "Platform_admin JSON experience centers remain the operational backstop until browser UX ships.",
      action:
        "Keep executive-ux-readiness, api-audit, and mission-control routes available while layering HTML or SPA clients on top.",
    });
  }

  return {
    immediate,
    nextLayer,
    production,
    summary: `UX recommendations: ${immediate.length} immediate, ${nextLayer.length} next-layer, ${production.length} production actions to reach browser-ready status.`,
  };
}

export function computeUxReadinessScore(input: {
  classification: ReadinessClassification;
  routeAudit: RouteBrowserAudit;
  entryPoints: EntryPointAudit;
  surfaceDetection: SurfaceDetection;
}): UxReadinessScore {
  const apiWeight = 25;
  const operatorWeight = 25;
  const browserWeight = 20;
  const routeUsabilityWeight = 15;
  const entryPointWeight = 15;

  const apiComponent = input.classification.apiReady.ready ? 100 : 45;
  const operatorComponent = input.classification.operatorReady.ready ? 100 : 55;
  const browserComponent = input.classification.browserReady.ready ? 100 : 20;
  const routeComponent = input.routeAudit.usabilityScore;
  const entryComponent =
    input.entryPoints.presentEntryPoints.length * 25 +
    input.entryPoints.partialEntryPoints.length * 12;
  const entryScore = clamp(entryComponent, 0, 100);

  const score = Math.round(
    (apiComponent * apiWeight +
      operatorComponent * operatorWeight +
      browserComponent * browserWeight +
      routeComponent * routeUsabilityWeight +
      entryScore * entryPointWeight) /
      100
  );

  return {
    score: clamp(score, 0, 100),
    apiWeight,
    operatorWeight,
    browserWeight,
    routeUsabilityWeight,
    entryPointWeight,
    summary: `Executive UX readiness score ${clamp(score, 0, 100)} with ${input.surfaceDetection.surfaceKind.replace("_", " ")} surface and highest tier ${input.classification.highestAchievedTier.replace("_", " ")}.`,
  };
}

export function buildUxReadinessOverview(input: {
  readinessScore: UxReadinessScore;
  surfaceDetection: SurfaceDetection;
  classification: ReadinessClassification;
}): UxReadinessOverview {
  return {
    headline: "APP13 executive UX readiness center",
    readinessScore: input.readinessScore.score,
    surfaceKind: input.surfaceDetection.surfaceKind,
    highestTier: input.classification.highestAchievedTier,
    apiReady: input.classification.apiReady.ready,
    operatorReady: input.classification.operatorReady.ready,
    browserReady: input.classification.browserReady.ready,
    summary: `UX readiness overview: score ${input.readinessScore.score}, surface ${input.surfaceDetection.surfaceKind}, highest tier ${input.classification.highestAchievedTier.replace("_", " ")}.`,
  };
}

export function buildExecutiveUxReadinessSnapshot(input: {
  raw: ExecutiveUxReadinessRawSnapshot;
  generatedAt?: Date;
}): ExecutiveUxReadinessSnapshot {
  const generatedAt = input.generatedAt ?? new Date();
  const routes = buildParsedRouteRegistry({
    serverSource: input.raw.sources.serverSource,
    packageSource: input.raw.sources.packageSource,
    routeSources: input.raw.sources.routeSources,
    documentationSources: {},
    existingPaths: input.raw.sources.existingPaths,
  });

  const surfaceDetection = buildSurfaceDetection({ sources: input.raw.sources });
  const routeAudit = buildRouteBrowserAudit({
    routes,
    routeSources: input.raw.sources.routeSources,
  });
  const entryPoints = buildEntryPointAudit({
    routes,
    routeSources: input.raw.sources.routeSources,
    browserSurfaceSources: input.raw.sources.browserSurfaceSources,
    uiPageSources: input.raw.sources.uiPageSources,
  });
  const classification = buildReadinessClassification({
    routes,
    surfaceDetection,
    routeAudit,
    entryPoints,
  });
  const recommendations = buildUxRecommendations({
    classification,
    surfaceDetection,
    entryPoints,
  });
  const readinessScore = computeUxReadinessScore({
    classification,
    routeAudit,
    entryPoints,
    surfaceDetection,
  });
  const overview = buildUxReadinessOverview({
    readinessScore,
    surfaceDetection,
    classification,
  });

  return {
    overview,
    surfaceDetection,
    routeAudit,
    entryPoints,
    classification,
    recommendations,
    readinessScore,
    generatedAt,
  };
}

export function buildExecutiveUxReadinessCenter(input: {
  snapshot: ExecutiveUxReadinessSnapshot;
}): ExecutiveUxReadinessCenter {
  return {
    overview: input.snapshot.overview,
    surfaceDetection: input.snapshot.surfaceDetection,
    routeAudit: input.snapshot.routeAudit,
    entryPoints: input.snapshot.entryPoints,
    classification: input.snapshot.classification,
    recommendations: input.snapshot.recommendations,
    readinessScore: input.snapshot.readinessScore,
    generatedAt: input.snapshot.generatedAt,
  };
}

export function collectExecutiveUxReadinessPaths(): string[] {
  return [
    "docs/experience/X31-Executive-UX-Readiness-Center.md",
    "src/api/routes/executive-ux-readiness.ts",
    "src/experience/executive-ux-readiness/module.ts",
    "src/ui/pages/platform-home.ts",
    "test/x31-executive-ux-readiness.test.ts",
    "scripts/verify-x31.sh",
    ".dependency-cruiser.cjs",
  ];
}

export interface UxReadinessOverviewView {
  headline: string;
  readiness_score: number;
  surface_kind: UxSurfaceKind;
  highest_tier: ReadinessTier;
  api_ready: boolean;
  operator_ready: boolean;
  browser_ready: boolean;
  summary: string;
}

export interface SurfaceSignalView {
  signal: string;
  detected: boolean;
  detail: string;
}

export interface SurfaceDetectionView {
  surface_kind: UxSurfaceKind;
  has_spa_framework: boolean;
  has_static_hosting: boolean;
  has_html_routes: boolean;
  ui_page_module_count: number;
  ui_pages_wired_to_routes: boolean;
  route_imports_ui_pages: string[];
  signals: SurfaceSignalView[];
  summary: string;
}

export interface RouteBrowserAuditEntryView {
  method: string;
  path: string;
  usability: BrowserUsability;
  auth_required: boolean;
  source_file: string;
  registered: boolean;
}

export interface RouteBrowserAuditView {
  total_registered_routes: number;
  browser_serving_routes: string[];
  json_api_routes: string[];
  potential_entry_routes: string[];
  non_browser_routes: string[];
  entries: RouteBrowserAuditEntryView[];
  usability_score: number;
  summary: string;
}

export interface EntryPointCandidateView {
  path: string;
  label: string;
  status: EntryPointStatus;
  priority: EntryPointCandidate["priority"];
  rationale: string;
}

export interface UiPageEntryPointView {
  page_module: string;
  render_function: string;
  wired_to_route: boolean;
  suggested_path: string;
}

export interface EntryPointAuditView {
  missing_entry_points: EntryPointCandidateView[];
  partial_entry_points: EntryPointCandidateView[];
  present_entry_points: EntryPointCandidateView[];
  unwired_ui_pages: UiPageEntryPointView[];
  wired_ui_pages: UiPageEntryPointView[];
  summary: string;
}

export interface ReadinessTierAssessmentView {
  tier: ReadinessTier;
  ready: boolean;
  blockers: string[];
  strengths: string[];
  summary: string;
}

export interface ReadinessClassificationView {
  api_ready: ReadinessTierAssessmentView;
  operator_ready: ReadinessTierAssessmentView;
  browser_ready: ReadinessTierAssessmentView;
  highest_achieved_tier: ReadinessTier;
  summary: string;
}

export interface UxRecommendationView {
  horizon: RecommendationHorizon;
  title: string;
  reason: string;
  action: string;
}

export interface UxRecommendationsView {
  immediate: UxRecommendationView[];
  next_layer: UxRecommendationView[];
  production: UxRecommendationView[];
  summary: string;
}

export interface UxReadinessScoreView {
  score: number;
  api_weight: number;
  operator_weight: number;
  browser_weight: number;
  route_usability_weight: number;
  entry_point_weight: number;
  summary: string;
}

export interface ExecutiveUxReadinessCenterView {
  overview: UxReadinessOverviewView;
  surface_detection: SurfaceDetectionView;
  route_audit: RouteBrowserAuditView;
  entry_points: EntryPointAuditView;
  classification: ReadinessClassificationView;
  recommendations: UxRecommendationsView;
  readiness_score: UxReadinessScoreView;
  generated_at: string;
}

export function toUxReadinessOverviewView(overview: UxReadinessOverview): UxReadinessOverviewView {
  return {
    headline: overview.headline,
    readiness_score: overview.readinessScore,
    surface_kind: overview.surfaceKind,
    highest_tier: overview.highestTier,
    api_ready: overview.apiReady,
    operator_ready: overview.operatorReady,
    browser_ready: overview.browserReady,
    summary: overview.summary,
  };
}

export function toSurfaceDetectionView(surface: SurfaceDetection): SurfaceDetectionView {
  return {
    surface_kind: surface.surfaceKind,
    has_spa_framework: surface.hasSpaFramework,
    has_static_hosting: surface.hasStaticHosting,
    has_html_routes: surface.hasHtmlRoutes,
    ui_page_module_count: surface.uiPageModuleCount,
    ui_pages_wired_to_routes: surface.uiPagesWiredToRoutes,
    route_imports_ui_pages: surface.routeImportsUiPages,
    signals: surface.signals.map((signal) => ({
      signal: signal.signal,
      detected: signal.detected,
      detail: signal.detail,
    })),
    summary: surface.summary,
  };
}

export function toRouteBrowserAuditEntryView(
  entry: RouteBrowserAuditEntry
): RouteBrowserAuditEntryView {
  return {
    method: entry.method,
    path: entry.path,
    usability: entry.usability,
    auth_required: entry.authRequired,
    source_file: entry.sourceFile,
    registered: entry.registered,
  };
}

export function toRouteBrowserAuditView(audit: RouteBrowserAudit): RouteBrowserAuditView {
  return {
    total_registered_routes: audit.totalRegisteredRoutes,
    browser_serving_routes: audit.browserServingRoutes,
    json_api_routes: audit.jsonApiRoutes,
    potential_entry_routes: audit.potentialEntryRoutes,
    non_browser_routes: audit.nonBrowserRoutes,
    entries: audit.entries.map(toRouteBrowserAuditEntryView),
    usability_score: audit.usabilityScore,
    summary: audit.summary,
  };
}

export function toEntryPointCandidateView(candidate: EntryPointCandidate): EntryPointCandidateView {
  return {
    path: candidate.path,
    label: candidate.label,
    status: candidate.status,
    priority: candidate.priority,
    rationale: candidate.rationale,
  };
}

export function toUiPageEntryPointView(page: UiPageEntryPoint): UiPageEntryPointView {
  return {
    page_module: page.pageModule,
    render_function: page.renderFunction,
    wired_to_route: page.wiredToRoute,
    suggested_path: page.suggestedPath,
  };
}

export function toEntryPointAuditView(audit: EntryPointAudit): EntryPointAuditView {
  return {
    missing_entry_points: audit.missingEntryPoints.map(toEntryPointCandidateView),
    partial_entry_points: audit.partialEntryPoints.map(toEntryPointCandidateView),
    present_entry_points: audit.presentEntryPoints.map(toEntryPointCandidateView),
    unwired_ui_pages: audit.unwiredUiPages.map(toUiPageEntryPointView),
    wired_ui_pages: audit.wiredUiPages.map(toUiPageEntryPointView),
    summary: audit.summary,
  };
}

export function toReadinessTierAssessmentView(
  assessment: ReadinessTierAssessment
): ReadinessTierAssessmentView {
  return {
    tier: assessment.tier,
    ready: assessment.ready,
    blockers: assessment.blockers,
    strengths: assessment.strengths,
    summary: assessment.summary,
  };
}

export function toReadinessClassificationView(
  classification: ReadinessClassification
): ReadinessClassificationView {
  return {
    api_ready: toReadinessTierAssessmentView(classification.apiReady),
    operator_ready: toReadinessTierAssessmentView(classification.operatorReady),
    browser_ready: toReadinessTierAssessmentView(classification.browserReady),
    highest_achieved_tier: classification.highestAchievedTier,
    summary: classification.summary,
  };
}

export function toUxRecommendationView(recommendation: UxRecommendation): UxRecommendationView {
  return {
    horizon: recommendation.horizon,
    title: recommendation.title,
    reason: recommendation.reason,
    action: recommendation.action,
  };
}

export function toUxRecommendationsView(recommendations: UxRecommendations): UxRecommendationsView {
  return {
    immediate: recommendations.immediate.map(toUxRecommendationView),
    next_layer: recommendations.nextLayer.map(toUxRecommendationView),
    production: recommendations.production.map(toUxRecommendationView),
    summary: recommendations.summary,
  };
}

export function toUxReadinessScoreView(score: UxReadinessScore): UxReadinessScoreView {
  return {
    score: score.score,
    api_weight: score.apiWeight,
    operator_weight: score.operatorWeight,
    browser_weight: score.browserWeight,
    route_usability_weight: score.routeUsabilityWeight,
    entry_point_weight: score.entryPointWeight,
    summary: score.summary,
  };
}

export function toExecutiveUxReadinessCenterView(
  center: ExecutiveUxReadinessCenter
): ExecutiveUxReadinessCenterView {
  return {
    overview: toUxReadinessOverviewView(center.overview),
    surface_detection: toSurfaceDetectionView(center.surfaceDetection),
    route_audit: toRouteBrowserAuditView(center.routeAudit),
    entry_points: toEntryPointAuditView(center.entryPoints),
    classification: toReadinessClassificationView(center.classification),
    recommendations: toUxRecommendationsView(center.recommendations),
    readiness_score: toUxReadinessScoreView(center.readinessScore),
    generated_at: center.generatedAt.toISOString(),
  };
}
