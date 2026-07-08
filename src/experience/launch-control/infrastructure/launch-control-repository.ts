import type { Queryable } from "../../../shared/db/index.js";
import { buildPlatformOperationsSnapshot } from "../../platform-operations/domain/platform-operations.js";
import { createPlatformOperationsRepository } from "../../platform-operations/infrastructure/platform-operations-repository.js";
import { buildProductionReadinessSnapshot } from "../../production-readiness/domain/production-readiness.js";
import { createProductionReadinessRepository } from "../../production-readiness/infrastructure/production-readiness-repository.js";
import { buildReleaseReadinessCenterSnapshot } from "../../release-readiness/domain/release-readiness.js";
import {
  releaseReadinessCenterRepository,
} from "../../release-readiness/infrastructure/release-readiness-repository.js";
import { buildSecurityReadinessSnapshot } from "../../security-readiness/domain/security-readiness.js";
import { createSecurityReadinessRepository } from "../../security-readiness/infrastructure/security-readiness-repository.js";
import type { LaunchControlRawSnapshot } from "../domain/launch-control.js";

export class LaunchControlRepository {
  constructor(
    private readonly releaseRepository = releaseReadinessCenterRepository,
    private readonly productionRepository = createProductionReadinessRepository(),
    private readonly securityRepository = createSecurityReadinessRepository(),
    private readonly operationsRepository = createPlatformOperationsRepository()
  ) {}

  async loadRawSnapshot(client: Queryable): Promise<LaunchControlRawSnapshot> {
    const [releaseSources, productionRaw, securityRaw, operationsRaw] = await Promise.all([
      this.releaseRepository.loadSources(),
      this.productionRepository.loadRawSnapshot(client),
      this.securityRepository.loadRawSnapshot(client),
      this.operationsRepository.loadRawSnapshot(client),
    ]);

    return {
      release: buildReleaseReadinessCenterSnapshot({ sources: releaseSources }),
      production: buildProductionReadinessSnapshot({ raw: productionRaw }),
      security: buildSecurityReadinessSnapshot({ raw: securityRaw }),
      operations: buildPlatformOperationsSnapshot({ raw: operationsRaw }),
    };
  }
}

export function createLaunchControlRepository(input?: {
  releaseRepository?: LaunchControlRepository["releaseRepository"];
  productionRepository?: LaunchControlRepository["productionRepository"];
  securityRepository?: LaunchControlRepository["securityRepository"];
  operationsRepository?: LaunchControlRepository["operationsRepository"];
}): LaunchControlRepository {
  return new LaunchControlRepository(
    input?.releaseRepository,
    input?.productionRepository,
    input?.securityRepository,
    input?.operationsRepository
  );
}

export const launchControlRepository = createLaunchControlRepository();
