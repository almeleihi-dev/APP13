import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  createAiPredictiveIntelligenceExperienceService,
  type AiPredictiveIntelligenceExperienceService,
} from "../../ai-predictive-intelligence-experience/application/ai-predictive-intelligence-experience-service.js";
import {
  AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_JSON_SCHEMA,
  AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_ROUTES,
  AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
  type ExecutiveIntelligenceScenarioId,
} from "../domain/ai-executive-intelligence-experience-schema.js";
import type { AiExecutiveIntelligenceExperienceContext } from "../domain/ai-executive-intelligence-experience-context.js";
import {
  buildAiExecutiveIntelligenceExperienceHome,
  buildAiExecutiveIntelligenceExperienceSummary,
  toExecutiveIntelligenceContextScreen,
  toExecutiveIntelligenceDomainScreen,
  toExecutiveIntelligenceExplanationScreen,
  toExecutiveIntelligenceSummaryScreen,
  toExecutiveIntelligenceValidationScreen,
} from "../domain/ai-executive-intelligence-experience-screens.js";
import {
  createExecutiveContextBuilder,
  createExecutiveDashboardBuilder,
  createExecutiveSummaryBuilder,
  createStrategicPrioritiesBuilder,
  createCriticalDecisionsBuilder,
  createExecutiveAlertsBuilder,
  createExecutiveOpportunitiesBuilder,
  createExecutiveRisksBuilder,
  createExecutiveReadinessBuilder,
  createExecutiveConfidenceBuilder,
  createDelegationExecutiveIntelligenceBuilder,
  createExecutiveExplanationBuilder,
} from "./ai-executive-intelligence-experience-builder.js";
import { createAiExecutiveIntelligenceExperienceValidator } from "./ai-executive-intelligence-experience-validator.js";
import {
  createAiExecutiveIntelligenceExperienceRepository,
  type AiExecutiveIntelligenceExperienceRepository,
} from "../infrastructure/ai-executive-intelligence-experience-repository.js";

export interface AiExecutiveIntelligenceExperienceQuery {
  scenario_id?: ExecutiveIntelligenceScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class AiExecutiveIntelligenceExperienceService {
  private readonly repository: AiExecutiveIntelligenceExperienceRepository;
  private readonly aiPredictiveIntelligenceExperience: AiPredictiveIntelligenceExperienceService;
  private readonly contextBuilder = createExecutiveContextBuilder();
  private readonly dashboardBuilder = createExecutiveDashboardBuilder();
  private readonly executiveSummaryBuilder = createExecutiveSummaryBuilder();
  private readonly prioritiesBuilder = createStrategicPrioritiesBuilder();
  private readonly decisionsBuilder = createCriticalDecisionsBuilder();
  private readonly alertsBuilder = createExecutiveAlertsBuilder();
  private readonly opportunitiesBuilder = createExecutiveOpportunitiesBuilder();
  private readonly risksBuilder = createExecutiveRisksBuilder();
  private readonly readinessBuilder = createExecutiveReadinessBuilder();
  private readonly confidenceBuilder = createExecutiveConfidenceBuilder();
  private readonly delegationBuilder = createDelegationExecutiveIntelligenceBuilder();
  private readonly explanationBuilder = createExecutiveExplanationBuilder();
  private readonly validator = createAiExecutiveIntelligenceExperienceValidator();

  constructor(deps?: {
    repository?: AiExecutiveIntelligenceExperienceRepository;
    aiPredictiveIntelligenceExperience?: AiPredictiveIntelligenceExperienceService;
  }) {
    this.aiPredictiveIntelligenceExperience =
      deps?.aiPredictiveIntelligenceExperience ??
      createAiPredictiveIntelligenceExperienceService();
    this.repository =
      deps?.repository ??
      createAiExecutiveIntelligenceExperienceRepository({
        aiPredictiveIntelligenceExperience: this.aiPredictiveIntelligenceExperience,
      });
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const predHome = this.aiPredictiveIntelligenceExperience.getHome(authContext);
    return buildAiExecutiveIntelligenceExperienceHome({ scenarios: predHome.scenarios });
  }

  getContext(authContext: AuthContext, query: AiExecutiveIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toExecutiveIntelligenceContextScreen(this.buildOutput(authContext, query));
  }

  getExecutiveSummary(
    authContext: AuthContext,
    query: AiExecutiveIntelligenceExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toExecutiveIntelligenceDomainScreen(output, output.executiveSummary);
  }

  getStrategicPriorities(
    authContext: AuthContext,
    query: AiExecutiveIntelligenceExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toExecutiveIntelligenceDomainScreen(output, output.strategicPriorities);
  }

  getCriticalDecisions(
    authContext: AuthContext,
    query: AiExecutiveIntelligenceExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toExecutiveIntelligenceDomainScreen(output, output.criticalDecisions);
  }

  getExecutiveAlerts(
    authContext: AuthContext,
    query: AiExecutiveIntelligenceExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toExecutiveIntelligenceDomainScreen(output, output.executiveAlerts);
  }

  getExecutiveOpportunities(
    authContext: AuthContext,
    query: AiExecutiveIntelligenceExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toExecutiveIntelligenceDomainScreen(output, output.executiveOpportunities);
  }

  getExecutiveRisks(
    authContext: AuthContext,
    query: AiExecutiveIntelligenceExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toExecutiveIntelligenceDomainScreen(output, output.executiveRisks);
  }

  getExecutiveReadiness(
    authContext: AuthContext,
    query: AiExecutiveIntelligenceExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toExecutiveIntelligenceDomainScreen(output, output.executiveReadiness);
  }

  getExecutiveConfidence(
    authContext: AuthContext,
    query: AiExecutiveIntelligenceExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toExecutiveIntelligenceDomainScreen(output, output.executiveConfidence);
  }

  getDelegation(authContext: AuthContext, query: AiExecutiveIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toExecutiveIntelligenceDomainScreen(output, output.delegationExecutiveIntelligence);
  }

  getExecutiveExplanation(
    authContext: AuthContext,
    query: AiExecutiveIntelligenceExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    return toExecutiveIntelligenceExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: AiExecutiveIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toExecutiveIntelligenceSummaryScreen(
      buildAiExecutiveIntelligenceExperienceSummary(output)
    );
  }

  validate(authContext: AuthContext, query: AiExecutiveIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toExecutiveIntelligenceValidationScreen(this.validator.validateCatalogCoverage());
    }
    return toExecutiveIntelligenceValidationScreen(
      this.validator.validateOutput(this.buildOutput(authContext, query))
    );
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
      routes: AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_ROUTES,
      json_schema: AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(
    authContext: AuthContext,
    query: AiExecutiveIntelligenceExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: AiExecutiveIntelligenceExperienceQuery) {
    const context = toContext(query);
    const predQuery = toPredictiveIntelligenceQuery(query);
    const { predictiveIntelligence } = this.repository.resolveUpstream(
      authContext,
      context,
      predQuery
    );

    const executiveContext = this.contextBuilder.build(predictiveIntelligence);
    const executiveDashboard = this.dashboardBuilder.build(predictiveIntelligence);
    const executiveSummary = this.executiveSummaryBuilder.build(predictiveIntelligence);
    const strategicPriorities = this.prioritiesBuilder.build(predictiveIntelligence);
    const criticalDecisions = this.decisionsBuilder.build(predictiveIntelligence);
    const executiveAlerts = this.alertsBuilder.build(predictiveIntelligence);
    const executiveOpportunities = this.opportunitiesBuilder.build(predictiveIntelligence);
    const executiveRisks = this.risksBuilder.build(predictiveIntelligence);
    const executiveReadiness = this.readinessBuilder.build(predictiveIntelligence);
    const executiveConfidence = this.confidenceBuilder.build(predictiveIntelligence);
    const delegationExecutiveIntelligence = this.delegationBuilder.build(predictiveIntelligence);

    const outputId = `executive-intelligence-${predictiveIntelligence.outputId}`;

    const executiveExplanation = this.explanationBuilder.build({
      outputId,
      goal: predictiveIntelligence.goal,
      dashboard: executiveDashboard,
      executiveSummary,
      readiness: executiveReadiness,
      executiveConfidenceScore: executiveConfidence.score,
    });

    return {
      outputId,
      predictiveIntelligenceOutputId: predictiveIntelligence.outputId,
      recommendationIntelligenceOutputId: predictiveIntelligence.recommendationIntelligenceOutputId,
      insightGenerationOutputId: predictiveIntelligence.insightGenerationOutputId,
      adaptiveCoachingOutputId: predictiveIntelligence.adaptiveCoachingOutputId,
      progressIntelligenceOutputId: predictiveIntelligence.progressIntelligenceOutputId,
      executionCompanionOutputId: predictiveIntelligence.executionCompanionOutputId,
      actionPlanningOutputId: predictiveIntelligence.actionPlanningOutputId,
      decisionSupportOutputId: predictiveIntelligence.decisionSupportOutputId,
      guidanceOutputId: predictiveIntelligence.guidanceOutputId,
      conversationOutputId: predictiveIntelligence.conversationOutputId,
      foundationOutputId: predictiveIntelligence.foundationOutputId,
      closureOutputId: predictiveIntelligence.closureOutputId,
      canonicalActionId: predictiveIntelligence.canonicalActionId,
      scenarioId: predictiveIntelligence.scenarioId,
      goal: predictiveIntelligence.goal,
      executiveContext,
      executiveDashboard,
      executiveSummary,
      strategicPriorities,
      criticalDecisions,
      executiveAlerts,
      executiveOpportunities,
      executiveRisks,
      executiveReadiness,
      executiveConfidence,
      delegationExecutiveIntelligence,
      executiveExplanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(
  query: AiExecutiveIntelligenceExperienceQuery
): AiExecutiveIntelligenceExperienceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toPredictiveIntelligenceQuery(query: AiExecutiveIntelligenceExperienceQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createAiExecutiveIntelligenceExperienceService(
  deps?: ConstructorParameters<typeof AiExecutiveIntelligenceExperienceService>[0]
): AiExecutiveIntelligenceExperienceService {
  return new AiExecutiveIntelligenceExperienceService(deps);
}

export function createAiExecutiveIntelligenceExperienceModule(deps?: {
  repository?: AiExecutiveIntelligenceExperienceRepository;
  aiPredictiveIntelligenceExperience?: AiPredictiveIntelligenceExperienceService;
}) {
  const aiPredictiveIntelligenceExperience =
    deps?.aiPredictiveIntelligenceExperience ??
    createAiPredictiveIntelligenceExperienceService();
  const aiExecutiveIntelligenceExperience = createAiExecutiveIntelligenceExperienceService({
    aiPredictiveIntelligenceExperience,
    repository:
      deps?.repository ??
      createAiExecutiveIntelligenceExperienceRepository({ aiPredictiveIntelligenceExperience }),
  });
  return { aiExecutiveIntelligenceExperience };
}

export type AiExecutiveIntelligenceExperienceModule = ReturnType<
  typeof createAiExecutiveIntelligenceExperienceModule
>;
