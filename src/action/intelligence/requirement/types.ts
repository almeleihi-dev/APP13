import type { DetectedLanguage } from "../types.js";

export type ContractReadiness = "ready" | "needs_clarification" | "unknown";

export interface LocalizedText {
  en: string;
  ar: string;
}

export interface RequirementMissingQuestion {
  text: LocalizedText;
  /** Question is included when none of these signals appear in the corpus. */
  absentSignals: { en: string[]; ar: string[] };
}

export interface RequirementDeliverableTemplate {
  title: LocalizedText;
  description: LocalizedText;
}

export interface RequirementMilestoneTemplate {
  title: LocalizedText;
  acceptanceCriteria: LocalizedText[];
}

export interface RequirementActionTemplate {
  actionCode: string;
  reason: LocalizedText;
}

export interface RequirementProfile {
  id: string;
  professionHintAliases: string[];
  keywords: { en: string[]; ar: string[] };
  suggestedActions: RequirementActionTemplate[];
  deliverables: RequirementDeliverableTemplate[];
  milestones: RequirementMilestoneTemplate[];
  missingQuestions: RequirementMissingQuestion[];
}

export interface RequirementExtractInput {
  requirement_text: string;
  profession_hint?: string;
  language?: "en" | "ar" | "auto";
}

export interface SuggestedAction {
  action_code: string;
  label: string;
  reason: string;
}

export interface RequirementDeliverable {
  title: string;
  description: string;
}

export interface RequirementMilestone {
  title: string;
  acceptance_criteria: string[];
}

export interface RequirementExtractResult {
  language_detected: DetectedLanguage;
  confidence: number;
  suggested_actions: SuggestedAction[];
  deliverables: RequirementDeliverable[];
  milestones: RequirementMilestone[];
  missing_questions: string[];
  contract_readiness: ContractReadiness;
}

export interface RequirementMatch {
  profile: RequirementProfile;
  score: number;
  maxScore: number;
}
