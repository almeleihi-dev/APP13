import { listScenarioSeeds } from "../domain/scenario-seeds.js";
import { collectUnifiedActionIntelligencePaths } from "../domain/action-intelligence-screens.js";
import type { ScenarioSeed } from "../domain/scenario-seeds.js";
import type { ScenarioId } from "../domain/action-intelligence-schema.js";

export class UnifiedActionIntelligenceRepository {
  private readonly seeds: ScenarioSeed[];

  constructor() {
    this.seeds = listScenarioSeeds();
  }

  listScenarios(): ScenarioSeed[] {
    return this.seeds.map((seed) => ({
      ...seed,
      steps: [...seed.steps],
      resources: [...seed.resources],
      skills: [...seed.skills],
      riskSignals: [...seed.riskSignals],
    }));
  }

  getScenarioCount(): number {
    return this.seeds.length;
  }

  getScenarioById(scenarioId: ScenarioId): ScenarioSeed | undefined {
    return this.seeds.find((seed) => seed.scenarioId === scenarioId);
  }

  getArtifactPaths(rootDir: string): string[] {
    return collectUnifiedActionIntelligencePaths().map((relativePath) =>
      relativePath.startsWith("/") ? relativePath : `${rootDir}/${relativePath}`
    );
  }
}

export function createUnifiedActionIntelligenceRepository(): UnifiedActionIntelligenceRepository {
  return new UnifiedActionIntelligenceRepository();
}
