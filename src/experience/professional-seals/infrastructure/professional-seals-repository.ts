import type { Queryable } from "../../../shared/db/index.js";
import { verificationRepository } from "../../../identity/infrastructure/verification-repository.js";
import type { ProfessionalSealsSnapshot } from "../domain/professional-seals.js";
import type { ProviderPublicProfileView } from "../../../provider-experience/domain/provider-profile.js";
import type { TrustProfileView } from "../../../trust/domain/trust-profile-view.js";

export class ProfessionalSealsRepository {
  async loadSnapshot(
    client: Queryable,
    input: {
      publicProfile: ProviderPublicProfileView;
      trustProfile: TrustProfileView;
    }
  ): Promise<ProfessionalSealsSnapshot> {
    const [verification, credentials] = await Promise.all([
      verificationRepository.findLatestByUserId(client, input.publicProfile.user_id),
      verificationRepository.listCredentialsByProviderId(
        client,
        input.publicProfile.provider_id
      ),
    ]);

    return {
      publicProfile: input.publicProfile,
      trustProfile: input.trustProfile,
      verificationTier: input.publicProfile.verification_tier,
      verificationStatus: verification?.status ?? "pending",
      credentials,
    };
  }
}

export const professionalSealsRepository = new ProfessionalSealsRepository();
