import type { Queryable } from "../../../shared/db/index.js";
import {
  ProviderDashboardRepository,
  providerDashboardRepository,
} from "../../../provider-workspace/infrastructure/provider-dashboard-repository.js";
import {
  DiscoveryMatchingRepository,
  discoveryMatchingRepository,
} from "../../discovery-matching/infrastructure/discovery-matching-repository.js";
import { professionalSealsRepository } from "../../professional-seals/infrastructure/professional-seals-repository.js";
import { liveFrameExperienceRepository } from "../../live-frame/infrastructure/live-frame-experience-repository.js";
import type { ProviderPublicProfileView } from "../../../provider-experience/domain/provider-profile.js";
import type { TrustProfileView } from "../../../trust/domain/trust-profile-view.js";
import {
  buildProviderCommandCenterSnapshot,
  type ProviderCommandCenterSnapshot,
} from "../domain/provider-command-center.js";

export class ProviderCommandCenterRepository {
  constructor(
    private readonly dashboardRepository: ProviderDashboardRepository = providerDashboardRepository,
    private readonly discoveryRepository: DiscoveryMatchingRepository = discoveryMatchingRepository
  ) {}

  async loadSnapshot(
    client: Queryable,
    input: {
      providerUserId: string;
      publicProfile: ProviderPublicProfileView;
      trustProfile: TrustProfileView;
    }
  ): Promise<ProviderCommandCenterSnapshot | null> {
    const provider = await this.dashboardRepository.findProviderByUserId(
      client,
      input.providerUserId
    );
    if (!provider) return null;

    const [
      earningsRecord,
      contracts,
      offers,
      discoverySnapshot,
      sealsSnapshot,
      platformContext,
    ] = await Promise.all([
      this.dashboardRepository.aggregateProviderEarnings(client, provider.id),
      this.dashboardRepository.listContractsByProviderUserId(client, input.providerUserId),
      this.dashboardRepository.listOffersByProviderUserId(client, input.providerUserId),
      this.discoveryRepository.loadProviderSnapshot(client, input.providerUserId),
      professionalSealsRepository.loadSnapshot(client, {
        publicProfile: input.publicProfile,
        trustProfile: input.trustProfile,
      }),
      liveFrameExperienceRepository.getPlatformTrustContext(client),
    ]);

    if (!discoverySnapshot) return null;

    return buildProviderCommandCenterSnapshot({
      providerUserId: input.providerUserId,
      providerId: provider.id,
      displayName: input.publicProfile.display_name,
      earningsRecord,
      contracts,
      incomingOfferCount: offers.length,
      sealsSnapshot,
      platformContext,
      providerRecord: discoverySnapshot.provider,
      openRequests: discoverySnapshot.requests,
    });
  }
}

export const providerCommandCenterRepository = new ProviderCommandCenterRepository();
