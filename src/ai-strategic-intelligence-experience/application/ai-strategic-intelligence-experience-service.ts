import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  createAiDecisionIntelligenceExperienceService,
  type AiDecisionIntelligenceExperienceService,
} from "../../ai-decision-intelligence-experience/application/ai-decision-intelligence-experience-service.js";
import {
  AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_JSON_SCHEMA,
  AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_ROUTES,
  AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
  type StrategicIntelligenceScenarioId,
} from "../domain/ai-strategic-intelligence-experience-schema.js";
import type { AiStrategicIntelligenceExperienceContext } from "../domain/ai-strategic-intelligence-experience-context.js";
import {
  buildAiStrategicIntelligenceExperienceHome,
  buildAiStrategicIntelligenceExperienceSummary,
  toStrategicIntelligenceDomainScreen,
  toStrategicIntelligenceExplanationScreen,
  toStrategicIntelligenceSummaryScreen,
  toStrategicIntelligenceValidationScreen,
} from "../domain/ai-strategic-intelligence-experience-screens.js";
import {
  createStrategicContextBuilder,
  createStrategyDashboardBuilder,
  createStrategicGoalsBuilder,
  createStrategicScenariosBuilder,
  createStrategicPrioritiesBuilder,
  createRiskLandscapeBuilder,
  createOpportunityLandscapeBuilder,
  createExecutionRoadmapBuilder,
  createStrategicConfidenceBuilder,
  createDelegationStrategicIntelligenceBuilder,
  createStrategicExplanationBuilder,
} from "./ai-strategic-intelligence-experience-builder.js";
import { createAiStrategicIntelligenceExperienceValidator } from "./ai-strategic-intelligence-experience-validator.js";
import {
  createAiStrategicIntelligenceExperienceRepository,
  type AiStrategicIntelligenceExperienceRepository,
} from "../infrastructure/ai-strategic-intelligence-experience-repository.js";

export interface AiStrategicIntelligenceExperienceQuery {
  scenario_id?: StrategicIntelligenceScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class AiStrategicIntelligenceExperienceService {
  private readonly repository: AiStrategicIntelligenceExperienceRepository;
  private readonly aiDecisionIntelligenceExperience: AiDecisionIntelligenceExperienceService;
  private readonly contextBuilder = createStrategicContextBuilder();
  private readonly dashboardBuilder = createStrategyDashboardBuilder();
  private readonly goalsBuilder = createStrategicGoalsBuilder();
  private readonly scenariosBuilder = createStrategicScenariosBuilder();
  private readonly prioritiesBuilder = createStrategicPrioritiesBuilder();
  private readonly riskLandscapeBuilder = createRiskLandscapeBuilder();
  private readonly opportunityLandscapeBuilder = createOpportunityLandscapeBuilder();
  private readonly roadmapBuilder = createExecutionRoadmapBuilder();
  private readonly confidenceBuilder = createStrategicConfidenceBuilder();
  private readonly delegationBuilder = createDelegationStrategicIntelligenceBuilder();
  private readonly explanationBuilder = createStrategicExplanationBuilder();
  private readonly validator = createAiStrategicIntelligenceExperienceValidator();

  constructor(deps?: {
    repository?: AiStrategicIntelligenceExperienceRepository;
    aiDecisionIntelligenceExperience?: AiDecisionIntelligenceExperienceService;
  }) {
    this.aiDecisionIntelligenceExperience =
      deps?.aiDecisionIntelligenceExperience ?? createAiDecisionIntelligenceExperienceService();
    this.repository =
      deps?.repository ??
      createAiStrategicIntelligenceExperienceRepository({
        aiDecisionIntelligenceExperience: this.aiDecisionIntelligenceExperience,
      });
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const decisionHome = this.aiDecisionIntelligenceExperience.getHome(authContext);
    return buildAiStrategicIntelligenceExperienceHome({ scenarios: decisionHome.scenarios });
  }

  getStrategyDashboard(
    authContext: AuthContext,
    query: AiStrategicIntelligenceExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toStrategicIntelligenceDomainScreen(output, output.strategyDashboard);
  }

  getStrategicGoals(authContext: AuthContext, query: AiStrategicIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toStrategicIntelligenceDomainScreen(output, output.strategicGoals);
  }

  getStrategicScenarios(
    authContext: AuthContext,
    query: AiStrategicIntelligenceExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toStrategicIntelligenceDomainScreen(output, output.strategicScenarios);
  }

  getPriorities(authContext: AuthContext, query: AiStrategicIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toStrategicIntelligenceDomainScreen(output, output.strategicPriorities);
  }

  getRiskLandscape(authContext: AuthContext, query: AiStrategicIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toStrategicIntelligenceDomainScreen(output, output.riskLandscape);
  }

  getOpportunityLandscape(
    authContext: AuthContext,
    query: AiStrategicIntelligenceExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toStrategicIntelligenceDomainScreen(output, output.opportunityLandscape);
  }

  getExecutionRoadmap(
    authContext: AuthContext,
    query: AiStrategicIntelligenceExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toStrategicIntelligenceDomainScreen(output, output.executionRoadmap);
  }

  getConfidence(authContext: AuthContext, query: AiStrategicIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toStrategicIntelligenceDomainScreen(output, output.strategicConfidence);
  }

  getExplanation(authContext: AuthContext, query: AiStrategicIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toStrategicIntelligenceExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: AiStrategicIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toStrategicIntelligenceSummaryScreen(
      buildAiStrategicIntelligenceExperienceSummary(output)
    );
  }

  validate(authContext: AuthContext, query: AiStrategicIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toStrategicIntelligenceValidationScreen(this.validator.validateCatalogCoverage());
    }
    return toStrategicIntelligenceValidationScreen(
      this.validator.validateOutput(this.buildOutput(authContext, query))
    );
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
      routes: AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_ROUTES,
      json_schema: AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(
    authContext: AuthContext,
    query: AiStrategicIntelligenceExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: AiStrategicIntelligenceExperienceQuery) {
    const context = toContext(query);
    const decisionQuery = toDecisionIntelligenceQuery(query);
    const { decisionIntelligence } = this.repository.resolveUpstream(
      authContext,
      context,
      decisionQuery
    );

    const strategicContext = this.contextBuilder.build(decisionIntelligence);
    const strategyDashboard = this.dashboardBuilder.build(decisionIntelligence);
    const strategicGoals = this.goalsBuilder.build(decisionIntelligence);
    const strategicScenarios = this.scenariosBuilder.build(decisionIntelligence);
    const strategicPriorities = this.prioritiesBuilder.build(decisionIntelligence);
    const riskLandscape = this.riskLandscapeBuilder.build(decisionIntelligence);
    const opportunityLandscape = this.opportunityLandscapeBuilder.build(decisionIntelligence);
    const executionRoadmap = this.roadmapBuilder.build(decisionIntelligence);
    const strategicConfidence = this.confidenceBuilder.build(decisionIntelligence);
    const delegationStrategicIntelligence = this.delegationBuilder.build(decisionIntelligence);

    const outputId = `strategic-intelligence-${decisionIntelligence.outputId}`;

    const strategicExplanation = this.explanationBuilder.build({
      outputId,
      goal: decisionIntelligence.goal,
      dashboard: strategyDashboard,
      goals: strategicGoals,
      roadmap: executionRoadmap,
      strategicConfidenceScore: strategicConfidence.score,
    });

    return {
      outputId,
      decisionIntelligenceOutputId: decisionIntelligence.outputId,
      orchestrationOutputId: decisionIntelligence.orchestrationOutputId,
      executiveIntelligenceOutputId: decisionIntelligence.executiveIntelligenceOutputId,
      predictiveIntelligenceOutputId: decisionIntelligence.predictiveIntelligenceOutputId,
      foundationOutputId: decisionIntelligence.foundationOutputId,
      closureOutputId: decisionIntelligence.closureOutputId,
      canonicalActionId: decisionIntelligence.canonicalActionId,
      scenarioId: decisionIntelligence.scenarioId,
      goal: decisionIntelligence.goal,
      strategicContext,
      strategyDashboard,
      strategicGoals,
      strategicScenarios,
      strategicPriorities,
      riskLandscape,
      opportunityLandscape,
      executionRoadmap,
      strategicConfidence,
      delegationStrategicIntelligence,
      strategicExplanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(
  query: AiStrategicIntelligenceExperienceQuery
): AiStrategicIntelligenceExperienceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toDecisionIntelligenceQuery(query: AiStrategicIntelligenceExperienceQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createAiStrategicIntelligenceExperienceService(
  deps?: ConstructorParameters<typeof AiStrategicIntelligenceExperienceService>[0]
): AiStrategicIntelligenceExperienceService {
  return new AiStrategicIntelligenceExperienceService(deps);
}

export function createAiStrategicIntelligenceExperienceModule(deps?: {
  repository?: AiStrategicIntelligenceExperienceRepository;
  aiDecisionIntelligenceExperience?: AiDecisionIntelligenceExperienceService;
}) {
  const aiDecisionIntelligenceExperience =
    deps?.aiDecisionIntelligenceExperience ?? createAiDecisionIntelligenceExperienceService();
  const aiStrategicIntelligenceExperience = createAiStrategicIntelligenceExperienceService({
    aiDecisionIntelligenceExperience,
    repository:
      deps?.repository ??
      createAiStrategicIntelligenceExperienceRepository({ aiDecisionIntelligenceExperience }),
  });
  return { aiStrategicIntelligenceExperience };
}

export type AiStrategicIntelligenceExperienceModule = ReturnType<
  typeof createAiStrategicIntelligenceExperienceModule
>;
