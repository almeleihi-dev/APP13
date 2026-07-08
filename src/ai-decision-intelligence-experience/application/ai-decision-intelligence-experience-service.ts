import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  createAiOrchestrationExperienceService,
  type AiOrchestrationExperienceService,
} from "../../ai-orchestration-experience/application/ai-orchestration-experience-service.js";
import {
  AI_DECISION_INTELLIGENCE_EXPERIENCE_JSON_SCHEMA,
  AI_DECISION_INTELLIGENCE_EXPERIENCE_ROUTES,
  AI_DECISION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
  type DecisionIntelligenceScenarioId,
} from "../domain/ai-decision-intelligence-experience-schema.js";
import type { AiDecisionIntelligenceExperienceContext } from "../domain/ai-decision-intelligence-experience-context.js";
import {
  buildAiDecisionIntelligenceExperienceHome,
  buildAiDecisionIntelligenceExperienceSummary,
  toDecisionIntelligenceDomainScreen,
  toDecisionIntelligenceExplanationScreen,
  toDecisionIntelligenceSummaryScreen,
  toDecisionIntelligenceValidationScreen,
} from "../domain/ai-decision-intelligence-experience-screens.js";
import {
  createDecisionContextBuilder,
  createDecisionDashboardBuilder,
  createDecisionTreeBuilder,
  createDecisionOptionsBuilder,
  createDecisionRecommendationsBuilder,
  createRiskAnalysisBuilder,
  createOpportunityAnalysisBuilder,
  createPriorityMatrixBuilder,
  createDecisionConfidenceBuilder,
  createDelegationDecisionIntelligenceBuilder,
  createDecisionExplanationBuilder,
} from "./ai-decision-intelligence-experience-builder.js";
import { createAiDecisionIntelligenceExperienceValidator } from "./ai-decision-intelligence-experience-validator.js";
import {
  createAiDecisionIntelligenceExperienceRepository,
  type AiDecisionIntelligenceExperienceRepository,
} from "../infrastructure/ai-decision-intelligence-experience-repository.js";

export interface AiDecisionIntelligenceExperienceQuery {
  scenario_id?: DecisionIntelligenceScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class AiDecisionIntelligenceExperienceService {
  private readonly repository: AiDecisionIntelligenceExperienceRepository;
  private readonly aiOrchestrationExperience: AiOrchestrationExperienceService;
  private readonly contextBuilder = createDecisionContextBuilder();
  private readonly dashboardBuilder = createDecisionDashboardBuilder();
  private readonly treeBuilder = createDecisionTreeBuilder();
  private readonly optionsBuilder = createDecisionOptionsBuilder();
  private readonly recommendationsBuilder = createDecisionRecommendationsBuilder();
  private readonly riskBuilder = createRiskAnalysisBuilder();
  private readonly opportunityBuilder = createOpportunityAnalysisBuilder();
  private readonly matrixBuilder = createPriorityMatrixBuilder();
  private readonly confidenceBuilder = createDecisionConfidenceBuilder();
  private readonly delegationBuilder = createDelegationDecisionIntelligenceBuilder();
  private readonly explanationBuilder = createDecisionExplanationBuilder();
  private readonly validator = createAiDecisionIntelligenceExperienceValidator();

  constructor(deps?: {
    repository?: AiDecisionIntelligenceExperienceRepository;
    aiOrchestrationExperience?: AiOrchestrationExperienceService;
  }) {
    this.aiOrchestrationExperience =
      deps?.aiOrchestrationExperience ?? createAiOrchestrationExperienceService();
    this.repository =
      deps?.repository ??
      createAiDecisionIntelligenceExperienceRepository({
        aiOrchestrationExperience: this.aiOrchestrationExperience,
      });
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const orchHome = this.aiOrchestrationExperience.getHome(authContext);
    return buildAiDecisionIntelligenceExperienceHome({ scenarios: orchHome.scenarios });
  }

  getDecisionDashboard(
    authContext: AuthContext,
    query: AiDecisionIntelligenceExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toDecisionIntelligenceDomainScreen(output, output.decisionDashboard);
  }

  getDecisionTree(authContext: AuthContext, query: AiDecisionIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toDecisionIntelligenceDomainScreen(output, output.decisionTree);
  }

  getOptions(authContext: AuthContext, query: AiDecisionIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toDecisionIntelligenceDomainScreen(output, output.decisionOptions);
  }

  getRecommendations(
    authContext: AuthContext,
    query: AiDecisionIntelligenceExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toDecisionIntelligenceDomainScreen(output, output.decisionRecommendations);
  }

  getRiskAnalysis(authContext: AuthContext, query: AiDecisionIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toDecisionIntelligenceDomainScreen(output, output.riskAnalysis);
  }

  getOpportunityAnalysis(
    authContext: AuthContext,
    query: AiDecisionIntelligenceExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toDecisionIntelligenceDomainScreen(output, output.opportunityAnalysis);
  }

  getPriorityMatrix(authContext: AuthContext, query: AiDecisionIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toDecisionIntelligenceDomainScreen(output, output.priorityMatrix);
  }

  getConfidence(authContext: AuthContext, query: AiDecisionIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toDecisionIntelligenceDomainScreen(output, output.decisionConfidence);
  }

  getExplanation(authContext: AuthContext, query: AiDecisionIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toDecisionIntelligenceExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: AiDecisionIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toDecisionIntelligenceSummaryScreen(
      buildAiDecisionIntelligenceExperienceSummary(output)
    );
  }

  validate(authContext: AuthContext, query: AiDecisionIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toDecisionIntelligenceValidationScreen(this.validator.validateCatalogCoverage());
    }
    return toDecisionIntelligenceValidationScreen(
      this.validator.validateOutput(this.buildOutput(authContext, query))
    );
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: AI_DECISION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
      routes: AI_DECISION_INTELLIGENCE_EXPERIENCE_ROUTES,
      json_schema: AI_DECISION_INTELLIGENCE_EXPERIENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(
    authContext: AuthContext,
    query: AiDecisionIntelligenceExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: AiDecisionIntelligenceExperienceQuery) {
    const context = toContext(query);
    const orchQuery = toOrchestrationQuery(query);
    const { orchestration } = this.repository.resolveUpstream(authContext, context, orchQuery);

    const decisionContext = this.contextBuilder.build(orchestration);
    const decisionDashboard = this.dashboardBuilder.build(orchestration);
    const decisionTree = this.treeBuilder.build(orchestration);
    const decisionOptions = this.optionsBuilder.build(orchestration);
    const decisionRecommendations = this.recommendationsBuilder.build(orchestration);
    const riskAnalysis = this.riskBuilder.build(orchestration);
    const opportunityAnalysis = this.opportunityBuilder.build(orchestration);
    const priorityMatrix = this.matrixBuilder.build(orchestration);
    const decisionConfidence = this.confidenceBuilder.build(orchestration);
    const delegationDecisionIntelligence = this.delegationBuilder.build(orchestration);

    const outputId = `decision-intelligence-${orchestration.outputId}`;

    const decisionExplanation = this.explanationBuilder.build({
      outputId,
      goal: orchestration.goal,
      dashboard: decisionDashboard,
      tree: decisionTree,
      recommendations: decisionRecommendations,
      decisionConfidenceScore: decisionConfidence.score,
    });

    return {
      outputId,
      orchestrationOutputId: orchestration.outputId,
      executiveIntelligenceOutputId: orchestration.executiveIntelligenceOutputId,
      predictiveIntelligenceOutputId: orchestration.predictiveIntelligenceOutputId,
      recommendationIntelligenceOutputId: orchestration.recommendationIntelligenceOutputId,
      insightGenerationOutputId: orchestration.insightGenerationOutputId,
      foundationOutputId: orchestration.foundationOutputId,
      closureOutputId: orchestration.closureOutputId,
      canonicalActionId: orchestration.canonicalActionId,
      scenarioId: orchestration.scenarioId,
      goal: orchestration.goal,
      decisionContext,
      decisionDashboard,
      decisionTree,
      decisionOptions,
      decisionRecommendations,
      riskAnalysis,
      opportunityAnalysis,
      priorityMatrix,
      decisionConfidence,
      delegationDecisionIntelligence,
      decisionExplanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(
  query: AiDecisionIntelligenceExperienceQuery
): AiDecisionIntelligenceExperienceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toOrchestrationQuery(query: AiDecisionIntelligenceExperienceQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createAiDecisionIntelligenceExperienceService(
  deps?: ConstructorParameters<typeof AiDecisionIntelligenceExperienceService>[0]
): AiDecisionIntelligenceExperienceService {
  return new AiDecisionIntelligenceExperienceService(deps);
}

export function createAiDecisionIntelligenceExperienceModule(deps?: {
  repository?: AiDecisionIntelligenceExperienceRepository;
  aiOrchestrationExperience?: AiOrchestrationExperienceService;
}) {
  const aiOrchestrationExperience =
    deps?.aiOrchestrationExperience ?? createAiOrchestrationExperienceService();
  const aiDecisionIntelligenceExperience = createAiDecisionIntelligenceExperienceService({
    aiOrchestrationExperience,
    repository:
      deps?.repository ??
      createAiDecisionIntelligenceExperienceRepository({ aiOrchestrationExperience }),
  });
  return { aiDecisionIntelligenceExperience };
}

export type AiDecisionIntelligenceExperienceModule = ReturnType<
  typeof createAiDecisionIntelligenceExperienceModule
>;
