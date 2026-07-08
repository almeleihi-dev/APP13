import {
  BROWSER_SURFACE_ROUTES,
} from "../../../browser-surface/domain/browser-surface.js";
import {
  buildBrowserExperienceCompletenessSnapshot,
  type BrowserExperienceCompletenessRawSnapshot,
  type BrowserExperienceCompletenessSnapshot,
} from "../../browser-experience-completeness/domain/browser-experience-completeness.js";
import {
  buildExecutiveUxReadinessSnapshot,
  type ExecutiveUxReadinessSnapshot,
} from "../../executive-ux-readiness/domain/executive-ux-readiness.js";

export type SurfaceKind = "json_center" | "browser_html";
export type LinkStatus = "linked" | "orphan" | "partial";
export type JourneyStepKind = "json_center" | "browser_html";
export type JourneyReadiness = "ready" | "partial" | "blocked";
export type NavigationStatus = "navigation_ready" | "developing" | "attention_required";
export type RecommendationHorizon = "immediate" | "next_layer" | "production";

export interface OperatorSurfaceNavigationSources {
  serverSource: string;
  packageSource: string;
  browserSurfaceRouteSource: string;
  browserSurfaceSources: Record<string, string>;
  experienceRouteSources: Record<string, string>;
  existingPaths: Set<string>;
}

export interface OperatorSurfaceNavigationRawSnapshot {
  browserCompletenessRaw: BrowserExperienceCompletenessRawSnapshot;
  sources: OperatorSurfaceNavigationSources;
}

export interface OperatorJsonCenterSpec {
  code: string;
  label: string;
  baseRoute: string;
  category: "ux" | "executive" | "operations" | "readiness" | "intelligence";
  priority: "critical" | "high" | "medium";
}

export interface OperatorBrowserAnchorSpec {
  path: string;
  label: string;
  role: "operator" | "workflow" | "catalog";
}

export interface OperatorJourneyStepSpec {
  kind: JourneyStepKind;
  target: string;
  label: string;
}

export interface OperatorJourneySpec {
  code: string;
  label: string;
  purpose: string;
  steps: OperatorJourneyStepSpec[];
}

export interface OperatorSurfaceNavigationOverview {
  headline: string;
  navigationScore: number;
  status: NavigationStatus;
  jsonCenterCount: number;
  linkedCenterCount: number;
  orphanCenterCount: number;
  browserAnchorCount: number;
  journeyReadyCount: number;
  summary: string;
}

export interface SurfaceMapEntry {
  kind: SurfaceKind;
  path: string;
  label: string;
  layer?: string;
  category?: string;
  reachable: boolean;
}

export interface SurfaceMap {
  entries: SurfaceMapEntry[];
  jsonCenterCount: number;
  browserRouteCount: number;
  summary: string;
}

export interface CrossLinkAuditEntry {
  target: string;
  label: string;
  layer?: string;
  linkedFrom: string[];
  status: LinkStatus;
}

export interface CrossLinkAudit {
  entries: CrossLinkAuditEntry[];
  linkedCount: number;
  orphanCount: number;
  linkCoverageScore: number;
  summary: string;
}

export interface JourneyStepAudit {
  kind: JourneyStepKind;
  target: string;
  label: string;
  reachable: boolean;
}

export interface OperatorJourneyAuditEntry {
  code: string;
  label: string;
  purpose: string;
  readiness: JourneyReadiness;
  completedSteps: number;
  totalSteps: number;
  steps: JourneyStepAudit[];
  summary: string;
}

export interface OperatorJourneyAudit {
  journeys: OperatorJourneyAuditEntry[];
  readyCount: number;
  journeyCompletenessScore: number;
  summary: string;
}

export interface OrphanCenterEntry {
  code: string;
  label: string;
  baseRoute: string;
  category: OperatorJsonCenterSpec["category"];
  priority: OperatorJsonCenterSpec["priority"];
  rationale: string;
}

export interface OrphanCenterAudit {
  orphans: OrphanCenterEntry[];
  linkedCenters: string[];
  orphanScore: number;
  summary: string;
}

export interface XStackAlignmentView {
  x31BrowserReady: boolean;
  x31HighestTier: string;
  x36CompletenessScore: number;
  x36Status: string;
  browserRouteCount: number;
  operatorJsonCenterCount: number;
  crossLinkCoverage: number;
  stackAligned: boolean;
  summary: string;
}

export interface NavigationRecommendation {
  horizon: RecommendationHorizon;
  title: string;
  reason: string;
  action: string;
}

export interface NavigationRecommendations {
  immediate: NavigationRecommendation[];
  nextLayer: NavigationRecommendation[];
  production: NavigationRecommendation[];
  summary: string;
}

export interface NavigationScore {
  score: number;
  status: NavigationStatus;
  crossLinkWeight: number;
  journeyWeight: number;
  orphanWeight: number;
  browserAnchorWeight: number;
  stackAlignmentWeight: number;
  summary: string;
}

export interface OperatorSurfaceNavigationSnapshot {
  overview: OperatorSurfaceNavigationOverview;
  surfaceMap: SurfaceMap;
  crossLinks: CrossLinkAudit;
  journeys: OperatorJourneyAudit;
  orphanCenters: OrphanCenterAudit;
  xStackAlignment: XStackAlignmentView;
  recommendations: NavigationRecommendations;
  navigationScore: NavigationScore;
  generatedAt: Date;
}

export interface OperatorSurfaceNavigationCenter {
  overview: OperatorSurfaceNavigationOverview;
  surfaceMap: SurfaceMap;
  crossLinks: CrossLinkAudit;
  journeys: OperatorJourneyAudit;
  orphanCenters: OrphanCenterAudit;
  xStackAlignment: XStackAlignmentView;
  recommendations: NavigationRecommendations;
  navigationScore: NavigationScore;
  generatedAt: Date;
}

export const OPERATOR_SURFACE_NAVIGATION_ROUTES = [
  "/operator-surface-navigation",
  "/operator-surface-navigation/overview",
  "/operator-surface-navigation/surface-map",
  "/operator-surface-navigation/cross-links",
  "/operator-surface-navigation/journeys",
  "/operator-surface-navigation/orphan-centers",
  "/operator-surface-navigation/x-stack-alignment",
  "/operator-surface-navigation/recommendations",
  "/operator-surface-navigation/score",
] as const;

export const OPERATOR_JSON_CENTER_SPECS: OperatorJsonCenterSpec[] = [
  {
    code: "X36",
    label: "Browser Experience Completeness",
    baseRoute: "/browser-experience-completeness",
    category: "ux",
    priority: "high",
  },
  {
    code: "X31",
    label: "Executive UX Readiness",
    baseRoute: "/executive-ux-readiness",
    category: "ux",
    priority: "critical",
  },
  {
    code: "X30",
    label: "Business Intelligence",
    baseRoute: "/business-intelligence",
    category: "executive",
    priority: "high",
  },
  {
    code: "X29",
    label: "Post-Launch Monitoring",
    baseRoute: "/post-launch-monitoring",
    category: "operations",
    priority: "high",
  },
  {
    code: "X28",
    label: "Launch Control",
    baseRoute: "/launch-control",
    category: "operations",
    priority: "high",
  },
  {
    code: "X27",
    label: "Platform Operations",
    baseRoute: "/platform-operations",
    category: "operations",
    priority: "critical",
  },
  {
    code: "X26",
    label: "Security Readiness",
    baseRoute: "/security-readiness",
    category: "readiness",
    priority: "high",
  },
  {
    code: "X25",
    label: "Production Readiness",
    baseRoute: "/production-readiness",
    category: "readiness",
    priority: "critical",
  },
  {
    code: "X24",
    label: "API Surface Audit",
    baseRoute: "/api-audit",
    category: "readiness",
    priority: "medium",
  },
  {
    code: "X23",
    label: "Architecture Review",
    baseRoute: "/architecture-review",
    category: "readiness",
    priority: "medium",
  },
  {
    code: "X22",
    label: "Executive Experience",
    baseRoute: "/executive-experience",
    category: "executive",
    priority: "high",
  },
  {
    code: "X21",
    label: "Mission Control",
    baseRoute: "/mission-control",
    category: "executive",
    priority: "high",
  },
];

export const OPERATOR_BROWSER_ANCHORS: OperatorBrowserAnchorSpec[] = [
  { path: "/operator/dashboard", label: "Operator Dashboard", role: "operator" },
  { path: "/browse", label: "Browser Catalog", role: "catalog" },
  { path: "/", label: "Platform Home", role: "operator" },
  { path: "/home", label: "Home Hub", role: "workflow" },
  { path: "/contracts", label: "Contracts Hub", role: "workflow" },
  { path: "/execution/dashboard", label: "Execution Dashboard", role: "workflow" },
];

export const OPERATOR_JOURNEY_SPECS: OperatorJourneySpec[] = [
  {
    code: "ux_validation",
    label: "UX validation run",
    purpose: "Validate human-facing readiness from JSON diagnostics through browser catalog.",
    steps: [
      { kind: "json_center", target: "/executive-ux-readiness", label: "Executive UX readiness" },
      {
        kind: "json_center",
        target: "/browser-experience-completeness",
        label: "Browser completeness",
      },
      { kind: "browser_html", target: "/browse", label: "Browser route catalog" },
      { kind: "browser_html", target: "/operator/dashboard", label: "Operator dashboard" },
    ],
  },
  {
    code: "launch_review",
    label: "Launch review run",
    purpose: "Review launch posture, business signals, and operator command surfaces.",
    steps: [
      { kind: "json_center", target: "/launch-control", label: "Launch control" },
      { kind: "json_center", target: "/business-intelligence", label: "Business intelligence" },
      { kind: "json_center", target: "/post-launch-monitoring", label: "Post-launch monitoring" },
      { kind: "browser_html", target: "/operator/dashboard", label: "Operator dashboard" },
    ],
  },
  {
    code: "ops_triage",
    label: "Operations triage run",
    purpose: "Triage live platform activity and drill into workflow browser surfaces.",
    steps: [
      { kind: "json_center", target: "/platform-operations", label: "Platform operations" },
      { kind: "json_center", target: "/post-launch-monitoring", label: "Post-launch monitoring" },
      { kind: "browser_html", target: "/execution/dashboard", label: "Execution dashboard" },
      { kind: "browser_html", target: "/disputes/dashboard", label: "Dispute dashboard" },
    ],
  },
  {
    code: "production_gate",
    label: "Production gate run",
    purpose: "Assess deployment readiness and security posture before release.",
    steps: [
      { kind: "json_center", target: "/production-readiness", label: "Production readiness" },
      { kind: "json_center", target: "/security-readiness", label: "Security readiness" },
      { kind: "json_center", target: "/release-readiness", label: "Release readiness" },
    ],
  },
  {
    code: "executive_briefing",
    label: "Executive briefing run",
    purpose: "Prepare executive narrative from mission control through operator surfaces.",
    steps: [
      { kind: "json_center", target: "/mission-control", label: "Mission control" },
      { kind: "json_center", target: "/executive-experience", label: "Executive experience" },
      { kind: "json_center", target: "/business-intelligence", label: "Business intelligence" },
      { kind: "browser_html", target: "/operator/dashboard", label: "Operator dashboard" },
    ],
  },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function operatorLinkCorpus(sources: OperatorSurfaceNavigationSources): string {
  return [sources.browserSurfaceRouteSource, ...Object.values(sources.browserSurfaceSources)].join(
    "\n"
  );
}

function jsonCenterRegistered(spec: OperatorJsonCenterSpec, sources: OperatorSurfaceNavigationSources): boolean {
  if (sources.serverSource.includes(spec.baseRoute)) return true;
  return Object.values(sources.experienceRouteSources).some((content) =>
    content.includes(spec.baseRoute)
  );
}

function browserRouteRegistered(path: string, sources: OperatorSurfaceNavigationSources): boolean {
  return sources.browserSurfaceRouteSource.includes(`app.get("${path}"`);
}

function findLinkedFrom(target: string, corpus: string, linkSources: string[]): string[] {
  const linkedFrom: string[] = [];
  if (corpus.includes(`href="${target}"`) || corpus.includes(`"${target}"`)) {
    linkedFrom.push("browser-surface");
  }
  for (const source of linkSources) {
    if (source.includes(target)) linkedFrom.push(source);
  }
  return linkedFrom;
}

export function buildSurfaceMap(sources: OperatorSurfaceNavigationSources): SurfaceMap {
  const entries: SurfaceMapEntry[] = [];

  for (const center of OPERATOR_JSON_CENTER_SPECS) {
    entries.push({
      kind: "json_center",
      path: center.baseRoute,
      label: center.label,
      layer: center.code,
      category: center.category,
      reachable: jsonCenterRegistered(center, sources),
    });
  }

  for (const anchor of OPERATOR_BROWSER_ANCHORS) {
    entries.push({
      kind: "browser_html",
      path: anchor.path,
      label: anchor.label,
      category: anchor.role,
      reachable: browserRouteRegistered(anchor.path, sources),
    });
  }

  const jsonCenterCount = entries.filter((entry) => entry.kind === "json_center").length;
  const browserRouteCount = entries.filter((entry) => entry.kind === "browser_html").length;

  return {
    entries,
    jsonCenterCount,
    browserRouteCount,
    summary: `Surface map catalogs ${jsonCenterCount} operator JSON centers and ${browserRouteCount} browser anchor routes.`,
  };
}

export function buildCrossLinkAudit(sources: OperatorSurfaceNavigationSources): CrossLinkAudit {
  const corpus = operatorLinkCorpus(sources);
  const linkSources = [
    ...Object.values(sources.browserSurfaceSources),
  ];

  const entries: CrossLinkAuditEntry[] = OPERATOR_JSON_CENTER_SPECS.map((center) => {
    const linkedFrom = findLinkedFrom(center.baseRoute, corpus, linkSources);
    const registered = jsonCenterRegistered(center, sources);
    let status: LinkStatus = "orphan";
    if (linkedFrom.length > 0 && registered) status = "linked";
    else if (registered) status = "partial";

    return {
      target: center.baseRoute,
      label: center.label,
      layer: center.code,
      linkedFrom,
      status,
    };
  });

  const linkedCount = entries.filter((entry) => entry.status === "linked").length;
  const orphanCount = entries.filter((entry) => entry.status === "orphan").length;
  const linkCoverageScore = clamp(
    Math.round((linkedCount / Math.max(1, entries.length)) * 100),
    0,
    100
  );

  return {
    entries,
    linkedCount,
    orphanCount,
    linkCoverageScore,
    summary: `Cross-link audit: ${linkedCount} linked, ${orphanCount} orphan JSON centers with ${linkCoverageScore}% coverage from browser operator surfaces.`,
  };
}

function auditJourneyStep(
  step: OperatorJourneyStepSpec,
  sources: OperatorSurfaceNavigationSources
): JourneyStepAudit {
  const reachable =
    step.kind === "json_center"
      ? jsonCenterRegistered(
          {
            code: "step",
            label: step.label,
            baseRoute: step.target,
            category: "operations",
            priority: "medium",
          },
          sources
        )
      : browserRouteRegistered(step.target, sources);

  return {
    kind: step.kind,
    target: step.target,
    label: step.label,
    reachable,
  };
}

export function buildOperatorJourneyAudit(
  sources: OperatorSurfaceNavigationSources
): OperatorJourneyAudit {
  const journeys = OPERATOR_JOURNEY_SPECS.map((journey) => {
    const steps = journey.steps.map((step) => auditJourneyStep(step, sources));
    const completedSteps = steps.filter((step) => step.reachable).length;
    let readiness: JourneyReadiness = "blocked";
    if (completedSteps === steps.length) readiness = "ready";
    else if (completedSteps > 0) readiness = "partial";

    return {
      code: journey.code,
      label: journey.label,
      purpose: journey.purpose,
      readiness,
      completedSteps,
      totalSteps: steps.length,
      steps,
      summary: `${journey.label}: ${readiness.replace("_", " ")} with ${completedSteps}/${steps.length} reachable steps.`,
    };
  });

  const readyCount = journeys.filter((journey) => journey.readiness === "ready").length;
  const journeyCompletenessScore = clamp(
    Math.round((readyCount / Math.max(1, journeys.length)) * 100),
    0,
    100
  );

  return {
    journeys,
    readyCount,
    journeyCompletenessScore,
    summary: `Operator journey audit: ${readyCount}/${journeys.length} workflows fully reachable across JSON and browser surfaces.`,
  };
}

export function buildOrphanCenterAudit(crossLinks: CrossLinkAudit): OrphanCenterAudit {
  const orphans: OrphanCenterEntry[] = crossLinks.entries
    .filter((entry) => entry.status !== "linked")
    .map((entry) => {
      const spec = OPERATOR_JSON_CENTER_SPECS.find((center) => center.baseRoute === entry.target);
      return {
        code: spec?.code ?? "unknown",
        label: entry.label,
        baseRoute: entry.target,
        category: spec?.category ?? "operations",
        priority: spec?.priority ?? "medium",
        rationale:
          entry.status === "partial"
            ? "JSON experience center is registered but not cross-linked from browser operator surfaces."
            : "JSON experience center is not registered or linked from browser operator surfaces.",
      };
    });

  const linkedCenters = crossLinks.entries
    .filter((entry) => entry.status === "linked")
    .map((entry) => entry.target);
  const orphanScore = clamp(
    Math.round((linkedCenters.length / Math.max(1, crossLinks.entries.length)) * 100),
    0,
    100
  );

  return {
    orphans,
    linkedCenters,
    orphanScore,
    summary: `Orphan center audit: ${orphans.length} JSON centers lack browser operator cross-links.`,
  };
}

export function buildXStackAlignmentView(input: {
  uxSnapshot: ExecutiveUxReadinessSnapshot;
  browserSnapshot: BrowserExperienceCompletenessSnapshot;
  crossLinks: CrossLinkAudit;
  sources: OperatorSurfaceNavigationSources;
}): XStackAlignmentView {
  const browserRouteCount = BROWSER_SURFACE_ROUTES.filter((path) =>
    browserRouteRegistered(path, input.sources)
  ).length;
  const operatorJsonCenterCount = OPERATOR_JSON_CENTER_SPECS.filter((center) =>
    jsonCenterRegistered(center, input.sources)
  ).length;
  const crossLinkCoverage = input.crossLinks.linkCoverageScore;
  const stackAligned =
    input.uxSnapshot.classification.browserReady.ready &&
    input.browserSnapshot.completenessScore.status === "browser_complete" &&
    crossLinkCoverage >= 25;

  return {
    x31BrowserReady: input.uxSnapshot.classification.browserReady.ready,
    x31HighestTier: input.uxSnapshot.classification.highestAchievedTier,
    x36CompletenessScore: input.browserSnapshot.completenessScore.score,
    x36Status: input.browserSnapshot.completenessScore.status,
    browserRouteCount,
    operatorJsonCenterCount,
    crossLinkCoverage,
    stackAligned,
    summary: stackAligned
      ? "X31–X36 stack is aligned with reachable operator navigation across hybrid surfaces."
      : "X31–X36 stack alignment requires stronger browser-to-JSON operator cross-links.",
  };
}

export function buildNavigationRecommendations(input: {
  crossLinks: CrossLinkAudit;
  journeys: OperatorJourneyAudit;
  orphanCenters: OrphanCenterAudit;
  xStackAlignment: XStackAlignmentView;
}): NavigationRecommendations {
  const immediate: NavigationRecommendation[] = [];
  const nextLayer: NavigationRecommendation[] = [];
  const production: NavigationRecommendation[] = [];

  const criticalOrphans = input.orphanCenters.orphans.filter(
    (center) => center.priority === "critical" || center.priority === "high"
  );
  if (criticalOrphans.length > 0) {
    immediate.push({
      horizon: "immediate",
      title: "Link high-priority JSON centers from operator dashboard",
      reason: `${criticalOrphans.length} critical/high-priority JSON centers are not cross-linked from browser operator surfaces.`,
      action:
        "Extend OPERATOR_EXPERIENCE_LINKS or operator dashboard HTML to surface launch, operations, and UX diagnostic centers.",
    });
  }

  const blockedJourneys = input.journeys.journeys.filter((journey) => journey.readiness !== "ready");
  if (blockedJourneys.length > 0) {
    nextLayer.push({
      horizon: "next_layer",
      title: "Complete operator workflow journeys",
      reason: `${blockedJourneys.length} predefined operator journeys are not fully reachable.`,
      action:
        "Register missing JSON routes or browser HTML anchors referenced by operator journey runbooks.",
    });
  }

  if (input.crossLinks.linkCoverageScore < 50) {
    nextLayer.push({
      horizon: "next_layer",
      title: "Increase browser-to-JSON cross-link coverage",
      reason: `Only ${input.crossLinks.linkCoverageScore}% of operator JSON centers are linked from browser surfaces.`,
      action:
        "Add href cross-links in operator dashboard, browser nav, and hub pages to orphan experience centers.",
    });
  }

  if (!input.xStackAlignment.stackAligned) {
    production.push({
      horizon: "production",
      title: "Reconcile X31–X36 stack with operator navigation",
      reason: "Browser completeness and UX readiness are not fully reflected in operator cross-link coverage.",
      action:
        "Run verify:x31, verify:x36, and verify:x37 together; wire navigation gaps before production operator onboarding.",
    });
  }

  if (input.journeys.readyCount < input.journeys.journeys.length) {
    production.push({
      horizon: "production",
      title: "Publish operator runbooks for hybrid surfaces",
      reason: "Operators need documented JSON + browser journeys for launch, ops triage, and UX validation.",
      action:
        "Use operator-surface-navigation journey audit as the canonical runbook checklist for platform_admin operators.",
    });
  }

  return {
    immediate,
    nextLayer,
    production,
    summary: `Navigation recommendations: ${immediate.length} immediate, ${nextLayer.length} next-layer, ${production.length} production actions.`,
  };
}

export function computeNavigationScore(input: {
  crossLinks: CrossLinkAudit;
  journeys: OperatorJourneyAudit;
  orphanCenters: OrphanCenterAudit;
  sources: OperatorSurfaceNavigationSources;
  xStackAlignment: XStackAlignmentView;
}): NavigationScore {
  const crossLinkWeight = 25;
  const journeyWeight = 25;
  const orphanWeight = 20;
  const browserAnchorWeight = 15;
  const stackAlignmentWeight = 15;

  const crossLinkComponent = input.crossLinks.linkCoverageScore;
  const journeyComponent = input.journeys.journeyCompletenessScore;
  const orphanComponent = input.orphanCenters.orphanScore;
  const reachableAnchors = OPERATOR_BROWSER_ANCHORS.filter((anchor) =>
    browserRouteRegistered(anchor.path, input.sources)
  ).length;
  const browserAnchorComponent = clamp(
    Math.round((reachableAnchors / Math.max(1, OPERATOR_BROWSER_ANCHORS.length)) * 100),
    0,
    100
  );
  const stackComponent = input.xStackAlignment.stackAligned ? 100 : 60;

  const score = Math.round(
    (crossLinkComponent * crossLinkWeight +
      journeyComponent * journeyWeight +
      orphanComponent * orphanWeight +
      browserAnchorComponent * browserAnchorWeight +
      stackComponent * stackAlignmentWeight) /
      100
  );

  let status: NavigationStatus = "attention_required";
  if (score >= 85 && input.journeys.readyCount >= 3) status = "navigation_ready";
  else if (score >= 60) status = "developing";

  return {
    score: clamp(score, 0, 100),
    status,
    crossLinkWeight,
    journeyWeight,
    orphanWeight,
    browserAnchorWeight,
    stackAlignmentWeight,
    summary: `Operator surface navigation score ${clamp(score, 0, 100)} (${status.replace(/_/g, " ")}).`,
  };
}

export function buildOperatorSurfaceNavigationOverview(input: {
  navigationScore: NavigationScore;
  crossLinks: CrossLinkAudit;
  journeys: OperatorJourneyAudit;
  orphanCenters: OrphanCenterAudit;
}): OperatorSurfaceNavigationOverview {
  return {
    headline: "APP13 operator surface navigation center",
    navigationScore: input.navigationScore.score,
    status: input.navigationScore.status,
    jsonCenterCount: OPERATOR_JSON_CENTER_SPECS.length,
    linkedCenterCount: input.crossLinks.linkedCount,
    orphanCenterCount: input.orphanCenters.orphans.length,
    browserAnchorCount: OPERATOR_BROWSER_ANCHORS.length,
    journeyReadyCount: input.journeys.readyCount,
    summary: `Navigation overview: score ${input.navigationScore.score}, ${input.crossLinks.linkedCount} linked JSON centers, ${input.journeys.readyCount} ready journeys, ${input.orphanCenters.orphans.length} orphan centers.`,
  };
}

export function buildOperatorSurfaceNavigationSnapshot(input: {
  raw: OperatorSurfaceNavigationRawSnapshot;
  generatedAt?: Date;
}): OperatorSurfaceNavigationSnapshot {
  const generatedAt = input.generatedAt ?? new Date();
  const sources = input.raw.sources;
  const uxSnapshot = buildExecutiveUxReadinessSnapshot({
    raw: input.raw.browserCompletenessRaw.uxReadinessRaw,
    generatedAt,
  });
  const browserSnapshot = buildBrowserExperienceCompletenessSnapshot({
    raw: input.raw.browserCompletenessRaw,
    generatedAt,
  });

  const surfaceMap = buildSurfaceMap(sources);
  const crossLinks = buildCrossLinkAudit(sources);
  const journeys = buildOperatorJourneyAudit(sources);
  const orphanCenters = buildOrphanCenterAudit(crossLinks);
  const xStackAlignment = buildXStackAlignmentView({
    uxSnapshot,
    browserSnapshot,
    crossLinks,
    sources,
  });
  const navigationScore = computeNavigationScore({
    crossLinks,
    journeys,
    orphanCenters,
    sources,
    xStackAlignment,
  });
  const recommendations = buildNavigationRecommendations({
    crossLinks,
    journeys,
    orphanCenters,
    xStackAlignment,
  });
  const overview = buildOperatorSurfaceNavigationOverview({
    navigationScore,
    crossLinks,
    journeys,
    orphanCenters,
  });

  return {
    overview,
    surfaceMap,
    crossLinks,
    journeys,
    orphanCenters,
    xStackAlignment,
    recommendations,
    navigationScore,
    generatedAt,
  };
}

export function buildOperatorSurfaceNavigationCenter(input: {
  snapshot: OperatorSurfaceNavigationSnapshot;
}): OperatorSurfaceNavigationCenter {
  return {
    overview: input.snapshot.overview,
    surfaceMap: input.snapshot.surfaceMap,
    crossLinks: input.snapshot.crossLinks,
    journeys: input.snapshot.journeys,
    orphanCenters: input.snapshot.orphanCenters,
    xStackAlignment: input.snapshot.xStackAlignment,
    recommendations: input.snapshot.recommendations,
    navigationScore: input.snapshot.navigationScore,
    generatedAt: input.snapshot.generatedAt,
  };
}

export function collectOperatorSurfaceNavigationPaths(): string[] {
  return [
    "docs/experience/X37-Operator-Surface-Navigation-Center.md",
    "src/api/routes/operator-surface-navigation.ts",
    "src/experience/operator-surface-navigation/module.ts",
    "test/x37-operator-surface-navigation.test.ts",
    "scripts/verify-x37.sh",
    ".dependency-cruiser.cjs",
  ];
}

export interface OperatorSurfaceNavigationOverviewView {
  headline: string;
  navigation_score: number;
  status: NavigationStatus;
  json_center_count: number;
  linked_center_count: number;
  orphan_center_count: number;
  browser_anchor_count: number;
  journey_ready_count: number;
  summary: string;
}

export interface SurfaceMapEntryView {
  kind: SurfaceKind;
  path: string;
  label: string;
  layer?: string;
  category?: string;
  reachable: boolean;
}

export interface SurfaceMapView {
  entries: SurfaceMapEntryView[];
  json_center_count: number;
  browser_route_count: number;
  summary: string;
}

export interface CrossLinkAuditEntryView {
  target: string;
  label: string;
  layer?: string;
  linked_from: string[];
  status: LinkStatus;
}

export interface CrossLinkAuditView {
  entries: CrossLinkAuditEntryView[];
  linked_count: number;
  orphan_count: number;
  link_coverage_score: number;
  summary: string;
}

export interface JourneyStepAuditView {
  kind: JourneyStepKind;
  target: string;
  label: string;
  reachable: boolean;
}

export interface OperatorJourneyAuditEntryView {
  code: string;
  label: string;
  purpose: string;
  readiness: JourneyReadiness;
  completed_steps: number;
  total_steps: number;
  steps: JourneyStepAuditView[];
  summary: string;
}

export interface OperatorJourneyAuditView {
  journeys: OperatorJourneyAuditEntryView[];
  ready_count: number;
  journey_completeness_score: number;
  summary: string;
}

export interface OrphanCenterEntryView {
  code: string;
  label: string;
  base_route: string;
  category: OperatorJsonCenterSpec["category"];
  priority: OperatorJsonCenterSpec["priority"];
  rationale: string;
}

export interface OrphanCenterAuditView {
  orphans: OrphanCenterEntryView[];
  linked_centers: string[];
  orphan_score: number;
  summary: string;
}

export interface XStackAlignmentViewDto {
  x31_browser_ready: boolean;
  x31_highest_tier: string;
  x36_completeness_score: number;
  x36_status: string;
  browser_route_count: number;
  operator_json_center_count: number;
  cross_link_coverage: number;
  stack_aligned: boolean;
  summary: string;
}

export interface NavigationRecommendationView {
  horizon: RecommendationHorizon;
  title: string;
  reason: string;
  action: string;
}

export interface NavigationRecommendationsView {
  immediate: NavigationRecommendationView[];
  next_layer: NavigationRecommendationView[];
  production: NavigationRecommendationView[];
  summary: string;
}

export interface NavigationScoreView {
  score: number;
  status: NavigationStatus;
  cross_link_weight: number;
  journey_weight: number;
  orphan_weight: number;
  browser_anchor_weight: number;
  stack_alignment_weight: number;
  summary: string;
}

export interface OperatorSurfaceNavigationCenterView {
  overview: OperatorSurfaceNavigationOverviewView;
  surface_map: SurfaceMapView;
  cross_links: CrossLinkAuditView;
  journeys: OperatorJourneyAuditView;
  orphan_centers: OrphanCenterAuditView;
  x_stack_alignment: XStackAlignmentViewDto;
  recommendations: NavigationRecommendationsView;
  navigation_score: NavigationScoreView;
  generated_at: string;
}

export function toOperatorSurfaceNavigationOverviewView(
  overview: OperatorSurfaceNavigationOverview
): OperatorSurfaceNavigationOverviewView {
  return {
    headline: overview.headline,
    navigation_score: overview.navigationScore,
    status: overview.status,
    json_center_count: overview.jsonCenterCount,
    linked_center_count: overview.linkedCenterCount,
    orphan_center_count: overview.orphanCenterCount,
    browser_anchor_count: overview.browserAnchorCount,
    journey_ready_count: overview.journeyReadyCount,
    summary: overview.summary,
  };
}

export function toSurfaceMapEntryView(entry: SurfaceMapEntry): SurfaceMapEntryView {
  return {
    kind: entry.kind,
    path: entry.path,
    label: entry.label,
    layer: entry.layer,
    category: entry.category,
    reachable: entry.reachable,
  };
}

export function toSurfaceMapView(map: SurfaceMap): SurfaceMapView {
  return {
    entries: map.entries.map(toSurfaceMapEntryView),
    json_center_count: map.jsonCenterCount,
    browser_route_count: map.browserRouteCount,
    summary: map.summary,
  };
}

export function toCrossLinkAuditEntryView(entry: CrossLinkAuditEntry): CrossLinkAuditEntryView {
  return {
    target: entry.target,
    label: entry.label,
    layer: entry.layer,
    linked_from: entry.linkedFrom,
    status: entry.status,
  };
}

export function toCrossLinkAuditView(audit: CrossLinkAudit): CrossLinkAuditView {
  return {
    entries: audit.entries.map(toCrossLinkAuditEntryView),
    linked_count: audit.linkedCount,
    orphan_count: audit.orphanCount,
    link_coverage_score: audit.linkCoverageScore,
    summary: audit.summary,
  };
}

export function toJourneyStepAuditView(step: JourneyStepAudit): JourneyStepAuditView {
  return {
    kind: step.kind,
    target: step.target,
    label: step.label,
    reachable: step.reachable,
  };
}

export function toOperatorJourneyAuditEntryView(
  entry: OperatorJourneyAuditEntry
): OperatorJourneyAuditEntryView {
  return {
    code: entry.code,
    label: entry.label,
    purpose: entry.purpose,
    readiness: entry.readiness,
    completed_steps: entry.completedSteps,
    total_steps: entry.totalSteps,
    steps: entry.steps.map(toJourneyStepAuditView),
    summary: entry.summary,
  };
}

export function toOperatorJourneyAuditView(audit: OperatorJourneyAudit): OperatorJourneyAuditView {
  return {
    journeys: audit.journeys.map(toOperatorJourneyAuditEntryView),
    ready_count: audit.readyCount,
    journey_completeness_score: audit.journeyCompletenessScore,
    summary: audit.summary,
  };
}

export function toOrphanCenterEntryView(entry: OrphanCenterEntry): OrphanCenterEntryView {
  return {
    code: entry.code,
    label: entry.label,
    base_route: entry.baseRoute,
    category: entry.category,
    priority: entry.priority,
    rationale: entry.rationale,
  };
}

export function toOrphanCenterAuditView(audit: OrphanCenterAudit): OrphanCenterAuditView {
  return {
    orphans: audit.orphans.map(toOrphanCenterEntryView),
    linked_centers: audit.linkedCenters,
    orphan_score: audit.orphanScore,
    summary: audit.summary,
  };
}

export function toXStackAlignmentViewDto(alignment: XStackAlignmentView): XStackAlignmentViewDto {
  return {
    x31_browser_ready: alignment.x31BrowserReady,
    x31_highest_tier: alignment.x31HighestTier,
    x36_completeness_score: alignment.x36CompletenessScore,
    x36_status: alignment.x36Status,
    browser_route_count: alignment.browserRouteCount,
    operator_json_center_count: alignment.operatorJsonCenterCount,
    cross_link_coverage: alignment.crossLinkCoverage,
    stack_aligned: alignment.stackAligned,
    summary: alignment.summary,
  };
}

export function toNavigationRecommendationView(
  recommendation: NavigationRecommendation
): NavigationRecommendationView {
  return {
    horizon: recommendation.horizon,
    title: recommendation.title,
    reason: recommendation.reason,
    action: recommendation.action,
  };
}

export function toNavigationRecommendationsView(
  recommendations: NavigationRecommendations
): NavigationRecommendationsView {
  return {
    immediate: recommendations.immediate.map(toNavigationRecommendationView),
    next_layer: recommendations.nextLayer.map(toNavigationRecommendationView),
    production: recommendations.production.map(toNavigationRecommendationView),
    summary: recommendations.summary,
  };
}

export function toNavigationScoreView(score: NavigationScore): NavigationScoreView {
  return {
    score: score.score,
    status: score.status,
    cross_link_weight: score.crossLinkWeight,
    journey_weight: score.journeyWeight,
    orphan_weight: score.orphanWeight,
    browser_anchor_weight: score.browserAnchorWeight,
    stack_alignment_weight: score.stackAlignmentWeight,
    summary: score.summary,
  };
}

export function toOperatorSurfaceNavigationCenterView(
  center: OperatorSurfaceNavigationCenter
): OperatorSurfaceNavigationCenterView {
  return {
    overview: toOperatorSurfaceNavigationOverviewView(center.overview),
    surface_map: toSurfaceMapView(center.surfaceMap),
    cross_links: toCrossLinkAuditView(center.crossLinks),
    journeys: toOperatorJourneyAuditView(center.journeys),
    orphan_centers: toOrphanCenterAuditView(center.orphanCenters),
    x_stack_alignment: toXStackAlignmentViewDto(center.xStackAlignment),
    recommendations: toNavigationRecommendationsView(center.recommendations),
    navigation_score: toNavigationScoreView(center.navigationScore),
    generated_at: center.generatedAt.toISOString(),
  };
}
