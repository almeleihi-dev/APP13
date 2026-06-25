import type { CONFIDENCE_LEVELS } from "./orchestration-schema.js";
import { INTELLIGENCE_ORCHESTRATION_SCHEMA_VERSION, PIPELINE_STAGES } from "./orchestration-schema.js";
import type { ConnectedEngine, UnifiedContext } from "./orchestration-context.js";
import type { PipelineStage } from "./orchestration-context.js";

export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

export interface EngineContribution {
  engineId: ConnectedEngine;
  engineLabel: string;
  contributed: boolean;
  confidenceScore: number;
  summary: string;
  payload: Record<string, unknown>;
  collectedAt: string;
}

export interface PipelineStageResult {
  stage: PipelineStage;
  label: string;
  status: "completed";
  summary: string;
  output: Record<string, unknown>;
}

export interface DecisionPipeline {
  requestId: string;
  stages: PipelineStageResult[];
  completedAt: string;
}

export interface DecisionConfidence {
  score: number;
  level: ConfidenceLevel;
  factors: Array<{ factorId: string; label: string; score: number; weight: number }>;
  summary: string;
}

export interface DecisionExplanation {
  enginesContributed: string[];
  confidence: DecisionConfidence;
  reasoning: string[];
  alternativeRecommendations: string[];
  missingInformation: string[];
  summary: string;
}

export interface UnifiedRecommendation {
  recommendationId: string;
  headline: string;
  message: string;
  nextStep: string;
  unifiedOpportunity: string | null;
  unifiedDevelopmentPlan: string | null;
  unifiedMarketplaceView: string | null;
  unifiedExpertRecommendation: string | null;
  unifiedTeamRecommendation: string | null;
  unifiedLearningRecommendation: string | null;
  unifiedKnowledgeSummary: string | null;
  readOnly: true;
}

export interface UnifiedSummary {
  schemaVersion: typeof INTELLIGENCE_ORCHESTRATION_SCHEMA_VERSION;
  userId: string;
  intent: string;
  intentCategory: string;
  headline: string;
  subheadline: string;
  recommendation: UnifiedRecommendation;
  confidence: DecisionConfidence;
  explanation: DecisionExplanation;
  pipeline: DecisionPipeline;
  contributions: EngineContribution[];
  readOnly: true;
  generatedAt: string;
}

export interface OrchestrationValidation {
  valid: boolean;
  orchestrationReady: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export interface OrchestrationStatistics {
  totalOrchestrations: number;
  averageConfidenceScore: number;
  engineParticipation: Record<string, number>;
  intentCategoryDistribution: Record<string, number>;
  generatedAt: string;
}

export interface OrchestrationHealth {
  status: "healthy";
  connectedEngines: number;
  enginesReporting: number;
  lastCompiledAt: string;
  summary: string;
}

const ENGINE_LABELS: Record<ConnectedEngine, string> = {
  action_blueprint: "Blueprint Intelligence",
  execution_blueprint: "Execution Blueprint",
  tekrr_intelligence: "TEKRR Intelligence",
  validation: "Validation",
  governance: "Governance",
  marketplace_compilation: "Marketplace Compilation",
  intelligent_pricing: "Intelligent Pricing",
  intelligent_commission: "Intelligent Commission",
  personal_assistant: "Personal Assistant",
  develop_me: "Develop Me",
  learn_by_action: "Learn by Action",
  expert_network: "Expert Network",
  team_builder: "Team Builder",
  knowledge_bank: "Knowledge Bank",
  community: "Community",
  analytics: "Analytics",
  ai: "AI",
  government_services: "Government Services",
};

function resolveConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 90) return "very_high";
  if (score >= 75) return "high";
  if (score >= 60) return "moderate";
  return "low";
}

function pickPrimaryContribution(contributions: EngineContribution[]): EngineContribution | undefined {
  return [...contributions]
    .filter((entry) => entry.contributed)
    .sort((left, right) => right.confidenceScore - left.confidenceScore)[0];
}

export function buildDecisionPipeline(context: UnifiedContext, contributions: EngineContribution[]): DecisionPipeline {
  const contributedEngines = contributions.filter((entry) => entry.contributed).map((entry) => entry.engineId);

  const stages: PipelineStageResult[] = PIPELINE_STAGES.map((stage) => {
    switch (stage) {
      case "intent":
        return {
          stage,
          label: "Intent",
          status: "completed",
          summary: `Intent classified as ${context.intentCategory}`,
          output: { intent: context.intent, category: context.intentCategory },
        };
      case "context":
        return {
          stage,
          label: "Context",
          status: "completed",
          summary: `User tier ${context.tier} with ${context.roles.length} role(s)`,
          output: { user_id: context.userId, tier: context.tier },
        };
      case "required_engines":
        return {
          stage,
          label: "Required Engines",
          status: "completed",
          summary: `${context.requiredEngines.length} engines selected`,
          output: { engines: context.requiredEngines },
        };
      case "knowledge_collection":
        return {
          stage,
          label: "Knowledge Collection",
          status: "completed",
          summary: `${contributions.filter((c) => c.contributed).length} contributions collected`,
          output: { engines: contributedEngines },
        };
      case "conflict_resolution":
        return {
          stage,
          label: "Conflict Resolution",
          status: "completed",
          summary: "Prioritized user-facing guidance over background intelligence",
          output: { strategy: "user_guidance_first" },
        };
      case "confidence_calculation":
        return {
          stage,
          label: "Confidence Calculation",
          status: "completed",
          summary: "Weighted confidence from contributing engines",
          output: { engine_count: contributedEngines.length },
        };
      case "unified_recommendation":
        return {
          stage,
          label: "Unified Recommendation",
          status: "completed",
          summary: "Single recommendation composed from expert answers",
          output: { read_only: true },
        };
      default:
        return {
          stage,
          label: "Explainable Output",
          status: "completed",
          summary: "Response includes reasoning and engine trace",
          output: { explainable: true },
        };
    }
  });

  return {
    requestId: `pipeline://${context.userId}/${context.generatedAt}`,
    stages,
    completedAt: context.generatedAt,
  };
}

export function buildDecisionConfidence(contributions: EngineContribution[]): DecisionConfidence {
  const active = contributions.filter((entry) => entry.contributed);
  if (active.length === 0) {
    return {
      score: 0,
      level: "low",
      factors: [],
      summary: "No engine contributions available.",
    };
  }

  const factors = active.map((entry, index) => ({
    factorId: `factor://${entry.engineId}`,
    label: entry.engineLabel,
    score: entry.confidenceScore,
    weight: Math.max(0.1, 1 / active.length + (index === 0 ? 0.1 : 0)),
  }));

  const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);
  const score = Math.round(
    factors.reduce((sum, factor) => sum + factor.score * (factor.weight / totalWeight), 0)
  );

  return {
    score,
    level: resolveConfidenceLevel(score),
    factors,
    summary: `Decision confidence ${score}% (${resolveConfidenceLevel(score)}).`,
  };
}

export function buildUnifiedRecommendation(input: {
  context: UnifiedContext;
  contributions: EngineContribution[];
}): UnifiedRecommendation {
  const assistant = input.contributions.find((c) => c.engineId === "personal_assistant");
  const developMe = input.contributions.find((c) => c.engineId === "develop_me");
  const learnByAction = input.contributions.find((c) => c.engineId === "learn_by_action");
  const expertNetwork = input.contributions.find((c) => c.engineId === "expert_network");
  const teamBuilder = input.contributions.find((c) => c.engineId === "team_builder");
  const marketplace = input.contributions.find((c) => c.engineId === "marketplace_compilation");
  const knowledgeBank = input.contributions.find((c) => c.engineId === "knowledge_bank");

  const primary = pickPrimaryContribution(input.contributions);
  const headline =
    input.context.intentCategory === "supervisor_growth"
      ? "Your path to becoming a project supervisor"
      : primary?.summary ?? "Your unified platform guidance";

  let nextStep = "Review your personalized next step below.";
  if (developMe?.contributed) {
    nextStep = String((developMe.payload as { headline?: string }).headline ?? developMe.summary);
  } else if (assistant?.contributed) {
    nextStep = String((assistant.payload as { headline?: string }).headline ?? assistant.summary);
  } else if (learnByAction?.contributed) {
    nextStep = String((learnByAction.payload as { headline?: string }).headline ?? learnByAction.summary);
  }

  if (input.context.intentCategory === "supervisor_growth") {
    nextStep =
      "Build supervisor skills through Learn by Action, connect with a trusted supervisor in Expert Network, and practice leading a recommended team.";
  }

  return {
    recommendationId: `unified://${input.context.userId}/${input.context.intentCategory}`,
    headline,
    message: "The platform combined guidance from your intelligence engines into one recommendation.",
    nextStep,
    unifiedOpportunity: assistant?.contributed ? assistant.summary : marketplace?.summary ?? null,
    unifiedDevelopmentPlan: developMe?.contributed ? developMe.summary : null,
    unifiedMarketplaceView: marketplace?.contributed ? marketplace.summary : null,
    unifiedExpertRecommendation: expertNetwork?.contributed ? expertNetwork.summary : null,
    unifiedTeamRecommendation: teamBuilder?.contributed ? teamBuilder.summary : null,
    unifiedLearningRecommendation: learnByAction?.contributed ? learnByAction.summary : null,
    unifiedKnowledgeSummary: knowledgeBank?.contributed ? knowledgeBank.summary : null,
    readOnly: true,
  };
}

export function buildDecisionExplanation(input: {
  context: UnifiedContext;
  contributions: EngineContribution[];
  confidence: DecisionConfidence;
  recommendation: UnifiedRecommendation;
}): DecisionExplanation {
  const contributed = input.contributions.filter((entry) => entry.contributed);
  const missingInformation: string[] = [];
  const alternatives: string[] = [];

  for (const engineId of input.context.requiredEngines) {
    const contribution = input.contributions.find((entry) => entry.engineId === engineId);
    if (!contribution?.contributed) {
      missingInformation.push(`No contribution from ${ENGINE_LABELS[engineId] ?? engineId}`);
    }
  }

  if (input.recommendation.unifiedTeamRecommendation) {
    alternatives.push(input.recommendation.unifiedTeamRecommendation);
  }
  if (input.recommendation.unifiedLearningRecommendation) {
    alternatives.push(input.recommendation.unifiedLearningRecommendation);
  }
  if (input.recommendation.unifiedExpertRecommendation) {
    alternatives.push(input.recommendation.unifiedExpertRecommendation);
  }

  const reasoning = [
    `Intent: ${input.context.intent}`,
    `Category: ${input.context.intentCategory}`,
    `${contributed.length} engines contributed to this decision`,
    input.recommendation.nextStep,
    input.confidence.summary,
  ];

  return {
    enginesContributed: contributed.map((entry) => entry.engineLabel),
    confidence: input.confidence,
    reasoning,
    alternativeRecommendations: alternatives.slice(0, 3),
    missingInformation,
    summary: "Unified decision composed from independent engine experts without replacing any engine.",
  };
}

export function buildUnifiedSummary(input: {
  context: UnifiedContext;
  contributions: EngineContribution[];
}): UnifiedSummary {
  const pipeline = buildDecisionPipeline(input.context, input.contributions);
  const confidence = buildDecisionConfidence(input.contributions);
  const recommendation = buildUnifiedRecommendation({
    context: input.context,
    contributions: input.contributions,
  });
  const explanation = buildDecisionExplanation({
    context: input.context,
    contributions: input.contributions,
    confidence,
    recommendation,
  });

  return {
    schemaVersion: INTELLIGENCE_ORCHESTRATION_SCHEMA_VERSION,
    userId: input.context.userId,
    intent: input.context.intent,
    intentCategory: input.context.intentCategory,
    headline: recommendation.headline,
    subheadline: recommendation.nextStep,
    recommendation,
    confidence,
    explanation,
    pipeline,
    contributions: input.contributions,
    readOnly: true,
    generatedAt: input.context.generatedAt,
  };
}

export function validateOrchestrationContext(context: UnifiedContext): OrchestrationValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!context.userId) errors.push("user_id is required");
  if (context.requiredEngines.length === 0) warnings.push("No engines selected for orchestration");
  return {
    valid: errors.length === 0,
    orchestrationReady: errors.length === 0,
    errors,
    warnings,
    summary:
      errors.length === 0
        ? "Orchestration context is valid and ready."
        : "Orchestration context failed validation.",
  };
}

export function buildOrchestrationStatistics(summaries: UnifiedSummary[]): OrchestrationStatistics {
  const engineParticipation: Record<string, number> = {};
  const intentCategoryDistribution: Record<string, number> = {};
  let confidenceSum = 0;

  for (const summary of summaries) {
    confidenceSum += summary.confidence.score;
    intentCategoryDistribution[summary.intentCategory] =
      (intentCategoryDistribution[summary.intentCategory] ?? 0) + 1;

    for (const contribution of summary.contributions) {
      if (contribution.contributed) {
        engineParticipation[contribution.engineId] = (engineParticipation[contribution.engineId] ?? 0) + 1;
      }
    }
  }

  return {
    totalOrchestrations: summaries.length,
    averageConfidenceScore:
      summaries.length === 0 ? 0 : Math.round(confidenceSum / summaries.length),
    engineParticipation,
    intentCategoryDistribution,
    generatedAt: new Date().toISOString(),
  };
}

export function buildOrchestrationHealth(contributions: EngineContribution[]): OrchestrationHealth {
  const reporting = contributions.filter((entry) => entry.contributed).length;
  return {
    status: "healthy",
    connectedEngines: Object.keys(ENGINE_LABELS).length,
    enginesReporting: reporting,
    lastCompiledAt: new Date().toISOString(),
    summary: `${reporting} engines reporting in latest orchestration.`,
  };
}

export function createEngineContribution(input: {
  engineId: ConnectedEngine;
  contributed: boolean;
  confidenceScore: number;
  summary: string;
  payload: Record<string, unknown>;
  collectedAt: string;
}): EngineContribution {
  return {
    engineId: input.engineId,
    engineLabel: ENGINE_LABELS[input.engineId],
    contributed: input.contributed,
    confidenceScore: input.confidenceScore,
    summary: input.summary,
    payload: input.payload,
    collectedAt: input.collectedAt,
  };
}

export function toUnifiedSummaryView(summary: UnifiedSummary) {
  return {
    schema_version: summary.schemaVersion,
    user_id: summary.userId,
    intent: summary.intent,
    intent_category: summary.intentCategory,
    headline: summary.headline,
    subheadline: summary.subheadline,
    recommendation: {
      recommendation_id: summary.recommendation.recommendationId,
      headline: summary.recommendation.headline,
      message: summary.recommendation.message,
      next_step: summary.recommendation.nextStep,
      unified_opportunity: summary.recommendation.unifiedOpportunity,
      unified_development_plan: summary.recommendation.unifiedDevelopmentPlan,
      unified_marketplace_view: summary.recommendation.unifiedMarketplaceView,
      unified_expert_recommendation: summary.recommendation.unifiedExpertRecommendation,
      unified_team_recommendation: summary.recommendation.unifiedTeamRecommendation,
      unified_learning_recommendation: summary.recommendation.unifiedLearningRecommendation,
      unified_knowledge_summary: summary.recommendation.unifiedKnowledgeSummary,
      read_only: summary.recommendation.readOnly,
    },
    confidence: {
      score: summary.confidence.score,
      level: summary.confidence.level,
      factors: summary.confidence.factors,
      summary: summary.confidence.summary,
    },
    explanation: {
      engines_contributed: summary.explanation.enginesContributed,
      confidence: {
        score: summary.explanation.confidence.score,
        level: summary.explanation.confidence.level,
        summary: summary.explanation.confidence.summary,
      },
      reasoning: summary.explanation.reasoning,
      alternative_recommendations: summary.explanation.alternativeRecommendations,
      missing_information: summary.explanation.missingInformation,
      summary: summary.explanation.summary,
    },
    contribution_count: summary.contributions.filter((c) => c.contributed).length,
    read_only: summary.readOnly,
    generated_at: summary.generatedAt,
  };
}

export function toEngineContributionView(contribution: EngineContribution) {
  return {
    engine_id: contribution.engineId,
    engine_label: contribution.engineLabel,
    contributed: contribution.contributed,
    confidence_score: contribution.confidenceScore,
    summary: contribution.summary,
    payload: contribution.payload,
    collected_at: contribution.collectedAt,
  };
}

export function toDecisionPipelineView(pipeline: DecisionPipeline) {
  return {
    request_id: pipeline.requestId,
    stages: pipeline.stages.map((stage) => ({
      stage: stage.stage,
      label: stage.label,
      status: stage.status,
      summary: stage.summary,
      output: stage.output,
    })),
    completed_at: pipeline.completedAt,
  };
}

export function toOrchestrationStatisticsView(stats: OrchestrationStatistics) {
  return {
    total_orchestrations: stats.totalOrchestrations,
    average_confidence_score: stats.averageConfidenceScore,
    engine_participation: stats.engineParticipation,
    intent_category_distribution: stats.intentCategoryDistribution,
    generated_at: stats.generatedAt,
  };
}

export function toOrchestrationHealthView(health: OrchestrationHealth) {
  return {
    status: health.status,
    connected_engines: health.connectedEngines,
    engines_reporting: health.enginesReporting,
    last_compiled_at: health.lastCompiledAt,
    summary: health.summary,
  };
}

export type { ConnectedEngine, UnifiedContext };
