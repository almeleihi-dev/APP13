import type { Queryable } from "../../../shared/db/index.js";
import { createStrategicOperatingRepository } from "../../strategic-operating-system/infrastructure/strategic-operating-repository.js";
import type { MissionControlRawSnapshot } from "../domain/mission-control.js";

export class MissionControlRepository {
  constructor(
    private readonly strategicRepository = createStrategicOperatingRepository()
  ) {}

  async loadRawSnapshot(client: Queryable): Promise<MissionControlRawSnapshot> {
    const strategicRaw = await this.strategicRepository.loadRawSnapshot(client);

    return {
      strategicRaw,
    };
  }
}

export function createMissionControlRepository(deps?: {
  rootDir?: string;
  strategicRepository?: ReturnType<typeof createStrategicOperatingRepository>;
}): MissionControlRepository {
  const strategicRepository =
    deps?.strategicRepository ?? createStrategicOperatingRepository({ rootDir: deps?.rootDir });

  return new MissionControlRepository(strategicRepository);
}

export const missionControlRepository = createMissionControlRepository();
