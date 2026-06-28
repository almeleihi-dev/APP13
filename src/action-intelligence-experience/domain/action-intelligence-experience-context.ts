import type {
  ExperienceConfidenceLevel,
  ActionIntelligenceExperienceScenarioId,
} from "./action-intelligence-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface ActionIntelligenceExperienceContext {
  scenarioId?: ActionIntelligenceExperienceScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface ExperienceJourneyStep {
  step: number;
  layerKey: string;
  title: string;
  headline: string;
  summary: string;
  outputRef: string;
  confidenceScore: number;
  status: string;
}

export interface ExperienceLayerPresentation {
  layerKey: string;
  screenTitle: string;
  headline: string;
  summary: string;
  detail: string;
  outputRef: string;
  confidenceScore: number;
  status: string;
  journeyStep: number;
}

export interface ExperienceConfidence {
  level: ExperienceConfidenceLevel;
  score: number;
  rationale: string;
  orchestrationConfidenceScore: number;
  journeyCompletenessScore: number;
}

export interface ExperienceExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  journeySummary: string;
  orchestrationSummary: string;
  readinessSummary: string;
}

export interface ActionIntelligenceExperienceOutput {
  outputId: string;
  orchestrationOutputId: string;
  evolutionOutputId: string;
  optimizationOutputId: string;
  learningOutputId: string;
  strategyOutputId: string;
  predictionOutputId: string;
  canonicalActionId: string;
  scenarioId: ActionIntelligenceExperienceScenarioId | null;
  goal: string;
  journeySteps: ExperienceJourneyStep[];
  layerPresentations: ExperienceLayerPresentation[];
  experienceConfidence: ExperienceConfidence;
  explanation: ExperienceExplanation;
  readOnly: true;
}

export interface ActionIntelligenceExperienceSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: ActionIntelligenceExperienceScenarioId | null;
  experienceConfidenceLevel: ExperienceConfidenceLevel;
  experienceConfidenceScore: number;
  journeyStepCount: number;
  layerCount: number;
  orchestrationReadinessScore: number;
  experienceChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface ActionIntelligenceExperienceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}
