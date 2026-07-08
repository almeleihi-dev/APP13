import type { Queryable } from "../../../shared/db/index.js";
import { createExecutiveCommandCenterRepository } from "../../executive-command-center/infrastructure/executive-command-center-repository.js";
import type { LaunchSimulationRawSnapshot } from "../domain/launch-simulation.js";

export class LaunchSimulationRepository {
  constructor(
    private readonly executiveRepository = createExecutiveCommandCenterRepository()
  ) {}

  async loadRawSnapshot(client: Queryable): Promise<LaunchSimulationRawSnapshot> {
    const executiveRaw = await this.executiveRepository.loadRawSnapshot(client);

    return {
      executiveRaw,
    };
  }
}

export function createLaunchSimulationRepository(deps?: {
  rootDir?: string;
  executiveRepository?: ReturnType<typeof createExecutiveCommandCenterRepository>;
}): LaunchSimulationRepository {
  const executiveRepository =
    deps?.executiveRepository ?? createExecutiveCommandCenterRepository({ rootDir: deps?.rootDir });

  return new LaunchSimulationRepository(executiveRepository);
}

export const launchSimulationRepository = createLaunchSimulationRepository();
