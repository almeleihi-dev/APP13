import type { DbPool } from "../../shared/db/index.js";
import { createActionIntelligenceService } from "../../action-intelligence/application/action-intelligence-service.js";
import type { ActionIntelligenceService } from "../../action-intelligence/application/action-intelligence-service.js";
import { getCatalogActionByCode } from "../../action-intelligence/domain/action-catalog.js";
import type { TrustScoreService } from "../../trust/application/trust-score-service.js";
import { createTrustModule } from "../../trust/module.js";
import { TrustEventTypes } from "../../trust/domain/trust-event.js";
import { toTrustProfileView } from "../../trust/domain/trust-profile-view.js";
import {
  buildProviderProfileMetricsFromHistory,
  buildProviderPublicProfile,
  countTrustEventsByType,
  mergeOfferedActions,
  toProviderPublicProfileView,
  type OfferedActionSummary,
  type ProviderIdentitySummary,
  type ProviderPublicProfileView,
} from "../domain/provider-profile.js";
import type { ProviderProfileContext } from "../infrastructure/provider-profile-repository.js";
import {
  ProviderProfileRepository,
  providerProfileRepository,
} from "../infrastructure/provider-profile-repository.js";

export interface ProviderProfileServiceDependencies {
  db: DbPool;
  trustScore: TrustScoreService;
  actionIntelligence: ActionIntelligenceService;
  repository?: ProviderProfileRepository;
}

export class ProviderProfileService {
  private readonly repository: ProviderProfileRepository;

  constructor(private readonly deps: ProviderProfileServiceDependencies) {
    this.repository = deps.repository ?? providerProfileRepository;
  }

  async getPublicProfileByUserId(userId: string): Promise<ProviderPublicProfileView | null> {
    const context = await this.repository.findProviderContextByUserId(this.deps.db.pool, userId);
    if (!context) return null;

    const trustProfile = await this.deps.trustScore.buildTrustProfile(
      context.providerId,
      context.userId
    );
    if (!trustProfile) return null;

    const [publishedActions, contractActivity] = await Promise.all([
      this.repository.listPublishedActions(this.deps.db.pool, context.providerId),
      this.repository.getContractActivity(this.deps.db.pool, context.providerId),
    ]);

    const historyEntries = trustProfile.history.entries;
    const cancelledContracts = countTrustEventsByType(
      historyEntries,
      TrustEventTypes.CONTRACT_CANCELLED
    );
    const completedContracts = trustProfile.completedContracts;
    const engagements = Math.max(1, completedContracts + cancelledContracts);

    const metrics = buildProviderProfileMetricsFromHistory({
      completedContracts,
      cancelledContracts,
      completionRate: completedContracts / engagements,
      averageRating: trustProfile.averageRating,
      issuesRaised: countTrustEventsByType(historyEntries, TrustEventTypes.ISSUE_RAISED),
      issuesResolved: countTrustEventsByType(historyEntries, TrustEventTypes.ISSUE_RESOLVED),
      activeIssues: Math.max(
        0,
        countTrustEventsByType(historyEntries, TrustEventTypes.ISSUE_RAISED) -
          countTrustEventsByType(historyEntries, TrustEventTypes.ISSUE_RESOLVED)
      ),
      historyEntries,
    });

    const profile = buildProviderPublicProfile({
      identity: toIdentitySummary(context),
      offeredActions: this.buildOfferedActions(context, publishedActions),
      trust: toTrustProfileView(trustProfile),
      metrics,
      availability: {
        activeContracts: contractActivity.activeContracts,
        providerStatus: context.status,
      },
      generatedAt: trustProfile.generatedAt,
    });

    return toProviderPublicProfileView(profile);
  }

  private buildOfferedActions(
    context: ProviderProfileContext,
    publishedActions: Array<{ actionCode: string; actionName: string }>
  ): OfferedActionSummary[] {
    const published: OfferedActionSummary[] = publishedActions.map((action) => ({
      actionCode: action.actionCode,
      actionName: action.actionName,
      confidence: 85,
    }));

    const extracted = this.deps.actionIntelligence
      .extractActionsFromProviderProfile({
        providerId: context.providerId,
        sourceReference: `provider-profile:${context.providerId}`,
        profession: context.primaryTrade ?? undefined,
        profileText: [context.bio, context.businessName].filter(Boolean).join(" "),
        previousActionCodes: published.map((action) => action.actionCode),
      })
      .map((action) => ({
        actionCode: action.actionCode,
        actionName: action.actionName,
        confidence: action.confidence,
      }));

    const merged = mergeOfferedActions([...published, ...extracted]);
    if (merged.length > 0) return merged;

    return published.map((action) => {
      const catalogAction = getCatalogActionByCode(action.actionCode);
      return {
        actionCode: action.actionCode,
        actionName: catalogAction?.actionName ?? action.actionName,
        confidence: action.confidence,
      };
    });
  }
}

function toIdentitySummary(context: ProviderProfileContext): ProviderIdentitySummary {
  return {
    providerId: context.providerId,
    userId: context.userId,
    displayName: context.displayName,
    businessName: context.businessName,
    bio: context.bio,
    primaryTrade: context.primaryTrade,
    slug: context.slug,
    status: context.status,
    verificationTier: context.verificationTier,
  };
}

export function createProviderProfileService(
  deps: ProviderProfileServiceDependencies
): ProviderProfileService {
  return new ProviderProfileService(deps);
}

export function createProviderExperienceModule(
  db: DbPool,
  deps?: { trustScore?: TrustScoreService }
) {
  const trustScore = deps?.trustScore ?? createTrustModule(db).trustScore;
  const actionIntelligence = createActionIntelligenceService();
  const providerProfile = createProviderProfileService({
    db,
    trustScore,
    actionIntelligence,
  });

  return {
    providerProfile,
  };
}

export type ProviderExperienceModule = ReturnType<typeof createProviderExperienceModule>;
