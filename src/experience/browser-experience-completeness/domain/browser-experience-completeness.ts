import {
  BROWSER_DETAIL_ROUTES,
  BROWSER_ENTRY_ROUTES,
  BROWSER_HUB_ROUTES,
  BROWSER_SURFACE_ROUTES,
} from "../../../browser-surface/domain/browser-surface.js";
import { BROWSER_STATIC_ASSETS } from "../../../browser-static/domain/browser-static.js";
import {
  buildExecutiveUxReadinessSnapshot,
  type ExecutiveUxReadinessRawSnapshot,
  type ExecutiveUxReadinessSnapshot,
} from "../../executive-ux-readiness/domain/executive-ux-readiness.js";

export type BrowserLayerStatus = "complete" | "partial" | "attention_required";
export type BrowserIntegrationStatus = "integrated" | "partial" | "missing";
export type VerificationExecutionStatus = "ready" | "attention_required";
export type CompletenessStatus = "browser_complete" | "developing" | "attention_required";
export type RecommendationHorizon = "immediate" | "next_layer" | "production";

export interface BrowserCompletenessSources {
  indexSource: string;
  serverSource: string;
  packageSource: string;
  existingPaths: Set<string>;
  browserSurfaceRouteSource: string;
  browserStaticRouteSource: string;
  browserSurfaceSources: Record<string, string>;
  uiPageSources: Record<string, string>;
  verifyScriptSources: Record<string, string>;
}

export interface BrowserExperienceCompletenessRawSnapshot {
  uxReadinessRaw: ExecutiveUxReadinessRawSnapshot;
  sources: BrowserCompletenessSources;
}

export interface BrowserLayerSpec {
  code: string;
  label: string;
  routeRegister: string;
  routeFile: string;
  staticRouteFile?: string;
  moduleFile: string;
  documentationPath: string;
  testPath: string;
  verifyScript: string;
  verifyChainPrevious: string;
  packageScript: string;
  expectedRoutes: readonly string[];
}

export interface BrowserLayerAuditEntry {
  code: string;
  label: string;
  status: BrowserLayerStatus;
  documentationPresent: boolean;
  routesPresent: boolean;
  testsPresent: boolean;
  verificationPresent: boolean;
  integrationStatus: BrowserIntegrationStatus;
  registeredRoutes: string[];
  summary: string;
}

export interface BrowserLayerAudit {
  layers: BrowserLayerAuditEntry[];
  summary: string;
}

export interface BrowserRouteCompletenessEntry {
  path: string;
  layer: string;
  registered: boolean;
  publicAuth: boolean;
}

export interface BrowserRouteCompleteness {
  expectedRouteCount: number;
  registeredRouteCount: number;
  missingRoutes: string[];
  entries: BrowserRouteCompletenessEntry[];
  completenessScore: number;
  summary: string;
}

export interface StaticAssetAuditEntry {
  routePath: string;
  fileName: string;
  publicFilePresent: boolean;
  routeWired: boolean;
  shellLinked: boolean;
}

export interface StaticAssetAudit {
  assets: StaticAssetAuditEntry[];
  completenessScore: number;
  summary: string;
}

export interface UiPageWiringEntry {
  pageModule: string;
  renderFunction: string;
  wiredToBrowserRoute: boolean;
}

export interface UiPageWiringAudit {
  totalPageModules: number;
  wiredPageModules: number;
  unwiredPageModules: string[];
  entries: UiPageWiringEntry[];
  wiringScore: number;
  summary: string;
}

export interface X31AlignmentView {
  uxReadinessScore: number;
  highestTier: string;
  browserReady: boolean;
  surfaceKind: string;
  browserServingRouteCount: number;
  presentEntryPointCount: number;
  alignedWithBrowserStack: boolean;
  summary: string;
}

export interface BrowserVerificationChainEntry {
  chain: string;
  exists: boolean;
  chainedCorrectly: boolean;
  executionStatus: VerificationExecutionStatus;
  summary: string;
}

export interface BrowserVerificationChainAudit {
  chains: BrowserVerificationChainEntry[];
  summary: string;
}

export interface BrowserCompletenessRecommendation {
  horizon: RecommendationHorizon;
  title: string;
  reason: string;
  action: string;
}

export interface BrowserCompletenessRecommendations {
  immediate: BrowserCompletenessRecommendation[];
  nextLayer: BrowserCompletenessRecommendation[];
  production: BrowserCompletenessRecommendation[];
  summary: string;
}

export interface BrowserCompletenessScore {
  score: number;
  status: CompletenessStatus;
  layerCoverageWeight: number;
  routeCoverageWeight: number;
  staticAssetWeight: number;
  uiPageWiringWeight: number;
  verificationWeight: number;
  x31AlignmentWeight: number;
  summary: string;
}

export interface BrowserCompletenessOverview {
  headline: string;
  completenessScore: number;
  status: CompletenessStatus;
  browserLayerCount: number;
  registeredBrowserRoutes: number;
  staticAssetCount: number;
  uiPagesWired: number;
  x31BrowserReady: boolean;
  summary: string;
}

export interface BrowserExperienceCompletenessSnapshot {
  overview: BrowserCompletenessOverview;
  layerAudit: BrowserLayerAudit;
  routeCompleteness: BrowserRouteCompleteness;
  staticAssets: StaticAssetAudit;
  uiPageWiring: UiPageWiringAudit;
  x31Alignment: X31AlignmentView;
  verificationChain: BrowserVerificationChainAudit;
  recommendations: BrowserCompletenessRecommendations;
  completenessScore: BrowserCompletenessScore;
  generatedAt: Date;
}

export interface BrowserExperienceCompletenessCenter {
  overview: BrowserCompletenessOverview;
  layerAudit: BrowserLayerAudit;
  routeCompleteness: BrowserRouteCompleteness;
  staticAssets: StaticAssetAudit;
  uiPageWiring: UiPageWiringAudit;
  x31Alignment: X31AlignmentView;
  verificationChain: BrowserVerificationChainAudit;
  recommendations: BrowserCompletenessRecommendations;
  completenessScore: BrowserCompletenessScore;
  generatedAt: Date;
}

export const BROWSER_EXPERIENCE_COMPLETENESS_ROUTES = [
  "/browser-experience-completeness",
  "/browser-experience-completeness/overview",
  "/browser-experience-completeness/layers",
  "/browser-experience-completeness/routes",
  "/browser-experience-completeness/static-assets",
  "/browser-experience-completeness/ui-pages",
  "/browser-experience-completeness/x31-alignment",
  "/browser-experience-completeness/verification",
  "/browser-experience-completeness/recommendations",
  "/browser-experience-completeness/score",
] as const;

export const BROWSER_LAYER_SPECS: BrowserLayerSpec[] = [
  {
    code: "X32",
    label: "Browser Surface Wiring",
    routeRegister: "registerBrowserSurfaceRoutes",
    routeFile: "src/api/routes/browser-surface.ts",
    moduleFile: "src/browser-surface/module.ts",
    documentationPath: "docs/experience/X32-Browser-Surface-Wiring.md",
    testPath: "test/x32-browser-surface.test.ts",
    verifyScript: "scripts/verify-x32.sh",
    verifyChainPrevious: "verify:x31",
    packageScript: "verify:x32",
    expectedRoutes: ["/", "/operator/dashboard"],
  },
  {
    code: "X33",
    label: "Browser Entry & Static Delivery",
    routeRegister: "registerBrowserSurfaceRoutes",
    routeFile: "src/api/routes/browser-surface.ts",
    staticRouteFile: "src/api/routes/browser-static.ts",
    moduleFile: "src/browser-static/module.ts",
    documentationPath: "docs/experience/X33-Browser-Entry-And-Static-Delivery.md",
    testPath: "test/x33-browser-entry-static.test.ts",
    verifyScript: "scripts/verify-x33.sh",
    verifyChainPrevious: "verify:x32",
    packageScript: "verify:x33",
    expectedRoutes: ["/marketplace", "/login"],
  },
  {
    code: "X34",
    label: "Browser Hub & Journey Routes",
    routeRegister: "registerBrowserSurfaceRoutes",
    routeFile: "src/api/routes/browser-surface.ts",
    moduleFile: "src/browser-surface/module.ts",
    documentationPath: "docs/experience/X34-Browser-Hub-And-Journey-Routes.md",
    testPath: "test/x34-browser-hub-routes.test.ts",
    verifyScript: "scripts/verify-x34.sh",
    verifyChainPrevious: "verify:x33",
    packageScript: "verify:x34",
    expectedRoutes: [...BROWSER_HUB_ROUTES],
  },
  {
    code: "X35",
    label: "Browser Detail & Workflow Routes",
    routeRegister: "registerBrowserSurfaceRoutes",
    routeFile: "src/api/routes/browser-surface.ts",
    moduleFile: "src/browser-surface/module.ts",
    documentationPath: "docs/experience/X35-Browser-Detail-And-Workflow-Routes.md",
    testPath: "test/x35-browser-detail-routes.test.ts",
    verifyScript: "scripts/verify-x35.sh",
    verifyChainPrevious: "verify:x34",
    packageScript: "verify:x35",
    expectedRoutes: [...BROWSER_DETAIL_ROUTES],
  },
];

export const BROWSER_VERIFICATION_CHAIN_SPECS = [
  { chain: "verify:x32", script: "scripts/verify-x32.sh", previous: "verify:x31", packageScript: "verify:x32" },
  { chain: "verify:x33", script: "scripts/verify-x33.sh", previous: "verify:x32", packageScript: "verify:x33" },
  { chain: "verify:x34", script: "scripts/verify-x34.sh", previous: "verify:x33", packageScript: "verify:x34" },
  { chain: "verify:x35", script: "scripts/verify-x35.sh", previous: "verify:x34", packageScript: "verify:x35" },
  { chain: "verify:x36", script: "scripts/verify-x36.sh", previous: "verify:x35", packageScript: "verify:x36" },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function routeLayer(path: string): string {
  if (path === "/" || path === "/operator/dashboard") return "X32";
  if ((BROWSER_ENTRY_ROUTES as readonly string[]).includes(path)) return "X33";
  if ((BROWSER_HUB_ROUTES as readonly string[]).includes(path)) return "X34";
  if ((BROWSER_DETAIL_ROUTES as readonly string[]).includes(path)) return "X35";
  return "unknown";
}

function evaluateBrowserLayer(
  spec: BrowserLayerSpec,
  sources: BrowserCompletenessSources
): {
  documentationPresent: boolean;
  routesPresent: boolean;
  testsPresent: boolean;
  verificationPresent: boolean;
  status: BrowserLayerStatus;
  integrationStatus: BrowserIntegrationStatus;
  registeredRoutes: string[];
  passCount: number;
} {
  const documentationPresent = sources.existingPaths.has(spec.documentationPath);
  const routesPresent =
    sources.serverSource.includes(spec.routeRegister) &&
    sources.existingPaths.has(spec.routeFile) &&
    (!spec.staticRouteFile || sources.existingPaths.has(spec.staticRouteFile));
  const testsPresent = sources.existingPaths.has(spec.testPath);
  const verificationPresent =
    sources.existingPaths.has(spec.verifyScript) &&
    sources.packageSource.includes(`"${spec.packageScript}"`);

  const routeSource = sources.browserSurfaceRouteSource;
  const registeredRoutes = spec.expectedRoutes.filter((route) =>
    routeSource.includes(`app.get("${route}"`)
  );

  const checks = [documentationPresent, routesPresent, testsPresent, verificationPresent];
  const passCount = checks.filter(Boolean).length;

  let status: BrowserLayerStatus = "attention_required";
  if (passCount === 4 && registeredRoutes.length === spec.expectedRoutes.length) status = "complete";
  else if (passCount >= 2) status = "partial";

  let integrationStatus: BrowserIntegrationStatus = "missing";
  if (passCount === 4 && registeredRoutes.length === spec.expectedRoutes.length) {
    integrationStatus = "integrated";
  } else if (passCount >= 2) {
    integrationStatus = "partial";
  }

  return {
    documentationPresent,
    routesPresent,
    testsPresent,
    verificationPresent,
    status,
    integrationStatus,
    registeredRoutes,
    passCount,
  };
}

export function buildBrowserLayerAudit(sources: BrowserCompletenessSources): BrowserLayerAudit {
  const layers = BROWSER_LAYER_SPECS.map((spec) => {
    const evaluation = evaluateBrowserLayer(spec, sources);
    return {
      code: spec.code,
      label: spec.label,
      status: evaluation.status,
      documentationPresent: evaluation.documentationPresent,
      routesPresent: evaluation.routesPresent,
      testsPresent: evaluation.testsPresent,
      verificationPresent: evaluation.verificationPresent,
      integrationStatus: evaluation.integrationStatus,
      registeredRoutes: evaluation.registeredRoutes,
      summary: `${spec.code} ${spec.label}: ${evaluation.status.replace(/_/g, " ")} with ${evaluation.registeredRoutes.length}/${spec.expectedRoutes.length} routes and ${evaluation.passCount}/4 artifacts present.`,
    };
  });

  return {
    layers,
    summary: `Browser layer audit reviewed ${layers.length} delivery layers from X32 through X35.`,
  };
}

export function buildBrowserRouteCompleteness(
  sources: BrowserCompletenessSources
): BrowserRouteCompleteness {
  const routeSource = sources.browserSurfaceRouteSource;
  const entries: BrowserRouteCompletenessEntry[] = BROWSER_SURFACE_ROUTES.map((path) => {
    const registered = routeSource.includes(`app.get("${path}"`);
    const publicAuth =
      registered &&
      routeSource.includes(`app.get("${path}"`) &&
      /authenticate:\s*false/.test(
        routeSource.slice(
          routeSource.indexOf(`app.get("${path}"`),
          routeSource.indexOf(`app.get("${path}"`) + 400
        )
      );

    return {
      path,
      layer: routeLayer(path),
      registered,
      publicAuth,
    };
  });

  const registeredRouteCount = entries.filter((entry) => entry.registered).length;
  const missingRoutes = entries.filter((entry) => !entry.registered).map((entry) => entry.path);
  const completenessScore = clamp(
    Math.round((registeredRouteCount / Math.max(1, BROWSER_SURFACE_ROUTES.length)) * 100),
    0,
    100
  );

  return {
    expectedRouteCount: BROWSER_SURFACE_ROUTES.length,
    registeredRouteCount,
    missingRoutes,
    entries,
    completenessScore,
    summary: `Browser route completeness: ${registeredRouteCount}/${BROWSER_SURFACE_ROUTES.length} HTML routes registered with score ${completenessScore}.`,
  };
}

export function buildStaticAssetAudit(sources: BrowserCompletenessSources): StaticAssetAudit {
  const staticRouteSource = sources.browserStaticRouteSource;
  const browserSurfaceCombined = [
    sources.browserSurfaceRouteSource,
    ...Object.values(sources.browserSurfaceSources),
  ].join("\n");

  const assets: StaticAssetAuditEntry[] = BROWSER_STATIC_ASSETS.map((asset) => {
    const publicPath = `public/browser/${asset.fileName}`;
    return {
      routePath: asset.routePath,
      fileName: asset.fileName,
      publicFilePresent: sources.existingPaths.has(publicPath),
      routeWired:
        staticRouteSource.includes(asset.routePath) ||
        staticRouteSource.includes(asset.fileName) ||
        sources.serverSource.includes("registerBrowserStaticRoutes"),
      shellLinked: browserSurfaceCombined.includes(asset.routePath),
    };
  });

  const completeAssets = assets.filter(
    (asset) => asset.publicFilePresent && asset.routeWired && asset.shellLinked
  ).length;
  const completenessScore = clamp(
    Math.round((completeAssets / Math.max(1, assets.length)) * 100),
    0,
    100
  );

  return {
    assets,
    completenessScore,
    summary: `Static asset audit: ${completeAssets}/${assets.length} browser assets present, wired, and linked in HTML shell.`,
  };
}

export function buildUiPageWiringAudit(sources: BrowserCompletenessSources): UiPageWiringAudit {
  const wiringSources = [
    sources.browserSurfaceRouteSource,
    ...Object.values(sources.browserSurfaceSources),
  ].join("\n");

  const entries: UiPageWiringEntry[] = [];
  for (const [pageModule, content] of Object.entries(sources.uiPageSources)) {
    const renderMatch = content.match(/export function (render\w+Page)/);
    if (!renderMatch) continue;

    const renderFunction = renderMatch[1]!;
    entries.push({
      pageModule: pageModule.replace("src/ui/pages/", ""),
      renderFunction,
      wiredToBrowserRoute: wiringSources.includes(renderFunction),
    });
  }

  const wiredPageModules = entries.filter((entry) => entry.wiredToBrowserRoute).length;
  const unwiredPageModules = entries
    .filter((entry) => !entry.wiredToBrowserRoute)
    .map((entry) => entry.pageModule);
  const wiringScore = clamp(
    Math.round((wiredPageModules / Math.max(1, entries.length)) * 100),
    0,
    100
  );

  return {
    totalPageModules: entries.length,
    wiredPageModules,
    unwiredPageModules,
    entries,
    wiringScore,
    summary: `UI page wiring audit: ${wiredPageModules}/${entries.length} page renderers referenced by browser surface adapters.`,
  };
}

export function buildX31AlignmentView(
  uxSnapshot: ExecutiveUxReadinessSnapshot
): X31AlignmentView {
  const alignedWithBrowserStack =
    uxSnapshot.classification.browserReady.ready &&
    uxSnapshot.routeAudit.browserServingRoutes.length >= BROWSER_SURFACE_ROUTES.length - 2;

  return {
    uxReadinessScore: uxSnapshot.readinessScore.score,
    highestTier: uxSnapshot.classification.highestAchievedTier,
    browserReady: uxSnapshot.classification.browserReady.ready,
    surfaceKind: uxSnapshot.surfaceDetection.surfaceKind,
    browserServingRouteCount: uxSnapshot.routeAudit.browserServingRoutes.length,
    presentEntryPointCount: uxSnapshot.entryPoints.presentEntryPoints.length,
    alignedWithBrowserStack,
    summary: alignedWithBrowserStack
      ? "X31 executive UX readiness aligns with the completed X32–X35 browser stack."
      : "X31 UX readiness signals require attention relative to the browser delivery stack.",
  };
}

export function buildBrowserVerificationChainAudit(
  sources: BrowserCompletenessSources
): BrowserVerificationChainAudit {
  const chains = BROWSER_VERIFICATION_CHAIN_SPECS.map((spec) => {
    const exists = sources.existingPaths.has(spec.script);
    const scriptSource = sources.verifyScriptSources[spec.script] ?? "";
    const chainedCorrectly = exists && scriptSource.includes(spec.previous);
    const packageReady = sources.packageSource.includes(`"${spec.packageScript}"`);
    const executionStatus: VerificationExecutionStatus =
      exists && chainedCorrectly && packageReady ? "ready" : "attention_required";

    return {
      chain: spec.chain,
      exists,
      chainedCorrectly,
      executionStatus,
      summary: `${spec.chain} ${executionStatus === "ready" ? "chains correctly" : "requires attention"}.`,
    };
  });

  return {
    chains,
    summary: `Browser verification chain audit reviewed ${chains.length} verify scripts from verify:x32 through verify:x36.`,
  };
}

export function buildBrowserCompletenessRecommendations(input: {
  layerAudit: BrowserLayerAudit;
  routeCompleteness: BrowserRouteCompleteness;
  staticAssets: StaticAssetAudit;
  uiPageWiring: UiPageWiringAudit;
  x31Alignment: X31AlignmentView;
  verificationChain: BrowserVerificationChainAudit;
}): BrowserCompletenessRecommendations {
  const immediate: BrowserCompletenessRecommendation[] = [];
  const nextLayer: BrowserCompletenessRecommendation[] = [];
  const production: BrowserCompletenessRecommendation[] = [];

  if (input.routeCompleteness.missingRoutes.length > 0) {
    immediate.push({
      horizon: "immediate",
      title: "Register missing browser HTML routes",
      reason: `${input.routeCompleteness.missingRoutes.length} expected browser routes are not registered in browser-surface.ts.`,
      action:
        "Add explicit app.get handlers for missing paths using existing UI page renderers and PUBLIC_HTML_ROUTE_CONFIG.",
    });
  }

  if (input.uiPageWiring.unwiredPageModules.length > 0) {
    nextLayer.push({
      horizon: "next_layer",
      title: "Wire remaining UI page renderers",
      reason: `${input.uiPageWiring.unwiredPageModules.length} UI page modules are not referenced by browser surface adapters.`,
      action:
        "Extend browser-surface service with thin HTML adapters for unwired renderers without changing domain services.",
    });
  }

  const incompleteLayers = input.layerAudit.layers.filter((layer) => layer.status !== "complete");
  if (incompleteLayers.length > 0) {
    nextLayer.push({
      horizon: "next_layer",
      title: "Complete browser delivery layer artifacts",
      reason: `${incompleteLayers.length} browser layers (X32–X35) are not fully complete.`,
      action:
        "Ensure documentation, routes, tests, and verify scripts exist for each incomplete browser layer.",
    });
  }

  if (input.staticAssets.completenessScore < 100) {
    production.push({
      horizon: "production",
      title: "Harden static asset delivery",
      reason: "Not all browser static assets are present, wired, and linked in the HTML shell.",
      action:
        "Verify public/browser assets, @fastify/static registration, and shell link tags for CSS, favicon, and manifest.",
    });
  }

  if (!input.x31Alignment.alignedWithBrowserStack) {
    production.push({
      horizon: "production",
      title: "Reconcile X31 UX readiness with browser stack",
      reason: "Executive UX readiness classification does not fully align with browser route coverage.",
      action:
        "Run verify:x31 and verify:x36 together; resolve blockers in entry points, HTML routes, or static hosting signals.",
    });
  }

  const weakChains = input.verificationChain.chains.filter(
    (chain) => chain.executionStatus !== "ready"
  );
  if (weakChains.length > 0) {
    production.push({
      horizon: "production",
      title: "Repair browser verification chains",
      reason: `${weakChains.length} browser verify scripts are missing or incorrectly chained.`,
      action: "Ensure verify:x32 through verify:x36 chain previous verify commands and package.json scripts.",
    });
  }

  return {
    immediate,
    nextLayer,
    production,
    summary: `Browser completeness recommendations: ${immediate.length} immediate, ${nextLayer.length} next-layer, ${production.length} production actions.`,
  };
}

export function computeBrowserCompletenessScore(input: {
  layerAudit: BrowserLayerAudit;
  routeCompleteness: BrowserRouteCompleteness;
  staticAssets: StaticAssetAudit;
  uiPageWiring: UiPageWiringAudit;
  x31Alignment: X31AlignmentView;
  verificationChain: BrowserVerificationChainAudit;
}): BrowserCompletenessScore {
  const layerCoverageWeight = 25;
  const routeCoverageWeight = 25;
  const staticAssetWeight = 15;
  const uiPageWiringWeight = 15;
  const verificationWeight = 10;
  const x31AlignmentWeight = 10;

  const completeLayers = input.layerAudit.layers.filter((layer) => layer.status === "complete").length;
  const layerComponent = clamp(
    Math.round((completeLayers / Math.max(1, input.layerAudit.layers.length)) * 100),
    0,
    100
  );
  const routeComponent = input.routeCompleteness.completenessScore;
  const staticComponent = input.staticAssets.completenessScore;
  const uiComponent = input.uiPageWiring.wiringScore;
  const verificationComponent = clamp(
    Math.round(
      (input.verificationChain.chains.filter((chain) => chain.executionStatus === "ready").length /
        Math.max(1, input.verificationChain.chains.length)) *
        100
    ),
    0,
    100
  );
  const x31Component = input.x31Alignment.alignedWithBrowserStack ? 100 : 55;

  const score = Math.round(
    (layerComponent * layerCoverageWeight +
      routeComponent * routeCoverageWeight +
      staticComponent * staticAssetWeight +
      uiComponent * uiPageWiringWeight +
      verificationComponent * verificationWeight +
      x31Component * x31AlignmentWeight) /
      100
  );

  let status: CompletenessStatus = "attention_required";
  if (score >= 90 && input.routeCompleteness.missingRoutes.length === 0) {
    status = "browser_complete";
  } else if (score >= 65) {
    status = "developing";
  }

  return {
    score: clamp(score, 0, 100),
    status,
    layerCoverageWeight,
    routeCoverageWeight,
    staticAssetWeight,
    uiPageWiringWeight,
    verificationWeight,
    x31AlignmentWeight,
    summary: `Browser experience completeness score ${clamp(score, 0, 100)} (${status.replace(/_/g, " ")}).`,
  };
}

export function buildBrowserCompletenessOverview(input: {
  completenessScore: BrowserCompletenessScore;
  layerAudit: BrowserLayerAudit;
  routeCompleteness: BrowserRouteCompleteness;
  staticAssets: StaticAssetAudit;
  uiPageWiring: UiPageWiringAudit;
  x31Alignment: X31AlignmentView;
}): BrowserCompletenessOverview {
  return {
    headline: "APP13 browser experience completeness center",
    completenessScore: input.completenessScore.score,
    status: input.completenessScore.status,
    browserLayerCount: input.layerAudit.layers.length,
    registeredBrowserRoutes: input.routeCompleteness.registeredRouteCount,
    staticAssetCount: input.staticAssets.assets.filter(
      (asset) => asset.publicFilePresent && asset.routeWired
    ).length,
    uiPagesWired: input.uiPageWiring.wiredPageModules,
    x31BrowserReady: input.x31Alignment.browserReady,
    summary: `Browser completeness overview: score ${input.completenessScore.score}, ${input.routeCompleteness.registeredRouteCount} routes, ${input.uiPageWiring.wiredPageModules} wired UI pages, X31 browser_ready=${input.x31Alignment.browserReady}.`,
  };
}

export function buildBrowserExperienceCompletenessSnapshot(input: {
  raw: BrowserExperienceCompletenessRawSnapshot;
  generatedAt?: Date;
}): BrowserExperienceCompletenessSnapshot {
  const generatedAt = input.generatedAt ?? new Date();
  const uxSnapshot = buildExecutiveUxReadinessSnapshot({ raw: input.raw.uxReadinessRaw, generatedAt });
  const sources = input.raw.sources;

  const layerAudit = buildBrowserLayerAudit(sources);
  const routeCompleteness = buildBrowserRouteCompleteness(sources);
  const staticAssets = buildStaticAssetAudit(sources);
  const uiPageWiring = buildUiPageWiringAudit(sources);
  const x31Alignment = buildX31AlignmentView(uxSnapshot);
  const verificationChain = buildBrowserVerificationChainAudit(sources);
  const completenessScore = computeBrowserCompletenessScore({
    layerAudit,
    routeCompleteness,
    staticAssets,
    uiPageWiring,
    x31Alignment,
    verificationChain,
  });
  const recommendations = buildBrowserCompletenessRecommendations({
    layerAudit,
    routeCompleteness,
    staticAssets,
    uiPageWiring,
    x31Alignment,
    verificationChain,
  });
  const overview = buildBrowserCompletenessOverview({
    completenessScore,
    layerAudit,
    routeCompleteness,
    staticAssets,
    uiPageWiring,
    x31Alignment,
  });

  return {
    overview,
    layerAudit,
    routeCompleteness,
    staticAssets,
    uiPageWiring,
    x31Alignment,
    verificationChain,
    recommendations,
    completenessScore,
    generatedAt,
  };
}

export function buildBrowserExperienceCompletenessCenter(input: {
  snapshot: BrowserExperienceCompletenessSnapshot;
}): BrowserExperienceCompletenessCenter {
  return {
    overview: input.snapshot.overview,
    layerAudit: input.snapshot.layerAudit,
    routeCompleteness: input.snapshot.routeCompleteness,
    staticAssets: input.snapshot.staticAssets,
    uiPageWiring: input.snapshot.uiPageWiring,
    x31Alignment: input.snapshot.x31Alignment,
    verificationChain: input.snapshot.verificationChain,
    recommendations: input.snapshot.recommendations,
    completenessScore: input.snapshot.completenessScore,
    generatedAt: input.snapshot.generatedAt,
  };
}

export function collectBrowserExperienceCompletenessPaths(): string[] {
  return [
    "docs/experience/X36-Browser-Experience-Completeness-Center.md",
    "src/api/routes/browser-experience-completeness.ts",
    "src/experience/browser-experience-completeness/module.ts",
    "test/x36-browser-experience-completeness.test.ts",
    "scripts/verify-x36.sh",
    ".dependency-cruiser.cjs",
  ];
}

export interface BrowserCompletenessOverviewView {
  headline: string;
  completeness_score: number;
  status: CompletenessStatus;
  browser_layer_count: number;
  registered_browser_routes: number;
  static_asset_count: number;
  ui_pages_wired: number;
  x31_browser_ready: boolean;
  summary: string;
}

export interface BrowserLayerAuditEntryView {
  code: string;
  label: string;
  status: BrowserLayerStatus;
  documentation_present: boolean;
  routes_present: boolean;
  tests_present: boolean;
  verification_present: boolean;
  integration_status: BrowserIntegrationStatus;
  registered_routes: string[];
  summary: string;
}

export interface BrowserLayerAuditView {
  layers: BrowserLayerAuditEntryView[];
  summary: string;
}

export interface BrowserRouteCompletenessEntryView {
  path: string;
  layer: string;
  registered: boolean;
  public_auth: boolean;
}

export interface BrowserRouteCompletenessView {
  expected_route_count: number;
  registered_route_count: number;
  missing_routes: string[];
  entries: BrowserRouteCompletenessEntryView[];
  completeness_score: number;
  summary: string;
}

export interface StaticAssetAuditEntryView {
  route_path: string;
  file_name: string;
  public_file_present: boolean;
  route_wired: boolean;
  shell_linked: boolean;
}

export interface StaticAssetAuditView {
  assets: StaticAssetAuditEntryView[];
  completeness_score: number;
  summary: string;
}

export interface UiPageWiringEntryView {
  page_module: string;
  render_function: string;
  wired_to_browser_route: boolean;
}

export interface UiPageWiringAuditView {
  total_page_modules: number;
  wired_page_modules: number;
  unwired_page_modules: string[];
  entries: UiPageWiringEntryView[];
  wiring_score: number;
  summary: string;
}

export interface X31AlignmentViewDto {
  ux_readiness_score: number;
  highest_tier: string;
  browser_ready: boolean;
  surface_kind: string;
  browser_serving_route_count: number;
  present_entry_point_count: number;
  aligned_with_browser_stack: boolean;
  summary: string;
}

export interface BrowserVerificationChainEntryView {
  chain: string;
  exists: boolean;
  chained_correctly: boolean;
  execution_status: VerificationExecutionStatus;
  summary: string;
}

export interface BrowserVerificationChainAuditView {
  chains: BrowserVerificationChainEntryView[];
  summary: string;
}

export interface BrowserCompletenessRecommendationView {
  horizon: RecommendationHorizon;
  title: string;
  reason: string;
  action: string;
}

export interface BrowserCompletenessRecommendationsView {
  immediate: BrowserCompletenessRecommendationView[];
  next_layer: BrowserCompletenessRecommendationView[];
  production: BrowserCompletenessRecommendationView[];
  summary: string;
}

export interface BrowserCompletenessScoreView {
  score: number;
  status: CompletenessStatus;
  layer_coverage_weight: number;
  route_coverage_weight: number;
  static_asset_weight: number;
  ui_page_wiring_weight: number;
  verification_weight: number;
  x31_alignment_weight: number;
  summary: string;
}

export interface BrowserExperienceCompletenessCenterView {
  overview: BrowserCompletenessOverviewView;
  layer_audit: BrowserLayerAuditView;
  route_completeness: BrowserRouteCompletenessView;
  static_assets: StaticAssetAuditView;
  ui_page_wiring: UiPageWiringAuditView;
  x31_alignment: X31AlignmentViewDto;
  verification_chain: BrowserVerificationChainAuditView;
  recommendations: BrowserCompletenessRecommendationsView;
  completeness_score: BrowserCompletenessScoreView;
  generated_at: string;
}

export function toBrowserCompletenessOverviewView(
  overview: BrowserCompletenessOverview
): BrowserCompletenessOverviewView {
  return {
    headline: overview.headline,
    completeness_score: overview.completenessScore,
    status: overview.status,
    browser_layer_count: overview.browserLayerCount,
    registered_browser_routes: overview.registeredBrowserRoutes,
    static_asset_count: overview.staticAssetCount,
    ui_pages_wired: overview.uiPagesWired,
    x31_browser_ready: overview.x31BrowserReady,
    summary: overview.summary,
  };
}

export function toBrowserLayerAuditEntryView(
  entry: BrowserLayerAuditEntry
): BrowserLayerAuditEntryView {
  return {
    code: entry.code,
    label: entry.label,
    status: entry.status,
    documentation_present: entry.documentationPresent,
    routes_present: entry.routesPresent,
    tests_present: entry.testsPresent,
    verification_present: entry.verificationPresent,
    integration_status: entry.integrationStatus,
    registered_routes: entry.registeredRoutes,
    summary: entry.summary,
  };
}

export function toBrowserLayerAuditView(audit: BrowserLayerAudit): BrowserLayerAuditView {
  return {
    layers: audit.layers.map(toBrowserLayerAuditEntryView),
    summary: audit.summary,
  };
}

export function toBrowserRouteCompletenessEntryView(
  entry: BrowserRouteCompletenessEntry
): BrowserRouteCompletenessEntryView {
  return {
    path: entry.path,
    layer: entry.layer,
    registered: entry.registered,
    public_auth: entry.publicAuth,
  };
}

export function toBrowserRouteCompletenessView(
  audit: BrowserRouteCompleteness
): BrowserRouteCompletenessView {
  return {
    expected_route_count: audit.expectedRouteCount,
    registered_route_count: audit.registeredRouteCount,
    missing_routes: audit.missingRoutes,
    entries: audit.entries.map(toBrowserRouteCompletenessEntryView),
    completeness_score: audit.completenessScore,
    summary: audit.summary,
  };
}

export function toStaticAssetAuditEntryView(entry: StaticAssetAuditEntry): StaticAssetAuditEntryView {
  return {
    route_path: entry.routePath,
    file_name: entry.fileName,
    public_file_present: entry.publicFilePresent,
    route_wired: entry.routeWired,
    shell_linked: entry.shellLinked,
  };
}

export function toStaticAssetAuditView(audit: StaticAssetAudit): StaticAssetAuditView {
  return {
    assets: audit.assets.map(toStaticAssetAuditEntryView),
    completeness_score: audit.completenessScore,
    summary: audit.summary,
  };
}

export function toUiPageWiringEntryView(entry: UiPageWiringEntry): UiPageWiringEntryView {
  return {
    page_module: entry.pageModule,
    render_function: entry.renderFunction,
    wired_to_browser_route: entry.wiredToBrowserRoute,
  };
}

export function toUiPageWiringAuditView(audit: UiPageWiringAudit): UiPageWiringAuditView {
  return {
    total_page_modules: audit.totalPageModules,
    wired_page_modules: audit.wiredPageModules,
    unwired_page_modules: audit.unwiredPageModules,
    entries: audit.entries.map(toUiPageWiringEntryView),
    wiring_score: audit.wiringScore,
    summary: audit.summary,
  };
}

export function toX31AlignmentViewDto(alignment: X31AlignmentView): X31AlignmentViewDto {
  return {
    ux_readiness_score: alignment.uxReadinessScore,
    highest_tier: alignment.highestTier,
    browser_ready: alignment.browserReady,
    surface_kind: alignment.surfaceKind,
    browser_serving_route_count: alignment.browserServingRouteCount,
    present_entry_point_count: alignment.presentEntryPointCount,
    aligned_with_browser_stack: alignment.alignedWithBrowserStack,
    summary: alignment.summary,
  };
}

export function toBrowserVerificationChainEntryView(
  entry: BrowserVerificationChainEntry
): BrowserVerificationChainEntryView {
  return {
    chain: entry.chain,
    exists: entry.exists,
    chained_correctly: entry.chainedCorrectly,
    execution_status: entry.executionStatus,
    summary: entry.summary,
  };
}

export function toBrowserVerificationChainAuditView(
  audit: BrowserVerificationChainAudit
): BrowserVerificationChainAuditView {
  return {
    chains: audit.chains.map(toBrowserVerificationChainEntryView),
    summary: audit.summary,
  };
}

export function toBrowserCompletenessRecommendationView(
  recommendation: BrowserCompletenessRecommendation
): BrowserCompletenessRecommendationView {
  return {
    horizon: recommendation.horizon,
    title: recommendation.title,
    reason: recommendation.reason,
    action: recommendation.action,
  };
}

export function toBrowserCompletenessRecommendationsView(
  recommendations: BrowserCompletenessRecommendations
): BrowserCompletenessRecommendationsView {
  return {
    immediate: recommendations.immediate.map(toBrowserCompletenessRecommendationView),
    next_layer: recommendations.nextLayer.map(toBrowserCompletenessRecommendationView),
    production: recommendations.production.map(toBrowserCompletenessRecommendationView),
    summary: recommendations.summary,
  };
}

export function toBrowserCompletenessScoreView(
  score: BrowserCompletenessScore
): BrowserCompletenessScoreView {
  return {
    score: score.score,
    status: score.status,
    layer_coverage_weight: score.layerCoverageWeight,
    route_coverage_weight: score.routeCoverageWeight,
    static_asset_weight: score.staticAssetWeight,
    ui_page_wiring_weight: score.uiPageWiringWeight,
    verification_weight: score.verificationWeight,
    x31_alignment_weight: score.x31AlignmentWeight,
    summary: score.summary,
  };
}

export function toBrowserExperienceCompletenessCenterView(
  center: BrowserExperienceCompletenessCenter
): BrowserExperienceCompletenessCenterView {
  return {
    overview: toBrowserCompletenessOverviewView(center.overview),
    layer_audit: toBrowserLayerAuditView(center.layerAudit),
    route_completeness: toBrowserRouteCompletenessView(center.routeCompleteness),
    static_assets: toStaticAssetAuditView(center.staticAssets),
    ui_page_wiring: toUiPageWiringAuditView(center.uiPageWiring),
    x31_alignment: toX31AlignmentViewDto(center.x31Alignment),
    verification_chain: toBrowserVerificationChainAuditView(center.verificationChain),
    recommendations: toBrowserCompletenessRecommendationsView(center.recommendations),
    completeness_score: toBrowserCompletenessScoreView(center.completenessScore),
    generated_at: center.generatedAt.toISOString(),
  };
}
