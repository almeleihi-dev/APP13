import type { Queryable } from "../../../shared/db/index.js";
import { liveFrameExperienceRepository } from "../../live-frame/infrastructure/live-frame-experience-repository.js";
import { verificationRepository } from "../../../identity/infrastructure/verification-repository.js";
import type { ProfessionalPassportSnapshot } from "../domain/professional-passport.js";
import type { ProviderPublicProfileView } from "../../../provider-experience/domain/provider-profile.js";
import type { TrustHistoryView, TrustProfileView } from "../../../trust/domain/trust-profile-view.js";

export class ProfessionalPassportRepository {
  async loadSnapshot(
    client: Queryable,
    input: {
      publicProfile: ProviderPublicProfileView;
      trustProfile: TrustProfileView;
      trustHistory: TrustHistoryView;
    }
  ): Promise<ProfessionalPassportSnapshot> {
    const [platformContext, verification, credentials] = await Promise.all([
      liveFrameExperienceRepository.getPlatformTrustContext(client),
      verificationRepository.findLatestByUserId(client, input.publicProfile.user_id),
      verificationRepository.listCredentialsByProviderId(
        client,
        input.publicProfile.provider_id
      ),
    ]);

    return {
      publicProfile: input.publicProfile,
      trustProfile: input.trustProfile,
      trustHistory: input.trustHistory,
      verificationTier: input.publicProfile.verification_tier,
      verificationStatus: verification?.status ?? "pending",
      verificationReviewedAt: verification?.reviewedAt ?? null,
      credentials,
      platformContext,
    };
  }
}

export const professionalPassportRepository = new ProfessionalPassportRepository();
