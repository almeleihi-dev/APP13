import type { Queryable } from "../../../shared/db/index.js";
import { createLaunchSimulationRepository } from "../../launch-simulation/infrastructure/launch-simulation-repository.js";
import type { InvestorReadinessRawSnapshot } from "../domain/investor-readiness.js";

export class InvestorReadinessRepository {
  constructor(
    private readonly launchRepository = createLaunchSimulationRepository()
  ) {}

  async loadRawSnapshot(client: Queryable): Promise<InvestorReadinessRawSnapshot> {
    const launchRaw = await this.launchRepository.loadRawSnapshot(client);

    return {
      launchRaw,
    };
  }
}

export function createInvestorReadinessRepository(deps?: {
  rootDir?: string;
  launchRepository?: ReturnType<typeof createLaunchSimulationRepository>;
}): InvestorReadinessRepository {
  const launchRepository =
    deps?.launchRepository ?? createLaunchSimulationRepository({ rootDir: deps?.rootDir });

  return new InvestorReadinessRepository(launchRepository);
}

export const investorReadinessRepository = createInvestorReadinessRepository();
