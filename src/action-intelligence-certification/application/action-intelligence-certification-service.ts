import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  createExecutiveIntelligenceCenterService,
  type ExecutiveIntelligenceCenterService,
} from "../../executive-intelligence-center/application/executive-intelligence-center-service.js";
import {
  ACTION_INTELLIGENCE_CERTIFICATION_JSON_SCHEMA,
  ACTION_INTELLIGENCE_CERTIFICATION_ROUTES,
  ACTION_INTELLIGENCE_CERTIFICATION_SCHEMA_VERSION,
  type CertificationScenarioId,
} from "../domain/action-intelligence-certification-schema.js";
import type { ActionIntelligenceCertificationContext } from "../domain/action-intelligence-certification-context.js";
import {
  buildActionIntelligenceCertificationHome,
  buildActionIntelligenceCertificationSummary,
  toCertificationPlatformScreen,
  toCertificationDomainScreen,
  toCertificationExecutiveReportScreen,
  toCertificationExplanationScreen,
  toCertificationSummaryScreen,
  toCertificationValidationScreen,
} from "../domain/action-intelligence-certification-screens.js";
import {
  createPlatformCertificationBuilder,
  createArchitectureCertificationBuilder,
  createDelegationCertificationBuilder,
  createDeterminismCertificationBuilder,
  createExplainabilityCertificationBuilder,
  createDependencyCertificationBuilder,
  createApiCertificationBuilder,
  createReadinessCertificationBuilder,
  createEcosystemCertificationBuilder,
  createExecutiveCertificationReportBuilder,
  createCertificationConfidenceBuilder,
  createCertificationExplanationBuilder,
} from "./action-intelligence-certification-builder.js";
import { createActionIntelligenceCertificationValidator } from "./action-intelligence-certification-validator.js";
import {
  createActionIntelligenceCertificationRepository,
  type ActionIntelligenceCertificationRepository,
} from "../infrastructure/action-intelligence-certification-repository.js";

export interface ActionIntelligenceCertificationQuery {
  scenario_id?: CertificationScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class ActionIntelligenceCertificationService {
  private readonly repository: ActionIntelligenceCertificationRepository;
  private readonly executiveIntelligenceCenter: ExecutiveIntelligenceCenterService;
  private readonly platformBuilder = createPlatformCertificationBuilder();
  private readonly architectureBuilder = createArchitectureCertificationBuilder();
  private readonly delegationBuilder = createDelegationCertificationBuilder();
  private readonly determinismBuilder = createDeterminismCertificationBuilder();
  private readonly explainabilityBuilder = createExplainabilityCertificationBuilder();
  private readonly dependencyBuilder = createDependencyCertificationBuilder();
  private readonly apiBuilder = createApiCertificationBuilder();
  private readonly readinessBuilder = createReadinessCertificationBuilder();
  private readonly ecosystemBuilder = createEcosystemCertificationBuilder();
  private readonly reportBuilder = createExecutiveCertificationReportBuilder();
  private readonly confidenceBuilder = createCertificationConfidenceBuilder();
  private readonly explanationBuilder = createCertificationExplanationBuilder();
  private readonly validator = createActionIntelligenceCertificationValidator();

  constructor(deps?: {
    repository?: ActionIntelligenceCertificationRepository;
    executiveIntelligenceCenter?: ExecutiveIntelligenceCenterService;
  }) {
    this.executiveIntelligenceCenter =
      deps?.executiveIntelligenceCenter ?? createExecutiveIntelligenceCenterService();
    this.repository =
      deps?.repository ??
      createActionIntelligenceCertificationRepository({
        executiveIntelligenceCenter: this.executiveIntelligenceCenter,
      });
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const executiveHome = this.executiveIntelligenceCenter.getHome(authContext);
    return buildActionIntelligenceCertificationHome({ scenarios: executiveHome.scenarios });
  }

  getPlatform(authContext: AuthContext, query: ActionIntelligenceCertificationQuery = {}) {
    this.assertAuthenticated(authContext);
    return toCertificationPlatformScreen(this.buildOutput(authContext, query));
  }

  getArchitecture(authContext: AuthContext, query: ActionIntelligenceCertificationQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toCertificationDomainScreen(output, output.architectureCertification);
  }

  getDelegation(authContext: AuthContext, query: ActionIntelligenceCertificationQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toCertificationDomainScreen(output, output.delegationCertification);
  }

  getDeterminism(authContext: AuthContext, query: ActionIntelligenceCertificationQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toCertificationDomainScreen(output, output.determinismCertification);
  }

  getExplainability(authContext: AuthContext, query: ActionIntelligenceCertificationQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toCertificationDomainScreen(output, output.explainabilityCertification);
  }

  getDependency(authContext: AuthContext, query: ActionIntelligenceCertificationQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toCertificationDomainScreen(output, output.dependencyCertification);
  }

  getApi(authContext: AuthContext, query: ActionIntelligenceCertificationQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toCertificationDomainScreen(output, output.apiCertification);
  }

  getReadiness(authContext: AuthContext, query: ActionIntelligenceCertificationQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toCertificationDomainScreen(output, output.readinessCertification);
  }

  getEcosystem(authContext: AuthContext, query: ActionIntelligenceCertificationQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toCertificationDomainScreen(output, output.ecosystemCertification);
  }

  getExecutiveReport(authContext: AuthContext, query: ActionIntelligenceCertificationQuery = {}) {
    this.assertAuthenticated(authContext);
    return toCertificationExecutiveReportScreen(this.buildOutput(authContext, query));
  }

  getExplanation(authContext: AuthContext, query: ActionIntelligenceCertificationQuery = {}) {
    this.assertAuthenticated(authContext);
    return toCertificationExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: ActionIntelligenceCertificationQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toCertificationSummaryScreen(buildActionIntelligenceCertificationSummary(output));
  }

  validate(authContext: AuthContext, query: ActionIntelligenceCertificationQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toCertificationValidationScreen(this.validator.validateCatalogCoverage());
    }
    return toCertificationValidationScreen(
      this.validator.validateOutput(this.buildOutput(authContext, query))
    );
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: ACTION_INTELLIGENCE_CERTIFICATION_SCHEMA_VERSION,
      routes: ACTION_INTELLIGENCE_CERTIFICATION_ROUTES,
      json_schema: ACTION_INTELLIGENCE_CERTIFICATION_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(
    authContext: AuthContext,
    query: ActionIntelligenceCertificationQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: ActionIntelligenceCertificationQuery) {
    const context = toContext(query);
    const executiveQuery = toExecutiveQuery(query);
    const { executive } = this.repository.resolveUpstream(authContext, context, executiveQuery);

    const platformCertification = this.platformBuilder.build(executive);
    const architectureCertification = this.architectureBuilder.build(executive);
    const delegationCertification = this.delegationBuilder.build(executive);
    const determinismCertification = this.determinismBuilder.build(executive);
    const explainabilityCertification = this.explainabilityBuilder.build(executive);
    const dependencyCertification = this.dependencyBuilder.build(executive);
    const apiCertification = this.apiBuilder.build();
    const readinessCertification = this.readinessBuilder.build(executive);
    const ecosystemCertification = this.ecosystemBuilder.build(executive);

    const domainScores = [
      { name: "Platform", level: platformCertification.level, score: platformCertification.score },
      {
        name: "Architecture",
        level: architectureCertification.level,
        score: Math.round(
          architectureCertification.checks.reduce((s, c) => s + c.score, 0) /
            architectureCertification.checks.length
        ),
      },
      {
        name: "Delegation",
        level: delegationCertification.level,
        score: Math.round(
          delegationCertification.checks.reduce((s, c) => s + c.score, 0) /
            delegationCertification.checks.length
        ),
      },
      {
        name: "Determinism",
        level: determinismCertification.level,
        score: Math.round(
          determinismCertification.checks.reduce((s, c) => s + c.score, 0) /
            determinismCertification.checks.length
        ),
      },
      {
        name: "Explainability",
        level: explainabilityCertification.level,
        score: Math.round(
          explainabilityCertification.checks.reduce((s, c) => s + c.score, 0) /
            explainabilityCertification.checks.length
        ),
      },
      {
        name: "Dependency",
        level: dependencyCertification.level,
        score: Math.round(
          dependencyCertification.checks.reduce((s, c) => s + c.score, 0) /
            dependencyCertification.checks.length
        ),
      },
      { name: "API", level: apiCertification.level, score: 100 },
      {
        name: "Readiness",
        level: readinessCertification.level,
        score: readinessCertification.readinessScore,
      },
      {
        name: "Ecosystem",
        level: ecosystemCertification.level,
        score: Math.round(
          ecosystemCertification.checks.reduce((s, c) => s + c.score, 0) /
            ecosystemCertification.checks.length
        ),
      },
    ];

    const executiveCertificationReport = this.reportBuilder.build(executive, domainScores);
    const certificationConfidence = this.confidenceBuilder.build(
      executive,
      executiveCertificationReport.overallScore
    );

    const outputId = `certification-${executive.outputId}`;

    const explanation = this.explanationBuilder.build({
      outputId,
      goal: executive.goal,
      executive,
      report: executiveCertificationReport,
      architecture: architectureCertification,
      delegation: delegationCertification,
      ecosystem: ecosystemCertification,
      certificationConfidenceScore: certificationConfidence.score,
    });

    return {
      outputId,
      executiveCenterOutputId: executive.outputId,
      dashboardOutputId: executive.dashboardOutputId,
      orchestrationOutputId: executive.orchestrationOutputId,
      canonicalActionId: executive.canonicalActionId,
      scenarioId: executive.scenarioId,
      goal: executive.goal,
      platformCertification,
      architectureCertification,
      delegationCertification,
      determinismCertification,
      explainabilityCertification,
      dependencyCertification,
      apiCertification,
      readinessCertification,
      ecosystemCertification,
      executiveCertificationReport,
      certificationConfidence,
      explanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: ActionIntelligenceCertificationQuery): ActionIntelligenceCertificationContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toExecutiveQuery(query: ActionIntelligenceCertificationQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createActionIntelligenceCertificationService(
  deps?: ConstructorParameters<typeof ActionIntelligenceCertificationService>[0]
): ActionIntelligenceCertificationService {
  return new ActionIntelligenceCertificationService(deps);
}

export function createActionIntelligenceCertificationModule(deps?: {
  repository?: ActionIntelligenceCertificationRepository;
  executiveIntelligenceCenter?: ExecutiveIntelligenceCenterService;
}) {
  const executiveIntelligenceCenter =
    deps?.executiveIntelligenceCenter ?? createExecutiveIntelligenceCenterService();
  const actionIntelligenceCertification = createActionIntelligenceCertificationService({
    executiveIntelligenceCenter,
    repository:
      deps?.repository ??
      createActionIntelligenceCertificationRepository({ executiveIntelligenceCenter }),
  });
  return { actionIntelligenceCertification };
}

export type ActionIntelligenceCertificationModule = ReturnType<
  typeof createActionIntelligenceCertificationModule
>;
