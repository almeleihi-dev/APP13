import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  createAiExecutiveIntelligenceExperienceService,
  type AiExecutiveIntelligenceExperienceService,
} from "../../ai-executive-intelligence-experience/application/ai-executive-intelligence-experience-service.js";
import {
  AI_ORCHESTRATION_EXPERIENCE_JSON_SCHEMA,
  AI_ORCHESTRATION_EXPERIENCE_ROUTES,
  AI_ORCHESTRATION_EXPERIENCE_SCHEMA_VERSION,
  type OrchestrationScenarioId,
} from "../domain/ai-orchestration-experience-schema.js";
import type { AiOrchestrationExperienceContext } from "../domain/ai-orchestration-experience-context.js";
import {
  buildAiOrchestrationExperienceHome,
  buildAiOrchestrationExperienceSummary,
  toOrchestrationDomainScreen,
  toOrchestrationExplanationScreen,
  toOrchestrationSummaryScreen,
  toOrchestrationValidationScreen,
} from "../domain/ai-orchestration-experience-screens.js";
import {
  createOrchestrationContextBuilder,
  createOrchestrationDashboardBuilder,
  createIntelligencePipelineBuilder,
  createModuleCoordinationBuilder,
  createDependencyGraphBuilder,
  createExecutionFlowBuilder,
  createSynchronizationStatusBuilder,
  createSystemHealthBuilder,
  createOrchestrationReadinessBuilder,
  createOrchestrationConfidenceBuilder,
  createDelegationOrchestrationBuilder,
  createOrchestrationExplanationBuilder,
} from "./ai-orchestration-experience-builder.js";
import { createAiOrchestrationExperienceValidator } from "./ai-orchestration-experience-validator.js";
import {
  createAiOrchestrationExperienceRepository,
  type AiOrchestrationExperienceRepository,
} from "../infrastructure/ai-orchestration-experience-repository.js";

export interface AiOrchestrationExperienceQuery {
  scenario_id?: OrchestrationScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class AiOrchestrationExperienceService {
  private readonly repository: AiOrchestrationExperienceRepository;
  private readonly aiExecutiveIntelligenceExperience: AiExecutiveIntelligenceExperienceService;
  private readonly contextBuilder = createOrchestrationContextBuilder();
  private readonly dashboardBuilder = createOrchestrationDashboardBuilder();
  private readonly pipelineBuilder = createIntelligencePipelineBuilder();
  private readonly coordinationBuilder = createModuleCoordinationBuilder();
  private readonly dependencyBuilder = createDependencyGraphBuilder();
  private readonly flowBuilder = createExecutionFlowBuilder();
  private readonly syncBuilder = createSynchronizationStatusBuilder();
  private readonly healthBuilder = createSystemHealthBuilder();
  private readonly readinessBuilder = createOrchestrationReadinessBuilder();
  private readonly confidenceBuilder = createOrchestrationConfidenceBuilder();
  private readonly delegationBuilder = createDelegationOrchestrationBuilder();
  private readonly explanationBuilder = createOrchestrationExplanationBuilder();
  private readonly validator = createAiOrchestrationExperienceValidator();

  constructor(deps?: {
    repository?: AiOrchestrationExperienceRepository;
    aiExecutiveIntelligenceExperience?: AiExecutiveIntelligenceExperienceService;
  }) {
    this.aiExecutiveIntelligenceExperience =
      deps?.aiExecutiveIntelligenceExperience ??
      createAiExecutiveIntelligenceExperienceService();
    this.repository =
      deps?.repository ??
      createAiOrchestrationExperienceRepository({
        aiExecutiveIntelligenceExperience: this.aiExecutiveIntelligenceExperience,
      });
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const execHome = this.aiExecutiveIntelligenceExperience.getHome(authContext);
    return buildAiOrchestrationExperienceHome({ scenarios: execHome.scenarios });
  }

  getIntelligencePipeline(
    authContext: AuthContext,
    query: AiOrchestrationExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toOrchestrationDomainScreen(output, output.intelligencePipeline);
  }

  getModuleCoordination(authContext: AuthContext, query: AiOrchestrationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toOrchestrationDomainScreen(output, output.moduleCoordination);
  }

  getDependencyGraph(authContext: AuthContext, query: AiOrchestrationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toOrchestrationDomainScreen(output, output.dependencyGraph);
  }

  getExecutionFlow(authContext: AuthContext, query: AiOrchestrationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toOrchestrationDomainScreen(output, output.executionFlow);
  }

  getSynchronizationStatus(
    authContext: AuthContext,
    query: AiOrchestrationExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toOrchestrationDomainScreen(output, output.synchronizationStatus);
  }

  getSystemHealth(authContext: AuthContext, query: AiOrchestrationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toOrchestrationDomainScreen(output, output.systemHealth);
  }

  getOrchestrationReadiness(
    authContext: AuthContext,
    query: AiOrchestrationExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toOrchestrationDomainScreen(output, output.orchestrationReadiness);
  }

  getOrchestrationConfidence(
    authContext: AuthContext,
    query: AiOrchestrationExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toOrchestrationDomainScreen(output, output.orchestrationConfidence);
  }

  getDelegation(authContext: AuthContext, query: AiOrchestrationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toOrchestrationDomainScreen(output, output.delegationOrchestration);
  }

  getExplanation(authContext: AuthContext, query: AiOrchestrationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toOrchestrationExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: AiOrchestrationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toOrchestrationSummaryScreen(buildAiOrchestrationExperienceSummary(output));
  }

  validate(authContext: AuthContext, query: AiOrchestrationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toOrchestrationValidationScreen(this.validator.validateCatalogCoverage());
    }
    return toOrchestrationValidationScreen(
      this.validator.validateOutput(this.buildOutput(authContext, query))
    );
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: AI_ORCHESTRATION_EXPERIENCE_SCHEMA_VERSION,
      routes: AI_ORCHESTRATION_EXPERIENCE_ROUTES,
      json_schema: AI_ORCHESTRATION_EXPERIENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(
    authContext: AuthContext,
    query: AiOrchestrationExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: AiOrchestrationExperienceQuery) {
    const context = toContext(query);
    const execQuery = toExecutiveIntelligenceQuery(query);
    const { executiveIntelligence } = this.repository.resolveUpstream(
      authContext,
      context,
      execQuery
    );

    const orchestrationContext = this.contextBuilder.build(executiveIntelligence);
    const orchestrationDashboard = this.dashboardBuilder.build(executiveIntelligence);
    const intelligencePipeline = this.pipelineBuilder.build(executiveIntelligence);
    const moduleCoordination = this.coordinationBuilder.build(executiveIntelligence);
    const dependencyGraph = this.dependencyBuilder.build(executiveIntelligence);
    const executionFlow = this.flowBuilder.build(executiveIntelligence);
    const synchronizationStatus = this.syncBuilder.build(executiveIntelligence);
    const systemHealth = this.healthBuilder.build(executiveIntelligence);
    const orchestrationReadiness = this.readinessBuilder.build(executiveIntelligence);
    const orchestrationConfidence = this.confidenceBuilder.build(executiveIntelligence);
    const delegationOrchestration = this.delegationBuilder.build(executiveIntelligence);

    const outputId = `orchestration-${executiveIntelligence.outputId}`;

    const orchestrationExplanation = this.explanationBuilder.build({
      outputId,
      goal: executiveIntelligence.goal,
      dashboard: orchestrationDashboard,
      pipeline: intelligencePipeline,
      readiness: orchestrationReadiness,
      orchestrationConfidenceScore: orchestrationConfidence.score,
    });

    return {
      outputId,
      executiveIntelligenceOutputId: executiveIntelligence.outputId,
      predictiveIntelligenceOutputId: executiveIntelligence.predictiveIntelligenceOutputId,
      recommendationIntelligenceOutputId: executiveIntelligence.recommendationIntelligenceOutputId,
      insightGenerationOutputId: executiveIntelligence.insightGenerationOutputId,
      adaptiveCoachingOutputId: executiveIntelligence.adaptiveCoachingOutputId,
      progressIntelligenceOutputId: executiveIntelligence.progressIntelligenceOutputId,
      executionCompanionOutputId: executiveIntelligence.executionCompanionOutputId,
      actionPlanningOutputId: executiveIntelligence.actionPlanningOutputId,
      decisionSupportOutputId: executiveIntelligence.decisionSupportOutputId,
      guidanceOutputId: executiveIntelligence.guidanceOutputId,
      conversationOutputId: executiveIntelligence.conversationOutputId,
      foundationOutputId: executiveIntelligence.foundationOutputId,
      closureOutputId: executiveIntelligence.closureOutputId,
      canonicalActionId: executiveIntelligence.canonicalActionId,
      scenarioId: executiveIntelligence.scenarioId,
      goal: executiveIntelligence.goal,
      orchestrationContext,
      orchestrationDashboard,
      intelligencePipeline,
      moduleCoordination,
      dependencyGraph,
      executionFlow,
      synchronizationStatus,
      systemHealth,
      orchestrationReadiness,
      orchestrationConfidence,
      delegationOrchestration,
      orchestrationExplanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: AiOrchestrationExperienceQuery): AiOrchestrationExperienceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toExecutiveIntelligenceQuery(query: AiOrchestrationExperienceQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createAiOrchestrationExperienceService(
  deps?: ConstructorParameters<typeof AiOrchestrationExperienceService>[0]
): AiOrchestrationExperienceService {
  return new AiOrchestrationExperienceService(deps);
}

export function createAiOrchestrationExperienceModule(deps?: {
  repository?: AiOrchestrationExperienceRepository;
  aiExecutiveIntelligenceExperience?: AiExecutiveIntelligenceExperienceService;
}) {
  const aiExecutiveIntelligenceExperience =
    deps?.aiExecutiveIntelligenceExperience ??
    createAiExecutiveIntelligenceExperienceService();
  const aiOrchestrationExperience = createAiOrchestrationExperienceService({
    aiExecutiveIntelligenceExperience,
    repository:
      deps?.repository ??
      createAiOrchestrationExperienceRepository({ aiExecutiveIntelligenceExperience }),
  });
  return { aiOrchestrationExperience };
}

export type AiOrchestrationExperienceModule = ReturnType<
  typeof createAiOrchestrationExperienceModule
>;
