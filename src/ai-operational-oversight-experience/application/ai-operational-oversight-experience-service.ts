import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  createAiConformanceValidationExperienceService,
  type AiConformanceValidationExperienceService,
  type AiConformanceValidationExperienceQuery,
} from "../../ai-conformance-validation-experience/application/ai-conformance-validation-experience-service.js";
import {
  AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_JSON_SCHEMA,
  AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_ROUTES,
  AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_SCHEMA_VERSION,
  type OperationalOversightScenarioId,
} from "../domain/ai-operational-oversight-experience-schema.js";
import type { AiOperationalOversightExperienceContext } from "../domain/ai-operational-oversight-experience-context.js";
import {
  buildAiOperationalOversightExperienceHome,
  buildAiOperationalOversightExperienceSummary,
  toOperationalOversightDomainScreen,
  toOperationalOversightExplanationScreen,
  toOperationalOversightSummaryScreen,
  toOperationalOversightValidationScreen,
} from "../domain/ai-operational-oversight-experience-screens.js";
import {
  createOversightContextBuilder,
  createOversightDashboardBuilder,
  createOperationalHealthBuilder,
  createOversightMatrixBuilder,
  createComplianceMonitorBuilder,
  createExceptionMonitorBuilder,
  createInterventionPlanBuilder,
  createOversightReportBuilder,
  createOversightConfidenceBuilder,
  createDelegationOperationalOversightBuilder,
  createOversightExplanationBuilder,
} from "./ai-operational-oversight-experience-builder.js";
import { createAiOperationalOversightExperienceValidator } from "./ai-operational-oversight-experience-validator.js";
import {
  createAiOperationalOversightExperienceRepository,
  type AiOperationalOversightExperienceRepository,
} from "../infrastructure/ai-operational-oversight-experience-repository.js";

export interface AiOperationalOversightExperienceQuery {
  scenario_id?: OperationalOversightScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class AiOperationalOversightExperienceService {
  private readonly repository: AiOperationalOversightExperienceRepository;
  private readonly aiConformanceValidationExperience: AiConformanceValidationExperienceService;
  private readonly contextBuilder = createOversightContextBuilder();
  private readonly dashboardBuilder = createOversightDashboardBuilder();
  private readonly healthBuilder = createOperationalHealthBuilder();
  private readonly matrixBuilder = createOversightMatrixBuilder();
  private readonly complianceMonitorBuilder = createComplianceMonitorBuilder();
  private readonly exceptionMonitorBuilder = createExceptionMonitorBuilder();
  private readonly interventionPlanBuilder = createInterventionPlanBuilder();
  private readonly reportBuilder = createOversightReportBuilder();
  private readonly confidenceBuilder = createOversightConfidenceBuilder();
  private readonly delegationBuilder = createDelegationOperationalOversightBuilder();
  private readonly explanationBuilder = createOversightExplanationBuilder();
  private readonly validator = createAiOperationalOversightExperienceValidator();

  constructor(deps?: {
    repository?: AiOperationalOversightExperienceRepository;
    aiConformanceValidationExperience?: AiConformanceValidationExperienceService;
  }) {
    this.aiConformanceValidationExperience =
      deps?.aiConformanceValidationExperience ?? createAiConformanceValidationExperienceService();
    this.repository =
      deps?.repository ??
      createAiOperationalOversightExperienceRepository({
        aiConformanceValidationExperience: this.aiConformanceValidationExperience,
      });
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const conformanceHome = this.aiConformanceValidationExperience.getHome(authContext);
    return buildAiOperationalOversightExperienceHome({ scenarios: conformanceHome.scenarios });
  }

  getOversightDashboard(
    authContext: AuthContext,
    query: AiOperationalOversightExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toOperationalOversightDomainScreen(output, output.oversightDashboard);
  }

  getOperationalHealth(
    authContext: AuthContext,
    query: AiOperationalOversightExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toOperationalOversightDomainScreen(output, output.operationalHealth);
  }

  getOversightMatrix(
    authContext: AuthContext,
    query: AiOperationalOversightExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toOperationalOversightDomainScreen(output, output.oversightMatrix);
  }

  getComplianceMonitor(
    authContext: AuthContext,
    query: AiOperationalOversightExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toOperationalOversightDomainScreen(output, output.complianceMonitor);
  }

  getExceptionMonitor(
    authContext: AuthContext,
    query: AiOperationalOversightExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toOperationalOversightDomainScreen(output, output.exceptionMonitor);
  }

  getInterventionPlan(
    authContext: AuthContext,
    query: AiOperationalOversightExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toOperationalOversightDomainScreen(output, output.interventionPlan);
  }

  getOversightReport(
    authContext: AuthContext,
    query: AiOperationalOversightExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toOperationalOversightDomainScreen(output, output.oversightReport);
  }

  getConfidence(authContext: AuthContext, query: AiOperationalOversightExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toOperationalOversightDomainScreen(output, output.oversightConfidence);
  }

  getExplanation(authContext: AuthContext, query: AiOperationalOversightExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toOperationalOversightExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: AiOperationalOversightExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toOperationalOversightSummaryScreen(buildAiOperationalOversightExperienceSummary(output));
  }

  validate(authContext: AuthContext, query: AiOperationalOversightExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toOperationalOversightValidationScreen(this.validator.validateCatalogCoverage());
    }
    return toOperationalOversightValidationScreen(
      this.validator.validateOutput(this.buildOutput(authContext, query))
    );
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_SCHEMA_VERSION,
      routes: AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_ROUTES,
      json_schema: AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(
    authContext: AuthContext,
    query: AiOperationalOversightExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: AiOperationalOversightExperienceQuery) {
    const context = toContext(query);
    const conformanceQuery = toConformanceValidationQuery(query);
    const { conformanceValidation } = this.repository.resolveUpstream(
      authContext,
      context,
      conformanceQuery
    );

    const oversightContext = this.contextBuilder.build(conformanceValidation);
    const oversightDashboard = this.dashboardBuilder.build(conformanceValidation);
    const operationalHealth = this.healthBuilder.build(conformanceValidation);
    const oversightMatrix = this.matrixBuilder.build(conformanceValidation);
    const complianceMonitor = this.complianceMonitorBuilder.build(conformanceValidation);
    const exceptionMonitor = this.exceptionMonitorBuilder.build(conformanceValidation);
    const interventionPlan = this.interventionPlanBuilder.build(conformanceValidation);
    const oversightReport = this.reportBuilder.build(conformanceValidation);
    const oversightConfidence = this.confidenceBuilder.build(conformanceValidation);
    const delegationOperationalOversight = this.delegationBuilder.build(conformanceValidation);

    const outputId = `operational-oversight-${conformanceValidation.outputId}`;

    const oversightExplanation = this.explanationBuilder.build({
      outputId,
      goal: conformanceValidation.goal,
      dashboard: oversightDashboard,
      oversightMatrix,
      complianceMonitor,
      oversightConfidenceScore: oversightConfidence.score,
    });

    return {
      outputId,
      conformanceValidationOutputId: conformanceValidation.outputId,
      accountabilityLedgerOutputId: conformanceValidation.accountabilityLedgerOutputId,
      governanceAssuranceOutputId: conformanceValidation.governanceAssuranceOutputId,
      executiveAdvisoryOutputId: conformanceValidation.executiveAdvisoryOutputId,
      predictiveForecastOutputId: conformanceValidation.predictiveForecastOutputId,
      strategicIntelligenceOutputId: conformanceValidation.strategicIntelligenceOutputId,
      decisionIntelligenceOutputId: conformanceValidation.decisionIntelligenceOutputId,
      orchestrationOutputId: conformanceValidation.orchestrationOutputId,
      foundationOutputId: conformanceValidation.foundationOutputId,
      closureOutputId: conformanceValidation.closureOutputId,
      canonicalActionId: conformanceValidation.canonicalActionId,
      scenarioId: conformanceValidation.scenarioId,
      goal: conformanceValidation.goal,
      oversightContext,
      oversightDashboard,
      operationalHealth,
      oversightMatrix,
      complianceMonitor,
      exceptionMonitor,
      interventionPlan,
      oversightReport,
      oversightConfidence,
      delegationOperationalOversight,
      oversightExplanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(
  query: AiOperationalOversightExperienceQuery
): AiOperationalOversightExperienceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toConformanceValidationQuery(
  query: AiOperationalOversightExperienceQuery
): AiConformanceValidationExperienceQuery {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createAiOperationalOversightExperienceService(
  deps?: ConstructorParameters<typeof AiOperationalOversightExperienceService>[0]
): AiOperationalOversightExperienceService {
  return new AiOperationalOversightExperienceService(deps);
}

export function createAiOperationalOversightExperienceModule(deps?: {
  repository?: AiOperationalOversightExperienceRepository;
  aiConformanceValidationExperience?: AiConformanceValidationExperienceService;
}) {
  const aiConformanceValidationExperience =
    deps?.aiConformanceValidationExperience ?? createAiConformanceValidationExperienceService();
  const aiOperationalOversightExperience = createAiOperationalOversightExperienceService({
    aiConformanceValidationExperience,
    repository:
      deps?.repository ??
      createAiOperationalOversightExperienceRepository({ aiConformanceValidationExperience }),
  });
  return { aiOperationalOversightExperience };
}

export type AiOperationalOversightExperienceModule = ReturnType<
  typeof createAiOperationalOversightExperienceModule
>;
