import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  createActionIntelligenceCertificationService,
  type ActionIntelligenceCertificationService,
} from "../../action-intelligence-certification/application/action-intelligence-certification-service.js";
import {
  ACTION_INTELLIGENCE_FINAL_CLOSURE_JSON_SCHEMA,
  ACTION_INTELLIGENCE_FINAL_CLOSURE_ROUTES,
  ACTION_INTELLIGENCE_FINAL_CLOSURE_SCHEMA_VERSION,
  type ClosureScenarioId,
} from "../domain/action-intelligence-final-closure-schema.js";
import type { ActionIntelligenceFinalClosureContext } from "../domain/action-intelligence-final-closure-context.js";
import {
  buildActionIntelligenceFinalClosureHome,
  buildActionIntelligenceFinalClosureSummary,
  toClosureChapterStatusScreen,
  toClosureDomainScreen,
  toClosureExecutiveScreen,
  toClosureHandoffScreen,
  toClosureExplanationScreen,
  toClosureSummaryScreen,
  toClosureValidationScreen,
} from "../domain/action-intelligence-final-closure-screens.js";
import {
  createChapterCompletionStatusBuilder,
  createArchitectureCompletionReportBuilder,
  createEcosystemCompletionReportBuilder,
  createClosureCertificationSummaryBuilder,
  createImplementationStatisticsBuilder,
  createDependencySummaryBuilder,
  createReadinessSummaryBuilder,
  createFinalExecutiveClosureReportBuilder,
  createChapterHandoffReportBuilder,
  createClosureConfidenceBuilder,
  createClosureExplanationBuilder,
} from "./action-intelligence-final-closure-builder.js";
import { createActionIntelligenceFinalClosureValidator } from "./action-intelligence-final-closure-validator.js";
import {
  createActionIntelligenceFinalClosureRepository,
  type ActionIntelligenceFinalClosureRepository,
} from "../infrastructure/action-intelligence-final-closure-repository.js";

export interface ActionIntelligenceFinalClosureQuery {
  scenario_id?: ClosureScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class ActionIntelligenceFinalClosureService {
  private readonly repository: ActionIntelligenceFinalClosureRepository;
  private readonly actionIntelligenceCertification: ActionIntelligenceCertificationService;
  private readonly chapterStatusBuilder = createChapterCompletionStatusBuilder();
  private readonly architectureBuilder = createArchitectureCompletionReportBuilder();
  private readonly ecosystemBuilder = createEcosystemCompletionReportBuilder();
  private readonly certificationSummaryBuilder = createClosureCertificationSummaryBuilder();
  private readonly implementationStatsBuilder = createImplementationStatisticsBuilder();
  private readonly dependencySummaryBuilder = createDependencySummaryBuilder();
  private readonly readinessSummaryBuilder = createReadinessSummaryBuilder();
  private readonly executiveClosureBuilder = createFinalExecutiveClosureReportBuilder();
  private readonly handoffBuilder = createChapterHandoffReportBuilder();
  private readonly confidenceBuilder = createClosureConfidenceBuilder();
  private readonly explanationBuilder = createClosureExplanationBuilder();
  private readonly validator = createActionIntelligenceFinalClosureValidator();

  constructor(deps?: {
    repository?: ActionIntelligenceFinalClosureRepository;
    actionIntelligenceCertification?: ActionIntelligenceCertificationService;
  }) {
    this.actionIntelligenceCertification =
      deps?.actionIntelligenceCertification ?? createActionIntelligenceCertificationService();
    this.repository =
      deps?.repository ??
      createActionIntelligenceFinalClosureRepository({
        actionIntelligenceCertification: this.actionIntelligenceCertification,
      });
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const certificationHome = this.actionIntelligenceCertification.getHome(authContext);
    return buildActionIntelligenceFinalClosureHome({ scenarios: certificationHome.scenarios });
  }

  getChapterStatus(authContext: AuthContext, query: ActionIntelligenceFinalClosureQuery = {}) {
    this.assertAuthenticated(authContext);
    return toClosureChapterStatusScreen(this.buildOutput(authContext, query));
  }

  getArchitecture(authContext: AuthContext, query: ActionIntelligenceFinalClosureQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toClosureDomainScreen(output, output.architectureCompletionReport);
  }

  getEcosystem(authContext: AuthContext, query: ActionIntelligenceFinalClosureQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toClosureDomainScreen(output, output.ecosystemCompletionReport);
  }

  getCertification(authContext: AuthContext, query: ActionIntelligenceFinalClosureQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toClosureDomainScreen(output, output.certificationSummary);
  }

  getImplementation(authContext: AuthContext, query: ActionIntelligenceFinalClosureQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toClosureDomainScreen(output, output.implementationStatistics);
  }

  getDependency(authContext: AuthContext, query: ActionIntelligenceFinalClosureQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toClosureDomainScreen(output, output.dependencySummary);
  }

  getReadiness(authContext: AuthContext, query: ActionIntelligenceFinalClosureQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toClosureDomainScreen(output, output.readinessSummary);
  }

  getExecutiveClosure(authContext: AuthContext, query: ActionIntelligenceFinalClosureQuery = {}) {
    this.assertAuthenticated(authContext);
    return toClosureExecutiveScreen(this.buildOutput(authContext, query));
  }

  getHandoff(authContext: AuthContext, query: ActionIntelligenceFinalClosureQuery = {}) {
    this.assertAuthenticated(authContext);
    return toClosureHandoffScreen(this.buildOutput(authContext, query));
  }

  getExplanation(authContext: AuthContext, query: ActionIntelligenceFinalClosureQuery = {}) {
    this.assertAuthenticated(authContext);
    return toClosureExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: ActionIntelligenceFinalClosureQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toClosureSummaryScreen(buildActionIntelligenceFinalClosureSummary(output));
  }

  validate(authContext: AuthContext, query: ActionIntelligenceFinalClosureQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toClosureValidationScreen(this.validator.validateCatalogCoverage());
    }
    return toClosureValidationScreen(
      this.validator.validateOutput(this.buildOutput(authContext, query))
    );
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: ACTION_INTELLIGENCE_FINAL_CLOSURE_SCHEMA_VERSION,
      routes: ACTION_INTELLIGENCE_FINAL_CLOSURE_ROUTES,
      json_schema: ACTION_INTELLIGENCE_FINAL_CLOSURE_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(
    authContext: AuthContext,
    query: ActionIntelligenceFinalClosureQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: ActionIntelligenceFinalClosureQuery) {
    const context = toContext(query);
    const certificationQuery = toCertificationQuery(query);
    const { certification } = this.repository.resolveUpstream(
      authContext,
      context,
      certificationQuery
    );

    const chapterCompletionStatus = this.chapterStatusBuilder.build(certification);
    const architectureCompletionReport = this.architectureBuilder.build(certification);
    const ecosystemCompletionReport = this.ecosystemBuilder.build(certification);
    const certificationSummary = this.certificationSummaryBuilder.build(certification);
    const implementationStatistics = this.implementationStatsBuilder.build();
    const dependencySummary = this.dependencySummaryBuilder.build(certification);
    const readinessSummary = this.readinessSummaryBuilder.build(certification);
    const finalExecutiveClosureReport = this.executiveClosureBuilder.build(
      certification,
      chapterCompletionStatus
    );
    const chapterHandoffReport = this.handoffBuilder.build(
      certification,
      readinessSummary,
      chapterCompletionStatus
    );
    const closureConfidence = this.confidenceBuilder.build(
      certification,
      chapterCompletionStatus.score
    );

    const outputId = `closure-${certification.outputId}`;

    const explanation = this.explanationBuilder.build({
      outputId,
      goal: certification.goal,
      certification,
      chapterStatus: chapterCompletionStatus,
      architecture: architectureCompletionReport,
      ecosystem: ecosystemCompletionReport,
      handoff: chapterHandoffReport,
      closureConfidenceScore: closureConfidence.score,
    });

    return {
      outputId,
      certificationOutputId: certification.outputId,
      executiveCenterOutputId: certification.executiveCenterOutputId,
      dashboardOutputId: certification.dashboardOutputId,
      orchestrationOutputId: certification.orchestrationOutputId,
      canonicalActionId: certification.canonicalActionId,
      scenarioId: certification.scenarioId,
      goal: certification.goal,
      chapterCompletionStatus,
      architectureCompletionReport,
      ecosystemCompletionReport,
      certificationSummary,
      implementationStatistics,
      dependencySummary,
      readinessSummary,
      finalExecutiveClosureReport,
      chapterHandoffReport,
      closureConfidence,
      explanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: ActionIntelligenceFinalClosureQuery): ActionIntelligenceFinalClosureContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toCertificationQuery(query: ActionIntelligenceFinalClosureQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createActionIntelligenceFinalClosureService(
  deps?: ConstructorParameters<typeof ActionIntelligenceFinalClosureService>[0]
): ActionIntelligenceFinalClosureService {
  return new ActionIntelligenceFinalClosureService(deps);
}

export function createActionIntelligenceFinalClosureModule(deps?: {
  repository?: ActionIntelligenceFinalClosureRepository;
  actionIntelligenceCertification?: ActionIntelligenceCertificationService;
}) {
  const actionIntelligenceCertification =
    deps?.actionIntelligenceCertification ?? createActionIntelligenceCertificationService();
  const actionIntelligenceFinalClosure = createActionIntelligenceFinalClosureService({
    actionIntelligenceCertification,
    repository:
      deps?.repository ??
      createActionIntelligenceFinalClosureRepository({ actionIntelligenceCertification }),
  });
  return { actionIntelligenceFinalClosure };
}

export type ActionIntelligenceFinalClosureModule = ReturnType<
  typeof createActionIntelligenceFinalClosureModule
>;
