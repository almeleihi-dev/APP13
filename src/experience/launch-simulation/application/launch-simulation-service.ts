import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { requireRole } from "../../../security/guards.js";
import {
  buildLaunchSimulation,
  buildLaunchSimulationSnapshot,
  buildSimulationCostProjection,
  findScenarioSimulation,
  toBottleneckAnalysisView,
  toLaunchSimulationView,
  toScenarioSimulationView,
  toSimulationCostProjectionView,
  toSimulationRecommendationView,
  type BottleneckAnalysisView,
  type LaunchSimulationView,
  type ScenarioSimulationView,
  type SimulationCostProjectionView,
  type SimulationLevel,
  type SimulationRecommendationView,
  type SimulationScenario,
} from "../domain/launch-simulation.js";
import {
  createLaunchSimulationRepository,
  type LaunchSimulationRepository,
} from "../infrastructure/launch-simulation-repository.js";

export class LaunchSimulationService {
  private readonly repository: LaunchSimulationRepository;

  constructor(
    private readonly db: DbPool,
    repository?: LaunchSimulationRepository
  ) {
    this.repository = repository ?? createLaunchSimulationRepository();
  }

  async getLaunchSimulation(authContext: AuthContext): Promise<LaunchSimulationView> {
    this.assertAdminAccess(authContext);
    const simulation = await this.buildSimulation();
    return toLaunchSimulationView(simulation);
  }

  async getScenarioSimulations(authContext: AuthContext): Promise<ScenarioSimulationView[]> {
    this.assertAdminAccess(authContext);
    const simulation = await this.buildSimulation();
    return simulation.scenarios.map(toScenarioSimulationView);
  }

  async getLevelSimulation(
    authContext: AuthContext,
    level: SimulationLevel
  ): Promise<ScenarioSimulationView> {
    this.assertAdminAccess(authContext);
    const simulation = await this.buildSimulation();
    const entry = findScenarioSimulation(simulation.scenarios, "expected", level);
    if (!entry) {
      throw new Error(`Missing expected simulation for level ${level}`);
    }
    return toScenarioSimulationView(entry);
  }

  async getBottleneckAnalysis(authContext: AuthContext): Promise<BottleneckAnalysisView[]> {
    this.assertAdminAccess(authContext);
    const simulation = await this.buildSimulation();
    return simulation.bottlenecks.map(toBottleneckAnalysisView);
  }

  async getCostProjection(authContext: AuthContext): Promise<SimulationCostProjectionView> {
    this.assertAdminAccess(authContext);
    const simulation = await this.buildSimulation();
    return toSimulationCostProjectionView(simulation.costs);
  }

  async getSimulationRecommendations(
    authContext: AuthContext
  ): Promise<SimulationRecommendationView[]> {
    this.assertAdminAccess(authContext);
    const simulation = await this.buildSimulation();
    return simulation.recommendations.map(toSimulationRecommendationView);
  }

  async getScenarioLevelSimulation(
    authContext: AuthContext,
    scenario: SimulationScenario,
    level: SimulationLevel
  ): Promise<ScenarioSimulationView> {
    this.assertAdminAccess(authContext);
    const simulation = await this.buildSimulation();
    const entry = findScenarioSimulation(simulation.scenarios, scenario, level);
    if (!entry) {
      throw new Error(`Missing simulation for scenario ${scenario} at level ${level}`);
    }
    return toScenarioSimulationView(entry);
  }

  async getCostProjectionForLevel(
    authContext: AuthContext,
    level: SimulationLevel,
    scenario: SimulationScenario = "expected"
  ): Promise<SimulationCostProjectionView> {
    this.assertAdminAccess(authContext);
    const simulation = await this.buildSimulation();
    const entry = findScenarioSimulation(simulation.scenarios, scenario, level);
    if (!entry) {
      throw new Error(`Missing simulation for scenario ${scenario} at level ${level}`);
    }
    return toSimulationCostProjectionView(
      buildSimulationCostProjection({ baseline: simulation.baseline, scenario: entry })
    );
  }

  private async buildSimulation() {
    const raw = await this.repository.loadRawSnapshot(this.db.pool);
    const snapshot = buildLaunchSimulationSnapshot({ raw });
    return buildLaunchSimulation({ snapshot });
  }

  private assertAdminAccess(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createLaunchSimulationService(
  db: DbPool,
  repository?: LaunchSimulationRepository
): LaunchSimulationService {
  return new LaunchSimulationService(db, repository);
}

export function createLaunchSimulationModule(
  db: DbPool,
  deps?: { rootDir?: string; repository?: LaunchSimulationRepository }
) {
  const repository =
    deps?.repository ??
    createLaunchSimulationRepository({
      rootDir: deps?.rootDir,
    });
  const launchSimulation = createLaunchSimulationService(db, repository);

  return {
    launchSimulation,
  };
}

export type LaunchSimulationModule = ReturnType<typeof createLaunchSimulationModule>;
