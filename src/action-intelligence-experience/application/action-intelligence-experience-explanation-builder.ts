import type { ExperienceExplanation } from "../domain/action-intelligence-experience-context.js";
import type {
  ExperienceJourneyStep,
  ExperienceLayerPresentation,
} from "../domain/action-intelligence-experience-context.js";
import type { OrchestrationIntelligenceOutput } from "../../orchestration-intelligence/domain/orchestration-context.js";

export class ExperienceExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    journeySteps: ExperienceJourneyStep[];
    layers: ExperienceLayerPresentation[];
    orchestration: OrchestrationIntelligenceOutput;
    experienceConfidenceScore: number;
  }): ExperienceExplanation {
    return {
      explanationId: `explanation-${input.outputId}`,
      headline: `Unified action intelligence experience for "${input.goal}"`,
      summary: `${input.layers.length} experience screens across ${input.journeySteps.length} intelligence layers (confidence ${input.experienceConfidenceScore}/100) — read-only end-to-end journey from C1 through C17.`,
      journeySummary: `Journey: ${input.journeySteps.map((s) => s.layerKey).join(" → ")} → action_intelligence_experience.`,
      orchestrationSummary: input.orchestration.explanation.summary,
      readinessSummary: input.orchestration.orchestrationReadiness.summary,
    };
  }
}

export function createExperienceExplanationBuilder(): ExperienceExplanationBuilder {
  return new ExperienceExplanationBuilder();
}
