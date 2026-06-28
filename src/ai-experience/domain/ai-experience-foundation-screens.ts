import {
  AI_EXPERIENCE_FOUNDATION_FIXED_TIMESTAMP,
  AI_EXPERIENCE_FOUNDATION_SCHEMA_VERSION,
  AI_EXPERIENCE_FOUNDATION_CHAIN,
  CHAPTER_NUMBER,
  UPSTREAM_CHAPTER_NUMBER,
  UPSTREAM_MODULE_ID,
} from "./ai-experience-foundation-schema.js";
import type {
  AiExperienceFoundationOutput,
  AiExperienceFoundationSummary,
  AiExperienceFoundationValidation,
} from "./ai-experience-foundation-context.js";

export interface AiExperienceFoundationHome {
  schema_version: typeof AI_EXPERIENCE_FOUNDATION_SCHEMA_VERSION;
  headline: string;
  description: string;
  foundation_chain: readonly string[];
  chapter_number: number;
  upstream_chapter_number: number;
  upstream_module: typeof UPSTREAM_MODULE_ID;
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  foundation_views: readonly string[];
  ch5_foundation_note: string;
  read_only: true;
  generated_at: string;
}

export interface AiExperienceContextScreen {
  schema_version: typeof AI_EXPERIENCE_FOUNDATION_SCHEMA_VERSION;
  output_id: string;
  shared_context: AiExperienceFoundationOutput["sharedContext"];
  foundation_confidence: AiExperienceFoundationOutput["foundationConfidence"];
  read_only: true;
}

export interface AiExperienceFoundationDomainScreen {
  schema_version: typeof AI_EXPERIENCE_FOUNDATION_SCHEMA_VERSION;
  output_id: string;
  view: unknown;
  read_only: true;
}

export interface AiExperienceExplanationScreen {
  schema_version: typeof AI_EXPERIENCE_FOUNDATION_SCHEMA_VERSION;
  output_id: string;
  explanation: AiExperienceFoundationOutput["explanation"];
  foundation_confidence: AiExperienceFoundationOutput["foundationConfidence"];
  read_only: true;
}

export interface AiExperienceSummaryScreen {
  schema_version: typeof AI_EXPERIENCE_FOUNDATION_SCHEMA_VERSION;
  summary: AiExperienceFoundationSummary;
  read_only: true;
}

export interface AiExperienceValidationScreen {
  schema_version: typeof AI_EXPERIENCE_FOUNDATION_SCHEMA_VERSION;
  validation: AiExperienceFoundationValidation;
  read_only: true;
}

const FOUNDATION_VIEWS = [
  "Shared Context",
  "Foundation Status",
  "Chapter Handoff",
  "Intelligence Lineage",
  "Foundation Readiness",
  "Delegation Foundation",
] as const;

export function buildAiExperienceFoundationHome(input: {
  scenarios: AiExperienceFoundationHome["scenarios"];
}): AiExperienceFoundationHome {
  return {
    schema_version: AI_EXPERIENCE_FOUNDATION_SCHEMA_VERSION,
    headline: "AN ACT AI Experience Foundation",
    description:
      "Foundational read-only AI Experience layer for Chapter 5 — delegates-only via CH4-C22 Action Intelligence Final Closure.",
    foundation_chain: AI_EXPERIENCE_FOUNDATION_CHAIN,
    chapter_number: CHAPTER_NUMBER,
    upstream_chapter_number: UPSTREAM_CHAPTER_NUMBER,
    upstream_module: UPSTREAM_MODULE_ID,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    foundation_views: FOUNDATION_VIEWS,
    ch5_foundation_note:
      "Shared AI experience context for all future Chapter 5 modules — no new business logic.",
    read_only: true,
    generated_at: AI_EXPERIENCE_FOUNDATION_FIXED_TIMESTAMP,
  };
}

export function buildAiExperienceFoundationSummary(
  output: AiExperienceFoundationOutput
): AiExperienceFoundationSummary {
  return {
    schemaVersion: AI_EXPERIENCE_FOUNDATION_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    foundationConfidenceLevel: output.foundationConfidence.level,
    foundationConfidenceScore: output.foundationConfidence.score,
    foundationStatusLevel: output.foundationStatus.level,
    foundationStatusScore: output.foundationStatus.score,
    handoffReady: output.chapterHandoffIntegration.handoffReady,
    foundationChain: AI_EXPERIENCE_FOUNDATION_CHAIN,
    readOnly: true,
    generatedAt: AI_EXPERIENCE_FOUNDATION_FIXED_TIMESTAMP,
  };
}

export function toAiExperienceContextScreen(
  output: AiExperienceFoundationOutput
): AiExperienceContextScreen {
  return {
    schema_version: AI_EXPERIENCE_FOUNDATION_SCHEMA_VERSION,
    output_id: output.outputId,
    shared_context: output.sharedContext,
    foundation_confidence: output.foundationConfidence,
    read_only: true,
  };
}

export function toAiExperienceFoundationDomainScreen<T>(
  output: AiExperienceFoundationOutput,
  view: T
): AiExperienceFoundationDomainScreen {
  return {
    schema_version: AI_EXPERIENCE_FOUNDATION_SCHEMA_VERSION,
    output_id: output.outputId,
    view,
    read_only: true,
  };
}

export function toAiExperienceExplanationScreen(
  output: AiExperienceFoundationOutput
): AiExperienceExplanationScreen {
  return {
    schema_version: AI_EXPERIENCE_FOUNDATION_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.explanation,
    foundation_confidence: output.foundationConfidence,
    read_only: true,
  };
}

export function toAiExperienceSummaryScreen(
  summary: AiExperienceFoundationSummary
): AiExperienceSummaryScreen {
  return {
    schema_version: AI_EXPERIENCE_FOUNDATION_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toAiExperienceValidationScreen(
  validation: AiExperienceFoundationValidation
): AiExperienceValidationScreen {
  return {
    schema_version: AI_EXPERIENCE_FOUNDATION_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}
