import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { notFound } from "../../../shared/errors/index.js";
import type { LiveTrustFrameService } from "../../live-trust-frame/application/live-trust-frame-service.js";
import {
  buildCustomerCommandCenter,
  buildCustomerCommandCenterSnapshot,
  collectProviderUserIdsForTrustFrames,
  toContractsSummaryView,
  toCustomerCommandCenterView,
  toEscrowSummaryView,
  toProviderRecommendationsIntegrationView,
  toProviderRelationshipsSummaryView,
  toRequestsSummaryView,
  type ContractsSummaryView,
  type CustomerCommandCenterView,
  type EscrowSummaryView,
  type ProviderRecommendationsIntegrationView,
  type ProviderRelationshipsSummaryView,
  type RequestsSummaryView,
} from "../domain/customer-command-center.js";
import { rankProvidersForRequirement } from "../../discovery-matching/domain/discovery-matching.js";
import {
  CustomerCommandCenterRepository,
  customerCommandCenterRepository,
} from "../infrastructure/customer-command-center-repository.js";
import type { PublicLiveTrustFrameView } from "../../live-trust-frame/domain/live-trust-frame.js";

export class CustomerCommandCenterService {
  private readonly repository: CustomerCommandCenterRepository;

  constructor(
    private readonly db: DbPool,
    private readonly deps: {
      liveTrustFrame: LiveTrustFrameService;
    },
    repository?: CustomerCommandCenterRepository
  ) {
    this.repository = repository ?? customerCommandCenterRepository;
  }

  async getCustomerCommandCenter(authContext: AuthContext): Promise<CustomerCommandCenterView> {
    const center = await this.buildCommandCenter(authContext.userId);
    return toCustomerCommandCenterView(center);
  }

  async getRequestsSummary(authContext: AuthContext): Promise<RequestsSummaryView> {
    const center = await this.buildCommandCenter(authContext.userId);
    return toRequestsSummaryView(center.requests);
  }

  async getContractsSummary(authContext: AuthContext): Promise<ContractsSummaryView> {
    const center = await this.buildCommandCenter(authContext.userId);
    return toContractsSummaryView(center.contracts);
  }

  async getEscrowSummary(authContext: AuthContext): Promise<EscrowSummaryView> {
    const center = await this.buildCommandCenter(authContext.userId);
    return toEscrowSummaryView(center.escrow);
  }

  async getProviderRelationships(
    authContext: AuthContext
  ): Promise<ProviderRelationshipsSummaryView> {
    const center = await this.buildCommandCenter(authContext.userId);
    return toProviderRelationshipsSummaryView(center.providers);
  }

  async getProviderRecommendations(
    authContext: AuthContext
  ): Promise<ProviderRecommendationsIntegrationView> {
    const center = await this.buildCommandCenter(authContext.userId);
    return toProviderRecommendationsIntegrationView(center.recommendations);
  }

  private async buildCommandCenter(userId: string) {
    const raw = await this.repository.loadRawSnapshot(this.db.pool, userId);
    if (!raw) {
      throw notFound("Customer command center is available for customer accounts only");
    }

    const recommendations = rankProvidersForRequirement({
      requirement: raw.recommendationRequirement,
      providers: raw.providers,
      limit: 5,
    });
    const providerTrustFrames = await this.loadProviderTrustFrames(
      collectProviderUserIdsForTrustFrames({
        offers: raw.offers,
        recommendations,
      })
    );
    const snapshot = buildCustomerCommandCenterSnapshot({
      raw,
      providerTrustFrames,
    });

    return buildCustomerCommandCenter({ snapshot });
  }

  private async loadProviderTrustFrames(
    providerUserIds: string[]
  ): Promise<Record<string, PublicLiveTrustFrameView>> {
    const frames: Record<string, PublicLiveTrustFrameView> = {};

    await Promise.all(
      providerUserIds.map(async (providerUserId) => {
        try {
          frames[providerUserId] = await this.deps.liveTrustFrame.getPublicLiveTrustFrame(
            providerUserId
          );
        } catch {
          // Skip providers without a public live trust frame projection.
        }
      })
    );

    return frames;
  }
}

export function createCustomerCommandCenterService(
  db: DbPool,
  deps: {
    liveTrustFrame: LiveTrustFrameService;
  },
  repository?: CustomerCommandCenterRepository
): CustomerCommandCenterService {
  return new CustomerCommandCenterService(db, deps, repository);
}

export function createCustomerCommandCenterModule(
  db: DbPool,
  deps: {
    liveTrustFrame: LiveTrustFrameService;
    repository?: CustomerCommandCenterRepository;
  }
) {
  const customerCommandCenter = createCustomerCommandCenterService(
    db,
    {
      liveTrustFrame: deps.liveTrustFrame,
    },
    deps.repository
  );

  return {
    customerCommandCenter,
  };
}

export type CustomerCommandCenterModule = ReturnType<typeof createCustomerCommandCenterModule>;
