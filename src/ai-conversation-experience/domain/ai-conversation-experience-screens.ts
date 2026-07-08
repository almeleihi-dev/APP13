import {
  AI_CONVERSATION_EXPERIENCE_FIXED_TIMESTAMP,
  AI_CONVERSATION_EXPERIENCE_SCHEMA_VERSION,
  AI_CONVERSATION_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
} from "./ai-conversation-experience-schema.js";
import type {
  AiConversationExperienceOutput,
  AiConversationExperienceSummary,
  AiConversationExperienceValidation,
} from "./ai-conversation-experience-context.js";

export interface AiConversationExperienceHome {
  schema_version: typeof AI_CONVERSATION_EXPERIENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  conversation_chain: readonly string[];
  upstream_module: typeof UPSTREAM_MODULE_ID;
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  conversation_views: readonly string[];
  read_only: true;
  generated_at: string;
}

export interface ConversationContextScreen {
  schema_version: typeof AI_CONVERSATION_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  conversation_context: AiConversationExperienceOutput["conversationContext"];
  conversation_confidence: AiConversationExperienceOutput["conversationConfidence"];
  read_only: true;
}

export interface ConversationDomainScreen {
  schema_version: typeof AI_CONVERSATION_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  view: unknown;
  read_only: true;
}

export interface ConversationExplanationScreen {
  schema_version: typeof AI_CONVERSATION_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  explanation: AiConversationExperienceOutput["explanation"];
  conversation_confidence: AiConversationExperienceOutput["conversationConfidence"];
  read_only: true;
}

export interface ConversationSummaryScreen {
  schema_version: typeof AI_CONVERSATION_EXPERIENCE_SCHEMA_VERSION;
  summary: AiConversationExperienceSummary;
  read_only: true;
}

export interface ConversationValidationScreen {
  schema_version: typeof AI_CONVERSATION_EXPERIENCE_SCHEMA_VERSION;
  validation: AiConversationExperienceValidation;
  read_only: true;
}

const CONVERSATION_VIEWS = [
  "Conversation Context",
  "Conversation Thread",
  "Conversation Messages",
  "Conversation Status",
  "Conversation Readiness",
  "Delegation",
] as const;

export function buildAiConversationExperienceHome(input: {
  scenarios: AiConversationExperienceHome["scenarios"];
}): AiConversationExperienceHome {
  return {
    schema_version: AI_CONVERSATION_EXPERIENCE_SCHEMA_VERSION,
    headline: "AN ACT AI Conversation Experience",
    description:
      "Read-only AI Conversation Experience for Chapter 5 — delegates-only via CH5-X1 AI Experience Foundation.",
    conversation_chain: AI_CONVERSATION_EXPERIENCE_CHAIN,
    upstream_module: UPSTREAM_MODULE_ID,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    conversation_views: CONVERSATION_VIEWS,
    read_only: true,
    generated_at: AI_CONVERSATION_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function buildAiConversationExperienceSummary(
  output: AiConversationExperienceOutput
): AiConversationExperienceSummary {
  return {
    schemaVersion: AI_CONVERSATION_EXPERIENCE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    conversationConfidenceLevel: output.conversationConfidence.level,
    conversationConfidenceScore: output.conversationConfidence.score,
    conversationStatusLevel: output.conversationStatus.level,
    conversationStatusScore: output.conversationStatus.score,
    messageCount: output.conversationMessages.messages.length,
    conversationChain: AI_CONVERSATION_EXPERIENCE_CHAIN,
    readOnly: true,
    generatedAt: AI_CONVERSATION_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function toConversationContextScreen(
  output: AiConversationExperienceOutput
): ConversationContextScreen {
  return {
    schema_version: AI_CONVERSATION_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    conversation_context: output.conversationContext,
    conversation_confidence: output.conversationConfidence,
    read_only: true,
  };
}

export function toConversationDomainScreen<T>(
  output: AiConversationExperienceOutput,
  view: T
): ConversationDomainScreen {
  return {
    schema_version: AI_CONVERSATION_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    view,
    read_only: true,
  };
}

export function toConversationExplanationScreen(
  output: AiConversationExperienceOutput
): ConversationExplanationScreen {
  return {
    schema_version: AI_CONVERSATION_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.explanation,
    conversation_confidence: output.conversationConfidence,
    read_only: true,
  };
}

export function toConversationSummaryScreen(
  summary: AiConversationExperienceSummary
): ConversationSummaryScreen {
  return {
    schema_version: AI_CONVERSATION_EXPERIENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toConversationValidationScreen(
  validation: AiConversationExperienceValidation
): ConversationValidationScreen {
  return {
    schema_version: AI_CONVERSATION_EXPERIENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}
