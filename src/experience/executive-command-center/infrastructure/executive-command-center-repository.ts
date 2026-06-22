import type { Queryable } from "../../../shared/db/index.js";
import { marketplaceIntelligenceRepository } from "../../marketplace-intelligence/infrastructure/marketplace-intelligence-repository.js";
import { platformControlTowerRepository } from "../../platform-control-tower/infrastructure/platform-control-tower-repository.js";
import {
  ReleaseReadinessCenterRepository,
  releaseReadinessCenterRepository,
} from "../../release-readiness/infrastructure/release-readiness-repository.js";
import type { ExecutiveCommandCenterRawSnapshot } from "../domain/executive-command-center.js";

export class ExecutiveCommandCenterRepository {
  constructor(private readonly readinessRepository: ReleaseReadinessCenterRepository) {}

  async loadRawSnapshot(client: Queryable): Promise<ExecutiveCommandCenterRawSnapshot> {
    const [readinessSources, marketplaceRaw, controlTowerRaw] = await Promise.all([
      this.readinessRepository.loadSources(),
      marketplaceIntelligenceRepository.loadRawSnapshot(client),
      platformControlTowerRepository.loadRawSnapshot(client),
    ]);

    return {
      readinessSources,
      marketplaceRaw,
      controlTowerRaw,
    };
  }
}

export function createExecutiveCommandCenterRepository(deps?: {
  rootDir?: string;
  readinessRepository?: ReleaseReadinessCenterRepository;
}): ExecutiveCommandCenterRepository {
  const readinessRepository =
    deps?.readinessRepository ??
    (deps?.rootDir
      ? new ReleaseReadinessCenterRepository(deps.rootDir)
      : releaseReadinessCenterRepository);

  return new ExecutiveCommandCenterRepository(readinessRepository);
}

export const executiveCommandCenterRepository = createExecutiveCommandCenterRepository();
