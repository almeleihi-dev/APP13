import { BROWSER_SURFACE_ROUTES } from "../../../browser-surface/domain/browser-surface.js";
import {
  buildOperatorSurfaceNavigationSnapshot,
  OPERATOR_JOURNEY_SPECS,
  type OperatorSurfaceNavigationRawSnapshot,
  type OperatorSurfaceNavigationSnapshot,
} from "../../operator-surface-navigation/domain/operator-surface-navigation.js";

export type IntegrityStatus = "integrity_ready" | "developing" | "attention_required";
export type AuthBoundaryKind = "public_html" | "authenticated_json" | "hybrid_conflict";
export type DataModeKind = "fixture" | "live" | "unknown";
export type ParityStatus = "paired" | "partial" | "missing";
export type JourneyIntegrityReadiness = "integrity_ready" | "partial" | "attention_required";
export type RecommendationHorizon = "immediate" | "next_layer" | "production";

export interface OperatorExperienceIntegritySources {
  serverSource: string;
  packageSource: string;
  browserSurfaceRouteSource: string;
  browserSurfaceSources: Record<string, string>;
  experienceRouteSources: Record<string, string>;
  existingPaths: Set<string>;
}

export interface OperatorExperienceIntegrityRawSnapshot {
  navigationRaw: OperatorSurfaceNavigationRawSnapshot;
  sources: OperatorExperienceIntegritySources;
}

export interface WorkflowParitySpec {
  browserPath: string;
  jsonCounterpart: string;
  label: string;
  domain: "contract" | "escrow" | "execution" | "trust" | "dispute" | "marketplace" | "home" | "provider" | "customer";
}

export interface IntegrityOverview {
  headline: string;
  integrityScore: number;
  status: IntegrityStatus;
  publicBrowserRouteCount: number;
  authenticatedJsonCenterCount: number;
  disclosedFixtureRouteCount: number;
  workflowParityCount: number;
  journeyIntegrityReadyCount: number;
  summary: string;
}

export interface AuthBoundaryEntry {
  path: string;
  kind: AuthBoundaryKind;
  browserPublic: boolean;
  jsonAuthRequired: boolean | null;
  jsonCounterpart?: string;
  boundaryClear: boolean;
  rationale: string;
}

export interface AuthBoundaryAudit {
  entries: AuthBoundaryEntry[];
  publicBrowserRoutes: number;
  authenticatedJsonRoutes: number;
  hybridConflicts: string[];
  clarityScore: number;
  summary: string;
}

export interface DataModeEntry {
  browserPath: string;
  dataMode: DataModeKind;
  usesFixtures: boolean;
  disclosurePresent: boolean;
  disclosureSignals: string[];
  rationale: string;
}

export interface DataModeAudit {
  entries: DataModeEntry[];
  fixtureRouteCount: number;
  disclosedRouteCount: number;
  disclosureScore: number;
  summary: string;
}

export interface WorkflowParityEntry {
  browserPath: string;
  jsonCounterpart: string;
  label: string;
  browserRegistered: boolean;
  jsonCounterpartRegistered: boolean;
  jsonAuthRequired: boolean;
  status: ParityStatus;
  summary: string;
}

export interface WorkflowParityAudit {
  entries: WorkflowParityEntry[];
  pairedCount: number;
  parityScore: number;
  summary: string;
}

export interface JourneyIntegrityStep {
  kind: "json_center" | "browser_html";
  target: string;
  label: string;
  integrityReady: boolean;
  rationale: string;
}

export interface JourneyIntegrityEntry {
  code: string;
  label: string;
  purpose: string;
  readiness: JourneyIntegrityReadiness;
  completedSteps: number;
  totalSteps: number;
  steps: JourneyIntegrityStep[];
  summary: string;
}

export interface JourneyIntegrityAudit {
  journeys: JourneyIntegrityEntry[];
  readyCount: number;
  journeyIntegrityScore: number;
  summary: string;
}

export interface XStackIntegrityAlignmentView {
  x31BrowserReady: boolean;
  x36CompletenessStatus: string;
  x36CompletenessScore: number;
  x37NavigationScore: number;
  x37NavigationStatus: string;
  authBoundaryClarity: number;
  dataModeDisclosure: number;
  workflowParity: number;
  stackAligned: boolean;
  summary: string;
}

export interface IntegrityRecommendation {
  horizon: RecommendationHorizon;
  title: string;
  reason: string;
  action: string;
}

export interface IntegrityRecommendations {
  immediate: IntegrityRecommendation[];
  nextLayer: IntegrityRecommendation[];
  production: IntegrityRecommendation[];
  summary: string;
}

export interface IntegrityScore {
  score: number;
  status: IntegrityStatus;
  authBoundaryWeight: number;
  dataModeWeight: number;
  workflowParityWeight: number;
  journeyIntegrityWeight: number;
  stackAlignmentWeight: number;
  summary: string;
}

export interface OperatorExperienceIntegritySnapshot {
  overview: IntegrityOverview;
  authBoundaries: AuthBoundaryAudit;
  dataModes: DataModeAudit;
  workflowParity: WorkflowParityAudit;
  journeyIntegrity: JourneyIntegrityAudit;
  xStackAlignment: XStackIntegrityAlignmentView;
  recommendations: IntegrityRecommendations;
  integrityScore: IntegrityScore;
  generatedAt: Date;
}

export interface OperatorExperienceIntegrityCenter {
  overview: IntegrityOverview;
  authBoundaries: AuthBoundaryAudit;
  dataModes: DataModeAudit;
  workflowParity: WorkflowParityAudit;
  journeyIntegrity: JourneyIntegrityAudit;
  xStackAlignment: XStackIntegrityAlignmentView;
  recommendations: IntegrityRecommendations;
  integrityScore: IntegrityScore;
  generatedAt: Date;
}

export const OPERATOR_EXPERIENCE_INTEGRITY_ROUTES = [
  "/operator-experience-integrity",
  "/operator-experience-integrity/overview",
  "/operator-experience-integrity/auth-boundaries",
  "/operator-experience-integrity/data-modes",
  "/operator-experience-integrity/workflow-parity",
  "/operator-experience-integrity/journey-integrity",
  "/operator-experience-integrity/x-stack-alignment",
  "/operator-experience-integrity/recommendations",
  "/operator-experience-integrity/score",
] as const;

export const WORKFLOW_PARITY_SPECS: WorkflowParitySpec[] = [
  {
    browserPath: "/contracts",
    jsonCounterpart: "/journeys",
    label: "Contract journey",
    domain: "contract",
  },
  {
    browserPath: "/escrow",
    jsonCounterpart: "/escrow-payment",
    label: "Escrow payment experience",
    domain: "escrow",
  },
  {
    browserPath: "/execution/dashboard",
    jsonCounterpart: "/platform-operations",
    label: "Platform operations",
    domain: "execution",
  },
  {
    browserPath: "/trust/center",
    jsonCounterpart: "/trust-experience",
    label: "Trust reputation experience",
    domain: "trust",
  },
  {
    browserPath: "/disputes/dashboard",
    jsonCounterpart: "/disputes",
    label: "Dispute experience",
    domain: "dispute",
  },
  {
    browserPath: "/marketplace",
    jsonCounterpart: "/discovery-matching",
    label: "Discovery matching",
    domain: "marketplace",
  },
  {
    browserPath: "/home",
    jsonCounterpart: "/home",
    label: "Home experience",
    domain: "home",
  },
  {
    browserPath: "/provider",
    jsonCounterpart: "/provider-command-center",
    label: "Provider command center",
    domain: "provider",
  },
  {
    browserPath: "/customer",
    jsonCounterpart: "/customer-command-center",
    label: "Customer command center",
    domain: "customer",
  },
];

const DISCLOSURE_SIGNAL_PATTERNS: Array<{ signal: string; pattern: RegExp }> = [
  { signal: "data-mode-fixture", pattern: /data-mode\s*=\s*["']fixture["']/i },
  { signal: "data-fixture", pattern: /data-fixture/i },
  { signal: "fixture-disclosure", pattern: /fixture disclosure/i },
  { signal: "demo-snapshot", pattern: /demo snapshot/i },
  { signal: "mvp-fixture", pattern: /MVP fixture/i },
  { signal: "synchronous-mvp", pattern: /synchronous MVP/i },
  { signal: "demo-label", pattern: />\s*demo\s*</i },
];

const FIXTURE_SIGNAL_PATTERNS = [/MVP_/, /buildBrowserDemo/, /demoContract/, /demoMarketplace/, /-fixtures\.ts/];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function browserCorpus(sources: OperatorExperienceIntegritySources): string {
  return [sources.browserSurfaceRouteSource, ...Object.values(sources.browserSurfaceSources)].join("\n");
}

function routeBlock(path: string, routeSource: string): string {
  const marker = `app.get("${path}"`;
  const start = routeSource.indexOf(marker);
  if (start === -1) return "";
  return routeSource.slice(start, start + 500);
}

function isPublicBrowserRoute(path: string, routeSource: string): boolean {
  const block = routeBlock(path, routeSource);
  if (!block) return false;
  return /authenticate:\s*false/.test(block) && /authRequired:\s*false/.test(block);
}

function jsonRouteRegistered(counterpart: string, sources: OperatorExperienceIntegritySources): boolean {
  if (sources.serverSource.includes(counterpart)) return true;
  return Object.values(sources.experienceRouteSources).some((content) => content.includes(counterpart));
}

function jsonRouteRequiresAuth(counterpart: string, sources: OperatorExperienceIntegritySources): boolean {
  for (const content of Object.values(sources.experienceRouteSources)) {
    if (!content.includes(counterpart)) continue;
    const index = content.indexOf(counterpart);
    const window = content.slice(Math.max(0, index - 120), index + 120);
    if (/authRequired:\s*true/.test(window)) return true;
  }
  return false;
}

function detectDisclosureSignals(corpus: string): string[] {
  return DISCLOSURE_SIGNAL_PATTERNS.filter(({ pattern }) => pattern.test(corpus)).map(
    ({ signal }) => signal
  );
}

function usesFixtureSignals(corpus: string): boolean {
  return FIXTURE_SIGNAL_PATTERNS.some((pattern) => pattern.test(corpus));
}

export function buildAuthBoundaryAudit(
  sources: OperatorExperienceIntegritySources
): AuthBoundaryAudit {
  const entries: AuthBoundaryEntry[] = BROWSER_SURFACE_ROUTES.map((path) => {
    const browserPublic = isPublicBrowserRoute(path, sources.browserSurfaceRouteSource);
    const parity = WORKFLOW_PARITY_SPECS.find((spec) => spec.browserPath === path);
    const jsonCounterpart = parity?.jsonCounterpart;
    const jsonRegistered = jsonCounterpart ? jsonRouteRegistered(jsonCounterpart, sources) : null;
    const jsonAuthRequired = jsonCounterpart ? jsonRouteRequiresAuth(jsonCounterpart, sources) : null;

    let kind: AuthBoundaryKind = browserPublic ? "public_html" : "authenticated_json";
    let boundaryClear = browserPublic;
    let rationale = browserPublic
      ? "Browser HTML route is public and unauthenticated."
      : "Browser HTML route requires authentication.";

    if (path === "/home" && browserPublic && jsonRouteRequiresAuth("/home", sources)) {
      kind = "hybrid_conflict";
      boundaryClear = false;
      rationale =
        "Shared /home path serves public HTML and authenticated JSON with different trust boundaries.";
    } else if (browserPublic && jsonCounterpart && jsonRegistered && jsonAuthRequired === false) {
      kind = "hybrid_conflict";
      boundaryClear = false;
      rationale = `Public browser route ${path} conflicts with unauthenticated JSON counterpart ${jsonCounterpart}.`;
    } else if (browserPublic && jsonCounterpart && jsonRegistered && jsonAuthRequired) {
      boundaryClear = true;
      rationale = `Public browser route ${path} pairs with authenticated JSON counterpart ${jsonCounterpart}.`;
    }

    return {
      path,
      kind,
      browserPublic,
      jsonAuthRequired,
      jsonCounterpart,
      boundaryClear,
      rationale,
    };
  });

  const publicBrowserRoutes = entries.filter((entry) => entry.browserPublic).length;
  const authenticatedJsonRoutes = WORKFLOW_PARITY_SPECS.filter((spec) =>
    jsonRouteRequiresAuth(spec.jsonCounterpart, sources)
  ).length;
  const hybridConflicts = entries
    .filter((entry) => entry.kind === "hybrid_conflict")
    .map((entry) => entry.path);
  const clarityScore = clamp(
    Math.round(
      (entries.filter((entry) => entry.boundaryClear).length / Math.max(1, entries.length)) * 100
    ),
    0,
    100
  );

  return {
    entries,
    publicBrowserRoutes,
    authenticatedJsonRoutes,
    hybridConflicts,
    clarityScore,
    summary: `Auth boundary audit: ${publicBrowserRoutes} public browser routes, ${authenticatedJsonRoutes} authenticated JSON counterparts, ${hybridConflicts.length} hybrid conflicts, clarity score ${clarityScore}.`,
  };
}

export function buildDataModeAudit(sources: OperatorExperienceIntegritySources): DataModeAudit {
  const corpus = browserCorpus(sources);
  const globalDisclosureSignals = detectDisclosureSignals(corpus);
  const globalFixtures = usesFixtureSignals(corpus);

  const entries: DataModeEntry[] = BROWSER_SURFACE_ROUTES.map((browserPath) => {
    const usesFixtures = globalFixtures;
    const routeDisclosureSignals = detectDisclosureSignals(
      `${corpus}\n${routeBlock(browserPath, sources.browserSurfaceRouteSource)}`
    );
    const disclosureSignals =
      routeDisclosureSignals.length > 0 ? routeDisclosureSignals : globalDisclosureSignals;
    const disclosurePresent = disclosureSignals.length > 0;
    const dataMode: DataModeKind = usesFixtures ? "fixture" : disclosurePresent ? "live" : "unknown";

    return {
      browserPath,
      dataMode,
      usesFixtures,
      disclosurePresent,
      disclosureSignals,
      rationale: usesFixtures
        ? disclosurePresent
          ? "Fixture-based browser route includes disclosure signals."
          : "Fixture-based browser route lacks explicit disclosure markers."
        : "Browser route does not declare fixture usage.",
    };
  });

  const fixtureRouteCount = entries.filter((entry) => entry.usesFixtures).length;
  const disclosedRouteCount = entries.filter((entry) => entry.disclosurePresent).length;
  const disclosureScore = clamp(
    Math.round((disclosedRouteCount / Math.max(1, entries.length)) * 100),
    0,
    100
  );

  return {
    entries,
    fixtureRouteCount,
    disclosedRouteCount,
    disclosureScore,
    summary: `Data mode audit: ${fixtureRouteCount} fixture routes, ${disclosedRouteCount} with disclosure signals, disclosure score ${disclosureScore}.`,
  };
}

export function buildWorkflowParityAudit(
  sources: OperatorExperienceIntegritySources
): WorkflowParityAudit {
  const entries: WorkflowParityEntry[] = WORKFLOW_PARITY_SPECS.map((spec) => {
    const browserRegistered = sources.browserSurfaceRouteSource.includes(
      `app.get("${spec.browserPath}"`
    );
    const jsonCounterpartRegistered = jsonRouteRegistered(spec.jsonCounterpart, sources);
    const jsonAuthRequired = jsonRouteRequiresAuth(spec.jsonCounterpart, sources);

    let status: ParityStatus = "missing";
    if (browserRegistered && jsonCounterpartRegistered && jsonAuthRequired) status = "paired";
    else if (browserRegistered || jsonCounterpartRegistered) status = "partial";

    return {
      browserPath: spec.browserPath,
      jsonCounterpart: spec.jsonCounterpart,
      label: spec.label,
      browserRegistered,
      jsonCounterpartRegistered,
      jsonAuthRequired,
      status,
      summary: `${spec.label}: ${status} (browser=${browserRegistered}, json=${jsonCounterpartRegistered}, json_auth=${jsonAuthRequired}).`,
    };
  });

  const pairedCount = entries.filter((entry) => entry.status === "paired").length;
  const parityScore = clamp(
    Math.round((pairedCount / Math.max(1, entries.length)) * 100),
    0,
    100
  );

  return {
    entries,
    pairedCount,
    parityScore,
    summary: `Workflow parity audit: ${pairedCount}/${entries.length} browser routes paired with authenticated JSON counterparts.`,
  };
}

function stepIntegrityReady(
  step: (typeof OPERATOR_JOURNEY_SPECS)[number]["steps"][number],
  sources: OperatorExperienceIntegritySources,
  dataModes: DataModeAudit
): { ready: boolean; rationale: string } {
  if (step.kind === "json_center") {
    const registered = jsonRouteRegistered(step.target, sources);
    const authRequired = jsonRouteRequiresAuth(step.target, sources);
    const ready = registered && authRequired;
    return {
      ready,
      rationale: ready
        ? "Authenticated JSON center step is registered and protected."
        : "JSON center step is missing or lacks platform_admin auth boundary.",
    };
  }

  const registered = sources.browserSurfaceRouteSource.includes(`app.get("${step.target}"`);
  const entry = dataModes.entries.find((item) => item.browserPath === step.target);
  const ready = registered && (entry?.disclosurePresent === true || entry?.usesFixtures === false);
  return {
    ready,
    rationale: ready
      ? "Browser HTML step is registered with acceptable data-mode disclosure."
      : "Browser HTML step is public fixture content without explicit disclosure markers.",
  };
}

export function buildJourneyIntegrityAudit(input: {
  sources: OperatorExperienceIntegritySources;
  dataModes: DataModeAudit;
}): JourneyIntegrityAudit {
  const journeys = OPERATOR_JOURNEY_SPECS.map((journey) => {
    const steps = journey.steps.map((step) => {
      const result = stepIntegrityReady(step, input.sources, input.dataModes);
      return {
        kind: step.kind,
        target: step.target,
        label: step.label,
        integrityReady: result.ready,
        rationale: result.rationale,
      };
    });

    const completedSteps = steps.filter((step) => step.integrityReady).length;
    let readiness: JourneyIntegrityReadiness = "attention_required";
    if (completedSteps === steps.length) readiness = "integrity_ready";
    else if (completedSteps > 0) readiness = "partial";

    return {
      code: journey.code,
      label: journey.label,
      purpose: journey.purpose,
      readiness,
      completedSteps,
      totalSteps: steps.length,
      steps,
      summary: `${journey.label}: ${readiness.replace(/_/g, " ")} with ${completedSteps}/${steps.length} integrity-ready steps.`,
    };
  });

  const readyCount = journeys.filter((journey) => journey.readiness === "integrity_ready").length;
  const journeyIntegrityScore = clamp(
    Math.round((readyCount / Math.max(1, journeys.length)) * 100),
    0,
    100
  );

  return {
    journeys,
    readyCount,
    journeyIntegrityScore,
    summary: `Journey integrity audit: ${readyCount}/${journeys.length} operator workflows integrity-ready.`,
  };
}

export function buildXStackIntegrityAlignmentView(input: {
  navigationSnapshot: OperatorSurfaceNavigationSnapshot;
  authBoundaries: AuthBoundaryAudit;
  dataModes: DataModeAudit;
  workflowParity: WorkflowParityAudit;
}): XStackIntegrityAlignmentView {
  const stackAligned =
    input.navigationSnapshot.xStackAlignment.x31BrowserReady &&
    input.navigationSnapshot.xStackAlignment.x36Status === "browser_complete" &&
    input.navigationSnapshot.navigationScore.status !== "attention_required" &&
    input.authBoundaries.clarityScore >= 70 &&
    input.workflowParity.parityScore >= 70;

  return {
    x31BrowserReady: input.navigationSnapshot.xStackAlignment.x31BrowserReady,
    x36CompletenessStatus: input.navigationSnapshot.xStackAlignment.x36Status,
    x36CompletenessScore: input.navigationSnapshot.xStackAlignment.x36CompletenessScore,
    x37NavigationScore: input.navigationSnapshot.navigationScore.score,
    x37NavigationStatus: input.navigationSnapshot.navigationScore.status,
    authBoundaryClarity: input.authBoundaries.clarityScore,
    dataModeDisclosure: input.dataModes.disclosureScore,
    workflowParity: input.workflowParity.parityScore,
    stackAligned,
    summary: stackAligned
      ? "X31–X37 stack aligns with hybrid operator integrity expectations."
      : "X31–X37 stack alignment requires stronger auth, disclosure, or workflow parity signals.",
  };
}

export function buildIntegrityRecommendations(input: {
  authBoundaries: AuthBoundaryAudit;
  dataModes: DataModeAudit;
  workflowParity: WorkflowParityAudit;
  journeyIntegrity: JourneyIntegrityAudit;
  xStackAlignment: XStackIntegrityAlignmentView;
}): IntegrityRecommendations {
  const immediate: IntegrityRecommendation[] = [];
  const nextLayer: IntegrityRecommendation[] = [];
  const production: IntegrityRecommendation[] = [];

  if (input.authBoundaries.hybridConflicts.length > 0) {
    immediate.push({
      horizon: "immediate",
      title: "Resolve hybrid auth boundary conflicts",
      reason: `${input.authBoundaries.hybridConflicts.length} browser routes share ambiguous auth boundaries with JSON counterparts.`,
      action:
        "Document or separate public HTML paths from authenticated JSON routes, especially /home and workflow hubs.",
    });
  }

  if (input.dataModes.disclosureScore < 80) {
    immediate.push({
      horizon: "immediate",
      title: "Add fixture disclosure markers to browser HTML",
      reason: `${input.dataModes.fixtureRouteCount} browser routes use fixture data with insufficient disclosure coverage.`,
      action:
        'Add data-mode="fixture" banners or equivalent disclosure text in browser surface HTML adapters.',
    });
  }

  const unpaired = input.workflowParity.entries.filter((entry) => entry.status !== "paired");
  if (unpaired.length > 0) {
    nextLayer.push({
      horizon: "next_layer",
      title: "Complete workflow parity pairs",
      reason: `${unpaired.length} browser workflow routes lack authenticated JSON counterparts.`,
      action:
        "Register or link JSON experience routes for each browser workflow hub so operators can verify authoritative data.",
    });
  }

  if (input.journeyIntegrity.readyCount < input.journeyIntegrity.journeys.length) {
    nextLayer.push({
      horizon: "next_layer",
      title: "Harden operator journey integrity",
      reason: `${input.journeyIntegrity.journeys.length - input.journeyIntegrity.readyCount} operator journeys fail integrity checks.`,
      action:
        "Ensure each X37 journey step ends at an auth-bounded JSON center or a disclosure-marked browser surface.",
    });
  }

  if (!input.xStackAlignment.stackAligned) {
    production.push({
      horizon: "production",
      title: "Reconcile X31–X37 stack before operator onboarding",
      reason: "Navigation readiness exists but hybrid integrity gates are not fully satisfied.",
      action: "Run verify:x31 through verify:x38 and resolve auth, disclosure, and parity blockers.",
    });
  }

  return {
    immediate,
    nextLayer,
    production,
    summary: `Integrity recommendations: ${immediate.length} immediate, ${nextLayer.length} next-layer, ${production.length} production actions.`,
  };
}

export function computeIntegrityScore(input: {
  authBoundaries: AuthBoundaryAudit;
  dataModes: DataModeAudit;
  workflowParity: WorkflowParityAudit;
  journeyIntegrity: JourneyIntegrityAudit;
  xStackAlignment: XStackIntegrityAlignmentView;
}): IntegrityScore {
  const authBoundaryWeight = 25;
  const dataModeWeight = 25;
  const workflowParityWeight = 20;
  const journeyIntegrityWeight = 15;
  const stackAlignmentWeight = 15;

  const authComponent = input.authBoundaries.clarityScore;
  const dataComponent = input.dataModes.disclosureScore;
  const parityComponent = input.workflowParity.parityScore;
  const journeyComponent = input.journeyIntegrity.journeyIntegrityScore;
  const stackComponent = input.xStackAlignment.stackAligned ? 100 : 55;

  const score = Math.round(
    (authComponent * authBoundaryWeight +
      dataComponent * dataModeWeight +
      parityComponent * workflowParityWeight +
      journeyComponent * journeyIntegrityWeight +
      stackComponent * stackAlignmentWeight) /
      100
  );

  let status: IntegrityStatus = "attention_required";
  if (score >= 85 && input.authBoundaries.hybridConflicts.length === 0) {
    status = "integrity_ready";
  } else if (score >= 60) {
    status = "developing";
  }

  return {
    score: clamp(score, 0, 100),
    status,
    authBoundaryWeight,
    dataModeWeight,
    workflowParityWeight,
    journeyIntegrityWeight,
    stackAlignmentWeight,
    summary: `Operator experience integrity score ${clamp(score, 0, 100)} (${status.replace(/_/g, " ")}).`,
  };
}

export function buildIntegrityOverview(input: {
  integrityScore: IntegrityScore;
  authBoundaries: AuthBoundaryAudit;
  dataModes: DataModeAudit;
  workflowParity: WorkflowParityAudit;
  journeyIntegrity: JourneyIntegrityAudit;
}): IntegrityOverview {
  return {
    headline: "APP13 operator experience integrity center",
    integrityScore: input.integrityScore.score,
    status: input.integrityScore.status,
    publicBrowserRouteCount: input.authBoundaries.publicBrowserRoutes,
    authenticatedJsonCenterCount: input.authBoundaries.authenticatedJsonRoutes,
    disclosedFixtureRouteCount: input.dataModes.disclosedRouteCount,
    workflowParityCount: input.workflowParity.pairedCount,
    journeyIntegrityReadyCount: input.journeyIntegrity.readyCount,
    summary: `Integrity overview: score ${input.integrityScore.score}, ${input.authBoundaries.publicBrowserRoutes} public browser routes, ${input.workflowParity.pairedCount} workflow pairs, ${input.journeyIntegrity.readyCount} integrity-ready journeys.`,
  };
}

export function buildOperatorExperienceIntegritySnapshot(input: {
  raw: OperatorExperienceIntegrityRawSnapshot;
  generatedAt?: Date;
}): OperatorExperienceIntegritySnapshot {
  const generatedAt = input.generatedAt ?? new Date();
  const sources = input.raw.sources;
  const navigationSnapshot = buildOperatorSurfaceNavigationSnapshot({
    raw: input.raw.navigationRaw,
    generatedAt,
  });

  const authBoundaries = buildAuthBoundaryAudit(sources);
  const dataModes = buildDataModeAudit(sources);
  const workflowParity = buildWorkflowParityAudit(sources);
  const journeyIntegrity = buildJourneyIntegrityAudit({ sources, dataModes });
  const xStackAlignment = buildXStackIntegrityAlignmentView({
    navigationSnapshot,
    authBoundaries,
    dataModes,
    workflowParity,
  });
  const integrityScore = computeIntegrityScore({
    authBoundaries,
    dataModes,
    workflowParity,
    journeyIntegrity,
    xStackAlignment,
  });
  const recommendations = buildIntegrityRecommendations({
    authBoundaries,
    dataModes,
    workflowParity,
    journeyIntegrity,
    xStackAlignment,
  });
  const overview = buildIntegrityOverview({
    integrityScore,
    authBoundaries,
    dataModes,
    workflowParity,
    journeyIntegrity,
  });

  return {
    overview,
    authBoundaries,
    dataModes,
    workflowParity,
    journeyIntegrity,
    xStackAlignment,
    recommendations,
    integrityScore,
    generatedAt,
  };
}

export function buildOperatorExperienceIntegrityCenter(input: {
  snapshot: OperatorExperienceIntegritySnapshot;
}): OperatorExperienceIntegrityCenter {
  return {
    overview: input.snapshot.overview,
    authBoundaries: input.snapshot.authBoundaries,
    dataModes: input.snapshot.dataModes,
    workflowParity: input.snapshot.workflowParity,
    journeyIntegrity: input.snapshot.journeyIntegrity,
    xStackAlignment: input.snapshot.xStackAlignment,
    recommendations: input.snapshot.recommendations,
    integrityScore: input.snapshot.integrityScore,
    generatedAt: input.snapshot.generatedAt,
  };
}

export function collectOperatorExperienceIntegrityPaths(): string[] {
  return [
    "docs/experience/X38-Operator-Experience-Integrity-Center.md",
    "src/api/routes/operator-experience-integrity.ts",
    "src/experience/operator-experience-integrity/module.ts",
    "test/x38-operator-experience-integrity.test.ts",
    "scripts/verify-x38.sh",
    ".dependency-cruiser.cjs",
  ];
}

export interface IntegrityOverviewView {
  headline: string;
  integrity_score: number;
  status: IntegrityStatus;
  public_browser_route_count: number;
  authenticated_json_center_count: number;
  disclosed_fixture_route_count: number;
  workflow_parity_count: number;
  journey_integrity_ready_count: number;
  summary: string;
}

export interface AuthBoundaryEntryView {
  path: string;
  kind: AuthBoundaryKind;
  browser_public: boolean;
  json_auth_required: boolean | null;
  json_counterpart?: string;
  boundary_clear: boolean;
  rationale: string;
}

export interface AuthBoundaryAuditView {
  entries: AuthBoundaryEntryView[];
  public_browser_routes: number;
  authenticated_json_routes: number;
  hybrid_conflicts: string[];
  clarity_score: number;
  summary: string;
}

export interface DataModeEntryView {
  browser_path: string;
  data_mode: DataModeKind;
  uses_fixtures: boolean;
  disclosure_present: boolean;
  disclosure_signals: string[];
  rationale: string;
}

export interface DataModeAuditView {
  entries: DataModeEntryView[];
  fixture_route_count: number;
  disclosed_route_count: number;
  disclosure_score: number;
  summary: string;
}

export interface WorkflowParityEntryView {
  browser_path: string;
  json_counterpart: string;
  label: string;
  browser_registered: boolean;
  json_counterpart_registered: boolean;
  json_auth_required: boolean;
  status: ParityStatus;
  summary: string;
}

export interface WorkflowParityAuditView {
  entries: WorkflowParityEntryView[];
  paired_count: number;
  parity_score: number;
  summary: string;
}

export interface JourneyIntegrityStepView {
  kind: "json_center" | "browser_html";
  target: string;
  label: string;
  integrity_ready: boolean;
  rationale: string;
}

export interface JourneyIntegrityEntryView {
  code: string;
  label: string;
  purpose: string;
  readiness: JourneyIntegrityReadiness;
  completed_steps: number;
  total_steps: number;
  steps: JourneyIntegrityStepView[];
  summary: string;
}

export interface JourneyIntegrityAuditView {
  journeys: JourneyIntegrityEntryView[];
  ready_count: number;
  journey_integrity_score: number;
  summary: string;
}

export interface XStackIntegrityAlignmentViewDto {
  x31_browser_ready: boolean;
  x36_completeness_status: string;
  x36_completeness_score: number;
  x37_navigation_score: number;
  x37_navigation_status: string;
  auth_boundary_clarity: number;
  data_mode_disclosure: number;
  workflow_parity: number;
  stack_aligned: boolean;
  summary: string;
}

export interface IntegrityRecommendationView {
  horizon: RecommendationHorizon;
  title: string;
  reason: string;
  action: string;
}

export interface IntegrityRecommendationsView {
  immediate: IntegrityRecommendationView[];
  next_layer: IntegrityRecommendationView[];
  production: IntegrityRecommendationView[];
  summary: string;
}

export interface IntegrityScoreView {
  score: number;
  status: IntegrityStatus;
  auth_boundary_weight: number;
  data_mode_weight: number;
  workflow_parity_weight: number;
  journey_integrity_weight: number;
  stack_alignment_weight: number;
  summary: string;
}

export interface OperatorExperienceIntegrityCenterView {
  overview: IntegrityOverviewView;
  auth_boundaries: AuthBoundaryAuditView;
  data_modes: DataModeAuditView;
  workflow_parity: WorkflowParityAuditView;
  journey_integrity: JourneyIntegrityAuditView;
  x_stack_alignment: XStackIntegrityAlignmentViewDto;
  recommendations: IntegrityRecommendationsView;
  integrity_score: IntegrityScoreView;
  generated_at: string;
}

export function toIntegrityOverviewView(overview: IntegrityOverview): IntegrityOverviewView {
  return {
    headline: overview.headline,
    integrity_score: overview.integrityScore,
    status: overview.status,
    public_browser_route_count: overview.publicBrowserRouteCount,
    authenticated_json_center_count: overview.authenticatedJsonCenterCount,
    disclosed_fixture_route_count: overview.disclosedFixtureRouteCount,
    workflow_parity_count: overview.workflowParityCount,
    journey_integrity_ready_count: overview.journeyIntegrityReadyCount,
    summary: overview.summary,
  };
}

export function toAuthBoundaryEntryView(entry: AuthBoundaryEntry): AuthBoundaryEntryView {
  return {
    path: entry.path,
    kind: entry.kind,
    browser_public: entry.browserPublic,
    json_auth_required: entry.jsonAuthRequired,
    json_counterpart: entry.jsonCounterpart,
    boundary_clear: entry.boundaryClear,
    rationale: entry.rationale,
  };
}

export function toAuthBoundaryAuditView(audit: AuthBoundaryAudit): AuthBoundaryAuditView {
  return {
    entries: audit.entries.map(toAuthBoundaryEntryView),
    public_browser_routes: audit.publicBrowserRoutes,
    authenticated_json_routes: audit.authenticatedJsonRoutes,
    hybrid_conflicts: audit.hybridConflicts,
    clarity_score: audit.clarityScore,
    summary: audit.summary,
  };
}

export function toDataModeEntryView(entry: DataModeEntry): DataModeEntryView {
  return {
    browser_path: entry.browserPath,
    data_mode: entry.dataMode,
    uses_fixtures: entry.usesFixtures,
    disclosure_present: entry.disclosurePresent,
    disclosure_signals: entry.disclosureSignals,
    rationale: entry.rationale,
  };
}

export function toDataModeAuditView(audit: DataModeAudit): DataModeAuditView {
  return {
    entries: audit.entries.map(toDataModeEntryView),
    fixture_route_count: audit.fixtureRouteCount,
    disclosed_route_count: audit.disclosedRouteCount,
    disclosure_score: audit.disclosureScore,
    summary: audit.summary,
  };
}

export function toWorkflowParityEntryView(entry: WorkflowParityEntry): WorkflowParityEntryView {
  return {
    browser_path: entry.browserPath,
    json_counterpart: entry.jsonCounterpart,
    label: entry.label,
    browser_registered: entry.browserRegistered,
    json_counterpart_registered: entry.jsonCounterpartRegistered,
    json_auth_required: entry.jsonAuthRequired,
    status: entry.status,
    summary: entry.summary,
  };
}

export function toWorkflowParityAuditView(audit: WorkflowParityAudit): WorkflowParityAuditView {
  return {
    entries: audit.entries.map(toWorkflowParityEntryView),
    paired_count: audit.pairedCount,
    parity_score: audit.parityScore,
    summary: audit.summary,
  };
}

export function toJourneyIntegrityStepView(step: JourneyIntegrityStep): JourneyIntegrityStepView {
  return {
    kind: step.kind,
    target: step.target,
    label: step.label,
    integrity_ready: step.integrityReady,
    rationale: step.rationale,
  };
}

export function toJourneyIntegrityEntryView(entry: JourneyIntegrityEntry): JourneyIntegrityEntryView {
  return {
    code: entry.code,
    label: entry.label,
    purpose: entry.purpose,
    readiness: entry.readiness,
    completed_steps: entry.completedSteps,
    total_steps: entry.totalSteps,
    steps: entry.steps.map(toJourneyIntegrityStepView),
    summary: entry.summary,
  };
}

export function toJourneyIntegrityAuditView(audit: JourneyIntegrityAudit): JourneyIntegrityAuditView {
  return {
    journeys: audit.journeys.map(toJourneyIntegrityEntryView),
    ready_count: audit.readyCount,
    journey_integrity_score: audit.journeyIntegrityScore,
    summary: audit.summary,
  };
}

export function toXStackIntegrityAlignmentViewDto(
  alignment: XStackIntegrityAlignmentView
): XStackIntegrityAlignmentViewDto {
  return {
    x31_browser_ready: alignment.x31BrowserReady,
    x36_completeness_status: alignment.x36CompletenessStatus,
    x36_completeness_score: alignment.x36CompletenessScore,
    x37_navigation_score: alignment.x37NavigationScore,
    x37_navigation_status: alignment.x37NavigationStatus,
    auth_boundary_clarity: alignment.authBoundaryClarity,
    data_mode_disclosure: alignment.dataModeDisclosure,
    workflow_parity: alignment.workflowParity,
    stack_aligned: alignment.stackAligned,
    summary: alignment.summary,
  };
}

export function toIntegrityRecommendationView(
  recommendation: IntegrityRecommendation
): IntegrityRecommendationView {
  return {
    horizon: recommendation.horizon,
    title: recommendation.title,
    reason: recommendation.reason,
    action: recommendation.action,
  };
}

export function toIntegrityRecommendationsView(
  recommendations: IntegrityRecommendations
): IntegrityRecommendationsView {
  return {
    immediate: recommendations.immediate.map(toIntegrityRecommendationView),
    next_layer: recommendations.nextLayer.map(toIntegrityRecommendationView),
    production: recommendations.production.map(toIntegrityRecommendationView),
    summary: recommendations.summary,
  };
}

export function toIntegrityScoreView(score: IntegrityScore): IntegrityScoreView {
  return {
    score: score.score,
    status: score.status,
    auth_boundary_weight: score.authBoundaryWeight,
    data_mode_weight: score.dataModeWeight,
    workflow_parity_weight: score.workflowParityWeight,
    journey_integrity_weight: score.journeyIntegrityWeight,
    stack_alignment_weight: score.stackAlignmentWeight,
    summary: score.summary,
  };
}

export function toOperatorExperienceIntegrityCenterView(
  center: OperatorExperienceIntegrityCenter
): OperatorExperienceIntegrityCenterView {
  return {
    overview: toIntegrityOverviewView(center.overview),
    auth_boundaries: toAuthBoundaryAuditView(center.authBoundaries),
    data_modes: toDataModeAuditView(center.dataModes),
    workflow_parity: toWorkflowParityAuditView(center.workflowParity),
    journey_integrity: toJourneyIntegrityAuditView(center.journeyIntegrity),
    x_stack_alignment: toXStackIntegrityAlignmentViewDto(center.xStackAlignment),
    recommendations: toIntegrityRecommendationsView(center.recommendations),
    integrity_score: toIntegrityScoreView(center.integrityScore),
    generated_at: center.generatedAt.toISOString(),
  };
}
