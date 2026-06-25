import type { TeamSummary } from "../domain/team-builder-profile.js";
import { buildTeamSummary } from "../domain/team-builder-profile.js";
import { buildTeamBuilderContext } from "../domain/team-builder-context.js";
import type { AuthContext } from "../../shared/auth/index.js";

function summaryKey(userId: string, listingId: string): string {
  return `${userId}:${listingId}`;
}

export class TeamBuilderRepository {
  private readonly summaries = new Map<string, TeamSummary>();
  private refreshCount = 0;

  getSummary(userId: string, listingId: string): TeamSummary | undefined {
    return this.summaries.get(summaryKey(userId, listingId));
  }

  saveSummary(summary: TeamSummary): void {
    this.summaries.set(summaryKey(summary.userId, summary.listingId), summary);
  }

  listSummaries(): TeamSummary[] {
    return [...this.summaries.values()];
  }

  getRefreshCount(): number {
    return this.refreshCount;
  }

  refreshSummary(
    authContext: AuthContext,
    input?: { listingId?: string; generatedAt?: string }
  ): TeamSummary {
    this.refreshCount += 1;
    const context = buildTeamBuilderContext({
      authContext,
      listingId: input?.listingId,
      generatedAt: input?.generatedAt,
    });
    const summary = buildTeamSummary(context);
    this.saveSummary(summary);
    return summary;
  }

  getOrRefreshSummary(
    authContext: AuthContext,
    listingId?: string
  ): TeamSummary {
    const context = buildTeamBuilderContext({ authContext, listingId });
    const existing = this.summaries.get(summaryKey(authContext.userId, context.listing.id));
    if (existing) return existing;
    return this.refreshSummary(authContext, { listingId: context.listing.id });
  }
}

export function createTeamBuilderRepository(): TeamBuilderRepository {
  return new TeamBuilderRepository();
}

export const teamBuilderRepository = createTeamBuilderRepository();
