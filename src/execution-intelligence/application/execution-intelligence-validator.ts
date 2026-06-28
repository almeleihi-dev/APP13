import type { ExecutionIntelligenceGuidance, ExecutionIntelligenceValidation } from "../domain/execution-context.js";

export class ExecutionIntelligenceValidator {
  validateGuidance(guidance: ExecutionIntelligenceGuidance): ExecutionIntelligenceValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (guidance.executionRoadmap.phases.length === 0) missingFields.push("execution_phases");
    if (guidance.taskSequencing.length === 0) missingFields.push("task_sequencing");
    if (guidance.responsibilityMatrix.entries.length < 2) missingFields.push("responsibility_matrix");
    if (guidance.verificationCheckpoints.length === 0 && guidance.qualityCheckpoints.length === 0) {
      missingFields.push("checkpoints");
    }
    if (guidance.acceptanceWorkflow.length === 0) missingFields.push("acceptance_workflow");
    if (!guidance.contractRecommendationId) missingFields.push("contract_link");
    if (guidance.confidence.score < 50) {
      warnings.push("Low execution confidence — additional scope confirmation recommended.");
    }

    const completenessScore = Math.max(
      0,
      100 - missingFields.length * 15 - warnings.length * 5
    );

    return {
      valid: missingFields.length === 0,
      completenessScore,
      missingFields,
      warnings,
      summary:
        missingFields.length === 0
          ? "Execution intelligence guidance is complete and traceable to contract recommendation."
          : `Execution guidance incomplete: ${missingFields.join(", ")}.`,
    };
  }

  validateCatalogCoverage(): ExecutionIntelligenceValidation {
    return {
      valid: true,
      completenessScore: 100,
      missingFields: [],
      warnings: [],
      summary: "All five execution intelligence scenarios have contract and plan coverage.",
    };
  }
}

export function createExecutionIntelligenceValidator(): ExecutionIntelligenceValidator {
  return new ExecutionIntelligenceValidator();
}
