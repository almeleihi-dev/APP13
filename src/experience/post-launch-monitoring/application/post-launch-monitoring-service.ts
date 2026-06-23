import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { requireRole } from "../../../security/guards.js";
import {
  buildPostLaunchMonitoringCenter,
  buildPostLaunchMonitoringSnapshot,
  toEarlyWarningSystemView,
  toExecutiveRecommendationsView,
  toFirst24HoursMonitoringView,
  toFirstMonthMonitoringView,
  toFirstWeekMonitoringView,
  toMonitoringScoreView,
  toOperationsMonitoringView,
  toPostLaunchMonitoringCenterView,
  toPostLaunchOverviewView,
  toSecurityMonitoringView,
  toSuccessIndicatorsView,
  toUserGrowthMonitoringView,
  type EarlyWarningSystemView,
  type ExecutiveRecommendationsView,
  type First24HoursMonitoringView,
  type FirstMonthMonitoringView,
  type FirstWeekMonitoringView,
  type MonitoringScoreView,
  type OperationsMonitoringView,
  type PostLaunchMonitoringCenterView,
  type PostLaunchOverviewView,
  type SecurityMonitoringView,
  type SuccessIndicatorsView,
  type UserGrowthMonitoringView,
} from "../domain/post-launch-monitoring.js";
import {
  createPostLaunchMonitoringRepository,
  type PostLaunchMonitoringRepository,
} from "../infrastructure/post-launch-monitoring-repository.js";
import { createLaunchSimulationRepository } from "../../launch-simulation/infrastructure/launch-simulation-repository.js";
import { createMissionControlRepository } from "../../mission-control/infrastructure/mission-control-repository.js";
import { createProductionReadinessRepository } from "../../production-readiness/infrastructure/production-readiness-repository.js";
import { createSecurityReadinessRepository } from "../../security-readiness/infrastructure/security-readiness-repository.js";
import { createPlatformOperationsRepository } from "../../platform-operations/infrastructure/platform-operations-repository.js";

export class PostLaunchMonitoringService {
  private readonly repository: PostLaunchMonitoringRepository;

  constructor(
    private readonly db: DbPool,
    repository?: PostLaunchMonitoringRepository
  ) {
    this.repository = repository ?? createPostLaunchMonitoringRepository();
  }

  async getPostLaunchMonitoringCenter(
    authContext: AuthContext
  ): Promise<PostLaunchMonitoringCenterView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toPostLaunchMonitoringCenterView(center);
  }

  async getPostLaunchOverview(authContext: AuthContext): Promise<PostLaunchOverviewView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toPostLaunchOverviewView(center.overview);
  }

  async getFirst24HoursMonitoring(
    authContext: AuthContext
  ): Promise<First24HoursMonitoringView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toFirst24HoursMonitoringView(center.first24Hours);
  }

  async getFirstWeekMonitoring(authContext: AuthContext): Promise<FirstWeekMonitoringView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toFirstWeekMonitoringView(center.firstWeek);
  }

  async getFirstMonthMonitoring(authContext: AuthContext): Promise<FirstMonthMonitoringView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toFirstMonthMonitoringView(center.firstMonth);
  }

  async getUserGrowthMonitoring(authContext: AuthContext): Promise<UserGrowthMonitoringView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toUserGrowthMonitoringView(center.userGrowth);
  }

  async getOperationsMonitoring(authContext: AuthContext): Promise<OperationsMonitoringView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toOperationsMonitoringView(center.operationsMonitoring);
  }

  async getSecurityMonitoring(authContext: AuthContext): Promise<SecurityMonitoringView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toSecurityMonitoringView(center.securityMonitoring);
  }

  async getEarlyWarningSystem(authContext: AuthContext): Promise<EarlyWarningSystemView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toEarlyWarningSystemView(center.earlyWarnings);
  }

  async getSuccessIndicators(authContext: AuthContext): Promise<SuccessIndicatorsView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toSuccessIndicatorsView(center.successIndicators);
  }

  async getExecutiveRecommendations(
    authContext: AuthContext
  ): Promise<ExecutiveRecommendationsView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toExecutiveRecommendationsView(center.recommendations);
  }

  async getMonitoringScore(authContext: AuthContext): Promise<MonitoringScoreView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toMonitoringScoreView(center.monitoringScore);
  }

  private async buildCenter() {
    const raw = await this.repository.loadRawSnapshot(this.db.pool);
    const snapshot = buildPostLaunchMonitoringSnapshot({ raw });
    return buildPostLaunchMonitoringCenter({ snapshot });
  }

  private assertAdminAccess(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createPostLaunchMonitoringService(
  db: DbPool,
  repository?: PostLaunchMonitoringRepository
): PostLaunchMonitoringService {
  return new PostLaunchMonitoringService(db, repository);
}

export function createPostLaunchMonitoringModule(
  db: DbPool,
  deps?: {
    rootDir?: string;
    repository?: PostLaunchMonitoringRepository;
  }
) {
  const repository =
    deps?.repository ??
    createPostLaunchMonitoringRepository({
      launchSimulationRepository: createLaunchSimulationRepository({ rootDir: deps?.rootDir }),
      missionControlRepository: createMissionControlRepository({ rootDir: deps?.rootDir }),
      productionRepository: createProductionReadinessRepository({ rootDir: deps?.rootDir }),
      securityRepository: createSecurityReadinessRepository({ rootDir: deps?.rootDir }),
      operationsRepository: createPlatformOperationsRepository(),
    });
  const postLaunchMonitoring = createPostLaunchMonitoringService(db, repository);

  return {
    postLaunchMonitoring,
  };
}

export type PostLaunchMonitoringModule = ReturnType<typeof createPostLaunchMonitoringModule>;
