import type { AiRecommendationIntelligenceExperienceOutput } from "../../ai-recommendation-intelligence-experience/domain/ai-recommendation-intelligence-experience-context.js";
import { UPSTREAM_MODULE_ID } from "../domain/ai-predictive-intelligence-experience-schema.js";
import type {
  PredictiveCheck,
  PredictionContext,
  OutcomePredictions,
  OutcomePrediction,
  SuccessProbability,
  FutureScenarios,
  FutureScenario,
  EarlyWarningSignals,
  EarlyWarningSignal,
  PredictiveOpportunities,
  PredictiveOpportunity,
  PredictiveRisks,
  PredictiveRisk,
  PredictionConfidence,
  PredictionReadiness,
  DelegationPredictiveIntelligence,
  PredictionExplanation,
} from "../domain/ai-predictive-intelligence-experience-context.js";
import type {
  PredictiveIntelligenceStatusLevel,
  PredictiveIntelligenceConfidenceLevel,
} from "../domain/ai-predictive-intelligence-experience-schema.js";

function mapRecommendationStatus(status: string): PredictiveIntelligenceStatusLevel {
  if (status === "recommendation_ready") return "prediction_ready";
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
): PredictiveCheck {
  return { checkId: id, label, passed, score, detail };
}

export class PredictionContextBuilder {
  build(recommendations: AiRecommendationIntelligenceExperienceOutput): PredictionContext {
    const ctx = recommendations.recommendationContext;

    return {
      contextId: `prediction-context-${recommendations.outputId}`,
      recommendationIntelligenceOutputId: recommendations.outputId,
      insightGenerationOutputId: ctx.insightGenerationOutputId,
      adaptiveCoachingOutputId: ctx.adaptiveCoachingOutputId,
      progressIntelligenceOutputId: ctx.progressIntelligenceOutputId,
      executionCompanionOutputId: ctx.executionCompanionOutputId,
      actionPlanningOutputId: ctx.actionPlanningOutputId,
      decisionSupportOutputId: ctx.decisionSupportOutputId,
      guidanceOutputId: ctx.guidanceOutputId,
      conversationOutputId: ctx.conversationOutputId,
      foundationOutputId: ctx.foundationOutputId,
      scenarioId: recommendations.scenarioId,
      canonicalActionId: recommendations.canonicalActionId,
      goal: recommendations.goal,
      experienceMode: "read_only",
    };
  }
}

export class OutcomePredictionsBuilder {
  build(recommendations: AiRecommendationIntelligenceExperienceOutput): OutcomePredictions {
    const predictions: OutcomePrediction[] =
      recommendations.personalizedRecommendations.recommendations.map((rec) => ({
        predictionId: `outcome-${rec.recommendationId}`,
        sequence: rec.sequence,
        title: rec.title,
        detail: `Predicted outcome: ${rec.detail}`,
        sourceRecommendationId: rec.recommendationId,
      }));

    return {
      predictionsId: `outcomes-${recommendations.outputId}`,
      predictions,
      summary: `${predictions.length} read-only outcome predictions from personalized recommendations.`,
    };
  }
}

export class SuccessProbabilityBuilder {
  build(recommendations: AiRecommendationIntelligenceExperienceOutput): SuccessProbability {
    const score = Math.min(
      98,
      Math.max(
        40,
        Math.round(
          recommendations.recommendationConfidence.score * 0.85 +
            recommendations.recommendationReadiness.readinessScore * 0.1
        )
      )
    );
    const level: PredictiveIntelligenceConfidenceLevel =
      score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      probabilityId: `probability-${recommendations.outputId}`,
      score,
      level,
      readOnly: true,
      summary: `Read-only success probability ${score}/100 (${level}) — derived from ${UPSTREAM_MODULE_ID}.`,
    };
  }
}

export class FutureScenariosBuilder {
  build(recommendations: AiRecommendationIntelligenceExperienceOutput): FutureScenarios {
    const scenarios: FutureScenario[] = recommendations.strategicRecommendations.recommendations.map(
      (rec) => ({
        scenarioId: `future-${rec.recommendationId}`,
        sequence: rec.sequence,
        title: rec.title,
        detail: `Future scenario: ${rec.detail}`,
      })
    );

    return {
      scenariosId: `scenarios-${recommendations.outputId}`,
      scenarios,
      summary: `${scenarios.length} read-only future scenarios from strategic recommendations.`,
    };
  }
}

export class EarlyWarningSignalsBuilder {
  build(recommendations: AiRecommendationIntelligenceExperienceOutput): EarlyWarningSignals {
    const signals: EarlyWarningSignal[] =
      recommendations.riskMitigationRecommendations.recommendations.map((rec, index) => ({
        signalId: `warning-${rec.recommendationId}`,
        sequence: index + 1,
        label: rec.title,
        detail: rec.detail,
        severity: index === 0 ? ("medium" as const) : index === 1 ? ("low" as const) : ("high" as const),
      }));

    return {
      signalsId: `warnings-${recommendations.outputId}`,
      signals,
      summary: `${signals.length} read-only early warning signals from risk mitigation recommendations.`,
    };
  }
}

export class PredictiveOpportunitiesBuilder {
  build(recommendations: AiRecommendationIntelligenceExperienceOutput): PredictiveOpportunities {
    const opportunities: PredictiveOpportunity[] =
      recommendations.opportunityRecommendations.recommendations.map((rec) => ({
        opportunityId: `pred-opp-${rec.recommendationId}`,
        sequence: rec.sequence,
        title: rec.title,
        detail: rec.detail,
      }));

    return {
      opportunitiesId: `pred-opportunities-${recommendations.outputId}`,
      opportunities,
      summary: `${opportunities.length} read-only predictive opportunities from opportunity recommendations.`,
    };
  }
}

export class PredictiveRisksBuilder {
  build(recommendations: AiRecommendationIntelligenceExperienceOutput): PredictiveRisks {
    const risks: PredictiveRisk[] = recommendations.riskMitigationRecommendations.recommendations.map(
      (rec, index) => ({
        riskId: `pred-risk-${rec.recommendationId}`,
        sequence: index + 1,
        title: rec.title,
        detail: rec.detail,
        level: index === 0 ? ("medium" as const) : index === 1 ? ("low" as const) : ("high" as const),
      })
    );

    return {
      risksId: `pred-risks-${recommendations.outputId}`,
      risks,
      summary: `${risks.length} read-only predictive risks from risk mitigation recommendations.`,
    };
  }
}

export class PredictionConfidenceBuilder {
  build(recommendations: AiRecommendationIntelligenceExperienceOutput): PredictionConfidence {
    let score = 36;
    score += Math.min(recommendations.recommendationConfidence.score * 0.36, 34);
    score += Math.min(recommendations.recommendationReadiness.readinessScore * 0.1, 10);
    score = Math.min(98, Math.max(40, Math.round(score)));

    const level: PredictiveIntelligenceConfidenceLevel =
      score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "AI Predictive Intelligence Experience meets high-confidence criteria from recommendation intelligence."
          : level === "medium"
            ? "Predictive intelligence viable with conditional recommendations requiring review."
            : "Limited predictive intelligence confidence — treat outputs as advisory only.",
      recommendationConfidenceScore: recommendations.recommendationConfidence.score,
    };
  }
}

export class PredictionReadinessBuilder {
  build(recommendations: AiRecommendationIntelligenceExperienceOutput): PredictionReadiness {
    const readiness = recommendations.recommendationReadiness;
    const level = mapRecommendationStatus(readiness.level);
    const predictionReady = readiness.recommendationReady && readiness.readinessScore >= 50;

    return {
      readinessId: "prediction.readiness",
      level,
      readinessScore: readiness.readinessScore,
      predictionReady,
      checks: readiness.checks.map((c) =>
        check(c.checkId, c.label, c.passed, c.score, c.detail)
      ),
      summary: `Prediction readiness — ${readiness.readinessScore}/100, prediction ${predictionReady ? "ready" : "pending"}.`,
    };
  }
}

export class DelegationPredictiveIntelligenceBuilder {
  build(recommendations: AiRecommendationIntelligenceExperienceOutput): DelegationPredictiveIntelligence {
    const checks: PredictiveCheck[] = [
      check(
        "del.upstream",
        "Sole upstream delegation",
        !!recommendations.outputId,
        recommendations.outputId ? 100 : 0,
        `Delegates exclusively to ${UPSTREAM_MODULE_ID} AI Recommendation Intelligence Experience.`
      ),
      check(
        "del.trace",
        "Recommendation intelligence traceability",
        !!recommendations.insightGenerationOutputId,
        recommendations.insightGenerationOutputId ? 95 : 0,
        `Recommendation intelligence ${recommendations.outputId} → insight generation ${recommendations.insightGenerationOutputId}.`
      ),
      check(
        "del.nodup",
        "No duplicated business logic",
        true,
        100,
        "Predictive intelligence builders format recommendation intelligence output only."
      ),
    ];

    return {
      delegationId: "prediction.delegation",
      soleUpstream: "CH5-X10 AI Recommendation Intelligence Experience",
      noDuplicatedLogic: true,
      recommendationIntelligenceOutputId: recommendations.outputId,
      checks,
      summary: "Delegation predictive intelligence — sole upstream X10, no duplicated logic.",
    };
  }
}

export class PredictionExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    outcomes: OutcomePredictions;
    probability: SuccessProbability;
    readiness: PredictionReadiness;
    predictionConfidenceScore: number;
  }): PredictionExplanation {
    return {
      explanationId: `prediction-explanation-${input.outputId}`,
      headline: `AI Predictive Intelligence for "${input.goal}"`,
      summary: `Read-only predictive intelligence (confidence ${input.predictionConfidenceScore}/100) — ${input.outcomes.predictions.length} outcome predictions, success probability ${input.probability.score}/100.`,
      outcomesSummary: input.outcomes.summary,
      probabilitySummary: input.probability.summary,
      readinessSummary: input.readiness.summary,
    };
  }
}

export function createPredictionContextBuilder(): PredictionContextBuilder {
  return new PredictionContextBuilder();
}
export function createOutcomePredictionsBuilder(): OutcomePredictionsBuilder {
  return new OutcomePredictionsBuilder();
}
export function createSuccessProbabilityBuilder(): SuccessProbabilityBuilder {
  return new SuccessProbabilityBuilder();
}
export function createFutureScenariosBuilder(): FutureScenariosBuilder {
  return new FutureScenariosBuilder();
}
export function createEarlyWarningSignalsBuilder(): EarlyWarningSignalsBuilder {
  return new EarlyWarningSignalsBuilder();
}
export function createPredictiveOpportunitiesBuilder(): PredictiveOpportunitiesBuilder {
  return new PredictiveOpportunitiesBuilder();
}
export function createPredictiveRisksBuilder(): PredictiveRisksBuilder {
  return new PredictiveRisksBuilder();
}
export function createPredictionConfidenceBuilder(): PredictionConfidenceBuilder {
  return new PredictionConfidenceBuilder();
}
export function createPredictionReadinessBuilder(): PredictionReadinessBuilder {
  return new PredictionReadinessBuilder();
}
export function createDelegationPredictiveIntelligenceBuilder(): DelegationPredictiveIntelligenceBuilder {
  return new DelegationPredictiveIntelligenceBuilder();
}
export function createPredictionExplanationBuilder(): PredictionExplanationBuilder {
  return new PredictionExplanationBuilder();
}
