import type { OrchestrationExplanation } from "../domain/orchestration-context.js";
import type {
  ChainTraceEntry,
  CrossEngineCoordination,
  UnifiedIntelligenceSnapshot,
  OrchestrationReadiness,
  OrchestrationRecommendation,
} from "../domain/orchestration-context.js";

export class OrchestrationExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    chainTrace: ChainTraceEntry[];
    coordinations: CrossEngineCoordination[];
    snapshots: UnifiedIntelligenceSnapshot[];
    readiness: OrchestrationReadiness;
    recommendations: OrchestrationRecommendation[];
    orchestrationConfidenceScore: number;
  }): OrchestrationExplanation {
    return {
      explanationId: `explanation-${input.outputId}`,
      headline: `Orchestration intelligence for "${input.goal}"`,
      summary: `${input.chainTrace.length} intelligence layers orchestrated across C1–C16 (confidence ${input.orchestrationConfidenceScore}/100) — read-only unified orchestration with full chain traceability.`,
      chainSummary: `Chain trace: ${input.chainTrace.map((e) => e.engineKey).join(" → ")} → orchestration_intelligence.`,
      coordinationSummary: `${input.coordinations.length} cross-engine coordination links maintaining chain synchronization.`,
      readinessSummary: input.readiness.summary,
      unifiedSummary: `${input.snapshots.length} unified intelligence snapshots; ${input.recommendations.length} orchestration recommendations.`,
    };
  }
}

export function createOrchestrationExplanationBuilder(): OrchestrationExplanationBuilder {
  return new OrchestrationExplanationBuilder();
}
