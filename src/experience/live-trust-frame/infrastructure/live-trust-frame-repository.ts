import type { Queryable } from "../../../shared/db/index.js";
import { liveFrameExperienceRepository } from "../../live-frame/infrastructure/live-frame-experience-repository.js";
import { professionalSealsRepository } from "../../professional-seals/infrastructure/professional-seals-repository.js";
import type { LiveTrustFrameSnapshot } from "../domain/live-trust-frame.js";
import { buildLiveTrustFrameSnapshot } from "../domain/live-trust-frame.js";
import type { ProviderPublicProfileView } from "../../../provider-experience/domain/provider-profile.js";
import type { TrustProfileView } from "../../../trust/domain/trust-profile-view.js";

export class LiveTrustFrameRepository {
  async loadSnapshot(
    client: Queryable,
    input: {
      publicProfile: ProviderPublicProfileView;
      trustProfile: TrustProfileView;
    }
  ): Promise<LiveTrustFrameSnapshot> {
    const [sealsSnapshot, platformContext] = await Promise.all([
      professionalSealsRepository.loadSnapshot(client, input),
      liveFrameExperienceRepository.getPlatformTrustContext(client),
    ]);

    return buildLiveTrustFrameSnapshot({
      sealsSnapshot,
      platformContext,
    });
  }
}

export const liveTrustFrameRepository = new LiveTrustFrameRepository();
