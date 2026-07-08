import type { AuthContext } from "../../../shared/auth/index.js";
import { requireRole } from "../../../security/guards.js";
import {
  buildReleaseReadinessCenter,
  buildReleaseReadinessCenterSnapshot,
  toLaunchBlockerView,
  toLaunchReadinessScoreView,
  toLaunchStrengthView,
  toLaunchWarningView,
  toReadinessAreaView,
  toRecommendedActionView,
  toReleaseReadinessCenterView,
  type LaunchBlockerView,
  type LaunchReadinessScoreView,
  type LaunchStrengthView,
  type LaunchWarningView,
  type ReadinessAreaView,
  type RecommendedActionView,
  type ReleaseReadinessCenterView,
} from "../domain/release-readiness.js";
import {
  ReleaseReadinessCenterRepository,
  releaseReadinessCenterRepository,
} from "../infrastructure/release-readiness-repository.js";

export class ReleaseReadinessCenterService {
  private readonly repository: ReleaseReadinessCenterRepository;

  constructor(repository?: ReleaseReadinessCenterRepository) {
    this.repository = repository ?? releaseReadinessCenterRepository;
  }

  async getReleaseReadinessCenter(authContext: AuthContext): Promise<ReleaseReadinessCenterView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toReleaseReadinessCenterView(center);
  }

  async getLaunchReadinessScore(authContext: AuthContext): Promise<LaunchReadinessScoreView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toLaunchReadinessScoreView(center.score);
  }

  async getReadinessAreas(authContext: AuthContext): Promise<ReadinessAreaView[]> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return center.areas.map(toReadinessAreaView);
  }

  async getLaunchBlockers(authContext: AuthContext): Promise<LaunchBlockerView[]> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return center.blockers.map(toLaunchBlockerView);
  }

  async getLaunchWarnings(authContext: AuthContext): Promise<LaunchWarningView[]> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return center.warnings.map(toLaunchWarningView);
  }

  async getRecommendedActions(authContext: AuthContext): Promise<RecommendedActionView[]> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return center.actions.map(toRecommendedActionView);
  }

  async getLaunchStrengths(authContext: AuthContext): Promise<LaunchStrengthView[]> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return center.strengths.map(toLaunchStrengthView);
  }

  private async buildCenter() {
    const sources = await this.repository.loadSources();
    const snapshot = buildReleaseReadinessCenterSnapshot({ sources });
    return buildReleaseReadinessCenter({ snapshot });
  }

  private assertAdminAccess(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createReleaseReadinessCenterService(
  repository?: ReleaseReadinessCenterRepository
): ReleaseReadinessCenterService {
  return new ReleaseReadinessCenterService(repository);
}

export function createReleaseReadinessCenterModule(deps?: {
  rootDir?: string;
  repository?: ReleaseReadinessCenterRepository;
}) {
  const repository =
    deps?.repository ??
    (deps?.rootDir ? new ReleaseReadinessCenterRepository(deps.rootDir) : releaseReadinessCenterRepository);
  const releaseReadinessCenter = createReleaseReadinessCenterService(repository);

  return {
    releaseReadinessCenter,
  };
}

export type ReleaseReadinessCenterModule = ReturnType<typeof createReleaseReadinessCenterModule>;
