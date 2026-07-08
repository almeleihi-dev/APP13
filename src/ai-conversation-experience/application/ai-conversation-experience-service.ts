import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  createAiExperienceFoundationService,
  type AiExperienceFoundationService,
} from "../../ai-experience/application/ai-experience-foundation-service.js";
import {
  AI_CONVERSATION_EXPERIENCE_JSON_SCHEMA,
  AI_CONVERSATION_EXPERIENCE_ROUTES,
  AI_CONVERSATION_EXPERIENCE_SCHEMA_VERSION,
  type ConversationScenarioId,
} from "../domain/ai-conversation-experience-schema.js";
import type { AiConversationExperienceContext } from "../domain/ai-conversation-experience-context.js";
import {
  buildAiConversationExperienceHome,
  buildAiConversationExperienceSummary,
  toConversationContextScreen,
  toConversationDomainScreen,
  toConversationExplanationScreen,
  toConversationSummaryScreen,
  toConversationValidationScreen,
} from "../domain/ai-conversation-experience-screens.js";
import {
  createConversationContextBuilder,
  createConversationThreadBuilder,
  createConversationMessagesBuilder,
  createConversationStatusBuilder,
  createConversationReadinessBuilder,
  createDelegationConversationBuilder,
  createConversationConfidenceBuilder,
  createConversationExplanationBuilder,
} from "./ai-conversation-experience-builder.js";
import { createAiConversationExperienceValidator } from "./ai-conversation-experience-validator.js";
import {
  createAiConversationExperienceRepository,
  type AiConversationExperienceRepository,
} from "../infrastructure/ai-conversation-experience-repository.js";

export interface AiConversationExperienceQuery {
  scenario_id?: ConversationScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class AiConversationExperienceService {
  private readonly repository: AiConversationExperienceRepository;
  private readonly aiExperienceFoundation: AiExperienceFoundationService;
  private readonly contextBuilder = createConversationContextBuilder();
  private readonly threadBuilder = createConversationThreadBuilder();
  private readonly messagesBuilder = createConversationMessagesBuilder();
  private readonly statusBuilder = createConversationStatusBuilder();
  private readonly readinessBuilder = createConversationReadinessBuilder();
  private readonly delegationBuilder = createDelegationConversationBuilder();
  private readonly confidenceBuilder = createConversationConfidenceBuilder();
  private readonly explanationBuilder = createConversationExplanationBuilder();
  private readonly validator = createAiConversationExperienceValidator();

  constructor(deps?: {
    repository?: AiConversationExperienceRepository;
    aiExperienceFoundation?: AiExperienceFoundationService;
  }) {
    this.aiExperienceFoundation =
      deps?.aiExperienceFoundation ?? createAiExperienceFoundationService();
    this.repository =
      deps?.repository ??
      createAiConversationExperienceRepository({
        aiExperienceFoundation: this.aiExperienceFoundation,
      });
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const foundationHome = this.aiExperienceFoundation.getHome(authContext);
    return buildAiConversationExperienceHome({ scenarios: foundationHome.scenarios });
  }

  getContext(authContext: AuthContext, query: AiConversationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toConversationContextScreen(this.buildOutput(authContext, query));
  }

  getThread(authContext: AuthContext, query: AiConversationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toConversationDomainScreen(output, output.conversationThread);
  }

  getMessages(authContext: AuthContext, query: AiConversationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toConversationDomainScreen(output, output.conversationMessages);
  }

  getStatus(authContext: AuthContext, query: AiConversationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toConversationDomainScreen(output, output.conversationStatus);
  }

  getReadiness(authContext: AuthContext, query: AiConversationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toConversationDomainScreen(output, output.conversationReadiness);
  }

  getDelegation(authContext: AuthContext, query: AiConversationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toConversationDomainScreen(output, output.delegationConversation);
  }

  getExplanation(authContext: AuthContext, query: AiConversationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toConversationExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: AiConversationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toConversationSummaryScreen(buildAiConversationExperienceSummary(output));
  }

  validate(authContext: AuthContext, query: AiConversationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toConversationValidationScreen(this.validator.validateCatalogCoverage());
    }
    return toConversationValidationScreen(
      this.validator.validateOutput(this.buildOutput(authContext, query))
    );
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: AI_CONVERSATION_EXPERIENCE_SCHEMA_VERSION,
      routes: AI_CONVERSATION_EXPERIENCE_ROUTES,
      json_schema: AI_CONVERSATION_EXPERIENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(authContext: AuthContext, query: AiConversationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: AiConversationExperienceQuery) {
    const context = toContext(query);
    const foundationQuery = toFoundationQuery(query);
    const { foundation } = this.repository.resolveUpstream(authContext, context, foundationQuery);

    const conversationContext = this.contextBuilder.build(foundation);
    const conversationThread = this.threadBuilder.build(foundation);
    const conversationMessages = this.messagesBuilder.build(foundation, conversationThread);
    const conversationStatus = this.statusBuilder.build(foundation);
    const conversationReadiness = this.readinessBuilder.build(foundation);
    const delegationConversation = this.delegationBuilder.build(foundation);
    const conversationConfidence = this.confidenceBuilder.build(
      foundation,
      conversationStatus.score
    );

    const outputId = `conversation-${foundation.outputId}`;

    const explanation = this.explanationBuilder.build({
      outputId,
      goal: foundation.goal,
      foundation,
      thread: conversationThread,
      messages: conversationMessages,
      status: conversationStatus,
      readiness: conversationReadiness,
      conversationConfidenceScore: conversationConfidence.score,
    });

    return {
      outputId,
      foundationOutputId: foundation.outputId,
      closureOutputId: foundation.closureOutputId,
      canonicalActionId: foundation.canonicalActionId,
      scenarioId: foundation.scenarioId,
      goal: foundation.goal,
      conversationContext,
      conversationThread,
      conversationMessages,
      conversationStatus,
      conversationReadiness,
      delegationConversation,
      conversationConfidence,
      explanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: AiConversationExperienceQuery): AiConversationExperienceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toFoundationQuery(query: AiConversationExperienceQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createAiConversationExperienceService(
  deps?: ConstructorParameters<typeof AiConversationExperienceService>[0]
): AiConversationExperienceService {
  return new AiConversationExperienceService(deps);
}

export function createAiConversationExperienceModule(deps?: {
  repository?: AiConversationExperienceRepository;
  aiExperienceFoundation?: AiExperienceFoundationService;
}) {
  const aiExperienceFoundation =
    deps?.aiExperienceFoundation ?? createAiExperienceFoundationService();
  const aiConversationExperience = createAiConversationExperienceService({
    aiExperienceFoundation,
    repository:
      deps?.repository ??
      createAiConversationExperienceRepository({ aiExperienceFoundation }),
  });
  return { aiConversationExperience };
}

export type AiConversationExperienceModule = ReturnType<
  typeof createAiConversationExperienceModule
>;
