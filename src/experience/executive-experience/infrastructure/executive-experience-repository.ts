import type { Queryable } from "../../../shared/db/index.js";
import { createMissionControlRepository } from "../../mission-control/infrastructure/mission-control-repository.js";
import type { ExecutiveExperienceRawSnapshot } from "../domain/executive-experience.js";

export class ExecutiveExperienceRepository {
  constructor(
    private readonly missionRepository = createMissionControlRepository()
  ) {}

  async loadRawSnapshot(client: Queryable): Promise<ExecutiveExperienceRawSnapshot> {
    const missionRaw = await this.missionRepository.loadRawSnapshot(client);

    return {
      missionRaw,
    };
  }
}

export function createExecutiveExperienceRepository(deps?: {
  rootDir?: string;
  missionRepository?: ReturnType<typeof createMissionControlRepository>;
}): ExecutiveExperienceRepository {
  const missionRepository =
    deps?.missionRepository ?? createMissionControlRepository({ rootDir: deps?.rootDir });

  return new ExecutiveExperienceRepository(missionRepository);
}

export const executiveExperienceRepository = createExecutiveExperienceRepository();
