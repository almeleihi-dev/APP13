import type { Queryable } from "../../../shared/db/index.js";
import { createGovernmentPartnershipRepository } from "../../government-partnership/infrastructure/government-partnership-repository.js";
import type { StrategicOperatingRawSnapshot } from "../domain/strategic-operating-system.js";

export class StrategicOperatingRepository {
  constructor(
    private readonly governmentRepository = createGovernmentPartnershipRepository()
  ) {}

  async loadRawSnapshot(client: Queryable): Promise<StrategicOperatingRawSnapshot> {
    const governmentRaw = await this.governmentRepository.loadRawSnapshot(client);

    return {
      governmentRaw,
    };
  }
}

export function createStrategicOperatingRepository(deps?: {
  rootDir?: string;
  governmentRepository?: ReturnType<typeof createGovernmentPartnershipRepository>;
}): StrategicOperatingRepository {
  const governmentRepository =
    deps?.governmentRepository ?? createGovernmentPartnershipRepository({ rootDir: deps?.rootDir });

  return new StrategicOperatingRepository(governmentRepository);
}

export const strategicOperatingRepository = createStrategicOperatingRepository();
