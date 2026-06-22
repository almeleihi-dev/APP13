import { scoreChecks } from "../../../release/domain/release-readiness.js";

export type ReadinessCheckStatus = "pass" | "warn" | "fail";

export type ReadinessAreaStatus = "ready" | "attention" | "blocked";

export type LaunchReadinessStatus = "ready" | "attention" | "blocked";

export type ReadinessAreaCode =
  | "core_lifecycle"
  | "contracts"
  | "escrow"
  | "execution"
  | "evidence"
  | "issues_disputes"
  | "trust"
  | "matching"
  | "professional_passport"
  | "live_trust_frame"
  | "provider_command_center"
  | "customer_command_center"
  | "platform_control_tower"
  | "security_auth"
  | "tests_verification"
  | "documentation";

export type ProbeSource = "index" | "server" | "package" | "path";

export interface ReadinessProbeSpec {
  id: string;
  name?: string;
  source: ProbeSource;
  target: string;
  blocking?: boolean;
}

export interface ReadinessAreaSpec {
  areaCode: ReadinessAreaCode;
  label: string;
  probes: ReadinessProbeSpec[];
}

export interface ReadinessProbeResult {
  id: string;
  name: string;
  status: ReadinessCheckStatus;
  message: string;
  blocking: boolean;
}

export interface ReadinessArea {
  areaCode: ReadinessAreaCode;
  label: string;
  status: ReadinessAreaStatus;
  score: number;
  checks: ReadinessProbeResult[];
  summary: string;
}

export interface LaunchReadinessScore {
  score: number;
  status: LaunchReadinessStatus;
  readyAreas: number;
  attentionAreas: number;
  blockedAreas: number;
  summary: string;
}

export interface LaunchBlocker {
  code: string;
  areaCode: ReadinessAreaCode;
  label: string;
  message: string;
}

export interface LaunchWarning {
  code: string;
  areaCode: ReadinessAreaCode;
  label: string;
  message: string;
}

export interface LaunchStrength {
  areaCode: ReadinessAreaCode;
  label: string;
  score: number;
  summary: string;
}

export interface RecommendedAction {
  priority: "critical" | "high" | "medium";
  action: string;
  rationale: string;
}

export interface ReleaseReadinessCenterSnapshot {
  areas: ReadinessArea[];
  score: LaunchReadinessScore;
  blockers: LaunchBlocker[];
  warnings: LaunchWarning[];
  strengths: LaunchStrength[];
  actions: RecommendedAction[];
  generatedAt: Date;
}

export interface ReleaseReadinessCenter {
  score: LaunchReadinessScore;
  areas: ReadinessArea[];
  blockers: LaunchBlocker[];
  warnings: LaunchWarning[];
  strengths: LaunchStrength[];
  actions: RecommendedAction[];
  generatedAt: Date;
}

export interface ReadinessSources {
  indexSource: string;
  serverSource: string;
  packageSource: string;
  existingPaths: Set<string>;
}

export interface ReadinessProbeResultView {
  id: string;
  name: string;
  status: ReadinessCheckStatus;
  message: string;
  blocking: boolean;
}

export interface ReadinessAreaView {
  area_code: ReadinessAreaCode;
  label: string;
  status: ReadinessAreaStatus;
  score: number;
  checks: ReadinessProbeResultView[];
  summary: string;
}

export interface LaunchReadinessScoreView {
  score: number;
  status: LaunchReadinessStatus;
  ready_areas: number;
  attention_areas: number;
  blocked_areas: number;
  summary: string;
}

export interface LaunchBlockerView {
  code: string;
  area_code: ReadinessAreaCode;
  label: string;
  message: string;
}

export interface LaunchWarningView {
  code: string;
  area_code: ReadinessAreaCode;
  label: string;
  message: string;
}

export interface LaunchStrengthView {
  area_code: ReadinessAreaCode;
  label: string;
  score: number;
  summary: string;
}

export interface RecommendedActionView {
  priority: "critical" | "high" | "medium";
  action: string;
  rationale: string;
}

export interface ReleaseReadinessCenterView {
  score: LaunchReadinessScoreView;
  areas: ReadinessAreaView[];
  blockers: LaunchBlockerView[];
  warnings: LaunchWarningView[];
  strengths: LaunchStrengthView[];
  actions: RecommendedActionView[];
  generated_at: string;
}

export const LAUNCH_READINESS_AREA_SPECS: ReadinessAreaSpec[] = [
  {
    areaCode: "core_lifecycle",
    label: "Core lifecycle",
    probes: [
      { id: "home-module", source: "index", target: "createHomeExperienceModule", blocking: true },
      { id: "home-routes", source: "server", target: "registerHomeRoutes", blocking: true },
      { id: "notifications-module", source: "index", target: "createNotificationsModule", blocking: true },
      { id: "notification-routes", source: "server", target: "registerNotificationRoutes", blocking: true },
      { id: "home-doc", source: "path", target: "docs/experience/X1-Unified-Home-Experience.md" },
    ],
  },
  {
    areaCode: "contracts",
    label: "Contracts",
    probes: [
      { id: "contract-engine", source: "index", target: "createContractEngineService", blocking: true },
      { id: "contract-routes", source: "server", target: "registerContractRoutes", blocking: true },
      { id: "contract-journey-module", source: "index", target: "createContractJourneyModule", blocking: true },
      { id: "contract-journey-routes", source: "server", target: "registerContractJourneyRoutes", blocking: true },
      { id: "contract-journey-doc", source: "path", target: "docs/experience/X3-Contract-Journey-Experience.md" },
    ],
  },
  {
    areaCode: "escrow",
    label: "Escrow",
    probes: [
      { id: "escrow-service", source: "index", target: "createEscrowService", blocking: true },
      { id: "escrow-payment-module", source: "index", target: "createEscrowPaymentExperienceModule", blocking: true },
      { id: "escrow-payment-routes", source: "server", target: "registerEscrowPaymentRoutes", blocking: true },
      { id: "escrow-doc", source: "path", target: "docs/experience/X6-Escrow-Payment-Experience.md" },
    ],
  },
  {
    areaCode: "execution",
    label: "Execution",
    probes: [
      { id: "execution-service", source: "index", target: "createExecutionService", blocking: true },
      { id: "execution-routes", source: "server", target: "registerEvidenceRoutes", blocking: true },
      { id: "execution-experience", source: "server", target: "registerExecutionExperienceRoutes" },
    ],
  },
  {
    areaCode: "evidence",
    label: "Evidence",
    probes: [
      { id: "evidence-write-routes", source: "server", target: "registerEvidenceRoutes", blocking: true },
      { id: "evidence-read-routes", source: "server", target: "registerEvidenceReadRoutes", blocking: true },
    ],
  },
  {
    areaCode: "issues_disputes",
    label: "Issues / disputes",
    probes: [
      { id: "issue-service", source: "index", target: "createIssueService", blocking: true },
      { id: "issue-routes", source: "server", target: "registerIssueRoutes", blocking: true },
      { id: "disputes-read-routes", source: "server", target: "registerDisputesReadRoutes", blocking: true },
    ],
  },
  {
    areaCode: "trust",
    label: "Trust",
    probes: [
      { id: "trust-module", source: "index", target: "createTrustModule", blocking: true },
      { id: "trust-reputation-module", source: "index", target: "createTrustReputationExperienceModule", blocking: true },
      { id: "trust-reputation-routes", source: "server", target: "registerTrustReputationExperienceRoutes", blocking: true },
      { id: "trust-doc", source: "path", target: "docs/experience/X7-Trust-Reputation-Experience.md" },
    ],
  },
  {
    areaCode: "matching",
    label: "Matching",
    probes: [
      { id: "conversion-module", source: "index", target: "createConversionModule", blocking: true },
      { id: "conversion-routes", source: "server", target: "registerConversionRoutes", blocking: true },
      { id: "discovery-matching-module", source: "index", target: "createDiscoveryMatchingModule", blocking: true },
      { id: "discovery-matching-routes", source: "server", target: "registerDiscoveryMatchingRoutes", blocking: true },
      { id: "matching-doc", source: "path", target: "docs/experience/X8-Discovery-Matching-Experience.md" },
    ],
  },
  {
    areaCode: "professional_passport",
    label: "Professional passport",
    probes: [
      { id: "passport-module", source: "index", target: "createProfessionalPassportModule", blocking: true },
      { id: "passport-routes", source: "server", target: "registerProfessionalPassportRoutes", blocking: true },
      { id: "seals-module", source: "index", target: "createProfessionalSealsModule" },
      { id: "passport-doc", source: "path", target: "docs/experience/X9-Professional-Passport-Experience.md" },
    ],
  },
  {
    areaCode: "live_trust_frame",
    label: "Live trust frame",
    probes: [
      { id: "live-frame-module", source: "index", target: "createLiveFrameExperienceModule", blocking: true },
      { id: "live-frame-routes", source: "server", target: "registerLiveFrameRoutes", blocking: true },
      { id: "live-trust-frame-module", source: "index", target: "createLiveTrustFrameModule", blocking: true },
      { id: "live-trust-frame-routes", source: "server", target: "registerLiveTrustFrameRoutes", blocking: true },
      { id: "live-trust-frame-doc", source: "path", target: "docs/experience/X10-Live-Trust-Frame-Experience.md" },
    ],
  },
  {
    areaCode: "provider_command_center",
    label: "Provider command center",
    probes: [
      { id: "provider-command-center-module", source: "index", target: "createProviderCommandCenterModule", blocking: true },
      { id: "provider-command-center-routes", source: "server", target: "registerProviderCommandCenterRoutes", blocking: true },
      { id: "provider-command-center-doc", source: "path", target: "docs/experience/X11-Provider-Command-Center.md" },
      { id: "verify-x11", source: "package", target: "verify:x11" },
    ],
  },
  {
    areaCode: "customer_command_center",
    label: "Customer command center",
    probes: [
      { id: "customer-command-center-module", source: "index", target: "createCustomerCommandCenterModule", blocking: true },
      { id: "customer-command-center-routes", source: "server", target: "registerCustomerCommandCenterRoutes", blocking: true },
      { id: "customer-command-center-doc", source: "path", target: "docs/experience/X12-Customer-Command-Center.md" },
      { id: "verify-x12", source: "package", target: "verify:x12" },
    ],
  },
  {
    areaCode: "platform_control_tower",
    label: "Platform control tower",
    probes: [
      { id: "platform-control-tower-module", source: "index", target: "createPlatformControlTowerModule", blocking: true },
      { id: "platform-control-tower-routes", source: "server", target: "registerPlatformControlTowerRoutes", blocking: true },
      { id: "platform-control-tower-doc", source: "path", target: "docs/experience/X13-Platform-Control-Tower.md" },
      { id: "verify-x13", source: "package", target: "verify:x13" },
    ],
  },
  {
    areaCode: "security_auth",
    label: "Security / auth",
    probes: [
      { id: "security-auth-routes", source: "server", target: "registerSecurityAuthRoutes", blocking: true },
      { id: "auth-middleware", source: "server", target: "requireAuthMiddleware", blocking: true },
      { id: "authenticate-middleware", source: "server", target: "createAuthenticateMiddleware", blocking: true },
      { id: "admin-console-routes", source: "server", target: "registerAdminConsoleRoutes" },
    ],
  },
  {
    areaCode: "tests_verification",
    label: "Tests / verification",
    probes: [
      { id: "build-script", source: "package", target: '"build"', blocking: true },
      { id: "import-lint", source: "package", target: "lint:imports", blocking: true },
      { id: "dependency-cruiser", source: "path", target: ".dependency-cruiser.cjs", blocking: true },
      { id: "release-readiness-module", source: "index", target: "createReleaseReadinessCenterModule", blocking: true },
      { id: "release-readiness-routes", source: "server", target: "registerReleaseReadinessRoutes", blocking: true },
      { id: "verify-x15", source: "package", target: "verify:x15" },
    ],
  },
  {
    areaCode: "documentation",
    label: "Documentation",
    probes: [
      { id: "rc1-readiness-report", source: "path", target: "docs/release/RC1-Readiness-Report.md" },
      { id: "rc1-architecture-summary", source: "path", target: "docs/release/RC1-Architecture-Summary.md" },
      { id: "rc1-operational-checklist", source: "path", target: "docs/release/RC1-Operational-Checklist.md" },
      { id: "x15-doc", source: "path", target: "docs/experience/X15-Release-Readiness-Center.md" },
    ],
  },
];

function sourceContent(sources: ReadinessSources, probeSource: ProbeSource): string {
  switch (probeSource) {
    case "index":
      return sources.indexSource;
    case "server":
      return sources.serverSource;
    case "package":
      return sources.packageSource;
    default:
      return "";
  }
}

export function evaluateReadinessProbe(
  sources: ReadinessSources,
  probe: ReadinessProbeSpec
): ReadinessProbeResult {
  const blocking = probe.blocking ?? false;
  const name =
    probe.name ??
    probe.id
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  let passed = false;

  if (probe.source === "path") {
    passed = sources.existingPaths.has(probe.target);
  } else {
    passed = sourceContent(sources, probe.source).includes(probe.target);
  }

  const status: ReadinessCheckStatus = passed ? "pass" : blocking ? "fail" : "warn";
  const message = passed
    ? `${name} verified`
    : blocking
      ? `${name} missing (${probe.target})`
      : `${name} not detected (${probe.target})`;

  return {
    id: probe.id,
    name,
    status,
    message,
    blocking,
  };
}

export function deriveReadinessAreaStatus(checks: ReadinessProbeResult[]): ReadinessAreaStatus {
  if (checks.some((check) => check.status === "fail" && check.blocking)) {
    return "blocked";
  }
  if (checks.some((check) => check.status === "fail" || check.status === "warn")) {
    return "attention";
  }
  return "ready";
}

export function buildReadinessArea(
  spec: ReadinessAreaSpec,
  checks: ReadinessProbeResult[]
): ReadinessArea {
  const score = scoreChecks(
    checks.map((check) => ({
      id: check.id,
      category: spec.areaCode,
      name: check.name,
      status: check.status,
      message: check.message,
    }))
  );
  const status = deriveReadinessAreaStatus(checks);
  const failedCount = checks.filter((check) => check.status !== "pass").length;

  return {
    areaCode: spec.areaCode,
    label: spec.label,
    status,
    score,
    checks,
    summary:
      status === "ready"
        ? `${spec.label} is launch ready with ${checks.length} checks passing.`
        : status === "blocked"
          ? `${spec.label} has blocking gaps across ${failedCount} check${failedCount === 1 ? "" : "s"}.`
          : `${spec.label} needs attention on ${failedCount} check${failedCount === 1 ? "" : "s"}.`,
  };
}

export function buildLaunchReadinessScore(areas: ReadinessArea[]): LaunchReadinessScore {
  const score =
    areas.length === 0 ? 0 : Math.round(areas.reduce((total, area) => total + area.score, 0) / areas.length);
  const readyAreas = areas.filter((area) => area.status === "ready").length;
  const attentionAreas = areas.filter((area) => area.status === "attention").length;
  const blockedAreas = areas.filter((area) => area.status === "blocked").length;

  let status: LaunchReadinessStatus = "ready";
  if (blockedAreas > 0) status = "blocked";
  else if (attentionAreas > 0) status = "attention";

  return {
    score,
    status,
    readyAreas,
    attentionAreas,
    blockedAreas,
    summary: `Launch readiness score ${score} with ${readyAreas} ready, ${attentionAreas} attention, and ${blockedAreas} blocked areas.`,
  };
}

export function buildLaunchBlockers(areas: ReadinessArea[]): LaunchBlocker[] {
  return areas.flatMap((area) =>
    area.checks
      .filter((check) => check.status === "fail" && check.blocking)
      .map((check) => ({
        code: check.id,
        areaCode: area.areaCode,
        label: area.label,
        message: check.message,
      }))
  );
}

export function buildLaunchWarnings(areas: ReadinessArea[]): LaunchWarning[] {
  return areas.flatMap((area) =>
    area.checks
      .filter((check) => check.status === "warn" || (check.status === "fail" && !check.blocking))
      .map((check) => ({
        code: check.id,
        areaCode: area.areaCode,
        label: area.label,
        message: check.message,
      }))
  );
}

export function buildLaunchStrengths(areas: ReadinessArea[]): LaunchStrength[] {
  return areas
    .filter((area) => area.status === "ready" && area.score >= 95)
    .map((area) => ({
      areaCode: area.areaCode,
      label: area.label,
      score: area.score,
      summary: area.summary,
    }));
}

export function deriveRecommendedActions(input: {
  blockers: LaunchBlocker[];
  warnings: LaunchWarning[];
  score: LaunchReadinessScore;
}): RecommendedAction[] {
  const actions: RecommendedAction[] = [];

  for (const blocker of input.blockers) {
    actions.push({
      priority: "critical",
      action: `Resolve ${blocker.label.toLowerCase()} blocker: ${blocker.code}`,
      rationale: blocker.message,
    });
  }

  for (const warning of input.warnings.slice(0, 5)) {
    actions.push({
      priority: input.blockers.length > 0 ? "medium" : "high",
      action: `Review ${warning.label.toLowerCase()} warning: ${warning.code}`,
      rationale: warning.message,
    });
  }

  if (input.score.status === "ready" && actions.length === 0) {
    actions.push({
      priority: "medium",
      action: "Proceed with controlled launch rollout",
      rationale: "All readiness areas are green with no blocking checks.",
    });
  } else if (input.score.status === "attention" && input.blockers.length === 0) {
    actions.push({
      priority: "high",
      action: "Clear remaining warnings before general availability",
      rationale: input.score.summary,
    });
  } else if (input.blockers.length > 0) {
    actions.push({
      priority: "critical",
      action: "Do not launch until all blocking readiness checks pass",
      rationale: `${input.blockers.length} launch blocker${input.blockers.length === 1 ? "" : "s"} detected.`,
    });
  }

  return actions;
}

export function buildReleaseReadinessCenterSnapshot(input: {
  sources: ReadinessSources;
  generatedAt?: Date;
}): ReleaseReadinessCenterSnapshot {
  const areas = LAUNCH_READINESS_AREA_SPECS.map((spec) => {
    const checks = spec.probes.map((probe) => evaluateReadinessProbe(input.sources, probe));
    return buildReadinessArea(spec, checks);
  });

  const score = buildLaunchReadinessScore(areas);
  const blockers = buildLaunchBlockers(areas);
  const warnings = buildLaunchWarnings(areas);
  const strengths = buildLaunchStrengths(areas);
  const actions = deriveRecommendedActions({ blockers, warnings, score });

  return {
    areas,
    score,
    blockers,
    warnings,
    strengths,
    actions,
    generatedAt: input.generatedAt ?? new Date(),
  };
}

export function buildReleaseReadinessCenter(input: {
  snapshot: ReleaseReadinessCenterSnapshot;
}): ReleaseReadinessCenter {
  return {
    score: input.snapshot.score,
    areas: input.snapshot.areas,
    blockers: input.snapshot.blockers,
    warnings: input.snapshot.warnings,
    strengths: input.snapshot.strengths,
    actions: input.snapshot.actions,
    generatedAt: input.snapshot.generatedAt,
  };
}

export function toReadinessProbeResultView(check: ReadinessProbeResult): ReadinessProbeResultView {
  return {
    id: check.id,
    name: check.name,
    status: check.status,
    message: check.message,
    blocking: check.blocking,
  };
}

export function toReadinessAreaView(area: ReadinessArea): ReadinessAreaView {
  return {
    area_code: area.areaCode,
    label: area.label,
    status: area.status,
    score: area.score,
    checks: area.checks.map(toReadinessProbeResultView),
    summary: area.summary,
  };
}

export function toLaunchReadinessScoreView(score: LaunchReadinessScore): LaunchReadinessScoreView {
  return {
    score: score.score,
    status: score.status,
    ready_areas: score.readyAreas,
    attention_areas: score.attentionAreas,
    blocked_areas: score.blockedAreas,
    summary: score.summary,
  };
}

export function toLaunchBlockerView(blocker: LaunchBlocker): LaunchBlockerView {
  return {
    code: blocker.code,
    area_code: blocker.areaCode,
    label: blocker.label,
    message: blocker.message,
  };
}

export function toLaunchWarningView(warning: LaunchWarning): LaunchWarningView {
  return {
    code: warning.code,
    area_code: warning.areaCode,
    label: warning.label,
    message: warning.message,
  };
}

export function toLaunchStrengthView(strength: LaunchStrength): LaunchStrengthView {
  return {
    area_code: strength.areaCode,
    label: strength.label,
    score: strength.score,
    summary: strength.summary,
  };
}

export function toRecommendedActionView(action: RecommendedAction): RecommendedActionView {
  return {
    priority: action.priority,
    action: action.action,
    rationale: action.rationale,
  };
}

export function toReleaseReadinessCenterView(
  center: ReleaseReadinessCenter
): ReleaseReadinessCenterView {
  return {
    score: toLaunchReadinessScoreView(center.score),
    areas: center.areas.map(toReadinessAreaView),
    blockers: center.blockers.map(toLaunchBlockerView),
    warnings: center.warnings.map(toLaunchWarningView),
    strengths: center.strengths.map(toLaunchStrengthView),
    actions: center.actions.map(toRecommendedActionView),
    generated_at: center.generatedAt.toISOString(),
  };
}

export function collectProbePaths(specs: ReadinessAreaSpec[] = LAUNCH_READINESS_AREA_SPECS): string[] {
  return [
    ...new Set(
      specs
        .flatMap((spec) => spec.probes)
        .filter((probe) => probe.source === "path")
        .map((probe) => probe.target)
    ),
  ];
}
