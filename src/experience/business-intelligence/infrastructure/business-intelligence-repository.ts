import type { Queryable } from "../../../shared/db/index.js";
import { buildInvestorReadinessSnapshot } from "../../investor-readiness/domain/investor-readiness.js";
import { createInvestorReadinessRepository } from "../../investor-readiness/infrastructure/investor-readiness-repository.js";
import { buildLaunchSimulationSnapshot } from "../../launch-simulation/domain/launch-simulation.js";
import { createLaunchSimulationRepository } from "../../launch-simulation/infrastructure/launch-simulation-repository.js";
import { buildMarketplaceIntelligenceSnapshot } from "../../marketplace-intelligence/domain/marketplace-intelligence.js";
import { marketplaceIntelligenceRepository } from "../../marketplace-intelligence/infrastructure/marketplace-intelligence-repository.js";
import { buildMissionControlSnapshot } from "../../mission-control/domain/mission-control.js";
import { createMissionControlRepository } from "../../mission-control/infrastructure/mission-control-repository.js";
import { buildPlatformOperationsSnapshot } from "../../platform-operations/domain/platform-operations.js";
import { createPlatformOperationsRepository } from "../../platform-operations/infrastructure/platform-operations-repository.js";
import { buildPostLaunchMonitoringSnapshot } from "../../post-launch-monitoring/domain/post-launch-monitoring.js";
import { createPostLaunchMonitoringRepository } from "../../post-launch-monitoring/infrastructure/post-launch-monitoring-repository.js";
import type { BusinessIntelligenceRawSnapshot } from "../domain/business-intelligence.js";

export class BusinessIntelligenceRepository {
  constructor(
    private readonly marketplaceRepository = marketplaceIntelligenceRepository,
    private readonly launchSimulationRepository = createLaunchSimulationRepository(),
    private readonly investorRepository = createInvestorReadinessRepository(),
    private readonly missionControlRepository = createMissionControlRepository(),
    private readonly operationsRepository = createPlatformOperationsRepository(),
    private readonly postLaunchMonitoringRepository = createPostLaunchMonitoringRepository()
  ) {}

  async loadRawSnapshot(client: Queryable): Promise<BusinessIntelligenceRawSnapshot> {
    const [
      marketplaceRaw,
      launchSimulationRaw,
      investorRaw,
      missionControlRaw,
      operationsRaw,
      postLaunchRaw,
    ] = await Promise.all([
      this.marketplaceRepository.loadRawSnapshot(client),
      this.launchSimulationRepository.loadRawSnapshot(client),
      this.investorRepository.loadRawSnapshot(client),
      this.missionControlRepository.loadRawSnapshot(client),
      this.operationsRepository.loadRawSnapshot(client),
      this.postLaunchMonitoringRepository.loadRawSnapshot(client),
    ]);

    return {
      marketplace: buildMarketplaceIntelligenceSnapshot({ raw: marketplaceRaw }),
      launchSimulation: buildLaunchSimulationSnapshot({ raw: launchSimulationRaw }),
      investor: buildInvestorReadinessSnapshot({ raw: investorRaw }),
      missionControl: buildMissionControlSnapshot({ raw: missionControlRaw }),
      operations: buildPlatformOperationsSnapshot({ raw: operationsRaw }),
      postLaunch: buildPostLaunchMonitoringSnapshot({ raw: postLaunchRaw }),
    };
  }
}

export function createBusinessIntelligenceRepository(input?: {
  marketplaceRepository?: BusinessIntelligenceRepository["marketplaceRepository"];
  launchSimulationRepository?: BusinessIntelligenceRepository["launchSimulationRepository"];
  investorRepository?: BusinessIntelligenceRepository["investorRepository"];
  missionControlRepository?: BusinessIntelligenceRepository["missionControlRepository"];
  operationsRepository?: BusinessIntelligenceRepository["operationsRepository"];
  postLaunchMonitoringRepository?: BusinessIntelligenceRepository["postLaunchMonitoringRepository"];
}): BusinessIntelligenceRepository {
  return new BusinessIntelligenceRepository(
    input?.marketplaceRepository,
    input?.launchSimulationRepository,
    input?.investorRepository,
    input?.missionControlRepository,
    input?.operationsRepository,
    input?.postLaunchMonitoringRepository
  );
}

export const businessIntelligenceRepository = createBusinessIntelligenceRepository();
