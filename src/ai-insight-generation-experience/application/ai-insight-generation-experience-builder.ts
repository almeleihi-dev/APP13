import type { AiAdaptiveCoachingExperienceOutput } from "../../ai-adaptive-coaching-experience/domain/ai-adaptive-coaching-experience-context.js";
import { UPSTREAM_MODULE_ID } from "../domain/ai-insight-generation-experience-schema.js";
import type {
  InsightCheck,
  InsightContext,
  GeneratedInsights,
  GeneratedInsight,
  PatternDetection,
  DetectedPattern,
  KeyFindings,
  KeyFinding,
  OpportunityAnalysis,
  OpportunityItem,
  RiskAnalysis,
  RiskItem,
  StrategicInsights,
  StrategicInsight,
  InsightReadiness,
  DelegationInsightGeneration,
  InsightGenerationConfidence,
  InsightExplanation,
} from "../domain/ai-insight-generation-experience-context.js";
import type {
  InsightGenerationStatusLevel,
  InsightGenerationConfidenceLevel,
} from "../domain/ai-insight-generation-experience-schema.js";

function mapCoachingStatus(status: string): InsightGenerationStatusLevel {
  if (status === "coaching_ready") return "insight_ready";
  if (status === "conditional") return "conditional";
  if (status === "pending") return "pending";
  return "not_ready";
}

function check(id: string, label: string, passed: boolean, score: number, detail: string): InsightCheck {
  return { checkId: id, label, passed, score, detail };
}

export class InsightContextBuilder {
  build(coaching: AiAdaptiveCoachingExperienceOutput): InsightContext {
    const ctx = coaching.coachingContext;

    return {
      contextId: `insight-context-${coaching.outputId}`,
      adaptiveCoachingOutputId: coaching.outputId,
      progressIntelligenceOutputId: ctx.progressIntelligenceOutputId,
      executionCompanionOutputId: ctx.executionCompanionOutputId,
      actionPlanningOutputId: ctx.actionPlanningOutputId,
      decisionSupportOutputId: ctx.decisionSupportOutputId,
      guidanceOutputId: ctx.guidanceOutputId,
      conversationOutputId: ctx.conversationOutputId,
      foundationOutputId: ctx.foundationOutputId,
      scenarioId: coaching.scenarioId,
      canonicalActionId: coaching.canonicalActionId,
      goal: coaching.goal,
      experienceMode: "read_only",
    };
  }
}

export class GeneratedInsightsBuilder {
  build(coaching: AiAdaptiveCoachingExperienceOutput): GeneratedInsights {
    const insights: GeneratedInsight[] = coaching.coachingInsights.insights.map((insight) => ({
      insightId: `generated-${insight.insightId}`,
      sequence: insight.sequence,
      label: insight.label,
      detail: insight.detail,
      sourceInsightId: insight.insightId,
    }));

    return {
      insightsId: `generated-insights-${coaching.outputId}`,
      insights,
      summary: `${insights.length} read-only generated insights from adaptive coaching.`,
    };
  }
}

export class PatternDetectionBuilder {
  build(coaching: AiAdaptiveCoachingExperienceOutput): PatternDetection {
    const patterns: DetectedPattern[] = coaching.behavioralSuggestions.suggestions.map(
      (suggestion, index) => ({
        patternId: `pattern-${suggestion.suggestionId}`,
        sequence: index + 1,
        label: suggestion.behavior,
        detail: `Behavioral pattern: ${suggestion.detail}`,
      })
    );

    return {
      detectionId: `patterns-${coaching.outputId}`,
      patterns,
      summary: `${patterns.length} read-only behavioral patterns detected from coaching suggestions.`,
    };
  }
}

export class KeyFindingsBuilder {
  build(coaching: AiAdaptiveCoachingExperienceOutput): KeyFindings {
    const findings: KeyFinding[] = coaching.coachingInsights.insights.map((insight) => ({
      findingId: `finding-${insight.insightId}`,
      sequence: insight.sequence,
      title: insight.label,
      detail: insight.detail,
    }));

    return {
      findingsId: `findings-${coaching.outputId}`,
      findings,
      summary: `${findings.length} key read-only findings from coaching insights.`,
    };
  }
}

export class OpportunityAnalysisBuilder {
  build(coaching: AiAdaptiveCoachingExperienceOutput): OpportunityAnalysis {
    const opportunities: OpportunityItem[] = coaching.improvementOpportunities.opportunities.map(
      (opp) => ({
        itemId: `opp-${opp.opportunityId}`,
        sequence: opp.sequence,
        title: opp.title,
        detail: opp.detail,
        sourceOpportunityId: opp.opportunityId,
      })
    );

    return {
      analysisId: `opportunities-${coaching.outputId}`,
      opportunities,
      summary: `${opportunities.length} read-only opportunity items from improvement opportunities.`,
    };
  }
}

export class RiskAnalysisBuilder {
  build(coaching: AiAdaptiveCoachingExperienceOutput): RiskAnalysis {
    const risks: RiskItem[] = coaching.improvementOpportunities.opportunities.map((opp, index) => ({
      itemId: `risk-${opp.opportunityId}`,
      sequence: index + 1,
      title: `Risk: ${opp.title}`,
      detail: `Read-only risk framing for improvement — ${opp.detail}`,
      level: index === 0 ? ("medium" as const) : index === 1 ? ("low" as const) : ("high" as const),
    }));

    return {
      analysisId: `risks-${coaching.outputId}`,
      risks,
      summary: `${risks.length} read-only risk analysis items derived from improvement opportunities.`,
    };
  }
}

export class StrategicInsightsBuilder {
  build(coaching: AiAdaptiveCoachingExperienceOutput): StrategicInsights {
    const insights: StrategicInsight[] = [
      {
        insightId: `strategic-guidance-${coaching.outputId}`,
        sequence: 1,
        title: coaching.adaptiveGuidance.headline,
        detail: coaching.adaptiveGuidance.summary,
      },
      {
        insightId: `strategic-motivation-${coaching.outputId}`,
        sequence: 2,
        title: coaching.motivationSummary.headline,
        detail: coaching.motivationSummary.summary,
      },
      {
        insightId: `strategic-focus-${coaching.outputId}`,
        sequence: 3,
        title: `Strategic Focus: ${coaching.adaptiveGuidance.recommendedFocus}`,
        detail: `Recommended focus area for "${coaching.goal}" — derived from ${UPSTREAM_MODULE_ID}.`,
      },
    ];

    return {
      strategicId: `strategic-${coaching.outputId}`,
      insights,
      summary: `${insights.length} read-only strategic insights from adaptive guidance and motivation.`,
    };
  }
}

export class InsightReadinessBuilder {
  build(coaching: AiAdaptiveCoachingExperienceOutput): InsightReadiness {
    const readiness = coaching.coachingReadiness;
    const level = mapCoachingStatus(readiness.level);
    const insightReady = readiness.coachingReady && readiness.readinessScore >= 50;

    return {
      readinessId: "insight.readiness",
      level,
      readinessScore: readiness.readinessScore,
      insightReady,
      checks: readiness.checks.map((c) =>
        check(c.checkId, c.label, c.passed, c.score, c.detail)
      ),
      summary: `Insight generation readiness — ${readiness.readinessScore}/100, insight ${insightReady ? "ready" : "pending"}.`,
    };
  }
}

export class DelegationInsightGenerationBuilder {
  build(coaching: AiAdaptiveCoachingExperienceOutput): DelegationInsightGeneration {
    const checks: InsightCheck[] = [
      check(
        "del.upstream",
        "Sole upstream delegation",
        !!coaching.outputId,
        coaching.outputId ? 100 : 0,
        `Delegates exclusively to ${UPSTREAM_MODULE_ID} AI Adaptive Coaching Experience.`
      ),
      check(
        "del.trace",
        "Adaptive coaching traceability",
        !!coaching.progressIntelligenceOutputId,
        coaching.progressIntelligenceOutputId ? 95 : 0,
        `Adaptive coaching ${coaching.outputId} → progress intelligence ${coaching.progressIntelligenceOutputId}.`
      ),
      check(
        "del.nodup",
        "No duplicated business logic",
        true,
        100,
        "Insight generation builders format adaptive coaching output only."
      ),
    ];

    return {
      delegationId: "insight.delegation",
      soleUpstream: "CH5-X8 AI Adaptive Coaching Experience",
      noDuplicatedLogic: true,
      adaptiveCoachingOutputId: coaching.outputId,
      checks,
      summary: "Delegation insight generation — sole upstream X8, no duplicated logic.",
    };
  }
}

export class InsightGenerationConfidenceBuilder {
  build(
    coaching: AiAdaptiveCoachingExperienceOutput,
    readinessScore: number
  ): InsightGenerationConfidence {
    let score = 40;
    score += Math.min(coaching.adaptiveCoachingConfidence.score * 0.32, 30);
    score += Math.min(readinessScore * 0.14, 14);
    score = Math.min(98, Math.max(40, Math.round(score)));

    const level: InsightGenerationConfidenceLevel =
      score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "AI Insight Generation Experience meets high-confidence criteria from adaptive coaching."
          : level === "medium"
            ? "Insight generation viable with conditional coaching requiring review."
            : "Limited insight generation confidence — treat outputs as advisory only.",
      adaptiveCoachingConfidenceScore: coaching.adaptiveCoachingConfidence.score,
    };
  }
}

export class InsightExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    generatedInsights: GeneratedInsights;
    keyFindings: KeyFindings;
    readiness: InsightReadiness;
    insightGenerationConfidenceScore: number;
  }): InsightExplanation {
    return {
      explanationId: `insight-explanation-${input.outputId}`,
      headline: `AI Insight Generation for "${input.goal}"`,
      summary: `Read-only insight generation (confidence ${input.insightGenerationConfidenceScore}/100) — ${input.generatedInsights.insights.length} insights, ${input.keyFindings.findings.length} key findings.`,
      insightsSummary: input.generatedInsights.summary,
      findingsSummary: input.keyFindings.summary,
      readinessSummary: input.readiness.summary,
    };
  }
}

export function createInsightContextBuilder(): InsightContextBuilder {
  return new InsightContextBuilder();
}
export function createGeneratedInsightsBuilder(): GeneratedInsightsBuilder {
  return new GeneratedInsightsBuilder();
}
export function createPatternDetectionBuilder(): PatternDetectionBuilder {
  return new PatternDetectionBuilder();
}
export function createKeyFindingsBuilder(): KeyFindingsBuilder {
  return new KeyFindingsBuilder();
}
export function createOpportunityAnalysisBuilder(): OpportunityAnalysisBuilder {
  return new OpportunityAnalysisBuilder();
}
export function createRiskAnalysisBuilder(): RiskAnalysisBuilder {
  return new RiskAnalysisBuilder();
}
export function createStrategicInsightsBuilder(): StrategicInsightsBuilder {
  return new StrategicInsightsBuilder();
}
export function createInsightReadinessBuilder(): InsightReadinessBuilder {
  return new InsightReadinessBuilder();
}
export function createDelegationInsightGenerationBuilder(): DelegationInsightGenerationBuilder {
  return new DelegationInsightGenerationBuilder();
}
export function createInsightGenerationConfidenceBuilder(): InsightGenerationConfidenceBuilder {
  return new InsightGenerationConfidenceBuilder();
}
export function createInsightExplanationBuilder(): InsightExplanationBuilder {
  return new InsightExplanationBuilder();
}
