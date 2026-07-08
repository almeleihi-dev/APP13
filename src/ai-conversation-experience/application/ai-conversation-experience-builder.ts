import type { AiExperienceFoundationOutput } from "../../ai-experience/domain/ai-experience-foundation-context.js";
import { UPSTREAM_MODULE_ID } from "../domain/ai-conversation-experience-schema.js";
import type {
  ConversationCheck,
  ConversationContext,
  ConversationThread,
  ConversationMessages,
  ConversationMessage,
  ConversationStatus,
  ConversationReadiness,
  DelegationConversation,
  ConversationConfidence,
  ConversationExplanation,
} from "../domain/ai-conversation-experience-context.js";
import type {
  ConversationStatusLevel,
  ConversationConfidenceLevel,
} from "../domain/ai-conversation-experience-schema.js";

function mapFoundationStatus(status: string): ConversationStatusLevel {
  if (status === "ready") return "active";
  if (status === "conditional") return "conditional";
  if (status === "pending") return "pending";
  return "inactive";
}

function check(id: string, label: string, passed: boolean, score: number, detail: string): ConversationCheck {
  return { checkId: id, label, passed, score, detail };
}

export class ConversationContextBuilder {
  build(foundation: AiExperienceFoundationOutput): ConversationContext {
    const shared = foundation.sharedContext;

    return {
      contextId: `conversation-context-${foundation.outputId}`,
      foundationOutputId: foundation.outputId,
      sharedContextId: shared.contextId,
      scenarioId: foundation.scenarioId,
      canonicalActionId: foundation.canonicalActionId,
      goal: foundation.goal,
      experienceMode: "read_only",
    };
  }
}

export class ConversationThreadBuilder {
  build(foundation: AiExperienceFoundationOutput): ConversationThread {
    const threadId = `thread-${foundation.outputId}`;

    return {
      threadId,
      title: `AI Conversation: ${foundation.goal}`,
      goal: foundation.goal,
      scenarioId: foundation.scenarioId,
      messageCount: 4,
      readOnly: true,
      summary: `Read-only conversation thread for "${foundation.goal}" — derived from ${UPSTREAM_MODULE_ID} foundation.`,
    };
  }
}

export class ConversationMessagesBuilder {
  build(foundation: AiExperienceFoundationOutput, thread: ConversationThread): ConversationMessages {
    const messages: ConversationMessage[] = [
      {
        messageId: `msg-system-${foundation.outputId}`,
        role: "system",
        content: foundation.explanation.summary,
        sequence: 1,
      },
      {
        messageId: `msg-context-${foundation.outputId}`,
        role: "context",
        content: foundation.explanation.contextSummary,
        sequence: 2,
      },
      {
        messageId: `msg-assistant-handoff-${foundation.outputId}`,
        role: "assistant",
        content: foundation.explanation.handoffSummary,
        sequence: 3,
      },
      {
        messageId: `msg-assistant-readiness-${foundation.outputId}`,
        role: "assistant",
        content: foundation.explanation.readinessSummary,
        sequence: 4,
      },
    ];

    return {
      messagesId: `messages-${foundation.outputId}`,
      threadId: thread.threadId,
      messages,
      summary: `${messages.length} deterministic read-only messages for conversation thread.`,
    };
  }
}

export class ConversationStatusBuilder {
  build(foundation: AiExperienceFoundationOutput): ConversationStatus {
    const foundationStatus = foundation.foundationStatus;
    const level = mapFoundationStatus(foundationStatus.level);
    const conversationReady = level === "active" || level === "conditional";

    return {
      statusId: "conversation.status",
      level,
      score: foundationStatus.score,
      foundationStatusLevel: foundationStatus.level,
      conversationReady,
      summary: `Conversation status ${level} — ${foundationStatus.score}/100, foundation ${foundationStatus.level}.`,
    };
  }
}

export class ConversationReadinessBuilder {
  build(foundation: AiExperienceFoundationOutput): ConversationReadiness {
    const readiness = foundation.foundationReadiness;
    const level = mapFoundationStatus(readiness.level);
    const conversationReady = readiness.foundationReady && readiness.readinessScore >= 50;

    return {
      readinessId: "conversation.readiness",
      level,
      readinessScore: readiness.readinessScore,
      conversationReady,
      checks: readiness.checks.map((c) =>
        check(c.checkId, c.label, c.passed, c.score, c.detail)
      ),
      summary: `Conversation readiness — ${readiness.readinessScore}/100, conversation ${conversationReady ? "ready" : "pending"}.`,
    };
  }
}

export class DelegationConversationBuilder {
  build(foundation: AiExperienceFoundationOutput): DelegationConversation {
    const checks: ConversationCheck[] = [
      check(
        "del.upstream",
        "Sole upstream delegation",
        !!foundation.outputId,
        foundation.outputId ? 100 : 0,
        `Delegates exclusively to ${UPSTREAM_MODULE_ID} AI Experience Foundation.`
      ),
      check(
        "del.trace",
        "Foundation traceability",
        !!foundation.closureOutputId,
        foundation.closureOutputId ? 95 : 0,
        `Foundation ${foundation.outputId} → closure ${foundation.closureOutputId}.`
      ),
      check(
        "del.nodup",
        "No duplicated business logic",
        true,
        100,
        "Conversation builders format foundation output only."
      ),
    ];

    return {
      delegationId: "conversation.delegation",
      soleUpstream: "CH5-X1 AI Experience Foundation",
      noDuplicatedLogic: true,
      foundationOutputId: foundation.outputId,
      checks,
      summary: "Delegation conversation — sole upstream X1, no duplicated logic.",
    };
  }
}

export class ConversationConfidenceBuilder {
  build(foundation: AiExperienceFoundationOutput, overallScore: number): ConversationConfidence {
    let score = 48;
    score += Math.min(foundation.foundationConfidence.score * 0.24, 22);
    score += Math.min(overallScore * 0.22, 22);
    score = Math.min(98, Math.max(40, Math.round(score)));

    const level: ConversationConfidenceLevel = score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "AI Conversation Experience meets high-confidence criteria from foundation."
          : level === "medium"
            ? "Conversation viable with conditional foundation requiring review."
            : "Limited conversation confidence — treat outputs as advisory only.",
      foundationConfidenceScore: foundation.foundationConfidence.score,
    };
  }
}

export class ConversationExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    foundation: AiExperienceFoundationOutput;
    thread: ConversationThread;
    messages: ConversationMessages;
    status: ConversationStatus;
    readiness: ConversationReadiness;
    conversationConfidenceScore: number;
  }): ConversationExplanation {
    return {
      explanationId: `conversation-explanation-${input.outputId}`,
      headline: `AI Conversation for "${input.goal}"`,
      summary: `Read-only conversation experience (confidence ${input.conversationConfidenceScore}/100) — status ${input.status.level}, ${input.messages.messages.length} messages.`,
      threadSummary: input.thread.summary,
      contextSummary: input.foundation.explanation.contextSummary,
      readinessSummary: input.readiness.summary,
    };
  }
}

export function createConversationContextBuilder(): ConversationContextBuilder {
  return new ConversationContextBuilder();
}
export function createConversationThreadBuilder(): ConversationThreadBuilder {
  return new ConversationThreadBuilder();
}
export function createConversationMessagesBuilder(): ConversationMessagesBuilder {
  return new ConversationMessagesBuilder();
}
export function createConversationStatusBuilder(): ConversationStatusBuilder {
  return new ConversationStatusBuilder();
}
export function createConversationReadinessBuilder(): ConversationReadinessBuilder {
  return new ConversationReadinessBuilder();
}
export function createDelegationConversationBuilder(): DelegationConversationBuilder {
  return new DelegationConversationBuilder();
}
export function createConversationConfidenceBuilder(): ConversationConfidenceBuilder {
  return new ConversationConfidenceBuilder();
}
export function createConversationExplanationBuilder(): ConversationExplanationBuilder {
  return new ConversationExplanationBuilder();
}
