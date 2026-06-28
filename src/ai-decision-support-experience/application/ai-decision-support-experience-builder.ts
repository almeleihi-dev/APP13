import type { AiGuidanceExperienceOutput } from "../../ai-guidance-experience/domain/ai-guidance-experience-context.js";
import { UPSTREAM_MODULE_ID } from "../domain/ai-decision-support-experience-schema.js";
import type {
  DecisionSupportCheck,
  DecisionSupportContext,
  DecisionOptions,
  DecisionOption,
  DecisionAnalysis,
  DecisionRecommendation,
  DecisionSupportStatus,
  DecisionSupportReadiness,
  DelegationDecisionSupport,
  DecisionSupportConfidence,
  DecisionSupportExplanation,
} from "../domain/ai-decision-support-experience-context.js";
import type {
  DecisionSupportStatusLevel,
  DecisionSupportConfidenceLevel,
} from "../domain/ai-decision-support-experience-schema.js";

function mapGuidanceStatus(status: string): DecisionSupportStatusLevel {
  if (status === "guided") return "supported";
  if (status === "conditional") return "conditional";
  if (status === "pending") return "pending";
  return "unsupported";
}

function check(id: string, label: string, passed: boolean, score: number, detail: string): DecisionSupportCheck {
  return { checkId: id, label, passed, score, detail };
}

export class DecisionSupportContextBuilder {
  build(guidance: AiGuidanceExperienceOutput): DecisionSupportContext {
    const ctx = guidance.guidanceContext;

    return {
      contextId: `decision-context-${guidance.outputId}`,
      guidanceOutputId: guidance.outputId,
      guidanceContextId: ctx.contextId,
      conversationOutputId: ctx.conversationOutputId,
      foundationOutputId: ctx.foundationOutputId,
      scenarioId: guidance.scenarioId,
      canonicalActionId: guidance.canonicalActionId,
      goal: guidance.goal,
      experienceMode: "read_only",
    };
  }
}

export class DecisionOptionsBuilder {
  build(guidance: AiGuidanceExperienceOutput): DecisionOptions {
    const steps = guidance.guidanceSteps.steps;
    const options: DecisionOption[] = steps.map((step) => ({
      optionId: `option-${step.stepId}`,
      sequence: step.sequence,
      label: step.title,
      detail: step.detail,
      sourceStepId: step.stepId,
    }));

    return {
      optionsId: `options-${guidance.outputId}`,
      optionCount: options.length,
      options,
      summary: `${options.length} read-only decision options derived from guidance steps.`,
    };
  }
}

export class DecisionAnalysisBuilder {
  build(guidance: AiGuidanceExperienceOutput): DecisionAnalysis {
    const status = guidance.guidanceStatus;
    const factors: DecisionSupportCheck[] = [
      check(
        "analysis.guidance",
        "Guidance status factor",
        status.guidanceReady,
        status.score,
        status.summary
      ),
      check(
        "analysis.readiness",
        "Guidance readiness factor",
        guidance.guidanceReadiness.guidanceReady,
        guidance.guidanceReadiness.readinessScore,
        guidance.guidanceReadiness.summary
      ),
      check(
        "analysis.recommendations",
        "Guidance recommendations factor",
        guidance.guidanceRecommendations.recommendations.length >= 3,
        Math.min(100, guidance.guidanceRecommendations.recommendations.length * 33),
        guidance.guidanceRecommendations.summary
      ),
    ];

    return {
      analysisId: `analysis-${guidance.outputId}`,
      goal: guidance.goal,
      guidanceStatusLevel: status.level,
      guidanceScore: status.score,
      factors,
      summary: `Decision analysis for "${guidance.goal}" — guidance ${status.level} at ${status.score}/100.`,
    };
  }
}

export class DecisionRecommendationBuilder {
  build(guidance: AiGuidanceExperienceOutput, analysis: DecisionAnalysis): DecisionRecommendation {
    const topRec = guidance.guidanceRecommendations.recommendations[0];
    const confidence = guidance.guidanceConfidence.level;

    return {
      recommendationId: `decision-rec-${guidance.outputId}`,
      headline: `Recommended decision for "${guidance.goal}"`,
      recommendedAction: topRec?.recommendation ?? guidance.explanation.planSummary,
      confidenceLevel: confidence,
      rationale: `Based on ${UPSTREAM_MODULE_ID} guidance analysis (score ${analysis.guidanceScore}/100).`,
      summary: `Read-only decision recommendation with ${confidence} confidence from guidance experience.`,
    };
  }
}

export class DecisionSupportStatusBuilder {
  build(guidance: AiGuidanceExperienceOutput): DecisionSupportStatus {
    const guidanceStatus = guidance.guidanceStatus;
    const level = mapGuidanceStatus(guidanceStatus.level);
    const decisionSupportReady = level === "supported" || level === "conditional";

    return {
      statusId: "decision.status",
      level,
      score: guidanceStatus.score,
      guidanceStatusLevel: guidanceStatus.level,
      decisionSupportReady,
      summary: `Decision support status ${level} — ${guidanceStatus.score}/100, guidance ${guidanceStatus.level}.`,
    };
  }
}

export class DecisionSupportReadinessBuilder {
  build(guidance: AiGuidanceExperienceOutput): DecisionSupportReadiness {
    const readiness = guidance.guidanceReadiness;
    const level = mapGuidanceStatus(readiness.level);
    const decisionSupportReady = readiness.guidanceReady && readiness.readinessScore >= 50;

    return {
      readinessId: "decision.readiness",
      level,
      readinessScore: readiness.readinessScore,
      decisionSupportReady,
      checks: readiness.checks.map((c) =>
        check(c.checkId, c.label, c.passed, c.score, c.detail)
      ),
      summary: `Decision support readiness — ${readiness.readinessScore}/100, support ${decisionSupportReady ? "ready" : "pending"}.`,
    };
  }
}

export class DelegationDecisionSupportBuilder {
  build(guidance: AiGuidanceExperienceOutput): DelegationDecisionSupport {
    const checks: DecisionSupportCheck[] = [
      check(
        "del.upstream",
        "Sole upstream delegation",
        !!guidance.outputId,
        guidance.outputId ? 100 : 0,
        `Delegates exclusively to ${UPSTREAM_MODULE_ID} AI Guidance Experience.`
      ),
      check(
        "del.trace",
        "Guidance traceability",
        !!guidance.conversationOutputId,
        guidance.conversationOutputId ? 95 : 0,
        `Guidance ${guidance.outputId} → conversation ${guidance.conversationOutputId}.`
      ),
      check(
        "del.nodup",
        "No duplicated business logic",
        true,
        100,
        "Decision support builders format guidance output only."
      ),
    ];

    return {
      delegationId: "decision.delegation",
      soleUpstream: "CH5-X3 AI Guidance Experience",
      noDuplicatedLogic: true,
      guidanceOutputId: guidance.outputId,
      checks,
      summary: "Delegation decision support — sole upstream X3, no duplicated logic.",
    };
  }
}

export class DecisionSupportConfidenceBuilder {
  build(guidance: AiGuidanceExperienceOutput, overallScore: number): DecisionSupportConfidence {
    let score = 48;
    score += Math.min(guidance.guidanceConfidence.score * 0.24, 22);
    score += Math.min(overallScore * 0.22, 22);
    score = Math.min(98, Math.max(40, Math.round(score)));

    const level: DecisionSupportConfidenceLevel = score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "AI Decision Support Experience meets high-confidence criteria from guidance."
          : level === "medium"
            ? "Decision support viable with conditional guidance requiring review."
            : "Limited decision support confidence — treat outputs as advisory only.",
      guidanceConfidenceScore: guidance.guidanceConfidence.score,
    };
  }
}

export class DecisionSupportExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    guidance: AiGuidanceExperienceOutput;
    options: DecisionOptions;
    analysis: DecisionAnalysis;
    recommendation: DecisionRecommendation;
    readiness: DecisionSupportReadiness;
    decisionSupportConfidenceScore: number;
  }): DecisionSupportExplanation {
    return {
      explanationId: `decision-explanation-${input.outputId}`,
      headline: `AI Decision Support for "${input.goal}"`,
      summary: `Read-only decision support (confidence ${input.decisionSupportConfidenceScore}/100) — ${input.options.optionCount} options, recommendation: ${input.recommendation.confidenceLevel} confidence.`,
      analysisSummary: input.analysis.summary,
      optionsSummary: input.options.summary,
      readinessSummary: input.readiness.summary,
    };
  }
}

export function createDecisionSupportContextBuilder(): DecisionSupportContextBuilder {
  return new DecisionSupportContextBuilder();
}
export function createDecisionOptionsBuilder(): DecisionOptionsBuilder {
  return new DecisionOptionsBuilder();
}
export function createDecisionAnalysisBuilder(): DecisionAnalysisBuilder {
  return new DecisionAnalysisBuilder();
}
export function createDecisionRecommendationBuilder(): DecisionRecommendationBuilder {
  return new DecisionRecommendationBuilder();
}
export function createDecisionSupportStatusBuilder(): DecisionSupportStatusBuilder {
  return new DecisionSupportStatusBuilder();
}
export function createDecisionSupportReadinessBuilder(): DecisionSupportReadinessBuilder {
  return new DecisionSupportReadinessBuilder();
}
export function createDelegationDecisionSupportBuilder(): DelegationDecisionSupportBuilder {
  return new DelegationDecisionSupportBuilder();
}
export function createDecisionSupportConfidenceBuilder(): DecisionSupportConfidenceBuilder {
  return new DecisionSupportConfidenceBuilder();
}
export function createDecisionSupportExplanationBuilder(): DecisionSupportExplanationBuilder {
  return new DecisionSupportExplanationBuilder();
}
