import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { requireRole } from "../../../security/guards.js";
import {
  buildLaunchControlCenter,
  buildLaunchControlSnapshot,
  toLaunchBlockersView,
  toLaunchChecklistView,
  toLaunchControlCenterView,
  toLaunchDecisionView,
  toLaunchOverviewView,
  toLaunchRecommendationsView,
  toLaunchWarningsView,
  toOperationsReadinessReviewView,
  toProductionReadinessReviewView,
  toReleaseReadinessReviewView,
  toSecurityReadinessReviewView,
  type LaunchBlockersView,
  type LaunchChecklistView,
  type LaunchControlCenterView,
  type LaunchDecisionView,
  type LaunchOverviewView,
  type LaunchRecommendationsView,
  type LaunchWarningsView,
  type OperationsReadinessReviewView,
  type ProductionReadinessReviewView,
  type ReleaseReadinessReviewView,
  type SecurityReadinessReviewView,
} from "../domain/launch-control.js";
import {
  createLaunchControlRepository,
  type LaunchControlRepository,
} from "../infrastructure/launch-control-repository.js";
import { createProductionReadinessRepository } from "../../production-readiness/infrastructure/production-readiness-repository.js";
import { createSecurityReadinessRepository } from "../../security-readiness/infrastructure/security-readiness-repository.js";
import { createPlatformOperationsRepository } from "../../platform-operations/infrastructure/platform-operations-repository.js";

export class LaunchControlService {
  private readonly repository: LaunchControlRepository;

  constructor(
    private readonly db: DbPool,
    repository?: LaunchControlRepository
  ) {
    this.repository = repository ?? createLaunchControlRepository();
  }

  async getLaunchControlCenter(authContext: AuthContext): Promise<LaunchControlCenterView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toLaunchControlCenterView(center);
  }

  async getLaunchOverview(authContext: AuthContext): Promise<LaunchOverviewView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toLaunchOverviewView(center.overview);
  }

  async getReleaseReadinessReview(authContext: AuthContext): Promise<ReleaseReadinessReviewView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toReleaseReadinessReviewView(center.releaseReview);
  }

  async getProductionReadinessReview(
    authContext: AuthContext
  ): Promise<ProductionReadinessReviewView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toProductionReadinessReviewView(center.productionReview);
  }

  async getSecurityReadinessReview(authContext: AuthContext): Promise<SecurityReadinessReviewView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toSecurityReadinessReviewView(center.securityReview);
  }

  async getOperationsReadinessReview(
    authContext: AuthContext
  ): Promise<OperationsReadinessReviewView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toOperationsReadinessReviewView(center.operationsReview);
  }

  async getLaunchBlockers(authContext: AuthContext): Promise<LaunchBlockersView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toLaunchBlockersView(center.blockers);
  }

  async getLaunchWarnings(authContext: AuthContext): Promise<LaunchWarningsView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toLaunchWarningsView(center.warnings);
  }

  async getLaunchChecklist(authContext: AuthContext): Promise<LaunchChecklistView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toLaunchChecklistView(center.checklist);
  }

  async getLaunchRecommendations(authContext: AuthContext): Promise<LaunchRecommendationsView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toLaunchRecommendationsView(center.recommendations);
  }

  async getLaunchDecision(authContext: AuthContext): Promise<LaunchDecisionView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toLaunchDecisionView(center.decision);
  }

  private async buildCenter() {
    const raw = await this.repository.loadRawSnapshot(this.db.pool);
    const snapshot = buildLaunchControlSnapshot({ raw });
    return buildLaunchControlCenter({ snapshot });
  }

  private assertAdminAccess(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createLaunchControlService(
  db: DbPool,
  repository?: LaunchControlRepository
): LaunchControlService {
  return new LaunchControlService(db, repository);
}

export function createLaunchControlModule(
  db: DbPool,
  deps?: {
    rootDir?: string;
    repository?: LaunchControlRepository;
  }
) {
  const repository =
    deps?.repository ??
    createLaunchControlRepository({
      productionRepository: createProductionReadinessRepository({ rootDir: deps?.rootDir }),
      securityRepository: createSecurityReadinessRepository({ rootDir: deps?.rootDir }),
      operationsRepository: createPlatformOperationsRepository(),
    });
  const launchControl = createLaunchControlService(db, repository);

  return {
    launchControl,
  };
}

export type LaunchControlModule = ReturnType<typeof createLaunchControlModule>;
