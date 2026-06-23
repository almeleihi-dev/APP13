import type { PlatformOperationsSnapshot } from "../../platform-operations/domain/platform-operations.js";
import type { ProductionReadinessSnapshot } from "../../production-readiness/domain/production-readiness.js";
import type {
  LaunchWarning,
  ReleaseReadinessCenterSnapshot,
  LaunchReadinessStatus,
} from "../../release-readiness/domain/release-readiness.js";
import type { SecurityReadinessSnapshot } from "../../security-readiness/domain/security-readiness.js";

export type LaunchDecisionStatus = "GO" | "GO_WITH_WARNINGS" | "NO_GO";
export type LaunchStatus = "ready" | "attention" | "blocked";
export type BlockerSeverity = "critical" | "high" | "medium";
export type WarningCategory = "operational" | "security" | "production" | "release";
export type RecommendationHorizon = "before_launch" | "launch_day" | "first_week";

export interface LaunchControlRawSnapshot {
  release: ReleaseReadinessCenterSnapshot;
  production: ProductionReadinessSnapshot;
  security: SecurityReadinessSnapshot;
  operations: PlatformOperationsSnapshot;
}

export interface LaunchOverview {
  headline: string;
  launchScore: number;
  launchStatus: LaunchStatus;
  launchConfidence: number;
  blockerCount: number;
  warningCount: number;
  summary: string;
}

export interface ReleaseReadinessReview {
  score: number;
  status: LaunchReadinessStatus;
  readyAreas: number;
  blockedAreas: number;
  blockerCount: number;
  warningCount: number;
  summary: string;
}

export interface ProductionReadinessReview {
  score: number;
  launchReadiness: string;
  blockerCount: number;
  warningCount: number;
  summary: string;
}

export interface SecurityReadinessReview {
  score: number;
  riskCount: number;
  criticalRisks: number;
  summary: string;
}

export interface OperationsReadinessReview {
  score: number;
  operationalHealthScore: number;
  riskCount: number;
  summary: string;
}

export interface LaunchBlockerEntry {
  severity: BlockerSeverity;
  category: string;
  message: string;
  mitigation: string;
}

export interface LaunchBlockers {
  critical: LaunchBlockerEntry[];
  high: LaunchBlockerEntry[];
  medium: LaunchBlockerEntry[];
  summary: string;
}

export interface LaunchWarningEntry {
  category: WarningCategory;
  message: string;
  action: string;
}

export interface LaunchWarnings {
  operational: LaunchWarningEntry[];
  security: LaunchWarningEntry[];
  production: LaunchWarningEntry[];
  release: LaunchWarningEntry[];
  summary: string;
}

export interface LaunchChecklistItem {
  section: "infrastructure" | "security" | "operations" | "deployment" | "monitoring";
  label: string;
  ready: boolean;
  summary: string;
}

export interface LaunchChecklist {
  items: LaunchChecklistItem[];
  readyCount: number;
  totalCount: number;
  summary: string;
}

export interface LaunchRecommendation {
  horizon: RecommendationHorizon;
  title: string;
  reason: string;
  action: string;
}

export interface LaunchRecommendations {
  beforeLaunch: LaunchRecommendation[];
  launchDay: LaunchRecommendation[];
  firstWeek: LaunchRecommendation[];
  summary: string;
}

export interface LaunchDecision {
  decision: LaunchDecisionStatus;
  rationale: string;
  summary: string;
}

export interface LaunchConfidenceScore {
  score: number;
  releaseReadinessWeight: number;
  productionReadinessWeight: number;
  securityReadinessWeight: number;
  operationsReadinessWeight: number;
  summary: string;
}

export interface LaunchControlSnapshot {
  overview: LaunchOverview;
  releaseReview: ReleaseReadinessReview;
  productionReview: ProductionReadinessReview;
  securityReview: SecurityReadinessReview;
  operationsReview: OperationsReadinessReview;
  blockers: LaunchBlockers;
  warnings: LaunchWarnings;
  checklist: LaunchChecklist;
  recommendations: LaunchRecommendations;
  decision: LaunchDecision;
  confidenceScore: LaunchConfidenceScore;
  generatedAt: Date;
}

export interface LaunchControlCenter {
  overview: LaunchOverview;
  releaseReview: ReleaseReadinessReview;
  productionReview: ProductionReadinessReview;
  securityReview: SecurityReadinessReview;
  operationsReview: OperationsReadinessReview;
  blockers: LaunchBlockers;
  warnings: LaunchWarnings;
  checklist: LaunchChecklist;
  recommendations: LaunchRecommendations;
  decision: LaunchDecision;
  confidenceScore: LaunchConfidenceScore;
  generatedAt: Date;
}

export const LAUNCH_CONTROL_ROUTES = [
  "/launch-control",
  "/launch-control/overview",
  "/launch-control/release",
  "/launch-control/production",
  "/launch-control/security",
  "/launch-control/operations",
  "/launch-control/blockers",
  "/launch-control/warnings",
  "/launch-control/checklist",
  "/launch-control/recommendations",
  "/launch-control/decision",
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function buildReleaseReadinessReview(
  release: ReleaseReadinessCenterSnapshot
): ReleaseReadinessReview {
  return {
    score: release.score.score,
    status: release.score.status,
    readyAreas: release.score.readyAreas,
    blockedAreas: release.score.blockedAreas,
    blockerCount: release.blockers.length,
    warningCount: release.warnings.length,
    summary: release.score.summary,
  };
}

export function buildProductionReadinessReview(
  production: ProductionReadinessSnapshot
): ProductionReadinessReview {
  return {
    score: production.readinessScore.score,
    launchReadiness: production.overview.launchReadiness,
    blockerCount: production.recommendations.blockers.length,
    warningCount:
      production.recommendations.beforeLaunch.length +
      production.recommendations.afterLaunch.length,
    summary: production.readinessScore.summary,
  };
}

export function buildSecurityReadinessReview(
  security: SecurityReadinessSnapshot
): SecurityReadinessReview {
  return {
    score: security.readinessScore.securityReadinessScore,
    riskCount:
      security.riskRegister.critical.length +
      security.riskRegister.high.length +
      security.riskRegister.medium.length +
      security.riskRegister.low.length,
    criticalRisks: security.riskRegister.critical.length,
    summary: security.readinessScore.summary,
  };
}

export function buildOperationsReadinessReview(
  operations: PlatformOperationsSnapshot
): OperationsReadinessReview {
  return {
    score: operations.operationsScore.score,
    operationalHealthScore: operations.systemHealth.operationalHealthScore,
    riskCount: operations.riskRegister.risks.length,
    summary: operations.operationsScore.summary,
  };
}

export function computeLaunchConfidenceScore(input: {
  release: ReleaseReadinessReview;
  production: ProductionReadinessReview;
  security: SecurityReadinessReview;
  operations: OperationsReadinessReview;
}): LaunchConfidenceScore {
  const releaseReadinessWeight = 25;
  const productionReadinessWeight = 25;
  const securityReadinessWeight = 25;
  const operationsReadinessWeight = 25;

  const score = clamp(
    Math.round(
      input.release.score * (releaseReadinessWeight / 100) +
        input.production.score * (productionReadinessWeight / 100) +
        input.security.score * (securityReadinessWeight / 100) +
        input.operations.score * (operationsReadinessWeight / 100)
    ),
    0,
    100
  );

  return {
    score,
    releaseReadinessWeight,
    productionReadinessWeight,
    securityReadinessWeight,
    operationsReadinessWeight,
    summary: `Launch confidence score ${score} weighted equally across release, production, security, and operations readiness.`,
  };
}

export function buildLaunchBlockers(input: {
  release: ReleaseReadinessCenterSnapshot;
  production: ProductionReadinessSnapshot;
  security: SecurityReadinessSnapshot;
  operations: PlatformOperationsSnapshot;
}): LaunchBlockers {
  const critical: LaunchBlockerEntry[] = [];
  const high: LaunchBlockerEntry[] = [];
  const medium: LaunchBlockerEntry[] = [];

  for (const blocker of input.release.blockers) {
    high.push({
      severity: "high",
      category: "release",
      message: blocker.message,
      mitigation: `Resolve ${blocker.label} in release readiness.`,
    });
  }

  for (const risk of input.production.riskRegister.risks.filter(
    (entry) => entry.severity === "critical" || entry.severity === "high"
  )) {
    const bucket = risk.severity === "critical" ? critical : high;
    bucket.push({
      severity: risk.severity === "critical" ? "critical" : "high",
      category: "production",
      message: risk.message,
      mitigation: risk.mitigation,
    });
  }

  for (const risk of input.security.riskRegister.critical) {
    critical.push({
      severity: "critical",
      category: "security",
      message: risk.message,
      mitigation: risk.mitigation,
    });
  }

  for (const risk of input.security.riskRegister.high) {
    high.push({
      severity: "high",
      category: "security",
      message: risk.message,
      mitigation: risk.mitigation,
    });
  }

  for (const risk of input.operations.riskRegister.risks.filter(
    (entry) => entry.severity === "critical" || entry.severity === "high"
  )) {
    const bucket = risk.severity === "critical" ? critical : high;
    bucket.push({
      severity: risk.severity === "critical" ? "critical" : "high",
      category: "operations",
      message: risk.message,
      mitigation: risk.mitigation,
    });
  }

  for (const risk of input.security.riskRegister.medium.slice(0, 3)) {
    medium.push({
      severity: "medium",
      category: "security",
      message: risk.message,
      mitigation: risk.mitigation,
    });
  }

  return {
    critical,
    high,
    medium,
    summary: `Launch blockers: ${critical.length} critical, ${high.length} high, ${medium.length} medium.`,
  };
}

export function buildLaunchWarnings(input: {
  release: ReleaseReadinessCenterSnapshot;
  production: ProductionReadinessSnapshot;
  security: SecurityReadinessSnapshot;
  operations: PlatformOperationsSnapshot;
}): LaunchWarnings {
  const operational = input.operations.recommendations.immediate.slice(0, 5).map((item) => ({
    category: "operational" as const,
    message: item.title,
    action: item.action,
  }));

  const security = input.security.recommendations.immediate.slice(0, 5).map((item) => ({
    category: "security" as const,
    message: item.title,
    action: item.action,
  }));

  const production = input.production.recommendations.blockers.slice(0, 5).map((item) => ({
    category: "production" as const,
    message: item.title,
    action: item.action,
  }));

  const release = input.release.warnings.slice(0, 5).map((item: LaunchWarning) => ({
    category: "release" as const,
    message: item.message,
    action: `Review ${item.label} readiness area.`,
  }));

  return {
    operational,
    security,
    production,
    release,
    summary: `Launch warnings grouped across operational (${operational.length}), security (${security.length}), production (${production.length}), and release (${release.length}) categories.`,
  };
}

export function buildLaunchChecklist(input: {
  production: ProductionReadinessSnapshot;
  security: SecurityReadinessSnapshot;
  operations: PlatformOperationsSnapshot;
}): LaunchChecklist {
  const items: LaunchChecklistItem[] = [
    {
      section: "infrastructure",
      label: "Environment coverage",
      ready: input.production.environment.environmentCoverageScore >= 75,
      summary: `Environment coverage ${input.production.environment.environmentCoverageScore}%.`,
    },
    {
      section: "infrastructure",
      label: "Database readiness",
      ready: input.production.database.postgresReadiness === "ready",
      summary: `Postgres readiness ${input.production.database.postgresReadiness}.`,
    },
    {
      section: "security",
      label: "Authentication coverage",
      ready: input.security.authentication.jwtCoverage >= 75,
      summary: `JWT coverage ${input.security.authentication.jwtCoverage}%.`,
    },
    {
      section: "security",
      label: "Secrets management",
      ready: input.security.secrets.missingKeys.length === 0,
      summary: `${input.security.secrets.missingKeys.length} missing secret keys.`,
    },
    {
      section: "operations",
      label: "Contract operations",
      ready: input.operations.contracts.disputedContracts === 0,
      summary: `${input.operations.contracts.activeContracts} active contracts.`,
    },
    {
      section: "operations",
      label: "Escrow operations",
      ready: input.operations.escrow.frozenEscrows === 0,
      summary: `${input.operations.escrow.fundedEscrows} funded escrows.`,
    },
    {
      section: "deployment",
      label: "Deployment artifacts",
      ready: input.production.deployment.deploymentArtifacts === "ready",
      summary: `Deployment score ${input.production.deployment.deploymentScore}.`,
    },
    {
      section: "monitoring",
      label: "Observability readiness",
      ready: input.production.monitoring.observabilityScore >= 75,
      summary: `Observability score ${input.production.monitoring.observabilityScore}.`,
    },
  ];

  const readyCount = items.filter((item) => item.ready).length;

  return {
    items,
    readyCount,
    totalCount: items.length,
    summary: `Launch checklist ${readyCount}/${items.length} items ready across infrastructure, security, operations, deployment, and monitoring.`,
  };
}

export function buildLaunchRecommendations(input: {
  decision: LaunchDecision;
  blockers: LaunchBlockers;
  warnings: LaunchWarnings;
  checklist: LaunchChecklist;
}): LaunchRecommendations {
  const beforeLaunch = input.blockers.critical
    .concat(input.blockers.high.slice(0, 3))
    .map((blocker) => ({
      horizon: "before_launch" as const,
      title: blocker.message,
      reason: blocker.category,
      action: blocker.mitigation,
    }));

  if (input.checklist.readyCount < input.checklist.totalCount) {
    beforeLaunch.push({
      horizon: "before_launch",
      title: "Complete launch checklist items",
      reason: "launch checklist",
      action: `Resolve ${input.checklist.totalCount - input.checklist.readyCount} outstanding checklist items.`,
    });
  }

  const launchDay: LaunchRecommendation[] = [];
  if (input.decision.decision === "GO") {
    launchDay.push({
      horizon: "launch_day",
      title: "Execute controlled production launch",
      reason: "launch decision GO",
      action: "Deploy with monitoring dashboards and on-call coverage active.",
    });
  } else if (input.decision.decision === "GO_WITH_WARNINGS") {
    launchDay.push({
      horizon: "launch_day",
      title: "Launch with warning monitoring",
      reason: "launch decision GO_WITH_WARNINGS",
      action: "Proceed with heightened monitoring of warnings and rollback readiness.",
    });
  } else {
    launchDay.push({
      horizon: "launch_day",
      title: "Do not launch until blockers are cleared",
      reason: "launch decision NO_GO",
      action: "Hold launch and resolve critical blockers first.",
    });
  }

  const firstWeek = [
    {
      horizon: "first_week" as const,
      title: "Monitor operational and security signals post launch",
      reason: "operations and security",
      action: "Track platform operations, security risks, and production readiness daily.",
    },
    ...input.warnings.operational.slice(0, 2).map((warning) => ({
      horizon: "first_week" as const,
      title: warning.message,
      reason: "operational warning",
      action: warning.action,
    })),
  ];

  return {
    beforeLaunch,
    launchDay,
    firstWeek,
    summary: `Launch recommendations grouped ${beforeLaunch.length} before launch, ${launchDay.length} launch day, and ${firstWeek.length} first week actions.`,
  };
}

export function buildLaunchDecision(input: {
  confidence: LaunchConfidenceScore;
  blockers: LaunchBlockers;
  release: ReleaseReadinessReview;
}): LaunchDecision {
  const criticalCount = input.blockers.critical.length;
  const highCount = input.blockers.high.length;

  if (
    criticalCount > 0 ||
    input.release.status === "blocked" ||
    input.confidence.score < 55
  ) {
    return {
      decision: "NO_GO",
      rationale: "Critical blockers, blocked release readiness, or confidence below 55.",
      summary: "Launch decision: NO_GO — resolve blockers and raise readiness scores before launch.",
    };
  }

  if (
    input.confidence.score >= 75 &&
    highCount === 0 &&
    input.release.status === "ready"
  ) {
    return {
      decision: "GO",
      rationale: "Confidence at or above 75 with no high-severity blockers and ready release posture.",
      summary: "Launch decision: GO — APP13 is ready for production launch.",
    };
  }

  if (input.confidence.score >= 55 && criticalCount === 0) {
    return {
      decision: "GO_WITH_WARNINGS",
      rationale: "Confidence at or above 55 with no critical blockers but outstanding warnings remain.",
      summary: "Launch decision: GO_WITH_WARNINGS — launch possible with active warning monitoring.",
    };
  }

  return {
    decision: "NO_GO",
    rationale: "Confidence or readiness thresholds not met for launch.",
    summary: "Launch decision: NO_GO — improve readiness scores and clear warnings.",
  };
}

function launchStatusFromDecision(decision: LaunchDecisionStatus): LaunchStatus {
  if (decision === "GO") return "ready";
  if (decision === "GO_WITH_WARNINGS") return "attention";
  return "blocked";
}

export function buildLaunchOverview(input: {
  confidence: LaunchConfidenceScore;
  decision: LaunchDecision;
  blockers: LaunchBlockers;
  warnings: LaunchWarnings;
}): LaunchOverview {
  const blockerCount =
    input.blockers.critical.length + input.blockers.high.length + input.blockers.medium.length;
  const warningCount =
    input.warnings.operational.length +
    input.warnings.security.length +
    input.warnings.production.length +
    input.warnings.release.length;

  return {
    headline: "APP13 launch control center",
    launchScore: input.confidence.score,
    launchStatus: launchStatusFromDecision(input.decision.decision),
    launchConfidence: input.confidence.score,
    blockerCount,
    warningCount,
    summary: `Launch overview: ${input.decision.decision}, confidence ${input.confidence.score}, ${blockerCount} blockers, ${warningCount} warnings.`,
  };
}

export function buildLaunchControlSnapshot(input: {
  raw: LaunchControlRawSnapshot;
  generatedAt?: Date;
}): LaunchControlSnapshot {
  const generatedAt = input.generatedAt ?? new Date();
  const releaseReview = buildReleaseReadinessReview(input.raw.release);
  const productionReview = buildProductionReadinessReview(input.raw.production);
  const securityReview = buildSecurityReadinessReview(input.raw.security);
  const operationsReview = buildOperationsReadinessReview(input.raw.operations);
  const confidenceScore = computeLaunchConfidenceScore({
    release: releaseReview,
    production: productionReview,
    security: securityReview,
    operations: operationsReview,
  });
  const blockers = buildLaunchBlockers(input.raw);
  const warnings = buildLaunchWarnings(input.raw);
  const checklist = buildLaunchChecklist(input.raw);
  const decision = buildLaunchDecision({
    confidence: confidenceScore,
    blockers,
    release: releaseReview,
  });
  const recommendations = buildLaunchRecommendations({
    decision,
    blockers,
    warnings,
    checklist,
  });
  const overview = buildLaunchOverview({
    confidence: confidenceScore,
    decision,
    blockers,
    warnings,
  });

  return {
    overview,
    releaseReview,
    productionReview,
    securityReview,
    operationsReview,
    blockers,
    warnings,
    checklist,
    recommendations,
    decision,
    confidenceScore,
    generatedAt,
  };
}

export function buildLaunchControlCenter(input: {
  snapshot: LaunchControlSnapshot;
}): LaunchControlCenter {
  return {
    overview: input.snapshot.overview,
    releaseReview: input.snapshot.releaseReview,
    productionReview: input.snapshot.productionReview,
    securityReview: input.snapshot.securityReview,
    operationsReview: input.snapshot.operationsReview,
    blockers: input.snapshot.blockers,
    warnings: input.snapshot.warnings,
    checklist: input.snapshot.checklist,
    recommendations: input.snapshot.recommendations,
    decision: input.snapshot.decision,
    confidenceScore: input.snapshot.confidenceScore,
    generatedAt: input.snapshot.generatedAt,
  };
}

export interface LaunchOverviewView {
  headline: string;
  launch_score: number;
  launch_status: LaunchStatus;
  launch_confidence: number;
  blocker_count: number;
  warning_count: number;
  summary: string;
}

export interface ReleaseReadinessReviewView {
  score: number;
  status: LaunchReadinessStatus;
  ready_areas: number;
  blocked_areas: number;
  blocker_count: number;
  warning_count: number;
  summary: string;
}

export interface ProductionReadinessReviewView {
  score: number;
  launch_readiness: string;
  blocker_count: number;
  warning_count: number;
  summary: string;
}

export interface SecurityReadinessReviewView {
  score: number;
  risk_count: number;
  critical_risks: number;
  summary: string;
}

export interface OperationsReadinessReviewView {
  score: number;
  operational_health_score: number;
  risk_count: number;
  summary: string;
}

export interface LaunchBlockerEntryView {
  severity: BlockerSeverity;
  category: string;
  message: string;
  mitigation: string;
}

export interface LaunchBlockersView {
  critical: LaunchBlockerEntryView[];
  high: LaunchBlockerEntryView[];
  medium: LaunchBlockerEntryView[];
  summary: string;
}

export interface LaunchWarningEntryView {
  category: WarningCategory;
  message: string;
  action: string;
}

export interface LaunchWarningsView {
  operational: LaunchWarningEntryView[];
  security: LaunchWarningEntryView[];
  production: LaunchWarningEntryView[];
  release: LaunchWarningEntryView[];
  summary: string;
}

export interface LaunchChecklistItemView {
  section: LaunchChecklistItem["section"];
  label: string;
  ready: boolean;
  summary: string;
}

export interface LaunchChecklistView {
  items: LaunchChecklistItemView[];
  ready_count: number;
  total_count: number;
  summary: string;
}

export interface LaunchRecommendationView {
  horizon: RecommendationHorizon;
  title: string;
  reason: string;
  action: string;
}

export interface LaunchRecommendationsView {
  before_launch: LaunchRecommendationView[];
  launch_day: LaunchRecommendationView[];
  first_week: LaunchRecommendationView[];
  summary: string;
}

export interface LaunchDecisionView {
  decision: LaunchDecisionStatus;
  rationale: string;
  summary: string;
}

export interface LaunchConfidenceScoreView {
  score: number;
  release_readiness_weight: number;
  production_readiness_weight: number;
  security_readiness_weight: number;
  operations_readiness_weight: number;
  summary: string;
}

export interface LaunchControlCenterView {
  overview: LaunchOverviewView;
  release_review: ReleaseReadinessReviewView;
  production_review: ProductionReadinessReviewView;
  security_review: SecurityReadinessReviewView;
  operations_review: OperationsReadinessReviewView;
  blockers: LaunchBlockersView;
  warnings: LaunchWarningsView;
  checklist: LaunchChecklistView;
  recommendations: LaunchRecommendationsView;
  decision: LaunchDecisionView;
  confidence_score: LaunchConfidenceScoreView;
  generated_at: string;
}

export function toLaunchOverviewView(overview: LaunchOverview): LaunchOverviewView {
  return {
    headline: overview.headline,
    launch_score: overview.launchScore,
    launch_status: overview.launchStatus,
    launch_confidence: overview.launchConfidence,
    blocker_count: overview.blockerCount,
    warning_count: overview.warningCount,
    summary: overview.summary,
  };
}

export function toReleaseReadinessReviewView(
  review: ReleaseReadinessReview
): ReleaseReadinessReviewView {
  return {
    score: review.score,
    status: review.status,
    ready_areas: review.readyAreas,
    blocked_areas: review.blockedAreas,
    blocker_count: review.blockerCount,
    warning_count: review.warningCount,
    summary: review.summary,
  };
}

export function toProductionReadinessReviewView(
  review: ProductionReadinessReview
): ProductionReadinessReviewView {
  return {
    score: review.score,
    launch_readiness: review.launchReadiness,
    blocker_count: review.blockerCount,
    warning_count: review.warningCount,
    summary: review.summary,
  };
}

export function toSecurityReadinessReviewView(
  review: SecurityReadinessReview
): SecurityReadinessReviewView {
  return {
    score: review.score,
    risk_count: review.riskCount,
    critical_risks: review.criticalRisks,
    summary: review.summary,
  };
}

export function toOperationsReadinessReviewView(
  review: OperationsReadinessReview
): OperationsReadinessReviewView {
  return {
    score: review.score,
    operational_health_score: review.operationalHealthScore,
    risk_count: review.riskCount,
    summary: review.summary,
  };
}

export function toLaunchBlockerEntryView(entry: LaunchBlockerEntry): LaunchBlockerEntryView {
  return {
    severity: entry.severity,
    category: entry.category,
    message: entry.message,
    mitigation: entry.mitigation,
  };
}

export function toLaunchBlockersView(blockers: LaunchBlockers): LaunchBlockersView {
  return {
    critical: blockers.critical.map(toLaunchBlockerEntryView),
    high: blockers.high.map(toLaunchBlockerEntryView),
    medium: blockers.medium.map(toLaunchBlockerEntryView),
    summary: blockers.summary,
  };
}

export function toLaunchWarningEntryView(entry: LaunchWarningEntry): LaunchWarningEntryView {
  return {
    category: entry.category,
    message: entry.message,
    action: entry.action,
  };
}

export function toLaunchWarningsView(warnings: LaunchWarnings): LaunchWarningsView {
  return {
    operational: warnings.operational.map(toLaunchWarningEntryView),
    security: warnings.security.map(toLaunchWarningEntryView),
    production: warnings.production.map(toLaunchWarningEntryView),
    release: warnings.release.map(toLaunchWarningEntryView),
    summary: warnings.summary,
  };
}

export function toLaunchChecklistItemView(item: LaunchChecklistItem): LaunchChecklistItemView {
  return {
    section: item.section,
    label: item.label,
    ready: item.ready,
    summary: item.summary,
  };
}

export function toLaunchChecklistView(checklist: LaunchChecklist): LaunchChecklistView {
  return {
    items: checklist.items.map(toLaunchChecklistItemView),
    ready_count: checklist.readyCount,
    total_count: checklist.totalCount,
    summary: checklist.summary,
  };
}

export function toLaunchRecommendationView(
  recommendation: LaunchRecommendation
): LaunchRecommendationView {
  return {
    horizon: recommendation.horizon,
    title: recommendation.title,
    reason: recommendation.reason,
    action: recommendation.action,
  };
}

export function toLaunchRecommendationsView(
  recommendations: LaunchRecommendations
): LaunchRecommendationsView {
  return {
    before_launch: recommendations.beforeLaunch.map(toLaunchRecommendationView),
    launch_day: recommendations.launchDay.map(toLaunchRecommendationView),
    first_week: recommendations.firstWeek.map(toLaunchRecommendationView),
    summary: recommendations.summary,
  };
}

export function toLaunchDecisionView(decision: LaunchDecision): LaunchDecisionView {
  return {
    decision: decision.decision,
    rationale: decision.rationale,
    summary: decision.summary,
  };
}

export function toLaunchConfidenceScoreView(
  score: LaunchConfidenceScore
): LaunchConfidenceScoreView {
  return {
    score: score.score,
    release_readiness_weight: score.releaseReadinessWeight,
    production_readiness_weight: score.productionReadinessWeight,
    security_readiness_weight: score.securityReadinessWeight,
    operations_readiness_weight: score.operationsReadinessWeight,
    summary: score.summary,
  };
}

export function toLaunchControlCenterView(center: LaunchControlCenter): LaunchControlCenterView {
  return {
    overview: toLaunchOverviewView(center.overview),
    release_review: toReleaseReadinessReviewView(center.releaseReview),
    production_review: toProductionReadinessReviewView(center.productionReview),
    security_review: toSecurityReadinessReviewView(center.securityReview),
    operations_review: toOperationsReadinessReviewView(center.operationsReview),
    blockers: toLaunchBlockersView(center.blockers),
    warnings: toLaunchWarningsView(center.warnings),
    checklist: toLaunchChecklistView(center.checklist),
    recommendations: toLaunchRecommendationsView(center.recommendations),
    decision: toLaunchDecisionView(center.decision),
    confidence_score: toLaunchConfidenceScoreView(center.confidenceScore),
    generated_at: center.generatedAt.toISOString(),
  };
}
