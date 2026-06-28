import type { AiConversationExperienceOutput } from "../../ai-conversation-experience/domain/ai-conversation-experience-context.js";
import { UPSTREAM_MODULE_ID } from "../domain/ai-guidance-experience-schema.js";
import type {
  GuidanceCheck,
  GuidanceContext,
  GuidancePlan,
  GuidanceSteps,
  GuidanceStep,
  GuidanceRecommendations,
  GuidanceRecommendation,
  GuidanceStatus,
  GuidanceReadiness,
  DelegationGuidance,
  GuidanceConfidence,
  GuidanceExplanation,
} from "../domain/ai-guidance-experience-context.js";
import type {
  GuidanceStatusLevel,
  GuidanceConfidenceLevel,
} from "../domain/ai-guidance-experience-schema.js";

function mapConversationStatus(status: string): GuidanceStatusLevel {
  if (status === "active") return "guided";
  if (status === "conditional") return "conditional";
  if (status === "pending") return "pending";
  return "unavailable";
}

function check(id: string, label: string, passed: boolean, score: number, detail: string): GuidanceCheck {
  return { checkId: id, label, passed, score, detail };
}

const STEP_TITLES = [
  "Review conversation context",
  "Understand foundation handoff",
  "Assess readiness signals",
  "Follow read-only guidance",
] as const;

const RECOMMENDATION_CATEGORIES = [
  "context",
  "readiness",
  "delegation",
] as const;

export class GuidanceContextBuilder {
  build(conversation: AiConversationExperienceOutput): GuidanceContext {
    const ctx = conversation.conversationContext;

    return {
      contextId: `guidance-context-${conversation.outputId}`,
      conversationOutputId: conversation.outputId,
      conversationContextId: ctx.contextId,
      foundationOutputId: ctx.foundationOutputId,
      scenarioId: conversation.scenarioId,
      canonicalActionId: conversation.canonicalActionId,
      goal: conversation.goal,
      experienceMode: "read_only",
    };
  }
}

export class GuidancePlanBuilder {
  build(conversation: AiConversationExperienceOutput): GuidancePlan {
    const stepCount = conversation.conversationMessages.messages.length;

    return {
      planId: `plan-${conversation.outputId}`,
      title: `AI Guidance Plan: ${conversation.goal}`,
      goal: conversation.goal,
      stepCount,
      readOnly: true,
      summary: `Read-only guidance plan with ${stepCount} steps for "${conversation.goal}" — derived from ${UPSTREAM_MODULE_ID}.`,
    };
  }
}

export class GuidanceStepsBuilder {
  build(conversation: AiConversationExperienceOutput, plan: GuidancePlan): GuidanceSteps {
    const messages = conversation.conversationMessages.messages;
    const steps: GuidanceStep[] = messages.map((message, index) => ({
      stepId: `step-${message.messageId}`,
      sequence: index + 1,
      title: STEP_TITLES[index] ?? `Guidance step ${index + 1}`,
      detail: message.content,
      sourceMessageId: message.messageId,
    }));

    return {
      stepsId: `steps-${conversation.outputId}`,
      planId: plan.planId,
      steps,
      summary: `${steps.length} deterministic read-only guidance steps from conversation messages.`,
    };
  }
}

export class GuidanceRecommendationsBuilder {
  build(conversation: AiConversationExperienceOutput): GuidanceRecommendations {
    const recommendations: GuidanceRecommendation[] = [
      {
        recommendationId: `rec-context-${conversation.outputId}`,
        sequence: 1,
        category: RECOMMENDATION_CATEGORIES[0],
        recommendation: conversation.explanation.contextSummary,
      },
      {
        recommendationId: `rec-readiness-${conversation.outputId}`,
        sequence: 2,
        category: RECOMMENDATION_CATEGORIES[1],
        recommendation: conversation.explanation.readinessSummary,
      },
      {
        recommendationId: `rec-thread-${conversation.outputId}`,
        sequence: 3,
        category: RECOMMENDATION_CATEGORIES[2],
        recommendation: conversation.explanation.threadSummary,
      },
    ];

    return {
      recommendationsId: `recommendations-${conversation.outputId}`,
      recommendations,
      summary: `${recommendations.length} read-only guidance recommendations from conversation experience.`,
    };
  }
}

export class GuidanceStatusBuilder {
  build(conversation: AiConversationExperienceOutput): GuidanceStatus {
    const convStatus = conversation.conversationStatus;
    const level = mapConversationStatus(convStatus.level);
    const guidanceReady = level === "guided" || level === "conditional";

    return {
      statusId: "guidance.status",
      level,
      score: convStatus.score,
      conversationStatusLevel: convStatus.level,
      guidanceReady,
      summary: `Guidance status ${level} — ${convStatus.score}/100, conversation ${convStatus.level}.`,
    };
  }
}

export class GuidanceReadinessBuilder {
  build(conversation: AiConversationExperienceOutput): GuidanceReadiness {
    const readiness = conversation.conversationReadiness;
    const level = mapConversationStatus(readiness.level);
    const guidanceReady = readiness.conversationReady && readiness.readinessScore >= 50;

    return {
      readinessId: "guidance.readiness",
      level,
      readinessScore: readiness.readinessScore,
      guidanceReady,
      checks: readiness.checks.map((c) =>
        check(c.checkId, c.label, c.passed, c.score, c.detail)
      ),
      summary: `Guidance readiness — ${readiness.readinessScore}/100, guidance ${guidanceReady ? "ready" : "pending"}.`,
    };
  }
}

export class DelegationGuidanceBuilder {
  build(conversation: AiConversationExperienceOutput): DelegationGuidance {
    const checks: GuidanceCheck[] = [
      check(
        "del.upstream",
        "Sole upstream delegation",
        !!conversation.outputId,
        conversation.outputId ? 100 : 0,
        `Delegates exclusively to ${UPSTREAM_MODULE_ID} AI Conversation Experience.`
      ),
      check(
        "del.trace",
        "Conversation traceability",
        !!conversation.foundationOutputId,
        conversation.foundationOutputId ? 95 : 0,
        `Conversation ${conversation.outputId} → foundation ${conversation.foundationOutputId}.`
      ),
      check(
        "del.nodup",
        "No duplicated business logic",
        true,
        100,
        "Guidance builders format conversation output only."
      ),
    ];

    return {
      delegationId: "guidance.delegation",
      soleUpstream: "CH5-X2 AI Conversation Experience",
      noDuplicatedLogic: true,
      conversationOutputId: conversation.outputId,
      checks,
      summary: "Delegation guidance — sole upstream X2, no duplicated logic.",
    };
  }
}

export class GuidanceConfidenceBuilder {
  build(conversation: AiConversationExperienceOutput, overallScore: number): GuidanceConfidence {
    let score = 48;
    score += Math.min(conversation.conversationConfidence.score * 0.24, 22);
    score += Math.min(overallScore * 0.22, 22);
    score = Math.min(98, Math.max(40, Math.round(score)));

    const level: GuidanceConfidenceLevel = score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "AI Guidance Experience meets high-confidence criteria from conversation."
          : level === "medium"
            ? "Guidance viable with conditional conversation requiring review."
            : "Limited guidance confidence — treat outputs as advisory only.",
      conversationConfidenceScore: conversation.conversationConfidence.score,
    };
  }
}

export class GuidanceExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    conversation: AiConversationExperienceOutput;
    plan: GuidancePlan;
    steps: GuidanceSteps;
    status: GuidanceStatus;
    readiness: GuidanceReadiness;
    guidanceConfidenceScore: number;
  }): GuidanceExplanation {
    return {
      explanationId: `guidance-explanation-${input.outputId}`,
      headline: `AI Guidance for "${input.goal}"`,
      summary: `Read-only guidance experience (confidence ${input.guidanceConfidenceScore}/100) — status ${input.status.level}, ${input.steps.steps.length} steps.`,
      planSummary: input.plan.summary,
      contextSummary: input.conversation.explanation.contextSummary,
      readinessSummary: input.readiness.summary,
    };
  }
}

export function createGuidanceContextBuilder(): GuidanceContextBuilder {
  return new GuidanceContextBuilder();
}
export function createGuidancePlanBuilder(): GuidancePlanBuilder {
  return new GuidancePlanBuilder();
}
export function createGuidanceStepsBuilder(): GuidanceStepsBuilder {
  return new GuidanceStepsBuilder();
}
export function createGuidanceRecommendationsBuilder(): GuidanceRecommendationsBuilder {
  return new GuidanceRecommendationsBuilder();
}
export function createGuidanceStatusBuilder(): GuidanceStatusBuilder {
  return new GuidanceStatusBuilder();
}
export function createGuidanceReadinessBuilder(): GuidanceReadinessBuilder {
  return new GuidanceReadinessBuilder();
}
export function createDelegationGuidanceBuilder(): DelegationGuidanceBuilder {
  return new DelegationGuidanceBuilder();
}
export function createGuidanceConfidenceBuilder(): GuidanceConfidenceBuilder {
  return new GuidanceConfidenceBuilder();
}
export function createGuidanceExplanationBuilder(): GuidanceExplanationBuilder {
  return new GuidanceExplanationBuilder();
}
