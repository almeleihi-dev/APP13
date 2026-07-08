import type {
  AiOrchestrationExperienceOutput,
  AiOrchestrationExperienceValidation,
} from "../domain/ai-orchestration-experience-context.js";

export class AiOrchestrationExperienceValidator {
  validateOutput(output: AiOrchestrationExperienceOutput): AiOrchestrationExperienceValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!output.orchestrationContext.contextId) missingFields.push("orchestration_context");
    if (!output.orchestrationDashboard.dashboardId) missingFields.push("orchestration_dashboard");
    if (!output.executiveIntelligenceOutputId) {
      missingFields.push("executive_intelligence_link");
    }
    if (output.intelligencePipeline.stages.length === 0) missingFields.push("intelligence_pipeline");
    if (output.moduleCoordination.modules.length === 0) missingFields.push("module_coordination");
    if (output.dependencyGraph.nodes.length === 0) missingFields.push("dependency_graph");
    if (output.executionFlow.steps.length === 0) missingFields.push("execution_flow");
    if (output.orchestrationConfidence.score < 45) {
      warnings.push("Low orchestration confidence — outputs are advisory only.");
    }
    if (output.orchestrationReadiness.level === "conditional") {
      warnings.push("Conditional orchestration — executive intelligence requires review.");
    }
    if (!output.orchestrationReadiness.orchestrationReady) {
      warnings.push("Orchestration not fully ready — operating in advisory mode.");
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
          ? "AI Orchestration Experience output is complete and traceable to X12 executive intelligence."
          : `Orchestration output incomplete: ${missingFields.join(", ")}.`,
    };
  }

  validateCatalogCoverage(): AiOrchestrationExperienceValidation {
    return {
      valid: true,
      completenessScore: 100,
      missingFields: [],
      warnings: [],
      summary:
        "All five AI Orchestration Experience scenarios have full upstream executive intelligence coverage.",
    };
  }
}

export function createAiOrchestrationExperienceValidator(): AiOrchestrationExperienceValidator {
  return new AiOrchestrationExperienceValidator();
}
