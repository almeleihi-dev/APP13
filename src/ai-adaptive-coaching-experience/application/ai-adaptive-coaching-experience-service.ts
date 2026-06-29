import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  createAiProgressIntelligenceExperienceService,
  type AiProgressIntelligenceExperienceService,
} from "../../ai-progress-intelligence-experience/application/ai-progress-intelligence-experience-service.js";
import {
  AI_ADAPTIVE_COACHING_EXPERIENCE_JSON_SCHEMA,
  AI_ADAPTIVE_COACHING_EXPERIENCE_ROUTES,
  AI_ADAPTIVE_COACHING_EXPERIENCE_SCHEMA_VERSION,
  type AdaptiveCoachingScenarioId,
} from "../domain/ai-adaptive-coaching-experience-schema.js";
import type { AiAdaptiveCoachingExperienceContext } from "../domain/ai-adaptive-coaching-experience-context.js";
import {
  buildAiAdaptiveCoachingExperienceHome,
  buildAiAdaptiveCoachingExperienceSummary,
  toAdaptiveCoachingContextScreen,
  toAdaptiveCoachingDomainScreen,
  toAdaptiveCoachingExplanationScreen,
  toAdaptiveCoachingSummaryScreen,
  toAdaptiveCoachingValidationScreen,
} from "../domain/ai-adaptive-coaching-experience-screens.js";
import {
  createCoachingContextBuilder,
  createAdaptiveGuidanceBuilder,
  createCoachingInsightsBuilder,
  createImprovementOpportunitiesBuilder,
  createMotivationSummaryBuilder,
  createBehavioralSuggestionsBuilder,
  createCoachingReadinessBuilder,
  createDelegationAdaptiveCoachingBuilder,
  createAdaptiveCoachingConfidenceBuilder,
  createCoachingExplanationBuilder,
} from "./ai-adaptive-coaching-experience-builder.js";
import { createAiAdaptiveCoachingExperienceValidator } from "./ai-adaptive-coaching-experience-validator.js";
import {
  createAiAdaptiveCoachingExperienceRepository,
  type AiAdaptiveCoachingExperienceRepository,
} from "../infrastructure/ai-adaptive-coaching-experience-repository.js";

export interface AiAdaptiveCoachingExperienceQuery {
  scenario_id?: AdaptiveCoachingScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class AiAdaptiveCoachingExperienceService {
  private readonly repository: AiAdaptiveCoachingExperienceRepository;
  private readonly aiProgressIntelligenceExperience: AiProgressIntelligenceExperienceService;
  private readonly contextBuilder = createCoachingContextBuilder();
  private readonly guidanceBuilder = createAdaptiveGuidanceBuilder();
  private readonly insightsBuilder = createCoachingInsightsBuilder();
  private readonly improvementsBuilder = createImprovementOpportunitiesBuilder();
  private readonly motivationBuilder = createMotivationSummaryBuilder();
  private readonly behaviorBuilder = createBehavioralSuggestionsBuilder();
  private readonly readinessBuilder = createCoachingReadinessBuilder();
  private readonly delegationBuilder = createDelegationAdaptiveCoachingBuilder();
  private readonly confidenceBuilder = createAdaptiveCoachingConfidenceBuilder();
  private readonly explanationBuilder = createCoachingExplanationBuilder();
  private readonly validator = createAiAdaptiveCoachingExperienceValidator();

  constructor(deps?: {
    repository?: AiAdaptiveCoachingExperienceRepository;
    aiProgressIntelligenceExperience?: AiProgressIntelligenceExperienceService;
  }) {
    this.aiProgressIntelligenceExperience =
      deps?.aiProgressIntelligenceExperience ?? createAiProgressIntelligenceExperienceService();
    this.repository =
      deps?.repository ??
      createAiAdaptiveCoachingExperienceRepository({
        aiProgressIntelligenceExperience: this.aiProgressIntelligenceExperience,
      });
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const progressHome = this.aiProgressIntelligenceExperience.getHome(authContext);
    return buildAiAdaptiveCoachingExperienceHome({ scenarios: progressHome.scenarios });
  }

  getContext(authContext: AuthContext, query: AiAdaptiveCoachingExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toAdaptiveCoachingContextScreen(this.buildOutput(authContext, query));
  }

  getGuidance(authContext: AuthContext, query: AiAdaptiveCoachingExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toAdaptiveCoachingDomainScreen(output, output.adaptiveGuidance);
  }

  getInsights(authContext: AuthContext, query: AiAdaptiveCoachingExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toAdaptiveCoachingDomainScreen(output, output.coachingInsights);
  }

  getImprovements(authContext: AuthContext, query: AiAdaptiveCoachingExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toAdaptiveCoachingDomainScreen(output, output.improvementOpportunities);
  }

  getMotivation(authContext: AuthContext, query: AiAdaptiveCoachingExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toAdaptiveCoachingDomainScreen(output, output.motivationSummary);
  }

  getBehavior(authContext: AuthContext, query: AiAdaptiveCoachingExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toAdaptiveCoachingDomainScreen(output, output.behavioralSuggestions);
  }

  getReadiness(authContext: AuthContext, query: AiAdaptiveCoachingExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toAdaptiveCoachingDomainScreen(output, output.coachingReadiness);
  }

  getDelegation(authContext: AuthContext, query: AiAdaptiveCoachingExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toAdaptiveCoachingDomainScreen(output, output.delegationAdaptiveCoaching);
  }

  getExplanation(authContext: AuthContext, query: AiAdaptiveCoachingExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toAdaptiveCoachingExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: AiAdaptiveCoachingExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toAdaptiveCoachingSummaryScreen(buildAiAdaptiveCoachingExperienceSummary(output));
  }

  validate(authContext: AuthContext, query: AiAdaptiveCoachingExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toAdaptiveCoachingValidationScreen(this.validator.validateCatalogCoverage());
    }
    return toAdaptiveCoachingValidationScreen(
      this.validator.validateOutput(this.buildOutput(authContext, query))
    );
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: AI_ADAPTIVE_COACHING_EXPERIENCE_SCHEMA_VERSION,
      routes: AI_ADAPTIVE_COACHING_EXPERIENCE_ROUTES,
      json_schema: AI_ADAPTIVE_COACHING_EXPERIENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(authContext: AuthContext, query: AiAdaptiveCoachingExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: AiAdaptiveCoachingExperienceQuery) {
    const context = toContext(query);
    const progressQuery = toProgressIntelligenceQuery(query);
    const { progressIntelligence } = this.repository.resolveUpstream(
      authContext,
      context,
      progressQuery
    );

    const coachingContext = this.contextBuilder.build(progressIntelligence);
    const adaptiveGuidance = this.guidanceBuilder.build(progressIntelligence);
    const coachingInsights = this.insightsBuilder.build(progressIntelligence);
    const improvementOpportunities = this.improvementsBuilder.build(progressIntelligence);
    const motivationSummary = this.motivationBuilder.build(progressIntelligence);
    const behavioralSuggestions = this.behaviorBuilder.build(progressIntelligence);
    const coachingReadiness = this.readinessBuilder.build(progressIntelligence);
    const delegationAdaptiveCoaching = this.delegationBuilder.build(progressIntelligence);
    const adaptiveCoachingConfidence = this.confidenceBuilder.build(
      progressIntelligence,
      coachingReadiness.readinessScore
    );

    const outputId = `adaptive-coaching-${progressIntelligence.outputId}`;

    const coachingExplanation = this.explanationBuilder.build({
      outputId,
      goal: progressIntelligence.goal,
      guidance: adaptiveGuidance,
      insights: coachingInsights,
      readiness: coachingReadiness,
      adaptiveCoachingConfidenceScore: adaptiveCoachingConfidence.score,
    });

    return {
      outputId,
      progressIntelligenceOutputId: progressIntelligence.outputId,
      executionCompanionOutputId: progressIntelligence.executionCompanionOutputId,
      actionPlanningOutputId: progressIntelligence.actionPlanningOutputId,
      decisionSupportOutputId: progressIntelligence.decisionSupportOutputId,
      guidanceOutputId: progressIntelligence.guidanceOutputId,
      conversationOutputId: progressIntelligence.conversationOutputId,
      foundationOutputId: progressIntelligence.foundationOutputId,
      closureOutputId: progressIntelligence.closureOutputId,
      canonicalActionId: progressIntelligence.canonicalActionId,
      scenarioId: progressIntelligence.scenarioId,
      goal: progressIntelligence.goal,
      coachingContext,
      adaptiveGuidance,
      coachingInsights,
      improvementOpportunities,
      motivationSummary,
      behavioralSuggestions,
      coachingReadiness,
      delegationAdaptiveCoaching,
      adaptiveCoachingConfidence,
      coachingExplanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: AiAdaptiveCoachingExperienceQuery): AiAdaptiveCoachingExperienceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toProgressIntelligenceQuery(query: AiAdaptiveCoachingExperienceQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createAiAdaptiveCoachingExperienceService(
  deps?: ConstructorParameters<typeof AiAdaptiveCoachingExperienceService>[0]
): AiAdaptiveCoachingExperienceService {
  return new AiAdaptiveCoachingExperienceService(deps);
}

export function createAiAdaptiveCoachingExperienceModule(deps?: {
  repository?: AiAdaptiveCoachingExperienceRepository;
  aiProgressIntelligenceExperience?: AiProgressIntelligenceExperienceService;
}) {
  const aiProgressIntelligenceExperience =
    deps?.aiProgressIntelligenceExperience ?? createAiProgressIntelligenceExperienceService();
  const aiAdaptiveCoachingExperience = createAiAdaptiveCoachingExperienceService({
    aiProgressIntelligenceExperience,
    repository:
      deps?.repository ??
      createAiAdaptiveCoachingExperienceRepository({ aiProgressIntelligenceExperience }),
  });
  return { aiAdaptiveCoachingExperience };
}

export type AiAdaptiveCoachingExperienceModule = ReturnType<
  typeof createAiAdaptiveCoachingExperienceModule
>;
