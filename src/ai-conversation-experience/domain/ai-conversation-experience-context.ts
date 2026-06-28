import type {
  ConversationConfidenceLevel,
  ConversationStatusLevel,
  ConversationScenarioId,
} from "./ai-conversation-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface AiConversationExperienceContext {
  scenarioId?: ConversationScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface ConversationCheck {
  checkId: string;
  label: string;
  passed: boolean;
  score: number;
  detail: string;
}

export interface ConversationContext {
  contextId: string;
  foundationOutputId: string;
  sharedContextId: string;
  scenarioId: ConversationScenarioId | null;
  canonicalActionId: string;
  goal: string;
  experienceMode: "read_only";
}

export interface ConversationThread {
  threadId: string;
  title: string;
  goal: string;
  scenarioId: ConversationScenarioId | null;
  messageCount: number;
  readOnly: true;
  summary: string;
}

export interface ConversationMessage {
  messageId: string;
  role: "system" | "assistant" | "context";
  content: string;
  sequence: number;
}

export interface ConversationMessages {
  messagesId: string;
  threadId: string;
  messages: ConversationMessage[];
  summary: string;
}

export interface ConversationStatus {
  statusId: string;
  level: ConversationStatusLevel;
  score: number;
  foundationStatusLevel: string;
  conversationReady: boolean;
  summary: string;
}

export interface ConversationReadiness {
  readinessId: string;
  level: ConversationStatusLevel;
  readinessScore: number;
  conversationReady: boolean;
  checks: ConversationCheck[];
  summary: string;
}

export interface DelegationConversation {
  delegationId: string;
  soleUpstream: string;
  noDuplicatedLogic: boolean;
  foundationOutputId: string;
  checks: ConversationCheck[];
  summary: string;
}

export interface ConversationConfidence {
  level: ConversationConfidenceLevel;
  score: number;
  rationale: string;
  foundationConfidenceScore: number;
}

export interface ConversationExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  threadSummary: string;
  contextSummary: string;
  readinessSummary: string;
}

export interface AiConversationExperienceOutput {
  outputId: string;
  foundationOutputId: string;
  closureOutputId: string;
  canonicalActionId: string;
  scenarioId: ConversationScenarioId | null;
  goal: string;
  conversationContext: ConversationContext;
  conversationThread: ConversationThread;
  conversationMessages: ConversationMessages;
  conversationStatus: ConversationStatus;
  conversationReadiness: ConversationReadiness;
  delegationConversation: DelegationConversation;
  conversationConfidence: ConversationConfidence;
  explanation: ConversationExplanation;
  readOnly: true;
}

export interface AiConversationExperienceSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: ConversationScenarioId | null;
  conversationConfidenceLevel: ConversationConfidenceLevel;
  conversationConfidenceScore: number;
  conversationStatusLevel: ConversationStatusLevel;
  conversationStatusScore: number;
  messageCount: number;
  conversationChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface AiConversationExperienceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}
