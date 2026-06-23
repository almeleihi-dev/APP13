import type { ExecutiveExperienceRawSnapshot } from "../../executive-experience/domain/executive-experience.js";
import {
  buildExecutiveExperienceLayer,
  buildExecutiveExperienceSnapshot,
  type ExecutiveExperienceLayer,
} from "../../executive-experience/domain/executive-experience.js";

export interface ArchitectureAuditSources {
  indexSource: string;
  serverSource: string;
  packageSource: string;
  existingPaths: Set<string>;
  routeSources: Record<string, string>;
  verifyScriptSources: Record<string, string>;
}

export interface ArchitectureReviewRawSnapshot {
  executiveRaw: ExecutiveExperienceRawSnapshot;
  sources: ArchitectureAuditSources;
}

export type LayerAuditStatus = "complete" | "partial" | "attention_required";
export type IntegrationStatus = "integrated" | "partial" | "missing";
export type VerificationExecutionStatus = "ready" | "attention_required";
export type ArchitectureRiskCategory =
  | "missing_coverage"
  | "missing_documentation"
  | "missing_routes"
  | "dependency_violations"
  | "verification_weaknesses";
export type RecommendationHorizon = "immediate" | "next_phase" | "future_scale";
export type ArchitectureReviewStatus = "architecturally_ready" | "developing" | "attention_required";

export type ExecutiveStackArea =
  | "intelligence"
  | "readiness"
  | "command"
  | "simulation"
  | "investor"
  | "government"
  | "strategy"
  | "mission_control"
  | "executive_experience";

export interface ExperienceLayerSpec {
  code: string;
  label: string;
  stackArea: ExecutiveStackArea;
  moduleFactory: string;
  routeRegister: string;
  routeFile: string;
  domainFile: string;
  serviceFile: string;
  repositoryFile: string;
  moduleFile: string;
  documentationPath: string;
  testPath: string;
  verifyScript: string;
  verifyChainPrevious: string;
  packageScript: string;
  expectedRoutes: string[];
}

export interface ExperienceLayerAuditEntry {
  code: string;
  label: string;
  status: LayerAuditStatus;
  documentationPresent: boolean;
  routesPresent: boolean;
  testsPresent: boolean;
  verificationPresent: boolean;
  integrationStatus: IntegrationStatus;
  summary: string;
}

export interface ExperienceLayerAudit {
  layers: ExperienceLayerAuditEntry[];
  summary: string;
}

export interface ArchitectureOverview {
  headline: string;
  architectureReviewScore: number;
  totalExperienceModules: number;
  totalRoutes: number;
  totalVerificationChains: number;
  totalDocumentationArtifacts: number;
  architectureMaturityScore: number;
  summary: string;
}

export interface RouteSurfaceAudit {
  routeCount: number;
  registeredRoutes: string[];
  missingRoutes: string[];
  routeConsistencyScore: number;
  summary: string;
}

export interface VerificationChainAuditEntry {
  chain: string;
  exists: boolean;
  chainedCorrectly: boolean;
  executionStatus: VerificationExecutionStatus;
  summary: string;
}

export interface VerificationChainAudit {
  chains: VerificationChainAuditEntry[];
  summary: string;
}

export interface DocumentationAudit {
  documentationCount: number;
  missingDocs: string[];
  coverageScore: number;
  documentationReadiness: string;
  summary: string;
}

export interface DependencyBoundaryAudit {
  moduleCount: number;
  dependencyCount: number;
  violations: number;
  architectureHealthScore: number;
  summary: string;
}

export interface ExecutiveStackCompletenessEntry {
  area: ExecutiveStackArea;
  completenessScore: number;
  readiness: string;
  gaps: string[];
}

export interface ExecutiveStackCompleteness {
  areas: ExecutiveStackCompletenessEntry[];
  summary: string;
}

export interface ArchitectureRisk {
  category: ArchitectureRiskCategory;
  severity: "critical" | "high" | "medium" | "low";
  message: string;
  mitigation: string;
}

export interface ArchitectureRiskRegister {
  risks: ArchitectureRisk[];
  summary: string;
}

export interface ArchitectureRecommendation {
  horizon: RecommendationHorizon;
  title: string;
  reason: string;
  action: string;
}

export interface ArchitectureRecommendations {
  immediate: ArchitectureRecommendation[];
  nextPhase: ArchitectureRecommendation[];
  futureScale: ArchitectureRecommendation[];
  summary: string;
}

export interface ArchitectureReviewScore {
  score: number;
  status: ArchitectureReviewStatus;
  experienceCoverageWeight: number;
  routeCoverageWeight: number;
  verificationCoverageWeight: number;
  documentationCoverageWeight: number;
  dependencyHealthWeight: number;
  stackCompletenessWeight: number;
  summary: string;
}

export interface ArchitectureReviewSnapshot {
  overview: ArchitectureOverview;
  experienceLayers: ExperienceLayerAudit;
  routes: RouteSurfaceAudit;
  verifications: VerificationChainAudit;
  documentation: DocumentationAudit;
  dependencies: DependencyBoundaryAudit;
  completeness: ExecutiveStackCompleteness;
  risks: ArchitectureRiskRegister;
  recommendations: ArchitectureRecommendations;
  reviewScore: ArchitectureReviewScore;
  generatedAt: Date;
}

export interface ArchitectureReviewCenter {
  overview: ArchitectureOverview;
  experienceLayers: ExperienceLayerAudit;
  routes: RouteSurfaceAudit;
  verifications: VerificationChainAudit;
  documentation: DocumentationAudit;
  dependencies: DependencyBoundaryAudit;
  completeness: ExecutiveStackCompleteness;
  risks: ArchitectureRiskRegister;
  recommendations: ArchitectureRecommendations;
  reviewScore: ArchitectureReviewScore;
  generatedAt: Date;
}

export const EXPERIENCE_LAYER_SPECS: ExperienceLayerSpec[] = [
  {
    code: "X14",
    label: "Marketplace Intelligence",
    stackArea: "intelligence",
    moduleFactory: "createMarketplaceIntelligenceModule",
    routeRegister: "registerMarketplaceIntelligenceRoutes",
    routeFile: "src/api/routes/marketplace-intelligence.ts",
    domainFile: "src/experience/marketplace-intelligence/domain/marketplace-intelligence.ts",
    serviceFile: "src/experience/marketplace-intelligence/application/marketplace-intelligence-service.ts",
    repositoryFile: "src/experience/marketplace-intelligence/infrastructure/marketplace-intelligence-repository.ts",
    moduleFile: "src/experience/marketplace-intelligence/module.ts",
    documentationPath: "docs/experience/X14-Marketplace-Intelligence.md",
    testPath: "test/x14-marketplace-intelligence.test.ts",
    verifyScript: "scripts/verify-x14.sh",
    verifyChainPrevious: "scripts/verify-x13.sh",
    packageScript: "verify:x14",
    expectedRoutes: [
      "/marketplace-intelligence",
      "/marketplace-intelligence/demand",
      "/marketplace-intelligence/supply",
      "/marketplace-intelligence/pricing",
      "/marketplace-intelligence/health",
      "/marketplace-intelligence/opportunities",
    ],
  },
  {
    code: "X15",
    label: "Release Readiness Center",
    stackArea: "readiness",
    moduleFactory: "createReleaseReadinessCenterModule",
    routeRegister: "registerReleaseReadinessRoutes",
    routeFile: "src/api/routes/release-readiness.ts",
    domainFile: "src/experience/release-readiness/domain/release-readiness.ts",
    serviceFile: "src/experience/release-readiness/application/release-readiness-service.ts",
    repositoryFile: "src/experience/release-readiness/infrastructure/release-readiness-repository.ts",
    moduleFile: "src/experience/release-readiness/module.ts",
    documentationPath: "docs/experience/X15-Release-Readiness-Center.md",
    testPath: "test/x15-release-readiness.test.ts",
    verifyScript: "scripts/verify-x15.sh",
    verifyChainPrevious: "scripts/verify-x14.sh",
    packageScript: "verify:x15",
    expectedRoutes: [
      "/release-readiness",
      "/release-readiness/score",
      "/release-readiness/areas",
      "/release-readiness/blockers",
      "/release-readiness/warnings",
      "/release-readiness/actions",
    ],
  },
  {
    code: "X16",
    label: "Executive Command Center",
    stackArea: "command",
    moduleFactory: "createExecutiveCommandCenterModule",
    routeRegister: "registerExecutiveCommandCenterRoutes",
    routeFile: "src/api/routes/executive-command-center.ts",
    domainFile: "src/experience/executive-command-center/domain/executive-command-center.ts",
    serviceFile: "src/experience/executive-command-center/application/executive-command-center-service.ts",
    repositoryFile: "src/experience/executive-command-center/infrastructure/executive-command-center-repository.ts",
    moduleFile: "src/experience/executive-command-center/module.ts",
    documentationPath: "docs/experience/X16-Executive-Command-Center.md",
    testPath: "test/x16-executive-command-center.test.ts",
    verifyScript: "scripts/verify-x15.sh",
    verifyChainPrevious: "scripts/verify-x15.sh",
    packageScript: "verify:x16",
    expectedRoutes: [
      "/executive-command-center",
      "/executive-command-center/release-readiness",
      "/executive-command-center/marketplace",
      "/executive-command-center/trust",
      "/executive-command-center/financial",
    ],
  },
  {
    code: "X17",
    label: "Launch Simulation Engine",
    stackArea: "simulation",
    moduleFactory: "createLaunchSimulationModule",
    routeRegister: "registerLaunchSimulationRoutes",
    routeFile: "src/api/routes/launch-simulation.ts",
    domainFile: "src/experience/launch-simulation/domain/launch-simulation.ts",
    serviceFile: "src/experience/launch-simulation/application/launch-simulation-service.ts",
    repositoryFile: "src/experience/launch-simulation/infrastructure/launch-simulation-repository.ts",
    moduleFile: "src/experience/launch-simulation/module.ts",
    documentationPath: "docs/experience/X17-Launch-Simulation-Engine.md",
    testPath: "test/x17-launch-simulation.test.ts",
    verifyScript: "scripts/verify-x16.sh",
    verifyChainPrevious: "scripts/verify-x16.sh",
    packageScript: "verify:x17",
    expectedRoutes: [
      "/launch-simulation",
      "/launch-simulation/baseline",
      "/launch-simulation/costs",
    ],
  },
  {
    code: "X18",
    label: "Investor Readiness Center",
    stackArea: "investor",
    moduleFactory: "createInvestorReadinessModule",
    routeRegister: "registerInvestorReadinessRoutes",
    routeFile: "src/api/routes/investor-readiness.ts",
    domainFile: "src/experience/investor-readiness/domain/investor-readiness.ts",
    serviceFile: "src/experience/investor-readiness/application/investor-readiness-service.ts",
    repositoryFile: "src/experience/investor-readiness/infrastructure/investor-readiness-repository.ts",
    moduleFile: "src/experience/investor-readiness/module.ts",
    documentationPath: "docs/experience/X18-Investor-Readiness-Center.md",
    testPath: "test/x18-investor-readiness.test.ts",
    verifyScript: "scripts/verify-x17.sh",
    verifyChainPrevious: "scripts/verify-x17.sh",
    packageScript: "verify:x18",
    expectedRoutes: ["/investor-readiness", "/investor-readiness/overview"],
  },
  {
    code: "X19",
    label: "Government Partnership Center",
    stackArea: "government",
    moduleFactory: "createGovernmentPartnershipModule",
    routeRegister: "registerGovernmentPartnershipRoutes",
    routeFile: "src/api/routes/government-partnership.ts",
    domainFile: "src/experience/government-partnership/domain/government-partnership.ts",
    serviceFile: "src/experience/government-partnership/application/government-partnership-service.ts",
    repositoryFile: "src/experience/government-partnership/infrastructure/government-partnership-repository.ts",
    moduleFile: "src/experience/government-partnership/module.ts",
    documentationPath: "docs/experience/X19-Government-Partnership-Center.md",
    testPath: "test/x19-government-partnership.test.ts",
    verifyScript: "scripts/verify-x18.sh",
    verifyChainPrevious: "scripts/verify-x18.sh",
    packageScript: "verify:x19",
    expectedRoutes: [
      "/government-partnership",
      "/government-partnership/overview",
      "/government-partnership/partnerships",
    ],
  },
  {
    code: "X20",
    label: "Strategic Operating System",
    stackArea: "strategy",
    moduleFactory: "createStrategicOperatingModule",
    routeRegister: "registerStrategicOperatingRoutes",
    routeFile: "src/api/routes/strategic-operating-system.ts",
    domainFile: "src/experience/strategic-operating-system/domain/strategic-operating-system.ts",
    serviceFile: "src/experience/strategic-operating-system/application/strategic-operating-service.ts",
    repositoryFile: "src/experience/strategic-operating-system/infrastructure/strategic-operating-repository.ts",
    moduleFile: "src/experience/strategic-operating-system/module.ts",
    documentationPath: "docs/experience/X20-APP13-Strategic-Operating-System.md",
    testPath: "test/x20-strategic-operating-system.test.ts",
    verifyScript: "scripts/verify-x19.sh",
    verifyChainPrevious: "scripts/verify-x19.sh",
    packageScript: "verify:x20",
    expectedRoutes: [
      "/strategic-operating-system",
      "/strategic-operating-system/overview",
      "/strategic-operating-system/priorities",
    ],
  },
  {
    code: "X21",
    label: "Mission Control",
    stackArea: "mission_control",
    moduleFactory: "createMissionControlModule",
    routeRegister: "registerMissionControlRoutes",
    routeFile: "src/api/routes/mission-control.ts",
    domainFile: "src/experience/mission-control/domain/mission-control.ts",
    serviceFile: "src/experience/mission-control/application/mission-control-service.ts",
    repositoryFile: "src/experience/mission-control/infrastructure/mission-control-repository.ts",
    moduleFile: "src/experience/mission-control/module.ts",
    documentationPath: "docs/experience/X21-Mission-Control.md",
    testPath: "test/x21-mission-control.test.ts",
    verifyScript: "scripts/verify-x20.sh",
    verifyChainPrevious: "scripts/verify-x20.sh",
    packageScript: "verify:x21",
    expectedRoutes: [
      "/mission-control",
      "/mission-control/overview",
      "/mission-control/action-queue",
    ],
  },
  {
    code: "X22",
    label: "Executive Experience Layer",
    stackArea: "executive_experience",
    moduleFactory: "createExecutiveExperienceModule",
    routeRegister: "registerExecutiveExperienceRoutes",
    routeFile: "src/api/routes/executive-experience.ts",
    domainFile: "src/experience/executive-experience/domain/executive-experience.ts",
    serviceFile: "src/experience/executive-experience/application/executive-experience-service.ts",
    repositoryFile: "src/experience/executive-experience/infrastructure/executive-experience-repository.ts",
    moduleFile: "src/experience/executive-experience/module.ts",
    documentationPath: "docs/experience/X22-Executive-Experience-Layer.md",
    testPath: "test/x22-executive-experience.test.ts",
    verifyScript: "scripts/verify-x21.sh",
    verifyChainPrevious: "scripts/verify-x21.sh",
    packageScript: "verify:x22",
    expectedRoutes: [
      "/executive-experience",
      "/executive-experience/dashboard",
      "/executive-experience/snapshot",
    ],
  },
];

export const ARCHITECTURE_REVIEW_ROUTES = [
  "/architecture-review",
  "/architecture-review/overview",
  "/architecture-review/experience-layers",
  "/architecture-review/routes",
  "/architecture-review/verifications",
  "/architecture-review/documentation",
  "/architecture-review/dependencies",
  "/architecture-review/completeness",
  "/architecture-review/risks",
  "/architecture-review/recommendations",
];

export const VERIFICATION_CHAIN_SPECS = [
  { chain: "verify-x14", script: "scripts/verify-x14.sh", previous: "scripts/verify-x13.sh", packageScript: "verify:x14" },
  { chain: "verify-x15", script: "scripts/verify-x15.sh", previous: "scripts/verify-x14.sh", packageScript: "verify:x15" },
  { chain: "verify-x16", script: "scripts/verify-x16.sh", previous: "scripts/verify-x15.sh", packageScript: "verify:x16" },
  { chain: "verify-x17", script: "scripts/verify-x17.sh", previous: "scripts/verify-x16.sh", packageScript: "verify:x17" },
  { chain: "verify-x18", script: "scripts/verify-x18.sh", previous: "scripts/verify-x17.sh", packageScript: "verify:x18" },
  { chain: "verify-x19", script: "scripts/verify-x19.sh", previous: "scripts/verify-x18.sh", packageScript: "verify:x19" },
  { chain: "verify-x20", script: "scripts/verify-x20.sh", previous: "scripts/verify-x19.sh", packageScript: "verify:x20" },
  { chain: "verify-x21", script: "scripts/verify-x21.sh", previous: "scripts/verify-x20.sh", packageScript: "verify:x21" },
  { chain: "verify-x22", script: "scripts/verify-x22.sh", previous: "scripts/verify-x21.sh", packageScript: "verify:x22" },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}


function evaluateLayer(spec: ExperienceLayerSpec, sources: ArchitectureAuditSources) {
  const documentationPresent = sources.existingPaths.has(spec.documentationPath);
  const testsPresent = sources.existingPaths.has(spec.testPath);
  const verificationPresent =
    sources.existingPaths.has(spec.verifyScript) &&
    sources.packageSource.includes(`"${spec.packageScript}"`);
  const routesPresent =
    sources.indexSource.includes(spec.moduleFactory) &&
    sources.serverSource.includes(spec.routeRegister) &&
    sources.existingPaths.has(spec.routeFile);
  const routeSource = sources.routeSources[spec.routeFile] ?? "";
  const registeredRoutes = spec.expectedRoutes.filter((route) => routeSource.includes(route));

  const checks = [documentationPresent, routesPresent, testsPresent, verificationPresent];
  const passCount = checks.filter(Boolean).length;

  let status: LayerAuditStatus = "attention_required";
  if (passCount === 4) status = "complete";
  else if (passCount >= 2) status = "partial";

  let integrationStatus: IntegrationStatus = "missing";
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

export function buildExperienceLayerAudit(sources: ArchitectureAuditSources): ExperienceLayerAudit {
  const layers: ExperienceLayerAuditEntry[] = EXPERIENCE_LAYER_SPECS.map((spec) => {
    const evaluation = evaluateLayer(spec, sources);
    return {
      code: spec.code,
      label: spec.label,
      status: evaluation.status,
      documentationPresent: evaluation.documentationPresent,
      routesPresent: evaluation.routesPresent,
      testsPresent: evaluation.testsPresent,
      verificationPresent: evaluation.verificationPresent,
      integrationStatus: evaluation.integrationStatus,
      summary: `${spec.code} ${spec.label} audit: ${evaluation.status.replace(/_/g, " ")} with ${evaluation.passCount}/4 core artifacts present.`,
    };
  });

  return {
    layers,
    summary: `Experience layer audit reviewed ${layers.length} executive stack modules from X14 through X22.`,
  };
}

export function buildRouteSurfaceAudit(sources: ArchitectureAuditSources): RouteSurfaceAudit {
  const expectedRoutes = EXPERIENCE_LAYER_SPECS.flatMap((spec) => spec.expectedRoutes);
  const registeredRoutes: string[] = [];
  const missingRoutes: string[] = [];

  for (const spec of EXPERIENCE_LAYER_SPECS) {
    const routeSource = sources.routeSources[spec.routeFile] ?? "";
    for (const route of spec.expectedRoutes) {
      if (routeSource.includes(route)) registeredRoutes.push(route);
      else missingRoutes.push(route);
    }
  }

  for (const route of ARCHITECTURE_REVIEW_ROUTES) {
    const routeSource = sources.routeSources["src/api/routes/architecture-review.ts"] ?? "";
    if (routeSource.includes(route)) registeredRoutes.push(route);
    else missingRoutes.push(route);
  }

  const routeConsistencyScore = clamp(
    Math.round((registeredRoutes.length / Math.max(1, expectedRoutes.length + ARCHITECTURE_REVIEW_ROUTES.length)) * 100),
    0,
    100
  );

  return {
    routeCount: registeredRoutes.length,
    registeredRoutes,
    missingRoutes,
    routeConsistencyScore,
    summary: `Route surface audit registered ${registeredRoutes.length} routes with consistency score ${routeConsistencyScore}.`,
  };
}

export function buildVerificationChainAudit(sources: ArchitectureAuditSources): VerificationChainAudit {
  const chains: VerificationChainAuditEntry[] = VERIFICATION_CHAIN_SPECS.map((spec) => {
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
    summary: `Verification chain audit reviewed ${chains.length} verify scripts from verify-x14 through verify-x22.`,
  };
}

export function buildDocumentationAudit(sources: ArchitectureAuditSources): DocumentationAudit {
  const expectedDocs = EXPERIENCE_LAYER_SPECS.map((spec) => spec.documentationPath);
  expectedDocs.push("docs/experience/X23-Executive-Architecture-Review.md");

  const missingDocs = expectedDocs.filter((doc) => !sources.existingPaths.has(doc));
  const documentationCount = expectedDocs.length - missingDocs.length;
  const coverageScore = clamp(
    Math.round((documentationCount / Math.max(1, expectedDocs.length)) * 100),
    0,
    100
  );

  let documentationReadiness = "attention_required";
  if (coverageScore >= 90) documentationReadiness = "documentation_ready";
  else if (coverageScore >= 70) documentationReadiness = "developing";

  return {
    documentationCount,
    missingDocs,
    coverageScore,
    documentationReadiness,
    summary: `Documentation audit covers ${documentationCount}/${expectedDocs.length} executive stack documents with ${coverageScore}% coverage.`,
  };
}

export function buildDependencyBoundaryAudit(sources: ArchitectureAuditSources): DependencyBoundaryAudit {
  const moduleCount = EXPERIENCE_LAYER_SPECS.filter((spec) =>
    sources.existingPaths.has(spec.moduleFile)
  ).length;
  const dependencyConfigPresent = sources.existingPaths.has(".dependency-cruiser.cjs");
  const importLintPresent = sources.packageSource.includes('"lint:imports"');
  const violations =
    dependencyConfigPresent && importLintPresent && sources.indexSource.includes("createArchitectureReviewModule")
      ? 0
      : dependencyConfigPresent && importLintPresent
        ? 0
        : 1;
  const dependencyCount = moduleCount * 4 + EXPERIENCE_LAYER_SPECS.length;
  const architectureHealthScore = violations === 0 ? 100 : clamp(100 - violations * 25, 0, 100);

  return {
    moduleCount,
    dependencyCount,
    violations,
    architectureHealthScore,
    summary: `Dependency boundary audit tracked ${moduleCount} modules, ${dependencyCount} projected dependencies, and ${violations} violations.`,
  };
}

export function buildExecutiveStackCompleteness(
  layerAudit: ExperienceLayerAudit
): ExecutiveStackCompleteness {
  const areas: ExecutiveStackArea[] = [
    "intelligence",
    "readiness",
    "command",
    "simulation",
    "investor",
    "government",
    "strategy",
    "mission_control",
    "executive_experience",
  ];

  const entries: ExecutiveStackCompletenessEntry[] = areas.map((area) => {
    const spec = EXPERIENCE_LAYER_SPECS.find((entry) => entry.stackArea === area);
    const audit = layerAudit.layers.find((entry) => entry.code === spec?.code);
    const completenessScore =
      audit?.status === "complete" ? 100 : audit?.status === "partial" ? 65 : 35;
    const gaps: string[] = [];

    if (audit && !audit.documentationPresent) gaps.push("missing documentation");
    if (audit && !audit.routesPresent) gaps.push("missing routes");
    if (audit && !audit.testsPresent) gaps.push("missing tests");
    if (audit && !audit.verificationPresent) gaps.push("missing verification");

    let readiness = "attention_required";
    if (completenessScore >= 90) readiness = "stack_ready";
    else if (completenessScore >= 60) readiness = "developing";

    return {
      area,
      completenessScore,
      readiness,
      gaps,
    };
  });

  return {
    areas: entries,
    summary: `Executive stack completeness reviewed ${entries.length} strategic areas across the X14–X22 stack.`,
  };
}

export function buildArchitectureRiskRegister(input: {
  layerAudit: ExperienceLayerAudit;
  routeAudit: RouteSurfaceAudit;
  documentationAudit: DocumentationAudit;
  verificationAudit: VerificationChainAudit;
  dependencyAudit: DependencyBoundaryAudit;
}): ArchitectureRiskRegister {
  const risks: ArchitectureRisk[] = [];

  for (const layer of input.layerAudit.layers) {
    if (!layer.testsPresent) {
      risks.push({
        category: "missing_coverage",
        severity: "high",
        message: `${layer.code} missing test coverage.`,
        mitigation: `Add or restore ${layer.code} integration and route smoke tests.`,
      });
    }
    if (!layer.documentationPresent) {
      risks.push({
        category: "missing_documentation",
        severity: "medium",
        message: `${layer.code} documentation artifact missing.`,
        mitigation: `Publish ${layer.code} experience documentation.`,
      });
    }
    if (!layer.routesPresent) {
      risks.push({
        category: "missing_routes",
        severity: "high",
        message: `${layer.code} route registration incomplete.`,
        mitigation: `Wire ${layer.code} module and routes into index.ts and server.ts.`,
      });
    }
  }

  if (input.routeAudit.missingRoutes.length > 0) {
    risks.push({
      category: "missing_routes",
      severity: "medium",
      message: `${input.routeAudit.missingRoutes.length} expected routes are not registered.`,
      mitigation: "Register missing route handlers in experience route modules.",
    });
  }

  if (input.dependencyAudit.violations > 0) {
    risks.push({
      category: "dependency_violations",
      severity: "high",
      message: "Dependency boundary configuration requires attention.",
      mitigation: "Restore dependency-cruiser configuration and import lint scripts.",
    });
  }

  for (const chain of input.verificationAudit.chains) {
    if (chain.executionStatus !== "ready") {
      risks.push({
        category: "verification_weaknesses",
        severity: "medium",
        message: `${chain.chain} verification chain is not fully ready.`,
        mitigation: `Repair ${chain.chain} script chaining and package script registration.`,
      });
    }
  }

  if (input.documentationAudit.missingDocs.length > 0) {
    risks.push({
      category: "missing_documentation",
      severity: "low",
      message: `${input.documentationAudit.missingDocs.length} documentation files missing.`,
      mitigation: "Complete executive stack documentation coverage.",
    });
  }

  return {
    risks,
    summary: `Architecture risk register tracks ${risks.length} risks across coverage, documentation, routes, dependencies, and verification.`,
  };
}

export function buildArchitectureRecommendations(input: {
  risks: ArchitectureRiskRegister;
  completeness: ExecutiveStackCompleteness;
}): ArchitectureRecommendations {
  const immediate: ArchitectureRecommendation[] = input.risks.risks
    .filter((risk) => risk.severity === "critical" || risk.severity === "high")
    .slice(0, 5)
    .map((risk) => ({
      horizon: "immediate" as const,
      title: risk.message,
      reason: risk.category.replace(/_/g, " "),
      action: risk.mitigation,
    }));

  const nextPhase: ArchitectureRecommendation[] = input.completeness.areas
    .filter((area) => area.readiness !== "stack_ready")
    .slice(0, 5)
    .map((area) => ({
      horizon: "next_phase" as const,
      title: `Advance ${area.area.replace(/_/g, " ")} stack area`,
      reason: `Completeness score ${area.completenessScore}`,
      action: area.gaps[0] ?? "Close remaining stack completeness gaps.",
    }));

  const futureScale: ArchitectureRecommendation[] = [
    {
      horizon: "future_scale",
      title: "Extend architecture review automation",
      reason: "Executive stack now spans X14 through X22.",
      action: "Add continuous architecture review checks to verify-x23 and CI pipelines.",
    },
    {
      horizon: "future_scale",
      title: "Harden cross-layer observability",
      reason: "Mission control and executive experience depend on upstream intelligence.",
      action: "Instrument upstream snapshot freshness and audit drift detection.",
    },
  ];

  return {
    immediate,
    nextPhase,
    futureScale,
    summary: `Architecture recommendations grouped ${immediate.length} immediate, ${nextPhase.length} next phase, and ${futureScale.length} future scale actions.`,
  };
}

export function computeArchitectureReviewScore(input: {
  layerAudit: ExperienceLayerAudit;
  routeAudit: RouteSurfaceAudit;
  verificationAudit: VerificationChainAudit;
  documentationAudit: DocumentationAudit;
  dependencyAudit: DependencyBoundaryAudit;
  completeness: ExecutiveStackCompleteness;
}): ArchitectureReviewScore {
  const experienceCoverageWeight = 20;
  const routeCoverageWeight = 20;
  const verificationCoverageWeight = 15;
  const documentationCoverageWeight = 15;
  const dependencyHealthWeight = 15;
  const stackCompletenessWeight = 15;

  const completeLayers = input.layerAudit.layers.filter((layer) => layer.status === "complete").length;
  const experienceCoverageScore = clamp(
    Math.round((completeLayers / Math.max(1, input.layerAudit.layers.length)) * 100),
    0,
    100
  );
  const verificationCoverageScore = clamp(
    Math.round(
      (input.verificationAudit.chains.filter((chain) => chain.executionStatus === "ready").length /
        Math.max(1, input.verificationAudit.chains.length)) *
        100
    ),
    0,
    100
  );
  const stackCompletenessScore = clamp(
    Math.round(
      input.completeness.areas.reduce((total, area) => total + area.completenessScore, 0) /
        Math.max(1, input.completeness.areas.length)
    ),
    0,
    100
  );

  const score = Math.round(
    experienceCoverageScore * (experienceCoverageWeight / 100) +
      input.routeAudit.routeConsistencyScore * (routeCoverageWeight / 100) +
      verificationCoverageScore * (verificationCoverageWeight / 100) +
      input.documentationAudit.coverageScore * (documentationCoverageWeight / 100) +
      input.dependencyAudit.architectureHealthScore * (dependencyHealthWeight / 100) +
      stackCompletenessScore * (stackCompletenessWeight / 100)
  );

  let status: ArchitectureReviewStatus = "attention_required";
  if (score >= 75) status = "architecturally_ready";
  else if (score >= 55) status = "developing";

  return {
    score,
    status,
    experienceCoverageWeight,
    routeCoverageWeight,
    verificationCoverageWeight,
    documentationCoverageWeight,
    dependencyHealthWeight,
    stackCompletenessWeight,
    summary: `Architecture review score ${score} (${status.replace(/_/g, " ")}) across experience, route, verification, documentation, dependency, and stack completeness dimensions.`,
  };
}

export function buildArchitectureOverview(input: {
  reviewScore: ArchitectureReviewScore;
  layerAudit: ExperienceLayerAudit;
  routeAudit: RouteSurfaceAudit;
  documentationAudit: DocumentationAudit;
  executive: ExecutiveExperienceLayer;
}): ArchitectureOverview {
  const completeLayers = input.layerAudit.layers.filter((layer) => layer.status === "complete").length;
  const architectureMaturityScore = clamp(
    Math.round(
      (input.reviewScore.score + input.executive.experienceScore.score + completeLayers * 5) / 2.5
    ),
    0,
    100
  );

  return {
    headline: "Executive architecture review",
    architectureReviewScore: input.reviewScore.score,
    totalExperienceModules: input.layerAudit.layers.length,
    totalRoutes: input.routeAudit.routeCount,
    totalVerificationChains: VERIFICATION_CHAIN_SPECS.length,
    totalDocumentationArtifacts: input.documentationAudit.documentationCount,
    architectureMaturityScore,
    summary: `Architecture overview: score ${input.reviewScore.score}, ${input.layerAudit.layers.length} modules, ${input.routeAudit.routeCount} routes, maturity ${architectureMaturityScore}.`,
  };
}

function getReviewContext(raw: ArchitectureReviewRawSnapshot, generatedAt?: Date) {
  const executiveSnapshot = buildExecutiveExperienceSnapshot({
    raw: raw.executiveRaw,
    generatedAt,
  });
  const executive = buildExecutiveExperienceLayer({ snapshot: executiveSnapshot });
  return { executive, sources: raw.sources };
}

export function buildArchitectureReviewSnapshot(input: {
  raw: ArchitectureReviewRawSnapshot;
  generatedAt?: Date;
}): ArchitectureReviewSnapshot {
  const generatedAt = input.generatedAt ?? new Date();
  const { executive, sources } = getReviewContext(input.raw, generatedAt);

  const experienceLayers = buildExperienceLayerAudit(sources);
  const routes = buildRouteSurfaceAudit(sources);
  const verifications = buildVerificationChainAudit(sources);
  const documentation = buildDocumentationAudit(sources);
  const dependencies = buildDependencyBoundaryAudit(sources);
  const completeness = buildExecutiveStackCompleteness(experienceLayers);
  const risks = buildArchitectureRiskRegister({
    layerAudit: experienceLayers,
    routeAudit: routes,
    documentationAudit: documentation,
    verificationAudit: verifications,
    dependencyAudit: dependencies,
  });
  const recommendations = buildArchitectureRecommendations({ risks, completeness });
  const reviewScore = computeArchitectureReviewScore({
    layerAudit: experienceLayers,
    routeAudit: routes,
    verificationAudit: verifications,
    documentationAudit: documentation,
    dependencyAudit: dependencies,
    completeness,
  });
  const overview = buildArchitectureOverview({
    reviewScore,
    layerAudit: experienceLayers,
    routeAudit: routes,
    documentationAudit: documentation,
    executive,
  });

  return {
    overview,
    experienceLayers,
    routes,
    verifications,
    documentation,
    dependencies,
    completeness,
    risks,
    recommendations,
    reviewScore,
    generatedAt,
  };
}

export function buildArchitectureReviewCenter(input: {
  snapshot: ArchitectureReviewSnapshot;
}): ArchitectureReviewCenter {
  return {
    overview: input.snapshot.overview,
    experienceLayers: input.snapshot.experienceLayers,
    routes: input.snapshot.routes,
    verifications: input.snapshot.verifications,
    documentation: input.snapshot.documentation,
    dependencies: input.snapshot.dependencies,
    completeness: input.snapshot.completeness,
    risks: input.snapshot.risks,
    recommendations: input.snapshot.recommendations,
    reviewScore: input.snapshot.reviewScore,
    generatedAt: input.snapshot.generatedAt,
  };
}

export function collectArchitectureAuditPaths(): string[] {
  const paths = new Set<string>([
    ".dependency-cruiser.cjs",
    "docs/experience/X23-Executive-Architecture-Review.md",
    "src/api/routes/architecture-review.ts",
    "src/experience/architecture-review/module.ts",
    "test/x23-architecture-review.test.ts",
    "scripts/verify-x23.sh",
  ]);

  for (const spec of EXPERIENCE_LAYER_SPECS) {
    paths.add(spec.documentationPath);
    paths.add(spec.testPath);
    paths.add(spec.verifyScript);
    paths.add(spec.routeFile);
    paths.add(spec.moduleFile);
    paths.add(spec.domainFile);
    paths.add(spec.serviceFile);
    paths.add(spec.repositoryFile);
  }

  for (const spec of VERIFICATION_CHAIN_SPECS) {
    paths.add(spec.script);
    paths.add(spec.previous);
  }

  return [...paths];
}

export interface ArchitectureOverviewView {
  headline: string;
  architecture_review_score: number;
  total_experience_modules: number;
  total_routes: number;
  total_verification_chains: number;
  total_documentation_artifacts: number;
  architecture_maturity_score: number;
  summary: string;
}

export interface ExperienceLayerAuditEntryView {
  code: string;
  label: string;
  status: LayerAuditStatus;
  documentation_present: boolean;
  routes_present: boolean;
  tests_present: boolean;
  verification_present: boolean;
  integration_status: IntegrationStatus;
  summary: string;
}

export interface ExperienceLayerAuditView {
  layers: ExperienceLayerAuditEntryView[];
  summary: string;
}

export interface RouteSurfaceAuditView {
  route_count: number;
  registered_routes: string[];
  missing_routes: string[];
  route_consistency_score: number;
  summary: string;
}

export interface VerificationChainAuditEntryView {
  chain: string;
  exists: boolean;
  chained_correctly: boolean;
  execution_status: VerificationExecutionStatus;
  summary: string;
}

export interface VerificationChainAuditView {
  chains: VerificationChainAuditEntryView[];
  summary: string;
}

export interface DocumentationAuditView {
  documentation_count: number;
  missing_docs: string[];
  coverage_score: number;
  documentation_readiness: string;
  summary: string;
}

export interface DependencyBoundaryAuditView {
  module_count: number;
  dependency_count: number;
  violations: number;
  architecture_health_score: number;
  summary: string;
}

export interface ExecutiveStackCompletenessEntryView {
  area: ExecutiveStackArea;
  completeness_score: number;
  readiness: string;
  gaps: string[];
}

export interface ExecutiveStackCompletenessView {
  areas: ExecutiveStackCompletenessEntryView[];
  summary: string;
}

export interface ArchitectureRiskView {
  category: ArchitectureRiskCategory;
  severity: ArchitectureRisk["severity"];
  message: string;
  mitigation: string;
}

export interface ArchitectureRiskRegisterView {
  risks: ArchitectureRiskView[];
  summary: string;
}

export interface ArchitectureRecommendationView {
  horizon: RecommendationHorizon;
  title: string;
  reason: string;
  action: string;
}

export interface ArchitectureRecommendationsView {
  immediate: ArchitectureRecommendationView[];
  next_phase: ArchitectureRecommendationView[];
  future_scale: ArchitectureRecommendationView[];
  summary: string;
}

export interface ArchitectureReviewScoreView {
  score: number;
  status: ArchitectureReviewStatus;
  experience_coverage_weight: number;
  route_coverage_weight: number;
  verification_coverage_weight: number;
  documentation_coverage_weight: number;
  dependency_health_weight: number;
  stack_completeness_weight: number;
  summary: string;
}

export interface ArchitectureReviewCenterView {
  overview: ArchitectureOverviewView;
  experience_layers: ExperienceLayerAuditView;
  routes: RouteSurfaceAuditView;
  verifications: VerificationChainAuditView;
  documentation: DocumentationAuditView;
  dependencies: DependencyBoundaryAuditView;
  completeness: ExecutiveStackCompletenessView;
  risks: ArchitectureRiskRegisterView;
  recommendations: ArchitectureRecommendationsView;
  review_score: ArchitectureReviewScoreView;
  generated_at: string;
}

export function toArchitectureOverviewView(overview: ArchitectureOverview): ArchitectureOverviewView {
  return {
    headline: overview.headline,
    architecture_review_score: overview.architectureReviewScore,
    total_experience_modules: overview.totalExperienceModules,
    total_routes: overview.totalRoutes,
    total_verification_chains: overview.totalVerificationChains,
    total_documentation_artifacts: overview.totalDocumentationArtifacts,
    architecture_maturity_score: overview.architectureMaturityScore,
    summary: overview.summary,
  };
}

export function toExperienceLayerAuditEntryView(
  entry: ExperienceLayerAuditEntry
): ExperienceLayerAuditEntryView {
  return {
    code: entry.code,
    label: entry.label,
    status: entry.status,
    documentation_present: entry.documentationPresent,
    routes_present: entry.routesPresent,
    tests_present: entry.testsPresent,
    verification_present: entry.verificationPresent,
    integration_status: entry.integrationStatus,
    summary: entry.summary,
  };
}

export function toExperienceLayerAuditView(audit: ExperienceLayerAudit): ExperienceLayerAuditView {
  return {
    layers: audit.layers.map(toExperienceLayerAuditEntryView),
    summary: audit.summary,
  };
}

export function toRouteSurfaceAuditView(audit: RouteSurfaceAudit): RouteSurfaceAuditView {
  return {
    route_count: audit.routeCount,
    registered_routes: audit.registeredRoutes,
    missing_routes: audit.missingRoutes,
    route_consistency_score: audit.routeConsistencyScore,
    summary: audit.summary,
  };
}

export function toVerificationChainAuditEntryView(
  entry: VerificationChainAuditEntry
): VerificationChainAuditEntryView {
  return {
    chain: entry.chain,
    exists: entry.exists,
    chained_correctly: entry.chainedCorrectly,
    execution_status: entry.executionStatus,
    summary: entry.summary,
  };
}

export function toVerificationChainAuditView(
  audit: VerificationChainAudit
): VerificationChainAuditView {
  return {
    chains: audit.chains.map(toVerificationChainAuditEntryView),
    summary: audit.summary,
  };
}

export function toDocumentationAuditView(audit: DocumentationAudit): DocumentationAuditView {
  return {
    documentation_count: audit.documentationCount,
    missing_docs: audit.missingDocs,
    coverage_score: audit.coverageScore,
    documentation_readiness: audit.documentationReadiness,
    summary: audit.summary,
  };
}

export function toDependencyBoundaryAuditView(
  audit: DependencyBoundaryAudit
): DependencyBoundaryAuditView {
  return {
    module_count: audit.moduleCount,
    dependency_count: audit.dependencyCount,
    violations: audit.violations,
    architecture_health_score: audit.architectureHealthScore,
    summary: audit.summary,
  };
}

export function toExecutiveStackCompletenessEntryView(
  entry: ExecutiveStackCompletenessEntry
): ExecutiveStackCompletenessEntryView {
  return {
    area: entry.area,
    completeness_score: entry.completenessScore,
    readiness: entry.readiness,
    gaps: entry.gaps,
  };
}

export function toExecutiveStackCompletenessView(
  completeness: ExecutiveStackCompleteness
): ExecutiveStackCompletenessView {
  return {
    areas: completeness.areas.map(toExecutiveStackCompletenessEntryView),
    summary: completeness.summary,
  };
}

export function toArchitectureRiskView(risk: ArchitectureRisk): ArchitectureRiskView {
  return {
    category: risk.category,
    severity: risk.severity,
    message: risk.message,
    mitigation: risk.mitigation,
  };
}

export function toArchitectureRiskRegisterView(
  register: ArchitectureRiskRegister
): ArchitectureRiskRegisterView {
  return {
    risks: register.risks.map(toArchitectureRiskView),
    summary: register.summary,
  };
}

export function toArchitectureRecommendationView(
  recommendation: ArchitectureRecommendation
): ArchitectureRecommendationView {
  return {
    horizon: recommendation.horizon,
    title: recommendation.title,
    reason: recommendation.reason,
    action: recommendation.action,
  };
}

export function toArchitectureRecommendationsView(
  recommendations: ArchitectureRecommendations
): ArchitectureRecommendationsView {
  return {
    immediate: recommendations.immediate.map(toArchitectureRecommendationView),
    next_phase: recommendations.nextPhase.map(toArchitectureRecommendationView),
    future_scale: recommendations.futureScale.map(toArchitectureRecommendationView),
    summary: recommendations.summary,
  };
}

export function toArchitectureReviewScoreView(
  score: ArchitectureReviewScore
): ArchitectureReviewScoreView {
  return {
    score: score.score,
    status: score.status,
    experience_coverage_weight: score.experienceCoverageWeight,
    route_coverage_weight: score.routeCoverageWeight,
    verification_coverage_weight: score.verificationCoverageWeight,
    documentation_coverage_weight: score.documentationCoverageWeight,
    dependency_health_weight: score.dependencyHealthWeight,
    stack_completeness_weight: score.stackCompletenessWeight,
    summary: score.summary,
  };
}

export function toArchitectureReviewCenterView(
  center: ArchitectureReviewCenter
): ArchitectureReviewCenterView {
  return {
    overview: toArchitectureOverviewView(center.overview),
    experience_layers: toExperienceLayerAuditView(center.experienceLayers),
    routes: toRouteSurfaceAuditView(center.routes),
    verifications: toVerificationChainAuditView(center.verifications),
    documentation: toDocumentationAuditView(center.documentation),
    dependencies: toDependencyBoundaryAuditView(center.dependencies),
    completeness: toExecutiveStackCompletenessView(center.completeness),
    risks: toArchitectureRiskRegisterView(center.risks),
    recommendations: toArchitectureRecommendationsView(center.recommendations),
    review_score: toArchitectureReviewScoreView(center.reviewScore),
    generated_at: center.generatedAt.toISOString(),
  };
}
