import type { OrchestrationIntelligenceOutput } from "../../orchestration-intelligence/domain/orchestration-context.js";
import {
  EXPERIENCE_LAYER_KEYS,
  type ExperienceLayerRouteKey,
} from "../domain/action-intelligence-experience-schema.js";
import { EXPERIENCE_SCREEN_TITLES } from "../domain/action-intelligence-experience-screens.js";
import type {
  ExperienceJourneyStep,
  ExperienceLayerPresentation,
  ExperienceConfidence,
} from "../domain/action-intelligence-experience-context.js";
import type { ExperienceConfidenceLevel } from "../domain/action-intelligence-experience-schema.js";

const LAYER_DETAILS: Record<string, string> = {
  intent: "Your intent has been classified and mapped to a canonical action.",
  canonical_action: "The action ontology resolves your request to a structured canonical action.",
  action_plan: "An action plan defines milestones, phases, and execution guidance.",
  dynamic_pricing: "Dynamic pricing intelligence estimates cost and urgency adjustments.",
  contract_intelligence: "Contract intelligence prepares terms aligned with the action plan.",
  execution_intelligence: "Execution intelligence guides milestone completion and verification.",
  outcome_intelligence: "Outcome intelligence evaluates goal achievement and quality.",
  trust_intelligence: "Trust intelligence assesses reputation and reliability signals.",
  decision_intelligence: "Decision intelligence synthesizes options into clear recommendations.",
  recommendation_intelligence: "Recommendation intelligence ranks optimal action paths.",
  insight_intelligence: "Insight intelligence surfaces patterns, root causes, and observations.",
  prediction_intelligence: "Prediction intelligence forecasts success, risk, and timeline.",
  strategy_intelligence: "Strategy intelligence defines objectives, roadmaps, and contingencies.",
  learning_intelligence: "Learning intelligence captures insights, gaps, and adaptations.",
  optimization_intelligence: "Optimization intelligence identifies efficiency and bottleneck improvements.",
  evolution_intelligence: "Evolution intelligence plans long-term capability and resilience growth.",
};

function snapshotForLayer(
  orchestration: OrchestrationIntelligenceOutput,
  engineKey: string
): string | null {
  const snapshot = orchestration.unifiedIntelligenceSnapshots.find(
    (s) => s.engineKey === engineKey
  );
  return snapshot?.summary ?? null;
}

export class ExperienceJourneyStepsBuilder {
  build(orchestration: OrchestrationIntelligenceOutput, goal: string): ExperienceJourneyStep[] {
    return orchestration.chainTrace.map((entry) => ({
      step: entry.step,
      layerKey: entry.engineKey,
      title: entry.layerLabel,
      headline: `${entry.layerLabel} for "${goal}"`,
      summary:
        snapshotForLayer(orchestration, entry.engineKey) ??
        LAYER_DETAILS[entry.engineKey] ??
        entry.layerLabel,
      outputRef: entry.outputRef,
      confidenceScore: entry.confidenceScore,
      status: entry.status,
    }));
  }
}

export class ExperienceLayerPresentationsBuilder {
  build(
    orchestration: OrchestrationIntelligenceOutput,
    goal: string
  ): ExperienceLayerPresentation[] {
    const presentations: ExperienceLayerPresentation[] = [];

    for (const [routeKey, engineKey] of Object.entries(EXPERIENCE_LAYER_KEYS) as Array<
      [ExperienceLayerRouteKey, string]
    >) {
      const trace = orchestration.chainTrace.find((e) => e.engineKey === engineKey);
      if (!trace) continue;

      const snapshotSummary = snapshotForLayer(orchestration, engineKey);
      const screenTitle = EXPERIENCE_SCREEN_TITLES[routeKey];

      presentations.push({
        layerKey: engineKey,
        screenTitle,
        headline: `${screenTitle}: ${goal}`,
        summary: snapshotSummary ?? LAYER_DETAILS[engineKey] ?? trace.layerLabel,
        detail: `Traceable via ${trace.outputRef} with ${trace.confidenceScore}/100 confidence.`,
        outputRef: trace.outputRef,
        confidenceScore: trace.confidenceScore,
        status: trace.status,
        journeyStep: trace.step,
      });
    }

    const canonicalTrace = orchestration.chainTrace.find((e) => e.engineKey === "canonical_action");
    if (canonicalTrace) {
      presentations.splice(1, 0, {
        layerKey: "canonical_action",
        screenTitle: "Canonical Action",
        headline: `Canonical Action: ${goal}`,
        summary: LAYER_DETAILS.canonical_action ?? canonicalTrace.layerLabel,
        detail: `Resolved to ${canonicalTrace.outputRef}.`,
        outputRef: canonicalTrace.outputRef,
        confidenceScore: canonicalTrace.confidenceScore,
        status: canonicalTrace.status,
        journeyStep: canonicalTrace.step,
      });
    }

    return presentations;
  }
}

export class ExperienceConfidenceBuilder {
  build(orchestration: OrchestrationIntelligenceOutput, journeyStepCount: number): ExperienceConfidence {
    let score = 48;
    score += Math.min(orchestration.orchestrationConfidence.score * 0.25, 22);
    score += Math.min(orchestration.orchestrationReadiness.overallScore * 0.2, 18);
    score += Math.min(journeyStepCount * 0.5, 8);
    score = Math.min(95, Math.max(35, Math.round(score)));

    const level: ExperienceConfidenceLevel = score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "Complete C1–C17 journey presented with high confidence and full traceability."
          : level === "medium"
            ? "Unified experience viable; some layers may show linked rather than active status."
            : "Limited experience confidence — treat journey presentation as advisory only.",
      orchestrationConfidenceScore: orchestration.orchestrationConfidence.score,
      journeyCompletenessScore: orchestration.orchestrationReadiness.layerCoverage,
    };
  }
}

export function createExperienceJourneyStepsBuilder(): ExperienceJourneyStepsBuilder {
  return new ExperienceJourneyStepsBuilder();
}
export function createExperienceLayerPresentationsBuilder(): ExperienceLayerPresentationsBuilder {
  return new ExperienceLayerPresentationsBuilder();
}
export function createExperienceConfidenceBuilder(): ExperienceConfidenceBuilder {
  return new ExperienceConfidenceBuilder();
}
