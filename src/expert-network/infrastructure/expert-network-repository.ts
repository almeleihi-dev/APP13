import type { ExpertNetworkSummary } from "../domain/expert-network-profile.js";
import { buildExpertNetworkSummary } from "../domain/expert-network-profile.js";
import { buildExpertNetworkContext } from "../domain/expert-network-context.js";
import { SEED_NETWORK_EXPERTS } from "../domain/expert-network-seed.js";
import type { AuthContext } from "../../shared/auth/index.js";

export class ExpertNetworkRepository {
  private readonly summaries = new Map<string, ExpertNetworkSummary>();
  private refreshCount = 0;

  getSummary(userId: string): ExpertNetworkSummary | undefined {
    return this.summaries.get(userId);
  }

  saveSummary(summary: ExpertNetworkSummary): void {
    this.summaries.set(summary.userId, summary);
  }

  listSummaries(): ExpertNetworkSummary[] {
    return [...this.summaries.values()];
  }

  getRefreshCount(): number {
    return this.refreshCount;
  }

  refreshSummary(authContext: AuthContext, generatedAt?: string): ExpertNetworkSummary {
    this.refreshCount += 1;
    const context = buildExpertNetworkContext({
      authContext,
      generatedAt: generatedAt ?? new Date().toISOString(),
    });
    const summary = buildExpertNetworkSummary(context);
    this.summaries.set(summary.userId, summary);
    return summary;
  }

  getOrRefreshSummary(authContext: AuthContext): ExpertNetworkSummary {
    const existing = this.summaries.get(authContext.userId);
    if (existing) return existing;
    return this.refreshSummary(authContext);
  }

  getSeedExpertCount(): number {
    return SEED_NETWORK_EXPERTS.length;
  }
}

export function createExpertNetworkRepository(): ExpertNetworkRepository {
  return new ExpertNetworkRepository();
}

export const expertNetworkRepository = createExpertNetworkRepository();
