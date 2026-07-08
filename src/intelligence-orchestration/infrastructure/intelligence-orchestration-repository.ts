import type { UnifiedSummary } from "../domain/orchestration-pipeline.js";
import { buildUnifiedSummary } from "../domain/orchestration-pipeline.js";
import {
  buildRequestFingerprint,
  buildUnifiedContext,
} from "../domain/orchestration-context.js";
import type { AuthContext } from "../../shared/auth/index.js";
import {
  collectEngineContributions,
  type OrchestrationEngineDeps,
} from "../application/orchestration-collector.js";

export class IntelligenceOrchestrationRepository {
  private readonly summaries = new Map<string, UnifiedSummary>();
  private refreshCount = 0;

  getSummary(fingerprint: string): UnifiedSummary | undefined {
    return this.summaries.get(fingerprint);
  }

  saveSummary(fingerprint: string, summary: UnifiedSummary): void {
    this.summaries.set(fingerprint, summary);
  }

  listSummaries(): UnifiedSummary[] {
    return [...this.summaries.values()];
  }

  getRefreshCount(): number {
    return this.refreshCount;
  }

  orchestrate(input: {
    authContext: AuthContext;
    engines: OrchestrationEngineDeps;
    intent?: string;
    listingId?: string;
    generatedAt?: string;
    force?: boolean;
  }): UnifiedSummary {
    const context = buildUnifiedContext({
      authContext: input.authContext,
      intent: input.intent,
      listingId: input.listingId,
      generatedAt: input.generatedAt,
    });
    const fingerprint = buildRequestFingerprint(context);

    if (!input.force) {
      const existing = this.summaries.get(fingerprint);
      if (existing) return existing;
    }

    this.refreshCount += 1;
    const contributions = collectEngineContributions({
      authContext: input.authContext,
      context,
      engines: input.engines,
    });
    const summary = buildUnifiedSummary({ context, contributions });
    this.summaries.set(fingerprint, summary);
    return summary;
  }
}

export function createIntelligenceOrchestrationRepository(): IntelligenceOrchestrationRepository {
  return new IntelligenceOrchestrationRepository();
}

export const intelligenceOrchestrationRepository = createIntelligenceOrchestrationRepository();
