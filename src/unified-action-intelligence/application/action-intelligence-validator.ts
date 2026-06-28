import {
  INTELLIGENCE_CHAIN,
  UNIFIED_ACTION_INTELLIGENCE_FIXED_TIMESTAMP,
  UNIFIED_ACTION_INTELLIGENCE_SCHEMA_VERSION,
} from "../domain/action-intelligence-schema.js";
import type {
  ActionDecomposition,
  ActionIntelligenceSummary,
  ActionIntelligenceValidationReport,
} from "../domain/action-intent.js";

export class ActionIntelligenceValidator {
  validateDecomposition(decomposition: ActionDecomposition): ActionIntelligenceValidationReport {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!decomposition.goal.label) missingFields.push("goal.label");
    if (decomposition.steps.length === 0) missingFields.push("steps");
    if (decomposition.resources.length === 0) missingFields.push("resources");
    if (decomposition.skills.length === 0) missingFields.push("skills");
    if (decomposition.riskSignals.length === 0) warnings.push("No risk signals identified");
    if (decomposition.timeBand.minHours > decomposition.timeBand.maxHours) {
      missingFields.push("timeBand");
    }
    if (!decomposition.executionPath.pathId) missingFields.push("executionPath.pathId");

    const requiredCount = 6;
    const presentCount = requiredCount - missingFields.length;
    const completenessScore = Math.round((presentCount / requiredCount) * 100);

    const valid = missingFields.length === 0 && completenessScore >= 80;

    return {
      valid,
      completenessScore,
      missingFields,
      warnings,
      summary: valid
        ? "Action intelligence decomposition is complete and read-only."
        : `Action intelligence decomposition incomplete: ${missingFields.join(", ") || "unknown"}`,
    };
  }

  buildSummary(decomposition: ActionDecomposition): ActionIntelligenceSummary {
    const report = this.validateDecomposition(decomposition);

    return {
      schemaVersion: UNIFIED_ACTION_INTELLIGENCE_SCHEMA_VERSION,
      scenarioId: decomposition.goal.scenarioId,
      detectedGoal: decomposition.goal.label,
      actionCategory: decomposition.category,
      stepCount: decomposition.steps.length,
      skillCount: decomposition.skills.length,
      resourceCount: decomposition.resources.length,
      riskCount: decomposition.riskSignals.length,
      timeBandSummary: decomposition.timeBand.summary,
      executionReadiness: report.valid ? "ready" : "needs_clarification",
      readOnly: true,
      intelligenceChain: INTELLIGENCE_CHAIN,
      generatedAt: UNIFIED_ACTION_INTELLIGENCE_FIXED_TIMESTAMP,
    };
  }
}

export function createActionIntelligenceValidator(): ActionIntelligenceValidator {
  return new ActionIntelligenceValidator();
}
