import type { AiInsightGenerationExperienceOutput } from "../../ai-insight-generation-experience/domain/ai-insight-generation-experience-context.js";
import { UPSTREAM_MODULE_ID } from "../domain/ai-recommendation-intelligence-experience-schema.js";
import type {
  RecommendationCheck,
  RecommendationContext,
  PersonalizedRecommendations,
  RecommendationItem,
  PriorityRecommendations,
  OpportunityRecommendations,
  RiskMitigationRecommendations,
  StrategicRecommendations,
  RecommendationConfidence,
  RecommendationReadiness,
  DelegationRecommendationIntelligence,
  RecommendationExplanation,
} from "../domain/ai-recommendation-intelligence-experience-context.js";
import type {
  RecommendationIntelligenceStatusLevel,
  RecommendationIntelligenceConfidenceLevel,
} from "../domain/ai-recommendation-intelligence-experience-schema.js";

function mapInsightStatus(status: string): RecommendationIntelligenceStatusLevel {
  if (status === "insight_ready") return "recommendation_ready";
  if (status === "conditional") return "conditional";
  if (status === "pending") return "pending";
  return "not_ready";
}

function check(
  id: string,
  label: string,
  passed: boolean,
  score: number,
  detail: string
): RecommendationCheck {
  return { checkId: id, label, passed, score, detail };
}

function toItem(
  id: string,
  sequence: number,
  title: string,
  detail: string,
  sourceId: string
): RecommendationItem {
  return { recommendationId: id, sequence, title, detail, sourceId };
}

export class RecommendationContextBuilder {
  build(insights: AiInsightGenerationExperienceOutput): RecommendationContext {
    const ctx = insights.insightContext;

    return {
      contextId: `recommendation-context-${insights.outputId}`,
      insightGenerationOutputId: insights.outputId,
      adaptiveCoachingOutputId: ctx.adaptiveCoachingOutputId,
      progressIntelligenceOutputId: ctx.progressIntelligenceOutputId,
      executionCompanionOutputId: ctx.executionCompanionOutputId,
      actionPlanningOutputId: ctx.actionPlanningOutputId,
      decisionSupportOutputId: ctx.decisionSupportOutputId,
      guidanceOutputId: ctx.guidanceOutputId,
      conversationOutputId: ctx.conversationOutputId,
      foundationOutputId: ctx.foundationOutputId,
      scenarioId: insights.scenarioId,
      canonicalActionId: insights.canonicalActionId,
      goal: insights.goal,
      experienceMode: "read_only",
    };
  }
}

export class PersonalizedRecommendationsBuilder {
  build(insights: AiInsightGenerationExperienceOutput): PersonalizedRecommendations {
    const recommendations: RecommendationItem[] = insights.generatedInsights.insights.map(
      (insight) =>
        toItem(
          `personalized-${insight.insightId}`,
          insight.sequence,
          insight.label,
          insight.detail,
          insight.sourceInsightId
        )
    );

    return {
      recommendationsId: `personalized-${insights.outputId}`,
      recommendations,
      summary: `${recommendations.length} read-only personalized recommendations from generated insights.`,
    };
  }
}

export class PriorityRecommendationsBuilder {
  build(insights: AiInsightGenerationExperienceOutput): PriorityRecommendations {
    const recommendations: RecommendationItem[] = insights.keyFindings.findings.map((finding) =>
      toItem(
        `priority-${finding.findingId}`,
        finding.sequence,
        finding.title,
        finding.detail,
        finding.findingId
      )
    );

    return {
      recommendationsId: `priority-${insights.outputId}`,
      recommendations,
      summary: `${recommendations.length} read-only priority recommendations from key findings.`,
    };
  }
}

export class OpportunityRecommendationsBuilder {
  build(insights: AiInsightGenerationExperienceOutput): OpportunityRecommendations {
    const recommendations: RecommendationItem[] =
      insights.opportunityAnalysis.opportunities.map((opp) =>
        toItem(
          `opp-rec-${opp.itemId}`,
          opp.sequence,
          opp.title,
          opp.detail,
          opp.sourceOpportunityId
        )
      );

    return {
      recommendationsId: `opportunities-${insights.outputId}`,
      recommendations,
      summary: `${recommendations.length} read-only opportunity recommendations from insight analysis.`,
    };
  }
}

export class RiskMitigationRecommendationsBuilder {
  build(insights: AiInsightGenerationExperienceOutput): RiskMitigationRecommendations {
    const recommendations: RecommendationItem[] = insights.riskAnalysis.risks.map((risk) =>
      toItem(
        `mitigation-${risk.itemId}`,
        risk.sequence,
        risk.title,
        `Mitigate (${risk.level} risk): ${risk.detail}`,
        risk.itemId
      )
    );

    return {
      recommendationsId: `mitigation-${insights.outputId}`,
      recommendations,
      summary: `${recommendations.length} read-only risk mitigation recommendations from risk analysis.`,
    };
  }
}

export class StrategicRecommendationsBuilder {
  build(insights: AiInsightGenerationExperienceOutput): StrategicRecommendations {
    const recommendations: RecommendationItem[] = insights.strategicInsights.insights.map(
      (insight) =>
        toItem(
          `strategic-rec-${insight.insightId}`,
          insight.sequence,
          insight.title,
          insight.detail,
          insight.insightId
        )
    );

    return {
      recommendationsId: `strategic-${insights.outputId}`,
      recommendations,
      summary: `${recommendations.length} read-only strategic recommendations from strategic insights.`,
    };
  }
}

export class RecommendationConfidenceBuilder {
  build(insights: AiInsightGenerationExperienceOutput): RecommendationConfidence {
    let score = 38;
    score += Math.min(insights.insightGenerationConfidence.score * 0.34, 32);
    score += Math.min(insights.insightReadiness.readinessScore * 0.12, 12);
    score = Math.min(98, Math.max(40, Math.round(score)));

    const level: RecommendationIntelligenceConfidenceLevel =
      score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "AI Recommendation Intelligence Experience meets high-confidence criteria from insight generation."
          : level === "medium"
            ? "Recommendation intelligence viable with conditional insights requiring review."
            : "Limited recommendation intelligence confidence — treat outputs as advisory only.",
      insightGenerationConfidenceScore: insights.insightGenerationConfidence.score,
    };
  }
}

export class RecommendationReadinessBuilder {
  build(insights: AiInsightGenerationExperienceOutput): RecommendationReadiness {
    const readiness = insights.insightReadiness;
    const level = mapInsightStatus(readiness.level);
    const recommendationReady = readiness.insightReady && readiness.readinessScore >= 50;

    return {
      readinessId: "recommendation.readiness",
      level,
      readinessScore: readiness.readinessScore,
      recommendationReady,
      checks: readiness.checks.map((c) =>
        check(c.checkId, c.label, c.passed, c.score, c.detail)
      ),
      summary: `Recommendation readiness — ${readiness.readinessScore}/100, recommendations ${recommendationReady ? "ready" : "pending"}.`,
    };
  }
}

export class DelegationRecommendationIntelligenceBuilder {
  build(insights: AiInsightGenerationExperienceOutput): DelegationRecommendationIntelligence {
    const checks: RecommendationCheck[] = [
      check(
        "del.upstream",
        "Sole upstream delegation",
        !!insights.outputId,
        insights.outputId ? 100 : 0,
        `Delegates exclusively to ${UPSTREAM_MODULE_ID} AI Insight Generation Experience.`
      ),
      check(
        "del.trace",
        "Insight generation traceability",
        !!insights.adaptiveCoachingOutputId,
        insights.adaptiveCoachingOutputId ? 95 : 0,
        `Insight generation ${insights.outputId} → adaptive coaching ${insights.adaptiveCoachingOutputId}.`
      ),
      check(
        "del.nodup",
        "No duplicated business logic",
        true,
        100,
        "Recommendation intelligence builders format insight generation output only."
      ),
    ];

    return {
      delegationId: "recommendation.delegation",
      soleUpstream: "CH5-X9 AI Insight Generation Experience",
      noDuplicatedLogic: true,
      insightGenerationOutputId: insights.outputId,
      checks,
      summary: "Delegation recommendation intelligence — sole upstream X9, no duplicated logic.",
    };
  }
}

export class RecommendationExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    personalized: PersonalizedRecommendations;
    priority: PriorityRecommendations;
    readiness: RecommendationReadiness;
    recommendationConfidenceScore: number;
  }): RecommendationExplanation {
    return {
      explanationId: `recommendation-explanation-${input.outputId}`,
      headline: `AI Recommendation Intelligence for "${input.goal}"`,
      summary: `Read-only recommendation intelligence (confidence ${input.recommendationConfidenceScore}/100) — ${input.personalized.recommendations.length} personalized, ${input.priority.recommendations.length} priority recommendations.`,
      personalizedSummary: input.personalized.summary,
      prioritySummary: input.priority.summary,
      readinessSummary: input.readiness.summary,
    };
  }
}

export function createRecommendationContextBuilder(): RecommendationContextBuilder {
  return new RecommendationContextBuilder();
}
export function createPersonalizedRecommendationsBuilder(): PersonalizedRecommendationsBuilder {
  return new PersonalizedRecommendationsBuilder();
}
export function createPriorityRecommendationsBuilder(): PriorityRecommendationsBuilder {
  return new PriorityRecommendationsBuilder();
}
export function createOpportunityRecommendationsBuilder(): OpportunityRecommendationsBuilder {
  return new OpportunityRecommendationsBuilder();
}
export function createRiskMitigationRecommendationsBuilder(): RiskMitigationRecommendationsBuilder {
  return new RiskMitigationRecommendationsBuilder();
}
export function createStrategicRecommendationsBuilder(): StrategicRecommendationsBuilder {
  return new StrategicRecommendationsBuilder();
}
export function createRecommendationConfidenceBuilder(): RecommendationConfidenceBuilder {
  return new RecommendationConfidenceBuilder();
}
export function createRecommendationReadinessBuilder(): RecommendationReadinessBuilder {
  return new RecommendationReadinessBuilder();
}
export function createDelegationRecommendationIntelligenceBuilder(): DelegationRecommendationIntelligenceBuilder {
  return new DelegationRecommendationIntelligenceBuilder();
}
export function createRecommendationExplanationBuilder(): RecommendationExplanationBuilder {
  return new RecommendationExplanationBuilder();
}
