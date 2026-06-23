import type { Queryable } from "../../../shared/db/index.js";
import {
  buildLaunchControlSnapshot,
  type LaunchControlRawSnapshot,
} from "../../launch-control/domain/launch-control.js";
import { buildLaunchSimulationSnapshot } from "../../launch-simulation/domain/launch-simulation.js";
import { createLaunchSimulationRepository } from "../../launch-simulation/infrastructure/launch-simulation-repository.js";
import { buildMissionControlSnapshot } from "../../mission-control/domain/mission-control.js";
import { createMissionControlRepository } from "../../mission-control/infrastructure/mission-control-repository.js";
import { buildPlatformOperationsSnapshot } from "../../platform-operations/domain/platform-operations.js";
import { createPlatformOperationsRepository } from "../../platform-operations/infrastructure/platform-operations-repository.js";
import { buildProductionReadinessSnapshot } from "../../production-readiness/domain/production-readiness.js";
import { createProductionReadinessRepository } from "../../production-readiness/infrastructure/production-readiness-repository.js";
import { buildReleaseReadinessCenterSnapshot } from "../../release-readiness/domain/release-readiness.js";
import { releaseReadinessCenterRepository } from "../../release-readiness/infrastructure/release-readiness-repository.js";
import { buildSecurityReadinessSnapshot } from "../../security-readiness/domain/security-readiness.js";
import { createSecurityReadinessRepository } from "../../security-readiness/infrastructure/security-readiness-repository.js";
import type { PostLaunchMonitoringRawSnapshot } from "../domain/post-launch-monitoring.js";

export class PostLaunchMonitoringRepository {
  constructor(
    private readonly launchSimulationRepository = createLaunchSimulationRepository(),
    private readonly missionControlRepository = createMissionControlRepository(),
    private readonly releaseRepository = releaseReadinessCenterRepository,
    private readonly productionRepository = createProductionReadinessRepository(),
    private readonly securityRepository = createSecurityReadinessRepository(),
    private readonly operationsRepository = createPlatformOperationsRepository()
  ) {}

  async loadRawSnapshot(client: Queryable): Promise<PostLaunchMonitoringRawSnapshot> {
    const [
      launchSimulationRaw,
      missionControlRaw,
      releaseSources,
      productionRaw,
      securityRaw,
      operationsRaw,
    ] = await Promise.all([
      this.launchSimulationRepository.loadRawSnapshot(client),
      this.missionControlRepository.loadRawSnapshot(client),
      this.releaseRepository.loadSources(),
      this.productionRepository.loadRawSnapshot(client),
      this.securityRepository.loadRawSnapshot(client),
      this.operationsRepository.loadRawSnapshot(client),
    ]);

    const launchSimulation = buildLaunchSimulationSnapshot({ raw: launchSimulationRaw });
    const missionControl = buildMissionControlSnapshot({ raw: missionControlRaw });
    const production = buildProductionReadinessSnapshot({ raw: productionRaw });
    const security = buildSecurityReadinessSnapshot({ raw: securityRaw });
    const operations = buildPlatformOperationsSnapshot({ raw: operationsRaw });

    const launchControlRaw: LaunchControlRawSnapshot = {
      release: buildReleaseReadinessCenterSnapshot({ sources: releaseSources }),
      production,
      security,
      operations,
    };
    const launchControl = buildLaunchControlSnapshot({ raw: launchControlRaw });

    return {
      launchSimulation,
      missionControl,
      production,
      security,
      operations,
      launchControl,
    };
  }
}

export function createPostLaunchMonitoringRepository(input?: {
  launchSimulationRepository?: PostLaunchMonitoringRepository["launchSimulationRepository"];
  missionControlRepository?: PostLaunchMonitoringRepository["missionControlRepository"];
  releaseRepository?: PostLaunchMonitoringRepository["releaseRepository"];
  productionRepository?: PostLaunchMonitoringRepository["productionRepository"];
  securityRepository?: PostLaunchMonitoringRepository["securityRepository"];
  operationsRepository?: PostLaunchMonitoringRepository["operationsRepository"];
}): PostLaunchMonitoringRepository {
  return new PostLaunchMonitoringRepository(
    input?.launchSimulationRepository,
    input?.missionControlRepository,
    input?.releaseRepository,
    input?.productionRepository,
    input?.securityRepository,
    input?.operationsRepository
  );
}

export const postLaunchMonitoringRepository = createPostLaunchMonitoringRepository();
